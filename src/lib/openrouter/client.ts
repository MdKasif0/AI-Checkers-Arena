/**
 * OpenRouter API Client
 *
 * Server-side only — calls OpenRouter's chat completions endpoint.
 * Used by the /api/openrouter route handler.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModelCallOptions {
  /** OpenRouter model identifier, e.g. "openai/gpt-4o" */
  model: string;
  /** The prompt / messages to send */
  messages: ChatMessage[];
  /** Maximum tokens in the response */
  maxTokens?: number;
  /** Sampling temperature */
  temperature?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelCallResult {
  /** The model's text response */
  content: string;
  /** Model identifier that actually served the request */
  model: string;
  /** Token usage */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Call an AI model via OpenRouter.
 *
 * Requires OPENROUTER_API_KEY environment variable.
 * This is a server-side function — never import in client components.
 */
export async function callModel(
  options: ModelCallOptions
): Promise<ModelCallResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your .env.local file."
    );
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "AI Checkers Arena",
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenRouter API error (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content ?? "",
    model: data.model ?? options.model,
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
}
