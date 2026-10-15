/** Festes Haus-Farbschema der Jetons (aus dem Prototyp). */
export const CHIP_STYLES: Record<number, { base: string; fg: string; name: string }> = {
  10: { base: "#2C5FA8", fg: "#FFFFFF", name: "Blau" },
  20: { base: "#B23A2E", fg: "#FFFFFF", name: "Rot" },
  50: { base: "#1B6A4E", fg: "#FFFFFF", name: "Grün" },
  100: { base: "#17181A", fg: "#F2EFE6", name: "Schwarz" },
  500: { base: "#6B3FA0", fg: "#FFFFFF", name: "Violett" },
};

/** Jeton-Werte absteigend. */
export const DENOMS = [500, 100, 50, 20, 10] as const;

/** Greedy: zerlegt einen Betrag in die geringstmögliche Anzahl Jetons. */
export function calculateChips(amount: number): number[] {
  let rest = Math.round(amount);
  const out: number[] = [];
  for (const d of DENOMS) {
    while (rest >= d) {
      out.push(d);
      rest -= d;
    }
  }
  if (rest > 0) out.push(10); // Restbeträge unter dem kleinsten Jeton aufrunden
  return out;
}

export interface ChipViewData {
  val: number;
  base: string;
  fg: string;
  edge: string;
  dash: string;
}

/** Sichtbare Eigenschaften eines Jetons: Randstreifen als conic-gradient. */
export function chipView(val: number): ChipViewData {
  const s = CHIP_STYLES[val] ?? CHIP_STYLES[10];
  const stripes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = i * 12.5;
    stripes.push(`${s.base} ${a}% ${a + 8}%`);
    stripes.push(`#F4EFE0 ${a + 8}% ${a + 12.5}%`);
  }
  return {
    val,
    base: s.base,
    fg: s.fg,
    edge: `conic-gradient(from 0deg,${stripes.join(",")})`,
    dash: "rgba(255,255,255,.45)",
  };
}

export const chipStack = (amount: number, max = 6): ChipViewData[] =>
  calculateChips(amount).slice(0, max).map(chipView);
