import { describe, expect, it } from "vitest";
import { cardText, cards, newDeck, parseCard } from "./cards";

describe("parseCard / cards", () => {
  it("liest Rang und Farbe", () => {
    expect(parseCard("As")).toEqual({ r: 14, s: "♠", red: false });
    expect(parseCard("Th")).toEqual({ r: 10, s: "♥", red: true });
    expect(parseCard("2d")).toEqual({ r: 2, s: "♦", red: true });
    expect(parseCard("Qc")).toEqual({ r: 12, s: "♣", red: false });
  });

  it("liest mehrere Karten", () => {
    expect(cards("Ks 9h").map((c) => c.r)).toEqual([13, 9]);
  });

  it("wirft bei ungültigen Karten", () => {
    expect(() => parseCard("Zz")).toThrow();
  });
});

describe("cardText", () => {
  it("zeigt Bildkarten als Buchstaben und 10 als Zahl", () => {
    expect(cardText(parseCard("Ah"))).toBe("A");
    expect(cardText(parseCard("Kh"))).toBe("K");
    expect(cardText(parseCard("Qh"))).toBe("Q");
    expect(cardText(parseCard("Jh"))).toBe("J");
    expect(cardText(parseCard("Th"))).toBe("10");
    expect(cardText(parseCard("7h"))).toBe("7");
  });
});

describe("newDeck", () => {
  it("enthält 52 verschiedene Karten", () => {
    const deck = newDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((c) => c.r + c.s)).size).toBe(52);
  });

  it("mischt mit dem übergebenen Zufallsgenerator (deterministisch)", () => {
    let seed = 1;
    const rng = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const a = newDeck(rng);
    seed = 1;
    const b = newDeck(rng);
    expect(a).toEqual(b);
  });
});
