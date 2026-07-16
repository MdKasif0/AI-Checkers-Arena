"use server";

import { redirect } from "next/navigation";
import { createMatch, finalizeMatch } from "@/lib/supabase/queries";

export async function startMatch(formData: FormData) {
  const whiteModel = formData.get("whiteModel") as string;
  const blackModel = formData.get("blackModel") as string;
  const mode = formData.get("mode") as "ai_vs_ai" | "human_vs_ai" || "ai_vs_ai";

  if (!whiteModel || !blackModel) {
    return { error: "Both models are required" };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { error: "OPENROUTER_API_KEY is missing on server" };
  }

  // Pre-flight check: Ping both models to ensure access and validity
  const pingModel = async (modelId: string) => {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1
        }),
        signal: AbortSignal.timeout(30000)
      });
      if (!res.ok) {
        let msg = res.statusText;
        try {
          const body = await res.json();
          msg = body.error?.message || msg;
        } catch { /* empty */ }
        throw new Error(`${res.status}: ${msg}`);
      }
    } catch (e) {
      throw new Error(`Failed to access ${modelId}. Reason: ${(e as Error).message}`);
    }
  };

  try {
    const promises = [];
    if (whiteModel !== "human") promises.push(pingModel(whiteModel));
    if (blackModel !== "human") promises.push(pingModel(blackModel));
    await Promise.all(promises);
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  const match = await createMatch({ whiteModel, blackModel, mode });
  redirect(`/match/${match.id}`);
}

export async function stopMatchAction(matchId: string) {
  await finalizeMatch(matchId, null, "stopped_by_user");
}
