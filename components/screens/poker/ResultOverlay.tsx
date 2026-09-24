import { formatSigned } from "@/lib/format";
import type { HandOutcome } from "@/lib/poker/engine";
import styles from "./PokerScreen.module.css";

const TITLE_COLORS = { win: "#7FD6A8", lose: "#F4B9B3", info: "#E8B94A" } as const;

interface Props {
  result: HandOutcome;
  nextLabel: string;
  onNext: () => void;
  onLobby: () => void;
}

export function ResultOverlay({ result, nextLabel, onNext, onLobby }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.resultPanel} role="dialog" aria-label="Rundenergebnis">
        <span className={styles.resultKicker}>Rundenergebnis</span>
        <h2 className={styles.resultTitle} style={{ color: TITLE_COLORS[result.kind] }} data-testid="result-title">
          {result.title}
        </h2>
        <p className={styles.resultSub}>{result.sub}</p>
        <div className={styles.resultRows}>
          {result.rows.map((r) => (
            <div
              key={r.name}
              className={styles.resultRow}
              style={{
                background: r.win ? "rgba(79,191,139,.12)" : "rgba(7,16,13,.5)",
                borderColor: r.win ? "rgba(79,191,139,.4)" : "rgba(242,239,230,.1)",
              }}
            >
              <span className={styles.resultName} style={{ color: r.win ? "#7FD6A8" : "#B7C2BA" }}>
                {r.name}
              </span>
              <span className={styles.resultHand}>{r.hand}</span>
              <span className={styles.resultDelta} style={{ color: r.win ? "#7FD6A8" : "#B7C2BA" }}>
                {formatSigned(r.net)}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.resultActions}>
          <button className={styles.nextBtn} onClick={onNext}>
            {nextLabel}
          </button>
          <button className={styles.lobbyBtn} onClick={onLobby}>
            Zurück zur Spielauswahl
          </button>
        </div>
      </div>
    </div>
  );
}
