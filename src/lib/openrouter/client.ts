import { GameState, Move, notationToMove, moveToNotation } from "../engine";
import { generatePrompt } from "./prompt";
import { AiMoveResult, OpenRouterResponse } from "./types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Robustly extracts a move JSON from a potentially messy LLM output string.
 * Handles markdown code blocks, extra whitespace, and partial outputs.
 */
export function extractJson(text: string, legalNotations: string[]): OpenRouterResponse {
  // Strip markdown code fences if present
  let cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  
  // Try to find a JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.move === "string" && typeof parsed.reason === "string") {
        return parsed as OpenRouterResponse;
      }
      // Some models return { move: "..." } without reason
      if (typeof parsed.move === "string") {
        return { move: parsed.move, reason: "No reason provided" };
      }
    } catch {
      // JSON parse failed, fall through to text extraction
    }
  }

  // Fallback: try to find a legal move notation directly in the text
  for (const notation of legalNotations) {
    if (cleaned.includes(notation)) {
      return { move: notation, reason: "Extracted from raw model output" };
    }
  }

  throw new Error(`No valid JSON or move found in response: "${text.substring(0, 200)}"`)
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
          messages: [
            { role: "system", content: "You are an expert International Draughts player. You MUST respond with ONLY a valid JSON object matching the schema: {\"move\": \"...\", \"reason\": \"...\"}. No markdown, no explanation outside the JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.1 + (attempts - 1) * 0.15, // Increase randomness on retries
          max_tokens: 512, // Reasoning models need space to think
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(60000), // 60 second timeout for large models
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} ${err}`);
      }

      const data = await response.json();
      const tokensUsed = data.usage?.total_tokens || 0;
      const content = data.choices?.[0]?.message?.content || "";

      const moveNotations = legalMoves.map(m => moveToNotation(m));
      const parsed = extractJson(content, moveNotations);
      const chosenMove = notationToMove(parsed.move, legalMoves);

      if (!chosenMove) {
        console.warn(`[AI] Model ${modelId} attempt ${attempts}: illegal move "${parsed.move}". Raw: "${content.substring(0, 200)}"`);
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
