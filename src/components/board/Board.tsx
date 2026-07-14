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
      
      const validDestinations = selectedSq 
        ? legalMoves.filter(m => m.from === selectedSq).map(m => m.path[m.path.length - 1])
        : [];
      const isDestination = sq ? validDestinations.includes(sq) : false;
      
      let highlightClass = "";
      if (isLastMoveSq && !isSelected) {
        highlightClass = "after:absolute after:inset-[2px] after:border-2 after:border-amber-500/70 after:pointer-events-none after:z-20 after:shadow-[0_0_10px_rgba(212,175,55,0.5)]";
      } else if (isSelected) {
        highlightClass = "after:absolute after:inset-[2px] after:border-[3px] after:border-amber-400 after:pointer-events-none after:z-20 after:shadow-[0_0_15px_rgba(212,175,55,0.8)]";
      } else if (isDestination) {
        highlightClass = "after:absolute after:inset-[35%] after:rounded-full after:bg-amber-500/60 after:pointer-events-none after:z-20 cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.5)]";
      }

      const canSelect = isPlayable && sq && isHumanTurn && legalMoves.some(m => m.from === sq);
      if (canSelect && !isSelected && !isDestination) {
         highlightClass += " hover:after:absolute hover:after:inset-[2px] hover:after:border-2 hover:after:border-amber-500/30 hover:after:pointer-events-none hover:after:z-20 cursor-pointer";
      }
      
      // Wood gradient/texture backgrounds
      // Playable dark square: #533923 -> #48301d
      // Light square: #c59762 -> #ab7c4b
      const bgStyle = isPlayable 
        ? "bg-gradient-to-br from-[#533923] to-[#48301d]" 
        : "bg-gradient-to-br from-[#c59762] to-[#ab7c4b]";

      cells.push(
        <div
          key={`${row}-${col}`}
          onClick={() => isPlayable && sq ? handleCellClick(sq) : undefined}
          className={`
            relative w-full h-full p-[2px] overflow-hidden
            ${bgStyle}
            ${highlightClass}
          `}
        >
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

          {isPlayable && sq && (
            <span className="absolute top-1 left-1 text-[0.55rem] font-mono text-[#25180f] font-bold select-none leading-none z-10 opacity-70">
              {sq}
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <div className="relative w-full max-w-[600px] mx-auto aspect-square rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#2d1c0e] bg-[#2d1c0e] p-[2px]">
      
      {/* Outer Golden/Wood Bevel */}
      <div className="absolute -inset-1 rounded-xl border border-amber-500/20 shadow-[0_0_20px_rgba(212,175,55,0.1)] pointer-events-none" />

      {/* Main Board Container */}
      <div className="relative w-full h-full border-[10px] border-[#362211] rounded-lg overflow-hidden shadow-inner">
        {/* Inner golden glow along the edge of the playable area */}
        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(212,175,55,0.15)] pointer-events-none z-30 mix-blend-screen" />
        <div className="absolute inset-0 border-[2px] border-amber-900/40 pointer-events-none z-30" />
        
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
    </div>
  );
}
