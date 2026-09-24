"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCasino } from "@/components/casino/CasinoProvider";
import { useNotify } from "@/components/notifications/NotificationProvider";
import { calculateChips } from "@/lib/chips";
import { botDecision } from "@/lib/poker/bot";
import { newDeck, type Card, type Rng } from "@/lib/poker/cards";
import {
  advanceRunout,
  applyAction,
  BB,
  BOT_STACK,
  newHand,
  nextHandStacks,
  SEATS,
  type PokerAction,
  type PokerState,
} from "@/lib/poker/engine";
import { defaultRaise, outcomeMessage, raiseStep } from "@/lib/poker/view";

export interface FlyingChip {
  id: number;
  val: number;
  seat: number;
  at: "seat" | "pot" | "win";
  win?: number;
  jx: number;
  jy: number;
  rot: number;
  z: number;
}

export interface PokerGameOptions {
  deckFactory?: () => Card[];
  rng?: Rng;
  botDelay?: number;
  runoutDelay?: number;
}

/**
 * Steuert eine Poker-Partie: hält den (unveränderlichen) Spielzustand aus lib/poker,
 * plant Bot-Züge und Runout per Timer, synchronisiert das Wallet und meldet Ereignisse.
 */
export function usePokerGame({
  deckFactory = () => newDeck(),
  rng = Math.random,
  botDelay = 950,
  runoutDelay = 900,
}: PokerGameOptions = {}) {
  const { state: wallet, setChips, navigate } = useCasino();
  const notify = useNotify();

  /** Startzustand der aktuellen Hand – Schlüssel für die Blind-Animation */
  const [hand, setHand] = useState<PokerState>(() =>
    newHand([wallet.chips, BOT_STACK, BOT_STACK, BOT_STACK], 0, deckFactory()),
  );
  const [game, setGame] = useState<PokerState>(hand);
  const [raiseAmt, setRaiseAmt] = useState(() => defaultRaise(hand));
  const [flights, setFlights] = useState<FlyingChip[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ids = useRef({ id: 0, z: 10 });

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  /* ---------- Jeton-Flug: spawnen am Sitz, landen chaotisch im Pot ---------- */
  const fly = useCallback((seat: number, amount: number) => {
    if (amount <= 0) return;
    const items: FlyingChip[] = calculateChips(amount)
      .slice(0, 10)
      .map((val) => ({
        id: ++ids.current.id,
        val,
        seat,
        at: "seat",
        jx: Math.round((Math.random() - 0.5) * 30),
        jy: Math.round((Math.random() - 0.5) * 30),
        rot: Math.round((Math.random() - 0.5) * 90),
        z: ++ids.current.z,
      }));
    setFlights((f) => [...f, ...items]);
    items.forEach((it, i) =>
      later(() => setFlights((f) => f.map((c) => (c.id === it.id ? { ...c, at: "pot" } : c))), 30 + i * 65),
    );
  }, [later]);

  /** Pot wird eingezogen: die Jetons fliegen zum Gewinner und blenden aus. */
  const sweep = useCallback((seat: number) => {
    setFlights((f) => f.map((c) => ({ ...c, at: "win", win: seat })));
    later(() => setFlights([]), 900);
  }, [later]);

  /** Neuen Zustand übernehmen und Nebenwirkungen (Animation, Toast) auslösen. */
  const commit = useCallback(
    (prev: PokerState, next: PokerState) => {
      setGame(next);
      setRaiseAmt(defaultRaise(next));
      next.players.forEach((p, i) => fly(i, p.committed - prev.players[i].committed));
      if (next.phase === "done" && prev.phase !== "done" && next.result) {
        notify(next.result.kind, next.result.title, outcomeMessage(next));
        if (next.result.winners.length) later(() => sweep(next.result!.winners[0]), 700);
      }
    },
    [fly, notify, sweep, later],
  );

  const startHand = useCallback(
    (stacks: number[], dealer: number) => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      const next = newHand(stacks, dealer, deckFactory());
      setHand(next);
      setGame(next);
      setRaiseAmt(defaultRaise(next));
    },
    [deckFactory],
  );

  // Blinds jeder neuen Hand animieren. Der Cleanup räumt die Jetons wieder ab – so ist der
  // Effekt idempotent und funktioniert auch mit dem doppelten Mount des React-StrictMode.
  useEffect(() => {
    hand.players.forEach((p, i) => fly(i, p.committed));
    return () => setFlights([]);
  }, [hand, fly]);

  // Wallet-Guthaben = eigener Stack am Tisch
  useEffect(() => {
    setChips(game.players[0].stack);
  }, [game, setChips]);

  // Bots und Runout zeitverzögert ausführen
  useEffect(() => {
    if (game.phase === "bet" && !game.players[game.toAct].human) {
      const t = setTimeout(() => {
        const d = botDecision(game, rng);
        commit(game, applyAction(game, d.action, d.target));
      }, botDelay);
      return () => clearTimeout(t);
    }
    if (game.phase === "runout") {
      const t = setTimeout(() => commit(game, advanceRunout(game)), runoutDelay);
      return () => clearTimeout(t);
    }
  }, [game, rng, botDelay, runoutDelay, commit]);

  // Aufräumen beim Verlassen des Tisches
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const myTurn = game.phase === "bet" && game.toAct === 0;

  const act = (action: PokerAction, target?: number) => {
    if (!myTurn) return;
    commit(game, applyAction(game, action, target));
  };

  return {
    game,
    flights,
    raiseAmt,
    myTurn,
    waiting: game.phase === "bet" && !myTurn,
    fold: () => act("fold"),
    call: () => act("call"),
    raise: () => act("raise", raiseAmt),
    allIn: () => act("raise", game.players[0].bet + game.players[0].stack),
    raiseUp: () => setRaiseAmt((a) => raiseStep(game, a, 1)),
    raiseDown: () => setRaiseAmt((a) => raiseStep(game, a, -1)),
    nextHand: () => {
      if (game.players[0].stack < BB) {
        navigate("lobby");
        return;
      }
      startHand(nextHandStacks(game), (game.dealer + 1) % SEATS);
    },
    toLobby: () => navigate("lobby"),
  };
}
