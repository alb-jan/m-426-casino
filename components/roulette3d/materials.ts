/**
 * Die Holz-Materialien des Blender-Modells nutzen prozedurale Texturen, die der glTF-Export
 * nicht übernimmt (sie kämen weiss an). Hier bekommen sie eine passende Grundfarbe.
 */
export const MATERIAL_OVERRIDES = {
  Mahogany: { color: "#4A2412", roughness: 0.38 },
  BallTrack: { color: "#6E3F1C", roughness: 0.3 },
} as const;

interface OverridableMaterial {
  name: string;
  roughness?: number;
  color?: { set: (value: string) => unknown };
}

/** Färbt ein Material ein, falls es in MATERIAL_OVERRIDES steht. Liefert true bei Änderung. */
export function applyMaterialOverrides(material: OverridableMaterial): boolean {
  const o = MATERIAL_OVERRIDES[material.name as keyof typeof MATERIAL_OVERRIDES];
  if (!o || !material.color) return false;
  material.color.set(o.color);
  material.roughness = o.roughness;
  return true;
}
