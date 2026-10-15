import type { ToastKind } from "./events";

export interface ToastSkin {
  color: string;
  border: string;
  tint: string;
  icon: string;
}

export const TOAST_SKINS: Record<ToastKind, ToastSkin> = {
  win: { color: "#7FD6A8", border: "rgba(79,191,139,.5)", tint: "rgba(79,191,139,.16)", icon: "✓" },
  lose: { color: "#F4B9B3", border: "rgba(226,87,76,.5)", tint: "rgba(226,87,76,.16)", icon: "✕" },
  info: { color: "#E8B94A", border: "rgba(232,185,74,.45)", tint: "rgba(232,185,74,.16)", icon: "i" },
  warn: { color: "#F0C75C", border: "rgba(240,199,92,.5)", tint: "rgba(240,199,92,.16)", icon: "!" },
};

export interface Toast extends ToastSkin {
  id: number;
  kind: ToastKind;
  title: string;
  msg: string;
}

export const MAX_TOASTS = 4;

export function createToast(id: number, kind: ToastKind, title: string, msg: string): Toast {
  return { id, kind, title, msg, ...TOAST_SKINS[kind] };
}

/** Neuer Toast zuoberst, maximal MAX_TOASTS sichtbar. Liefert eine neue Liste. */
export function addToast(list: readonly Toast[], toast: Toast): Toast[] {
  return [toast, ...list].slice(0, MAX_TOASTS);
}
