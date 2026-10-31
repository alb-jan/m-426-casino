"use client";
import { createContext, useContext, type ComponentType, type ReactNode } from "react";
import { DEFAULT_GAME_ENTRIES, type GameEntry } from "@/lib/games";
import { PokerScreen } from "@/components/screens/poker/PokerScreen";
import { RouletteScreen } from "@/components/screens/roulette/RouletteScreen";
import { PokerArt, RouletteArt } from "@/components/screens/lobby/GameArt";

export interface GameDefinition extends GameEntry {
  description: string; meta: string; cta: string;
  Screen: ComponentType; Art: ComponentType;
}
export const DEFAULT_GAMES: readonly GameDefinition[] = [
  { ...DEFAULT_GAME_ENTRIES[0], description: "Texas Hold'em gegen drei Computergegner. Blinds 10 / 20 Jetons.", meta: "4 Plätze · Tisch offen", cta: "Platz nehmen →", Screen: PokerScreen, Art: PokerArt },
  { ...DEFAULT_GAME_ENTRIES[1], description: "Roulette mit einer Null. Mehrere Einsätze pro Runde möglich.", meta: "Einzelplatz · sofort spielbar", cta: "Setzen →", Screen: RouletteScreen, Art: RouletteArt },
];
const RegistryContext = createContext<readonly GameDefinition[]>(DEFAULT_GAMES);
export function GameRegistryProvider({ games, children }: { games: readonly GameDefinition[]; children: ReactNode }) {
  const ids = new Set(games.map((game) => game.id));
  if (ids.size !== games.length || games.some((game) => !game.id || !Number.isSafeInteger(game.minimum) || game.minimum < 0)) {
    throw new Error("Ungueltige oder doppelte Spieldefinition");
  }
  return <RegistryContext.Provider value={games}>{children}</RegistryContext.Provider>;
}
export const useGames = () => useContext(RegistryContext);
