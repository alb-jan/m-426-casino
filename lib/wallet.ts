/** Umrechnungskurs: 1 CHF = RATE Jetons. */
export const RATE = 10;
export const MIN_CHF = 5;
export const MAX_CHF = 500;

export type Screen = "landing" | "buy" | "lobby" | "poker" | "roulette" | "exit";

export interface WalletState {
  screen: Screen;
  /** aktuelles Jeton-Guthaben */
  chips: number;
  /** insgesamt eingezahlte Franken */
  bought: number;
  /** ausbezahlte Franken (Kasse) */
  cashed: number;
}

export type WalletAction =
  | { type: "navigate"; screen: Screen }
  | { type: "deposit"; chf: number; chips: number }
  | { type: "setChips"; chips: number }
  | { type: "adjustChips"; delta: number }
  | { type: "cashOut" }
  | { type: "reset" };

export const initialWallet: WalletState = { screen: "landing", chips: 0, bought: 0, cashed: 0 };

export const chipsToChf = (chips: number) => chips / RATE;

export function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case "navigate":
      return { ...state, screen: action.screen };
    case "deposit":
      return { ...state, chips: state.chips + action.chips, bought: state.bought + action.chf };
    case "setChips":
      return { ...state, chips: Math.max(0, action.chips) };
    case "adjustChips":
      return { ...state, chips: Math.max(0, state.chips + action.delta) };
    case "cashOut":
      return { ...state, screen: "exit", cashed: chipsToChf(state.chips) };
    case "reset":
      return { screen: "buy", chips: 0, bought: 0, cashed: 0 };
  }
}
