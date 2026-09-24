/**
 * Schweizer Tausendertrennzeichen. Bewusst fest codiert statt toLocaleString('de-CH'):
 * Node (Server) liefert "'" (U+0027), Chrome dagegen "’" (U+2019). Unterschiedliche
 * Ausgaben auf Server und Client würden zu React-Hydration-Fehlern führen.
 */
const THOUSANDS = "’";

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS);
}

/** Ganzzahl im Schweizer Format, z. B. 1’000. */
export function formatNumber(n: number): string {
  const r = Math.round(n);
  const sign = r < 0 ? "-" : "";
  return sign + groupThousands(String(Math.abs(r)));
}

/** Frankenbetrag mit genau zwei Nachkommastellen, z. B. 1’000.00. */
export function formatChf(n: number): string {
  const sign = n < 0 ? "-" : "";
  const [int, dec] = Math.abs(n).toFixed(2).split(".");
  return sign + groupThousands(int) + "." + dec;
}

/** Gewinn/Verlust mit Vorzeichen: +50, −50 (echtes Minus) oder ±0. */
export function formatSigned(n: number): string {
  const r = Math.round(n);
  if (r > 0) return "+" + formatNumber(r);
  if (r < 0) return "−" + formatNumber(-r);
  return "±0";
}
