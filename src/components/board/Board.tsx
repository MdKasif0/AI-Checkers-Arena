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

export function Board({ board, lastMove, legalMoves }: BoardProps) {
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
            ${isPlayable ? "bg-charcoal-900" : "bg-charcoal-700"}
            ${isLastMoveSq ? "after:absolute after:inset-0 after:bg-amber-500/20 after:pointer-events-none" : ""}
          `}
        >
          {isPlayable && sq && (
            <span className="text-[0.65rem] text-charcoal-500 font-mono leading-none select-none">
              {sq}
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square border-4 border-charcoal-950 rounded-md overflow-hidden bg-charcoal-950 shadow-2xl">
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
