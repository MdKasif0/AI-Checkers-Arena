import { MoveDB } from "./types";
import { GameState, Player } from "@/lib/engine";

interface ModelPanelProps {
  player: Player;
  modelName: string;
  moves: MoveDB[];
  currentState: GameState;
}

export function ModelPanel({ player, modelName, moves, currentState }: ModelPanelProps) {
  const playerMoves = moves.filter((m) => m.player === player);
  
  const totalLatency = playerMoves.reduce((sum, m) => sum + m.latency_ms, 0);
  const totalTokens = playerMoves.reduce((sum, m) => sum + m.tokens_used, 0);
  const illegalAttempts = playerMoves.filter((m) => m.was_illegal_attempt).length;

  const avgLatency = playerMoves.length ? Math.round(totalLatency / playerMoves.length) : 0;
  const avgTokens = playerMoves.length ? Math.round(totalTokens / playerMoves.length) : 0;

  let pieces = 0;
  let kings = 0;
  currentState.board.forEach((piece) => {
    if (piece.player === player) {
      pieces++;
      if (piece.kind === "king") kings++;
    }
  });

  const isWhite = player === "white";

  return (
    <div className="w-full flex flex-col gap-6 p-6 rounded-xl border border-charcoal-800 bg-charcoal-900/50 backdrop-blur-sm shadow-xl">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 flex-shrink-0 rounded-full border-2 flex items-center justify-center font-bold text-xl shadow-inner ${isWhite ? "bg-amber-500 border-amber-300 text-amber-950" : "bg-charcoal-800 border-charcoal-950 text-charcoal-300"}`}>
          {player === "white" ? "W" : "B"}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-display font-semibold text-charcoal-100 truncate">{modelName}</h2>
          <p className="text-sm text-charcoal-400 capitalize">{player}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Pieces" value={pieces} />
        <StatBox label="Kings" value={kings} />
        <StatBox label="Avg Latency" value={`${avgLatency}ms`} />
        <StatBox label="Avg Tokens" value={avgTokens} />
        <StatBox label="Illegal Attempts" value={illegalAttempts} highlight={illegalAttempts > 0} />
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`flex flex-col p-3 rounded-lg border shadow-inner ${highlight ? "border-amber-500/50 bg-amber-500/10 text-amber-500" : "border-charcoal-800 bg-charcoal-950 text-charcoal-300"}`}>
      <span className="text-[0.65rem] uppercase tracking-wider opacity-60 mb-1">{label}</span>
      <span className="text-lg font-mono font-medium leading-none">{value}</span>
    </div>
  );
}
