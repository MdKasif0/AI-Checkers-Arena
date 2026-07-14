import { MoveDB } from "./types";
import { GameState, Player } from "@/lib/engine";
import { ShieldAlert, Activity, Crown, Timer, Cpu, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModelPanelProps {
  player: Player;
  modelName: string;
  moves: MoveDB[];
  currentState: GameState;
  isThinking: boolean;
  currentMoveDb?: MoveDB;
}

export function ModelPanel({ player, modelName, moves, currentState, isThinking, currentMoveDb }: ModelPanelProps) {
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
    <div className={`w-full flex flex-col gap-4 p-5 rounded-2xl border bg-charcoal-900/60 backdrop-blur-xl shadow-2xl transition-all duration-500 relative overflow-hidden ${
      isThinking ? "border-amber-500/50 shadow-[0_0_30px_rgba(212,175,55,0.15)]" : "border-charcoal-800"
    }`}>
      
      {/* Active turn glow */}
      <AnimatePresence>
        {isThinking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-2 bg-gradient-to-b from-amber-500/10 to-transparent blur-xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-[60px] h-[60px] flex-shrink-0 rounded-full flex items-center justify-center font-display font-bold text-2xl shadow-inner border-2 ${
          isWhite 
            ? "bg-gradient-to-b from-[#E5C76B] to-[#B88917] border-[#D4AF37] text-[#1a1505]" 
            : "bg-gradient-to-b from-[#2d2d2d] to-[#111111] border-[#333333] text-charcoal-300"
        }`}>
          {isWhite ? "W" : "B"}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[1.1rem] font-medium text-charcoal-100 truncate mb-1">{modelName}</h2>
          <div className="flex items-center justify-between">
             <p className="text-[0.7rem] uppercase tracking-wider text-charcoal-400 font-semibold">{player}</p>
             <div className="px-2 py-0.5 rounded-full bg-charcoal-950 border border-charcoal-800 text-[0.6rem] uppercase tracking-widest text-charcoal-500">
               OpenRouter
             </div>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-charcoal-800 to-transparent my-1" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <StatBox label="Pieces" value={pieces} icon={<PawnIcon />} />
        <StatBox label="Kings" value={kings} icon={<Crown className="w-4 h-4" />} />
        <StatBox label="Avg Latency" value={`${avgLatency}ms`} icon={<Timer className="w-4 h-4" />} />
        <StatBox label="Avg Tokens" value={avgTokens} icon={<Activity className="w-4 h-4" />} />
      </div>

      {/* Illegal Attempts */}
      <div className="w-full relative z-10">
        <StatBox 
          label="Illegal Attempts" 
          value={illegalAttempts} 
          icon={<ShieldAlert className={`w-4 h-4 ${illegalAttempts > 0 ? "text-red-500" : "text-charcoal-500"}`} />} 
          fullWidth
          highlight={illegalAttempts > 0}
        />
      </div>

      {/* AI Thinking Panel */}
      <div className="w-full relative z-10 mt-2 p-4 rounded-xl border border-charcoal-800 bg-charcoal-950/80 shadow-inner min-h-[90px] flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className={`w-4 h-4 ${isThinking ? "text-amber-500 animate-pulse" : "text-charcoal-500"}`} />
          <span className={`text-[0.65rem] font-bold uppercase tracking-[0.2em] ${isThinking ? "text-amber-500" : "text-charcoal-500"}`}>
            AI Thinking
          </span>
        </div>

        {isThinking ? (
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between text-[0.65rem] text-charcoal-400">
              <span>Depth: High</span>
            </div>
            <div className="w-full h-1 bg-charcoal-800 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div className="text-[0.65rem] text-charcoal-500 mt-1 italic">
              Calculating response...
            </div>
          </div>
        ) : (
          <div className="text-sm text-charcoal-300 italic font-display">
            {currentMoveDb && currentMoveDb.player === player && currentMoveDb.reasoning_text ? (
              <span className="line-clamp-2">"{currentMoveDb.reasoning_text}"</span>
            ) : (
              <span className="opacity-50">Waiting for turn...</span>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

function StatBox({ label, value, icon, fullWidth = false, highlight = false }: { label: string; value: string | number; icon: React.ReactNode; fullWidth?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex flex-col p-3 rounded-xl border ${highlight ? "border-red-900/50 bg-red-950/20 text-red-400" : "border-charcoal-800 bg-charcoal-900/50 text-charcoal-200"} ${fullWidth ? "w-full" : ""}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[0.6rem] uppercase tracking-widest text-charcoal-500 font-semibold">{label}</span>
        <div className="text-charcoal-600">{icon}</div>
      </div>
      <span className="text-2xl font-display font-medium leading-none">{value}</span>
    </div>
  );
}

function PawnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v6"/><path d="M12 8c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4Z"/><path d="M7 16h10"/><path d="M6 22h12"/><path d="m8 22 1-6"/><path d="m16 22-1-6"/>
    </svg>
  );
}
