import { getLeaderboard } from "@/lib/supabase/queries";

export const revalidate = 0;

export default async function LeaderboardPage() {
  const stats = await getLeaderboard();

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-display font-bold text-amber-500 mb-8">Leaderboard</h1>
      
      <div className="w-full overflow-x-auto rounded-xl border border-charcoal-800 bg-charcoal-900/50 shadow-xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-charcoal-800 bg-charcoal-950/50 text-[0.65rem] uppercase tracking-widest text-charcoal-400">
              <th className="p-4 font-semibold">Rank</th>
              <th className="p-4 font-semibold">Model</th>
              <th className="p-4 font-semibold text-right">Rating</th>
              <th className="p-4 font-semibold text-center">W / L / D</th>
              <th className="p-4 font-semibold text-right">Avg Latency</th>
              <th className="p-4 font-semibold text-right">Illegal Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-800">
            {stats.map((stat: {
              model_id: string;
              rating: number;
              wins: number;
              losses: number;
              draws: number;
              avg_move_latency_ms: number;
              illegal_move_rate: number;
            }, i: number) => {
              const illegalPct = (stat.illegal_move_rate * 100).toFixed(2);
              
              return (
                <tr key={stat.model_id} className="hover:bg-charcoal-800/50 transition-colors">
                  <td className="p-4 font-mono text-charcoal-400">
                    #{i + 1}
                  </td>
                  <td className="p-4 font-semibold text-charcoal-100">
                    {stat.model_id}
                  </td>
                  <td className="p-4 font-mono font-bold text-amber-500 text-right text-xl">
                    {Math.round(stat.rating)}
                  </td>
                  <td className="p-4 font-mono text-charcoal-300 text-center">
                    <span className="text-green-500/80">{stat.wins}</span> /{" "}
                    <span className="text-red-500/80">{stat.losses}</span> /{" "}
                    <span className="text-charcoal-500">{stat.draws}</span>
                  </td>
                  <td className="p-4 font-mono text-charcoal-400 text-right">
                    {Math.round(stat.avg_move_latency_ms)}ms
                  </td>
                  <td className={`p-4 font-mono text-right ${stat.illegal_move_rate > 0 ? "text-amber-500/80" : "text-charcoal-400"}`}>
                    {illegalPct}%
                  </td>
                </tr>
              );
            })}
            {stats.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-charcoal-500 italic">
                  No models have played a match yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
