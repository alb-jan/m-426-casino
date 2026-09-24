import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const spinTo = vi.fn();
const dispose = vi.fn();
const createWheelScene = vi.fn();
let webgl = true;

vi.mock("./webgl", () => ({ isWebGLAvailable: () => webgl }));
vi.mock("./wheelScene", () => ({ createWheelScene: (...args: unknown[]) => createWheelScene(...args) }));

import { MODEL_URL, RouletteWheel3D } from "./RouletteWheel3D";

/** offene Promises (dynamischer Import, Szenenaufbau) abarbeiten */
const flush = () => act(async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
});

describe("RouletteWheel3D", () => {
  beforeEach(() => {
    webgl = true;
    spinTo.mockReset().mockResolvedValue(undefined);
    dispose.mockReset();
    createWheelScene.mockReset().mockResolvedValue({ spinTo, dispose });
  });
  afterEach(() => vi.useRealTimers());

  it("baut die three.js-Szene mit dem Blender-Modell auf", async () => {
    render(<RouletteWheel3D target={null} onSpinEnd={() => {}} />);
    await flush();
    expect(MODEL_URL).toBe("/models/roulette-wheel.glb");
    expect(createWheelScene).toHaveBeenCalledWith(screen.getByTestId("wheel-canvas"), MODEL_URL);
    expect(screen.queryByText("Kessel wird geladen …")).not.toBeInTheDocument();
  });

  it("dreht auf die Zielzahl und meldet das Ende der Animation", async () => {
    const onSpinEnd = vi.fn();
    const { rerender } = render(<RouletteWheel3D target={null} onSpinEnd={onSpinEnd} duration={5000} />);
    await flush();
    rerender(<RouletteWheel3D target={17} onSpinEnd={onSpinEnd} duration={5000} />);
    await flush();
    expect(spinTo).toHaveBeenCalledWith(17, 5000);
    expect(onSpinEnd).toHaveBeenCalledTimes(1);
  });

  it("gibt die Szene beim Verlassen frei", async () => {
    const { unmount } = render(<RouletteWheel3D target={null} onSpinEnd={() => {}} />);
    await flush();
    unmount();
    expect(dispose).toHaveBeenCalled();
  });

  it("zeigt ohne WebGL einen Ersatz-Kessel und spielt trotzdem weiter", async () => {
    webgl = false;
    vi.useFakeTimers();
    const onSpinEnd = vi.fn();
    const { rerender } = render(<RouletteWheel3D target={null} onSpinEnd={onSpinEnd} />);
    await flush();
    expect(screen.getByTestId("wheel-fallback")).toBeInTheDocument();
    expect(createWheelScene).not.toHaveBeenCalled();
    rerender(<RouletteWheel3D target={4} onSpinEnd={onSpinEnd} />);
    act(() => vi.advanceTimersByTime(2200));
    expect(onSpinEnd).toHaveBeenCalledTimes(1);
  });

  it("fällt auf den Ersatz-Kessel zurück, wenn das Modell nicht lädt", async () => {
    createWheelScene.mockRejectedValue(new Error("404"));
    render(<RouletteWheel3D target={null} onSpinEnd={() => {}} />);
    await flush();
    expect(screen.getByTestId("wheel-fallback")).toBeInTheDocument();
  });
});
