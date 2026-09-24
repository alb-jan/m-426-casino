"use client";

import type { ReactNode } from "react";
import { CasinoProvider, useCasino } from "@/components/casino/CasinoProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { BuyScreen } from "@/components/screens/buy/BuyScreen";
import { ExitScreen } from "@/components/screens/exit/ExitScreen";
import { LandingScreen } from "@/components/screens/landing/LandingScreen";
import { LobbyScreen } from "@/components/screens/lobby/LobbyScreen";
import { PokerScreen } from "@/components/screens/poker/PokerScreen";
import { RouletteScreen } from "@/components/screens/roulette/RouletteScreen";
import type { Screen, WalletState } from "@/lib/wallet";

function renderScreen(screen: Screen): ReactNode {
  switch (screen) {
    case "landing":
      return <LandingScreen />;
    case "buy":
      return <BuyScreen />;
    case "lobby":
      return <LobbyScreen />;
    case "poker":
      return <PokerScreen />;
    case "roulette":
      return <RouletteScreen />;
    case "exit":
      return <ExitScreen />;
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
