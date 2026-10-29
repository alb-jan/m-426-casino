"use client";

import { useNavigation, useWalletState } from "@/components/casino/CasinoProvider";
import { Chip } from "@/components/chips/Chip";
import { formatNumber } from "@/lib/format";
import styles from "./Header.module.css";
import { Logo } from "./Logo";

export function Header() {
  const state = useWalletState();
  const { navigate, canLeave } = useNavigation();
  const inGame = state.route.kind === "game";

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Logo />
        <div className={styles.brandText}>
          <span className={styles.brandName}>Casino Goldenes Ass</span>
          <span className={styles.brandSub}>Schulprojekt · Poker &amp; Roulette</span>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.balance}>
          <Chip value={100} size={28} inset={4} fontSize={8} style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,.4)" }} />
          <span className={styles.balanceValue} data-testid="header-balance">
            {formatNumber(state.chips)}
          </span>
          <span className={styles.balanceUnit}>Jetons</span>
        </div>
        {inGame && (
          <button className={styles.back} disabled={!canLeave} title={!canLeave ? "Runde läuft – Rückkehr nach der Auswertung" : undefined} onClick={() => navigate({ kind: "lobby" })}>
            ← Zurück zur Spielauswahl
          </button>
        )}
      </div>
    </header>
  );
}
