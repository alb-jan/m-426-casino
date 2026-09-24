import type { CSSProperties } from "react";
import { chipView } from "@/lib/chips";

interface ChipProps {
  value: number;
  /** Durchmesser in px */
  size?: number;
  /** Abstand Rand → Innenkreis in px (Default: size/7) */
  inset?: number;
  fontSize?: number;
  style?: CSSProperties;
}

/** Casino-Jeton: gestreifter Rand (conic-gradient) mit gestricheltem Innenkreis. */
export function Chip({ value, size = 30, inset, fontSize, style }: ChipProps) {
  const v = chipView(value);
  const pad = inset ?? Math.round(size / 7.5);
  return (
    <span
      data-testid={`chip-${value}`}
      style={{
        position: "relative",
        display: "block",
        flex: "none",
        width: size,
        height: size,
        borderRadius: "50%",
        background: v.edge,
        boxShadow: "0 3px 8px rgba(0,0,0,.55),inset 0 0 0 1px rgba(0,0,0,.4)",
        ...style,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: pad,
          borderRadius: "50%",
          background: v.base,
          border: `1px dashed ${v.dash}`,
          boxShadow: "inset 0 2px 5px rgba(255,255,255,.2),inset 0 -2px 5px rgba(0,0,0,.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--mono)",
          fontSize: fontSize ?? Math.max(8, Math.round(size / 3)),
          fontWeight: 700,
          color: v.fg,
        }}
      >
        {value}
      </span>
    </span>
  );
}
