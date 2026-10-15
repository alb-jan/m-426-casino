import { describe, expect, it } from "vitest";
import { aggression, newProfile, observe } from "./opponentModel";

describe("opponentModel", () => {
  it("startet neutral", () => {
    expect(aggression(newProfile())).toBe(0);
  });

  it("erkennt einen Spieler, der ständig gross setzt", () => {
    let p = newProfile();
    for (let i = 0; i < 10; i++) p = observe(p, "raise", 300, 60);
    expect(aggression(p)).toBeGreaterThan(0.8);
  });

  it("wertet Mitgehen und kleine Erhöhungen nicht als Aggression", () => {
    let p = newProfile();
    for (let i = 0; i < 10; i++) p = observe(p, i % 2 ? "call" : "raise", 20, 200);
    expect(aggression(p)).toBe(0);
  });

  it("verändert das Profil nicht direkt", () => {
    const p = newProfile();
    observe(p, "raise", 500, 30);
    expect(p).toEqual(newProfile());
  });
});
