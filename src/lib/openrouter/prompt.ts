import { Board, GameState, Move, moveToNotation, rowColToSq } from "../engine";

function getSparseList(board: Board): string {
  const white: string[] = [];
  const black: string[] = [];
  for (let sq = 1; sq <= 50; sq++) {
    const p = board.get(sq);
    if (p) {
      const str = p.kind === "king" ? `${sq}(K)` : `${sq}`;
      if (p.player === "white") white.push(str);
      else black.push(str);
    }
  }
  return `White: [${white.join(", ")}]\nBlack: [${black.join(", ")}]`;
}

export function generatePrompt(state: GameState, legalMoves: Move[]): string {
  const moveNotations = legalMoves.map(moveToNotation);

  return `International Draughts (10x10). You are ${state.currentPlayer.toUpperCase()}.

Pieces on board:
${getSparseList(state.board)}

Your legal moves: ${moveNotations.join(", ")}

Pick ONE move from the list above. Reply with ONLY this JSON (no markdown, no extra text):
{"move": "YOUR_CHOSEN_MOVE", "reason": "short reason"}

Example if legal moves were 31-26, 31-27:
{"move": "31-26", "reason": "advances toward center"}`;
}
