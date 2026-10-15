import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CasinoProvider } from "@/components/casino/CasinoProvider";
import { Header } from "@/components/layout/Header";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { RouletteScreen } from "./RouletteScreen";

/** Zufall so wählen, dass spinNumber() die gewünschte Zahl liefert. */
const rngFor = (n: number) => () => (n + 0.5) / 37;

function renderTable(chips = 1000, rng = rngFor(17)) {
  return render(
    <NotificationProvider>
      <CasinoProvider initial={{ screen: "roulette", chips, bought: chips / 10, cashed: 0 }}>
        <Header />
        <RouletteScreen rng={rng} spinDuration={2200} />
      </CasinoProvider>
    </NotificationProvider>,
  );
}

const balance = () => screen.getByTestId("header-balance");
const click = (name: string) => act(() => screen.getByRole("button", { name }).click());

describe("RouletteScreen", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("zeigt Titel, Tableau und Hinweis", () => {
    renderTable();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/^Roulette$/);
    expect(screen.getByText("Setze Jetons auf das Tableau und drehe den Kessel.")).toBeInTheDocument();
    for (let n = 0; n <= 36; n++) expect(screen.getByRole("button", { name: `Zahl ${n}` })).toBeInTheDocument();
    for (const l of ["1 – 18", "Gerade", "Rot", "Schwarz", "Ungerade", "19 – 36", "1. Dutzend (1–12)"]) {
      expect(screen.getByRole("button", { name: l })).toBeInTheDocument();
    }
    expect(screen.getByText("35 : 1")).toBeInTheDocument();
  });

  it("setzt den gewählten Jeton-Wert und zieht ihn vom Guthaben ab", () => {
    renderTable();
    click("Zahl 17");
    click("Zahl 17");
    expect(balance()).toHaveTextContent("980");
    expect(screen.getByTestId("total-bet")).toHaveTextContent("20");
    expect(within(screen.getByRole("button", { name: "Zahl 17" })).getByText("20")).toBeInTheDocument();
    click("Jeton 50");
    click("Rot");
    expect(balance()).toHaveTextContent("930");
    expect(screen.getByTestId("total-bet")).toHaveTextContent("70");
  });

  it("warnt bei zu wenig Guthaben", () => {
    renderTable(20);
    click("Jeton 50");
    click("Zahl 5");
    expect(screen.getByText("Nicht genug Jetons")).toBeInTheDocument();
    expect(balance()).toHaveTextContent("20");
  });

  it("nimmt alle Einsätze zurück", () => {
    renderTable();
    click("Zahl 3");
    click("Gerade");
    click("Einsätze löschen");
    expect(balance()).toHaveTextContent("1’000");
    expect(screen.getByText("Einsätze zurückgenommen")).toBeInTheDocument();
    expect(screen.getByText("20 Jetons sind zurück im Guthaben.")).toBeInTheDocument();
  });

  it("warnt beim Drehen ohne Einsatz", () => {
    renderTable();
    click("Drehen");
    expect(screen.getByText("Kein Einsatz")).toBeInTheDocument();
  });

  it("dreht den Kessel, zahlt aus und führt den Verlauf", () => {
    renderTable();
    click("Zahl 17");
    click("Rot");
    click("Drehen");
    expect(screen.getByText("Kessel dreht")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kessel dreht …" })).toBeInTheDocument();
    // während der Drehung gesperrt
    click("Zahl 1");
    expect(balance()).toHaveTextContent("980");

    act(() => vi.advanceTimersByTime(2200));
    expect(screen.getByTestId("spin-number")).toHaveTextContent("17");
    expect(screen.getByTestId("spin-color")).toHaveTextContent("Schwarz");
    expect(screen.getByTestId("spin-net")).toHaveTextContent("+340 Jetons");
    expect(balance()).toHaveTextContent("1’340");
    expect(screen.getByText("Gewonnen!")).toBeInTheDocument();
    expect(within(screen.getByTestId("history")).getByText("17")).toBeInTheDocument();
    expect(screen.getByTestId("total-bet")).toHaveTextContent("0");
  });

  it("meldet einen Verlust", () => {
    renderTable(1000, rngFor(0));
    click("Rot");
    click("Drehen");
    act(() => vi.advanceTimersByTime(2200));
    expect(screen.getByTestId("spin-color")).toHaveTextContent("Grün · Zéro");
    expect(screen.getByTestId("spin-net")).toHaveTextContent("−10 Jetons");
    expect(screen.getByText("Verloren")).toBeInTheDocument();
  });
});
