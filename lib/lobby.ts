import { DEFAULT_GAME_ENTRIES, type GameEntry } from "./games";
export const GAME_MIN_CHIPS = Object.fromEntries(DEFAULT_GAME_ENTRIES.map((game) => [game.id, game.minimum]));
export type EntryCheck = { ok: true } | { ok: false; title: string; msg: string };
export function checkGameEntry(entry: GameEntry | string, chips: number): EntryCheck {
  const game = typeof entry === "string" ? DEFAULT_GAME_ENTRIES.find((item) => item.id === entry) : entry;
  if (!game) return { ok: false, title: "Unbekanntes Spiel", msg: "Dieses Spiel ist nicht registriert." };
  if (chips >= game.minimum) return { ok: true };
  return { ok: false, title: "Zu wenig Jetons", msg: `Für ${game.title} brauchst du mindestens ${game.minimum} Jetons (${game.entryReason}).` };
}
