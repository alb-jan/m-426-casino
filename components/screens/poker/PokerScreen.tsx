"use client";

import { Chip } from "@/components/chips/Chip";
import { useCasino } from "@/components/casino/CasinoProvider";
import { calculateChips } from "@/lib/chips";
import { formatNumber } from "@/lib/format";
import { BB } from "@/lib/poker/engine";
import { presentOutcome, streetLabel } from "@/lib/poker/view";
import { ActionBar } from "./ActionBar";
import { ChipFlight } from "./ChipFlight";
import { PlayingCard } from "./PlayingCard";
import styles from "./PokerScreen.module.css";
import { ResultOverlay } from "./ResultOverlay";
import { BotSeat, MySeat } from "./Seat";
import { usePokerGame, type PokerGameOptions } from "./usePokerGame";

export function PokerScreen(options: PokerGameOptions) {
  const g = usePokerGame(options);
  const { state: wallet } = useCasino();
  const { game } = g;
  const result = presentOutcome(game);

  return (
    <main className={styles.main}>
      <div className={styles.wrap}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Poker · Texas Hold&apos;em</h1>
          <div className={styles.pills}>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>Runde</span>{" "}
              <span className={styles.pillValue} data-testid="street">
                {streetLabel(game.street)}
              </span>
            </div>
            <div className={styles.pill}>
              <span className={styles.pillLabel}>Höchster Einsatz</span>{" "}
              <span className={styles.pillValue}>{formatNumber(game.currentBet)}</span>
            </div>
            <div className={`${styles.pill} ${styles.pillGold}`}>
              <span className={styles.pillLabel} style={{ color: "#C9A54A" }}>
                Dein Guthaben
              </span>{" "}
              <span className={styles.pillValue}>{formatNumber(wallet.chips)}</span>
            </div>
          </div>
        </div>

        <section className={styles.table}>
          <div className={styles.tableLight} />
          <ChipFlight chips={g.flights} />

          <div className={styles.bots}>
            {[1, 2, 3].map((seat) => (
              <BotSeat key={seat} game={game} seat={seat} />
            ))}
          </div>

          <div className={styles.center}>
            <div className={styles.pot}>
              <span className={styles.potLabel}>Pot</span>
              <span className={styles.potValue} data-testid="pot">
                {formatNumber(game.pot)}
              </span>
              <span className={styles.betChips}>
                {game.pot > 0 &&
                  calculateChips(game.pot)
                    .slice(0, 5)
                    .map((v, i) => (
                      <span key={i} style={{ marginLeft: -9, display: "block" }}>
                        <Chip value={v} size={26} inset={4} fontSize={9} />
                      </span>
                    ))}
              </span>
            </div>
            <div className={styles.board}>
              {game.community.map((c, i) => (
                <PlayingCard key={i} card={c} hidden={false} size="md" />
              ))}
            </div>
          </div>

          <div className={styles.meRow}>
            <MySeat game={game} />
          </div>

          {game.phase === "done" && result && (
            <ResultOverlay
              result={result}
              nextLabel={game.players[0].stack < BB ? "Keine Jetons mehr – zur Spielauswahl" : "Nächste Runde"}
              onNext={g.nextHand}
              onLobby={g.toLobby}
            />
          )}
        </section>

        <ActionBar
          game={game}
          myTurn={g.myTurn}
          waiting={g.waiting}
          raiseAmt={g.raiseAmt}
          onFold={g.fold}
          onCall={g.call}
          onRaise={g.raise}
          onRaiseUp={g.raiseUp}
          onRaiseDown={g.raiseDown}
          onAllIn={g.allIn}
        />
      </div>
    </main>
  );
}
