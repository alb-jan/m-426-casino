import { describe, expect, it } from "vitest";
import { cards, newDeck } from "./cards";
import { botDecision, handStrength } from "./bot";
import { applyAction, newHand, type PokerState } from "./engine";

const noNoise = () => 0.5; // (0.5 - 0.5) * 0.16 = 0 → kein Zufallsrauschen

function withHole(seat: number, hole: string, s: PokerState): PokerState {
  const players = s.players.map((p, i) => (i === seat ? { ...p, hole: cards(hole) } : p));
  return { ...s, players };
}

describe("handStrength", () => {
  it("bewertet Pocket-Asse pre-flop sehr stark und 7-2 offsuit schwach", () => {
    const s = newHand([1000, 600, 600, 600], 0, newDeck(() => 0.4));
    expect(handStrength(withHole(3, "As Ah", s), 3)).toBeGreaterThan(0.85);
    expect(handStrength(withHole(3, "7s 2d", s), 3)).toBeLessThan(0.25);
  });

  it("nutzt nach dem Flop die echte Handbewertung", () => {
    const s = { ...newHand([1000, 600, 600, 600], 0, newDeck(() => 0.4)), community: cards("Ac Ad 8s") };
    const strong = handStrength(withHole(3, "As Kh", s), 3);
    const weak = handStrength(withHole(3, "3c 5d", s), 3);
    expect(strong).toBeGreaterThan(weak);
  });
});

describe("botDecision", () => {
  it("erhöht mit einer starken Hand", () => {
    const s = withHole(3, "As Ah", newHand([1000, 600, 600, 600], 0, newDeck(() => 0.4)));
    const d = botDecision(s, noNoise);
    expect(d.action).toBe("raise");
    expect(d.target).toBeGreaterThan(s.currentBet);
  });

  it("passt mit einer schwachen Hand gegen eine grosse Erhöhung", () => {
    let s = newHand([1000, 600, 600, 600], 0, newDeck(() => 0.4));
    s = applyAction(s, "raise", 300); // Milla
    s = withHole(0, "7s 2d", s);
    s = applyAction(s, "call"); // Du
    s = withHole(1, "7c 2h", s); // Vera ist am Zug
    expect(botDecision(s, noNoise).action).toBe("fold");
  });

  it("schiebt mit einer schwachen Hand, wenn nichts zu bezahlen ist", () => {
    let s = newHand([1000, 600, 600, 600], 0, newDeck(() => 0.4));
    s = applyAction(s, "call"); // Milla
    s = applyAction(s, "call"); // Du
    s = applyAction(s, "call"); // Vera
    s = withHole(2, "7s 2d", s); // Ruben (Big Blind) hat die Option
    expect(botDecision(s, noNoise)).toEqual({ action: "call" });
  });
});
