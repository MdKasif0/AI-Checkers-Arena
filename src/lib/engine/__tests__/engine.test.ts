import { describe, expect, it } from "vitest";
import {
  applyMove,
  createInitialState,
  getBoardHash,
  getLegalMoves,
  moveToNotation,
  notationToMove,
  rowColToSq,
  sqToRowCol,
  GameState,
  Board,
  Player,
  Move,
} from "../index";

describe("Board Coordinates", () => {
  it("converts all 50 squares back and forth correctly", () => {
    for (let sq = 1; sq <= 50; sq++) {
      const { row, col } = sqToRowCol(sq);
      const reversed = rowColToSq(row, col);
      expect(reversed).toBe(sq);
    }
  });

  it("returns null for invalid or light squares", () => {
    expect(rowColToSq(-1, 0)).toBeNull();
    expect(rowColToSq(10, 0)).toBeNull();
    expect(rowColToSq(0, 0)).toBeNull(); // top-left is light in 10x10
    expect(rowColToSq(0, 2)).toBeNull();
  });
});

describe("Initial State", () => {
  it("sets up exactly 20 black and 20 white pieces correctly", () => {
    const state = createInitialState();
    let blackCount = 0;
    let whiteCount = 0;

    for (let sq = 1; sq <= 50; sq++) {
      const piece = state.board.get(sq);
      if (piece) {
        if (piece.player === "black") blackCount++;
        if (piece.player === "white") whiteCount++;
      }
    }

    expect(blackCount).toBe(20);
    expect(whiteCount).toBe(20);
    expect(state.board.get(1)?.player).toBe("black"); // top
    expect(state.board.get(50)?.player).toBe("white"); // bottom
    expect(state.currentPlayer).toBe("white"); // white moves first
  });
});

describe("Moves and Captures", () => {
  function setupCustomState(
    pieces: Array<{ sq: number; player: Player; kind: "man" | "king" }>,
    currentPlayer: Player = "white"
  ): GameState {
    const board: Board = new Map();
    for (const p of pieces) {
      board.set(p.sq, { player: p.player, kind: p.kind });
    }
    return {
      board,
      currentPlayer,
      moveHistory: [],
      status: "playing",
      moveNumber: 1,
      positionHashes: new Map(),
      halfMoveClock: 0,
    };
  }

  it("generates forward quiet moves for men", () => {
    // White man at 32
    const state = setupCustomState([{ sq: 32, player: "white", kind: "man" }]);
    const moves = getLegalMoves(state.board, state.currentPlayer);
    const notations = moves.map(moveToNotation).sort();
    // 32 goes to 27 and 28 (row 6 -> row 5)
    expect(notations).toEqual(["32-27", "32-28"]);

    // Black man at 19
    const stateB = setupCustomState(
      [{ sq: 19, player: "black", kind: "man" }],
      "black"
    );
    const movesB = getLegalMoves(stateB.board, stateB.currentPlayer);
    const notationsB = movesB.map(moveToNotation).sort();
    // 19 goes to 23 and 24 (row 3 -> row 4)
    expect(notationsB).toEqual(["19-23", "19-24"]);
  });

  it("suppresses quiet moves when captures exist", () => {
    const state = setupCustomState([
      { sq: 32, player: "white", kind: "man" },
      { sq: 27, player: "black", kind: "man" },
      { sq: 33, player: "white", kind: "man" }, // 33 has no capture, could move to 28 or 29
    ]);
    const moves = getLegalMoves(state.board, state.currentPlayer);
    // 32x21 is the only capture. 33 moving quiet should be suppressed.
    expect(moves.length).toBe(1);
    expect(moveToNotation(moves[0])).toBe("32x21");
  });

  it("enforces the longest capture sequence rule", () => {
    const state = setupCustomState([
      { sq: 32, player: "white", kind: "man" },
      { sq: 27, player: "black", kind: "man" }, // Jump to 21 (1 capture)
      { sq: 28, player: "black", kind: "man" }, // Jump to 23, then another to 14 (2 captures)
      { sq: 18, player: "black", kind: "man" },
    ]);
    const moves = getLegalMoves(state.board, state.currentPlayer);
    const notations = moves.map(moveToNotation);
    expect(notations).toEqual(["32x23x12"]);
  });

  it("allows backward captures for men", () => {
    // White at 22, black at 28, empty 33
    const state = setupCustomState([
      { sq: 22, player: "white", kind: "man" },
      { sq: 28, player: "black", kind: "man" },
    ]);
    const moves = getLegalMoves(state.board, state.currentPlayer);
    const notations = moves.map(moveToNotation);
    expect(notations).toEqual(["22x33"]);
  });

  it("handles multi-jump chains and deferred removal", () => {
    // A perfect diamond jump to test deferred removal and landing on startSq
    const stateCircle = setupCustomState([
      { sq: 33, player: "white", kind: "man" },
      { sq: 28, player: "black", kind: "man" },
      { sq: 18, player: "black", kind: "man" },
      { sq: 19, player: "black", kind: "man" },
      { sq: 29, player: "black", kind: "man" },
    ]);
    const movesCircle = getLegalMoves(stateCircle.board, stateCircle.currentPlayer);
    const nots = movesCircle.map(moveToNotation).sort();
    expect(nots).toEqual([
      "33x22x13x24x33",
      "33x24x13x22x33"
    ].sort());
  });

  it("handles flying kings sliding and capturing", () => {
    const state = setupCustomState([
      { sq: 46, player: "white", kind: "king" },
      { sq: 28, player: "black", kind: "man" },
    ]);
    const moves = getLegalMoves(state.board, state.currentPlayer);
    const notations = moves.map(moveToNotation).sort();
    // 46 sliding jumps 28, lands on 23, 19, 14, 10, 5
    expect(notations).toEqual(["46x10", "46x14", "46x19", "46x23", "46x5"]);
  });
});

describe("Game Rules", () => {
  function setupState(
    pieces: Array<{ sq: number; player: Player; kind: "man" | "king" }>,
    currentPlayer: Player = "white"
  ): GameState {
    const board: Board = new Map();
    for (const p of pieces) {
      board.set(p.sq, { player: p.player, kind: p.kind });
    }
    const state: GameState = {
      board,
      currentPlayer,
      moveHistory: [],
      status: "playing",
      moveNumber: 1,
      positionHashes: new Map(),
      halfMoveClock: 0,
    };
    state.positionHashes.set(getBoardHash(board, currentPlayer), 1);
    return state;
  }

  it("promotes man ending on king row", () => {
    const state = setupState([
      { sq: 6, player: "white", kind: "man" },
    ]);
    // 6 goes to 1
    const moves = getLegalMoves(state.board, state.currentPlayer);
    const nextState = applyMove(state, moves[0]); // 6-1
    expect(nextState.board.get(1)?.kind).toBe("king");
  });

  it("does NOT promote man crossing king row mid-capture", () => {
    const state = setupState([
      { sq: 11, player: "white", kind: "man" },
      { sq: 7, player: "black", kind: "man" }, // lands on 2 (king row)
      { sq: 8, player: "black", kind: "man" }, // backward jump from 2 over 8 to 13
    ]);
    const moves = getLegalMoves(state.board, state.currentPlayer);
    const move = moves.find(m => moveToNotation(m) === "11x2x13");
    expect(move).toBeDefined();
    const nextState = applyMove(state, move!);
    expect(nextState.board.get(13)?.kind).toBe("man"); // stays man
  });

  it("detects draw by threefold repetition", () => {
    let state = setupState([
      { sq: 46, player: "white", kind: "king" },
      { sq: 5, player: "black", kind: "king" },
    ]);

    // W: 46-41
    state = applyMove(state, { from: 46, path: [41], captures: [] });
    // B: 5-10
    state = applyMove(state, { from: 5, path: [10], captures: [] });
    
    // Rep 1 (same as pos 3)
    // W: 41-46
    state = applyMove(state, { from: 41, path: [46], captures: [] });
    // B: 10-5
    state = applyMove(state, { from: 10, path: [5], captures: [] });

    // Rep 2
    state = applyMove(state, { from: 46, path: [41], captures: [] });
    state = applyMove(state, { from: 5, path: [10], captures: [] });
    state = applyMove(state, { from: 41, path: [46], captures: [] });
    state = applyMove(state, { from: 10, path: [5], captures: [] });

    expect(state.status).toBe("draw");
  });

  it("detects draw by 25-move rule (50 plies)", () => {
    let state = setupState([
      { sq: 46, player: "white", kind: "king" },
      { sq: 5, player: "black", kind: "king" },
    ]);
    
    // Force clock to 49 for testing
    state.halfMoveClock = 49;
    
    // White plays 46-41
    state = applyMove(state, { from: 46, path: [41], captures: [] });
    expect(state.status).toBe("draw");
  });

  it("detects loss when no legal moves exist", () => {
    const state = setupState([
      { sq: 1, player: "white", kind: "man" },
      { sq: 6, player: "black", kind: "king" },
      { sq: 7, player: "black", kind: "king" },
      { sq: 11, player: "black", kind: "king" },
      { sq: 12, player: "black", kind: "king" },
    ]);
    // White at 1 has no forward moves (at edge) and backward captures are blocked by 11 and 12.
    const moves = getLegalMoves(state.board, state.currentPlayer);
    expect(moves.length).toBe(0);
    
    // But applyMove is called by the PREVIOUS player to reach this state.
    // Let's manually trigger state transition from Black.
    const prevState = setupState([
      { sq: 1, player: "white", kind: "man" },
      { sq: 11, player: "black", kind: "king" }, // moving to 6
      { sq: 7, player: "black", kind: "king" },
      { sq: 12, player: "black", kind: "king" }, // block backward jump
    ], "black");
    
    const nextState = applyMove(prevState, { from: 11, path: [6], captures: [] });
    expect(nextState.status).toBe("black_wins");
  });

  it("clears position hashes on irreversible moves", () => {
    let state = setupState([
      { sq: 32, player: "white", kind: "man" },
      { sq: 19, player: "black", kind: "man" },
    ]);
    // White man quiet move (irreversible in draughts because men only move forward)
    state = applyMove(state, { from: 32, path: [28], captures: [] });
    // Hashes should only contain the current position
    expect(state.positionHashes.size).toBe(1);
    expect(state.halfMoveClock).toBe(0);
  });
});

describe("Notation", () => {
  it("parses canonical and shorthand notation to Move object", () => {
    const legalMoves: Move[] = [
      { from: 31, path: [22, 13], captures: [27, 18] },
      { from: 32, path: [28], captures: [] },
    ];

    expect(notationToMove("32-28", legalMoves)).toEqual(legalMoves[1]);
    // Shorthand endpoints
    expect(notationToMove("31x13", legalMoves)).toEqual(legalMoves[0]);
    // Canonical exact
    expect(notationToMove("31x22x13", legalMoves)).toEqual(legalMoves[0]);
  });
});
