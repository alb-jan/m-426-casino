import { colorName, numberBg } from "@/lib/roulette/view";
import { formatNumber } from "@/lib/format";
import { type SpinResult } from "@/lib/roulette/rules";
import styles from "./RouletteScreen.module.css";

interface Props {
  spinning: boolean;
  result: SpinResult | null;
}

export function ResultPanel({ spinning, result }: Props) {
  const border = result && !spinning ? (result.net > 0 ? "rgba(79,191,139,.5)" : "rgba(226,87,76,.4)") : "rgba(242,239,230,.1)";
  const netColor = result && result.net > 0 ? "#7FD6A8" : result && result.net === 0 ? "#E8B94A" : "#F4B9B3";
  const net = result ? (result.net >= 0 ? "+" : "−") + formatNumber(Math.abs(result.net)) + " Jetons" : "";

  return (
    <div className={styles.resultBox} style={{ borderColor: border }}>
      {result && !spinning && (
        <div className={styles.resultInner}>
          <span className={styles.kicker}>Gewinnzahl</span>
          <span className={styles.bigNumber} style={{ background: numberBg(result.num) }} data-testid="spin-number">
            {result.num}
          </span>
          <div className={styles.resultText}>
            <div className={styles.colorName} data-testid="spin-color">
              {colorName(result.num)}
            </div>
            <div className={styles.net} style={{ color: netColor }} data-testid="spin-net">
              {net}
            </div>
          </div>
        </div>
      )}
      {spinning && (
        <div className={styles.resultInner}>
          <span className={styles.spinner} />
          <span className={styles.spinningText}>Kessel dreht</span>
        </div>
      )}
      {!result && !spinning && (
        <div className={styles.resultInner} style={{ gap: 14 }}>
          <span className={styles.question}>?</span>
          <span className={styles.hint}>Setze Jetons auf das Tableau und drehe den Kessel.</span>
        </div>
      )}
    </div>
  );
}
