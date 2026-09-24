# Feature: Pokertisch (`feature/poker-table`)

**User Story:** US-09 · **Sprint:** 3 · **Story Points:** 8 · **Basis:** `feature/poker-engine`

## 1. Planung

### Ziel
Der spielbare Pokertisch aus dem Prototyp: ovaler Filztisch mit drei Computergegnern oben, Pot und
Gemeinschaftskarten in der Mitte, eigener Platz unten, Aktionsleiste darunter und ein Rundenergebnis-Overlay.
Die Logik kommt vollständig aus `lib/poker` – die UI steuert nur Zeitabläufe, Animationen und das Wallet.

### Umzusetzende Funktionen

| Datei → Funktion | Inhalt | Aufbau |
|---|---|---|
| `lib/poker/view.ts` → `streetLabel(street)` | Pre-Flop, Flop, Turn, River, Showdown | Array-Lookup |
| `view.ts` → `callLabel(state)` | „Schieben“, „Mitgehen (20)“, „Mitgehen (All-In 30)“ | aus `callAmount` und eigenem Stack |
| `view.ts` → `raiseLabel(state, amount)` | „Erhöhen auf 60“ bzw. „Setzen 40“ (wenn noch kein Einsatz) | |
| `view.ts` → `defaultRaise`, `raiseStep(state, amount, ±1)` | Startwert und ± 20 innerhalb Min/Max | nutzt `minRaiseTarget`/`maxRaiseTarget` |
| `view.ts` → `myHandLabel(state)` | „Blinds 10 / 20 Jetons“ bzw. „Deine Hand: Paar“ | `evalBest` |
| `view.ts` → `seatStatus(state, seat)` | Status-Text und Farbe je Platz („Gepasst“, „Am Zug …“, letzte Aktion) | |
| `view.ts` → `outcomeMessage(state)` | Toast-Text zum Handende | „Du gewinnst 60 Jetons mit Drilling.“ / „Vera gewinnt den Pot mit Paar.“ |
| `components/screens/poker/usePokerGame.ts` | Spiel-Hook | hält `PokerState`, plant Bot-Züge (950 ms) und Runout (900 ms) per Timer, synchronisiert das Wallet, löst Toasts und Jeton-Flüge aus |
| `components/screens/poker/PlayingCard.tsx` | Spielkarte mit 3D-Flip (Vorder-/Rückseite) | Grössen `sm` (46×64), `md` (66×94), `lg` (72×102) |
| `components/screens/poker/Seat.tsx` | Platz eines Bots bzw. eigener Platz | Avatar, Stack, Dealer-Button „D“, Karten, Status, Einsatz-Jetons, Puls-Animation am Zug |
| `components/screens/poker/ChipFlight.tsx` | Jetons fliegen vom Platz in den Pot und zum Gewinner | absolute Positionen in %, CSS-Transitions, zufälliger Versatz/Rotation |
| `components/screens/poker/ResultOverlay.tsx` | Rundenergebnis | Titel, Untertitel, Zeile je Spieler mit Hand und ±Jetons, „Nächste Runde“ / „Zurück zur Spielauswahl“ |
| `components/screens/poker/ActionBar.tsx` | Passen, Mitgehen/Schieben, − Erhöhen +, All-In | nur sichtbar, wenn der Spieler am Zug ist; sonst „Die Computergegner entscheiden …“ |
| `components/screens/poker/PokerScreen.tsx` | Zusammenbau | Props `deckFactory`, `rng`, `botDelay` für deterministische Tests |

### Akzeptanzkriterien
- Beim Betreten wird eine Hand mit Dealer = Du ausgeteilt; Stacks: eigenes Guthaben, Bots je 600.
- Eigene Karten sind offen, Karten der Bots verdeckt (erst beim Showdown aufgedeckt).
- Bots handeln automatisch mit Verzögerung; die Aktionsleiste erscheint nur, wenn der Spieler am Zug ist.
- Das Header-Guthaben entspricht immer dem eigenen Stack am Tisch.
- Am Handende erscheint das Overlay und ein Toast; „Nächste Runde“ rotiert den Dealer.
- Mit weniger als 20 Jetons führt der Button im Overlay zurück zur Spielauswahl.

## 2. Tests (Red)

| Testdatei | Fälle |
|---|---|
| `lib/poker/view.test.ts` | Strassen-Namen, Mitgehen/Schieben/All-In-Label, Erhöhen vs. Setzen, Startbetrag, ±-Schritte mit Grenzen, eigene Hand, Sitz-Status (Blind, Am Zug, Gepasst, All-In), Toast-Texte (Gewinn, Niederlage, ohne Showdown, Split) |
| `components/screens/poker/PokerScreen.test.tsx` | Tisch/Spieler/Pot/Runde, offene vs. verdeckte Karten, automatische Bot-Züge + Aktionsleiste, ± Erhöhung, Header-Guthaben = Stack, Passen → Overlay + Toast + aufgedeckte Karten, Gewinn mit Drilling + nächste Runde mit neuem Dealer, zurück zur Lobby, All-In |

**Test-Strategie für Zeitabläufe:** Fake-Timer (`vi.useFakeTimers`) und schrittweises Vorspulen in 500-ms-Schritten,
damit React zwischen den Bot-Zügen die Effekte ausführen und neue Timer planen kann.
Deck (`rigDeck`) und Zufall (`rng = () => 0.5`) werden per Props injiziert → die Bots verhalten sich deterministisch.

**Ergebnis Red-Phase:** 2 Testdateien rot. ✔

## 3. Umsetzung (Green)

- **Trennung Logik / Ablauf / Darstellung:** `lib/poker/*` (reine Logik) → `usePokerGame` (Zeit, Wallet, Toasts, Animation)
  → kleine Darstellungs-Komponenten (`Seat`, `PlayingCard`, `ChipFlight`, `ResultOverlay`, `ActionBar`).
- **Bot-Züge:** ein `useEffect` auf den Spielzustand plant genau einen Timer (950 ms) für den Bot am Zug bzw. 900 ms im Runout;
  der Cleanup löscht ihn wieder (auch im React-StrictMode sicher).
- **`commit(prev, next)`:** zentrale Stelle für Nebenwirkungen – Differenz der `committed`-Beträge löst den Jeton-Flug aus,
  der Wechsel nach `done` den Toast (Observer über `useNotify`) und das Einziehen des Pots zum Gewinner.
- **Wallet-Sync:** `useEffect` setzt `wallet.chips = eigener Stack`; dadurch zeigen Header und „Dein Guthaben“ immer den Stack.
- **Karten:** `PlayingCard` mit `perspective` + `rotateY` und `backface-visibility` (Flip-Animation 0.62 s); Rückseite mit Ass-Emblem als SVG.
- Styles 1:1 aus dem Prototyp (ovaler Tisch `border-radius: 200px / 90px`, Holzrand, Filz-Verlauf), plus Mobile-Anpassungen.

**Ergebnis Green-Phase:** 110/110 Tests grün, Typecheck und Lint fehlerfrei.

## 4. Probleme & Lösungen

| Problem | Lösung |
|---|---|
| Test „Passen → Toast“ schlug fehl: nach 15 s vorgespulter Zeit war der Toast (Lebensdauer 4.6 s) schon wieder verschwunden. | Test spult nur noch vor, bis das Ergebnis-Overlay erscheint (Fehler lag im Test, nicht im Code). |
| `act(() => advanceTimersByTime(10000))` führte nur den ersten Bot-Zug aus. | React plant den nächsten Timer erst im Effekt nach dem Rendern → in 500-ms-Schritten vorspulen (Helfer `run`). |
| ESLint `react-hooks/exhaustive-deps`: Hilfsfunktion `later` wurde in mehreren `useCallback` verwendet. | `later` selbst als stabiles `useCallback` definiert und in die Abhängigkeitslisten aufgenommen. |
| Blinds der ersten Hand wurden im StrictMode doppelt animiert. | `started`-Ref als Schutz im Mount-Effekt. |
| Im Runout gibt es keinen Spieler „am Zug“. | ActionBar zeigt dann „Karten werden aufgedeckt“. |

## 5. Bugfix aus der Integration (Iteration 2)

**Befund (Sprint-Review im `dev`-Branch):** Im Entwicklungsmodus blieben die Blind-Jetons von Vera und Ruben an ihren Plätzen
stehen, statt in den Pot zu fliegen. Nachvollzogen mit einem Headless-Chrome-Skript, das die Positionen der Jetons ausliest.

**Ursache:** React-StrictMode führt Effekte zur Kontrolle zweimal aus (mount → cleanup → mount). Der Cleanup-Effekt löschte
alle Timer (auch die der Blinds), und der `started`-Ref verhinderte, dass die Animation beim zweiten Mount neu geplant wurde.

**Test zuerst (Red):** `components/screens/poker/ChipFlight.test.tsx` rendert den Tisch in `<StrictMode>` und erwartet,
dass die Blinds nach 300 ms in der Tischmitte liegen → schlägt fehl (`17%` statt `50%`).

**Lösung (Green):** Neuer State `hand` (Startzustand der aktuellen Hand). Ein Effekt mit Abhängigkeit `hand` animiert die Blinds
und räumt im Cleanup die Jetons wieder ab. Beim doppelten Mount wird so einfach neu animiert; `startHand` setzt nur noch `hand`/`game`.
Der `started`-Ref entfällt. → 111/111 Tests grün.

**Lernpunkt:** Effekte müssen idempotent sein (Setup + Cleanup ergeben wieder den Ausgangszustand). Ein „nur einmal ausführen“-Ref
kaschiert das Problem nur. Tests für Animationen deshalb zusätzlich in `<StrictMode>` ausführen.
