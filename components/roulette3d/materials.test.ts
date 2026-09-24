import { describe, expect, it, vi } from "vitest";
import { applyMaterialOverrides, MATERIAL_OVERRIDES } from "./materials";

const fakeMaterial = (name: string) => ({ name, roughness: 0.5, color: { set: vi.fn() } });

describe("applyMaterialOverrides", () => {
  it("gibt den Holz-Materialien aus Blender eine Farbe (prozedurale Texturen fehlen im GLB)", () => {
    expect(Object.keys(MATERIAL_OVERRIDES)).toEqual(["Mahogany", "BallTrack"]);
    const wood = fakeMaterial("Mahogany");
    expect(applyMaterialOverrides(wood)).toBe(true);
    expect(wood.color.set).toHaveBeenCalledWith(MATERIAL_OVERRIDES.Mahogany.color);
    expect(wood.roughness).toBe(MATERIAL_OVERRIDES.Mahogany.roughness);
  });

  it("lässt alle anderen Materialien unverändert", () => {
    const brass = fakeMaterial("Brass");
    expect(applyMaterialOverrides(brass)).toBe(false);
    expect(brass.color.set).not.toHaveBeenCalled();
    expect(brass.roughness).toBe(0.5);
  });
});
