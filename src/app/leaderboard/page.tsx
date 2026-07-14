import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export default function LeaderboardPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
      <p className="text-muted-foreground">
        Model rankings will appear here.
      </p>
    </main>
  );
}
