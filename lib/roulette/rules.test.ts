import { colorName, numberBg } from "./view";
import { spinMessage } from "@/lib/roulette/view";
import { describe, expect, it } from "vitest";
import {
  GRID,
  numberColor,
  payout,
  placeBet,
  RED,
  resolveSpin,
  spinNumber,
  totalBet,
  WHEEL_ORDER,
} from "./rules";

describe("Kessel und Farben", () => {
  it("enthält jede Zahl 0–36 genau einmal in europäischer Reihenfolge", () => {
    expect(WHEEL_ORDER).toHaveLength(37);
    expect(new Set(WHEEL_ORDER).size).toBe(37);
    expect(WHEEL_ORDER.slice(0, 5)).toEqual([0, 32, 15, 19, 4]);
    expect(WHEEL_ORDER[36]).toBe(26);
  });

  it("hat 18 rote und 18 schwarze Zahlen, die sich im Kessel abwechseln", () => {
    expect(RED.size).toBe(18);
    for (let i = 1; i < 37; i++) {
      expect(numberColor(WHEEL_ORDER[i])).toBe(i % 2 === 1 ? "red" : "black");
    }
  });

  it("benennt und färbt Zahlen", () => {
    expect(numberColor(0)).toBe("green");
    expect(colorName(0)).toBe("Grün · Zéro");
    expect(colorName(1)).toBe("Rot");
    expect(colorName(2)).toBe("Schwarz");
    expect(numberBg(0)).toBe("#16724E");
    expect(numberBg(1)).toBe("#B23A2E");
    expect(numberBg(2)).toBe("#1A1A1A");
  });

  it("ordnet das Tableau in 3 Reihen zu 12 Spalten", () => {
    expect(GRID).toHaveLength(36);
    expect(GRID.slice(0, 3)).toEqual([3, 6, 9]);
    expect(GRID.slice(12, 14)).toEqual([2, 5]);
    expect(GRID.slice(24, 26)).toEqual([1, 4]);
  });
});

describe("Einsätze", () => {
  it("summiert Einsätze pro Feld, ohne das Original zu verändern", () => {
    const a = {};
    const b = placeBet(a, "red", 10);
    const c = placeBet(b, "red", 50);
    const d = placeBet(c, "n:17", 20);
    expect(a).toEqual({});
    expect(d).toEqual({ red: 60, "n:17": 20 });
    expect(totalBet(d)).toBe(80);
  });
});

describe("payout", () => {
  it("zahlt Einzelzahlen 35 : 1 (36-fach inkl. Einsatz)", () => {
    expect(payout(17, { "n:17": 10 })).toBe(360);
    expect(payout(18, { "n:17": 10 })).toBe(0);
    expect(payout(0, { "n:0": 10 })).toBe(360);
  });

  it("zahlt Dutzende 2 : 1", () => {
    expect(payout(12, { d1: 10 })).toBe(30);
    expect(payout(13, { d2: 10 })).toBe(30);
    expect(payout(25, { d3: 10 })).toBe(30);
    expect(payout(13, { d1: 10 })).toBe(0);
  });

  it("zahlt einfache Chancen 1 : 1", () => {
    expect(payout(1, { red: 10, odd: 10, low: 10 })).toBe(60);
    expect(payout(2, { black: 10, even: 10, low: 10 })).toBe(60);
    expect(payout(36, { red: 10, even: 10, high: 10 })).toBe(60);
    expect(payout(19, { black: 10, even: 10, low: 10 })).toBe(0);
  });

  it("lässt bei Zéro alle Aussen-Einsätze verlieren", () => {
    expect(payout(0, { red: 10, black: 10, even: 10, odd: 10, low: 10, high: 10, d1: 10 })).toBe(0);
  });
});

describe("spinNumber / resolveSpin / spinMessage", () => {
  it("liefert Zahlen von 0 bis 36", () => {
    expect(spinNumber(() => 0)).toBe(0);
    expect(spinNumber(() => 0.9999)).toBe(36);
  });

  it("berechnet Auszahlung und Nettogewinn", () => {
    expect(resolveSpin(17, { "n:17": 10, red: 20 })).toEqual({ num: 17, out: 360, net: 330, total: 30 });
  });

  it("formuliert Gewinn, Teilgewinn und Verlust", () => {
    expect(spinMessage({ num: 17, out: 360, net: 330, total: 30 })).toEqual({
      kind: "win",
      title: "Gewonnen!",
      msg: "17 Schwarz – Auszahlung 360 Jetons (+330).",
    });
    expect(spinMessage({ num: 1, out: 20, net: -10, total: 30 })).toEqual({
      kind: "info",
      title: "Runde beendet",
      msg: "1 Rot – Auszahlung 20 Jetons (-10).",
    });
    expect(spinMessage({ num: 0, out: 0, net: -1000, total: 1000 })).toEqual({
      kind: "lose",
      title: "Verloren",
      msg: "0 Grün – Einsatz von 1’000 Jetons verfällt.",
    });
  });
});
