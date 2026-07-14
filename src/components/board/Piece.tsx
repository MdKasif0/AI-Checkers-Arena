"use client";

import { motion } from "framer-motion";
import { AnimatablePiece } from "./usePieces";
import { sqToRowCol } from "@/lib/engine";
import { Crown } from "lucide-react";

interface PieceProps {
  piece: AnimatablePiece;
}

export function Piece({ piece }: PieceProps) {
  const pos = sqToRowCol(piece.sq);
  if (!pos) return null;
  const { row, col } = pos;

  const isWhite = piece.player === "white";
  
  const outerBg = isWhite ? "bg-piece-white-outer" : "bg-piece-black-outer";
  const outerBorder = isWhite ? "border-piece-white-border" : "border-piece-black-border";
  const innerBg = isWhite ? "bg-piece-white-inner" : "bg-piece-black-inner";
  const innerBorder = isWhite ? "border-piece-white-border-inner" : "border-piece-black-border-inner";
  const centerBg = isWhite ? "bg-piece-white-outer" : "bg-piece-black-outer";
  
  return (
    <motion.div
      layout
      layoutId={piece.id}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        top: `${row * 10}%`,
        left: `${col * 10}%`,
        width: "10%",
        height: "10%",
        zIndex: 40,
      }}
    >
      <div className={`
        relative w-[75%] h-[75%] rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.6)] 
        flex items-center justify-center border-2 ${outerBorder} ${outerBg}
      `}>
        {/* Flat inner ring */}
        <div className={`absolute inset-[15%] rounded-full border border-b-2 border-r-2 ${innerBorder} ${innerBg} shadow-inner`} />
        
        {/* Center dimple */}
        <div className={`absolute inset-[35%] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] ${centerBg}`} />

        {/* King styling */}
        {piece.kind === "king" && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center z-10 drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]"
          >
            <Crown className="w-5 h-5 text-amber-500 fill-amber-500 stroke-[1.5]" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
