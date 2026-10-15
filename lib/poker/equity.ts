import { SUITS, type Card, type Rng } from "./cards";
import { evalBest } from "./evaluate";

const FULL_DECK: Card[] = [];
for (let r = 2; r <= 14; r++) for (const s of SUITS) FULL_DECK.push({ r, s: s.s, red: s.red });

/** Gewinnwahrscheinlichkeit (0…1) gegen zufällige Gegnerhände, per Monte-Carlo. */
export function estimateEquity(hole: Card[], board: Card[], opponents: number, rng: Rng, samples = 250): number {
  const known = new Set([...hole, ...board].map((c) => c.r + c.s));
  const rest = FULL_DECK.filter((c) => !known.has(c.r + c.s));
  const need = opponents * 2 + (5 - board.length);
  let score = 0;

  for (let i = 0; i < samples; i++) {
    // Teil-Mischen: nur so viele Karten ziehen wie nötig
    const d = rest.slice();
    for (let k = 0; k < need; k++) {
      const j = k + Math.floor(rng() * (d.length - k));
      [d[k], d[j]] = [d[j], d[k]];
    }
    const fullBoard = [...board, ...d.slice(opponents * 2, need)];
    const mine = evalBest([...hole, ...fullBoard]).score;
    const opp = Array.from({ length: opponents }, (_, o) => evalBest([d[o * 2], d[o * 2 + 1], ...fullBoard]).score);
    const best = Math.max(...opp);
    if (mine > best) score += 1;
    else if (mine === best) score += 1 / (opp.filter((v) => v === best).length + 1);
  }
  return score / samples;
}
