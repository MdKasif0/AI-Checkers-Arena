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

  return (
    <motion.div
      layout
      layoutId={piece.id}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute p-1"
      style={{
        top: `${row * 10}%`,
        left: `${col * 10}%`,
        width: "10%",
        height: "10%",
        zIndex: 10,
      }}
    >
      <div className={`
        relative w-full h-full rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.6)] 
        flex items-center justify-center border-2
        ${isWhite ? "bg-amber-500 border-amber-300 text-amber-900" : "bg-charcoal-800 border-charcoal-600 text-charcoal-400"}
      `}>
        {piece.kind === "king" && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-1/2 h-1/2 rounded-full border-[3px] border-current opacity-80 flex items-center justify-center"
          >
             <div className="w-1.5 h-1.5 rounded-full bg-current" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
