'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BellRing,
  House,
  LifeBuoy,
  LocateFixed,
  Menu,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

const navigation = [
  { href: '/', label: 'Home', icon: House },
  { href: '/assistant', label: 'AI Assistant', icon: Sparkles },
  { href: '/emergency', label: 'Emergency SOS', icon: Siren },
  { href: '/location', label: 'Live Location', icon: LocateFixed },
  { href: '/safety', label: 'Safety Center', icon: LifeBuoy },
  { href: '/alerts', label: 'Disaster Alerts', icon: BellRing },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings2 },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        viewBox="0 0 48 48"
        className="size-12 shrink-0 drop-shadow-[0_8px_14px_rgba(13,31,88,.2)]"
        aria-label="AapdaMitra logo"
        role="img"
      >
        <defs>
          <linearGradient id="mark-bg" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#132c75" />
            <stop offset="1" stopColor="#08113d" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#mark-bg)" />
        <path d="M10 14h28v7H10z" fill="#ff9933" />
        <path d="M10 21h28v7H10z" fill="#fff" />
        <path d="M10 28h28v7H10z" fill="#138808" />
        <circle cx="24" cy="24.5" r="4.4" fill="none" stroke="#163c8b" strokeWidth="1.4" />
        <circle cx="24" cy="24.5" r=".9" fill="#163c8b" />
        <path
          d="M24 20v9M19.6 24.5h8.8M20.9 21.4l6.2 6.2M27.1 21.4l-6.2 6.2"
          stroke="#163c8b"
          strokeWidth=".75"
        />
      </svg>
      <span>
        <b className="block text-lg leading-none tracking-tight text-[#0a1870] dark:text-slate-100">
          AapdaMitra AI
        </b>
        <small className="mt-1 block text-[10px] font-medium text-slate-500 dark:text-slate-400">
          AI Disaster Response Assistant
        </small>
      </span>
    </div>
  );
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fbff] text-[#09156b] dark:bg-[#081120] dark:text-[#e8f0ff]">
      <div
        aria-hidden
        className="chakra-watermark fixed top-32 left-[45%] -z-0 hidden size-[35rem] xl:block"
      />

      <header className="relative z-20 border-b border-[#e2e6f1] bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-7 dark:border-[#294466] dark:bg-[#0c182b]/85">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <Logo />
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/emergency"
              className="rounded-xl border border-[#ffc7c0] bg-[#fff5f4] px-4 py-2.5 text-sm font-bold text-[#b42318] transition hover:bg-[#ffe9e6] dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              <span className="mr-2">☎</span>Call 112
            </Link>
            <Link
              href="/analytics"
              className="rounded-xl border border-[#dfe3ee] bg-white px-4 py-2.5 text-sm font-bold transition hover:border-[#aeb8df] hover:bg-[#f7f9ff] dark:border-[#294466] dark:bg-[#101d32] dark:text-slate-200 dark:hover:bg-[#192b48]"
            >
              Analytics
            </Link>
            <span className="rounded-full border border-[#ffd9b1] bg-[linear-gradient(90deg,#fff5e9,#f1faef)] px-4 py-2 text-xs font-bold text-[#a64d00] dark:border-amber-900/50 dark:bg-[#1a2d4b] dark:text-amber-300">
              Independence Day Special
            </span>
            <Link
              href="/assistant"
              className="rounded-xl bg-[#080c78] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(8,12,120,.23)] transition hover:-translate-y-0.5 hover:bg-[#151a9c] dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Start Conversation
            </Link>
          </div>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-xl border border-[#dfe3ee] bg-white md:hidden dark:border-[#294466] dark:bg-[#101d32] dark:text-white"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-[#e2e6f1] bg-white/50 px-4 py-7 xl:block dark:border-[#294466] dark:bg-[#0c182b]/60">
          <nav aria-label="Primary navigation" className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition',
                    active
                      ? 'bg-[linear-gradient(90deg,#fff1df,#f0f9ee)] text-[#0a1870] shadow-sm dark:bg-none dark:bg-[#192f52] dark:text-white dark:border dark:border-[#2d4974]'
                      : 'text-slate-600 hover:bg-white hover:text-[#0a1870] dark:text-slate-300 dark:hover:bg-[#101d32] dark:hover:text-white'
                  )}
                >
                  <span
                    className={cn(
                      'grid size-8 place-items-center rounded-lg',
                      active
                        ? 'bg-[linear-gradient(135deg,#ff9933,#138808)] text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-[#edf2ff] group-hover:text-[#0a1870] dark:bg-[#162644] dark:text-slate-300 dark:group-hover:bg-[#1e3458] dark:group-hover:text-blue-300'
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#0a1870] p-3 text-xs text-white dark:bg-[#162644] dark:text-slate-200">
            <ShieldCheck className="size-4 text-[#ffbe70]" />
            Privacy-first assistance
          </div>
        </aside>

        {menuOpen && (
          <div className="absolute inset-x-0 top-0 z-30 border-b border-[#e2e6f1] bg-white p-4 shadow-xl xl:hidden dark:border-[#294466] dark:bg-[#0c182b]">
            <nav className="grid gap-1 sm:grid-cols-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    onClick={() => setMenuOpen(false)}
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold',
                      pathname === item.href
                        ? 'bg-[#eef6ef] text-[#0a1870] dark:bg-[#192f52] dark:text-white'
                        : 'text-slate-600 dark:text-slate-300'
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
        <section className="min-w-0 flex-1 px-4 py-6 sm:px-7 lg:px-9">{children}</section>
      </div>
    </div>
  );
}
