import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CasinoProvider, useCasino } from "@/components/casino/CasinoProvider";
import { Header } from "@/components/layout/Header";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { rigDeck } from "@/lib/poker/testDeck";
import { PokerScreen } from "./PokerScreen";

// Milla (erste am Zug) hat 7-2 und passt ohne Zufallsrauschen; die anderen Bots haben schwache Hände.
const deckFactory = () => rigDeck(["As Ah", "8c 3h", "8d 3s", "7s 2d"], "Ac 9d 5s Jh 4c");
const rng = () => 0.5;

function ScreenProbe() {
  const { state } = useCasino();
  return <span data-testid="screen">{state.screen}</span>;
}

function renderTable(chips = 1000) {
  return render(
    <NotificationProvider>
      <CasinoProvider initial={{ screen: "poker", chips, bought: chips / 10, cashed: 0 }}>
        <Header />
        <ScreenProbe />
        <PokerScreen deckFactory={deckFactory} rng={rng} />
      </CasinoProvider>
    </NotificationProvider>,
  );
}

/** Timer schrittweise vorspulen, damit React zwischen den Bot-Zügen neue Timer planen kann. */
function run(ms: number) {
  for (let t = 0; t < ms; t += 500) act(() => vi.advanceTimersByTime(500));
}

const myTurn = () => {
  run(1000);
  expect(screen.getByRole("button", { name: "Passen" })).toBeInTheDocument();
};

describe("PokerScreen", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("zeigt Tisch, Spieler, Pot und Runde", () => {
    renderTable();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Poker · Texas Hold'em");
    for (const n of ["Vera", "Ruben", "Milla", "Du"]) expect(screen.getAllByText(n).length).toBeGreaterThan(0);
    expect(screen.getByTestId("pot")).toHaveTextContent("30");
    expect(screen.getByTestId("street")).toHaveTextContent("Pre-Flop");
    expect(screen.getByText("Blinds 10 / 20 Jetons")).toBeInTheDocument();
  });

  it("zeigt die eigenen Karten offen und die der Bots verdeckt", () => {
    renderTable();
    const mine = within(screen.getByTestId("my-cards")).getAllByTestId("card");
    expect(mine).toHaveLength(2);
    mine.forEach((c) => expect(c).toHaveAttribute("data-hidden", "false"));
    const vera = within(screen.getByTestId("seat-1")).getAllByTestId("card");
    vera.forEach((c) => expect(c).toHaveAttribute("data-hidden", "true"));
  });

  it("lässt die Bots automatisch handeln und zeigt dann die Aktionsleiste", () => {
    renderTable();
    expect(screen.getByText("Die Computergegner entscheiden …")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Passen" })).not.toBeInTheDocument();
    myTurn();
    expect(within(screen.getByTestId("seat-3")).getByText("Gepasst")).toBeInTheDocument();
    expect(screen.getByTestId("turn-label")).toHaveTextContent("Du");
  });

  it("verstellt den Erhöhungsbetrag mit + und −", () => {
    renderTable();
    myTurn();
    expect(screen.getByRole("button", { name: "Mitgehen (20)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Erhöhen auf 40" })).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "+" }).click());
    expect(screen.getByRole("button", { name: "Erhöhen auf 60" })).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "−" }).click());
    act(() => screen.getByRole("button", { name: "−" }).click());
    expect(screen.getByRole("button", { name: "Erhöhen auf 40" })).toBeInTheDocument();
  });

  it("synchronisiert das Guthaben im Header mit dem eigenen Stack", () => {
    renderTable();
    myTurn();
    act(() => screen.getByRole("button", { name: "Mitgehen (20)" }).click());
    expect(screen.getByTestId("header-balance")).toHaveTextContent("980");
  });

  it("zeigt nach dem Passen das Rundenergebnis und einen Toast", () => {
    renderTable();
    myTurn();
    act(() => screen.getByRole("button", { name: "Passen" }).click());
    // nur so lange vorspulen, bis das Ergebnis da ist – sonst ist der Toast (4.6 s) schon wieder weg
    for (let i = 0; i < 30 && !screen.queryByText("Rundenergebnis"); i++) run(500);
    expect(screen.getByText("Rundenergebnis")).toBeInTheDocument();
    expect(screen.getByTestId("result-title")).toHaveTextContent("Runde beendet");
    expect(screen.getAllByText(/gewinnt den Pot/).length).toBeGreaterThan(0);
    // Beim Showdown werden die Bot-Karten aufgedeckt
    within(screen.getByTestId("seat-1"))
      .getAllByTestId("card")
      .forEach((c) => expect(c).toHaveAttribute("data-hidden", "false"));
  });

  it("gewinnt mit dem Drilling und startet die nächste Runde mit neuem Dealer", () => {
    renderTable();
    myTurn();
    act(() => screen.getByRole("button", { name: "Mitgehen (20)" }).click());
    for (let i = 0; i < 12 && !screen.queryByText("Rundenergebnis"); i++) {
      run(1000);
      const check = screen.queryByRole("button", { name: /Schieben|Mitgehen/ });
      if (check) act(() => check.click());
    }
    expect(screen.getByTestId("result-title")).toHaveTextContent("Gewonnen!");
    expect(screen.getByText("Deine Hand: Drilling")).toBeInTheDocument();
    expect(within(screen.getByTestId("seat-0")).getByText("D")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Nächste Runde" }).click());
    expect(screen.queryByText("Rundenergebnis")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("seat-1")).getByText("D")).toBeInTheDocument();
  });

  it("führt aus dem Overlay zurück zur Spielauswahl", () => {
    renderTable();
    myTurn();
    act(() => screen.getByRole("button", { name: "Passen" }).click());
    run(15000);
    act(() => screen.getByRole("button", { name: "Zurück zur Spielauswahl" }).click());
    expect(screen.getByTestId("screen")).toHaveTextContent("lobby");
  });

  it("setzt mit All-In den ganzen Stack", () => {
    renderTable();
    myTurn();
    act(() => screen.getByRole("button", { name: "All-In" }).click());
    expect(screen.getByTestId("header-balance")).toHaveTextContent("0");
  });
});
