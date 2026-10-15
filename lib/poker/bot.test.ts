import { describe, expect, it } from "vitest";
import { botDecision, chooseAction, valueBar, type Situation } from "./bot";
import { applyAction, BB, newHand } from "./engine";
import { newProfile, observe } from "./opponentModel";
import { rigDeck } from "./testDeck";

const never = () => 0.99; // kein Bluff
const always = () => 0.01; // Bluff

const spot = (s: Partial<Situation>): Situation => ({
  equity: 0.3,
  need: 0,
  pot: 100,
  currentBet: 0,
  stack: 600,
  opponents: 1,
  street: 1,
  aggression: 0,
  ...s,
});

describe("valueBar", () => {
  it("sinkt mit der Anzahl Gegner und ist begrenzt", () => {
    expect(valueBar(1)).toBe(0.75);
    expect(valueBar(3)).toBeCloseTo(0.45);
  });
});

describe("chooseAction", () => {
  it("geht mit, wenn die Equity die Pot-Odds deckt", () => {
    // Pot-Odds = 100 / (200 + 100) = 0.33
    expect(chooseAction(spot({ equity: 0.36, need: 100, pot: 200 }), never)).toEqual({ action: "call" });
    expect(chooseAction(spot({ equity: 0.3, need: 100, pot: 200 }), never)).toEqual({ action: "fold" });
  });

  it("geht gegen einen aggressiven Spieler leichter mit", () => {
    // Pot-Odds = 100 / 290 ≈ 0.345
    const s = spot({ equity: 0.3, need: 100, pot: 190 });
    expect(chooseAction(s, never).action).toBe("fold");
    expect(chooseAction({ ...s, aggression: 1 }, never).action).toBe("call");
  });

  it("rechnet die Pot-Odds mit dem eigenen Stack, wenn er nicht reicht", () => {
    // muss nur 100 statt 1000 zahlen → Odds 100 / 1130 ≈ 0.09
    expect(chooseAction(spot({ equity: 0.15, need: 1000, pot: 1030, stack: 100 }), never).action).toBe("call");
  });

  it("setzt mit einer starken Hand auf Wert, in Big-Blind-Schritten", () => {
    const d = chooseAction(spot({ equity: 0.9, pot: 100 }), never);
    expect(d.action).toBe("raise");
    expect(d.target! % BB).toBe(0);
    expect(d.target).toBeGreaterThanOrEqual(BB);
  });

  it("erhöht gegen einen Einsatz mit einer sehr starken Hand", () => {
    const d = chooseAction(spot({ equity: 0.95, need: 50, pot: 150, currentBet: 50 }), never);
    expect(d.action).toBe("raise");
    expect(d.target).toBeGreaterThan(50);
  });

  it("schiebt mit einer mittleren Hand ohne Einsatz", () => {
    expect(chooseAction(spot({ equity: 0.4 }), never)).toEqual({ action: "call" });
  });

  it("blufft gelegentlich, aber nur ab dem Flop und gegen höchstens zwei Gegner", () => {
    expect(chooseAction(spot({ equity: 0.1 }), always).action).toBe("raise");
    expect(chooseAction(spot({ equity: 0.1, street: 0 }), always).action).toBe("call");
    expect(chooseAction(spot({ equity: 0.1, opponents: 3 }), always).action).toBe("call");
  });
});

describe("botDecision", () => {
  // Dealer 1 → Du (Sitz 0) ist zuerst am Zug und geht All-In, danach Vera (Sitz 1)
  const shoveSpot = (veraHole: string) => {
    const deck = rigDeck(["Kd Qd", veraHole, "9c 4h", "8s 3c"], "2h 6d Jc 5s Tc");
    return applyAction(newHand([1000, 600, 600, 600], 1, deck), "raise", 1000);
  };

  it("geht gegen ein All-In mit Assen mit", () => {
    expect(botDecision(shoveSpot("As Ah"), never).action).toBe("call");
  });

  it("passt gegen ein All-In mit Müll", () => {
    expect(botDecision(shoveSpot("7s 2d"), never).action).toBe("fold");
  });

  it("setzt auf dem Flop mit einem Drilling", () => {
    const deck = rigDeck(["Kd Qd", "As Ad", "9c 4h", "8s 3c"], "Ah 7c 2d Jc 5s");
    let s = newHand([1000, 600, 600, 600], 0, deck);
    for (let i = 0; i < 4; i++) s = applyAction(s, "call");
    expect(s.toAct).toBe(1);
    expect(botDecision(s, never).action).toBe("raise");
  });

  it("nutzt das Gegnerprofil", () => {
    let p = newProfile();
    for (let i = 0; i < 10; i++) p = observe(p, "raise", 1000, 30);
    const d = botDecision(shoveSpot("Ah 9d"), never, { profile: p });
    expect(["call", "fold"]).toContain(d.action);
  });

  it("ist bei gleicher Situation reproduzierbar", () => {
    const s = shoveSpot("Ah 9d");
    expect(botDecision(s, never)).toEqual(botDecision(s, never));
  });
});
