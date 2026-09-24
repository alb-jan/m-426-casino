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
