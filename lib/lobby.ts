export type Game = "poker" | "roulette";

/** Mindestguthaben: Poker = Big Blind, Roulette = kleinster Jeton. */
export const GAME_MIN_CHIPS: Record<Game, number> = { poker: 20, roulette: 10 };

export type EntryCheck = { ok: true } | { ok: false; title: string; msg: string };

export function checkGameEntry(game: Game, chips: number): EntryCheck {
  const min = GAME_MIN_CHIPS[game];
  if (chips >= min) return { ok: true };
  const reason = game === "poker" ? "Big Blind" : "kleinster Jeton";
  const name = game === "poker" ? "Poker" : "Roulette";
  return {
    ok: false,
    title: "Zu wenig Jetons",
    msg: `Für ${name} brauchst du mindestens ${min} Jetons (${reason}).`,
  };
}
