/** Observer-Pattern: typisierter Event-Bus (Subject). */
export type Handler<P> = (payload: P) => void;

export interface EventBus<E extends Record<string, unknown>> {
  subscribe<K extends keyof E>(type: K, handler: Handler<E[K]>): () => void;
  emit<K extends keyof E>(type: K, payload: E[K]): void;
  clear(): void;
}

export function createEventBus<E extends Record<string, unknown>>(): EventBus<E> {
  const handlers = new Map<keyof E, Set<Handler<never>>>();

  return {
    subscribe(type, handler) {
      if (!handlers.has(type)) handlers.set(type, new Set());
      handlers.get(type)!.add(handler as Handler<never>);
      return () => {
        handlers.get(type)?.delete(handler as Handler<never>);
      };
    },
    emit(type, payload) {
      // Kopie, damit sich Abonnenten während des Aufrufs abmelden dürfen
      [...(handlers.get(type) ?? [])].forEach((h) => (h as Handler<typeof payload>)(payload));
    },
    clear() {
      handlers.clear();
    },
  };
}

export type ToastKind = "win" | "lose" | "info" | "warn";

export interface NotifyPayload {
  kind: ToastKind;
  title: string;
  msg: string;
}

/** Alle Ereignisse, die in der Casino-App veröffentlicht werden. */
export type GameEvents = {
  notify: NotifyPayload;
};

/** Globale Instanz – Spiele melden hier, die Toast-Komponente hört zu. */
export const gameEvents = createEventBus<GameEvents>();
