export interface ORModel {
  id: string;
  name: string;
  context_length: number;
  provider: string;
}

export const DEFAULT_SHORTLIST = [
  "google/gemini-2.5-flash",
  "meta-llama/llama-3.3-70b-instruct",
  "openai/gpt-4o-mini",
  "anthropic/claude-3-5-haiku",
  "deepseek/deepseek-chat",
  "mistralai/mistral-nemo",
  "google/gemma-2-9b-it",
  "qwen/qwen-2.5-72b-instruct"
];

/**
 * Fetches and caches the full model catalog from OpenRouter.
 */
export async function fetchModels(): Promise<ORModel[]> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) throw new Error("Failed to fetch models");
    
    const data = await res.json();
    return data.data.map((m: { id: string, name: string, context_length: number }) => ({
      id: m.id,
      name: m.name,
      context_length: m.context_length,
      provider: m.id.split('/')[0]
    }));
  } catch (error) {
    console.error("Failed to fetch OpenRouter models:", error);
    return [];
  }
}
