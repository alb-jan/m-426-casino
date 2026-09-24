import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CasinoApp } from "@/components/CasinoApp";

const start = (chips: number) =>
  render(<CasinoApp initial={{ screen: "lobby", chips, bought: chips / 10, cashed: 0 }} />);
const h1 = () => screen.getByRole("heading", { level: 1 });

describe("LobbyScreen", () => {
  it("zeigt Schritt, Titel und Guthaben mit Auszahlungswert", () => {
    start(1000);
    expect(screen.getByText("Schritt 2 von 3")).toBeInTheDocument();
    expect(h1()).toHaveTextContent("Spielauswahl");
    expect(screen.getByTestId("lobby-balance")).toHaveTextContent("1’000");
    expect(screen.getByText("≈ CHF 100.00 Auszahlungswert")).toBeInTheDocument();
  });

  it("zeigt beide Spiele", () => {
    start(1000);
    expect(screen.getByRole("heading", { name: "Poker" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Roulette" })).toBeInTheDocument();
    expect(screen.getByText("Texas Hold'em gegen drei Computergegner. Blinds 10 / 20 Jetons.")).toBeInTheDocument();
  });

  it("öffnet den Pokertisch", () => {
    start(1000);
    act(() => screen.getByRole("button", { name: /Platz nehmen/ }).click());
    expect(h1()).toHaveTextContent(/Poker/);
  });

  it("öffnet den Roulettetisch", () => {
    start(1000);
    act(() => screen.getByRole("button", { name: /Setzen →/ }).click());
    expect(h1()).toHaveTextContent(/Roulette/);
  });

  it("warnt bei zu wenig Jetons und bleibt in der Lobby", () => {
    start(15);
    act(() => screen.getByRole("button", { name: /Platz nehmen/ }).click());
    expect(screen.getByText("Zu wenig Jetons")).toBeInTheDocument();
    expect(screen.getByText("Für Poker brauchst du mindestens 20 Jetons (Big Blind).")).toBeInTheDocument();
    expect(h1()).toHaveTextContent("Spielauswahl");
  });

  it("führt über „Auszahlen & verlassen“ zur Kasse", () => {
    start(455);
    expect(screen.getByText("CHF 45.50")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Auszahlen & verlassen" }).click());
    expect(h1()).toHaveTextContent("Auszahlung");
  });
});
