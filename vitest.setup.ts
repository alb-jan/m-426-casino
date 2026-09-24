import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// next/font/google funktioniert nur im Next-Compiler – im Test reicht ein Stub.
vi.mock("next/font/google", () => {
  const font = (name: string) => () => ({
    className: `font-${name}`,
    variable: `--font-${name}`,
    style: { fontFamily: name },
  });
  return {
    Cormorant_Garamond: font("cormorant"),
    Manrope: font("manrope"),
    IBM_Plex_Mono: font("plex-mono"),
  };
});
