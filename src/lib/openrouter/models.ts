export interface ORModel {
  id: string;
  name: string;
  context_length: number;
  provider: string;
  is_free: boolean;
}

export const DEFAULT_SHORTLIST = [
  "openai/gpt-5.6-sol",
  "openai/o3-mini",
  "google/gemini-2.5-flash",
  "meta-llama/llama-3.3-70b-instruct",
  "anthropic/claude-3.7-sonnet",
  "deepseek/deepseek-r1",
  "mistralai/mistral-large-2411",
  "google/gemma-2-27b-it"
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
    return data.data.map((m: { id: string, name: string, context_length: number, pricing?: { prompt: string, completion: string } }) => ({
      id: m.id,
      name: m.name,
      context_length: m.context_length,
      provider: m.id.split('/')[0],
      is_free: m.pricing?.prompt === "0" && m.pricing?.completion === "0"
    }));
  } catch (error) {
    console.error("Failed to fetch OpenRouter models:", error);
    return [];
  }
}
