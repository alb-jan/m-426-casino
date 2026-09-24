import { CHIP_STYLES, DENOMS } from "@/lib/chips";
import { formatChf } from "@/lib/format";
import { RATE } from "@/lib/wallet";
import styles from "./BuyScreen.module.css";

/** „Jeton-Werte im Haus“: alle Jetons aufsteigend mit Farbname und Frankengegenwert. */
export function ChipLegend() {
  return (
    <div className={styles.legendList}>
      {[...DENOMS].reverse().map((d) => (
        <div key={d} className={styles.legendRow}>
          <span
            className={styles.legendChip}
            style={{ background: CHIP_STYLES[d].base, color: CHIP_STYLES[d].fg }}
          >
            {d}
          </span>
          <div className={styles.legendText}>
            <span className={styles.legendName}>{CHIP_STYLES[d].name}</span>
            <span className={styles.legendValue}>CHF {formatChf(d / RATE)} Gegenwert</span>
          </div>
        </div>
      ))}
    </div>
  );
}
