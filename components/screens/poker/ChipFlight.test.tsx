import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { act, render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CasinoProvider } from "@/components/casino/CasinoProvider";
import { PokerScreen } from "./PokerScreen";

/** left-Positionen aller fliegenden Jetons */
const positions = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('[aria-hidden="true"] > span')].map((s) => s.style.left);

describe("Jeton-Flug", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("lässt die Blinds auch im React-StrictMode in den Pot fliegen", () => {
    const { container } = render(
      <StrictMode>
        <NotificationProvider><CasinoProvider initial={{ screen: "poker", chips: 1000, bought: 100, cashed: 0 }}>
          <PokerScreen rng={() => 0.5} />
        </CasinoProvider></NotificationProvider>
      </StrictMode>,
    );
    // Small Blind (Vera, links) und Big Blind (Ruben, Mitte) starten an ihren Plätzen
    expect(positions(container)).toEqual(["17%", "50%"]);
    act(() => vi.advanceTimersByTime(300));
    // … und liegen danach im Pot (Tischmitte)
    expect(positions(container)).toEqual(["50%", "50%"]);
    expect(
      [...container.querySelectorAll<HTMLElement>('[aria-hidden="true"] > span')].map((s) => s.style.top),
    ).toEqual(["47%", "47%"]);
  });
});
