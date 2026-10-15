import { cardText, type Rng } from "./cards";
import { BB, callAmount, type PokerAction, type PokerState } from "./engine";
import { estimateEquity } from "./equity";
import { aggression, newProfile, type Profile } from "./opponentModel";
import { hashSeed, seededRng } from "./random";

export interface BotDecision {
  action: PokerAction;
  target?: number;
}

/** Alles, was die Entscheidungsregel braucht. */
export interface Situation {
  equity: number;
  need: number;
  pot: number;
  currentBet: number;
  stack: number;
  opponents: number;
  street: number;
  /** Aggressivität des Spielers 0…1 */
  aggression: number;
}

export interface BotOptions {
  profile?: Profile;
  samples?: number;
}

const BLUFF_RATE = 0.1;
const BLUFF_RAISE_RATE = 0.04;
const CALL_BONUS = 0.08;

/** Ab dieser Equity setzt der Bot auf Wert. */
export const valueBar = (opponents: number) => Math.min(0.75, 1.6 / (opponents + 1) + 0.05);

const roundBB = (x: number) => Math.max(BB, Math.round(x / BB) * BB);

/** Entscheidungsregel (rein, ohne Zufall ausser für Bluffs). */
export function chooseAction(s: Situation, rng: Rng): BotDecision {
  const bar = valueBar(s.opponents);
  const size = roundBB(s.pot * (s.equity > 0.8 ? 0.75 : 0.5));
  const canBluff = s.street >= 1 && s.opponents <= 2;

  if (s.need === 0) {
    if (s.equity >= bar) return { action: "raise", target: s.currentBet + size };
    if (canBluff && rng() < BLUFF_RATE) return { action: "raise", target: s.currentBet + size };
    return { action: "call" };
  }

  const pay = Math.min(s.need, s.stack);
  const odds = pay / (s.pot + pay);
  const effective = s.equity + CALL_BONUS * s.aggression;

  if (s.equity >= Math.max(bar + 0.1, odds + 0.25) && s.stack > pay) {
    return { action: "raise", target: s.currentBet + roundBB(s.pot + s.need) };
  }
  if (effective >= odds) return { action: "call" };
  if (canBluff && rng() < BLUFF_RAISE_RATE && s.stack > pay) {
    return { action: "raise", target: s.currentBet + roundBB(s.pot) };
  }
  return { action: "fold" };
}

/** Entscheidung des Bots am Zug: Equity per Simulation, dann chooseAction. */
export function botDecision(s: PokerState, rng: Rng = Math.random, opts: BotOptions = {}): BotDecision {
  const seat = s.toAct;
  const p = s.players[seat];
  const opponents = s.players.filter((o, i) => i !== seat && !o.folded).length;
  // Equity reproduzierbar aus der Situation seeden
  const key = [...p.hole, ...s.community].map((c) => cardText(c) + c.s).join() + `|${opponents}`;
  const equity = estimateEquity(p.hole, s.community, opponents, seededRng(hashSeed(key)), opts.samples);
  return chooseAction(
    {
      equity,
      need: callAmount(s, seat),
      pot: s.pot,
      currentBet: s.currentBet,
      stack: p.stack,
      opponents,
      street: s.street,
      aggression: aggression(opts.profile ?? newProfile()),
    },
    rng,
  );
}
