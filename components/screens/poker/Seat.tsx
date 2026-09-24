import { Chip } from "@/components/chips/Chip";
import { calculateChips } from "@/lib/chips";
import { formatNumber } from "@/lib/format";
import type { PokerState } from "@/lib/poker/engine";
import { myHandLabel, seatStatus } from "@/lib/poker/view";
import { PlayingCard } from "./PlayingCard";
import styles from "./PokerScreen.module.css";

function BetChips({ amount, size, overlap }: { amount: number; size: number; overlap: number }) {
  return (
    <span className={styles.betChips}>
      {calculateChips(amount)
        .slice(0, 4)
        .map((v, i) => (
          <span key={i} style={{ marginLeft: -overlap, display: "block" }}>
            <Chip value={v} size={size} inset={3} fontSize={size > 22 ? 9 : 8} />
          </span>
        ))}
    </span>
  );
}

const DealerButton = () => <span className={styles.dealer}>D</span>;

function useSeatLook(game: PokerState, seat: number) {
  const p = game.players[seat];
  const active = game.phase === "bet" && game.toAct === seat;
  return {
    p,
    active,
    style: {
      background: `rgba(7,16,13,${p.folded ? ".45" : ".72"})`,
      borderColor: active ? "rgba(232,185,74,.8)" : "rgba(242,239,230,.12)",
      animation: active ? "seatPulse 1.6s ease-in-out infinite" : "none",
    },
  };
}

/** Platz eines Computergegners (oben am Tisch). */
export function BotSeat({ game, seat }: { game: PokerState; seat: number }) {
  const { p, style } = useSeatLook(game, seat);
  const status = seatStatus(game, seat);
  const reveal = game.phase === "done" && !p.folded;
  return (
    <div className={styles.botSeat} style={{ ...style, opacity: p.folded ? 0.45 : 1 }} data-testid={`seat-${seat}`}>
      <div className={styles.botHead}>
        <span className={styles.avatar}>{p.name[0]}</span>
        <div className={styles.botInfo}>
          <span className={styles.botName}>{p.name}</span>
          <span className={styles.botStack}>{formatNumber(p.stack)} Jetons</span>
        </div>
        {game.dealer === seat && <DealerButton />}
      </div>
      <div className={styles.botCards}>
        {p.hole.map((c, i) => (
          <PlayingCard key={i} card={c} hidden={!reveal} size="sm" />
        ))}
      </div>
      <div className={styles.botFoot}>
        <span className={styles.status} style={{ color: status.color }}>
          {status.text}
        </span>
        {p.bet > 0 && (
          <span className={styles.betWrap}>
            <BetChips amount={p.bet} size={22} overlap={7} />
            <span className={styles.betValue}>{formatNumber(p.bet)}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/** Eigener Platz (unten am Tisch). */
export function MySeat({ game }: { game: PokerState }) {
  const { p, style } = useSeatLook(game, 0);
  return (
    <div className={styles.mySeat} style={style} data-testid="seat-0">
      <div className={styles.myHead}>
        <span className={styles.myAvatar}>DU</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={styles.myName}>Du</div>
          <div className={styles.myStack}>{formatNumber(p.stack)} Jetons</div>
        </div>
        {game.dealer === 0 && <DealerButton />}
        {p.bet > 0 && (
          <span className={styles.betWrap}>
            <BetChips amount={p.bet} size={24} overlap={8} />
            <span className={styles.betValue} style={{ fontSize: 14 }}>
              {formatNumber(p.bet)}
            </span>
          </span>
        )}
      </div>
      <div className={styles.myCards} data-testid="my-cards">
        {p.hole.map((c, i) => (
          <PlayingCard key={i} card={c} hidden={false} size="lg" />
        ))}
      </div>
      <div className={styles.myHand}>{p.folded ? "Gepasst" : myHandLabel(game)}</div>
    </div>
  );
}
