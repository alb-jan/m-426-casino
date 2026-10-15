import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CasinoApp } from "@/components/CasinoApp";
import { FLOAT_CHIPS, LANDING_FEATURES } from "./landingContent";

describe("LandingScreen", () => {
  it("zeigt Titel und Untertitel", () => {
    render(<CasinoApp />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Casino Goldenes Ass");
    expect(screen.getByText("Poker & Roulette")).toBeInTheDocument();
    expect(screen.queryByText("Est. 2026 · Schulprojekt")).not.toBeInTheDocument();
  });

  it("zeigt drei Feature-Karten", () => {
    render(<CasinoApp />);
    expect(LANDING_FEATURES).toHaveLength(3);
    for (const f of LANDING_FEATURES) expect(screen.getByText(f.title)).toBeInTheDocument();
    expect(screen.getByText("Roulette")).toBeInTheDocument();
    expect(screen.queryByText(/europäische/i)).not.toBeInTheDocument();
  });

  it("zeigt vier schwebende Jetons", () => {
    render(<CasinoApp />);
    expect(FLOAT_CHIPS.map((c) => c.val)).toEqual([20, 50, 500, 10]);
    expect(screen.getAllByTestId(/^float-chip-/)).toHaveLength(4);
  });

  it("hat keine Fusszeile", () => {
    render(<CasinoApp />);
    expect(screen.queryByText("Spielgeld in CHF")).not.toBeInTheDocument();
  });

  it("führt mit „Casino betreten“ zum Jetons-Kauf", () => {
    render(<CasinoApp />);
    act(() => screen.getByRole("button", { name: "Casino betreten" }).click());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Jetons kaufen");
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
