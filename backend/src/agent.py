import logging

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    room_io,
    tokenize,
)
from livekit.plugins import deepgram, google, murf, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")

SYSTEM_PROMPT = """You are AapdaMitra (आपदा मित्र), a calm, empathetic, multilingual AI disaster-response assistant for India.
Your mission is to provide immediate, concise, and life-saving safety guidance during floods, earthquakes, fires, cyclones, landslides, heatwaves, lightning, tsunamis, medical crises, and general emergencies.

CRITICAL LANGUAGE GUIDELINES:
1. DYNAMIC LANGUAGE MATCHING:
   - If the user speaks or asks in HINDI (हिन्दी) or Hinglish (e.g., "नमस्ते", "बाढ़ आ गई है", "मदद चाहिए", "kya karu", "madad chahiye"): You MUST respond in clear, reassuring, natural HINDI (हिन्दी).
   - If the user speaks or asks in ENGLISH: Respond in concise, clear ENGLISH.
   - If the user speaks in Bengali (বাংলা), Marathi (मराठी), Tamil (தமிழ்), or another Indian language: Respond in that exact language.
   - If the user switches languages mid-conversation, immediately adapt and reply in that new language.
2. VOICE-FIRST CONCISENESS:
   - Keep responses very concise (2-3 short, clear sentences). Users in emergencies need quick, actionable instructions.
   - First state the immediate critical safety action (e.g., move to higher ground, drop cover hold on, exit building).
   - Strongly recommend calling 112 or local emergency services if there is immediate danger, injury, fire, or trapped individuals.
   - Do NOT ask the user for their personal location or address unless they volunteer it.
   - Never use emojis or complex markdown that disrupts voice synthesis.

SAFETY CONSTRAINTS:
- Never claim to contact authorities, dispatch rescue teams, know live local conditions, or track user coordinates.
- Do not invent official government orders. Encourage users to follow local authority warnings.
- Never give unsafe, dangerous, or harmful advice."""


RESPONSE_LANGUAGES = {
    "auto": "Auto-Detect (Match User Spoken Language)",
    "hi": "Hindi (हिन्दी)",
    "en": "English",
    "bn": "Bengali (বাংলা)",
    "mr": "Marathi (मराठी)",
    "ta": "Tamil (தமிழ்)",
}


def instructions_for(language_code: str | None = None) -> str:
    if language_code == "hi":
        return (
            f"{SYSTEM_PROMPT}\n\n"
            "MANDATORY LANGUAGE OVERRIDE: The user selected HINDI (हिन्दी). You MUST formulate your entire response in clear, reassuring Hindi (हिन्दी)."
        )
    elif language_code == "en":
        return (
            f"{SYSTEM_PROMPT}\n\n"
            "MANDATORY LANGUAGE OVERRIDE: The user selected ENGLISH. You MUST respond in concise, clear English."
        )
    elif language_code and language_code in RESPONSE_LANGUAGES and language_code != "auto":
        language_name = RESPONSE_LANGUAGES[language_code]
        return (
            f"{SYSTEM_PROMPT}\n\n"
            f"MANDATORY LANGUAGE OVERRIDE: The user selected {language_name}. Respond fluently and concisely in {language_name}."
        )
    return (
        f"{SYSTEM_PROMPT}\n\n"
        "DEFAULT MULTILINGUAL MODE: Dynamically detect the language of the user's message. "
        "If the user speaks Hindi or Hinglish, answer in Hindi. If the user speaks English, answer in English. "
        "Always respond in the exact same language the user spoke."
    )


class Assistant(Agent):
    def __init__(self, room: rtc.Room | None = None) -> None:
        self._room = room
        self._active_language = self._selected_language()
        super().__init__(instructions=instructions_for(self._active_language))

    def _selected_language(self) -> str | None:
        if not self._room:
            return None
        for participant in self._room.remote_participants.values():
            language = participant.attributes.get("response_language")
            if language in RESPONSE_LANGUAGES:
                return language
        return None

    async def on_user_turn_completed(self, turn_ctx, new_message) -> None:
        language = self._selected_language()
        if language != self._active_language:
            self._active_language = language
            await self.update_instructions(instructions_for(language))

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using Murf Falcon, Gemini, Deepgram, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(
            model="nova-3", language="multi"
        ),  # set "multi" to detect non-English speech
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=google.LLM(
            model="gemini-3.5-flash-lite",
        ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf.TTS(
            voice="Anisha",  # do not hardcode the locale key
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(room=ctx.room),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            text_input=True,
            text_output=True,
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
