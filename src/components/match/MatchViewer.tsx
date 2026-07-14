"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MatchDB, MoveDB } from "./types";
import { createInitialState, applyMove, notationToMove, getLegalMoves, GameState, Move } from "@/lib/engine";
import { Board } from "@/components/board";
import { ModelPanel } from "./ModelPanel";
import { MoveHistory } from "./MoveHistory";
import { Shield, Copy, Circle, Square } from "lucide-react";
import { motion } from "framer-motion";
import { stopMatchAction } from "@/app/actions";

interface MatchViewerProps {
  match: MatchDB;
  initialMoves: MoveDB[];
}

export function MatchViewer({ match, initialMoves }: MatchViewerProps) {
  const router = useRouter();
  const moves = initialMoves;
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2.0);

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

  const isLive = currentPlyIndex === null;
  const targetIndex = isLive ? states.length - 1 : currentPlyIndex + 1;
  const activeState = states[targetIndex]?.state || states[0].state;
  const activeLastMove = states[targetIndex]?.lastMove || null;

  const currentMoveDb = isLive 
    ? (moves.length > 0 ? moves[moves.length - 1] : undefined) 
    : moves[currentPlyIndex];

  const handleNextTurn = async () => {
    if (match.status === "completed" || processingRef.current) return;
    setIsProcessing(true);
    processingRef.current = true;
    try {
      const res = await fetch(`/api/match/${match.id}/turn`, { method: "POST" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`Failed to process turn: ${res.status} ${errData.error || ""}`);
      }
      // Reset the ref BEFORE refresh so the next render cycle can trigger the next turn
      processingRef.current = false;
      setIsProcessing(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  const isHumanTurn = isLive && match.mode === "human_vs_ai" && 
    (activeState.currentPlayer === "white" ? match.white_model === "human" : match.black_model === "human");

  useEffect(() => {
    if (match.status === "in_progress" && !isHumanTurn && isLive && !processingRef.current) {
      handleNextTurn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.status, isHumanTurn, isLive, moves.length]);

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
      router.refresh();
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  const copyMatchId = () => {
    navigator.clipboard.writeText(match.id);
  };

  const handleStopMatch = async () => {
    if (match.status === "completed" || isProcessing) return;
    setIsProcessing(true);
    processingRef.current = true;
    try {
      await stopMatchAction(match.id);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col font-sans bg-[#0a0a0a]">
      {/* Header */}
      <header className="w-full max-w-[1500px] mx-auto px-6 lg:px-10 py-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-amber-500 tracking-tight">AI Checkers Arena</h1>
            <Shield className="w-5 h-5 text-amber-500/80" />
          </div>
          <div className="flex items-center gap-3 text-sm text-charcoal-400 font-mono">
            <span>Match ID: {match.id}</span>
            <button onClick={copyMatchId} className="hover:text-amber-500 transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {match.status === "in_progress" && !isHumanTurn && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleStopMatch}
                disabled={isProcessing}
                className="px-4 py-2 rounded-full border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Square className="w-3 h-3 fill-current" />
                Stop Match
              </button>
              <div className="px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs font-semibold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Auto-playing AI match
              </div>
            </div>
          )}
          {match.status === "completed" && (
            <div className="px-4 py-2 rounded-full border border-charcoal-700 bg-charcoal-800 text-charcoal-300 text-xs font-semibold">
              Completed - {match.winner ? `Winner: ${match.winner}` : `Draw (${match.result_reason})`}
            </div>
          )}
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 w-full max-w-[1500px] mx-auto px-6 lg:px-10 pb-6 grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-8">
        
        {/* Left: White Model */}
        <div className="flex flex-col">
          <ModelPanel 
            player="white" 
            modelName={match.white_model} 
            moves={moves} 
            currentState={activeState} 
            isThinking={isLive && activeState.currentPlayer === "white" && !isHumanTurn}
            currentMoveDb={currentMoveDb}
          />
        </div>

        {/* Center: Board */}
        <div className="flex flex-col items-center justify-center relative w-full h-full min-h-[500px]">
           <Board 
            board={activeState.board} 
            lastMove={activeLastMove} 
            legalMoves={currentLegalMoves}
            isHumanTurn={isHumanTurn}
            onHumanMove={handleHumanMove}
          />
        </div>

        {/* Right: Black Model */}
        <div className="flex flex-col">
          <ModelPanel 
            player="black" 
            modelName={match.black_model} 
            moves={moves} 
            currentState={activeState}
            isThinking={isLive && activeState.currentPlayer === "black" && !isHumanTurn}
            currentMoveDb={currentMoveDb}
          />
        </div>
      </div>

      {/* Footer Controls & Move History */}
      <div className="w-full max-w-[1500px] mx-auto px-6 lg:px-10 pb-8">
         <MoveHistory 
          moves={moves} 
          currentPlyIndex={currentPlyIndex} 
          onSelectPly={setCurrentPlyIndex}
          isLive={isLive}
          activePlayer={activeState.currentPlayer}
        />
      </div>
    </div>
  );
}
