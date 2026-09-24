import { describe, expect, it } from "vitest";
import { parseAmount, previewChips, validatePurchase } from "./purchase";

describe("parseAmount", () => {
  it("akzeptiert Punkt und Komma", () => {
    expect(parseAmount("12.50")).toBe(12.5);
    expect(parseAmount("12,50")).toBe(12.5);
  });

  it("ignoriert Fremdzeichen", () => {
    expect(parseAmount("CHF 25")).toBe(25);
  });

  it("liefert NaN ohne Ziffern", () => {
    expect(parseAmount("abc")).toBeNaN();
  });
});

describe("previewChips", () => {
  it("rechnet mit Kurs 10 und rundet ab", () => {
    expect(previewChips("25")).toBe(250);
    expect(previewChips("12,55")).toBe(125);
    expect(previewChips("")).toBe(0);
    expect(previewChips("xyz")).toBe(0);
  });
});

describe("validatePurchase", () => {
  it("akzeptiert gültige Beträge", () => {
    expect(validatePurchase("25")).toEqual({ ok: true, chf: 25, chips: 250 });
    expect(validatePurchase("500")).toEqual({ ok: true, chf: 500, chips: 5000 });
    expect(validatePurchase("5")).toEqual({ ok: true, chf: 5, chips: 50 });
  });

  it("meldet leere Eingaben", () => {
    expect(validatePurchase("   ")).toEqual({ ok: false, error: "Bitte gib einen Betrag ein." });
  });

  it("meldet ungültige Eingaben", () => {
    const msg = "Ungültiger Betrag – bitte nur Zahlen eingeben, z. B. 25 oder 12.50.";
    expect(validatePurchase("abc")).toEqual({ ok: false, error: msg });
    expect(validatePurchase("0")).toEqual({ ok: false, error: msg });
  });

  it("meldet Unter- und Überschreitung", () => {
    expect(validatePurchase("4.99")).toEqual({
      ok: false,
      error: "Der Mindestbetrag beträgt CHF 5 (= 50 Jetons).",
    });
    expect(validatePurchase("500.01")).toEqual({ ok: false, error: "Pro Kauf sind maximal CHF 500 möglich." });
  });
});
