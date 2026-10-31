import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouletteWheel3D } from "./RouletteWheel3D";
describe("US-09 austauschbare Kesselszene",()=>{
 it("verwendet und entsorgt die injizierte Szene und beendet eine Drehung",async()=>{
  const scene={spinTo:vi.fn().mockResolvedValue(undefined),dispose:vi.fn()};
  const factory=vi.fn().mockResolvedValue(scene);const end=vi.fn();
  const view=render(<RouletteWheel3D target={17} onSpinEnd={end} sceneFactory={factory} webglAvailable={()=>true}/>);
  await act(async()=>{await Promise.resolve();});
  expect(factory).toHaveBeenCalledTimes(1);expect(scene.spinTo).toHaveBeenCalledWith(17,5200);expect(end).toHaveBeenCalledTimes(1);
  view.unmount();expect(scene.dispose).toHaveBeenCalledTimes(1);
 });
});
