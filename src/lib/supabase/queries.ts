import { supabase } from "./client";

export type MatchStatus = "in_progress" | "completed";
export type PlayerColor = "white" | "black";
export type MatchResultReason =
  | "threefold_repetition"
  | "no_pieces"
  | "no_legal_moves"
  | "25_move_rule"
  | "resignation";

export interface CreateMatchParams {
  whiteModel: string;
  blackModel: string;
}

/**
 * Creates a new match in the database.
 */
export async function createMatch({ whiteModel, blackModel }: CreateMatchParams) {
  const { data, error } = await supabase
    .from("matches")
    .insert({
      white_model: whiteModel,
      black_model: blackModel,
      status: "in_progress",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface AppendMoveParams {
  matchId: string;
  plyNumber: number;
  player: PlayerColor;
  notation: string;
  reasoningText?: string;
  latencyMs: number;
  tokensUsed: number;
  wasIllegalAttempt: boolean;
}

/**
 * Appends a move to an ongoing match.
 */
export async function appendMove(params: AppendMoveParams) {
  const { data, error } = await supabase
    .from("moves")
    .insert({
      match_id: params.matchId,
      ply_number: params.plyNumber,
      player: params.player,
      notation: params.notation,
      reasoning_text: params.reasoningText || null,
      latency_ms: params.latencyMs,
      tokens_used: params.tokensUsed,
      was_illegal_attempt: params.wasIllegalAttempt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Finalizes a match by setting its status, winner, and finished timestamp.
 */
export async function finalizeMatch(
  matchId: string,
  winner: PlayerColor | null,
  reason: MatchResultReason
) {
  const { data, error } = await supabase
    .from("matches")
    .update({
      status: "completed",
      winner,
      result_reason: reason,
      finished_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Elo K-factor
const K = 32;

function calculateElo(ratingA: number, ratingB: number, scoreA: number) {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const newRatingA = ratingA + K * (scoreA - expectedA);
  return Math.round(newRatingA);
}

/**
 * Aggregates match statistics and updates Elo ratings for both models.
 */
export async function updateModelStats(
  whiteModel: string,
  blackModel: string,
  winner: PlayerColor | null,
  matchId: string
) {
  // 1. Fetch current stats for both models
  const { data: whiteData } = await supabase
    .from("model_stats")
    .select("*")
    .eq("model_id", whiteModel)
    .maybeSingle();

  const { data: blackData } = await supabase
    .from("model_stats")
    .select("*")
    .eq("model_id", blackModel)
    .maybeSingle();

  const whiteStats = whiteData || {
    wins: 0,
    losses: 0,
    draws: 0,
    avg_move_latency_ms: 0,
    avg_tokens: 0,
    illegal_move_rate: 0,
    rating: 1200,
  };

  const blackStats = blackData || {
    wins: 0,
    losses: 0,
    draws: 0,
    avg_move_latency_ms: 0,
    avg_tokens: 0,
    illegal_move_rate: 0,
    rating: 1200,
  };

  // 2. Fetch all moves for this match to calculate match averages
  const { data: moves } = await supabase
    .from("moves")
    .select("player, latency_ms, tokens_used, was_illegal_attempt")
    .eq("match_id", matchId);

  const matchMoves = moves || [];
  const whiteMoves = matchMoves.filter((m) => m.player === "white");
  const blackMoves = matchMoves.filter((m) => m.player === "black");

  interface ModelStats {
    wins: number;
    losses: number;
    draws: number;
    avg_move_latency_ms: number;
    avg_tokens: number;
    illegal_move_rate: number;
    rating: number;
  }

  // Helper to aggregate stats weighting by number of matches played
  const aggregate = (
    currentStats: ModelStats,
    newMoves: Array<{ latency_ms: number; tokens_used: number; was_illegal_attempt: boolean }>,
    isWin: boolean,
    isDraw: boolean
  ) => {
    const matchesPlayed = currentStats.wins + currentStats.losses + currentStats.draws;
    
    let matchLatencySum = 0;
    let matchTokensSum = 0;
    let matchIllegalCount = 0;

    for (const m of newMoves) {
      matchLatencySum += m.latency_ms;
      matchTokensSum += m.tokens_used;
      if (m.was_illegal_attempt) matchIllegalCount++;
    }

    const matchAvgLatency = newMoves.length > 0 ? matchLatencySum / newMoves.length : 0;
    const matchAvgTokens = newMoves.length > 0 ? matchTokensSum / newMoves.length : 0;
    const matchIllegalRate = newMoves.length > 0 ? matchIllegalCount / newMoves.length : 0;

    return {
      wins: currentStats.wins + (isWin ? 1 : 0),
      losses: currentStats.losses + (!isWin && !isDraw ? 1 : 0),
      draws: currentStats.draws + (isDraw ? 1 : 0),
      avg_move_latency_ms: (currentStats.avg_move_latency_ms * matchesPlayed + matchAvgLatency) / (matchesPlayed + 1),
      avg_tokens: (currentStats.avg_tokens * matchesPlayed + matchAvgTokens) / (matchesPlayed + 1),
      illegal_move_rate: (currentStats.illegal_move_rate * matchesPlayed + matchIllegalRate) / (matchesPlayed + 1),
    };
  };

  const whiteIsWin = winner === "white";
  const blackIsWin = winner === "black";
  const isDraw = winner === null;

  const newWhiteStats = aggregate(whiteStats, whiteMoves, whiteIsWin, isDraw);
  const newBlackStats = aggregate(blackStats, blackMoves, blackIsWin, isDraw);

  // 3. Calculate Elo
  const whiteScore = whiteIsWin ? 1 : isDraw ? 0.5 : 0;
  const blackScore = 1 - whiteScore;

  newWhiteStats.rating = calculateElo(whiteStats.rating, blackStats.rating, whiteScore);
  newBlackStats.rating = calculateElo(blackStats.rating, whiteStats.rating, blackScore);

  // 4. Upsert updated stats
  await supabase.from("model_stats").upsert([
    { model_id: whiteModel, ...newWhiteStats },
    { model_id: blackModel, ...newBlackStats },
  ]);
}

/**
 * Fetches the complete match and its move history.
 */
export async function getMatchState(matchId: string) {
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError || !match) throw new Error("Match not found");

  const { data: moves, error: movesError } = await supabase
    .from("moves")
    .select("*")
    .eq("match_id", matchId)
    .order("ply_number", { ascending: true });

  if (movesError) throw movesError;

  return { match, moves: moves || [] };
}

/**
 * Fetches recent matches for the history page.
 */
export async function getMatchHistory() {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
    
  if (error) throw error;
  return data;
}

/**
 * Fetches the leaderboard of model stats.
 */
export async function getLeaderboard() {
  const { data, error } = await supabase
    .from("model_stats")
    .select("*")
    .order("rating", { ascending: false });
    
  if (error) throw error;
  return data;
}
