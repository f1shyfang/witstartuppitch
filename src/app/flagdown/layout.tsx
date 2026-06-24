import Link from "next/link";

export default function FlagdownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Northern Beaches Council
          </p>
          <h1 className="text-xl font-semibold">FlagDown</h1>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="text-slate-400 hover:text-amber-400">
            Home
          </Link>
          <Link href="/flagdown/dashboard" className="hover:text-amber-400">
            Dashboard
          </Link>
          <Link href="/flagdown/lifeguard" className="hover:text-amber-400">
            Lifeguard
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
