"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { initialWallet, normalizeWallet, walletReducer, type WalletAction, type WalletInitial, type WalletState } from "@/lib/wallet";
import { DEFAULT_GAME_ENTRIES, routeLabel, type AppRoute, type GameEntry, type LeaveGuard, type NavigationResult } from "@/lib/games";
import { checkGameEntry } from "@/lib/lobby";

interface WalletActions {
  deposit: (chf: number, chips: number) => void;
  setChips: (chips: number) => void;
  adjustChips: (delta: number) => void;
}
interface Navigation {
  route: AppRoute;
  canLeave: boolean;
  navigate: (route: AppRoute) => NavigationResult;
  cashOut: () => NavigationResult;
  reset: () => NavigationResult;
  registerLeaveGuard: (gameId: string, guard: LeaveGuard, blocked: boolean) => () => void;
}
const DataContext = createContext<WalletState | null>(null);
const ActionsContext = createContext<WalletActions | null>(null);
const NavigationContext = createContext<Navigation | null>(null);
const denied = (reason: Extract<NavigationResult, {ok:false}>["reason"], msg: string): NavigationResult => ({ ok: false, reason, title: "Wechsel nicht möglich", msg });
const allowedTargets: Record<string, readonly string[]> = {
  landing: ["buy"], buy: ["lobby"], lobby: ["game", "exit", "buy"], game: ["lobby", "exit"], exit: ["lobby"],
};

export function CasinoProvider({ children, initial, games = DEFAULT_GAME_ENTRIES }: { children: ReactNode; initial?: WalletInitial; games?: readonly GameEntry[] }) {
  const [state, setState] = useState(() => normalizeWallet(initial ?? initialWallet));
  const current = useRef(state);
  const guards = useRef(new Map<string, LeaveGuard>());
  const [blocked, setBlocked] = useState<Record<string, boolean>>({});
  const entries = useMemo(() => new Map(games.map((game) => [game.id, game])), [games]);
  const commit = useCallback((action: WalletAction) => {
    const next = walletReducer(current.current, action);
    current.current = next;
    setState(next);
  }, []);
  const navigate = useCallback((route: AppRoute): NavigationResult => {
    const before = current.current;
    if (routeLabel(before.route) === routeLabel(route)) return { ok: true };
    if (route.kind === "game") {
      const game = entries.get(route.gameId);
      if (!game) return denied("unknown-game", "Dieses Spiel ist nicht registriert.");
      const check = checkGameEntry(game, before.chips);
      if (!check.ok) return { ...check, reason: "insufficient-funds" };
    }
    if (!allowedTargets[before.route.kind]?.includes(route.kind)) return denied("invalid-transition", "Dieser Bildschirmwechsel ist nicht vorgesehen.");
    let refund = 0;
    if (before.route.kind === "game") {
      const decision = guards.current.get(before.route.gameId)?.() ?? { allowed: true };
      if (!decision.allowed) return denied("round-active", "Die Runde läuft. Nach der Auswertung kannst du zurückkehren.");
      refund = decision.refund ?? 0;
      if (!Number.isSafeInteger(refund) || refund < 0) return denied("invalid-transition", "Ungültige Rückerstattung.");
    }
    commit({ type: "navigate", route, refund });
    return { ok: true };
  }, [commit, entries]);
  const registerLeaveGuard = useCallback((gameId: string, guard: LeaveGuard, isBlocked: boolean) => {
    guards.current.set(gameId, guard);
    setBlocked((old) => old[gameId] === isBlocked ? old : { ...old, [gameId]: isBlocked });
    return () => {
      if (guards.current.get(gameId) === guard) {
        guards.current.delete(gameId);
        setBlocked((old) => { const next = { ...old }; delete next[gameId]; return next; });
      }
    };
  }, []);
  const actions = useMemo<WalletActions>(() => ({
    deposit: (chf, chips) => commit({ type: "deposit", chf, chips }),
    setChips: (chips) => commit({ type: "setChips", chips }),
    adjustChips: (delta) => commit({ type: "adjustChips", delta }),
  }), [commit]);
  const reset = useCallback((): NavigationResult => {
    if (current.current.route.kind !== "exit") return denied("invalid-transition", "Eine neue Sitzung beginnt an der Kasse.");
    commit({ type: "reset" }); return { ok: true };
  }, [commit]);
  const navigation = useMemo<Navigation>(() => ({
    route: state.route, navigate, cashOut: () => navigate({ kind: "exit" }), reset, registerLeaveGuard,
    canLeave: state.route.kind !== "game" || !blocked[state.route.gameId],
  }), [state.route, navigate, reset, registerLeaveGuard, blocked]);
  return <DataContext.Provider value={state}><ActionsContext.Provider value={actions}><NavigationContext.Provider value={navigation}>{children}</NavigationContext.Provider></ActionsContext.Provider></DataContext.Provider>;
}
export function useWalletState() { const value = useContext(DataContext); if (!value) throw new Error("CasinoProvider fehlt"); return value; }
export function useWalletActions() { const value = useContext(ActionsContext); if (!value) throw new Error("CasinoProvider fehlt"); return value; }
export function useNavigation() { const value = useContext(NavigationContext); if (!value) throw new Error("CasinoProvider fehlt"); return value; }
/** Kompatible Sammelfassade fuer bestehende Konsumenten; neue Komponenten nutzen die schmalen Hooks. */
export function useCasino() { return { state: useWalletState(), ...useWalletActions(), ...useNavigation() }; }
export function useLeaveGuard(gameId: string, guard: LeaveGuard, blocked: boolean) {
  const { registerLeaveGuard } = useNavigation();
  const latest = useRef(guard);
  useEffect(() => { latest.current = guard; }, [guard]);
  useEffect(() => registerLeaveGuard(gameId, () => latest.current(), blocked), [gameId, blocked, registerLeaveGuard]);
}
