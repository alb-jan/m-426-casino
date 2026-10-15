export const LANDING_FEATURES = [
  {
    glyph: "♠",
    title: "Texas Hold’em",
    text: "Vier Plätze, drei Hausgegner, echte Handbewertung von Paar bis Straight Flush.",
  },
  {
    glyph: "◉",
    title: "Roulette",
    text: "Eine Null, 37 Fächer, mehrere Einsätze pro Runde und Quoten bis 35 : 1.",
  },
  {
    glyph: "❖",
    title: "Ein Guthaben",
    text: "Jetons in Franken kaufen, an beiden Tischen setzen, an der Kasse auszahlen.",
  },
] as const;

export interface FloatChip {
  val: number;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  size: number;
  font: number;
  pad: number;
  rot: number;
  anim: string;
}

export const FLOAT_CHIPS: FloatChip[] = [
  { val: 20, left: "7%", top: "26%", size: 72, font: 20, pad: 10, rot: -14, anim: "floatChip 6s ease-in-out infinite" },
  { val: 50, right: "9%", top: "20%", size: 58, font: 17, pad: 8, rot: 12, anim: "floatChip 7.5s ease-in-out .8s infinite" },
  { val: 500, right: "16%", bottom: "16%", size: 86, font: 22, pad: 12, rot: -8, anim: "floatChip 8.5s ease-in-out .4s infinite" },
  { val: 10, left: "13%", bottom: "12%", size: 52, font: 15, pad: 7, rot: 9, anim: "floatChip 6.8s ease-in-out 1.2s infinite" },
];
