
/** Fächer des europäischen Kessels im Uhrzeigersinn, beginnend bei Zéro. */
export const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7,
  28, 12, 35, 3, 26,
] as const;

export const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

/** Tableau: 3 Reihen × 12 Spalten, oben die Kolonne 3, 6, 9 … */
export const GRID = [
  3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 1, 4, 7, 10, 13, 16, 19, 22,
  25, 28, 31, 34,
] as const;

export type NumberColor = "green" | "red" | "black";
export type OutsideKey = "red" | "black" | "even" | "odd" | "low" | "high" | "d1" | "d2" | "d3";
export type BetKey = `n:${number}` | OutsideKey;
export type Bets = Partial<Record<BetKey, number>>;

export interface SpinResult {
  num: number;
  out: number;
  net: number;
  total: number;
}

export const numberColor = (n: number): NumberColor => (n === 0 ? "green" : RED.has(n) ? "red" : "black");

export const colorName = (n: number) => ({ green: "Grün · Zéro", red: "Rot", black: "Schwarz" })[numberColor(n)];

export const numberBg = (n: number) => ({ green: "#16724E", red: "#B23A2E", black: "#1A1A1A" })[numberColor(n)];

export function placeBet(bets: Bets, key: BetKey, amount: number): Bets {
  return { ...bets, [key]: (bets[key] ?? 0) + amount };
}

export const totalBet = (bets: Bets) => Object.values(bets).reduce<number>((a, v) => a + (v ?? 0), 0);

/** Multiplikator (inkl. Einsatz) eines Aussen-Einsatzes für die Zahl num (≠ 0). */
function outsideWins(key: OutsideKey, num: number): number {
  switch (key) {
    case "red":
      return RED.has(num) ? 2 : 0;
    case "black":
      return RED.has(num) ? 0 : 2;
    case "even":
      return num % 2 === 0 ? 2 : 0;
    case "odd":
      return num % 2 === 1 ? 2 : 0;
    case "low":
      return num <= 18 ? 2 : 0;
    case "high":
      return num >= 19 ? 2 : 0;
    case "d1":
      return num <= 12 ? 3 : 0;
    case "d2":
      return num > 12 && num <= 24 ? 3 : 0;
    case "d3":
      return num > 24 ? 3 : 0;
  }
}

/** Gesamtauszahlung (inkl. Einsätze) für die Gewinnzahl. */
export function payout(num: number, bets: Bets): number {
  let out = 0;
  for (const [key, amount] of Object.entries(bets) as [BetKey, number][]) {
    if (key.startsWith("n:")) {
      if (Number(key.slice(2)) === num) out += amount * 36;
    } else if (num !== 0) {
      out += amount * outsideWins(key as OutsideKey, num);
    }
  }
  return out;
}

export const spinNumber = (rng: () => number = Math.random) => Math.min(36, Math.floor(rng() * 37));

export function resolveSpin(num: number, bets: Bets): SpinResult {
  const total = totalBet(bets);
  const out = payout(num, bets);
  return { num, out, net: out - total, total };
}

