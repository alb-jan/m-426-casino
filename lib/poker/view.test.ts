import { describe, expect, it } from "vitest";
import { newDeck } from "./cards";
import { advanceRunout, applyAction, newHand, type PokerState } from "./engine";
import { rigDeck } from "./testDeck";
import {
  callLabel,
  defaultRaise,
  myHandLabel,
  outcomeMessage,
  raiseLabel,
  raiseStep,
  seatStatus,
  streetLabel,
} from "./view";

const fresh = (stacks = [1000, 600, 600, 600]) => newHand(stacks, 0, newDeck(() => 0.4));

function checkDown(s: PokerState): PokerState {
  let guard = 0;
  while (s.phase === "bet" && guard++ < 50) s = applyAction(s, "call");
  while (s.phase === "runout" && guard++ < 60) s = advanceRunout(s);
  return s;
}

describe("streetLabel", () => {
  it("benennt die Strassen", () => {
    expect([0, 1, 2, 3, 4].map(streetLabel)).toEqual(["Pre-Flop", "Flop", "Turn", "River", "Showdown"]);
    expect(streetLabel(9)).toBe("Showdown");
  });
});

describe("callLabel", () => {
  it("zeigt den Betrag zum Mitgehen", () => {
    const s = applyAction(fresh(), "call"); // Milla, jetzt Du
    expect(callLabel(s)).toBe("Mitgehen (20)");
  });

  it("zeigt Schieben, wenn nichts zu bezahlen ist", () => {
    let s = fresh();
    for (let i = 0; i < 4; i++) s = applyAction(s, "call");
    expect(callLabel(s)).toBe("Schieben");
  });

  it("zeigt All-In, wenn der Stack nicht reicht", () => {
    const s = applyAction(fresh([30, 600, 600, 600]), "raise", 100);
    expect(callLabel(s)).toBe("Mitgehen (All-In 30)");
  });
});

describe("raiseLabel / defaultRaise / raiseStep", () => {
  it("unterscheidet Erhöhen und Setzen", () => {
    const s = fresh();
    expect(raiseLabel(s, 40)).toBe("Erhöhen auf 40");
    let f = s;
    for (let i = 0; i < 4; i++) f = applyAction(f, "call");
    expect(raiseLabel(f, 40)).toBe("Setzen 40");
  });

  it("startet mit dem doppelten Big Blind, begrenzt auf den Stack", () => {
    expect(defaultRaise(fresh())).toBe(40);
    expect(defaultRaise(fresh([30, 600, 600, 600]))).toBe(30);
  });

  it("verändert den Betrag in 20er-Schritten innerhalb der Grenzen", () => {
    const s = fresh();
    expect(raiseStep(s, 40, 1)).toBe(60);
    expect(raiseStep(s, 60, -1)).toBe(40);
    expect(raiseStep(s, 40, -1)).toBe(40);
    expect(raiseStep(s, 1000, 1)).toBe(1000);
  });
});

describe("myHandLabel", () => {
  it("zeigt Pre-Flop die Blinds, danach die eigene Hand", () => {
    const deck = rigDeck(["As Ah", "8c 3h", "8d 3s", "7s 2d"], "Ac 9d 5s Jh 4c");
    let s = newHand([1000, 600, 600, 600], 0, deck);
    expect(myHandLabel(s)).toBe("Blinds 10 / 20 Jetons");
    for (let i = 0; i < 4; i++) s = applyAction(s, "call");
    expect(myHandLabel(s)).toBe("Deine Hand: Drilling");
  });
});

describe("seatStatus", () => {
  it("zeigt Blinds, Am Zug, Gepasst und All-In", () => {
    let s = fresh();
    expect(seatStatus(s, 1).text).toBe("Small Blind");
    expect(seatStatus(s, 3).text).toBe("Am Zug …");
    s = applyAction(s, "fold");
    expect(seatStatus(s, 3)).toEqual({ text: "Gepasst", color: "#8A6F6C" });
    s = applyAction(s, "raise", 1000);
    expect(seatStatus(s, 0)).toEqual({ text: "All-In 1’000", color: "#F0C75C" });
  });
});

describe("outcomeMessage", () => {
  it("meldet den eigenen Gewinn mit Hand", () => {
    const deck = rigDeck(["As Ah", "Kd Kc", "7s 2d", "9c 4h"], "Ac 8d 3s Jh 5c");
    const s = checkDown(newHand([1000, 600, 600, 600], 0, deck));
    expect(outcomeMessage(s)).toBe("Du gewinnst 60 Jetons mit Drilling.");
  });

  it("meldet den Gewinner bei einer Niederlage", () => {
    const deck = rigDeck(["7s 2d", "Kd Kc", "As Ah", "9c 4h"], "Ac 8d 3s Jh 5c");
    const s = checkDown(newHand([1000, 600, 600, 600], 0, deck));
    expect(outcomeMessage(s)).toBe("Ruben gewinnt den Pot mit Drilling.");
  });

  it("meldet einen Sieg ohne Showdown", () => {
    let s = fresh();
    s = applyAction(s, "fold");
    s = applyAction(s, "fold");
    s = applyAction(s, "fold"); // Vera passt → Ruben gewinnt
    expect(s.phase).toBe("done");
    expect(outcomeMessage(s)).toBe("Ruben gewinnt den Pot.");
  });

  it("nennt bei Split-Pots alle Gewinner", () => {
    const deck = rigDeck(["2c 3d", "4h 5h", "2d 3c", "2h 3s"], "As Kd Qh Jc Ts");
    let s = newHand([1000, 600, 600, 600], 0, deck);
    s = applyAction(s, "fold");
    s = applyAction(s, "fold");
    s = checkDown(s);
    expect(outcomeMessage(s)).toBe("Vera & Ruben gewinnt den Pot mit Straße.");
  });
});
