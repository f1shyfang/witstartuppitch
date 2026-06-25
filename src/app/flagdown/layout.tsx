import Link from "next/link";

const navItems = [
  { href: "/flagdown/dashboard", label: "Dashboard" },
  { href: "/flagdown/lifeguard", label: "Lifeguard" },
];

export default function FlagdownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/" className="group flex items-center gap-2.5">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-slate-950 shadow-[0_0_18px_-2px_rgba(245,158,11,0.6)] transition-transform group-hover:scale-105"
              aria-hidden
            >
              <FlagIcon className="h-4 w-4" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-sans text-sm font-semibold tracking-tight text-slate-100">
                Flag<span className="text-amber-400">Down</span>
              </span>
              <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Northern Beaches Council
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 font-sans text-sm">
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-100"
            >
              Home
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-slate-300 transition-colors hover:bg-slate-900 hover:text-amber-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 21V4" />
      <path d="M4 4h10l-2 4 2 4H4" />
    </svg>
  );
}
