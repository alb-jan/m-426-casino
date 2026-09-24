"use client";

import { useCasino } from "@/components/casino/CasinoProvider";
import { useNotify } from "@/components/notifications/NotificationProvider";
import { formatChf, formatNumber } from "@/lib/format";
import { checkGameEntry, type Game } from "@/lib/lobby";
import { chipsToChf } from "@/lib/wallet";
import { PokerArt, RouletteArt } from "./GameArt";
import styles from "./LobbyScreen.module.css";

export function LobbyScreen() {
  const { state, navigate, cashOut } = useCasino();
  const notify = useNotify();
  const chips = formatNumber(state.chips);
  const chf = formatChf(chipsToChf(state.chips));

  const open = (game: Game) => {
    const check = checkGameEntry(game, state.chips);
    if (!check.ok) {
      notify("warn", check.title, check.msg);
      return;
    }
    navigate(game);
  };

  return (
    <main className={styles.main}>
      <div className={styles.wrap}>
        <div className={styles.head}>
          <div>
            <span className={styles.step}>Schritt 2 von 3</span>
            <h1 className={styles.title}>Spielauswahl</h1>
            <p className={styles.intro}>
              Beide Spiele laufen über denselben Software-Vertrag – Einsätze, Auszahlung und Meldungen funktionieren
              identisch.
            </p>
          </div>
          <div className={styles.balanceBox}>
            <div className={styles.balanceLabel}>Guthaben</div>
            <div className={styles.balanceValue} data-testid="lobby-balance">
              {chips} <span className={styles.balanceUnit}>Jetons</span>
            </div>
            <div className={styles.balanceChf}>≈ CHF {chf} Auszahlungswert</div>
          </div>
        </div>

        <div className={styles.games}>
          <button className={styles.gameBtn} onClick={() => open("poker")}>
            <div className={styles.gameCard}>
              <PokerArt />
              <div>
                <h2 className={styles.gameTitle}>Poker</h2>
                <p className={styles.gameText}>Texas Hold&apos;em gegen drei Computergegner. Blinds 10 / 20 Jetons.</p>
              </div>
              <div className={styles.gameFoot}>
                <span className={styles.gameMeta}>4 Plätze · Tisch offen</span>
                <span className={styles.gameCta}>Platz nehmen →</span>
              </div>
            </div>
          </button>

          <button className={styles.gameBtn} onClick={() => open("roulette")}>
            <div className={styles.gameCard}>
              <RouletteArt />
              <div>
                <h2 className={styles.gameTitle}>Roulette</h2>
                <p className={styles.gameText}>Europäischer Kessel mit einer Null. Mehrere Einsätze pro Runde möglich.</p>
              </div>
              <div className={styles.gameFoot}>
                <span className={styles.gameMeta}>Einzelplatz · sofort spielbar</span>
                <span className={styles.gameCta}>Setzen →</span>
              </div>
            </div>
          </button>
        </div>

        <div className={styles.exitBar}>
          <div>
            <h2 className={styles.exitTitle}>Casino verlassen</h2>
            <p className={styles.exitText}>
              Restguthaben <span className={styles.exitChips}>{chips} Jetons</span> ={" "}
              <span className={styles.exitChf}>CHF {chf}</span> Auszahlung
            </p>
          </div>
          <button className={styles.exitBtn} onClick={cashOut}>
            Auszahlen &amp; verlassen
          </button>
        </div>
      </div>
    </main>
  );
}
