/**
 * Core type definitions for the International Draughts (10x10) engine.
 */

export type Player = "black" | "white";
export type PieceKind = "man" | "king";

export interface Piece {
  player: Player;
  kind: PieceKind;
}

/**
 * Square numbering: 1-50 (FMJD standard).
 * 0 is invalid.
 */
export type Square = number;

/**
 * The sparse representation of the board state.
 * Only occupied squares are present in the map.
 */
export type Board = Map<Square, Piece>;

/**
 * A move in the game.
 */
export interface Move {
  /** The starting square. */
  from: Square;
  /**
   * The sequence of landing squares.
   * For quiet moves, length is 1.
   * For captures, it contains the intermediate and final landing squares.
   */
  path: Square[];
  /**
   * The squares of pieces captured during this move.
   * Captured pieces are removed ONLY after the entire move is completed.
   */
  captures: Square[];
}

export type GameStatus = "playing" | "white_wins" | "black_wins" | "draw";

export interface GameState {
  board: Board;
  currentPlayer: Player;
  /** History of all moves played. */
  moveHistory: Move[];
  status: GameStatus;
  /** The move number. Increments after black's turn. */
  moveNumber: number;
  /** Hashes of previous positions to detect threefold repetition. */
  positionHashes: Map<string, number>;
  /** Plies since the last capture or man move. Reaches 50 for a draw. */
  halfMoveClock: number;
}
