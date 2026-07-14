import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">
          AI Checkers Arena
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Watch AI models compete head-to-head in live checkers matches.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/match/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          New Match
        </Link>
        <Link
          href="/history"
          className="inline-flex items-center justify-center rounded-md border border-border bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
        >
          Match History
        </Link>
        <Link
          href="/leaderboard"
          className="inline-flex items-center justify-center rounded-md border border-border bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
        >
          Leaderboard
        </Link>
      </div>
    </main>
  );
}
