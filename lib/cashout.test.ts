import { describe, expect, it } from "vitest";
import { exitStats } from "./cashout";

describe("exitStats", () => {
  it("zeigt Verlust rot mit echtem Minus", () => {
    expect(exitStats(50, 45.5)).toEqual([
      { label: "Eingezahlt", value: "CHF 50.00", color: "#F2EFE6" },
      { label: "Ausgezahlt", value: "CHF 45.50", color: "#E8B94A" },
      { label: "Bilanz", value: "−CHF 4.50", color: "#F4B9B3" },
    ]);
  });

  it("zeigt Gewinn grün mit Plus", () => {
    const bilanz = exitStats(50, 62)[2];
    expect(bilanz).toEqual({ label: "Bilanz", value: "+CHF 12.00", color: "#7FD6A8" });
  });

  it("wertet eine ausgeglichene Bilanz als +CHF 0.00", () => {
    expect(exitStats(20, 20)[2].value).toBe("+CHF 0.00");
  });

  it("formatiert grosse Beträge mit Tausendertrennzeichen", () => {
    expect(exitStats(1000, 0)[0].value).toBe("CHF 1’000.00");
  });
});
