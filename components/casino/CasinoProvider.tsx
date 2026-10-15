"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { initialWallet, walletReducer, type Screen, type WalletState } from "@/lib/wallet";

export interface CasinoContextValue {
  state: WalletState;
  navigate: (screen: Screen) => void;
  deposit: (chf: number, chips: number) => void;
  setChips: (chips: number) => void;
  adjustChips: (delta: number) => void;
  cashOut: () => void;
  reset: () => void;
}

const CasinoContext = createContext<CasinoContextValue | null>(null);

export function CasinoProvider({ children, initial }: { children: ReactNode; initial?: WalletState }) {
  const [state, dispatch] = useReducer(walletReducer, initial ?? initialWallet);

  const actions = useMemo(
    () => ({
      navigate: (screen: Screen) => dispatch({ type: "navigate", screen }),
      deposit: (chf: number, chips: number) => dispatch({ type: "deposit", chf, chips }),
      setChips: (chips: number) => dispatch({ type: "setChips", chips }),
      adjustChips: (delta: number) => dispatch({ type: "adjustChips", delta }),
      cashOut: () => dispatch({ type: "cashOut" }),
      reset: () => dispatch({ type: "reset" }),
    }),
    [],
  );

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);
  return <CasinoContext.Provider value={value}>{children}</CasinoContext.Provider>;
}

export function useCasino(): CasinoContextValue {
  const ctx = useContext(CasinoContext);
  if (!ctx) throw new Error("useCasino muss innerhalb von <CasinoProvider> verwendet werden");
  return ctx;
}
