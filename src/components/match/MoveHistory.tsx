import { MoveDB } from "./types";
import { useEffect, useRef } from "react";

interface MoveHistoryProps {
  moves: MoveDB[];
  currentPlyIndex: number | null;
  onSelectPly: (index: number | null) => void;
}

export function MoveHistory({ moves, currentPlyIndex, onSelectPly }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to end when new moves arrive and we are actively on LIVE
    if (scrollRef.current && currentPlyIndex === null) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [moves.length, currentPlyIndex]);

  return (
    <div className="w-full mt-6 bg-charcoal-900/30 border-y border-charcoal-800 p-4">
      <div className="max-w-5xl mx-auto flex items-center gap-4">
        <button
          onClick={() => onSelectPly(null)}
          className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors flex-shrink-0 ${
            currentPlyIndex === null 
              ? "bg-amber-500 text-amber-950" 
              : "bg-charcoal-800 text-charcoal-400 hover:bg-charcoal-700"
          }`}
        >
          LIVE
        </button>

        <div 
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}
        >
          {moves.map((m, i) => {
            const isSelected = currentPlyIndex === i;
            const isWhite = m.player === "white";
            return (
              <button
                key={m.id}
                onClick={() => onSelectPly(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all whitespace-nowrap flex-shrink-0 ${
                  isSelected
                    ? "bg-amber-500 text-amber-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                    : "bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700 hover:text-white"
                }`}
              >
                <span className="opacity-50 text-xs font-mono">{m.ply_number}.</span>
                <span className={`w-2 h-2 rounded-full ${isWhite ? (isSelected ? "bg-amber-950" : "bg-amber-500") : (isSelected ? "bg-charcoal-800" : "bg-charcoal-950")}`} />
                <span className="font-mono text-sm">{m.notation}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
