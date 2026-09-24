import { describe, expect, it } from "vitest";
import { metadata } from "./layout";
import { fontVariables } from "./fonts";

describe("RootLayout", () => {
  it("setzt den App-Titel", () => {
    expect(metadata.title).toBe("Casino Goldenes Ass");
  });

  it("stellt alle drei Design-Schriften als CSS-Variablen bereit", () => {
    expect(fontVariables).toContain("--font-cormorant");
    expect(fontVariables).toContain("--font-manrope");
    expect(fontVariables).toContain("--font-plex-mono");
  });
});
