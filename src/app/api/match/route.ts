import { NextResponse } from "next/server";

/**
 * POST /api/match
 * 
 * Game loop API — receives match actions and returns the next game state.
 * Will be implemented in a later step.
 */
export async function POST() {
  return NextResponse.json(
    { message: "Match API stub — not yet implemented" },
    { status: 200 }
  );
}

/**
 * GET /api/match
 * 
 * Fetch current match state (for polling or initial load).
 */
export async function GET() {
  return NextResponse.json(
    { message: "Match API stub — not yet implemented" },
    { status: 200 }
  );
}
