import { formatNumber } from "@/lib/format";
import type { ToastKind } from "@/lib/events";
import { RED, type SpinResult } from "./rules";

export function spinMessage(r: SpinResult): { kind: ToastKind; title: string; msg: string } {
  const col = r.num === 0 ? "Grün" : RED.has(r.num) ? "Rot" : "Schwarz";
  const head = `${r.num} ${col} – `;
  if (r.net > 0) {
    return { kind: "win", title: "Gewonnen!", msg: `${head}Auszahlung ${formatNumber(r.out)} Jetons (+${formatNumber(r.net)}).` };
  }
  if (r.out > 0) {
    return { kind: "info", title: "Runde beendet", msg: `${head}Auszahlung ${formatNumber(r.out)} Jetons (${formatNumber(r.net)}).` };
  }
  return { kind: "lose", title: "Verloren", msg: `${head}Einsatz von ${formatNumber(r.total)} Jetons verfällt.` };
}
