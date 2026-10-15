"use client";

import { useCasino } from "@/components/casino/CasinoProvider";
import { formatNumber } from "@/lib/format";
import { numberBg } from "@/lib/roulette/rules";
import { BettingBoard } from "./BettingBoard";
import { ResultPanel } from "./ResultPanel";
import styles from "./RouletteScreen.module.css";
import { useRoulette, type RouletteOptions } from "./useRoulette";

export function RouletteScreen(options: RouletteOptions) {
  const r = useRoulette(options);
  const { state: wallet } = useCasino();

  return (
    <main className={styles.main}>
      <div className={styles.wrap}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Roulette</h1>
          <div className={styles.pills}>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>Gesamteinsatz</span>{" "}
              <span className={styles.pillValue} data-testid="total-bet">
                {formatNumber(r.total)}
              </span>
            </div>
            <div className={`${styles.pill} ${styles.pillGold}`}>
              <span className={styles.pillLabel} style={{ color: "#C9A54A" }}>
                Verbleibend
              </span>{" "}
              <span className={styles.pillValue}>{formatNumber(wallet.chips)}</span>
            </div>
          </div>
        </div>

        <div className={styles.columns}>
          <section className={styles.side}>
            <ResultPanel spinning={r.spinning} result={r.result} />

            {r.history.length > 0 && (
              <div className={styles.history}>
                <span className={styles.kicker}>Letzte Zahlen</span>
                <div className={styles.historyList} data-testid="history">
                  {r.history.map((n, i) => (
                    <span key={i} className={styles.historyItem} style={{ background: numberBg(n) }}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              className={styles.spin}
              onClick={r.spin}
              style={
                r.spinning
                  ? { background: "rgba(242,239,230,.12)", color: "#8FA096" }
                  : { background: "linear-gradient(160deg,#F0C75C,#C79A34)", color: "#0A1712" }
              }
            >
              {r.spinning ? "Kessel dreht …" : "Drehen"}
            </button>
          </section>

          <BettingBoard bets={r.bets} denom={r.denom} onPick={r.pickDenom} onPlace={r.place} onClear={r.clearBets} />
        </div>
      </div>
    </main>
  );
}
