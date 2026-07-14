"use client";

import { useMemo, useState } from "react";
import { MatchDB, MoveDB } from "./types";
import { createInitialState, applyMove, notationToMove, getLegalMoves, GameState, Move } from "@/lib/engine";
import { Board } from "@/components/board";
import { ModelPanel } from "./ModelPanel";
import { ReasoningPanel } from "./ReasoningPanel";
import { MoveHistory } from "./MoveHistory";

interface MatchViewerProps {
  match: MatchDB;
  initialMoves: MoveDB[];
}

export function MatchViewer({ match, initialMoves }: MatchViewerProps) {
  // In a real app we'd subscribe to Supabase real-time here.
  // For MVP step 8, we just use the props and allow manual "next turn" calls.
  const [moves] = useState<MoveDB[]>(initialMoves);
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Derive game states functionally
  const states = useMemo(() => {
    const statesArr: { state: GameState; lastMove: Move | null }[] = [];
    let state = createInitialState();
    statesArr.push({ state, lastMove: null });

    for (const moveDb of moves) {
      const legals = getLegalMoves(state.board, state.currentPlayer);
      const parsed = notationToMove(moveDb.notation, legals);
      if (parsed) {
        state = applyMove(state, parsed);
        statesArr.push({ state, lastMove: parsed });
      }
    }
    return statesArr;
  }, [moves]);

  // Determine the active state to render
  const isLive = currentPlyIndex === null;
  const targetIndex = isLive ? states.length - 1 : currentPlyIndex + 1; // +1 because states has the initial state at 0
  const activeState = states[targetIndex]?.state || states[0].state;
  const activeLastMove = states[targetIndex]?.lastMove || null;

  const currentMoveDb = isLive 
    ? moves[moves.length - 1] 
    : moves[currentPlyIndex];

  // Manual Next Turn (for manual testing or AI fallbacks)
  const handleNextTurn = async () => {
    if (match.status === "completed") return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/match/${match.id}/turn`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to process turn");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Error processing turn");
    } finally {
      setIsProcessing(false);
    }
  };

  const isHumanTurn = isLive && match.mode === "human_vs_ai" && 
    (activeState.currentPlayer === "white" ? match.white_model === "human" : match.black_model === "human");

  const currentLegalMoves = useMemo(() => {
    if (!isLive) return [];
    return getLegalMoves(activeState.board, activeState.currentPlayer);
  }, [activeState, isLive]);

  const handleHumanMove = async (notation: string) => {
    if (!isHumanTurn || isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/match/${match.id}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moveNotation: notation })
      });
      if (!res.ok) throw new Error("Failed to submit move");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Error submitting move");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col font-sans">
      {/* Header */}
      <header className="w-full p-4 border-b border-charcoal-800 bg-charcoal-900/50 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-amber-500">AI Checkers Arena</h1>
          <p className="text-xs text-charcoal-400 font-mono mt-1">Match: {match.id}</p>
        </div>
        <div className="flex items-center gap-4">
          {match.status === "completed" && (
            <span className="px-3 py-1 bg-charcoal-800 text-charcoal-300 rounded font-bold uppercase text-sm border border-charcoal-700 shadow-inner">
              Completed - Winner: {match.winner || "Draw"}
            </span>
          )}
          {match.status === "in_progress" && !isHumanTurn && (
            <button
              onClick={handleNextTurn}
              disabled={isProcessing || !isLive}
              className={`px-4 py-2 font-bold rounded shadow-lg transition-all ${
                isProcessing || !isLive 
                  ? "bg-charcoal-800 text-charcoal-500 cursor-not-allowed" 
                  : "bg-amber-500 text-amber-950 hover:bg-amber-400 hover:scale-105 active:scale-95"
              }`}
            >
              {isProcessing ? "Computing..." : "Play AI Turn"}
            </button>
          )}
          {match.status === "in_progress" && isHumanTurn && (
            <span className="px-4 py-2 font-bold rounded shadow-lg bg-emerald-500 text-emerald-950 animate-pulse">
              {isProcessing ? "Submitting..." : "Your Turn"}
            </span>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col xl:flex-row gap-8 items-start justify-center overflow-hidden">
        
        {/* White Panel (Left on Desktop, Top on Mobile) */}
        <div className="w-full xl:w-80 flex-shrink-0 order-2 xl:order-1">
          <ModelPanel 
            player="white" 
            modelName={match.white_model} 
            moves={moves} 
            currentState={activeState} 
          />
        </div>

        {/* Center Board & Reasoning */}
        <div className="flex-1 w-full max-w-2xl flex flex-col items-center order-1 xl:order-2">
          <Board 
            board={activeState.board} 
            lastMove={activeLastMove} 
            legalMoves={currentLegalMoves}
            isHumanTurn={isHumanTurn}
            onHumanMove={handleHumanMove}
          />
          <ReasoningPanel currentMove={currentMoveDb} />
        </div>

        {/* Black Panel (Right on Desktop, Bottom on Mobile) */}
        <div className="w-full xl:w-80 flex-shrink-0 order-3 xl:order-3">
          <ModelPanel 
            player="black" 
            modelName={match.black_model} 
            moves={moves} 
            currentState={activeState} 
          />
        </div>

      </div>

      {/* Footer Timeline */}
      <MoveHistory 
        moves={moves} 
        currentPlyIndex={currentPlyIndex} 
        onSelectPly={setCurrentPlyIndex} 
      />
    </div>
  );
}
