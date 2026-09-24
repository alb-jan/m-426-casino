import type { PokerState } from "@/lib/poker/engine";
import { callLabel, raiseLabel } from "@/lib/poker/view";
import styles from "./PokerScreen.module.css";

interface Props {
  game: PokerState;
  myTurn: boolean;
  waiting: boolean;
  raiseAmt: number;
  onFold: () => void;
  onCall: () => void;
  onRaise: () => void;
  onRaiseUp: () => void;
  onRaiseDown: () => void;
  onAllIn: () => void;
}

export function ActionBar(p: Props) {
  const { game, myTurn, waiting } = p;
  const turnLabel = game.phase === "done" ? "Runde beendet" : game.phase === "runout" ? "Karten werden aufgedeckt" : game.players[game.toAct].name;

  return (
    <section className={styles.actionBar}>
      <div className={styles.turn}>
        <span className={styles.turnKicker}>Am Zug</span>
        <span className={styles.turnName} style={{ color: myTurn ? "#E8B94A" : "#F2EFE6" }} data-testid="turn-label">
          {turnLabel}
        </span>
      </div>

      {myTurn && (
        <div className={styles.actions}>
          <button className={styles.fold} onClick={p.onFold}>
            Passen
          </button>
          <button className={styles.call} onClick={p.onCall}>
            {callLabel(game)}
          </button>
          <div className={styles.raiseGroup}>
            <button className={styles.raiseStep} onClick={p.onRaiseDown}>
              −
            </button>
            <button className={styles.raise} onClick={p.onRaise}>
              {raiseLabel(game, p.raiseAmt)}
            </button>
            <button className={styles.raiseStep} onClick={p.onRaiseUp}>
              +
            </button>
          </div>
          <button className={styles.allIn} onClick={p.onAllIn}>
            All-In
          </button>
        </div>
      )}
      {waiting && <span className={styles.waiting}>Die Computergegner entscheiden …</span>}
    </section>
  );
}
