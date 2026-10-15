import type { PokerAction } from "./engine";

/** Gedächtnis der Bots über den Spieler. */
export interface Profile {
  actions: number;
  bigBets: number;
}

export const newProfile = (): Profile => ({ actions: 0, bigBets: 0 });

/** Zählt eine Aktion; „gross“ = Einsatz ≥ halber Pot. */
export function observe(p: Profile, action: PokerAction, paid: number, pot: number): Profile {
  const big = action === "raise" && paid >= pot / 2;
  return { actions: p.actions + 1, bigBets: p.bigBets + (big ? 1 : 0) };
}

/** Anteil grosser Einsätze (0…1); erst ab 4 Aktionen aussagekräftig. */
export const aggression = (p: Profile) => (p.actions < 4 ? 0 : p.bigBets / p.actions);
