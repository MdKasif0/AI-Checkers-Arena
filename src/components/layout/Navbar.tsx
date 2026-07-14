import Link from "next/link";

export function Navbar() {
  return (
    <nav className="w-full bg-charcoal-950/80 backdrop-blur-md border-b border-charcoal-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-display font-bold text-amber-500 hover:text-amber-400 transition-colors">
          AI Checkers Arena
        </Link>
        <div className="flex items-center gap-6">
          <NavLink href="/" label="Arena" />
          <NavLink href="/history" label="History" />
          <NavLink href="/leaderboard" label="Leaderboard" />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm font-semibold uppercase tracking-wider text-charcoal-300 hover:text-white transition-colors">
      {label}
    </Link>
  );
}
