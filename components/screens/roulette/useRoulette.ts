"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLeaveGuard, useWalletActions, useWalletState } from "@/components/casino/CasinoProvider";
import { useNotify } from "@/components/notifications/NotificationProvider";
import { formatNumber } from "@/lib/format";
import { spinMessage } from "@/lib/roulette/view";
import { totalBet, type BetKey } from "@/lib/roulette/rules";
import { RouletteGame, type RouletteCommand, type RouletteEffect } from "@/lib/roulette/state";

export interface RouletteOptions { rng?: () => number; spinDuration?: number | null }
export function useRoulette({ rng = Math.random, spinDuration = 2200 }: RouletteOptions = {}) {
  const wallet = useWalletState();
  const { adjustChips } = useWalletActions();
  const notify = useNotify();
  const [game] = useState(() => new RouletteGame(rng));
  const [snapshot, setSnapshot] = useState(game.snapshot);
  const [denom, setDenom] = useState(10);
  const balance = useRef(wallet.chips);
  useEffect(() => { balance.current = wallet.chips; }, [wallet.chips]);

  const announce = useCallback((effect?: RouletteEffect) => {
    if (!effect) return;
    if (effect.kind === "settled") { const m=spinMessage(effect.result); notify(m.kind,m.title,m.msg); }
    else if (effect.kind === "cleared") notify("info","Einsätze zurückgenommen",`${formatNumber(effect.amount)} Jetons sind zurück im Guthaben.`);
    else if (effect.kind === "insufficient-funds") notify("warn","Nicht genug Jetons","Wähle einen kleineren Jeton-Wert oder kaufe nach.");
    else if (effect.kind === "no-bet") notify("warn","Kein Einsatz","Platziere zuerst mindestens einen Jeton auf dem Tableau.");
  }, [notify]);
  const apply = useCallback((command: RouletteCommand) => {
    const transition = game.dispatch(command);
    setSnapshot(transition.snapshot);
    if (transition.walletDelta) { balance.current += transition.walletDelta; adjustChips(transition.walletDelta); }
    announce(transition.effect);
    return transition;
  }, [game, adjustChips, announce]);

  const leave = useCallback(() => {
    const transition = game.dispatch({type:"leave"});
    if (!transition.allowed) return {allowed:false} as const;
    balance.current += transition.walletDelta;
    return {allowed:true,refund:transition.walletDelta} as const;
  }, [game]);
  useLeaveGuard("roulette", leave, snapshot.phase === "spinning");

  useEffect(() => {
    if (snapshot.phase !== "spinning" || spinDuration === null) return;
    const roundId = snapshot.roundId;
    const timer = setTimeout(() => apply({type:"finish",roundId}), spinDuration);
    return () => clearTimeout(timer);
  }, [snapshot.phase, snapshot.roundId, spinDuration, apply]);

  const finishSpin = useCallback((roundId = snapshot.roundId) => apply({type:"finish",roundId}), [apply,snapshot.roundId]);
  return {
    ...snapshot, denom, spinning:snapshot.phase === "spinning", total:totalBet(snapshot.bets),
    place:(key:BetKey)=>apply({type:"place",key,amount:denom,balance:balance.current}),
    clearBets:()=>apply({type:"clear"}), pickDenom:setDenom, spin:()=>apply({type:"spin"}), finishSpin,
  };
}
