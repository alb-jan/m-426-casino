import { describe, expect, it } from "vitest";
import { cards } from "./cards";
import { eval5, evalBest, handName } from "./evaluate";

const name5 = (s: string) => handName(eval5(cards(s)));
const best = (s: string) => evalBest(cards(s));

describe("eval5 – Kategorien", () => {
  it.each([
    ["As Ks Qs Js Ts", "Royal Flush"],
    ["9h 8h 7h 6h 5h", "Straight Flush"],
    ["9c 9d 9h 9s 2c", "Vierling"],
    ["Kc Kd Kh 4s 4c", "Full House"],
    ["Ad 9d 7d 4d 2d", "Flush"],
    ["9c 8d 7h 6s 5c", "Straße"],
    ["Ac 2d 3h 4s 5c", "Straße"],
    ["Qc Qd Qh 7s 2c", "Drilling"],
    ["Jc Jd 4h 4s 2c", "Zwei Paare"],
    ["Tc Td 8h 4s 2c", "Paar"],
    ["Ac Jd 8h 4s 2c", "Höchste Karte"],
  ])("%s → %s", (hand, expected) => {
    expect(name5(hand)).toBe(expected);
  });

  it("wertet das Wheel (A-2-3-4-5) als niedrigste Straße", () => {
    expect(eval5(cards("Ac 2d 3h 4s 5c")).top).toBe(5);
    expect(eval5(cards("6c 2d 3h 4s 5c")).score).toBeGreaterThan(eval5(cards("Ac 2d 3h 4s 5c")).score);
  });

  it("A-5 Straight Flush ist kein Royal Flush", () => {
    expect(name5("Ah 2h 3h 4h 5h")).toBe("Straight Flush");
  });
});

describe("eval5 – Vergleich", () => {
  const score = (s: string) => eval5(cards(s)).score;

  it("höhere Kategorie schlägt niedrigere", () => {
    expect(score("2c 2d 3h 4s 6c")).toBeGreaterThan(score("Ac Kd Qh Js 9c"));
    expect(score("2c 3c 4c 5c 7c")).toBeGreaterThan(score("Ac Kd Qh Js Tc"));
  });

  it("entscheidet über Kicker", () => {
    expect(score("Ac Ad Kh 4s 2c")).toBeGreaterThan(score("As Ah Qh 4d 2d"));
    expect(score("Jc Jd 4h 4s Ac")).toBeGreaterThan(score("Js Jh 4d 4c Kc"));
    expect(score("Kc Kd Kh 2s 2c")).toBeLessThan(score("Ac Ad Ah 2d 2h"));
  });

  it("gleiche Hände sind gleich stark", () => {
    expect(score("Ac Kd Qh Js 9c")).toBe(score("Ad Kc Qs Jh 9d"));
  });
});

describe("evalBest", () => {
  it("findet die beste Hand aus 7 Karten", () => {
    expect(handName(best("As Ah Ac 8d 3s Jh 5c"))).toBe("Drilling");
    expect(handName(best("2h 3h 9h Jh Kh Kd Ks"))).toBe("Flush");
    expect(handName(best("5d 6c 7h 8s 9c Kd Ks"))).toBe("Straße");
  });

  it("bewertet 2 Karten (Pre-Flop) als Paar oder höchste Karte", () => {
    expect(handName(best("Qs Qh"))).toBe("Paar");
    expect(handName(best("As 7h"))).toBe("Höchste Karte");
    expect(best("Qs Qh").score).toBeGreaterThan(best("As Kh").score);
  });
});
