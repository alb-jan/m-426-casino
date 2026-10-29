import { describe, expect, it } from "vitest";
import { chipsToChf, initialWallet, MAX_CHF, MIN_CHF, RATE, walletReducer } from "./wallet";

describe("Konstanten", () => {
  it("entsprechen den Spielregeln", () => {
    expect(RATE).toBe(10);
    expect(MIN_CHF).toBe(5);
    expect(MAX_CHF).toBe(500);
  });
});

describe("walletReducer", () => {
  it("startet auf der Landingpage ohne Guthaben", () => {
    expect(initialWallet).toEqual({ route: { kind: "landing" }, chips: 0, bought: 0, cashed: 0 });
  });

  it("navigiert zwischen Bildschirmen", () => {
    expect(walletReducer(initialWallet, { type: "navigate", route: { kind: "lobby" } }).route).toEqual({kind:"lobby"});
  });

  it("verbucht Einzahlungen", () => {
    const s1 = walletReducer(initialWallet, { type: "deposit", chf: 25, chips: 250 });
    const s2 = walletReducer(s1, { type: "deposit", chf: 10, chips: 100 });
    expect(s2.chips).toBe(350);
    expect(s2.bought).toBe(35);
  });

  it("setzt und verändert das Guthaben, nie unter 0", () => {
    const s = walletReducer(initialWallet, { type: "setChips", chips: 500 });
    expect(s.chips).toBe(500);
    expect(walletReducer(s, { type: "adjustChips", delta: -120 }).chips).toBe(380);
    expect(walletReducer(s, { type: "adjustChips", delta: -9999 }).chips).toBe(0);
  });

  it("zahlt aus und wechselt zur Kasse", () => {
    const s = walletReducer({ ...initialWallet, route: { kind: "lobby" }, chips: 455, bought: 50 }, { type: "cashOut" });
    expect(s.route).toEqual({kind:"exit"});
    expect(s.cashed).toBe(45.5);
  });

  it("startet eine neue Sitzung auf dem Kaufbildschirm", () => {
    const s = walletReducer({ route: { kind: "exit" }, chips: 40, bought: 50, cashed: 4 }, { type: "reset" });
    expect(s).toEqual({ route: { kind: "buy" }, chips: 0, bought: 0, cashed: 0 });
  });
});

describe("chipsToChf", () => {
  it("rechnet Jetons in Franken um", () => {
    expect(chipsToChf(455)).toBe(45.5);
  });
});
