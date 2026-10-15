import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CasinoProvider, useCasino } from "@/components/casino/CasinoProvider";
import { Header } from "./Header";

function Probe() {
  const { state, navigate, setChips } = useCasino();
  return (
    <>
      <span data-testid="screen">{state.screen}</span>
      <button onClick={() => navigate("poker")}>poker</button>
      <button onClick={() => setChips(1000)}>chips</button>
    </>
  );
}

function setup() {
  render(
    <CasinoProvider initial={{ screen: "lobby", chips: 0, bought: 0, cashed: 0 }}>
      <Header />
      <Probe />
    </CasinoProvider>,
  );
}

describe("Header", () => {
  it("zeigt Logo und formatiertes Guthaben", () => {
    setup();
    expect(screen.getByText("Casino Goldenes Ass")).toBeInTheDocument();
    act(() => screen.getByText("chips").click());
    expect(screen.getByTestId("header-balance")).toHaveTextContent("1’000");
  });

  it("zeigt die Zurück-Schaltfläche nur im Spiel", () => {
    setup();
    expect(screen.queryByText("← Zurück zur Spielauswahl")).not.toBeInTheDocument();
    act(() => screen.getByText("poker").click());
    const back = screen.getByText("← Zurück zur Spielauswahl");
    act(() => back.click());
    expect(screen.getByTestId("screen")).toHaveTextContent("lobby");
  });
});
