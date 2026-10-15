import { describe, expect, it } from "vitest";
import { botDecision } from "./bot";
import { newDeck } from "./cards";
import { advanceRunout, applyAction, minRaiseTarget, newHand, type PokerAction, type PokerState } from "./engine";
import { newProfile, observe, type Profile } from "./opponentModel";
import { seededRng } from "./random";

type Strategy = (s: PokerState) => [PokerAction, number?];

/** Spielt `hands` Hände; liefert den durchschnittlichen Gewinn des Spielers pro Hand. */
function simulate(strategy: Strategy, hands: number): number {
  const rng = seededRng(2026);
  let profile: Profile = newProfile();
  let net = 0;
  for (let h = 0; h < hands; h++) {
    let s = newHand([1000, 600, 600, 600], h % 4, newDeck(seededRng(h + 1)));
    for (let guard = 0; s.phase !== "done" && guard < 200; guard++) {
      if (s.phase === "runout") s = advanceRunout(s);
      else if (s.toAct === 0) {
        const [a, t] = strategy(s);
        const before = s.players[0].committed;
        const next = applyAction(s, a, t);
        profile = observe(profile, a, next.players[0].committed - before, s.pot);
        s = next;
      } else {
        const d = botDecision(s, rng, { profile, samples: 120 });
        s = applyAction(s, d.action, d.target);
      }
    }
    net += s.players[0].stack - 1000;
  }
  return net / hands;
}

describe("Bots lassen sich nicht mehr ausnutzen (Simulation, 300 Hände)", () => {
  it("„immer All-In“ verliert auf Dauer", () => {
    expect(simulate((s) => ["raise", s.players[0].bet + s.players[0].stack], 300)).toBeLessThan(0);
  }, 120000);

  it("„immer Pot-gross setzen“ verliert auf Dauer", () => {
    expect(simulate((s) => ["raise", s.currentBet + Math.max(20, s.pot)], 300)).toBeLessThan(0);
  }, 120000);

  it("„immer minimal erhöhen“ verliert auf Dauer", () => {
    expect(simulate((s) => ["raise", minRaiseTarget(s)], 300)).toBeLessThan(0);
  }, 120000);
});
