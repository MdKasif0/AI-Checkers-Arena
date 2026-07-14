import { Move } from "../engine";

export interface OpenRouterResponse {
  move: string;
  reason: string;
}

export interface AiMoveResult {
  move: Move;
  reasoning: string;
  latencyMs: number;
  tokensUsed: number;
  wasIllegalAttempt: boolean;
}
