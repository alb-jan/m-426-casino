import { formatNumber } from "./format";
import { MAX_CHF, MIN_CHF, RATE } from "./wallet";

export type PurchaseResult = { ok: true; chf: number; chips: number } | { ok: false; error: string };

/** Text → Frankenbetrag. Komma wird als Dezimaltrennzeichen akzeptiert. */
export function parseAmount(input: string): number {
  return parseFloat(String(input).replace(",", ".").replace(/[^0-9.]/g, ""));
}

const toChips = (chf: number) => Math.floor(Math.round(chf * RATE * 1000) / 1000);

/** Jetons, die der Spieler für die Eingabe erhalten würde (0 bei ungültiger Eingabe). */
export function previewChips(input: string): number {
  const v = parseAmount(input);
  return Number.isFinite(v) && v > 0 ? toChips(v) : 0;
}

export function validatePurchase(input: string): PurchaseResult {
  if (!input.trim()) return { ok: false, error: "Bitte gib einen Betrag ein." };
  const v = parseAmount(input);
  if (!Number.isFinite(v) || v <= 0) {
    return { ok: false, error: "Ungültiger Betrag – bitte nur Zahlen eingeben, z. B. 25 oder 12.50." };
  }
  if (v < MIN_CHF) {
    return {
      ok: false,
      error: `Der Mindestbetrag beträgt CHF ${formatNumber(MIN_CHF)} (= ${formatNumber(MIN_CHF * RATE)} Jetons).`,
    };
  }
  if (v > MAX_CHF) return { ok: false, error: `Pro Kauf sind maximal CHF ${MAX_CHF} möglich.` };
  return { ok: true, chf: v, chips: toChips(v) };
}
