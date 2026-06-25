import Image from "next/image";
import Link from "next/link";

const workflow = [
  {
    step: "1",
    title: "Threat signal arrives",
    description:
      "Computer vision, acoustic shark tags, or BOM weather alerts — heterogeneous inputs, one ingest layer.",
    icon: "signal",
  },
  {
    step: "2",
    title: "Router decides in seconds",
    description:
      "AI classifies threat level, beach context, and the channel sequence — lifeguard, flags, PA, swimmer push.",
    icon: "route",
  },
  {
    step: "3",
    title: "Actors coordinate",
    description:
      "Patrolled beaches route through lifeguards. Unpatrolled stretches hit council PA directly. All under 60 seconds.",
    icon: "relay",
  },
];

const strengths = [
  {
    title: "Patrolled beach handoff",
    description:
      "Shark tag at Manly South Steyne → lifeguard PWA buzzes → flag downgrade → swimmer push. Minutes become seconds.",
  },
  {
    title: "Unpatrolled blind spots covered",
    description:
      "Collins Flat has no SLS patrol. Same threat router skips lifeguard and fires council PA plus push — no dead zone.",
  },
  {
    title: "Multi-threat escalation",
    description:
      "When BOM cyclone watch layers on an active shark alert, one escalation path coordinates every channel — not three separate apps.",
  },
];

const routes = [
  {
    title: "Council command centre",
    description: "Live map, threat pins, timeline feed, and demo inject controls.",
    href: "/flagdown/dashboard",
    cta: "Open dashboard",
    icon: "dashboard",
  },
  {
    title: "Lifeguard PWA",
    description: "Mobile alert card — acknowledge, escalate, or mark false alarm.",
    href: "/flagdown/lifeguard",
    cta: "Open lifeguard view",
    icon: "lifeguard",
  },
];

function WorkflowIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (name) {
    case "signal":
      return (
        <svg {...common}>
          <path d="M3 12h4l3-7 4 14 3-7h4" />
        </svg>
      );
    case "route":
      return (
        <svg {...common}>
          <circle cx="6" cy="19" r="2.5" />
          <circle cx="18" cy="5" r="2.5" />
          <path d="M8.5 19H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
        </svg>
      );
    case "relay":
      return (
        <svg {...common}>
          <path d="M12 3v6" />
          <path d="M7 9h10l-2 4H9z" />
          <path d="M9 13v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5" />
        </svg>
      );
    default:
      return null;
  }
}

function RouteIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
    "aria-hidden": true,
  };
  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "lifeguard":
      return (
        <svg {...common}>
          <path d="M3 13a9 9 0 1 1 18 0" />
          <path d="M12 13l4-4" />
          <path d="M3 13h3M18 13h3M12 22v-3" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="font-sans text-lg font-semibold tracking-tight text-slate-100"
          >
            Flag<span className="text-amber-400">Down</span>
          </Link>
          <nav className="flex items-center gap-5 font-sans text-sm">
            <a
              href="#workflow"
              className="hidden text-slate-400 transition-colors hover:text-slate-100 sm:inline"
            >
              How it works
            </a>
            <a
              href="#features"
              className="hidden text-slate-400 transition-colors hover:text-slate-100 sm:inline"
            >
              Why councils need it
            </a>
            <Link
              href="/flagdown/lifeguard"
              className="text-slate-400 transition-colors hover:text-slate-100"
            >
              Lifeguard
            </Link>
            <Link
              href="/flagdown/dashboard"
              className="rounded-full bg-amber-500 px-4 py-2 font-medium text-slate-950 transition-colors hover:bg-amber-400"
            >
              Command centre
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -right-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-amber-500/10 blur-3xl"
            aria-hidden
          />
          <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16 lg:pb-24 lg:pt-20">
            <div className="space-y-8">
              <p className="animate-rise font-sans text-sm font-medium text-amber-400/90">
                Northern Beaches Council · Beach safety coordination
              </p>
              <h1 className="animate-rise-delay-1 max-w-[16ch] font-sans text-[clamp(2.5rem,5.5vw,4rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
                The 60-second beach handoff.
              </h1>
              <p className="animate-rise-delay-2 max-w-[44ch] text-lg leading-relaxed text-slate-400">
                Green flag. Tagged shark 400m out. Three agencies. Zero
                coordinated response — until now. FlagDown routes threat signals
                to the right actors through the right channels, based on beach
                context and escalating threat level.
              </p>
              <div className="flex flex-wrap items-center gap-3 font-sans">
                <Link
                  href="/flagdown/dashboard"
                  className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
                >
                  Open command centre
                </Link>
                <a
                  href="#workflow"
                  className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-900"
                >
                  See how it works
                </a>
              </div>
              <p className="max-w-md font-sans text-sm text-slate-500">
                Threat router · Supabase Realtime · Council-first SaaS
              </p>
            </div>

            <div
              id="access"
              className="animate-rise-delay-2 scroll-mt-24 space-y-4 rounded-[1.25rem] border border-slate-800 bg-slate-900/60 p-6 sm:p-8"
            >
              <p className="font-sans text-sm font-medium text-amber-400">
                Demo access
              </p>
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="group flex items-start gap-4 rounded-xl border border-slate-800 bg-slate-950/80 p-5 transition-colors hover:border-amber-500/40 hover:bg-slate-900"
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-amber-400 transition-colors group-hover:border-amber-500/50">
                    <RouteIcon name={route.icon} />
                  </span>
                  <span className="flex-1">
                    <h2 className="font-sans text-lg font-semibold text-slate-100">
                      {route.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {route.description}
                    </p>
                    <span className="mt-3 inline-block font-sans text-sm font-medium text-amber-400 transition-transform group-hover:translate-x-0.5">
                      {route.cta} →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-800 bg-slate-900/40">
          <div className="relative mx-auto max-w-6xl px-6 py-4">
            <div className="relative aspect-[21/9] min-h-[12rem] overflow-hidden rounded-xl sm:min-h-[16rem]">
              <Image
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
                alt="Aerial view of an Australian beach with surf and swimmers"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1152px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
              <blockquote className="absolute bottom-0 left-0 max-w-xl p-6 text-white sm:p-10">
                <p className="font-sans text-xl font-medium leading-snug sm:text-2xl">
                  &ldquo;Same threat. Different actors. One router.&rdquo;
                </p>
                <footer className="mt-3 font-sans text-sm text-white/75">
                  Patrolled beach: lifeguard alerted in 11 seconds. Unpatrolled
                  beach 2km south: council siren — no lifeguard in the loop.
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="mb-14 max-w-2xl">
              <h2 className="font-sans text-3xl font-semibold tracking-tight sm:text-4xl">
                Coordination decisions at the speed of data
              </h2>
              <p className="mt-4 text-lg text-slate-400">
                Detection is an input. Council dashboard, lifeguard PWA, flags,
                PA, and push notifications are outputs. FlagDown owns the
                handoff.
              </p>
            </div>
            <ol className="grid gap-10 lg:grid-cols-3 lg:gap-8">
              {workflow.map((item) => (
                <li key={item.step} className="group relative">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-amber-400 transition-colors group-hover:border-amber-500/50 group-hover:text-amber-300">
                      <WorkflowIcon name={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="font-sans text-sm font-medium tabular-nums text-slate-600">
                      {String(item.step).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 font-sans text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-slate-400">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-24 border-t border-slate-800 bg-slate-900/40"
        >
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <h2 className="mb-12 max-w-xl font-sans text-3xl font-semibold tracking-tight sm:text-4xl">
              Three wedges, one coordination layer
            </h2>
            <ul className="divide-y divide-slate-800">
              {strengths.map((item, index) => (
                <li
                  key={item.title}
                  className="grid gap-4 py-8 sm:grid-cols-[7rem_1fr] sm:items-start sm:gap-10"
                >
                  <span className="font-sans text-sm font-medium tabular-nums text-amber-400/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-sans text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="demo" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
            <div className="grid gap-10 rounded-[1.25rem] border border-slate-800 bg-amber-500/10 px-8 py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:px-14 lg:py-14">
              <div>
                <h2 className="font-sans text-3xl font-semibold tracking-tight sm:text-4xl">
                  Run the 60-second demo
                </h2>
                <p className="mt-4 max-w-xl text-lg text-slate-300">
                  Inject a shark tag at Collins Flat, acknowledge on the
                  lifeguard PWA, then layer a BOM cyclone watch. Watch every
                  channel orchestrate from the council command centre.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/flagdown/dashboard"
                  className="inline-flex justify-center rounded-full bg-amber-500 px-8 py-3.5 font-sans text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
                >
                  Open command centre
                </Link>
                <Link
                  href="/flagdown/lifeguard"
                  className="inline-flex justify-center rounded-full border border-slate-600 px-8 py-3.5 font-sans text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-900"
                >
                  Lifeguard PWA
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center font-sans text-sm text-slate-500 sm:flex-row sm:text-left">
          <p>
            Flag<span className="text-amber-400/80">Down</span> · Northern
            Beaches Council pilot · The Coordination Problem
          </p>
          <div className="flex items-center gap-4">
            <Link href="/flagdown/dashboard" className="hover:text-amber-400">
              Command centre
            </Link>
            <Link href="/flagdown/lifeguard" className="hover:text-amber-400">
              Lifeguard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
