import { useEffect, useState, useRef } from "react";
import { Board, Move, Player, PieceKind } from "@/lib/engine";

export interface AnimatablePiece {
  id: string;
  sq: number;
  player: Player;
  kind: PieceKind;
}

export function usePieces(board: Board, lastMove: Move | null) {
  const [pieces, setPieces] = useState<AnimatablePiece[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // First render: assign stable IDs based on initial positions
      const initialPieces: AnimatablePiece[] = [];
      board.forEach((piece, sq) => {
        initialPieces.push({
          id: `piece_${piece.player}_${sq}`,
          sq,
          player: piece.player,
          kind: piece.kind,
        });
      });
      setPieces(initialPieces);
      initialized.current = true;
      return;
    }

    // Subsequent updates: compute delta for fluid animations
    setPieces((prev) => {
      let next = [...prev];

      if (lastMove) {
        // Find the piece that moved by matching its starting square
        const movingPieceIndex = next.findIndex((p) => p.sq === lastMove.from);
        
        if (movingPieceIndex !== -1) {
          const toSq = lastMove.path[lastMove.path.length - 1];
          // Check the current engine board to see if it promoted to a king
          const finalPieceOnBoard = board.get(toSq);
          
          next[movingPieceIndex] = {
            ...next[movingPieceIndex],
            sq: toSq,
            kind: finalPieceOnBoard?.kind || next[movingPieceIndex].kind,
          };
        }

        // Remove any captured pieces so AnimatePresence triggers their exit animation
        if (lastMove.captures && lastMove.captures.length > 0) {
          next = next.filter((p) => !lastMove.captures.includes(p.sq));
        }
      } else {
        // Fallback: full sync if no lastMove was provided (e.g. board resets)
        const syncedPieces: AnimatablePiece[] = [];
        board.forEach((boardPiece, sq) => {
          const existing = prev.find((p) => p.sq === sq && p.player === boardPiece.player);
          if (existing) {
             syncedPieces.push({ ...existing, kind: boardPiece.kind });
          } else {
             syncedPieces.push({
               id: `piece_${boardPiece.player}_${sq}_${Date.now()}`,
               sq,
               player: boardPiece.player,
               kind: boardPiece.kind,
             });
          }
        });
        return syncedPieces;
      }

      return next;
    });
  }, [board, lastMove]);

  return pieces;
}
