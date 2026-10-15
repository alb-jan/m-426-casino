import { Chip } from "@/components/chips/Chip";
import type { FlyingChip } from "./usePokerGame";

/** Sitz-Anker in % der Tischfläche: Du unten, Bots oben links/mitte/rechts. */
const ANCHORS: [number, number][] = [
  [50, 86],
  [17, 15],
  [50, 15],
  [83, 15],
];
const EASE = "cubic-bezier(.34,.8,.2,1)";

export function ChipFlight({ chips }: { chips: FlyingChip[] }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 6 }} aria-hidden="true">
      {chips.map((c) => {
        let [x, y] = ANCHORS[c.seat];
        let jx = 0;
        let jy = 0;
        let rot = c.rot;
        let opacity = 1;
        let transition = `left .58s ${EASE},top .58s ${EASE},transform .58s ${EASE},opacity .3s ease`;
        if (c.at === "seat") rot = 0;
        else if (c.at === "pot") {
          [x, y, jx, jy] = [50, 47, c.jx, c.jy];
        } else {
          [x, y] = ANCHORS[c.win ?? 0];
          opacity = 0;
          transition = "left .8s cubic-bezier(.4,.7,.2,1),top .8s cubic-bezier(.4,.7,.2,1),transform .8s ease,opacity .8s ease";
        }
        return (
          <span
            key={c.id}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              zIndex: c.z,
              opacity,
              transform: `translate(-50%,-50%) translate(${jx}px,${jy}px) rotate(${rot}deg)`,
              transition,
            }}
          >
            <Chip value={c.val} size={30} inset={4} fontSize={10} />
          </span>
        );
      })}
    </div>
  );
}
