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
