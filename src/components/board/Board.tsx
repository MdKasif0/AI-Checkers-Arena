"use client";

import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Board as EngineBoard, Move, rowColToSq } from "@/lib/engine";
import { usePieces } from "./usePieces";
import { Piece } from "./Piece";

interface BoardProps {
  board: EngineBoard;
  lastMove: Move | null;
  legalMoves: Move[];
}

export function Board({ board, lastMove }: BoardProps) {
  const pieces = usePieces(board, lastMove);

  // Determine squares to highlight (e.g., from and to of lastMove)
  const lastMoveSquares = useMemo(() => {
    if (!lastMove) return new Set<number>();
    const s = new Set<number>();
    s.add(lastMove.from);
    s.add(lastMove.path[lastMove.path.length - 1]);
    return s;
  }, [lastMove]);

  // Generate the 100 cells of the 10x10 grid
  const cells = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const isPlayable = (row + col) % 2 !== 0;
      const sq = rowColToSq(row, col);
      
      const isLastMoveSq = sq ? lastMoveSquares.has(sq) : false;
      
      cells.push(
        <div
          key={`${row}-${col}`}
          className={`
            relative w-full h-full flex items-start justify-end p-1
            ${isPlayable ? "bg-[#b05f3c]" : "bg-[#ecd3a9]"}
            ${isLastMoveSq ? "after:absolute after:inset-0 after:bg-[#8bc34a]/30 after:border-4 after:border-[#8bc34a] after:pointer-events-none after:z-20" : ""}
          `}
        >
          {isPlayable && sq && (
            <span className="text-[0.65rem] text-black/30 font-mono leading-none select-none">
              {sq}
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square border-[16px] border-[#915e37] rounded-sm bg-[#5c351c] shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Inner shadow to give the wood frame depth */}
      <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none z-30" />
      
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
        {cells}
      </div>
      
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {pieces.map((p) => (
            <Piece key={p.id} piece={p} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
