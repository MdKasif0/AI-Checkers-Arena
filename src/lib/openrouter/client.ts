import { GameState, Move, notationToMove } from "../engine";
import { generatePrompt } from "./prompt";
import { AiMoveResult, OpenRouterResponse } from "./types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Robustly extracts the first JSON object from a potentially messy LLM output string.
 */
export function extractJson(text: string): OpenRouterResponse {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON object found in the response.");
  }

  try {
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.move !== "string" || typeof parsed.reason !== "string") {
      throw new Error(
        "JSON does not match the required schema {move: string, reason: string}."
      );
    }
    return parsed as OpenRouterResponse;
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${(e as Error).message}`);
  }
}

/**
 * Fetches a move from an OpenRouter model, strictly enforcing the JSON schema and legal move list.
 * Retries up to 3 times if the model hallucinates an illegal move or invalid JSON.
 */
export async function getOpenRouterMove(
  modelId: string,
  state: GameState,
  legalMoves: Move[],
  apiKey: string
): Promise<AiMoveResult> {
  if (legalMoves.length === 0) {
    throw new Error("Cannot request a move: no legal moves available.");
  }

  // Only 1 legal move? Skip the LLM call entirely to save tokens/latency!
  if (legalMoves.length === 1) {
    return {
      move: legalMoves[0],
      reasoning: "Only one legal move available (forced move).",
      latencyMs: 0,
      tokensUsed: 0,
      wasIllegalAttempt: false,
    };
  }

  const prompt = generatePrompt(state, legalMoves);

  let attempts = 0;
  const MAX_ATTEMPTS = 3;
  let wasIllegalAttempt = false;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    const startTime = Date.now();

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://aicheckersarena.vercel.app",
          "X-Title": "AI Checkers Arena",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "system", content: prompt }],
          temperature: 0.2, // Low variance
          max_tokens: 150, // Short responses only
          seed: 42, // Enforce determinism
          response_format: { type: "json_object" }, // Ask OpenRouter for JSON mode if supported
        }),
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} ${err}`);
      }

      const data = await response.json();
      const tokensUsed = data.usage?.total_tokens || 0;
      const content = data.choices?.[0]?.message?.content || "";

      const parsed = extractJson(content);
      const chosenMove = notationToMove(parsed.move, legalMoves);

      if (!chosenMove) {
        throw new Error(
          `Model returned an illegal or unlisted move: ${parsed.move}`
        );
      }

      return {
        move: chosenMove,
        reasoning: parsed.reason,
        latencyMs,
        tokensUsed,
        wasIllegalAttempt,
      };
    } catch (e) {
      wasIllegalAttempt = true;
      if (attempts >= MAX_ATTEMPTS) {
        // Fallback to random legal move to prevent the match from crashing forever
        const fallbackMove =
          legalMoves[Math.floor(Math.random() * legalMoves.length)];
        return {
          move: fallbackMove,
          reasoning: `Model failed to output a valid move after ${MAX_ATTEMPTS} attempts. Random legal move chosen. Error: ${
            (e as Error).message
          }`,
          latencyMs: Date.now() - startTime,
          tokensUsed: 0,
          wasIllegalAttempt: true,
        };
      }
    }
  }

  throw new Error("Unreachable");
}
