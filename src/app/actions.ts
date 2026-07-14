"use server";

import { redirect } from "next/navigation";
import { createMatch } from "@/lib/supabase/queries";

export async function startMatch(formData: FormData) {
  const whiteModel = formData.get("whiteModel") as string;
  const blackModel = formData.get("blackModel") as string;

  if (!whiteModel || !blackModel) {
    throw new Error("Both models are required");
  }

  const match = await createMatch({ whiteModel, blackModel });
  redirect(`/match/${match.id}`);
}
