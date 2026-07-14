/**
 * Supabase query helpers
 *
 * Typed wrappers around common database operations.
 * Will be populated as tables are created in later steps.
 */

// ---------------------------------------------------------------------------
// Placeholder types — will be replaced with generated types from Supabase
// ---------------------------------------------------------------------------

export interface MatchRecord {
  id: string;
  red_model: string;
  black_model: string;
  status: "playing" | "red_wins" | "black_wins" | "draw";
  moves: unknown[];
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  model: string;
  wins: number;
  losses: number;
  draws: number;
  total_matches: number;
}

// ---------------------------------------------------------------------------
// Query stubs — implementations will follow after schema migration
// ---------------------------------------------------------------------------

/** Fetch a match by ID */
export async function getMatch(_id: string): Promise<MatchRecord | null> {
  // TODO: implement after table creation
  return null;
}

/** Fetch recent matches */
export async function getRecentMatches(
  _limit: number = 20
): Promise<MatchRecord[]> {
  // TODO: implement after table creation
  return [];
}

/** Fetch leaderboard */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // TODO: implement after table creation
  return [];
}
