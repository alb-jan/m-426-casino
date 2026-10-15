import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("zeigt den Wert in der gewünschten Grösse", () => {
    render(<Chip value={500} size={30} />);
    const chip = screen.getByTestId("chip-500");
    expect(chip).toHaveStyle({ width: "30px", height: "30px" });
    expect(chip).toHaveTextContent("500");
  });
});
