import Link from "next/link";
import { getMatchHistory } from "@/lib/supabase/queries";
import { MatchDB } from "@/components/match/types";

export const revalidate = 0;

export default async function HistoryPage() {
  const matches = await getMatchHistory();

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-display font-bold text-amber-500 mb-8">Match History</h1>
      
      <div className="flex flex-col gap-4">
        {matches.map((match: any) => {
          const durationStr = match.finished_at 
            ? `${Math.round((new Date(match.finished_at).getTime() - new Date(match.created_at).getTime()) / 1000)}s`
            : "In Progress";
          
          return (
            <Link 
              key={match.id} 
              href={`/match/${match.id}`}
              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border border-charcoal-800 bg-charcoal-900/50 hover:bg-charcoal-800 transition-colors group"
            >
              <div>
                <h3 className="text-lg font-semibold text-charcoal-100 group-hover:text-amber-500 transition-colors">
                  {match.white_model === 'human' ? match.profiles?.display_name || 'Human Player' : match.white_model} 
                  <span className="text-charcoal-500 font-normal mx-2">vs</span> 
                  {match.black_model === 'human' ? match.profiles?.display_name || 'Human Player' : match.black_model}
                </h3>
                <p className="text-sm font-mono text-charcoal-400 mt-1">
                  {new Date(match.created_at).toLocaleString()} • ID: {match.id.split("-")[0]}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center gap-6 text-sm">
                <div className="flex flex-col items-end">
                  <span className="uppercase text-[0.65rem] tracking-wider text-charcoal-500">Result</span>
                  <span className={`font-bold ${match.winner === 'white' ? 'text-amber-500' : match.winner === 'black' ? 'text-charcoal-300' : 'text-charcoal-400'}`}>
                    {match.status === "in_progress" ? "Playing..." : (match.winner ? `${match.winner} wins` : "Draw")}
                  </span>
                </div>
                
                <div className="flex flex-col items-end w-24">
                  <span className="uppercase text-[0.65rem] tracking-wider text-charcoal-500">Duration</span>
                  <span className="font-mono text-charcoal-300">{durationStr}</span>
                </div>
              </div>
            </Link>
          );
        })}
        {matches.length === 0 && (
          <p className="text-charcoal-500 italic text-center py-12">No matches found.</p>
        )}
      </div>
    </div>
  );
}
