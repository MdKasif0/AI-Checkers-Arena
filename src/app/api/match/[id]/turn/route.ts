import { NextResponse } from "next/server";
import { 
  createInitialState, 
  applyMove, 
  notationToMove, 
  moveToNotation,
  getLegalMoves,
  GameState
} from "@/lib/engine";
import { 
  getMatchState, 
  appendMove, 
  finalizeMatch, 
  updateModelStats,
  MatchResultReason
} from "@/lib/supabase/queries";
import { getOpenRouterMove } from "@/lib/openrouter";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    if (!matchId) {
      return NextResponse.json({ error: "Missing match ID" }, { status: 400 });
    }

    // 1. State Reconstruction
    const { match, moves } = await getMatchState(matchId);

    if (match.status === "completed") {
      return NextResponse.json({ error: "Match is already completed." }, { status: 400 });
    }

    let state: GameState = createInitialState();

    // Replay historical moves to arrive at the current engine state
    for (const ply of moves) {
      const legalMoves = getLegalMoves(state.board, state.currentPlayer);
      const parsedMove = notationToMove(ply.notation, legalMoves);
      if (!parsedMove) {
        throw new Error(`Invalid historical move found in DB: ${ply.notation}`);
      }
      state = applyMove(state, parsedMove);
    }

    // 2. Pre-move Validation (Did the previous player's move win the game?)
    const currentLegalMoves = getLegalMoves(state.board, state.currentPlayer);
    if (currentLegalMoves.length === 0) {
      // The current player has no legal moves, so they lose.
      const winner = state.currentPlayer === "white" ? "black" : "white";
      const reason = "no_legal_moves";
      await finalizeMatch(matchId, winner, reason);
      await updateModelStats(match.white_model, match.black_model, winner, matchId);
      return NextResponse.json({ status: "game_over", winner, reason });
    }

    // Extract optional body for human moves
    let bodyText = "";
    try {
      bodyText = await request.text();
    } catch {}
    const body = bodyText ? JSON.parse(bodyText) : {};
    const moveNotation = body.moveNotation;

    // 3. Execution (Human vs AI)
    const modelId = state.currentPlayer === "white" ? match.white_model : match.black_model;
    const isHuman = modelId === "human";

    let finalMove;
    let finalReasoning: string | undefined = undefined;
    let finalLatency: number | undefined = undefined;
    let finalTokens: number | undefined = undefined;
    let finalWasIllegalAttempt = false;

    if (isHuman) {
      if (!moveNotation) {
        return NextResponse.json({ error: "Missing moveNotation for human turn" }, { status: 400 });
      }
      finalMove = notationToMove(moveNotation, currentLegalMoves);
      if (!finalMove) {
        return NextResponse.json({ error: "Illegal move submitted by human" }, { status: 400 });
      }
    } else {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is missing");
      }
      // This call handles the 3-attempt retry logic and random fallback under the hood
      const aiResult = await getOpenRouterMove(modelId, state, currentLegalMoves, apiKey);
      finalMove = aiResult.move;
      finalReasoning = aiResult.reasoning;
      finalLatency = aiResult.latencyMs;
      finalTokens = aiResult.tokensUsed;
      finalWasIllegalAttempt = aiResult.wasIllegalAttempt;
    }

    const plyNumber = moves.length + 1;
    // 4. Persistence & State Application
    await appendMove({
      matchId,
      plyNumber,
      player: state.currentPlayer,
      notation: moveToNotation(finalMove),
      reasoningText: finalReasoning,
      latencyMs: finalLatency,
      tokensUsed: finalTokens,
      wasIllegalAttempt: finalWasIllegalAttempt,
    });

    state = applyMove(state, finalMove);

    // 5. Post-move Game Over Detection
    if (state.status !== "playing") {
      let winner: "white" | "black" | null = null;
      let reason: string = state.status;
      
      if (state.status === "white_wins") winner = "white";
      else if (state.status === "black_wins") winner = "black";
      else if (state.status === "draw") {
        winner = null;
        // In the engine, the status is just 'draw'. We map to the reason based on the clock.
        reason = state.halfMoveClock >= 50 ? "25_move_rule" : "threefold_repetition";
      }

      await finalizeMatch(matchId, winner, reason as MatchResultReason);
      await updateModelStats(match.white_model, match.black_model, winner, matchId);
      
      return NextResponse.json({
        status: "game_over",
        winner,
        reason,
        lastMove: {
          move: finalMove,
          reasoning: finalReasoning,
          latencyMs: finalLatency,
          tokensUsed: finalTokens,
          wasIllegalAttempt: finalWasIllegalAttempt
        }
      });
    }

    // Otherwise, the game continues.
    return NextResponse.json({
      status: "playing",
      lastMove: {
        move: finalMove,
        reasoning: finalReasoning,
        latencyMs: finalLatency,
        tokensUsed: finalTokens,
        wasIllegalAttempt: finalWasIllegalAttempt
      }
    });

  } catch (error: unknown) {
    console.error("Error in /api/match/[id]/turn:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
