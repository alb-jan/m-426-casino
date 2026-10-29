import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
describe("US-15 Browsericon",()=>{
 it("liefert eine gültige mehrformatige ICO-Datei für den Browser",()=>{
  const ico=readFileSync(new URL("./favicon.ico",import.meta.url));
  expect([...ico.subarray(0,4)]).toEqual([0,0,1,0]);
  expect(ico.readUInt16LE(4)).toBeGreaterThanOrEqual(3);
 });
});
