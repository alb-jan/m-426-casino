import { cardText, type Card } from "@/lib/poker/cards";
import styles from "./PlayingCard.module.css";

type Size = "sm" | "md" | "lg";

/** Masse aus dem Prototyp: Bots 46×64, Board 66×94, eigene Karten 72×102. */
const SIZES: Record<Size, { w: number; h: number; radius: number; corner: number; cornerSuit: number; pip: number; logo: number; inner: number; pad: [number, number] }> = {
  sm: { w: 46, h: 64, radius: 5, corner: 13, cornerSuit: 10, pip: 20, logo: 20, inner: 3, pad: [3, 3] },
  md: { w: 66, h: 94, radius: 9, corner: 19, cornerSuit: 14, pip: 32, logo: 30, inner: 5, pad: [5, 4] },
  lg: { w: 72, h: 102, radius: 10, corner: 21, cornerSuit: 15, pip: 36, logo: 32, inner: 5, pad: [5, 4] },
};

/** Spielkarte mit 3D-Flip: hidden = Rückseite (Bordeaux mit goldenem Ass-Emblem). */
export function PlayingCard({ card, hidden, size = "md" }: { card: Card; hidden: boolean; size?: Size }) {
  const d = SIZES[size];
  const color = card.red ? "#B3261E" : "#17181A";
  const rank = cardText(card);
  const corner = (
    <>
      {rank}
      <span style={{ fontSize: d.cornerSuit, marginTop: 1 }}>{card.s}</span>
    </>
  );

  return (
    <span
      className={styles.slot}
      style={{ width: d.w, height: d.h }}
      data-testid="card"
      data-hidden={String(hidden)}
      aria-label={hidden ? "verdeckte Karte" : `${rank}${card.s}`}
    >
      <span className={styles.flipper} style={{ transform: hidden ? "rotateY(180deg)" : "rotateY(0deg)" }}>
        <span className={styles.face} style={{ borderRadius: d.radius }}>
          <span className={styles.faceInner} style={{ inset: 3, borderRadius: d.radius - 2 }} />
          <span
            className={styles.corner}
            style={{ left: d.pad[0], top: d.pad[1], fontSize: d.corner, color }}
          >
            {corner}
          </span>
          <span
            className={styles.corner}
            style={{ right: d.pad[0], bottom: d.pad[1], fontSize: d.corner, color, transform: "rotate(180deg)" }}
          >
            {corner}
          </span>
          <span className={styles.pip} style={{ fontSize: d.pip, color }}>
            {card.s}
          </span>
        </span>
        <span className={styles.back} style={{ borderRadius: d.radius }}>
          <span className={styles.backPattern} />
          <span className={styles.backFrame} style={{ inset: d.inner, borderRadius: Math.max(2, d.radius - 3) }} />
          <svg viewBox="0 0 40 40" className={styles.logo} style={{ width: d.logo, height: d.logo }} aria-hidden="true">
            <circle cx="20" cy="20" r="18" fill="rgba(10,23,18,.55)" stroke="#E8B94A" strokeWidth="1.2" />
            <circle cx="20" cy="20" r="14.5" fill="none" stroke="rgba(232,185,74,.5)" strokeWidth=".7" strokeDasharray="2 2" />
            <path
              d="M20 9.5c3.6 4.2 7 7 7 10.3 0 2.6-2 4.4-4.4 4.4-1.1 0-2-.4-2.6-1v3.6h2.2v1.4h-4.4v-1.4h2.2V23.2c-.6.6-1.5 1-2.6 1-2.4 0-4.4-1.8-4.4-4.4 0-3.3 3.4-6.1 7-10.3z"
              fill="#E8B94A"
            />
          </svg>
        </span>
      </span>
    </span>
  );
}
