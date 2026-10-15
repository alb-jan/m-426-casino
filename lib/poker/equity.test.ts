import { describe, expect, it } from "vitest";
import { cards } from "./cards";
import { estimateEquity } from "./equity";
import { seededRng } from "./random";

const eq = (hole: string, board: string, opp: number, n = 3000) =>
  estimateEquity(cards(hole), board ? cards(board) : [], opp, seededRng(1), n);

describe("estimateEquity", () => {
  it("entspricht bekannten Pre-Flop-Werten", () => {
    expect(eq("As Ah", "", 1)).toBeCloseTo(0.85, 1);
    expect(eq("As Ah", "", 3)).toBeCloseTo(0.64, 1);
    expect(eq("7s 2d", "", 1)).toBeCloseTo(0.35, 1);
    expect(eq("7s 2d", "", 3)).toBeLessThan(0.2);
  });

  it("ist 1 mit der unschlagbaren Hand", () => {
    expect(eq("Ah Kh", "Qh Jh Th 2c 3d", 3, 300)).toBe(1);
  });

  it("wertet Split-Pots anteilig", () => {
    // Board ist eine Strasse, die niemand verbessern kann
    expect(eq("2c 3d", "As Kd Qh Jc Ts", 1, 300)).toBeCloseTo(0.5, 0);
  });

  it("ist reproduzierbar mit gleichem Seed", () => {
    expect(eq("Kc Qc", "2c 7c 9d", 2, 500)).toBe(eq("Kc Qc", "2c 7c 9d", 2, 500));
  });
});
