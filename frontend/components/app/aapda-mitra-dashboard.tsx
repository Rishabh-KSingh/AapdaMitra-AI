'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  Flame,
  HeartPulse,
  Landmark,
  Languages,
  LocateFixed,
  MapPin,
  Menu,
  Mic,
  Phone,
  PhoneOff,
  Radio,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Siren,
  Sparkles,
  TriangleAlert,
  Users,
  Waves,
  Wind,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAgent, useSessionContext, useSessionMessages } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AudioVisualizer } from '@/components/agents-ui/blocks/agent-session-view-01/components/audio-visualizer';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Disaster = 'Flood' | 'Earthquake' | 'Fire' | 'Cyclone' | 'Landslide' | 'Medical Emergency';
type SosState = 'PENDING' | 'SENT' | 'ACKNOWLEDGED' | 'RESOLVED';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
  { value: 'bn', label: 'বাংলা' },
  { value: 'mr', label: 'मराठी' },
  { value: 'ta', label: 'தமிழ்' },
];

const guidance: Record<Disaster, { summary: string; steps: string[]; avoid: string }> = {
  Flood: {
    summary: 'Move to higher ground and follow official evacuation updates.',
    steps: [
      'Move away from fast-moving water.',
      'Switch off electricity if it is safe.',
      'Keep an emergency kit and phone charged.',
    ],
    avoid: 'Do not walk or drive through floodwater.',
  },
  Earthquake: {
    summary: 'Protect yourself first: drop, cover and hold on.',
    steps: [
      'Take cover under sturdy furniture.',
      'Stay away from windows and heavy objects.',
      'Move outside only after shaking stops.',
    ],
    avoid: 'Do not use lifts during or after shaking.',
  },
  Fire: {
    summary: 'Get away from smoke and leave by the nearest safe exit.',
    steps: [
      'Alert others as you leave.',
      'Use stairs instead of elevators.',
      'Cover your nose and mouth if smoke is present.',
    ],
    avoid: 'Do not re-enter a burning building.',
  },
  Cyclone: {
    summary: 'Stay indoors, sheltered from windows, and monitor official updates.',
    steps: [
      'Charge devices and keep a torch nearby.',
      'Secure loose outdoor items if safe.',
      'Keep drinking water and medicines ready.',
    ],
    avoid: 'Do not go outside during the eye of the storm.',
  },
  Landslide: {
    summary: 'Move away from slopes and avoid unstable roadside areas.',
    steps: [
      'Watch for unusual sounds or falling debris.',
      'Move to stable, higher ground.',
      'Follow local evacuation directions.',
    ],
    avoid: 'Do not cross a slide area until authorities say it is safe.',
  },
  'Medical Emergency': {
    summary: 'Call 112 for urgent medical assistance and keep the person safe.',
    steps: [
      'Check if the person is responsive.',
      'Do not move someone with a possible spinal injury.',
      'Share clear location details with responders.',
    ],
    avoid: 'Do not give food or drink to an unconscious person.',
  },
};

const quickActions: Array<{ title: Disaster; description: string; icon: typeof Waves }> = [
  { title: 'Flood', description: 'Move to higher ground', icon: Waves },
  { title: 'Earthquake', description: 'Drop, cover and hold', icon: Activity },
  { title: 'Fire', description: 'Exit through a safe route', icon: Flame },
  { title: 'Cyclone', description: 'Shelter and stay updated', icon: Wind },
  { title: 'Landslide', description: 'Keep clear of slopes', icon: TriangleAlert },
  { title: 'Medical Emergency', description: 'Get urgent care guidance', icon: HeartPulse },
];

const nearbyHelp = [
  { name: 'Community Relief Shelter', distance: '1.2 km', kind: 'Safe shelter', icon: Building2 },
  { name: 'District Civil Hospital', distance: '2.1 km', kind: 'Hospital', icon: Ambulance },
  {
    name: 'Sector 14 Police Station',
    distance: '2.8 km',
    kind: 'Police station',
    icon: ShieldCheck,
  },
  { name: 'Fire & Rescue Station', distance: '3.4 km', kind: 'Fire station', icon: Siren },
];

function IndiaMark() {
  return (
    <div className="relative grid size-10 place-items-center overflow-hidden rounded-xl bg-[#102654] shadow-[0_10px_25px_rgba(16,38,84,.22)]">
      <div className="absolute inset-x-0 top-0 h-1/3 bg-[#ee993c]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[#218455]" />
      <div className="relative grid size-5 place-items-center rounded-full border-2 border-[#1b4a95] bg-white">
        <div className="size-1.5 rounded-full bg-[#1b4a95]" />
      </div>
    </div>
  );
}

function StatePill({ state }: { state: SosState }) {
  const classes: Record<SosState, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    SENT: 'bg-blue-100 text-blue-800',
    ACKNOWLEDGED: 'bg-emerald-100 text-emerald-800',
    RESOLVED: 'bg-slate-100 text-slate-700',
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide ${classes[state]}`}
    >
      {state}
    </span>
  );
}

export function AapdaMitraDashboard({ appConfig }: { appConfig: AppConfig }) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const { state: agentState } = useAgent();
  const [language, setLanguage] = useState('en');
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster>('Flood');
  const [sosOpen, setSosOpen] = useState(false);
  const [sosState, setSosState] = useState<SosState | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState(
    'Location is private until you choose to share it.'
  );
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [alertCopied, setAlertCopied] = useState(false);

  const displayedMessages = useMemo(
    () =>
      messages.filter((item) =>
        item.message.toLowerCase().includes(transcriptSearch.trim().toLowerCase())
      ),
    [messages, transcriptSearch]
  );

  const currentGuide = guidance[selectedDisaster];
  const languageName = languages.find((item) => item.value === language)?.label ?? 'English';
  const channelLabel = session.isConnected ? 'LIVEKIT CONNECTED' : 'VOICE CHANNEL READY';
  const generatedAlert = `DEMO SAFETY ALERT • ${selectedDisaster.toUpperCase()}\nSeverity: Monitor local conditions\nArea: General area only — private location not shared\nImmediate action: ${currentGuide.steps[0]}\nEmergency: Call 112\nVerification: UNVERIFIED DEMO\nGenerated by AapdaMitra • ${new Date().toLocaleDateString('en-IN')}`;

  async function startConversation() {
    setVoiceError(null);
    setIsStarting(true);
    try {
      await session.start();
    } catch (error) {
      setVoiceError(
        error instanceof Error
          ? `Could not open voice channel: ${error.message}`
          : 'Could not open the voice channel. Check LiveKit configuration and microphone access.'
      );
    } finally {
      setIsStarting(false);
    }
  }

  function chooseDisaster(disaster: Disaster) {
    setSelectedDisaster(disaster);
    document.getElementById('guidance')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus(
        'Location is unavailable in this browser. You can still use the demo flow.'
      );
      return;
    }
    setLocationStatus('Requesting permission…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const stamp = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)} • ${stamp}`);
        setLocationStatus(
          'Location captured on this device for your review. It has not been sent.'
        );
      },
      () => setLocationStatus('Location permission was not granted. No location has been shared.')
    );
  }

  function confirmSos() {
    setSosState('PENDING');
    requestLocation();
    window.setTimeout(() => setSosState('SENT'), 550);
    setSosOpen(false);
  }

  async function copyAlert() {
    try {
      await navigator.clipboard.writeText(generatedAlert);
      setAlertCopied(true);
      window.setTimeout(() => setAlertCopied(false), 1800);
    } catch {
      setVoiceError('Clipboard access is unavailable. Select and copy the safety alert manually.');
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#102654] selection:bg-[#e6efff] dark:bg-slate-950 dark:text-slate-100">
      <div
        aria-hidden
        className="chakra-bg fixed -top-24 right-[8%] -z-0 size-[28rem] opacity-30"
      />
      <div className="relative z-10">
        <div className="border-b border-[#dce4f1] bg-[#102654] px-4 py-2 text-[10px] font-semibold tracking-[.12em] text-white sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <i className="size-1.5 rounded-full bg-emerald-400" /> SUPPORT READY
            </span>
            <span className="hidden sm:inline">
              Emergency?{' '}
              <a className="underline underline-offset-2" href="tel:112">
                Call 112
              </a>
            </span>
            <span className="hidden md:inline">
              {channelLabel === 'LIVEKIT CONNECTED'
                ? 'LiveKit session active'
                : 'LiveKit voice channel available when configured'}
            </span>
          </div>
        </div>

        <header className="sticky top-0 z-40 border-b border-[#dce4f1]/80 bg-white/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-10 dark:bg-slate-950/85">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
            <a href="#assistant" className="flex items-center gap-3" aria-label="AapdaMitra home">
              <IndiaMark />
              <span>
                <b className="block text-base tracking-tight sm:text-lg">AapdaMitra</b>
                <small className="hidden text-[11px] text-slate-500 sm:block">
                  AI Disaster Response Assistant
                </small>
              </span>
            </a>
            <nav className="hidden items-center gap-5 text-xs font-semibold text-slate-600 lg:flex">
              <a href="#assistant" className="hover:text-[#102654]">
                Assistant
              </a>
              <a href="#nearby" className="hover:text-[#102654]">
                Nearby Help
              </a>
              <a href="#guidance" className="hover:text-[#102654]">
                Safety Guidance
              </a>
              <a href="#analytics" className="hover:text-[#102654]">
                Analytics
              </a>
            </nav>
            <div className="hidden items-center gap-2 md:flex">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger
                  aria-label="Select interface language"
                  className="h-9 border-[#dce4f1] bg-white text-xs shadow-none dark:bg-slate-900"
                >
                  <Languages className="size-3.5" />
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
              <a
                href="tel:112"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100"
              >
                <Phone className="size-3.5" />
                112
              </a>
              <a
                href="#analytics"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#dce4f1] px-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <BarChart3 className="size-3.5" />
                Analytics
              </a>
              <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-[10px] font-bold tracking-wide text-orange-800">
                INDEPENDENCE DAY SPECIAL
              </span>
              <ThemeToggle className="h-9 w-auto border-[#dce4f1] bg-white dark:bg-slate-900" />
            </div>
            <button
              className="grid size-10 place-items-center rounded-lg border border-[#dce4f1] md:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileMenu((open) => !open)}
            >
              {mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
          {mobileMenu && (
            <div className="mx-auto mt-3 flex max-w-[1440px] flex-wrap items-center gap-2 border-t border-[#e6edf7] pt-3 md:hidden">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-9 bg-white text-xs">
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
              <a
                href="tel:112"
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white"
              >
                Call 112
              </a>
              <a href="#analytics" className="rounded-lg border px-3 py-2 text-xs font-bold">
                Analytics
              </a>
            </div>
          )}
        </header>

        <section id="assistant" className="mx-auto max-w-[1440px] px-4 pt-7 pb-8 sm:px-6 lg:px-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[.16em] text-[#218455]">
                <span className="inline-block size-2 rounded-full bg-[#218455]" /> ACTIVE ASSISTANT:
                AAPDAMITRA
              </p>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
                Calm guidance when every second matters.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Dedicated to the safety of every Indian. Use voice for live AI assistance, or
                explore our clearly marked demo safety tools.
              </p>
            </div>
            <div className="rounded-xl border border-[#dce4f1] bg-white/80 px-3 py-2 text-xs shadow-sm dark:bg-slate-900">
              <span className="text-slate-500">Interface language: </span>
              <b>{languageName}</b>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(330px,.75fr)]">
            <section
              className="glass-card relative overflow-hidden p-5 sm:p-7"
              aria-label="Voice assistant"
            >
              <div className="absolute top-5 right-6 flex items-center gap-2 rounded-full bg-[#eff6ff] px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#1d4ed8]">
                <Radio className="size-3" />
                {session.isConnected ? 'CONNECTED' : 'READY'}
              </div>
              <div className="grid min-h-[410px] place-items-center py-5 text-center">
                <div className="relative grid place-items-center">
                  <div className="absolute size-[18rem] rounded-full border border-[#d8e5fc]" />
                  <div className="absolute size-[23rem] rounded-full border border-[#eaf0fb]" />
                  <motion.div
                    animate={session.isConnected ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    className="relative grid size-[240px] place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#e5efff_45%,#d6e5fc_100%)] shadow-[inset_0_1px_4px_white,0_22px_45px_rgba(37,99,235,.14)] sm:size-[290px]"
                  >
                    <AudioVisualizer
                      isChatOpen={false}
                      audioVisualizerType="radial"
                      audioVisualizerColor="#2563eb"
                      audioVisualizerRadialBarCount={32}
                      audioVisualizerRadialRadius={83}
                      className="size-[220px] sm:size-[275px]"
                    />
                    <div className="absolute grid size-16 place-items-center rounded-full bg-[#102654] text-white shadow-lg">
                      <Mic className="size-6" />
                    </div>
                  </motion.div>
                </div>
                <div className="relative mt-10">
                  <p className="text-xs font-bold tracking-[.16em] text-slate-500">
                    {agentState === 'thinking'
                      ? 'PROCESSING'
                      : session.isConnected
                        ? 'LISTENING'
                        : 'IDLE'}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {session.isConnected ? 'Voice channel is open' : 'Ready when you are'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {session.isConnected
                      ? 'Speak naturally. Your LiveKit conversation appears alongside.'
                      : 'Tap Start Conversation to open a LiveKit voice channel.'}
                  </p>
                </div>
              </div>
              {voiceError && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
                >
                  {voiceError}
                </div>
              )}
              <div className="relative flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  onClick={startConversation}
                  disabled={session.isConnected || isStarting}
                  className="h-12 rounded-xl bg-[#102654] px-6 text-sm font-bold hover:bg-[#1d3b7a]"
                >
                  <Mic className="size-4" />
                  {isStarting
                    ? 'Opening channel…'
                    : session.isConnected
                      ? 'Conversation Active'
                      : appConfig.startButtonText}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => session.end()}
                  disabled={!session.isConnected}
                  className="h-12 rounded-xl border-[#dce4f1] px-6 text-sm font-bold"
                >
                  <PhoneOff className="size-4" />
                  End Call
                </Button>
              </div>
            </section>

            <aside
              className="glass-card flex min-h-[540px] flex-col overflow-hidden"
              aria-label="Live conversation transcript"
            >
              <div className="border-b border-[#e5ecf7] p-5">
                <p className="text-[10px] font-bold tracking-[.16em] text-[#218455]">
                  LIVE CONVERSATION
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Transcript</h2>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    <ShieldCheck className="size-3.5 text-[#218455]" />
                    SESSION MESSAGES
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <label className="relative flex-1">
                    <Search className="absolute top-2.5 left-3 size-3.5 text-slate-400" />
                    <input
                      value={transcriptSearch}
                      onChange={(event) => setTranscriptSearch(event.target.value)}
                      className="h-9 w-full rounded-lg border border-[#dce4f1] bg-white pr-3 pl-8 text-xs outline-none focus:border-[#2563eb] dark:bg-slate-900"
                      placeholder="Search transcript"
                      aria-label="Search transcript"
                    />
                  </label>
                  <button
                    onClick={() => setTranscriptSearch('')}
                    aria-label="Clear transcript search"
                    className="grid size-9 place-items-center rounded-lg border border-[#dce4f1] hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <X className="size-4" />
                  </button>
                  <button
                    onClick={() =>
                      setVoiceError(
                        'Transcript export is available once a LiveKit conversation has messages.'
                      )
                    }
                    aria-label="Export transcript"
                    className="grid size-9 place-items-center rounded-lg border border-[#dce4f1] hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <Download className="size-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {displayedMessages.length === 0 ? (
                  <div className="flex h-full min-h-72 flex-col items-center justify-center text-center">
                    <div className="grid size-12 place-items-center rounded-2xl bg-[#eaf2ff] text-[#1d4ed8]">
                      <Sparkles className="size-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold">Namaste! I am AapdaMitra.</p>
                    <p className="mt-1 max-w-[260px] text-xs leading-5 text-slate-500">
                      How can I assist you right now? Start the live conversation to show real
                      session messages here.
                    </p>
                    <span className="mt-4 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                      WELCOME STATE
                    </span>
                  </div>
                ) : (
                  displayedMessages.map((item) => (
                    <div
                      key={item.id}
                      className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-5 ${item.from?.isLocal ? 'ml-auto bg-[#102654] text-white' : 'bg-[#f0f5ff] text-[#17356d]'}`}
                    >
                      <b className="mb-1 block text-[10px] tracking-wide opacity-65">
                        {item.from?.isLocal ? 'YOU' : 'AAPDAMITRA'}
                      </b>
                      {item.message}
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-[#e5ecf7] bg-[#fbfcff] px-5 py-3 text-[10px] leading-4 text-slate-500 dark:bg-slate-900">
                Transcript content is displayed from the active LiveKit session. No conversation is
                stored by this demo interface.
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[.16em] text-[#ee7f28]">GET HELP FAST</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">What is happening?</h2>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block">
              Choose a situation for immediate safety guidance
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => chooseDisaster(action.title)}
                  className={`group rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${selectedDisaster === action.title ? 'border-[#9ebcf1] bg-[#eef5ff] shadow-sm' : 'border-[#dce4f1] bg-white/80 hover:border-[#b8cbe9] dark:bg-slate-900'}`}
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-[#f3f7ff] text-[#1d4ed8] group-hover:bg-[#102654] group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <b className="mt-4 block text-sm">{action.title}</b>
                  <small className="mt-1 block text-xs leading-4 text-slate-500">
                    {action.description}
                  </small>
                </button>
              );
            })}
          </div>
        </section>

        <section
          id="guidance"
          className="mx-auto grid max-w-[1440px] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.25fr_.75fr] lg:px-10"
        >
          <article className="glass-card overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5ecf7] p-6">
              <div>
                <p className="text-[10px] font-bold tracking-[.16em] text-[#ee7f28]">
                  SAFETY GUIDANCE
                </p>
                <h2 className="mt-1 text-2xl font-semibold">{selectedDisaster} response</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {currentGuide.summary}
                </p>
              </div>
              <CircleHelp className="size-7 text-[#1d4ed8]" />
            </div>
            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold tracking-wide text-[#218455]">DO NOW</p>
                <ol className="mt-3 space-y-3">
                  {currentGuide.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-5">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#e8f7ef] text-[10px] font-bold text-[#218455]">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-orange-800">
                  <AlertTriangle className="size-4" />
                  AVOID
                </p>
                <p className="mt-3 text-sm leading-5 text-orange-900">{currentGuide.avoid}</p>
                <a
                  href="tel:112"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#102654] underline underline-offset-4"
                >
                  Call emergency services <ChevronRight className="size-3.5" />
                </a>
              </div>
            </div>
          </article>
          <article className="relative overflow-hidden rounded-2xl bg-[#102654] p-6 text-white shadow-[0_16px_35px_rgba(16,38,84,.2)]">
            <div
              aria-hidden
              className="absolute -top-12 -right-12 size-48 rounded-full border-[28px] border-white/5"
            />
            <p className="relative text-[10px] font-bold tracking-[.16em] text-orange-200">
              EMERGENCY SOS
            </p>
            <h2 className="relative mt-2 text-2xl font-semibold">Request urgent assistance</h2>
            <p className="relative mt-3 max-w-md text-sm leading-6 text-blue-100">
              Prepare an emergency assistance request with your consent. This demo does not contact
              authorities.
            </p>
            <div className="relative mt-6 flex items-center justify-between rounded-xl bg-white/10 p-3">
              <span className="text-xs text-blue-100">Alert status</span>
              {sosState ? (
                <StatePill state={sosState} />
              ) : (
                <span className="text-xs font-bold text-orange-200">NOT STARTED</span>
              )}
            </div>
            <button
              onClick={() => setSosOpen(true)}
              className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ee7f28] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#d96c17]"
            >
              <Siren className="size-5" />
              Trigger Demo SOS
            </button>
            <p className="relative mt-3 text-center text-[10px] text-blue-200">
              Demo Mode — No real emergency alert has been sent.
            </p>
          </article>
        </section>

        <section
          id="nearby"
          className="mx-auto grid max-w-[1440px] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-10"
        >
          <article className="glass-card p-6">
            <p className="text-[10px] font-bold tracking-[.16em] text-[#218455]">
              LOCATION ASSISTANCE
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Nearby Help</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Use your device location to personalise help suggestions. This interface will never
              put private coordinates in a shareable alert.
            </p>
            <div className="mt-5 rounded-xl border border-[#dce4f1] bg-[#f9fbff] p-4 dark:bg-slate-900">
              <p className="flex gap-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                <LocateFixed className="mt-0.5 size-4 shrink-0 text-[#1d4ed8]" />
                {locationStatus}
              </p>
              {location && (
                <p className="mt-3 rounded-lg bg-white p-2 font-mono text-[11px] text-[#102654] shadow-sm dark:bg-slate-950 dark:text-slate-100">
                  {location}
                </p>
              )}
            </div>
            <Button
              onClick={requestLocation}
              variant="outline"
              className="mt-5 h-11 rounded-xl border-[#b9cae6] font-bold"
            >
              <MapPin className="size-4" />
              Share location for this device
            </Button>
          </article>
          <article className="glass-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e5ecf7] p-5">
              <div>
                <p className="text-[10px] font-bold tracking-[.16em] text-[#1d4ed8]">
                  DEMO LOCATIONS
                </p>
                <h2 className="mt-1 text-xl font-semibold">Help near you</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                MOCK DATA
              </span>
            </div>
            <div className="divide-y divide-[#e5ecf7]">
              {nearbyHelp.map((place) => {
                const Icon = place.icon;
                return (
                  <div key={place.name} className="flex items-center gap-4 p-4">
                    <div className="grid size-10 place-items-center rounded-xl bg-[#eff6ff] text-[#1d4ed8]">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{place.name}</p>
                      <p className="text-xs text-slate-500">
                        {place.kind} · {place.distance}
                      </p>
                    </div>
                    <button className="rounded-lg border border-[#dce4f1] px-3 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900">
                      Directions
                    </button>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
          <article className="overflow-hidden rounded-2xl border border-[#d8e4f4] bg-[linear-gradient(115deg,#f5f9ff,#fffdf8)] p-6 dark:bg-slate-900">
            <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <p className="text-[10px] font-bold tracking-[.16em] text-[#ee7f28]">
                  COMMUNITY SAFETY
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Share Safety Alert</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Create a privacy-safe, clearly labelled safety card. It contains general area
                  guidance only—never your GPS or personal information.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button onClick={copyAlert} className="rounded-xl bg-[#102654] font-bold">
                    <Copy className="size-4" />
                    {alertCopied ? 'Copied!' : 'Copy Alert'}
                  </Button>
                  <Button
                    onClick={() =>
                      setVoiceError(
                        'Native share is available on supported devices after you copy the demo safety alert.'
                      )
                    }
                    variant="outline"
                    className="rounded-xl font-bold"
                  >
                    <Send className="size-4" />
                    Share
                  </Button>
                  <Button
                    onClick={() =>
                      setVoiceError(
                        'Safety Card generation is represented by this accessible, copyable demo card.'
                      )
                    }
                    variant="outline"
                    className="rounded-xl font-bold"
                  >
                    <Landmark className="size-4" />
                    Generate Safety Card
                  </Button>
                </div>
              </div>
              <pre className="rounded-xl border border-[#dce4f1] bg-white p-4 font-mono text-[11px] leading-5 whitespace-pre-wrap text-slate-600 shadow-sm dark:bg-slate-950 dark:text-slate-300">
                {generatedAlert}
              </pre>
            </div>
          </article>
        </section>

        <section id="analytics" className="mx-auto max-w-[1440px] px-4 pt-6 pb-12 sm:px-6 lg:px-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[.16em] text-[#1d4ed8]">
                OPERATIONS OVERVIEW
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Community response analytics</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500">
              DEMO / MOCK ANALYTICS
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Emergency Requests', '248', '+12.5%'],
              ['Active Incidents', '08', 'Monitoring'],
              ['People Assisted', '1,842', '+18.2%'],
              ['Community Reach', '28.6K', 'Across 5 languages'],
            ].map(([label, value, detail]) => (
              <article key={label} className="glass-card p-5">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
                <p className="mt-2 text-[11px] font-bold text-[#218455]">{detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
            <article className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Emergency requests</h3>
                  <p className="mt-1 text-xs text-slate-500">Last seven days · demo data</p>
                </div>
                <BarChart3 className="size-5 text-[#1d4ed8]" />
              </div>
              <div className="mt-8 flex h-40 items-end justify-between gap-2">
                {[35, 52, 40, 75, 58, 89, 72].map((height, index) => (
                  <div key={height} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      style={{ height: `${height}%` }}
                      className="w-full max-w-10 rounded-t-md bg-[linear-gradient(180deg,#5f93ee,#1f58ba)]"
                    />
                    <span className="text-[10px] text-slate-400">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </article>
            <article className="glass-card p-6">
              <h3 className="font-semibold">Incident mix</h3>
              <div className="mt-5 space-y-4">
                {[
                  ['Flood', '42', 'bg-[#ee993c]'],
                  ['Medical', '26', 'bg-[#e44d57]'],
                  ['Fire', '18', 'bg-[#f26f36]'],
                  ['Other', '14', 'bg-[#218455]'],
                ].map(([label, value, color]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{label}</span>
                      <b>{value}%</b>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>

      {sosOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-title"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-600">
                <Siren className="size-5" />
              </div>
              <button
                onClick={() => setSosOpen(false)}
                aria-label="Close emergency SOS confirmation"
              >
                <X className="size-5" />
              </button>
            </div>
            <h2 id="sos-title" className="mt-4 text-xl font-semibold">
              Prepare emergency assistance request?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              This will request your location permission and create a local demo request with
              timestamp. It will not contact emergency services or authorities.
            </p>
            <div className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              <b>Demo Mode:</b> You must still call{' '}
              <a href="tel:112" className="font-bold underline">
                112
              </a>{' '}
              for a real emergency.
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSosOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={confirmSos} className="rounded-xl bg-red-600 hover:bg-red-700">
                <Check className="size-4" />
                Prepare Demo SOS
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
