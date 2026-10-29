import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gameEvents } from "@/lib/events";
import { NotificationProvider, TOAST_DURATION, useNotify } from "./NotificationProvider";

function Trigger() {
  const notify = useNotify();
  return <button onClick={() => notify("win", "Gewonnen!", "Du gewinnst 50 Jetons.")}>los</button>;
}

describe("NotificationProvider", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("zeigt einen Toast über useNotify an", () => {
    render(
      <NotificationProvider bus={gameEvents}>
        <Trigger />
      </NotificationProvider>,
    );
    act(() => screen.getByText("los").click());
    expect(screen.getByText("Gewonnen!")).toBeInTheDocument();
    expect(screen.getByText("Du gewinnst 50 Jetons.")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("reagiert auf Spiel-Events aus dem Event-Bus", () => {
    render(<NotificationProvider bus={gameEvents}>{null}</NotificationProvider>);
    act(() => gameEvents.emit("notify", { kind: "warn", title: "Zu wenig Jetons", msg: "Kaufe nach." }));
    expect(screen.getByText("Zu wenig Jetons")).toBeInTheDocument();
  });

  it("entfernt den Toast nach 4.6 Sekunden", () => {
    render(<NotificationProvider bus={gameEvents}>{null}</NotificationProvider>);
    act(() => gameEvents.emit("notify", { kind: "info", title: "Hallo", msg: "Welt" }));
    expect(TOAST_DURATION).toBe(4600);
    act(() => vi.advanceTimersByTime(4599));
    expect(screen.getByText("Hallo")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2));
    expect(screen.queryByText("Hallo")).not.toBeInTheDocument();
  });

  it("meldet sich beim Unmount vom Event-Bus ab", () => {
    const { unmount } = render(<NotificationProvider bus={gameEvents}>{null}</NotificationProvider>);
    unmount();
    expect(() => gameEvents.emit("notify", { kind: "info", title: "x", msg: "y" })).not.toThrow();
  });
});
