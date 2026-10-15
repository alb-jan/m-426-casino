"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCasino } from "@/components/casino/CasinoProvider";
import { useNotify } from "@/components/notifications/NotificationProvider";
import { formatNumber } from "@/lib/format";
import {
  placeBet,
  resolveSpin,
  spinMessage,
  spinNumber,
  totalBet,
  type BetKey,
  type Bets,
  type SpinResult,
} from "@/lib/roulette/rules";

export interface RouletteOptions {
  rng?: () => number;
  /**
   * Dauer bis zur automatischen Auswertung in ms. Mit `null` wird nicht automatisch
   * ausgewertet – dann ruft z. B. der 3D-Kessel `finishSpin()` am Ende der Animation auf.
   */
  spinDuration?: number | null;
}

export function useRoulette({ rng = Math.random, spinDuration = 2200 }: RouletteOptions = {}) {
  const { state: wallet, adjustChips } = useCasino();
  const notify = useNotify();

  const [bets, setBets] = useState<Bets>({});
  const [denom, setDenom] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [pending, setPending] = useState<number | null>(null);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const spinRef = useRef<{ num: number; bets: Bets } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const place = (key: BetKey) => {
    if (spinning) return;
    if (wallet.chips < denom) {
      notify("warn", "Nicht genug Jetons", "Wähle einen kleineren Jeton-Wert oder kaufe nach.");
      return;
    }
    adjustChips(-denom);
    setBets((b) => placeBet(b, key, denom));
    setResult(null);
  };

  const clearBets = () => {
    if (spinning) return;
    const t = totalBet(bets);
    if (!t) return;
    adjustChips(t);
    setBets({});
    notify("info", "Einsätze zurückgenommen", `${formatNumber(t)} Jetons sind zurück im Guthaben.`);
  };

  /** Wertet die laufende Drehung aus (Timer oder Ende der 3D-Animation). */
  const finishSpin = useCallback(() => {
    const s = spinRef.current;
    if (!s) return;
    spinRef.current = null;
    clearTimeout(timer.current);
    const r = resolveSpin(s.num, s.bets);
    if (r.out) adjustChips(r.out);
    setBets({});
    setSpinning(false);
    setPending(null);
    setResult(r);
    setHistory((h) => [r.num, ...h].slice(0, 10));
    const m = spinMessage(r);
    notify(m.kind, m.title, m.msg);
  }, [adjustChips, notify]);

  const spin = () => {
    if (spinning) return;
    if (!totalBet(bets)) {
      notify("warn", "Kein Einsatz", "Platziere zuerst mindestens einen Jeton auf dem Tableau.");
      return;
    }
    // Die Gewinnzahl steht sofort fest – die Animation zeigt sie nur noch an.
    const num = spinNumber(rng);
    spinRef.current = { num, bets };
    setPending(num);
    setSpinning(true);
    setResult(null);
    if (spinDuration !== null) timer.current = setTimeout(finishSpin, spinDuration);
  };

  return {
    bets,
    denom,
    spinning,
    pending,
    result,
    history,
    total: totalBet(bets),
    place,
    clearBets,
    pickDenom: setDenom,
    spin,
    finishSpin,
  };
}
