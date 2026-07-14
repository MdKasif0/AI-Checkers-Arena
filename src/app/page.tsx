"use client";

import { useEffect, useState } from "react";
import { Board } from "@/components/board";
import { createInitialState, getLegalMoves, applyMove, GameState, Move } from "@/lib/engine";

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lastMove, setLastMove] = useState<Move | null>(null);

  useEffect(() => {
    let current = createInitialState();
    setGameState(current);

    const interval = setInterval(() => {
      if (current.status !== "playing") {
        clearInterval(interval);
        return;
      }
      const legals = getLegalMoves(current.board, current.currentPlayer);
      if (legals.length === 0) {
        clearInterval(interval);
        return;
      }
      
      // Randomly pick a legal move
      const move = legals[Math.floor(Math.random() * legals.length)];
      current = applyMove(current, move);
      
      setLastMove(move);
      setGameState(current);
    }, 1000); // 1 move per second

    return () => clearInterval(interval);
  }, []);

  if (!gameState) return null;

  return (
    <main className="min-h-screen bg-charcoal-950 p-8 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-display text-amber-500 mb-8">Board Animation Test</h1>
      <div className="w-full max-w-2xl">
        <Board board={gameState.board} lastMove={lastMove} legalMoves={[]} />
      </div>
    </main>
  );
}
