import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CasinoApp } from "./CasinoApp";

describe("CasinoApp", () => {
  it("blendet Header und Footer auf der Landingpage aus", () => {
    render(<CasinoApp />);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });

  it("zeigt Header und Footer auf den übrigen Bildschirmen", () => {
    render(<CasinoApp initial={{ screen: "lobby", chips: 100, bought: 10, cashed: 0 }} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "Casino Goldenes Ass · Prototyp für das Schulprojekt",
    );
  });
});
