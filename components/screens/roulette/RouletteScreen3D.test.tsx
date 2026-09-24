import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CasinoProvider } from "@/components/casino/CasinoProvider";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";

vi.mock("@/components/roulette3d/webgl", () => ({ isWebGLAvailable: () => false }));

import { RouletteScreen } from "./RouletteScreen";

describe("RouletteScreen mit 3D-Kessel", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("zeigt die Kessel-Bühne und wertet erst am Ende der Kessel-Animation aus", async () => {
    render(
      <NotificationProvider>
        <CasinoProvider initial={{ screen: "roulette", chips: 1000, bought: 100, cashed: 0 }}>
          <RouletteScreen rng={() => 7.5 / 37} />
        </CasinoProvider>
      </NotificationProvider>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("wheel-stage")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "Zahl 7" }).click());
    act(() => screen.getByRole("button", { name: "Drehen" }).click());
    act(() => vi.advanceTimersByTime(2100));
    expect(screen.queryByTestId("spin-number")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByTestId("spin-number")).toHaveTextContent("7");
  });
});
