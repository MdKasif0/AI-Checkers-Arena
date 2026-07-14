import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match History",
};

export default function HistoryPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Match History</h1>
      <p className="text-muted-foreground">
        Past matches will appear here.
      </p>
    </main>
  );
}
