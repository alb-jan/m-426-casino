"use client";

import { useState } from "react";
import { useCasino } from "@/components/casino/CasinoProvider";
import { useNotify } from "@/components/notifications/NotificationProvider";
import { formatChf, formatNumber } from "@/lib/format";
import { previewChips, validatePurchase } from "@/lib/purchase";
import { MAX_CHF, MIN_CHF, RATE } from "@/lib/wallet";
import styles from "./BuyScreen.module.css";
import { ChipLegend } from "./ChipLegend";

const QUICK = [10, 20, 50, 100];

export function BuyScreen() {
  const { deposit, navigate } = useCasino();
  const notify = useNotify();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const buy = () => {
    const res = validatePurchase(amount);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    deposit(res.chf, res.chips);
    setError("");
    navigate("lobby");
    notify("info", `${formatNumber(res.chips)} Jetons gekauft`, `Für CHF ${formatChf(res.chf)} – viel Erfolg am Tisch!`);
  };

  const pick = (v: string) => {
    setAmount(v);
    setError("");
  };

  return (
    <main className={styles.main}>
      <div className={styles.grid}>
        <section className={styles.card}>
          <span className={styles.step}>Schritt 1 von 3</span>
          <h1 className={styles.title}>Jetons kaufen</h1>
          <p className={styles.intro}>
            Tausche Franken in Jetons. Am Ende des Abends kannst du dein Restguthaben an der Kasse wieder auszahlen
            lassen.
          </p>

          <label htmlFor="buy-amount" className={styles.label}>
            Betrag in Franken
          </label>
          <div
            className={styles.inputWrap}
            data-error={error ? "true" : undefined}
          >
            <span className={styles.currency}>CHF</span>
            <input
              id="buy-amount"
              className={styles.input}
              value={amount}
              onChange={(e) => pick(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") buy();
              }}
              placeholder="0.00"
              inputMode="decimal"
              autoComplete="off"
            />
          </div>

          <div className={styles.quick}>
            {QUICK.map((q) => (
              <button key={q} className={styles.quickBtn} onClick={() => pick(String(q))}>
                {q} CHF
              </button>
            ))}
          </div>

          <div className={styles.rateBox}>
            <div className={styles.rateCol}>
              <span className={styles.boxLabel}>Umrechnungskurs</span>
              <span className={styles.rateValue}>CHF 1.00 = {formatNumber(RATE)} Jetons</span>
            </div>
            <div className={styles.rateCol} style={{ textAlign: "right" }}>
              <span className={styles.boxLabel}>Du erhältst</span>
              <span className={styles.preview} data-testid="buy-preview">
                {formatNumber(previewChips(amount))}
              </span>
            </div>
          </div>

          {error && (
            <div className={styles.error} role="alert">
              <span className={styles.errorIcon}>!</span>
              <span className={styles.errorText}>{error}</span>
            </div>
          )}

          <button className={styles.buy} onClick={buy}>
            Jetons kaufen und starten
          </button>
          <p className={styles.limits}>
            Mindestbetrag CHF {formatNumber(MIN_CHF)} · Höchstbetrag CHF {MAX_CHF} · nur Spielgeld
          </p>
        </section>

        <aside className={styles.aside}>
          <div className={styles.legend}>
            <h2 className={styles.asideTitle} style={{ marginBottom: 18 }}>
              Jeton-Werte im Haus
            </h2>
            <ChipLegend />
          </div>
          <div className={styles.flow}>
            <h2 className={styles.asideTitle} style={{ marginBottom: 12 }}>
              Ablauf
            </h2>
            <ol className={styles.flowList}>
              <li>Geld in Jetons tauschen</li>
              <li>Spiel wählen: Poker oder Roulette</li>
              <li>Jederzeit auszahlen und das Casino verlassen</li>
            </ol>
          </div>
        </aside>
      </div>
    </main>
  );
}
