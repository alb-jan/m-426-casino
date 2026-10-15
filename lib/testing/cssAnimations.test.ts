import { describe, expect, it } from "vitest";
import { missingKeyframes, missingKeyframesIn } from "./cssAnimations";

describe("missingKeyframes", () => {
  it("findet Animationen ohne eigene @keyframes", () => {
    const css = `.a { animation: crestSpin 26s linear infinite reverse; }
      .b { animation: rise .7s .1s ease both, glow 2s; }
      @keyframes rise { from { opacity: 0 } to { opacity: 1 } }`;
    expect(missingKeyframes(css)).toEqual(["crestSpin", "glow"]);
  });

  it("erkennt animation-name und ignoriert none / Variablen", () => {
    const css = `.a { animation-name: pulse; } .b { animation: none; } .c { animation: var(--x); }
      @keyframes pulse { to { opacity: 1 } }`;
    expect(missingKeyframes(css)).toEqual([]);
  });

  it("prüft alle CSS-Module eines Ordners", () => {
    expect(missingKeyframesIn("app")).toEqual({});
  });
});
