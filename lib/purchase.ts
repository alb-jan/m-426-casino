import { formatNumber } from "./format";
import { MAX_CHF, MIN_CHF, RATE } from "./wallet";

export type PurchaseResult = { ok: true; chf: number; chips: number } | { ok: false; error: string };

/** Vollstaendige Betragsyntax; Werte werden zuerst als ganze Rappen gelesen. */
function parseRappen(input: string): number {
  const match = /^(?:CHF\s*)?(\d+)(?:[.,](\d{1,2}))?$/i.exec(input.trim());
  if (!match) return NaN;
  const rappen = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(rappen) ? rappen : NaN;
}

export function parseAmount(input: string): number {
  return parseRappen(input) / 100;
}

const toChips = (chf: number) => Math.floor(Math.round(chf * 100) * RATE / 100);

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
