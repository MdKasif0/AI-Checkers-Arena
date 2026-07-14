import { NextResponse } from "next/server";

/**
 * POST /api/openrouter
 * 
 * Proxy endpoint for OpenRouter model calls.
 * Keeps the API key server-side and forwards model requests.
 * Will be implemented in a later step.
 */
export async function POST() {
  return NextResponse.json(
    { message: "OpenRouter API stub — not yet implemented" },
    { status: 200 }
  );
}
