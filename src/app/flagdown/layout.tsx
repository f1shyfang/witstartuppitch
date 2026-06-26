import Link from "next/link";
import "./flagdown.css";

const navItems = [
  { href: "/flagdown/dashboard", label: "Command centre" },
  { href: "/flagdown/lifeguard", label: "Lifeguard" },
];

export default function FlagdownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flagdown-app min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--fd-border)] bg-[var(--fd-bg)]/92 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <span
              className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--fd-accent)] text-[var(--fd-accent-ink)] transition-transform group-hover:scale-[1.03]"
              aria-hidden
            >
              <FlagIcon className="h-4 w-4" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-[var(--fd-ink)]">
                Flag<span className="text-[var(--fd-accent)]">Down</span>
              </span>
              <span className="text-xs text-[var(--fd-muted)]">
                Northern Beaches Council
              </span>
            </span>
          </Link>
          <nav
            className="flex items-center gap-1 text-sm"
            aria-label="FlagDown navigation"
          >
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-[var(--fd-muted)] transition-colors hover:bg-[var(--fd-surface)] hover:text-[var(--fd-ink)]"
            >
              Home
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-[var(--fd-ink)]/85 transition-colors hover:bg-[var(--fd-surface)] hover:text-[var(--fd-accent)]"
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
