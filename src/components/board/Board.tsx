"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Board as EngineBoard, Move, rowColToSq, moveToNotation } from "@/lib/engine";
import { usePieces } from "./usePieces";
import { Piece } from "./Piece";

interface BoardProps {
  board: EngineBoard;
  lastMove: Move | null;
  legalMoves: Move[];
  isHumanTurn?: boolean;
  onHumanMove?: (notation: string) => void;
}

export function Board({ board, lastMove, legalMoves, isHumanTurn, onHumanMove }: BoardProps) {
  const pieces = usePieces(board, lastMove);
  
  const [selectedSq, setSelectedSq] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line
    setSelectedSq(null);
  }, [legalMoves]);

  const handleCellClick = (sq: number) => {
    if (!isHumanTurn) return;

    // Check if clicking a piece with valid moves
    const movesFromSq = legalMoves.filter(m => m.from === sq);
    if (movesFromSq.length > 0) {
      setSelectedSq(sq);
      return;
    }

    // Check if clicking a destination for the selected piece
    if (selectedSq) {
      const move = legalMoves.find(m => m.from === selectedSq && m.path[m.path.length - 1] === sq);
      if (move && onHumanMove) {
        onHumanMove(moveToNotation(move));
        setSelectedSq(null);
      } else {
        setSelectedSq(null);
      }
    }
  };

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
      const isSelected = sq === selectedSq;
      
      // Determine if this cell is a valid destination for the selected piece
      const validDestinations = selectedSq 
        ? legalMoves.filter(m => m.from === selectedSq).map(m => m.path[m.path.length - 1])
        : [];
      const isDestination = sq ? validDestinations.includes(sq) : false;
      
      let highlightClass = "";
      if (isLastMoveSq && !isSelected) {
        highlightClass = "after:absolute after:inset-0 after:bg-[#8bc34a]/30 after:border-4 after:border-[#8bc34a] after:pointer-events-none after:z-20";
      } else if (isSelected) {
        highlightClass = "after:absolute after:inset-0 after:bg-amber-500/40 after:border-4 after:border-amber-400 after:pointer-events-none after:z-20";
      } else if (isDestination) {
        highlightClass = "after:absolute after:inset-[25%] after:rounded-full after:bg-amber-500/50 after:pointer-events-none after:z-20 cursor-pointer";
      }

      const canSelect = isPlayable && sq && isHumanTurn && legalMoves.some(m => m.from === sq);
      if (canSelect && !isSelected && !isDestination) {
         // Optionally add hover effect for selectable pieces
         highlightClass += " hover:after:absolute hover:after:inset-0 hover:after:bg-amber-500/10 hover:after:pointer-events-none hover:after:z-20 cursor-pointer";
      }
      
      cells.push(
        <div
          key={`${row}-${col}`}
          onClick={() => isPlayable && sq ? handleCellClick(sq) : undefined}
          className={`
            relative w-full h-full flex items-start justify-end p-1
            ${isPlayable ? "bg-[#b05f3c]" : "bg-[#ecd3a9]"}
            ${highlightClass}
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
