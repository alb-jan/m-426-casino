import { describe, expect, it } from "vitest";
import { addToast, createToast, MAX_TOASTS, TOAST_SKINS } from "./notifications";

describe("TOAST_SKINS", () => {
  it("definiert Farben und Icons wie im Prototyp", () => {
    expect(TOAST_SKINS.win).toMatchObject({ color: "#7FD6A8", icon: "✓" });
    expect(TOAST_SKINS.lose).toMatchObject({ color: "#F4B9B3", icon: "✕" });
    expect(TOAST_SKINS.info).toMatchObject({ color: "#E8B94A", icon: "i" });
    expect(TOAST_SKINS.warn).toMatchObject({ color: "#F0C75C", icon: "!" });
  });
});

describe("addToast", () => {
  it("fügt neue Toasts zuoberst ein", () => {
    const a = createToast(1, "info", "A", "a");
    const b = createToast(2, "win", "B", "b");
    expect(addToast(addToast([], a), b).map((t) => t.id)).toEqual([2, 1]);
  });

  it("zeigt höchstens vier Toasts", () => {
    let list = [] as ReturnType<typeof createToast>[];
    for (let i = 1; i <= 6; i++) list = addToast(list, createToast(i, "info", "T", "m"));
    expect(MAX_TOASTS).toBe(4);
    expect(list.map((t) => t.id)).toEqual([6, 5, 4, 3]);
  });

  it("verändert die ursprüngliche Liste nicht", () => {
    const list = [createToast(1, "info", "A", "a")];
    addToast(list, createToast(2, "info", "B", "b"));
    expect(list).toHaveLength(1);
  });
});
