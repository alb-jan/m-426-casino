import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CasinoProvider } from "@/components/casino/CasinoProvider";
import * as bot from "@/lib/poker/bot";
import { rigDeck } from "@/lib/poker/testDeck";
import { PokerScreen } from "./PokerScreen";

const deckFactory = () => rigDeck(["As Ah", "8c 3h", "8d 3s", "7s 2d"], "Ac 9d 5s Jh 4c");

describe("Gegnermodell am Tisch", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("gibt den Bots das beobachtete Spielerprofil mit", () => {
    const spy = vi.spyOn(bot, "botDecision");
    render(
      <NotificationProvider><CasinoProvider initial={{ screen: "poker", chips: 1000, bought: 100, cashed: 0 }}>
        <PokerScreen deckFactory={deckFactory} rng={() => 0.5} />
      </CasinoProvider></NotificationProvider>,
    );
    act(() => vi.advanceTimersByTime(1000)); // Milla handelt
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][2]?.profile).toEqual({ actions: 0, bigBets: 0 });

    act(() => screen.getByRole("button", { name: "All-In" }).click());
    act(() => vi.advanceTimersByTime(1000)); // Vera handelt
    const last = spy.mock.calls.at(-1)!;
    expect(last[2]?.profile).toEqual({ actions: 1, bigBets: 1 });
  });
});
