import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CasinoApp } from "@/components/CasinoApp";

const start = () => render(<CasinoApp initial={{ screen: "exit", chips: 455, bought: 50, cashed: 45.5 }} />);
const h1 = () => screen.getByRole("heading", { level: 1 });

describe("ExitScreen", () => {
  it("zeigt Titel und die drei Kennzahlen", () => {
    start();
    expect(screen.getByText("Schritt 3 von 3 · Kasse")).toBeInTheDocument();
    expect(h1()).toHaveTextContent("Auszahlung");
    expect(screen.getByText("Danke fürs Spielen im Goldenen Ass.")).toBeInTheDocument();
    expect(screen.getByText("CHF 50.00")).toBeInTheDocument();
    expect(screen.getByText("CHF 45.50")).toBeInTheDocument();
    expect(screen.getByText("−CHF 4.50")).toBeInTheDocument();
  });

  it("startet eine neue Sitzung", () => {
    start();
    act(() => screen.getByRole("button", { name: "Neue Sitzung starten" }).click());
    expect(h1()).toHaveTextContent("Jetons kaufen");
    expect(screen.getByTestId("header-balance")).toHaveTextContent("0");
  });

  it("führt mit „Doch weiterspielen“ zurück in die Lobby", () => {
    start();
    act(() => screen.getByRole("button", { name: "Doch weiterspielen" }).click());
    expect(h1()).toHaveTextContent("Spielauswahl");
    expect(screen.getByTestId("header-balance")).toHaveTextContent("455");
  });
});
