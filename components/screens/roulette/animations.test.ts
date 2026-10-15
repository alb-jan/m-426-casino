import { expect, it } from "vitest";
import { missingKeyframesIn } from "@/lib/testing/cssAnimations";

it("definiert alle verwendeten @keyframes im eigenen CSS-Modul", () => {
  expect(missingKeyframesIn("components/screens/roulette")).toEqual({});
});
