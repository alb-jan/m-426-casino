import styles from "./LobbyScreen.module.css";

function MiniCard({ rank, suit, red, tilt }: { rank: string; suit: string; red?: boolean; tilt: string }) {
  const color = red ? "#B3261E" : "#17181A";
  return (
    <span className={styles.miniCard} style={{ transform: tilt }}>
      <span className={styles.miniCardInner} />
      <span className={styles.miniCorner} style={{ color }}>
        {rank}
        <span style={{ fontSize: 11 }}>{suit}</span>
      </span>
      <span className={styles.miniPip} style={{ color }}>
        {suit}
      </span>
    </span>
  );
}

/** Kartenpaar A♠ / K♥ für die Poker-Karte. */
export function PokerArt() {
  return (
    <div className={styles.cards} aria-hidden="true">
      <MiniCard rank="A" suit="♠" tilt="rotate(-9deg)" />
      <MiniCard rank="K" suit="♥" red tilt="rotate(8deg) translate(-10px,4px)" />
    </div>
  );
}

/** Stilisierter Roulettekessel (Zahlenkranz, Holzring, Messingkegel, Kugel). */
export function RouletteArt() {
  return (
    <div className={styles.wheel} aria-hidden="true">
      <span className={styles.wheelWood} />
      <span className={styles.wheelCone} />
      <span className={styles.wheelBall} />
    </div>
  );
}
