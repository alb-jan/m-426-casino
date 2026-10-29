import { routeFromScreen, type AppRoute } from "./games";
export const RATE = 10;
export const MIN_CHF = 5;
export const MAX_CHF = 500;
export interface WalletState {
  route: AppRoute;
  chips: number;
  bought: number;
  cashed: number;
}
export type WalletInitial = WalletState | { screen: string; chips: number; bought: number; cashed: number };
export function normalizeWallet(initial: WalletInitial): WalletState {
  if ("route" in initial) return initial;
  const { screen, ...wallet } = initial;
  return { ...wallet, route: routeFromScreen(screen) };
}
export type WalletAction =
  | { type: "navigate"; route: AppRoute; refund?: number }
  | { type: "deposit"; chf: number; chips: number }
  | { type: "setChips"; chips: number }
  | { type: "adjustChips"; delta: number }
  | { type: "cashOut" }
  | { type: "reset" };
export const initialWallet: WalletState = { route: { kind: "landing" }, chips: 0, bought: 0, cashed: 0 };
export const chipsToChf = (chips: number) => chips / RATE;
export function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case "navigate": {
      const chips = state.chips + (action.refund ?? 0);
      return { ...state, route: action.route, chips, cashed: action.route.kind === "exit" ? chipsToChf(chips) : state.cashed };
    }
    case "deposit": return { ...state, chips: state.chips + action.chips, bought: state.bought + action.chf };
    case "setChips": return { ...state, chips: Math.max(0, action.chips) };
    case "adjustChips": return { ...state, chips: Math.max(0, state.chips + action.delta) };
    case "cashOut": return { ...state, route: { kind: "exit" }, cashed: chipsToChf(state.chips) };
    case "reset": return { route: { kind: "buy" }, chips: 0, bought: 0, cashed: 0 };
  }
}
