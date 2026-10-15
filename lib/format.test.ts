import { describe, expect, it } from "vitest";
import { formatChf, formatNumber, formatSigned } from "./format";

describe("formatNumber", () => {
  it("formatiert Tausender im Schweizer Format", () => {
    expect(formatNumber(1000)).toBe("1’000");
    expect(formatNumber(1234567)).toBe("1’234’567");
  });

  it("rundet auf ganze Jetons", () => {
    expect(formatNumber(12.6)).toBe("13");
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatChf", () => {
  it("zeigt immer zwei Nachkommastellen", () => {
    expect(formatChf(12.5)).toBe("12.50");
    expect(formatChf(5)).toBe("5.00");
    expect(formatChf(1000)).toBe("1’000.00");
  });
});

describe("formatSigned", () => {
  it("setzt Plus, echtes Minus oder ±", () => {
    expect(formatSigned(50)).toBe("+50");
    expect(formatSigned(-50)).toBe("−50");
    expect(formatSigned(0)).toBe("±0");
    expect(formatSigned(1500)).toBe("+1’500");
  });
});
