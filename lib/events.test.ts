import { describe, expect, it, vi } from "vitest";
import { createEventBus } from "./events";

type TestEvents = { ping: number; pong: string };

describe("createEventBus (Observer)", () => {
  it("benachrichtigt alle Abonnenten eines Ereignistyps", () => {
    const bus = createEventBus<TestEvents>();
    const a = vi.fn();
    const b = vi.fn();
    bus.subscribe("ping", a);
    bus.subscribe("ping", b);
    bus.emit("ping", 42);
    expect(a).toHaveBeenCalledWith(42);
    expect(b).toHaveBeenCalledWith(42);
  });

  it("liefert nur Ereignisse des abonnierten Typs", () => {
    const bus = createEventBus<TestEvents>();
    const pong = vi.fn();
    bus.subscribe("pong", pong);
    bus.emit("ping", 1);
    expect(pong).not.toHaveBeenCalled();
  });

  it("stoppt nach unsubscribe", () => {
    const bus = createEventBus<TestEvents>();
    const fn = vi.fn();
    const off = bus.subscribe("ping", fn);
    off();
    bus.emit("ping", 1);
    expect(fn).not.toHaveBeenCalled();
  });

  it("clear entfernt alle Abonnenten", () => {
    const bus = createEventBus<TestEvents>();
    const fn = vi.fn();
    bus.subscribe("ping", fn);
    bus.clear();
    bus.emit("ping", 1);
    expect(fn).not.toHaveBeenCalled();
  });
});
