import { WHEEL_ORDER } from "./rules";

/**
 * Mathematik des 3D-Kessels – unabhängig von three.js und deshalb vollständig testbar.
 *
 * Winkelkonvention wie im Blender-Export: Winkel = atan2(x, z) um die y-Achse.
 * Ein Punkt mit Winkel a und Radius r liegt bei (sin a · r, h, cos a · r).
 * `rotation.y = φ` eines Objekts addiert φ zu diesem Winkel.
 */

const TAU = Math.PI * 2;
const POCKETS = WHEEL_ORDER.length;

/** Winkelabstand zweier Fächer. */
export const POCKET_STEP = TAU / POCKETS;

/** Kugelbahn, Ablaufzone und Fächer (vermessen aus RouletteRad.glb, Kugelmitte). */
export const BALL_TRACK = { radius: 0.365, height: 0.106 };
export const BALL_APRON = { radius: 0.27, height: 0.06 };
export const BALL_POCKET = { radius: 0.192, height: 0.037 };

/** Phasengrenzen: Bahn | Auslauf | Abwurf | Mitlauf im Fach. */
const P1 = 0.45;
const P2 = 0.68;
const P3 = 0.84;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Winkel des Fachs mit Index `index` (in WHEEL_ORDER) im Rotor-Koordinatensystem. Zéro liegt auf +x. */
export const pocketAngle = (index: number) => Math.PI / 2 - index * POCKET_STEP;

/** Welche Zahl liegt unter der Kugel? */
export function numberAt(rotor: number, ballAngle: number): number {
  const rel = ballAngle - rotor;
  const idx = Math.round((Math.PI / 2 - rel) / POCKET_STEP);
  return WHEEL_ORDER[((idx % POCKETS) + POCKETS) % POCKETS];
}

export interface SpinPlan {
  num: number;
  index: number;
  rotorStart: number;
  rotorEnd: number;
  /** Winkel der Kugel beim Start (auf der Bahn) */
  ballStart: number;
  /** Winkel der Kugel beim Einrasten ins Fach (Beginn der Mitlauf-Phase) */
  ballFree: number;
  /** Endwinkel der Kugel (Weltkoordinaten) */
  ballEnd: number;
}

export interface SpinSample {
  rotor: number;
  ball: { angle: number; radius: number; height: number };
}

export interface SpinOptions {
  rotorTurns?: number;
  ballTurns?: number;
}

const rotorAt = (p: SpinPlan, t: number) => lerp(p.rotorStart, p.rotorEnd, easeOut(t));

/** Plant eine Drehung so, dass die Kugel im Fach der Zahl `num` liegen bleibt. */
export function planSpin(num: number, rotorStart: number, { rotorTurns = 3, ballTurns = 7 }: SpinOptions = {}): SpinPlan {
  const index = WHEEL_ORDER.indexOf(num as (typeof WHEEL_ORDER)[number]);
  if (index < 0) throw new Error(`Ungültige Zahl: ${num}`);
  const partial: SpinPlan = {
    num,
    index,
    rotorStart,
    rotorEnd: rotorStart + rotorTurns * TAU,
    ballStart: 0,
    ballFree: 0,
    ballEnd: 0,
  };
  // Beim Einrasten muss die Kugel genau über dem Zielfach stehen.
  partial.ballFree = pocketAngle(index) + rotorAt(partial, P3);
  // Die Kugel läuft gegen die Drehrichtung des Rotors (abnehmender Winkel).
  partial.ballStart = partial.ballFree + ballTurns * TAU;
  partial.ballEnd = pocketAngle(index) + partial.rotorEnd;
  return partial;
}

/** Zustand von Rotor und Kugel zum normierten Zeitpunkt t ∈ [0, 1]. */
export function sampleSpin(p: SpinPlan, tRaw: number): SpinSample {
  const t = clamp01(tRaw);
  const rotor = rotorAt(p, t);

  if (t >= P3) {
    // 4 Mitlauf: Kugel liegt im Fach und dreht mit dem Rotor
    return { rotor, ball: { angle: pocketAngle(p.index) + rotor, ...BALL_POCKET } };
  }

  const angle = lerp(p.ballStart, p.ballFree, easeOut(t / P3));
  let radius: number;
  let height: number;
  if (t < P1) {
    // 1 Bahn: Kugel läuft oben auf der Kugelbahn
    ({ radius, height } = BALL_TRACK);
  } else if (t < P2) {
    // 2 Auslauf: Kugel verliert Tempo und rollt die Schräge hinunter
    const e = easeInOut((t - P1) / (P2 - P1));
    radius = lerp(BALL_TRACK.radius, BALL_APRON.radius, e);
    height = lerp(BALL_TRACK.height, BALL_APRON.height, e);
  } else {
    // 3 Abwurf: Kugel fällt in den Kranz, kurzer Prellsprung an den Stegen
    const k = (t - P2) / (P3 - P2);
    const e = easeInOut(k);
    const bounce = Math.abs(Math.sin(k * Math.PI * 2.2)) * (1 - k) * 0.012;
    radius = lerp(BALL_APRON.radius, BALL_POCKET.radius, e);
    height = lerp(BALL_APRON.height, BALL_POCKET.height, e) + bounce;
  }
  return { rotor, ball: { angle, radius, height } };
}
