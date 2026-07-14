import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Match",
};

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Match</h1>
      <p className="text-muted-foreground font-mono text-sm">{id}</p>

      {/* Board placeholder — will be replaced with the real board component */}
      <div className="w-[480px] h-[480px] rounded-lg border border-border bg-card flex items-center justify-center">
        <span className="text-muted-foreground">Board will render here</span>
      </div>
    </main>
  );
}
