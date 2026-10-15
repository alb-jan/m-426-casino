import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CasinoApp } from "./CasinoApp";

describe("CasinoApp", () => {
  it("blendet den Header auf der Landingpage aus", () => {
    render(<CasinoApp />);
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  });

  it("zeigt den Header auf den übrigen Bildschirmen", () => {
    render(<CasinoApp initial={{ screen: "lobby", chips: 100, bought: 10, cashed: 0 }} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it.each(["landing", "buy", "lobby", "exit"] as const)("zeigt keinen Footer (%s)", (s) => {
    render(<CasinoApp initial={{ screen: s, chips: 100, bought: 10, cashed: 0 }} />);
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});
