import { Player } from "@/lib/engine";

export interface MatchDB {
  id: string;
  white_model: string;
  black_model: string;
  status: "in_progress" | "completed";
  winner: Player | null;
  result_reason: string | null;
  mode: "ai_vs_ai" | "human_vs_ai";
}

export interface MoveDB {
  id: string;
  match_id: string;
  ply_number: number;
  player: Player;
  notation: string;
  reasoning_text: string | null;
  latency_ms: number;
  tokens_used: number;
  was_illegal_attempt: boolean;
}
