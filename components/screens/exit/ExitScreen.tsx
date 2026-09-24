"use client";

import { useCasino } from "@/components/casino/CasinoProvider";
import { exitStats } from "@/lib/cashout";
import styles from "./ExitScreen.module.css";

export function ExitScreen() {
  const { state, reset, navigate } = useCasino();

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <span className={styles.step}>Schritt 3 von 3 · Kasse</span>
        <h1 className={styles.title}>Auszahlung</h1>
        <p className={styles.thanks}>Danke fürs Spielen im Goldenen Ass.</p>
        <div className={styles.stats}>
          {exitStats(state.bought, state.cashed).map((s) => (
            <div key={s.label} className={styles.stat}>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statValue} style={{ color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.actions}>
          <button className={styles.restart} onClick={reset}>
            Neue Sitzung starten
          </button>
          <button className={styles.continue} onClick={() => navigate("lobby")}>
            Doch weiterspielen
          </button>
        </div>
      </div>
    </main>
  );
}
