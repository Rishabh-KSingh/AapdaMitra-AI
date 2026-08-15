'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  BarChart3,
  BellRing,
  Building2,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  Copy,
  Download,
  Flame,
  HeartPulse,
  Hospital,
  Languages,
  LifeBuoy,
  LocateFixed,
  MapPin,
  Mic,
  PhoneCall,
  Radio,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Siren,
  Sparkles,
  ThermometerSun,
  TriangleAlert,
  Volume2,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  useAgent,
  useChat,
  useSessionContext,
  useSessionMessages,
} from '@livekit/components-react';
import { AudioVisualizer } from '@/components/agents-ui/blocks/agent-session-view-01/components/audio-visualizer';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
  { value: 'bn', label: 'বাংলা' },
  { value: 'mr', label: 'मराठी' },
  { value: 'ta', label: 'தமிழ்' },
];

const guides = {
  Flood: {
    icon: Waves,
    accent: '#ff9933',
    summary: 'Move to higher ground and keep away from floodwater.',
    actions: [
      'Move to higher ground or a safe shelter.',
      'Keep your phone charged and follow official evacuation instructions.',
      'Switch off electricity only if it is safe.',
    ],
    avoid: 'Do not walk or drive through fast-moving floodwater.',
  },
  Earthquake: {
    icon: Activity,
    accent: '#5b6bc0',
    summary: 'Protect yourself first: drop, cover, and hold on.',
    actions: [
      'Get under sturdy furniture.',
      'Stay away from windows and heavy objects.',
      'Leave carefully after shaking stops.',
    ],
    avoid: 'Do not use elevators during or after shaking.',
  },
  Fire: {
    icon: Flame,
    accent: '#e35642',
    summary: 'Leave through the nearest safe exit and avoid smoke.',
    actions: [
      'Alert others as you leave.',
      'Use stairs rather than elevators.',
      'Call 112 from a safe place.',
    ],
    avoid: 'Do not re-enter a burning building.',
  },
  Cyclone: {
    icon: Wind,
    accent: '#138808',
    summary: 'Shelter indoors and monitor local authority updates.',
    actions: [
      'Keep away from windows.',
      'Charge devices and prepare water and medicines.',
      'Secure loose items when it is safe.',
    ],
    avoid: 'Do not go outside during the eye of a storm.',
  },
  Landslide: {
    icon: TriangleAlert,
    accent: '#93623b',
    summary: 'Move away from slopes and unstable roadside areas.',
    actions: [
      'Move to stable ground.',
      'Watch for falling debris and unusual sounds.',
      'Follow local evacuation directions.',
    ],
    avoid: 'Do not cross an active slide area.',
  },
  Heatwave: {
    icon: ThermometerSun,
    accent: '#ff9933',
    summary: 'Stay cool, hydrated, and check on vulnerable people.',
    actions: [
      'Drink water regularly.',
      'Avoid strenuous outdoor activity.',
      'Use shade or cooled indoor spaces.',
    ],
    avoid: 'Do not leave people or pets in parked vehicles.',
  },
  Lightning: {
    icon: Zap,
    accent: '#6556a8',
    summary: 'Go indoors and stay away from conductive surfaces.',
    actions: [
      'Seek a substantial building or enclosed vehicle.',
      'Unplug electronics if safe.',
      'Wait at least 30 minutes after thunder stops.',
    ],
    avoid: 'Do not shelter under isolated trees.',
  },
  Tsunami: {
    icon: Waves,
    accent: '#1976a9',
    summary: 'Move inland and to higher ground immediately.',
    actions: [
      'Follow official evacuation routes.',
      'Move away from beaches and waterways.',
      'Keep monitoring official warnings.',
    ],
    avoid: 'Do not return until authorities declare it safe.',
  },
  'Medical Emergency': {
    icon: HeartPulse,
    accent: '#d94f61',
    summary: 'Get emergency help and keep the person safe.',
    actions: [
      'Call 112 for urgent medical help.',
      'Check responsiveness and breathing.',
      'Share clear location details with responders.',
    ],
    avoid: 'Do not give food or drink to an unconscious person.',
  },
} as const;

type DisasterName = keyof typeof guides;

function Badge({
  children,
  tone = 'green',
}: {
  children: React.ReactNode;
  tone?: 'green' | 'orange' | 'navy' | 'red' | 'slate';
}) {
  const tones = {
    green: 'bg-[#eff9f0] text-[#138808]',
    orange: 'bg-[#fff5e8] text-[#b75a00]',
    navy: 'bg-[#edf0ff] text-[#0a1870]',
    red: 'bg-[#fff0ef] text-[#b42318]',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-[.12em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold tracking-[.16em] text-[#138808]">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-[-.045em] text-[#09156b] sm:text-4xl">
        {title}
      </h1>
      {copy && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{copy}</p>}
    </div>
  );
}

function DemoNotice({
  children = 'DEMO DATA — This information is illustrative and is not a live government feed.',
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#ffe0bb] bg-[#fff9f1] px-4 py-3 text-xs leading-5 text-[#9b540d]">
      <b className="mr-1">Demo mode.</b>
      {children}
    </div>
  );
}

export function HomePage() {
  return (
    <div className="mx-auto max-w-[1180px] space-y-7 pb-10">
      <section className="home-hero relative overflow-hidden rounded-[2rem] border border-[#e1e6f2] bg-white/75 p-7 shadow-[0_16px_45px_rgba(25,46,111,.08)] backdrop-blur-xl sm:p-10">
        <div
          aria-hidden
          className="absolute -top-20 -right-16 size-[31rem] rounded-full bg-[radial-gradient(circle,rgba(19,136,8,.13),transparent_62%)]"
        />
        <div
          aria-hidden
          className="absolute -bottom-28 left-[32%] size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(255,153,51,.15),transparent_63%)]"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <Badge tone="orange">✦ INDEPENDENCE DAY SPECIAL</Badge>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-[-.055em] text-[#09156b] sm:text-5xl">
              AI assistance when every second matters.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Multilingual voice-powered disaster response assistance for safer communities.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/assistant"
                className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(105deg,#ff9933,#0a1870_52%,#138808)] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                <Mic className="size-4" />
                Start Voice Assistance
              </Link>
              <Link
                href="/emergency"
                className="inline-flex items-center gap-2 rounded-xl border border-[#ffb9b0] bg-white px-5 py-3.5 text-sm font-bold text-[#b42318] transition hover:bg-[#fff4f3]"
              >
                <Siren className="size-4" />
                Emergency SOS
              </Link>
            </div>
          </div>
          <div className="relative grid min-h-64 place-items-center">
            <div className="chakra-hero absolute size-64 rounded-full" />
            <div className="relative grid size-36 place-items-center rounded-full border-[10px] border-white bg-[linear-gradient(135deg,#fff2df,#edf8eb)] shadow-[0_18px_45px_rgba(37,70,150,.16)]">
              <Mic className="size-11 text-[#09156b]" />
            </div>
            <div className="absolute bottom-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[#09156b] shadow-sm">
              AapdaMitra is ready to help
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="premium-card p-5">
          <Badge>● LIVE SYSTEM STATUS</Badge>
          <p className="mt-4 text-lg font-semibold">Voice channel ready</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Connect a LiveKit session to receive real assistant responses.
          </p>
        </article>
        <article className="premium-card p-5">
          <Badge tone="navy">
            <ShieldCheck className="size-3" />
            PRIVACY FIRST
          </Badge>
          <p className="mt-4 text-lg font-semibold">Consent-based location</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Coordinates remain on your device until you explicitly choose to share.
          </p>
        </article>
        <article className="premium-card p-5">
          <Badge tone="orange">MULTILINGUAL</Badge>
          <p className="mt-4 text-lg font-semibold">Five interface languages</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            English, Hindi, Bengali, Marathi, and Tamil are ready in the interface.
          </p>
        </article>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <SectionTitle eyebrow="QUICK SAFETY ACTIONS" title="Choose a situation" />
          <Link href="/safety" className="hidden text-sm font-bold text-[#0a1870] sm:inline">
            View safety center <ChevronRight className="inline size-4" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(guides)
            .slice(0, 6)
            .map(([name, guide]) => {
              const Icon = guide.icon;
              return (
                <Link
                  key={name}
                  href={`/safety?topic=${encodeURIComponent(name)}`}
                  className="premium-card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-[#ffcf99] hover:shadow-lg"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-[#fff7ec] text-[#d66b0c] group-hover:bg-[#138808] group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <b className="block text-sm">{name}</b>
                    <small className="mt-1 block text-xs text-slate-500">Immediate guidance</small>
                  </span>
                </Link>
              );
            })}
        </div>
      </section>
    </div>
  );
}

export function AssistantPage() {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const { state } = useAgent();
  const { send } = useChat();
  const [language, setLanguage] = useState('en');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [textMessage, setTextMessage] = useState('');
  const [sendingText, setSendingText] = useState(false);
  const visibleMessages = useMemo(
    () =>
      messages.filter((message) => message.message.toLowerCase().includes(search.toLowerCase())),
    [messages, search]
  );
  async function start() {
    if (session.isConnected) return;
    setStarting(true);
    setError(null);
    try {
      await session.start();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? `Unable to connect: ${reason.message}`
          : 'Unable to connect to the voice channel. Check the LiveKit configuration.'
      );
    } finally {
      setStarting(false);
    }
  }
  async function sendTextMessage() {
    const message = textMessage.trim();
    if (!message) return;
    setSendingText(true);
    setError(null);
    try {
      if (!session.isConnected) await session.start();
      await send(message);
      setTextMessage('');
    } catch (reason) {
      setError(
        reason instanceof Error
          ? `Unable to send message: ${reason.message}`
          : 'Unable to send your message. Check the voice channel configuration.'
      );
    } finally {
      setSendingText(false);
    }
  }
  return (
    <div className="mx-auto max-w-[1280px] pb-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge tone="orange">✦ ACTIVE ASSISTANT</Badge>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            AapdaMitra voice assistance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Secure voice assistance with real LiveKit transcript data.
          </p>
        </div>
        <Badge tone={session.isConnected ? 'green' : 'slate'}>
          <Radio className="size-3" />
          {session.isConnected ? 'CONNECTED' : 'READY'}
        </Badge>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(350px,.85fr)]">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#dfe5f1] bg-white/80 shadow-[0_16px_42px_rgba(20,44,110,.08)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#e4e8f1] px-5 py-3">
            <span className="mr-2 text-xs font-bold text-slate-500">
              <Languages className="mr-1 inline size-4 text-[#138808]" />
              Language
            </span>
            {languages.map((item) => (
              <button
                key={item.value}
                onClick={() => setLanguage(item.value)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${language === item.value ? 'bg-[#080c78] text-white shadow-md' : 'text-slate-500 hover:bg-[#f1f5ff]'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div
            aria-hidden
            className="chakra-assistant absolute top-[14%] left-1/2 size-[35rem] -translate-x-1/2"
          />
          <div className="relative flex min-h-[590px] flex-col items-center justify-center px-5 py-12 text-center">
            <div className="absolute top-12 rounded-full border border-[#e2e6f1] bg-white/90 px-4 py-2 text-sm font-semibold text-[#09156b] shadow-sm">
              <Sparkles className="mr-2 inline size-4 text-[#ff9933]" />
              Active assistant: AapdaMitra
            </div>
            <motion.button
              type="button"
              aria-label={
                session.isConnected ? 'Voice conversation active' : 'Start voice conversation'
              }
              onClick={start}
              disabled={starting || session.isConnected}
              animate={session.isConnected ? { scale: [1, 1.025, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative grid size-[260px] place-items-center overflow-hidden rounded-full border border-[#d8ddec] bg-[radial-gradient(circle_at_25%_25%,#fff9f1,#eef8ee_58%,#eef0ff)] shadow-[0_0_0_14px_rgba(255,255,255,.72),0_24px_55px_rgba(20,44,110,.15)] transition hover:scale-[1.02] focus-visible:outline-4 focus-visible:outline-[#ff9933] disabled:cursor-default"
            >
              <AudioVisualizer
                isChatOpen={false}
                audioVisualizerType="radial"
                audioVisualizerColor="#0a1870"
                audioVisualizerRadialBarCount={28}
                audioVisualizerRadialRadius={72}
                className="flex size-[240px] items-center justify-center overflow-hidden"
              />
              <div className="absolute grid size-24 place-items-center rounded-full bg-white shadow-[0_12px_26px_rgba(20,44,110,.15)]">
                <Mic className="size-11 text-[#080c78]" />
              </div>
            </motion.button>
            <div className="mt-7 flex flex-col items-center">
              <p className="text-xl font-bold text-[#09156b]">
                <span
                  className={`mr-2 inline-block size-3 rounded-full ${state === 'thinking' ? 'bg-[#ff9933]' : session.isConnected ? 'animate-pulse bg-[#138808]' : 'bg-[#080c78]'}`}
                />
                {state === 'thinking'
                  ? 'Processing your request'
                  : session.isConnected
                    ? 'Listening — speak now'
                    : 'Ready to assist'}
              </p>
              <div className="mt-4 flex gap-1.5" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span
                    key={index}
                    className={`size-2 rounded-full ${index % 3 === 0 ? 'bg-[#ff9933]' : index % 3 === 1 ? 'bg-[#138808]' : 'bg-[#080c78]'}`}
                  />
                ))}
              </div>
              <p className="mt-4 max-w-md text-sm text-slate-500">
                {session.isConnected
                  ? 'Speak naturally. Your response and AapdaMitra’s reply will appear in the transcript.'
                  : 'Tap the microphone or Start Conversation to open a secure voice channel.'}
              </p>
            </div>
          </div>
          {error && (
            <div
              role="alert"
              className="mx-5 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
            >
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-3 border-t border-[#e4e8f1] p-5">
            <Button
              onClick={start}
              disabled={session.isConnected || starting}
              className="h-12 flex-1 rounded-xl bg-[linear-gradient(105deg,#ff9933,#138808)] text-sm font-bold text-white hover:opacity-90"
            >
              <Mic className="size-4" />
              {starting ? 'Opening secure channel…' : 'Start Conversation'}
            </Button>
            <Button
              variant="outline"
              onClick={() => session.end()}
              disabled={!session.isConnected}
              className="h-12 flex-1 rounded-xl border-[#e2e6f1] text-sm font-bold"
            >
              End Call
            </Button>
            <StartAudioButton
              label="Enable Audio"
              variant="outline"
              className="h-12 rounded-xl border-[#e2e6f1] text-xs font-bold"
            />
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendTextMessage();
            }}
            className="border-t border-[#e4e8f1] bg-[#fbfcff] p-5"
          >
            <label className="mb-2 block text-xs font-bold text-[#09156b]">
              Prefer typing? Tell AapdaMitra what happened.
            </label>
            <div className="flex gap-2">
              <input
                value={textMessage}
                onChange={(event) => setTextMessage(event.target.value)}
                placeholder="Example: Mere area mein flood aa gaya hai…"
                className="h-12 min-w-0 flex-1 rounded-xl border border-[#dfe5f1] bg-white px-4 text-sm outline-none focus:border-[#080c78]"
                aria-label="Type your emergency concern"
              />
              <Button
                type="submit"
                disabled={!textMessage.trim() || sendingText}
                className="h-12 rounded-xl bg-[#080c78] px-4"
              >
                <Send className="size-4" />
                {sendingText ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        </section>
        <aside className="overflow-hidden rounded-[2rem] border border-[#dfe5f1] bg-white/80 shadow-[0_16px_42px_rgba(20,44,110,.08)]">
          <div className="border-b border-[#e4e8f1] p-6">
            <Badge>LIVE CONVERSATION</Badge>
            <div className="mt-3 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Transcript</h2>
              <Download className="size-5 text-[#0a1870]" />
            </div>
            <label className="relative mt-5 block">
              <Search className="absolute top-3 left-3 size-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transcript"
                aria-label="Search transcript"
                className="h-10 w-full rounded-xl border border-[#dfe5f1] bg-[#fbfcff] pr-3 pl-9 text-sm outline-none focus:border-[#0a1870]"
              />
            </label>
          </div>
          <div className="min-h-[440px] space-y-3 p-5">
            {visibleMessages.length ? (
              visibleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-2xl p-4 text-sm leading-6 ${message.from?.isLocal ? 'ml-6 bg-[#080c78] text-white' : 'mr-5 border border-[#e2e6f1] bg-[#fbfdff] text-[#1b2879]'}`}
                >
                  <b className="mb-1 block text-[10px] tracking-wide opacity-70">
                    {message.from?.isLocal ? 'YOU' : 'AAPDAMITRA'}
                  </b>
                  {message.message}
                </div>
              ))
            ) : (
              <div className="grid min-h-[370px] place-items-center">
                <div className="rounded-2xl border border-[#e2e6f1] bg-white p-5 text-left shadow-sm">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#eff9f0] text-[#138808]">
                    <Sparkles className="size-5" />
                  </span>
                  <b className="mt-4 block text-sm">AapdaMitra</b>
                  <p className="mt-2 max-w-[250px] text-sm leading-6 text-slate-500">
                    Namaste! I am AapdaMitra. How can I assist you right now?
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function EmergencyPage() {
  const [stage, setStage] = useState<
    'READY' | 'LOCATING' | 'REQUEST CREATED' | 'FORWARDED' | 'FAILED'
  >('READY');
  const [disaster, setDisaster] = useState('Flood');
  const [dialog, setDialog] = useState(false);
  const [location, setLocation] = useState('Not yet shared');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [dispatchMessage, setDispatchMessage] = useState(
    'No emergency dispatch integration is configured.'
  );
  async function createRequest(nextCoordinates: { latitude: number; longitude: number } | null) {
    try {
      const response = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentType: disaster,
          severity: 'Unverified',
          ...nextCoordinates,
        }),
      });
      const result = await response.json();
      setStage(
        result.dispatch === 'FORWARDED'
          ? 'FORWARDED'
          : result.dispatch === 'FAILED'
            ? 'FAILED'
            : 'REQUEST CREATED'
      );
      setDispatchMessage(
        result.dispatch === 'FORWARDED'
          ? 'Request forwarded to the configured emergency integration.'
          : (result.message ?? result.error ?? 'Emergency request created.')
      );
    } catch {
      setStage('FAILED');
      setDispatchMessage('Emergency request could not be created. Call 112 directly.');
    }
  }
  function locateAndSend() {
    setDialog(false);
    setStage('LOCATING');
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCoordinates(nextCoordinates);
          setLocation(
            `${nextCoordinates.latitude.toFixed(4)}, ${nextCoordinates.longitude.toFixed(4)}`
          );
          void createRequest(nextCoordinates);
        },
        () => void createRequest(null)
      );
    else void createRequest(null);
  }
  return (
    <div className="mx-auto max-w-[1050px] pb-10">
      <SectionTitle
        eyebrow="EMERGENCY CONTROL CENTER"
        title="Emergency SOS"
        copy="Prepare an assistance request with your consent. This demo does not contact emergency services."
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#080c78] p-8 text-white shadow-[0_20px_50px_rgba(8,12,120,.24)]">
          <div
            aria-hidden
            className="absolute -top-16 -right-20 size-80 rounded-full border-[42px] border-white/5"
          />
          <Badge tone="orange">{stage}</Badge>
          <h2 className="relative mt-5 text-3xl font-semibold">Request immediate assistance</h2>
          <p className="relative mt-3 max-w-sm text-sm leading-6 text-blue-100">
            Select an incident type, review your location consent, then prepare the demo emergency
            request. A configured emergency webhook can receive the validated request; otherwise it
            remains in demo mode.
          </p>
          <button
            onClick={() => setDialog(true)}
            className="relative mt-10 grid size-44 place-items-center rounded-full border-[12px] border-[#ffb565] bg-[#d9392f] text-center shadow-[0_0_0_10px_rgba(255,153,51,.16)] transition hover:scale-[1.03]"
          >
            <Siren className="size-10" />
            <b className="text-lg">
              Emergency
              <br />
              SOS
            </b>
          </button>
          <p className="relative mt-8 text-xs text-blue-200">
            DEMO MODE — No real emergency service has been contacted.
          </p>
        </section>
        <section className="premium-card p-6">
          <h2 className="text-xl font-semibold">Request details</h2>
          <label className="mt-5 block text-xs font-bold text-slate-500">
            INCIDENT TYPE
            <select
              value={disaster}
              onChange={(event) => setDisaster(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-[#dfe5f1] bg-white px-3 text-sm font-semibold text-[#09156b]"
            >
              {[...Object.keys(guides), 'Other'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f7f9ff] p-4">
              <p className="text-[10px] font-bold tracking-wide text-slate-500">LOCATION</p>
              <p className="mt-2 text-sm font-semibold">{location}</p>
            </div>
            <div className="rounded-xl bg-[#f7f9ff] p-4">
              <p className="text-[10px] font-bold tracking-wide text-slate-500">TIMESTAMP</p>
              <p className="mt-2 text-sm font-semibold">{new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-[#f7f9ff] p-4 text-xs leading-5 text-slate-600">
            <b className="text-[#09156b]">Dispatch status:</b> {dispatchMessage}
            {coordinates && <span className="block pt-1">Location included with consent.</span>}
          </div>
        </section>
      </div>
      {dialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[#080c78]/35 p-4"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <Badge tone="red">
              <Siren className="size-3" />
              CONFIRMATION
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold">Prepare this emergency request?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              AapdaMitra will request device location permission and create a validated request. It
              is forwarded only when an authorised emergency webhook is configured.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialog(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={locateAndSend}
                className="rounded-xl bg-[#d9392f] hover:bg-[#bd2c24]"
              >
                <LocateFixed className="size-4" />
                Share location & prepare
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function LocationPage() {
  const [location, setLocation] = useState('Permission not requested');
  const [filter, setFilter] = useState('All');
  const [places, setPlaces] = useState<
    Array<{ id: string; name: string; kind: string; distanceKm: number }>
  >([]);
  const [nearbyStatus, setNearbyStatus] = useState<'IDLE' | 'LOADING' | 'LIVE' | 'ERROR'>('IDLE');
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const filterKind =
    { Shelters: 'Shelter', Hospitals: 'Hospital', 'Relief Camps': 'Relief camp' }[filter] ?? filter;
  const shown = filter === 'All' ? places : places.filter((place) => place.kind === filterKind);
  const placeIcon = (kind: string) =>
    ({ Hospital, Police: ShieldCheck, Fire: Siren, Shelter: Building2, 'Relief camp': LifeBuoy })[
      kind
    ] ?? MapPin;
  async function loadNearby(latitude: number, longitude: number) {
    setNearbyStatus('LOADING');
    setNearbyError(null);
    try {
      const response = await fetch('/api/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Nearby help could not be loaded.');
      setPlaces(result.places);
      setNearbyStatus('LIVE');
    } catch (error) {
      setNearbyStatus('ERROR');
      setNearbyError(error instanceof Error ? error.message : 'Nearby help could not be loaded.');
    }
  }
  function requestLocation() {
    if (!navigator.geolocation) {
      setLocation('Location is unavailable in this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        void loadNearby(coords.latitude, coords.longitude);
      },
      () => setLocation('Permission not granted — no location shared')
    );
  }
  return (
    <div className="mx-auto max-w-[1150px] pb-10">
      <SectionTitle
        eyebrow="LOCATION ASSISTANCE"
        title="Live location & nearby help"
        copy="Your exact coordinates are never added to a shareable safety alert."
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
        <section className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-[#dce4ef] bg-[linear-gradient(135deg,#eaf3ff,#eff9ee)] p-6">
          <div
            aria-hidden
            className="absolute inset-0 [background-image:linear-gradient(#bed2ee_1px,transparent_1px),linear-gradient(90deg,#bed2ee_1px,transparent_1px)] [background-size:38px_38px] opacity-40"
          />
          <div className="relative">
            <Badge tone="orange">MAP PREVIEW</Badge>
            <div className="mt-20 grid place-items-center">
              <span className="grid size-16 place-items-center rounded-full bg-[#d9392f] text-white shadow-xl">
                <MapPin className="size-8" />
              </span>
              <p className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">
                Your location stays on this device
              </p>
            </div>
          </div>
        </section>
        <section className="premium-card p-6">
          <Badge>
            <LocateFixed className="size-3" />
            LOCATION CONSENT
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold">Share location for this session</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{location}</p>
          <Button onClick={requestLocation} className="mt-5 rounded-xl bg-[#080c78] font-bold">
            <LocateFixed className="size-4" />
            Request device location
          </Button>
          <p className="mt-5 text-xs leading-5 text-slate-500">
            After consent, nearby points are queried live from OpenStreetMap. Listings do not prove
            live capacity or availability.
          </p>
        </section>
      </div>
      <section className="premium-card mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e8f1] p-5">
          <div>
            <Badge tone={nearbyStatus === 'LIVE' ? 'green' : 'orange'}>
              {nearbyStatus === 'LIVE' ? '● LIVE OPENSTREETMAP DATA' : 'LOCATION REQUIRED'}
            </Badge>
            <h2 className="mt-2 text-xl font-semibold">Nearby help</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Shelters', 'Hospitals', 'Police', 'Fire', 'Relief Camps'].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full px-3 py-2 text-xs font-bold ${filter === item ? 'bg-[#080c78] text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="grid divide-y divide-[#e4e8f1] md:grid-cols-2 md:divide-x md:divide-y-0">
          {nearbyError && <p className="p-5 text-sm text-red-700">{nearbyError}</p>}
          {nearbyStatus === 'LOADING' && (
            <p className="p-5 text-sm text-slate-500">
              Finding nearby hospitals, police, fire stations, and shelters…
            </p>
          )}
          {shown.map((place) => {
            const Icon = placeIcon(place.kind);
            return (
              <div key={place.name} className="flex items-center gap-4 p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-[#f1f6ff] text-[#0a1870]">
                  <Icon className="size-5" />
                </span>
                <span>
                  <b className="block text-sm">{place.name}</b>
                  <small className="text-xs text-slate-500">
                    {place.kind} · {place.distanceKm} km away
                  </small>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function SafetyPage() {
  const [selected, setSelected] = useState<DisasterName>('Flood');
  const [liveSafety, setLiveSafety] = useState<{
    current: Record<string, number | string>;
    risks: string[];
    fetchedAt: string;
  } | null>(null);
  const [liveSafetyState, setLiveSafetyState] = useState<'IDLE' | 'LOADING' | 'LIVE' | 'ERROR'>(
    'IDLE'
  );
  const [liveSafetyError, setLiveSafetyError] = useState<string | null>(null);
  const guide = guides[selected];
  const Icon = guide.icon;
  function loadLiveConditions() {
    if (!navigator.geolocation) {
      setLiveSafetyError('Location is unavailable in this browser.');
      setLiveSafetyState('ERROR');
      return;
    }
    setLiveSafetyState('LOADING');
    setLiveSafetyError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `/api/safety?latitude=${encodeURIComponent(coords.latitude)}&longitude=${encodeURIComponent(coords.longitude)}`
          );
          const result = await response.json();
          if (!response.ok) throw new Error(result.error ?? 'Live conditions could not be loaded.');
          setLiveSafety(result);
          setLiveSafetyState('LIVE');
        } catch (error) {
          setLiveSafetyError(
            error instanceof Error ? error.message : 'Live conditions could not be loaded.'
          );
          setLiveSafetyState('ERROR');
        }
      },
      () => {
        setLiveSafetyError('Location permission was not granted.');
        setLiveSafetyState('ERROR');
      }
    );
  }
  return (
    <div className="mx-auto max-w-[1180px] pb-10">
      <SectionTitle
        eyebrow="OFFLINE-FIRST KNOWLEDGE"
        title="Safety Center"
        copy="Practical emergency guidance that stays useful even when connectivity is limited."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(guides).map(([name, item]) => {
          const ItemIcon = item.icon;
          return (
            <button
              key={name}
              onClick={() => setSelected(name as DisasterName)}
              className={`premium-card flex items-center gap-4 p-4 text-left transition hover:-translate-y-0.5 ${selected === name ? 'border-[#ffbf78] bg-[#fffaf3]' : ''}`}
            >
              <span
                className="grid size-10 place-items-center rounded-xl text-white"
                style={{ backgroundColor: item.accent }}
              >
                <ItemIcon className="size-5" />
              </span>
              <b className="text-sm">{name}</b>
            </button>
          );
        })}
      </div>
      <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#dfe5f1] bg-white shadow-[0_16px_42px_rgba(20,44,110,.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4 bg-[linear-gradient(100deg,#fff7eb,#eff9ef)] p-7">
          <div className="flex gap-4">
            <span
              className="grid size-14 place-items-center rounded-2xl text-white"
              style={{ backgroundColor: guide.accent }}
            >
              <Icon className="size-7" />
            </span>
            <div>
              <Badge tone="orange">{selected.toUpperCase()}</Badge>
              <h2 className="mt-2 text-2xl font-semibold">{guide.summary}</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={loadLiveConditions}
              variant="outline"
              className="rounded-xl border-[#b9c9e8] bg-white font-bold"
            >
              {liveSafetyState === 'LOADING' ? 'Loading…' : 'Check live conditions'}
            </Button>
            <Link
              href="/assistant"
              className="rounded-xl bg-[#080c78] px-4 py-3 text-sm font-bold text-white"
            >
              Ask AapdaMitra
            </Link>
          </div>
        </div>
        {(liveSafety || liveSafetyError) && (
          <div
            className={`mx-7 mt-6 rounded-xl p-4 text-sm ${liveSafety ? 'bg-[#eff9f0] text-[#216135]' : 'bg-red-50 text-red-800'}`}
          >
            <b>{liveSafety ? '● LIVE WEATHER CONDITIONS' : 'Live conditions unavailable'}</b>
            {liveSafety && (
              <p className="mt-2">
                {Number(liveSafety.current.temperature_2m)}°C · wind{' '}
                {Number(liveSafety.current.wind_speed_10m)} km/h · precipitation{' '}
                {Number(liveSafety.current.precipitation)} mm.{' '}
                {liveSafety.risks.length
                  ? liveSafety.risks.join(' ')
                  : 'No threshold-based risk note at this time.'}
              </p>
            )}
            {liveSafetyError && <p className="mt-2">{liveSafetyError}</p>}
          </div>
        )}
        <div className="grid gap-5 p-7 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#138808]">
              <CircleCheck className="size-4" />
              IMMEDIATE ACTIONS
            </h3>
            <ol className="mt-4 space-y-4">
              {guide.actions.map((action, index) => (
                <li key={action} className="flex gap-3 text-sm leading-6">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#eff9f0] text-xs font-bold text-[#138808]">
                    {index + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-[#ffdcc3] bg-[#fff8f3] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#b75a00]">
              <AlertTriangle className="size-4" />
              THINGS TO AVOID
            </h3>
            <p className="mt-4 text-sm leading-6 text-[#72471d]">{guide.avoid}</p>
            <a
              href="tel:112"
              className="mt-5 inline-block text-sm font-bold text-[#09156b] underline underline-offset-4"
            >
              Call 112 in an emergency
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export function AlertsPage() {
  const [copied, setCopied] = useState(false);
  const alert =
    'DEMO SAFETY ALERT • FLOOD\nSeverity: Monitor local conditions\nArea: General area only — private location not shared\nSafety action: Move to higher ground and avoid floodwater.\nEmergency: Call 112\nVerification: UNVERIFIED DEMO\nAapdaMitra';
  async function copy() {
    await navigator.clipboard.writeText(alert);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="mx-auto max-w-[1120px] pb-10">
      <SectionTitle
        eyebrow="COMMUNITY SAFETY INFORMATION"
        title="Disaster alerts"
        copy="Help important safety information reach your community faster—without exposing private data."
      />
      <DemoNotice>
        Active and recent alerts on this page are demonstration content, not government warnings.
      </DemoNotice>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <section className="premium-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e4e8f1] p-5">
            <div>
              <Badge tone="orange">ACTIVE ALERTS</Badge>
              <h2 className="mt-2 text-xl font-semibold">Monitor and share responsibly</h2>
            </div>
            <BellRing className="size-6 text-[#ff9933]" />
          </div>
          {[
            ['Flood watch', 'Moderate', 'General riverside area', 'UNVERIFIED'],
            ['Heatwave advisory', 'High', 'City-wide', 'UNVERIFIED'],
            ['Weather update', 'Low', 'District-wide', 'SUSPICIOUS'],
          ].map(([title, severity, area, status]) => (
            <article
              key={title}
              className="flex items-center gap-4 border-b border-[#e4e8f1] p-5 last:border-0"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-[#fff4e6] text-[#d66b0c]">
                <TriangleAlert className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-sm">{title}</b>
                <small className="block text-xs text-slate-500">{area} · Demo timestamp</small>
              </span>
              <span>
                <Badge tone={status === 'SUSPICIOUS' ? 'red' : 'slate'}>{status}</Badge>
                <p className="mt-1 text-right text-[10px] font-bold text-slate-500">{severity}</p>
              </span>
            </article>
          ))}
        </section>
        <section className="overflow-hidden rounded-[2rem] bg-[#080c78] p-6 text-white">
          <Badge tone="orange">SHARE SAFETY ALERT</Badge>
          <h2 className="mt-4 text-2xl font-semibold">Ready for your community</h2>
          <p className="mt-2 text-sm leading-6 text-blue-100">
            The card shows only a general area and clearly marks verification state.
          </p>
          <pre className="mt-5 rounded-2xl bg-white/10 p-4 font-mono text-[11px] leading-5 whitespace-pre-wrap text-blue-50">
            {alert}
          </pre>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={copy} className="rounded-xl bg-white text-[#080c78] hover:bg-white/90">
              <Copy className="size-4" />
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              onClick={() => navigator.share?.({ title: 'AapdaMitra safety alert', text: alert })}
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Send className="size-4" />
              Share
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Download className="size-4" />
              Safety Card
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const metrics = [
    ['Emergency Requests', '248', '+12.5%'],
    ['Active Incidents', '08', 'Monitoring'],
    ['Resolved Incidents', '186', '75% resolved'],
    ['People Assisted', '1,842', '+18.2%'],
    ['Alerts Shared', '412', 'Community safety'],
    ['Community Reach', '28.6K', '5 languages'],
  ];
  return (
    <div className="mx-auto max-w-[1180px] pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionTitle
          eyebrow="COMMAND CENTER"
          title="Response analytics"
          copy="A focused operations overview. Values are clearly marked as demo data."
        />
        <Badge tone="orange">DEMO DATA</Badge>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value, detail]) => (
          <article key={label} className="premium-card p-5">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-2 text-[11px] font-bold text-[#138808]">{detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <section className="premium-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Incidents over time</h2>
              <p className="mt-1 text-xs text-slate-500">Seven-day demo trend</p>
            </div>
            <BarChart3 className="text-[#0a1870]" />
          </div>
          <div className="mt-8 flex h-48 items-end gap-3">
            {[37, 56, 44, 76, 62, 91, 72].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-[linear-gradient(180deg,#ff9933_0%,#0a1870_48%,#138808_100%)]"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-slate-400">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="premium-card p-6">
          <h2 className="text-lg font-semibold">Severity distribution</h2>
          <div className="mt-6 space-y-5">
            {[
              ['High', '28', '#d9392f'],
              ['Moderate', '46', '#ff9933'],
              ['Low', '26', '#138808'],
            ].map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs">
                  <b>{label}</b>
                  <span>{value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${value}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [language, setLanguage] = useState('en');
  const [notice, setNotice] = useState(true);
  return (
    <div className="mx-auto max-w-[940px] pb-10">
      <SectionTitle
        eyebrow="ACCOUNT & PREFERENCES"
        title="Settings"
        copy="Control language, privacy, and how AapdaMitra handles device permissions."
      />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section className="premium-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Languages className="size-5 text-[#138808]" />
            Language & voice
          </h2>
          <label className="mt-5 block text-xs font-bold text-slate-500">
            INTERFACE LANGUAGE
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="mt-2 w-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Voice language switching can be connected to provider-specific backend configuration
            later.
          </p>
        </section>
        <section className="premium-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Settings2 className="size-5 text-[#0a1870]" />
            Appearance
          </h2>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f7f9ff] p-4">
            <span>
              <b className="block text-sm">Theme</b>
              <small className="text-xs text-slate-500">Choose light, dark, or system</small>
            </span>
            <ThemeToggle className="w-auto bg-white" />
          </div>
        </section>
        <section className="premium-card p-6 md:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShieldCheck className="size-5 text-[#138808]" />
            Privacy & emergency preferences
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#dfe5f1] p-4">
              <b className="text-sm">Location consent</b>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                AapdaMitra asks before accessing device coordinates. They are not included in
                community share cards.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dfe5f1] p-4">
              <input
                checked={notice}
                onChange={(event) => setNotice(event.target.checked)}
                type="checkbox"
                className="size-4 accent-[#138808]"
              />
              <span>
                <b className="block text-sm">Safety notifications</b>
                <small className="text-xs text-slate-500">Enable demo safety reminders.</small>
              </span>
            </label>
          </div>
          <div className="mt-5 rounded-xl bg-[#eff9f0] p-4 text-xs leading-5 text-[#27613a]">
            <b>Security architecture:</b> provider credentials remain server-side; emergency
            requests are designed for validation and audit logging before any real dispatch
            integration.
          </div>
        </section>
      </div>
    </div>
  );
}
