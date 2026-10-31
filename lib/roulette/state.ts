import { placeBet, resolveSpin, spinNumber, totalBet, type BetKey, type Bets, type SpinResult } from "./rules";

export type RoulettePhaseName = "betting" | "spinning" | "result";
export interface RouletteSnapshot {
  readonly phase: RoulettePhaseName;
  readonly bets: Readonly<Bets>;
  readonly pending: number | null;
  readonly roundId: number;
  readonly result: Readonly<SpinResult> | null;
  readonly history: readonly number[];
}
export type RouletteCommand =
  | { type: "place"; key: BetKey; amount: number; balance: number }
  | { type: "clear" | "spin" | "leave" }
  | { type: "finish"; roundId: number };
export type RouletteEffect =
  | { kind: "insufficient-funds" | "invalid-bet" | "no-bet" | "round-active" }
  | { kind: "cleared"; amount: number }
  | { kind: "settled"; result: SpinResult };
export interface RouletteTransition {
  readonly snapshot: RouletteSnapshot;
  readonly walletDelta: number;
  readonly allowed: boolean;
  readonly effect?: RouletteEffect;
}
/** Gemeinsamer State-Vertrag. Der Context delegiert jede Aktion an seinen Zustand. */
export interface RoulettePhase {
  readonly name: RoulettePhaseName;
  handle(context: RouletteGame, command: RouletteCommand): RouletteTransition;
}

function freeze(snapshot: RouletteSnapshot): RouletteSnapshot {
  return Object.freeze({
    ...snapshot, bets: Object.freeze({ ...snapshot.bets }),
    history: Object.freeze([...snapshot.history]),
    result: snapshot.result ? Object.freeze({ ...snapshot.result }) : null,
  });
}
const outside = new Set(["red", "black", "even", "odd", "low", "high", "d1", "d2", "d3"]);
function validKey(key: BetKey): boolean {
  if (outside.has(key)) return true;
  return /^n:(?:[0-9]|[12][0-9]|3[0-6])$/.test(key);
}

export class BettingState implements RoulettePhase {
  readonly name = "betting";
  handle(context: RouletteGame, command: RouletteCommand): RouletteTransition {
    switch (command.type) {
      case "place": return context.addBet(command);
      case "clear": return context.clear(true);
      case "leave": return context.clear(false);
      case "spin": return context.startSpin();
      default: return context.unchanged();
    }
  }
}
export class SpinningState implements RoulettePhase {
  readonly name = "spinning";
  handle(context: RouletteGame, command: RouletteCommand): RouletteTransition {
    if (command.type === "finish" && command.roundId === context.snapshot.roundId) return context.settle();
    return context.unchanged(false, command.type === "finish" ? undefined : { kind: "round-active" });
  }
}
export class ResultState implements RoulettePhase {
  readonly name = "result";
  handle(context: RouletteGame, command: RouletteCommand): RouletteTransition {
    if (command.type === "place") return context.addBet(command);
    if (command.type === "leave" || command.type === "clear") return context.unchanged(true);
    return context.unchanged(false, command.type === "spin" ? { kind: "no-bet" } : undefined);
  }
}

/** Klassischer State-Context; keine Abhaengigkeit zu React, Wallet, Timer oder Darstellung. */
export class RouletteGame {
  private current: RoulettePhase = new BettingState();
  private value = freeze({ phase: "betting", bets: {}, pending: null, roundId: 0, result: null, history: [] });
  constructor(private readonly rng: () => number = Math.random) {}
  get snapshot(): RouletteSnapshot { return this.value; }
  dispatch(command: RouletteCommand): RouletteTransition { return this.current.handle(this, command); }

  unchanged(allowed = false, effect?: RouletteEffect): RouletteTransition {
    return { snapshot: this.value, walletDelta: 0, allowed, effect };
  }
  private change(state: RoulettePhase, patch: Partial<RouletteSnapshot>, walletDelta = 0, effect?: RouletteEffect): RouletteTransition {
    this.current = state;
    this.value = freeze({ ...this.value, ...patch, phase: state.name });
    return { snapshot: this.value, walletDelta, allowed: true, effect };
  }
  addBet(command: Extract<RouletteCommand, { type: "place" }>): RouletteTransition {
    if (!Number.isSafeInteger(command.amount) || command.amount <= 0 || !validKey(command.key)) {
      return this.unchanged(false, { kind: "invalid-bet" });
    }
    if (!Number.isFinite(command.balance) || command.balance < command.amount) {
      return this.unchanged(false, { kind: "insufficient-funds" });
    }
    return this.change(new BettingState(), { bets: placeBet(this.value.bets, command.key, command.amount), result: null }, -command.amount);
  }
  clear(announce: boolean): RouletteTransition {
    const amount = totalBet(this.value.bets);
    return this.change(new BettingState(), { bets: {}, pending: null }, amount, announce && amount ? { kind: "cleared", amount } : undefined);
  }
  startSpin(): RouletteTransition {
    if (!totalBet(this.value.bets)) return this.unchanged(false, { kind: "no-bet" });
    const num = spinNumber(this.rng);
    if (!Number.isInteger(num) || num < 0 || num > 36) return this.unchanged(false);
    return this.change(new SpinningState(), { pending: num, roundId: this.value.roundId + 1, result: null });
  }
  settle(): RouletteTransition {
    const result = resolveSpin(this.value.pending!, this.value.bets);
    return this.change(new ResultState(), {
      bets: {}, pending: null, result, history: [result.num, ...this.value.history].slice(0, 10),
    }, result.out, { kind: "settled", result });
  }
}
