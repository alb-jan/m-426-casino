"use client";

import type { ReactNode } from "react";
import { CasinoProvider, useCasino } from "@/components/casino/CasinoProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { LobbyScreen } from "@/components/screens/lobby/LobbyScreen";
import type { Screen, WalletState } from "@/lib/wallet";

/** Platzhalter für Bildschirme, die in eigenen Feature-Branches umgesetzt werden. */
function Placeholder({ title }: { title: string }) {
  return (
    <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 56 }}>
      <h1 className="serif" style={{ fontSize: 44 }}>{title}</h1>
    </main>
  );
}

function renderScreen(screen: Screen): ReactNode {
  switch (screen) {
    case "landing":
      return <Placeholder title="Casino Goldenes Ass" />;
    case "buy":
      return <Placeholder title="Jetons kaufen" />;
    case "lobby":
      return <LobbyScreen />;
    case "poker":
      return <Placeholder title="Poker" />;
    case "roulette":
      return <Placeholder title="Roulette" />;
    case "exit":
      return <Placeholder title="Auszahlung" />;
  }
}

function Shell() {
  const { state } = useCasino();
  const showChrome = state.screen !== "landing";
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(1200px 700px at 50% -10%,#123227 0%,#0A1712 45%,#07100D 100%)",
        color: "#F2EFE6",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {showChrome && <Header />}
      {renderScreen(state.screen)}
      {showChrome && <Footer />}
    </div>
  );
}

export function CasinoApp({ initial }: { initial?: WalletState }) {
  return (
    <NotificationProvider>
      <CasinoProvider initial={initial}>
        <Shell />
      </CasinoProvider>
    </NotificationProvider>
  );
}
