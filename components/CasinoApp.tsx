"use client";
import { CasinoProvider, useNavigation } from "@/components/casino/CasinoProvider";
import { Header } from "@/components/layout/Header";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { BuyScreen } from "@/components/screens/buy/BuyScreen";
import { ExitScreen } from "@/components/screens/exit/ExitScreen";
import { LandingScreen } from "@/components/screens/landing/LandingScreen";
import { LobbyScreen } from "@/components/screens/lobby/LobbyScreen";
import { DEFAULT_GAMES, GameRegistryProvider, useGames, type GameDefinition } from "@/components/games/registry";
import type { WalletInitial } from "@/lib/wallet";

const systemScreens = { landing: LandingScreen, buy: BuyScreen, lobby: LobbyScreen, exit: ExitScreen };
function Shell() {
  const { route } = useNavigation();
  const games = useGames();
  const Screen = route.kind === "game" ? games.find((game) => game.id === route.gameId)?.Screen : systemScreens[route.kind];
  return <div style={{minHeight:"100vh",background:"radial-gradient(1200px 700px at 50% -10%,#123227 0%,#0A1712 45%,#07100D 100%)",color:"#F2EFE6",display:"flex",flexDirection:"column"}}>
    {route.kind !== "landing" && <Header/>}
    {Screen ? <Screen/> : <main><h1>Unbekanntes Spiel</h1></main>}
  </div>;
}
export function CasinoApp({ initial, games = DEFAULT_GAMES }: { initial?: WalletInitial; games?: readonly GameDefinition[] }) {
  return <NotificationProvider><GameRegistryProvider games={games}><CasinoProvider initial={initial} games={games}><Shell/></CasinoProvider></GameRegistryProvider></NotificationProvider>;
}
