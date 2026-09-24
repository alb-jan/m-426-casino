"use client";

import type { CSSProperties } from "react";
import { useCasino } from "@/components/casino/CasinoProvider";
import { Chip } from "@/components/chips/Chip";
import { FLOAT_CHIPS, LANDING_FEATURES } from "./landingContent";
import styles from "./LandingScreen.module.css";

export function LandingScreen() {
  const { navigate } = useCasino();

  return (
    <main className={styles.main}>
      <div className={styles.glow} />
      <div className={styles.lines} />

      {FLOAT_CHIPS.map((c) => (
        <span
          key={c.val}
          data-testid={`float-chip-${c.val}`}
          className={styles.floatChip}
          style={
            {
              left: c.left ?? "auto",
              right: c.right ?? "auto",
              top: c.top ?? "auto",
              bottom: c.bottom ?? "auto",
              "--r": `${c.rot}deg`,
              animation: c.anim,
            } as CSSProperties
          }
        >
          <Chip
            value={c.val}
            size={c.size}
            inset={c.pad}
            fontSize={c.font}
            style={{ boxShadow: "0 14px 32px rgba(0,0,0,.5),inset 0 0 0 1px rgba(0,0,0,.35)" }}
          />
        </span>
      ))}

      <div className={styles.center}>
        <div className={styles.crest}>
          <div className={styles.ringOuter} />
          <div className={styles.ringDashed} />
          <div className={styles.crestGold}>
            <div className={styles.crestFace}>
              <span className={styles.crestA}>A</span>
              <span className={styles.crestSpade}>♠</span>
            </div>
          </div>
        </div>

        <div className={styles.titleBlock}>
          <span className={styles.est}>Est. 2026 · Schulprojekt</span>
          <h1 className={styles.title}>Casino Goldenes&nbsp;Ass</h1>
          <div className={styles.subRow}>
            <span className={styles.lineLeft} />
            <span className={styles.sub}>Poker &amp; Roulette</span>
            <span className={styles.lineRight} />
          </div>
          <p className={styles.lead}>
            Zwei Tische, ein Guthaben, echtes Spielgefühl – ganz ohne echtes Geld. Kaufe Jetons in Franken, spiel
            Texas Hold&apos;em gegen die Hausgegner oder setze am europäischen Kessel.
          </p>
        </div>

        <div className={styles.cta}>
          <button className={styles.enter} onClick={() => navigate("buy")}>
            Casino betreten
          </button>
        </div>

        <div className={styles.features}>
          {LANDING_FEATURES.map((f) => (
            <div key={f.title} className={styles.feature}>
              <span className={styles.glyph}>{f.glyph}</span>
              <span className={styles.featureTitle}>{f.title}</span>
              <span className={styles.featureText}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bottom}>
        <span>Spielgeld in CHF</span>
        <span>Ab 18 · reines Schulprojekt</span>
        <span>Next.js · React · TypeScript</span>
      </div>
    </main>
  );
}
