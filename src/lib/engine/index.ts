/**
 * Checkers Game Engine
 * 
 * Pure TypeScript — no UI, no network imports.
 * This module contains all game logic, board state management,
 * and move validation for standard American checkers (8×8).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Which player owns a piece */
export type Player = "red" | "black";

/** A piece can be a normal man or a promoted king */
export type PieceKind = "man" | "king";

/** A single piece on the board */
export interface Piece {
  player: Player;
  kind: PieceKind;
}

/** Board position — row and column, 0-indexed */
export interface Position {
  row: number; // 0 = top (black's home)
  col: number; // 0 = left
}

/** A single move: from one position to another, with optional captures */
export interface Move {
  from: Position;
  to: Position;
  captures: Position[];
}

/** The full state of a checkers game */
export interface GameState {
  /** 8×8 board — null means empty square */
  board: (Piece | null)[][];
  /** Whose turn it is */
  currentPlayer: Player;
  /** Move history */
  moves: Move[];
  /** Game status */
  status: "playing" | "red_wins" | "black_wins" | "draw";
  /** Move number (increments after each player's turn) */
  moveNumber: number;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates the initial board state for a standard 8×8 checkers game.
 * Black pieces start at the top (rows 0–2), red at the bottom (rows 5–7).
 */
export function createInitialState(): GameState {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );

  // Place pieces on dark squares only
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isDarkSquare = (row + col) % 2 === 1;
      if (!isDarkSquare) continue;

      if (row < 3) {
        board[row][col] = { player: "black", kind: "man" };
      } else if (row > 4) {
        board[row][col] = { player: "red", kind: "man" };
      }
    }
  }

  return {
    board,
    currentPlayer: "red",
    moves: [],
    status: "playing",
    moveNumber: 1,
  };
}
