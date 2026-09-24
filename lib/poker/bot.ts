import type { Rng } from "./cards";
import { BB, callAmount, type PokerAction, type PokerState } from "./engine";
import { evalBest } from "./evaluate";

export interface BotDecision {
  action: PokerAction;
  target?: number;
}

/** Geschätzte Handstärke 0…1 für einen Sitz. */
export function handStrength(s: PokerState, seat: number): number {
  const p = s.players[seat];
  if (s.community.length === 0) {
    const [a, b] = p.hole;
    let v = ((Math.max(a.r, b.r) - 2) / 12) * 0.5;
    if (a.r === b.r) v += 0.35;
    if (a.s === b.s) v += 0.08;
    if (Math.abs(a.r - b.r) <= 2) v += 0.05;
    return Math.min(1, v);
  }
  const r = evalBest([...p.hole, ...s.community]);
  // Kategorie plus Höhe der besten Karte, damit ein Top-Paar mehr wiegt als ein Bodenpaar
  return Math.min(1, r.cat / 6.5 + (r.top / 14) * 0.12 + 0.1);
}

/** Entscheidung des Computergegners, der gerade am Zug ist. */
export function botDecision(s: PokerState, rng: Rng = Math.random): BotDecision {
  const seat = s.toAct;
  const p = s.players[seat];
  const need = callAmount(s, seat);
  const strength = Math.max(0, Math.min(1, handStrength(s, seat) + (rng() - 0.5) * 0.16));
  // Pot-Odds: welcher Anteil des Endpots muss bezahlt werden?
  const odds = need > 0 ? need / (s.pot + need) : 0;
  const potBet = Math.max(BB, Math.round((s.pot * (strength > 0.8 ? 0.75 : 0.5)) / BB) * BB);

  if (need === 0) {
    if (strength > 0.62 || (strength > 0.42 && rng() < 0.22)) return { action: "raise", target: s.currentBet + potBet };
    return { action: "call" };
  }
  if (strength > 0.78 && p.stack > need + BB) return { action: "raise", target: s.currentBet + potBet };
  if (strength > odds + 0.1) return { action: "call" };
  if (need <= BB && strength > odds * 0.75) return { action: "call" };
  return { action: "fold" };
}
