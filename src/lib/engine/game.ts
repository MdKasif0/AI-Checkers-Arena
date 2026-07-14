import { cloneBoard, createInitialBoard, getBoardHash, sqToRowCol } from "./board";
import { getLegalMoves } from "./moves";
import { GameState, GameStatus, Move } from "./types";

export function createInitialState(): GameState {
  const board = createInitialBoard();
  const state: GameState = {
    board,
    currentPlayer: "white", // FMJD rules: White moves first
    moveHistory: [],
    status: "playing",
    moveNumber: 1,
    positionHashes: new Map(),
    halfMoveClock: 0,
  };

  const hash = getBoardHash(board, state.currentPlayer);
  state.positionHashes.set(hash, 1);
  return state;
}

export function applyMove(state: GameState, move: Move): GameState {
  if (state.status !== "playing") return state;

  const board = cloneBoard(state.board);
  const piece = board.get(move.from);
  if (!piece) throw new Error("No piece at start square");
  if (piece.player !== state.currentPlayer)
    throw new Error("Not player's turn");

  // 1. Move piece
  board.delete(move.from);
  const finalSq = move.path[move.path.length - 1];
  board.set(finalSq, piece);

  // 2. Remove captured pieces
  for (const sq of move.captures) {
    board.delete(sq);
  }

  // 3. Promotion
  let promoted = false;
  if (piece.kind === "man") {
    // Promotion happens ONLY if ending on king row
    const { row } = sqToRowCol(finalSq);
    const isKingRow =
      (piece.player === "white" && row === 0) ||
      (piece.player === "black" && row === 9);
    if (isKingRow) {
      board.set(finalSq, { ...piece, kind: "king" });
      promoted = true;
    }
  }

  // 4. Update half-move clock
  const isCapture = move.captures.length > 0;
  const isManMove = piece.kind === "man" && !isCapture;
  let newHalfMoveClock = state.halfMoveClock + 1;
  if (isCapture || isManMove) {
    newHalfMoveClock = 0;
  }

  // 5. Update position hashes
  const nextPlayer = state.currentPlayer === "white" ? "black" : "white";
  const newHashes = new Map(state.positionHashes);

  // Irreversible moves (capture, man move, promotion) clear the history for threefold repetition
  if (isCapture || isManMove || promoted) {
    newHashes.clear();
  }

  const hash = getBoardHash(board, nextPlayer);
  const count = (newHashes.get(hash) || 0) + 1;
  newHashes.set(hash, count);

  // 6. Check game over conditions
  let status: GameStatus = "playing";

  if (count >= 3) {
    status = "draw"; // Threefold repetition
  } else if (newHalfMoveClock >= 50) {
    status = "draw"; // 25-move rule
  } else {
    // Check if next player has moves
    const nextMoves = getLegalMoves(board, nextPlayer);
    if (nextMoves.length === 0) {
      status = state.currentPlayer === "white" ? "white_wins" : "black_wins";
    }
  }

  return {
    board,
    currentPlayer: nextPlayer,
    moveHistory: [...state.moveHistory, move],
    status,
    moveNumber:
      state.currentPlayer === "black" ? state.moveNumber + 1 : state.moveNumber,
    positionHashes: newHashes,
    halfMoveClock: newHalfMoveClock,
  };
}
