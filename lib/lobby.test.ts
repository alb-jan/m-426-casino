import { describe, expect, it } from "vitest";
import { checkGameEntry, GAME_MIN_CHIPS } from "./lobby";

describe("checkGameEntry", () => {
  it("kennt die Mindestguthaben", () => {
    expect(GAME_MIN_CHIPS).toEqual({ poker: 20, roulette: 10 });
  });

  it("lässt mit genügend Jetons an den Tisch", () => {
    expect(checkGameEntry("poker", 20)).toEqual({ ok: true });
    expect(checkGameEntry("roulette", 10)).toEqual({ ok: true });
  });

  it("verweigert Poker unter dem Big Blind", () => {
    expect(checkGameEntry("poker", 19)).toEqual({
      ok: false,
      title: "Zu wenig Jetons",
      msg: "Für Poker brauchst du mindestens 20 Jetons (Big Blind).",
    });
  });

  it("verweigert Roulette unter dem kleinsten Jeton", () => {
    expect(checkGameEntry("roulette", 5)).toEqual({
      ok: false,
      title: "Zu wenig Jetons",
      msg: "Für Roulette brauchst du mindestens 10 Jetons (kleinster Jeton).",
    });
  });
});
