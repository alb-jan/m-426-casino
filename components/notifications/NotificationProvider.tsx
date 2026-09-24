"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gameEvents, type ToastKind } from "@/lib/events";
import { addToast, createToast, type Toast } from "@/lib/notifications";
import { ToastStack } from "./ToastStack";

export const TOAST_DURATION = 4600;

type Notify = (kind: ToastKind, title: string, msg: string) => void;

const NotifyContext = createContext<Notify | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const notify = useCallback<Notify>((kind, title, msg) => {
    const id = nextId.current++;
    setToasts((list) => addToast(list, createToast(id, kind, title, msg)));
    timers.current.push(
      setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), TOAST_DURATION),
    );
  }, []);

  // Observer: auf Spiel-Events hören
  useEffect(() => {
    const off = gameEvents.subscribe("notify", ({ kind, title, msg }) => notify(kind, title, msg));
    const pending = timers.current;
    return () => {
      off();
      pending.forEach(clearTimeout);
    };
  }, [notify]);

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <ToastStack toasts={toasts} />
    </NotifyContext.Provider>
  );
}

/** Liefert notify(); ausserhalb des Providers wird direkt über den Event-Bus gemeldet. */
export function useNotify(): Notify {
  const ctx = useContext(NotifyContext);
  return ctx ?? ((kind, title, msg) => gameEvents.emit("notify", { kind, title, msg }));
}
