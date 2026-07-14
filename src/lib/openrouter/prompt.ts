import { Board, GameState, Move, moveToNotation, rowColToSq } from "../engine";

function getVisualGrid(board: Board): string {
  let grid = "";
  for (let row = 0; row < 10; row++) {
    let line = "";
    for (let col = 0; col < 10; col++) {
      const sq = rowColToSq(row, col);
      if (!sq) {
        line += ". "; // Unplayable light square
      } else {
        const piece = board.get(sq);
        if (!piece) {
          line += "_ "; // Empty dark square
        } else {
          let sym = piece.player === "white" ? "w" : "b";
          if (piece.kind === "king") sym = sym.toUpperCase();
          line += sym + " ";
        }
      }
    }
    grid += line.trimEnd() + "\n";
  }
  return grid;
}

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
  return `White pieces at: ${white.join(", ")}\nBlack pieces at: ${black.join(", ")}`;
}

export function generatePrompt(state: GameState, legalMoves: Move[]): string {
  const isWhite = state.currentPlayer === "white";
  const opponent = isWhite ? "black" : "white";

  const moveNotations = legalMoves.map(moveToNotation);

  return `You are playing International Draughts (10x10 board, FMJD rules).
You are playing as ${state.currentPlayer.toUpperCase()}.
Your opponent is playing as ${opponent.toUpperCase()}.

RULES OF INTERNATIONAL DRAUGHTS:
- The board has 50 playable dark squares numbered 1 to 50.
- Men move forward diagonally one square.
- Kings move diagonally any number of squares (flying kings).
- Capturing is MANDATORY. If you can capture, you must.
- If there are multiple ways to capture, you MUST choose the sequence that captures the MAXIMUM number of pieces (Longest Sequence Rule).
- Men can capture backwards.
- A man reaching the king row only promotes if it ENDS its turn there. If it crosses the king row during a multi-jump, it stays a man.

CURRENT BOARD STATE:

Visual Grid (w=white man, W=white king, b=black man, B=black king, _=empty playable, .=unplayable):
${getVisualGrid(state.board)}

Sparse List:
${getSparseList(state.board)}

YOUR LEGAL MOVES:
You MUST choose exactly one of the following legal moves, represented in standard notation (e.g., 32-28 for quiet, 31x22x13 for captures).
LEGAL MOVES: ${JSON.stringify(moveNotations)}

INSTRUCTIONS:
1. Analyze the board state and the list of legal moves.
2. Select the best tactical move from the EXACT LIST of legal moves provided. Do NOT invent a move.
3. You MUST respond with ONLY a valid JSON object. Do not output any markdown formatting (like \`\`\`json) or conversational text.
4. The JSON must match this schema exactly:
{
  "move": "the exact string of the move you chose from the list",
  "reason": "a very short, one-sentence strategic reason for this move"
}`;
}
