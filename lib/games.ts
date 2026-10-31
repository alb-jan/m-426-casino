/** Gemeinsamer, UI-unabhaengiger Vertrag fuer registrierte Spiele. */
export interface GameEntry { id: string; title: string; minimum: number; entryReason: string }
export const DEFAULT_GAME_ENTRIES: readonly GameEntry[] = [
  { id: "poker", title: "Poker", minimum: 20, entryReason: "Big Blind" },
  { id: "roulette", title: "Roulette", minimum: 10, entryReason: "kleinster Jeton" },
];
export type SystemRouteKind = "landing" | "buy" | "lobby" | "exit";
export type AppRoute = { kind: SystemRouteKind } | { kind: "game"; gameId: string };
export type NavigationResult = { ok: true } | { ok: false; reason: "unknown-game" | "insufficient-funds" | "round-active" | "invalid-transition"; title: string; msg: string };
export type LeaveDecision = { allowed: false } | { allowed: true; refund?: number };
export type LeaveGuard = () => LeaveDecision;
/** Nur zum Lesen der alten Test-/Initialisierungsdaten; Navigation nutzt AppRoute. */
export function routeFromScreen(screen: string): AppRoute {
  return ["landing", "buy", "lobby", "exit"].includes(screen)
    ? { kind: screen as SystemRouteKind } : { kind: "game", gameId: screen };
}
export function routeLabel(route: AppRoute): string { return route.kind === "game" ? route.gameId : route.kind; }
