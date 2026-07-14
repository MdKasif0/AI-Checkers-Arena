"use client";

import { motion } from "framer-motion";
import { AnimatablePiece } from "./usePieces";
import { sqToRowCol } from "@/lib/engine";

interface PieceProps {
  piece: AnimatablePiece;
}

export function Piece({ piece }: PieceProps) {
  const pos = sqToRowCol(piece.sq);
  if (!pos) return null;
  const { row, col } = pos;

  const isWhite = piece.player === "white";
  const bgColor = isWhite ? "bg-[#eaddcf]" : "bg-[#c55d31]";
  const shadowColor = "rgba(0,0,0,0.6)";

  return (
    <motion.div
      layout
      layoutId={piece.id}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute flex items-center justify-center"
      style={{
        top: `${row * 10}%`,
        left: `${col * 10}%`,
        width: "10%",
        height: "10%",
        zIndex: 10,
      }}
    >
      <div className={`
        relative w-[85%] h-[85%] rounded-full shadow-[2px_5px_10px_rgba(0,0,0,0.6)] 
        flex items-center justify-center border border-black/20 ${bgColor}
      `}>
        {/* Main outer ring bevel (raised) */}
        <div className="absolute inset-[8%] rounded-full border-t-[rgba(255,255,255,0.4)] border-b-[rgba(0,0,0,0.3)] border-l-[rgba(255,255,255,0.2)] border-r-[rgba(0,0,0,0.1)] border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]" />
        
        {/* Inner concentric ring (depressed) */}
        <div className="absolute inset-[26%] rounded-full border-t-[rgba(0,0,0,0.25)] border-b-[rgba(255,255,255,0.4)] border-l-[rgba(0,0,0,0.1)] border-r-[rgba(255,255,255,0.2)] border-2 shadow-[0_1px_3px_rgba(0,0,0,0.1)]" />

        {/* Center dimple */}
        <div className="absolute inset-[44%] rounded-full shadow-[inset_0_2px_3px_rgba(0,0,0,0.2)] bg-black/5 border-b-[rgba(255,255,255,0.3)] border-[1px] border-transparent" />

        {/* King styling (Add a distinct inner gold crown or visual stacking effect) */}
        {piece.kind === "king" && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute inset-[15%] rounded-full border-[3px] border-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.8)] opacity-90"
          />
        )}
      </div>
    </motion.div>
  );
}
