import { formatChf } from "./format";
import { COLORS } from "./theme";

export interface ExitStat {
  label: string;
  value: string;
  color: string;
}

/** Kennzahlen der Kasse: Eingezahlt, Ausgezahlt, Bilanz. */
export function exitStats(bought: number, cashed: number): ExitStat[] {
  const balance = Math.round((cashed - bought) * 100) / 100;
  const positive = balance >= 0;
  return [
    { label: "Eingezahlt", value: `CHF ${formatChf(bought)}`, color: COLORS.text },
    { label: "Ausgezahlt", value: `CHF ${formatChf(cashed)}`, color: COLORS.gold },
    {
      label: "Bilanz",
      value: `${positive ? "+CHF " : "−CHF "}${formatChf(Math.abs(balance))}`,
      color: positive ? COLORS.win : COLORS.lose,
    },
  ];
}
