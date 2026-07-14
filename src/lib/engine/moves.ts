import { Board, Move, PieceKind, Player, Square } from "./types";
import { rowColToSq, sqToRowCol } from "./board";

const DIRS = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

function findCaptures(
  board: Board,
  player: Player,
  startSq: Square,
  currentSq: Square,
  pieceKind: PieceKind,
  capturedSet: Set<Square>,
  currentPath: Square[],
  currentCaptures: Square[]
): Move[] {
  const moves: Move[] = [];
  let foundFurtherCapture = false;
  const { row, col } = sqToRowCol(currentSq);

  if (pieceKind === "man") {
    for (const [dRow, dCol] of DIRS) {
      const jumpOverSq = rowColToSq(row + dRow, col + dCol);
      if (!jumpOverSq) continue;

      const jumpOverPiece = board.get(jumpOverSq);
      // Valid opponent piece not yet captured
      if (
        jumpOverPiece &&
        jumpOverPiece.player !== player &&
        !capturedSet.has(jumpOverSq)
      ) {
        const landingSq = rowColToSq(row + dRow * 2, col + dCol * 2);
        if (landingSq) {
          const landingPiece = board.get(landingSq);
          const isEmpty = !landingPiece || landingSq === startSq;
          if (isEmpty) {
            foundFurtherCapture = true;
            const newCapturedSet = new Set(capturedSet);
            newCapturedSet.add(jumpOverSq);
            moves.push(
              ...findCaptures(
                board,
                player,
                startSq,
                landingSq,
                pieceKind,
                newCapturedSet,
                [...currentPath, landingSq],
                [...currentCaptures, jumpOverSq]
              )
            );
          }
        }
      }
    }
  } else {
    // King
    for (const [dRow, dCol] of DIRS) {
      let r = row + dRow;
      let c = col + dCol;
      let jumpOverSq: Square | null = null;

      while (true) {
        const sq = rowColToSq(r, c);
        if (!sq) break;

        const piece = board.get(sq);
        const isEmpty = !piece || sq === startSq;

        if (!jumpOverSq) {
          if (isEmpty) {
            // Keep sliding until we hit a piece
            r += dRow;
            c += dCol;
            continue;
          } else {
            // Hit a piece
            if (piece!.player === player || capturedSet.has(sq)) {
              // Friendly piece or already captured piece blocks the diagonal
              break;
            }
            // Valid opponent piece
            jumpOverSq = sq;
            r += dRow;
            c += dCol;
          }
        } else {
          // Looking for landing squares after the jump
          if (isEmpty) {
            foundFurtherCapture = true;
            const newCapturedSet = new Set(capturedSet);
            newCapturedSet.add(jumpOverSq);
            moves.push(
              ...findCaptures(
                board,
                player,
                startSq,
                sq,
                pieceKind,
                newCapturedSet,
                [...currentPath, sq],
                [...currentCaptures, jumpOverSq]
              )
            );
            // King can continue sliding to land further away
            r += dRow;
            c += dCol;
          } else {
            // Hit another piece, path ends
            break;
          }
        }
      }
    }
  }

  // If this path cannot capture any further, but it HAS captured pieces, it's a valid end state
  if (!foundFurtherCapture && currentCaptures.length > 0) {
    moves.push({ from: startSq, path: currentPath, captures: currentCaptures });
  }

  return moves;
}

export function getCaptures(board: Board, player: Player): Move[] {
  const moves: Move[] = [];
  for (const [sq, piece] of board.entries()) {
    if (piece.player === player) {
      moves.push(
        ...findCaptures(board, player, sq, sq, piece.kind, new Set(), [], [])
      );
    }
  }

  if (moves.length === 0) return [];

  // FMJD Longest Sequence Rule
  const maxCaptures = Math.max(...moves.map((m) => m.captures.length));
  return moves.filter((m) => m.captures.length === maxCaptures);
}

export function getQuietMoves(board: Board, player: Player): Move[] {
  const moves: Move[] = [];

  for (const [sq, piece] of board.entries()) {
    if (piece.player !== player) continue;

    const { row, col } = sqToRowCol(sq);

    if (piece.kind === "man") {
      // Men move forward only (Black goes down +1, White goes up -1)
      const dRow = player === "white" ? -1 : 1;
      for (const dCol of [-1, 1]) {
        const targetSq = rowColToSq(row + dRow, col + dCol);
        if (targetSq && !board.has(targetSq)) {
          moves.push({ from: sq, path: [targetSq], captures: [] });
        }
      }
    } else {
      // King moves any distance diagonally
      for (const [dRow, dCol] of DIRS) {
        let r = row + dRow;
        let c = col + dCol;
        while (true) {
          const targetSq = rowColToSq(r, c);
          if (!targetSq || board.has(targetSq)) break;
          moves.push({ from: sq, path: [targetSq], captures: [] });
          r += dRow;
          c += dCol;
        }
      }
    }
  }

  return moves;
}

export function getLegalMoves(board: Board, player: Player): Move[] {
  const captures = getCaptures(board, player);
  if (captures.length > 0) {
    return captures;
  }
  return getQuietMoves(board, player);
}
