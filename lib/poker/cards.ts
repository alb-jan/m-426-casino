export type Suit = "♠" | "♥" | "♦" | "♣";

export interface Card {
  /** Rang 2–14 (11 = J, 12 = Q, 13 = K, 14 = A) */
  r: number;
  s: Suit;
  red: boolean;
}

export type Rng = () => number;

export const SUITS: { s: Suit; red: boolean; code: string }[] = [
  { s: "♠", red: false, code: "s" },
  { s: "♥", red: true, code: "h" },
  { s: "♦", red: true, code: "d" },
  { s: "♣", red: false, code: "c" },
];

const RANK_CODES = "23456789TJQKA";
const FACE: Record<number, string> = { 11: "J", 12: "Q", 13: "K", 14: "A" };

/** "As", "Th", "2d" → Karte. */
export function parseCard(code: string): Card {
  const r = RANK_CODES.indexOf(code[0]?.toUpperCase()) + 2;
  const suit = SUITS.find((x) => x.code === code[1]?.toLowerCase());
  if (r < 2 || !suit || code.length !== 2) throw new Error(`Ungültige Karte: ${code}`);
  return { r, s: suit.s, red: suit.red };
}

/** "As Kd 9h" → Karten. */
export const cards = (codes: string): Card[] => codes.trim().split(/\s+/).map(parseCard);

/** Anzeigetext des Rangs: 2–10 als Zahl, Bildkarten als Buchstabe. */
export const cardText = (c: Card): string => (c.r <= 10 ? String(c.r) : FACE[c.r]);

/** 52 Karten, mit Fisher-Yates gemischt. */
export function newDeck(rng: Rng = Math.random): Card[] {
  const d: Card[] = [];
  for (let r = 2; r <= 14; r++) for (const s of SUITS) d.push({ r, s: s.s, red: s.red });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}
