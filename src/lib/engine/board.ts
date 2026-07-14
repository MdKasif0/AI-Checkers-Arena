import { Board, Player, Square } from "./types";

/**
 * Converts a square number (1-50) to row and column coordinates (0-indexed).
 * 
 * FMJD numbering scheme:
 * Row 0: cols 1, 3, 5, 7, 9 -> squares 1-5
 * Row 1: cols 0, 2, 4, 6, 8 -> squares 6-10
 * ...
 */
export function sqToRowCol(sq: Square): { row: number; col: number } {
  if (sq < 1 || sq > 50) {
    throw new Error(`Invalid square number: ${sq}`);
  }
  const zeroIndexedSq = sq - 1;
  const row = Math.floor(zeroIndexedSq / 5);
  const i = zeroIndexedSq % 5;
  const col = i * 2 + (row % 2 === 0 ? 1 : 0);
  return { row, col };
}

/**
 * Converts row and column coordinates (0-indexed) to a square number (1-50).
 * Returns null if the square is not playable (i.e. a light square) or out of bounds.
 */
export function rowColToSq(row: number, col: number): Square | null {
  if (row < 0 || row > 9 || col < 0 || col > 9) return null;
  const isPlayable = (row + col) % 2 !== 0;
  if (!isPlayable) return null;
  
  return row * 5 + Math.floor(col / 2) + 1;
}

/**
 * Creates the standard 10x10 International Draughts starting board.
 * Black pieces on squares 1-20, White pieces on squares 31-50.
 */
export function createInitialBoard(): Board {
  const board: Board = new Map();
  for (let sq = 1; sq <= 20; sq++) {
    board.set(sq, { player: "black", kind: "man" });
  }
  for (let sq = 31; sq <= 50; sq++) {
    board.set(sq, { player: "white", kind: "man" });
  }
  return board;
}

/**
 * Clones the board map.
 */
export function cloneBoard(board: Board): Board {
  // Piece objects are shallow, so cloning the map is sufficient.
  return new Map(board);
}

/**
 * Generates a deterministic string hash of the board state and current player.
 * Used for detecting threefold repetition.
 */
export function getBoardHash(board: Board, currentPlayer: Player): string {
  let hash = `${currentPlayer[0]}:`;
  // Iterate strictly 1 to 50 for deterministic ordering
  for (let sq = 1; sq <= 50; sq++) {
    const piece = board.get(sq);
    if (piece) {
      // e.g. "1bm," (1: black man)
      hash += `${sq}${piece.player[0]}${piece.kind[0]},`;
    }
  }
  return hash;
}
