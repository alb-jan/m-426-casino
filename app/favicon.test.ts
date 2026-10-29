import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
describe("US-15 Browsericon",()=>{
 it("liefert eine gÃ¼ltige mehrformatige ICO-Datei fÃ¼r den Browser",()=>{
  const ico=readFileSync(join(process.cwd(),"app","favicon.ico"));
  expect([...ico.subarray(0,4)]).toEqual([0,0,1,0]);
  expect(ico.readUInt16LE(4)).toBeGreaterThanOrEqual(3);
 });
});
