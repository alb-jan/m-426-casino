"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createEventBus, type EventBus, type GameEvents, type ToastKind } from "@/lib/events";
import { addToast, createToast, type Toast } from "@/lib/notifications";
import { ToastStack } from "./ToastStack";

export const TOAST_DURATION = 4600;
type Notify = (kind: ToastKind, title: string, msg: string) => void;
const EventContext = createContext<EventBus<GameEvents> | null>(null);

export function NotificationProvider({ children, bus: injectedBus }: { children: ReactNode; bus?: EventBus<GameEvents> }) {
  const [ownedBus] = useState(() => createEventBus<GameEvents>());
  const bus = injectedBus ?? ownedBus;
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const receive = useCallback<Notify>((kind, title, msg) => {
    const id = nextId.current++;
    setToasts((list) => addToast(list, createToast(id, kind, title, msg)));
    const pending = timers.current;
    const timer = setTimeout(() => {
      pending.delete(timer);
      setToasts((list) => list.filter((toast) => toast.id !== id));
    }, TOAST_DURATION);
    pending.add(timer);
  }, []);

  useEffect(() => {
    const off = bus.subscribe("notify", ({ kind, title, msg }) => receive(kind, title, msg));
    const pending = timers.current;
    return () => {
      off();
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, [bus, receive]);

  return <EventContext.Provider value={bus}>{children}<ToastStack toasts={toasts} /></EventContext.Provider>;
}

/** Publisher: Jede Meldung durchlaeuft dasselbe Observer-Abonnement. */
export function useNotify(): Notify {
  const bus = useContext(EventContext);
  if (!bus) throw new Error("useNotify muss innerhalb von <NotificationProvider> verwendet werden");
  return useCallback<Notify>((kind, title, msg) => bus.emit("notify", { kind, title, msg }), [bus]);
}
