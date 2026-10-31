import type { Card } from "./cards";
import { evalBest, type HandResult } from "./evaluate";

export const SB = 10;
export const BB = 20;
export const BOT_NAMES = ["Vera", "Ruben", "Milla"] as const;
export const BOT_STACK = 600;
export const SEATS = 4;

export type PokerAction = "fold" | "call" | "raise";
export type Phase = "bet" | "runout" | "done";

export interface Player {
  name: string;
  human: boolean;
  stack: number;
  startStack: number;
  hole: Card[];
  folded: boolean;
  allIn: boolean;
  /** Einsatz in der aktuellen Setzrunde */
  bet: number;
  /** Gesamteinsatz in dieser Hand (für Side-Pots) */
  committed: number;
  acted: boolean;
  /** letzte Aktion als Text („Geht mit 20“) */
  last: {kind:"small-blind"|"big-blind"|"fold"|"check"|"call"|"all-in"|"raise";amount?:number} | null;
  won: number;
  score?: number;
  hand?: HandResult;
}

export interface HandOutcome {
  reason: "folds" | "showdown";
  pot: number;
  showdown: boolean;
  winners: number[];
  nets: number[];
  pots: number;
  allIn: boolean;
}

export interface PokerState {
  players: Player[];
  deck: Card[];
  community: Card[];
  pot: number;
  currentBet: number;
  minRaise: number;
  /** 0 Pre-Flop, 1 Flop, 2 Turn, 3 River, 4 Showdown */
  street: number;
  dealer: number;
  toAct: number;
  phase: Phase;
  result: HandOutcome | null;
}

export interface Pot {
  amount: number;
  eligible: number[];
}

/* ---------------------------------------------------------------- Hilfen */

function clone(s: PokerState): PokerState {
  return {
    ...s,
    players: s.players.map((p) => ({ ...p })),
    community: s.community.slice(),
    deck: s.deck.slice(),
  };
}

/** Nächster Spieler (im Uhrzeigersinn), der noch handeln kann; -1 wenn keiner. */
function nextIdx(s: PokerState, from: number): number {
  for (let i = 1; i <= SEATS; i++) {
    const idx = (from + i) % SEATS;
    const p = s.players[idx];
    if (!p.folded && !p.allIn) return idx;
  }
  return -1;
}

const canAct = (s: PokerState) => s.players.filter((p) => !p.folded && !p.allIn);

/** Benötigter Betrag zum Mitgehen für einen Sitz. */
export const callAmount = (s: PokerState, seat: number) => Math.max(0, s.currentBet - s.players[seat].bet);

/** Kleinstes erlaubtes Erhöhungsziel (Gesamteinsatz dieser Runde). */
export const minRaiseTarget = (s: PokerState) => (s.currentBet > 0 ? s.currentBet + s.minRaise : BB);

/** Grösstmögliches Ziel (All-In). */
export const maxRaiseTarget = (s: PokerState, seat: number) => s.players[seat].bet + s.players[seat].stack;

/* ---------------------------------------------------------------- Neue Hand */

export function newHand(stacks: number[], dealer: number, deck: Card[]): PokerState {
  const d = deck.slice();
  const players: Player[] = ["Du", ...BOT_NAMES].map((name, i) => ({
    name,
    human: i === 0,
    stack: stacks[i],
    startStack: stacks[i],
    hole: [d.pop()!, d.pop()!],
    folded: false,
    allIn: false,
    bet: 0,
    committed: 0,
    acted: false,
    last: null,
    won: 0,
  }));
  const s: PokerState = {
    players,
    deck: d,
    community: [],
    pot: 0,
    currentBet: BB,
    minRaise: BB,
    street: 0,
    dealer,
    toAct: (dealer + 3) % SEATS,
    phase: "bet",
    result: null,
  };
  const post = (i: number, amt: number, label: NonNullable<Player["last"]>["kind"]) => {
    const p = s.players[i];
    const pay = Math.min(amt, p.stack);
    p.stack -= pay;
    p.bet += pay;
    p.committed += pay;
    s.pot += pay;
    if (p.stack === 0) p.allIn = true;
    p.last = {kind:label};
  };
  post((dealer + 1) % SEATS, SB, "small-blind");
  post((dealer + 2) % SEATS, BB, "big-blind");
  // Falls der erste Spieler bereits All-In ist, zum nächsten handlungsfähigen weitergehen
  if (s.players[s.toAct].allIn) s.toAct = nextIdx(s, s.toAct);
  return s;
}

/** Stacks für die nächste Hand; pleite Bots werden auf 600 aufgefüllt. */
export function nextHandStacks(s: PokerState): number[] {
  return s.players.map((p) => (!p.human && p.stack < BB ? BOT_STACK : p.stack));
}

/* ---------------------------------------------------------------- Aktionen */

export function applyAction(state: PokerState, action: PokerAction, target = 0): PokerState {
  if (state.phase !== "bet") return state;
  const s = clone(state);
  const p = s.players[s.toAct];

  if (action === "fold") {
    p.folded = true;
    p.acted = true;
    p.last = {kind:"fold"};
  } else if (action === "call") {
    const need = s.currentBet - p.bet;
    const pay = Math.min(need, p.stack);
    p.stack -= pay;
    p.bet += pay;
    p.committed += pay;
    s.pot += pay;
    if (p.stack === 0 && pay > 0) p.allIn = true;
    p.acted = true;
    p.last = need === 0 ? {kind:"check"} : pay < need ? {kind:"all-in",amount:p.bet} : {kind:"call",amount:pay};
  } else {
    // Mindesterhöhung: neuer Einsatz muss den vorigen um mindestens minRaise übersteigen
    const cap = p.bet + p.stack;
    const tgt = Math.min(Math.max(target, Math.min(minRaiseTarget(s), cap)), cap);
    const pay = tgt - p.bet;
    const prevBet = s.currentBet;
    p.stack -= pay;
    p.bet = tgt;
    p.committed += pay;
    s.pot += pay;
    if (p.stack === 0) p.allIn = true;
    if (tgt > prevBet) {
      s.minRaise = Math.max(BB, tgt - prevBet, s.minRaise);
      s.currentBet = tgt;
      // Nur eine echte Erhöhung eröffnet die Runde neu; ein All-In unter dem
      // aktuellen Einsatz ("call for less") tut es nach Hold'em-Regeln nicht.
      s.players.forEach((o) => {
        if (o !== p && !o.folded && !o.allIn) o.acted = false;
      });
    }
    p.acted = true;
    p.last = {kind:p.allIn ? "all-in" : "raise",amount:tgt};
  }
  return proceed(s);
}

function proceed(s: PokerState): PokerState {
  const alive = s.players.filter((p) => !p.folded);
  if (alive.length === 1) return finish(s, "folds");
  const active = canAct(s);
  const settled = active.every((p) => p.acted && p.bet === s.currentBet);
  if (active.length === 0 || settled) return nextStreet(s);
  const next = nextIdx(s, s.toAct);
  if (next === -1) return nextStreet(s);
  s.toAct = next;
  return s;
}

function nextStreet(s: PokerState): PokerState {
  s.street += 1;
  s.players.forEach((p) => {
    p.bet = 0;
    p.acted = false;
    if (!p.folded) p.last = null;
  });
  s.currentBet = 0;
  s.minRaise = BB;
  if (s.street === 1) s.community.push(s.deck.pop()!, s.deck.pop()!, s.deck.pop()!);
  else if (s.street === 2 || s.street === 3) s.community.push(s.deck.pop()!);
  else return showdown(s);

  // Höchstens ein Spieler kann noch setzen → restliche Karten ohne Setzrunde aufdecken
  if (canAct(s).length <= 1) {
    s.phase = "runout";
    s.toAct = -1;
    return s;
  }
  s.phase = "bet";
  s.toAct = nextIdx(s, s.dealer);
  return s;
}

/** Deckt im Runout (alle All-In) die nächste Strasse auf bzw. geht zum Showdown. */
export function advanceRunout(state: PokerState): PokerState {
  if (state.phase !== "runout") return state;
  return nextStreet(clone(state));
}

function showdown(s: PokerState): PokerState {
  while (s.community.length < 5) s.community.push(s.deck.pop()!);
  s.players
    .filter((p) => !p.folded)
    .forEach((p) => {
      const r = evalBest([...p.hole, ...s.community]);
      p.score = r.score;
      p.hand = r;
    });
  return finish(s, "showdown");
}

/* ---------------------------------------------------------------- Pots & Auswertung */

/** Haupt- und Nebenpots nach den eingezahlten Beträgen (All-In-Regel). */
export function buildPots(players: { committed: number; folded: boolean }[]): Pot[] {
  const levels = [...new Set(players.filter((p) => p.committed > 0).map((p) => p.committed))].sort((a, b) => a - b);
  const pots: Pot[] = [];
  let prev = 0;
  for (const lvl of levels) {
    let amount = 0;
    players.forEach((p) => {
      amount += Math.max(0, Math.min(p.committed, lvl) - prev);
    });
    const eligible = players.map((p, i) => ({ p, i })).filter(({ p }) => !p.folded && p.committed >= lvl).map(({ i }) => i);
    if (amount > 0 && eligible.length) pots.push({ amount, eligible });
    else if (amount > 0 && pots.length) pots[pots.length - 1].amount += amount;
    prev = lvl;
  }
  return pots;
}

function finish(s: PokerState, reason: HandOutcome["reason"]): PokerState {
  const alive = s.players.filter((p) => !p.folded);
  const isShowdown = alive.length > 1;
  const pots = buildPots(s.players);
  const winnerSet = new Set<number>();
  const winnerOrder: number[] = [];
  // Abstand links vom Dealer: Dealer+1 = 0 … Dealer = 3
  const leftOfDealer = (i: number) => (i - s.dealer - 1 + SEATS) % SEATS;

  pots.forEach((pot) => {
    const best = Math.max(...pot.eligible.map((i) => (isShowdown ? (s.players[i].score ?? 0) : 0)));
    const winners = isShowdown ? pot.eligible.filter((i) => s.players[i].score === best) : pot.eligible;
    const share = Math.floor(pot.amount / winners.length);
    let rest = pot.amount - share * winners.length;
    winners
      .slice()
      .sort((a, b) => leftOfDealer(a) - leftOfDealer(b))
      .forEach((w) => {
        let amt = share;
        if (rest > 0) {
          amt += 1;
          rest -= 1;
        }
        s.players[w].stack += amt;
        s.players[w].won += amt;
        if (!winnerSet.has(w)) {
          winnerSet.add(w);
          winnerOrder.push(w);
        }
      });
  });

  s.phase = "done";
  s.toAct = -1;
  s.result = {
    reason, pot:s.pot, showdown:isShowdown, winners:winnerOrder,
    nets:s.players.map((player)=>player.stack-player.startStack),
    pots:pots.length,allIn:s.players.some((player)=>player.allIn),
  };
  return s;
}
