import { cards, newDeck, type Card } from "./cards";

/**
 * Test-Hilfe: Deck, aus dem per pop() zuerst die Startkarten der Spieler 0–3
 * (je zwei) und danach die fünf Gemeinschaftskarten gezogen werden.
 */
export function rigDeck(holes: [string, string, string, string], board: string): Card[] {
  const order = [...holes.flatMap((h) => cards(h)), ...cards(board)];
  const used = new Set(order.map((c) => c.r + c.s));
  const filler = newDeck(() => 0.5).filter((c) => !used.has(c.r + c.s));
  return [...filler, ...order.reverse()];
}
