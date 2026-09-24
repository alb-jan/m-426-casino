import type { Card } from "./cards";

export const CAT_NAMES = [
  "Höchste Karte",
  "Paar",
  "Zwei Paare",
  "Drilling",
  "Straße",
  "Flush",
  "Full House",
  "Vierling",
  "Straight Flush",
  "Royal Flush",
] as const;

export interface HandResult {
  /** vergleichbarer Wert: höher = besser */
  score: number;
  /** Kategorie 0 (High Card) … 8 (Straight Flush) */
  cat: number;
  /** höchste relevante Karte (bei Straßen die Oberkante) */
  top: number;
}

/** Deutscher Name der Hand; Straight Flush mit Ass hoch = Royal Flush. */
export const handName = (r: HandResult): string => CAT_NAMES[r.cat === 8 && r.top === 14 ? 9 : r.cat];

/** Bewertet genau 5 Karten nach offizieller Hold'em-Rangfolge; Kicker über tie[]. */
export function eval5(hand: Card[]): HandResult {
  const ranks = hand.map((c) => c.r).sort((a, b) => b - a);
  const flush = hand.every((c) => c.s === hand[0].s);
  const counts = new Map<number, number>();
  ranks.forEach((r) => counts.set(r, (counts.get(r) ?? 0) + 1));
  // Gruppen nach Häufigkeit, dann Rang absteigend: [[anzahl, rang], …]
  const groups = [...counts.entries()].map(([r, n]) => [n, r]).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  const uniq = [...new Set(ranks)];

  let straightHigh = 0;
  if (uniq.length === 5) {
    if (uniq[0] - uniq[4] === 4) straightHigh = uniq[0];
    else if (uniq[0] === 14 && uniq[1] === 5) straightHigh = 5; // Wheel A-2-3-4-5
  }

  let cat: number;
  let tie: number[];
  if (flush && straightHigh) [cat, tie] = [8, [straightHigh]];
  else if (groups[0][0] === 4) [cat, tie] = [7, [groups[0][1], groups[1][1]]];
  else if (groups[0][0] === 3 && groups[1][0] === 2) [cat, tie] = [6, [groups[0][1], groups[1][1]]];
  else if (flush) [cat, tie] = [5, ranks];
  else if (straightHigh) [cat, tie] = [4, [straightHigh]];
  else if (groups[0][0] === 3) [cat, tie] = [3, [groups[0][1], ...ranks.filter((r) => r !== groups[0][1])]];
  else if (groups[0][0] === 2 && groups[1][0] === 2) [cat, tie] = [2, [groups[0][1], groups[1][1], groups[2][1]]];
  else if (groups[0][0] === 2) [cat, tie] = [1, [groups[0][1], ...ranks.filter((r) => r !== groups[0][1])]];
  else [cat, tie] = [0, ranks];

  let score = cat;
  for (let i = 0; i < 5; i++) score = score * 16 + (tie[i] ?? 0);
  return { score, cat, top: tie[0] ?? 0 };
}

/** Beste Hand aus 5–7 Karten. Unter 5 Karten (Pre-Flop): nur Paar oder höchste Karte. */
export function evalBest(all: Card[]): HandResult {
  if (all.length < 5) {
    const rs = all.map((c) => c.r).sort((a, b) => b - a);
    const pair = new Set(rs).size < rs.length;
    return { score: (pair ? 1 : 0) * 1048576 + rs[0] * 16 + (rs[1] ?? 0), cat: pair ? 1 : 0, top: rs[0] };
  }
  let best: HandResult | null = null;
  const n = all.length;
  for (let a = 0; a < n - 4; a++)
    for (let b = a + 1; b < n - 3; b++)
      for (let c = b + 1; c < n - 2; c++)
        for (let d = c + 1; d < n - 1; d++)
          for (let e = d + 1; e < n; e++) {
            const r = eval5([all[a], all[b], all[c], all[d], all[e]]);
            if (!best || r.score > best.score) best = r;
          }
  return best!;
}
