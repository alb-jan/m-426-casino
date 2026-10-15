import { describe, expect, it } from "vitest";
import { WHEEL_ORDER } from "./rules";
import { BALL_POCKET, BALL_TRACK, numberAt, planSpin, pocketAngle, POCKET_STEP, sampleSpin } from "./wheelMath";

const TAU = Math.PI * 2;
const wrap = (a: number) => ((a % TAU) + TAU) % TAU;

describe("pocketAngle", () => {
  it("legt Zéro auf die +x-Achse und die Fächer im Uhrzeigersinn", () => {
    expect(POCKET_STEP).toBeCloseTo(TAU / 37);
    expect(pocketAngle(0)).toBeCloseTo(Math.PI / 2);
    expect(pocketAngle(1)).toBeCloseTo(Math.PI / 2 - TAU / 37);
  });
});

describe("numberAt", () => {
  it("findet die Zahl unter der Kugel, auch bei gedrehtem Rotor", () => {
    expect(numberAt(0, Math.PI / 2)).toBe(0);
    expect(numberAt(0, pocketAngle(1))).toBe(32);
    expect(numberAt(1.3, pocketAngle(WHEEL_ORDER.indexOf(17)) + 1.3)).toBe(17);
    expect(numberAt(-40, pocketAngle(36) - 40 + 0.05)).toBe(26);
  });
});

describe("planSpin / sampleSpin", () => {
  it("startet die Kugel auf der Bahn", () => {
    const s = sampleSpin(planSpin(17, 0), 0);
    expect(s.ball.radius).toBeCloseTo(BALL_TRACK.radius);
    expect(s.ball.height).toBeCloseTo(BALL_TRACK.height);
    expect(s.rotor).toBeCloseTo(0);
  });

  it.each(WHEEL_ORDER.map((n) => [n]))("lässt die Kugel für %i im richtigen Fach landen", (n) => {
    const rotorStart = (n * 0.77) % TAU; // beliebige Startstellung
    const plan = planSpin(n, rotorStart);
    const end = sampleSpin(plan, 1);
    expect(numberAt(end.rotor, end.ball.angle)).toBe(n);
    expect(end.ball.radius).toBeCloseTo(BALL_POCKET.radius);
    expect(end.ball.height).toBeCloseTo(BALL_POCKET.height);
    expect(end.rotor).toBeCloseTo(plan.rotorEnd);
  });

  it("dreht Rotor und Kugel gegenläufig mit mehreren Umdrehungen", () => {
    const plan = planSpin(5, 0, { rotorTurns: 3, ballTurns: 8 });
    expect(plan.rotorEnd - plan.rotorStart).toBeCloseTo(3 * TAU);
    expect(plan.ballStart - plan.ballFree).toBeCloseTo(8 * TAU);
  });

  it("bewegt die Kugel stetig ohne Sprünge", () => {
    const plan = planSpin(23, 2);
    let prev = sampleSpin(plan, 0);
    for (let i = 1; i <= 600; i++) {
      const cur = sampleSpin(plan, i / 600);
      expect(Math.abs(cur.ball.angle - prev.ball.angle)).toBeLessThan(0.35);
      expect(Math.abs(cur.ball.radius - prev.ball.radius)).toBeLessThan(0.01);
      expect(Math.abs(cur.rotor - prev.rotor)).toBeLessThan(0.2);
      prev = cur;
    }
  });

  it("wandert von der Bahn nach innen und bleibt dort", () => {
    const plan = planSpin(8, 0);
    const radii = [0, 0.3, 0.6, 0.8, 0.9, 1].map((t) => sampleSpin(plan, t).ball.radius);
    for (let i = 1; i < radii.length; i++) expect(radii[i]).toBeLessThanOrEqual(radii[i - 1] + 1e-9);
  });

  it("rechnet mit Endwinkeln, die dem Zielfach entsprechen", () => {
    const plan = planSpin(0, 0);
    expect(wrap(plan.ballEnd - plan.rotorEnd)).toBeCloseTo(wrap(pocketAngle(0)));
  });
});
