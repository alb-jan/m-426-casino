# Feature: Benachrichtigungen (`feature/notifications`)

**User Story:** US-02 · **Sprint:** 1 · **Story Points:** 3 · **Basis:** `feature/project-setup`

## 1. Planung

### Ziel
Eine wiederverwendbare Benachrichtigungskomponente (Toasts oben rechts), die über das
**Observer-Pattern** angesteuert wird. Spiele kennen die Toast-Komponente nicht, sie
melden nur Ereignisse über einen Event-Bus („Spiel-Events lösen die Benachrichtigungskomponente aus“ – Footer im Design).

### Umzusetzende Funktionen

| Funktion / Datei | Inhalt | Aufbau |
|---|---|---|
| `lib/events.ts` → `createEventBus<T>()` | Typisierter Observer (Subject) | `subscribe(type, handler)` liefert `unsubscribe`, `emit(type, payload)`, `clear()`; intern `Map<type, Set<handler>>` |
| `lib/events.ts` → `gameEvents` | Globale Instanz für die App | Ereignistyp `notify` mit `{ kind, title, msg }` |
| `lib/notifications.ts` → `TOAST_SKINS` | Farben/Icons je Art | `win` ✓ grün, `lose` ✕ rot, `info` i gold, `warn` ! gelb (Werte aus dem Prototyp) |
| `lib/notifications.ts` → `addToast(list, toast)` | Neuer Toast oben, maximal 4 sichtbar | reine Funktion (unveränderlich) |
| `components/notifications/NotificationProvider.tsx` | React-Context, hält die Toasts, abonniert `gameEvents` | `useNotify()` Hook; jeder Toast verschwindet nach 4,6 s |
| `components/notifications/ToastStack.tsx` | Darstellung | fixiert oben rechts (top 88px, right 28px, Breite 340px), Animation `toastIn` |

### Akzeptanzkriterien
- Abonnenten erhalten nur Ereignisse ihres Typs; nach `unsubscribe` keine mehr.
- Ein neuer Toast erscheint zuoberst; es sind höchstens 4 Toasts gleichzeitig sichtbar.
- Ein Toast verschwindet nach 4600 ms automatisch.
- Ein `gameEvents.emit('notify', …)` irgendwo in der App zeigt einen Toast an.
- Titel, Text und Icon werden gemäss Art (`win/lose/info/warn`) eingefärbt.

## 2. Tests (Red)

| Testdatei | Getestete Einheit | Fälle |
|---|---|---|
| `lib/events.test.ts` | `createEventBus` | mehrere Abonnenten, Typ-Filter, `unsubscribe`, `clear` |
| `lib/notifications.test.ts` | `TOAST_SKINS`, `createToast`, `addToast` | Farben/Icons, neueste zuoberst, max. 4, keine Mutation |
| `components/notifications/NotificationProvider.test.tsx` | Provider + `useNotify` + ToastStack | Anzeige über Hook, Anzeige über `gameEvents`, Auto-Entfernen nach 4600 ms (Fake-Timer), Abmelden beim Unmount |

**Ergebnis Red-Phase:** 3 neue Testdateien schlagen fehl (Module fehlen), die 3 bestehenden bleiben grün. ✔

## 3. Umsetzung (Green)

- `createEventBus` speichert pro Ereignistyp ein `Set` von Handlern; `emit` iteriert über eine Kopie,
  damit sich ein Handler während des Aufrufs abmelden kann.
- `gameEvents` ist die app-weite Instanz mit dem Ereignis `notify`.
- `NotificationProvider` abonniert `gameEvents` in einem `useEffect` und meldet sich beim Unmount ab
  (inkl. Aufräumen offener Timer). `useNotify()` funktioniert auch ausserhalb des Providers,
  indem es direkt auf den Bus publiziert – so sind Spiel-Komponenten lose gekoppelt.
- `ToastStack` übernimmt Masse, Farben und die `toastIn`-Animation 1:1 aus dem Prototyp (CSS-Modul).

**Ergebnis Green-Phase:** 19/19 Tests grün, Typecheck und Lint fehlerfrei.

## 4. Probleme & Lösungen

| Problem | Lösung |
|---|---|
| Der Handler-Typ ist pro Ereignis unterschiedlich; eine `Map<Key, Set<Handler<E[K]>>>` lässt sich in TypeScript nicht direkt ausdrücken. | Intern `Handler<never>` speichern und an den öffentlichen, generischen Methoden typisieren – die API bleibt vollständig typsicher. |
| Timer-Test: Toast muss genau nach 4600 ms verschwinden. | `vi.useFakeTimers()` und `advanceTimersByTime(4599)` / `(2)` prüfen beide Seiten der Grenze. |
| React-Warnung „ref value will likely have changed“ beim Cleanup | Timer-Array vor dem Cleanup in eine lokale Variable kopieren. |

## Bugfix (Iteration 3): Animationen liefen nicht

**Befund:** Im Browser lief keine Animation aus `components/notifications/ToastStack.module.css` (`toastIn`). CSS Modules benennen Animationsnamen lokal um,
die `@keyframes` lagen aber nur global in `globals.css` (Details: `feature-project-setup.md`, Abschnitt 5).

**Test (Red):** `components/notifications/animations.test.ts` prüft mit `missingKeyframesIn`, dass jede verwendete Animation im selben Modul
definiert ist → rot.
