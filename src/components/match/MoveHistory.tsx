"use client";

import { MoveDB } from "./types";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, List, ChevronDown } from "lucide-react";
import { Player } from "@/lib/engine";

interface MoveHistoryProps {
  moves: MoveDB[];
  currentPlyIndex: number | null;
  onSelectPly: (index: number | null) => void;
  isLive: boolean;
  activePlayer: Player;
}

export function MoveHistory({ moves, currentPlyIndex, onSelectPly, isLive, activePlayer }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState("2.0x Speed");

  useEffect(() => {
    if (scrollRef.current && isLive) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [moves.length, isLive]);

  const handlePrev = () => {
    if (currentPlyIndex === null) {
      onSelectPly(moves.length > 0 ? moves.length - 1 : null);
    } else if (currentPlyIndex > 0) {
      onSelectPly(currentPlyIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentPlyIndex !== null && currentPlyIndex < moves.length - 1) {
      onSelectPly(currentPlyIndex + 1);
    } else {
      onSelectPly(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrev}
            disabled={moves.length === 0 || currentPlyIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-charcoal-800 bg-charcoal-900 hover:bg-charcoal-800 text-charcoal-300 hover:text-amber-500 font-semibold text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Move
          </button>
          <button 
            onClick={handleNext}
            disabled={isLive || moves.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-charcoal-800 bg-charcoal-900 hover:bg-charcoal-800 text-charcoal-400 hover:text-charcoal-200 font-semibold text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            Next Move <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center Indicator */}
        <div className="px-6 py-2 rounded-full border border-amber-500/20 bg-charcoal-900 text-charcoal-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          <span>{activePlayer} MOVE • THINKING...</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-amber-500/30 bg-charcoal-900 hover:border-amber-500/50 text-amber-500 font-semibold text-sm transition-all shadow-[0_0_10px_rgba(212,175,55,0.1)]">
            <Play className="w-4 h-4 fill-amber-500" /> Auto Play
          </button>
          
          <div className="relative group">
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-charcoal-800 bg-charcoal-900 hover:bg-charcoal-800 text-charcoal-300 font-semibold text-sm transition-colors">
              {speed} <ChevronDown className="w-4 h-4 text-charcoal-500" />
            </button>
          </div>
        </div>

      </div>

      {/* Move History Panel */}
      <div className="w-full flex items-center gap-4 p-4 rounded-xl border border-charcoal-800 bg-charcoal-900/40 backdrop-blur-md">
        
        <div className="flex items-center gap-2 text-charcoal-100 font-medium px-2 shrink-0">
          <List className="w-5 h-5 text-amber-500" />
          <span>Move History</span>
        </div>

        <div className="w-px h-8 bg-charcoal-800 shrink-0 mx-2" />

        <div 
          ref={scrollRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {moves.map((m, i) => {
            const isSelected = isLive ? i === moves.length - 1 : currentPlyIndex === i;
            const isWhite = m.player === "white";
            const fullMoveNum = Math.ceil(m.ply_number / 2);
            const prefix = isWhite ? `${fullMoveNum}.` : `${fullMoveNum}...`;
            
            return (
              <button
                key={m.id}
                onClick={() => onSelectPly(i)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all whitespace-nowrap flex-shrink-0 ${
                  isSelected
                    ? "border-amber-500 bg-charcoal-900 text-amber-500 shadow-[inset_0_0_10px_rgba(212,175,55,0.1)]"
                    : "border-transparent hover:border-charcoal-700 bg-transparent text-charcoal-400 hover:text-charcoal-200"
                }`}
              >
                <span className="font-mono text-sm font-semibold opacity-70 w-8 text-right shrink-0">{prefix}</span>
                <span className="font-mono text-sm font-bold tracking-wide">{m.notation}</span>
              </button>
            );
          })}
        </div>

        {/* Mini Board Placeholder */}
        <div className="shrink-0 w-20 h-20 ml-auto border border-charcoal-800 rounded flex items-center justify-center bg-charcoal-950 overflow-hidden relative opacity-80 mix-blend-screen">
           <img src="/hero-board.png" alt="mini board" className="w-[120%] h-[120%] object-cover opacity-60" />
        </div>
        
      </div>
    </div>
  );
}
