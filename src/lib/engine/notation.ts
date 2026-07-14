import { Move } from "./types";

/**
 * Converts a move to standard PDN notation.
 * Quiet move: 32-28
 * Capture: 31x22x13
 */
export function moveToNotation(move: Move): string {
  const isCapture = move.captures.length > 0;
  const sep = isCapture ? "x" : "-";
  return [move.from, ...move.path].join(sep);
}

/**
 * Parses notation back to a move, validating against a list of legal moves.
 * Supports exact canonical match (31x22x13) and shorthand endpoints (31x13).
 */
export function notationToMove(
  notation: string,
  legalMoves: Move[]
): Move | null {
  const isCapture = notation.includes("x");
  const sep = isCapture ? "x" : "-";
  const squares = notation.split(sep).map(Number);

  // 1. Try exact canonical match
  for (const move of legalMoves) {
    const expected = [move.from, ...move.path];
    if (
      expected.length === squares.length &&
      expected.every((sq, i) => sq === squares[i])
    ) {
      return move;
    }
  }

  // 2. Fallback: match by start and end square only (shorthand notation)
  const from = squares[0];
  const to = squares[squares.length - 1];
  const matchingEndpoints = legalMoves.filter(
    (m) => m.from === from && m.path[m.path.length - 1] === to
  );

  if (matchingEndpoints.length === 1) {
    return matchingEndpoints[0];
  }

  return null;
}
