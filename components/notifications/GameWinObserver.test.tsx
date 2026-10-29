import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEventBus, type GameEvents } from "@/lib/events";
import { CasinoProvider } from "@/components/casino/CasinoProvider";
import { RouletteScreen } from "@/components/screens/roulette/RouletteScreen";
import { NotificationProvider, useNotify, TOAST_DURATION } from "./NotificationProvider";

const wheel = vi.hoisted(() => ({ finish: () => {} }));
vi.mock("@/components/roulette3d/RouletteWheel3D", () => ({
  RouletteWheel3D: ({ onSpinEnd }: { onSpinEnd: () => void }) => {
    wheel.finish = onSpinEnd;
    return <div />;
  },
}));
const click = (name: string) => act(() => screen.getByRole("button", { name }).click());
const Expiring = () => {
  const notify = useNotify();
  return <button onClick={() => notify("info", "Kurz", "Ablauf")}>Melden</button>;
};
describe("US-16 Observer-Abnahme am tatsächlichen Spiel", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it("veröffentlicht einen real berechneten Gewinn genau einmal und zeigt genau einen Toast", () => {
    const bus = createEventBus<GameEvents>();
    const emit = vi.spyOn(bus, "emit");
    render(
      <NotificationProvider bus={bus}>
        <CasinoProvider initial={{ screen: "roulette", chips: 250, bought: 25, cashed: 0 }}>
          <RouletteScreen rng={() => 17.5 / 37} />
        </CasinoProvider>
      </NotificationProvider>,
    );
    click("Schwarz"); click("Zahl 17"); click("Drehen");
    const complete = wheel.finish;
    act(() => { complete(); complete(); });
    expect(emit).toHaveBeenCalledExactlyOnceWith("notify", {
      kind: "win", title: "Gewonnen!", msg: "17 Schwarz – Auszahlung 380 Jetons (+360).",
    });
    expect(screen.getAllByText("Gewonnen!")).toHaveLength(1);
  });
  it("entfernt abgelaufene Timer aus der Verwaltung vor dem Unmount", () => {
    const view = render(<NotificationProvider><Expiring /></NotificationProvider>);
    click("Melden");
    act(() => vi.advanceTimersByTime(TOAST_DURATION));
    expect(screen.queryByText("Kurz")).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    const clear = vi.spyOn(globalThis, "clearTimeout");
    view.unmount();
    expect(clear).not.toHaveBeenCalled();
    clear.mockRestore();
  });
});
