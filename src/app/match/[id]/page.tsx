import { notFound } from "next/navigation";
import { getMatchState } from "@/lib/supabase/queries";
import { MatchViewer } from "@/components/match/MatchViewer";

export const revalidate = 0; // Ensure fresh data on load

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params;
  
  if (!id) return notFound();

  try {
    const { match, moves } = await getMatchState(id);
    return <MatchViewer match={match} initialMoves={moves} />;
  } catch (error) {
    console.error("Failed to load match:", error);
    return notFound();
  }
}
