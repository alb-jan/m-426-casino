import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CasinoApp } from "@/components/CasinoApp";

const start = () => render(<CasinoApp initial={{ screen: "buy", chips: 0, bought: 0, cashed: 0 }} />);
const input = () => screen.getByPlaceholderText("z. B. 25.00") as HTMLInputElement;
const buyBtn = () => screen.getByRole("button", { name: "Jetons kaufen und starten" });

describe("BuyScreen", () => {
  it("zeigt Schritt, Titel, Kurs und Limits", () => {
    start();
    expect(screen.getByText("Schritt 1 von 3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Jetons kaufen");
    expect(screen.getByText("CHF 1.00 = 10 Jetons")).toBeInTheDocument();
    expect(screen.getByText("Mindestbetrag CHF 5 · Höchstbetrag CHF 500 · nur Spielgeld")).toBeInTheDocument();
  });

  it("aktualisiert die Vorschau bei der Eingabe", () => {
    start();
    fireEvent.change(input(), { target: { value: "25" } });
    expect(screen.getByTestId("buy-preview")).toHaveTextContent("250");
  });

  it("übernimmt Schnellwahl-Beträge", () => {
    start();
    act(() => screen.getByRole("button", { name: "50 CHF" }).click());
    expect(input().value).toBe("50");
    expect(screen.getByTestId("buy-preview")).toHaveTextContent("500");
  });

  it("zeigt Fehlermeldungen und entfernt sie beim Tippen", () => {
    start();
    act(() => buyBtn().click());
    expect(screen.getByText("Bitte gib einen Betrag ein.")).toBeInTheDocument();
    fireEvent.change(input(), { target: { value: "2" } });
    expect(screen.queryByText("Bitte gib einen Betrag ein.")).not.toBeInTheDocument();
    act(() => buyBtn().click());
    expect(screen.getByText("Der Mindestbetrag beträgt CHF 5 (= 50 Jetons).")).toBeInTheDocument();
  });

  it("kauft Jetons, zeigt einen Toast und wechselt zur Lobby", () => {
    start();
    fireEvent.change(input(), { target: { value: "25" } });
    act(() => buyBtn().click());
    expect(screen.getByTestId("header-balance")).toHaveTextContent("250");
    expect(screen.getByText("250 Jetons gekauft")).toBeInTheDocument();
    expect(screen.getByText("Für CHF 25.00 – viel Erfolg am Tisch!")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Spielauswahl");
  });

  it("löst den Kauf mit Enter aus", () => {
    start();
    fireEvent.change(input(), { target: { value: "10" } });
    fireEvent.keyDown(input(), { key: "Enter" });
    expect(screen.getByTestId("header-balance")).toHaveTextContent("100");
  });

  it("zeigt die Jeton-Legende mit Frankengegenwert", () => {
    start();
    expect(screen.getByText("Jeton-Werte im Haus")).toBeInTheDocument();
    expect(screen.getByText("Violett")).toBeInTheDocument();
    expect(screen.getByText("CHF 50.00 Gegenwert")).toBeInTheDocument();
    expect(screen.getByText("CHF 1.00 Gegenwert")).toBeInTheDocument();
  });
});
