import { CHIP_STYLES, DENOMS } from "@/lib/chips";
import { formatNumber } from "@/lib/format";
import { GRID, numberBg, type BetKey, type Bets, type OutsideKey } from "@/lib/roulette/rules";
import styles from "./RouletteScreen.module.css";

interface Props {
  disabled?: boolean;
  bets: Bets;
  denom: number;
  onPick: (d: number) => void;
  onPlace: (key: BetKey) => void;
  onClear: () => void;
}

const DOZENS: [OutsideKey, string][] = [
  ["d1", "1. Dutzend (1–12)"],
  ["d2", "2. Dutzend (13–24)"],
  ["d3", "3. Dutzend (25–36)"],
];

const OUTSIDE: [OutsideKey, string, string][] = [
  ["low", "1 – 18", "rgba(7,16,13,.35)"],
  ["even", "Gerade", "rgba(7,16,13,.35)"],
  ["red", "Rot", "#B23A2E"],
  ["black", "Schwarz", "#1A1A1A"],
  ["odd", "Ungerade", "rgba(7,16,13,.35)"],
  ["high", "19 – 36", "rgba(7,16,13,.35)"],
];

/** Goldener Einsatz-Marker auf einem Feld. */
function BetMarker({ amount, className }: { amount?: number; className: string }) {
  if (!amount) return null;
  return <span className={className}>{formatNumber(amount)}</span>;
}

export function BettingBoard({ bets, denom, onPick, onPlace, onClear, disabled = false }: Props) {
  return (
    <section className={styles.board}>
      <div className={styles.boardHead}>
        <div className={styles.denoms}>
          <span className={styles.denomLabel}>Jeton-Wert</span>
          {[...DENOMS].reverse().map((d) => (
            <button disabled={disabled}
              key={d}
              aria-label={`Jeton ${d}`}
              aria-pressed={denom === d}
              className={styles.denom}
              style={{
                background: CHIP_STYLES[d].base,
                color: CHIP_STYLES[d].fg,
                outline: denom === d ? "2px solid #E8B94A" : "none",
              }}
              onClick={() => onPick(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <button disabled={disabled} className={styles.clear} onClick={onClear}>
          Einsätze löschen
        </button>
      </div>

      <div className={styles.numbersRow}>
        <button disabled={disabled} aria-label="Zahl 0" className={styles.zero} onClick={() => onPlace("n:0")}>
          0
          <BetMarker amount={bets["n:0"]} className={styles.markerZero} />
        </button>
        <div className={styles.grid}>
          {GRID.map((n) => (
            <button disabled={disabled}
              key={n}
              aria-label={`Zahl ${n}`}
              className={styles.number}
              style={{ background: numberBg(n) }}
              onClick={() => onPlace(`n:${n}`)}
            >
              {n}
              <BetMarker amount={bets[`n:${n}`]} className={styles.markerNumber} />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.dozens}>
        {DOZENS.map(([k, label]) => (
          <button disabled={disabled} key={k} aria-label={label} className={styles.dozen} onClick={() => onPlace(k)}>
            {label}
            <BetMarker amount={bets[k]} className={styles.markerSide} />
          </button>
        ))}
      </div>

      <div className={styles.outside}>
        {OUTSIDE.map(([k, label, bg]) => (
          <button disabled={disabled} key={k} aria-label={label} className={styles.outsideBtn} style={{ background: bg }} onClick={() => onPlace(k)}>
            {label}
            <BetMarker amount={bets[k]} className={styles.markerSide} />
          </button>
        ))}
      </div>

      <div className={styles.legend}>
        <span>
          Einzelzahl <strong>35 : 1</strong>
        </span>
        <span>
          Dutzend / Kolonne <strong>2 : 1</strong>
        </span>
        <span>
          Rot / Schwarz · Gerade / Ungerade · 1–18 / 19–36 <strong>1 : 1</strong>
        </span>
      </div>
    </section>
  );
}
