import { describe, expect, it } from "vitest";
import { extractJson, generatePrompt } from "../index";
import { createInitialState, getLegalMoves } from "../../engine";

describe("JSON Extractor", () => {
  it("extracts valid JSON from clean output", () => {
    const text = `{"move": "32-28", "reason": "Good move"}`;
    const result = extractJson(text);
    expect(result).toEqual({ move: "32-28", reason: "Good move" });
  });

  it("extracts valid JSON surrounded by markdown and text", () => {
    const text = `
      Here is my move:
      \`\`\`json
      {
        "move": "31-26",
        "reason": "Control the center"
      }
      \`\`\`
      I hope this helps!
    `;
    const result = extractJson(text);
    expect(result).toEqual({ move: "31-26", reason: "Control the center" });
  });

  it("throws an error if no JSON object is found", () => {
    const text = `I am going to play 32-28 because it is a good move.`;
    expect(() => extractJson(text)).toThrow("No JSON object found");
  });

  it("throws an error if JSON is missing required schema fields", () => {
    const text = `{"movement": "32-28", "why": "idk"}`;
    expect(() => extractJson(text)).toThrow("JSON does not match the required schema");
  });
});

describe("Prompt Generation", () => {
  it("generates a prompt containing board representations and legal moves", () => {
    const state = createInitialState();
    const legalMoves = getLegalMoves(state.board, state.currentPlayer);
    const prompt = generatePrompt(state, legalMoves);

    // Should state the player
    expect(prompt).toContain("You are playing as WHITE.");
    // Should contain the visual grid (some dark empty squares represented by _)
    expect(prompt).toContain("_");
    expect(prompt).toContain("w"); // white piece symbol
    expect(prompt).toContain("b"); // black piece symbol
    // Should contain sparse list
    expect(prompt).toContain("White pieces at: 31, 32");
    expect(prompt).toContain("Black pieces at: 1, 2");
    // Should list legal moves
    expect(prompt).toContain("32-28");
    expect(prompt).toContain("33-29");
  });
});
