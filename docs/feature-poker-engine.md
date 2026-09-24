# Feature: Poker-Spiellogik (`feature/poker-engine`)

**User Story:** US-08 · **Sprint:** 3 · **Story Points:** 8 · **Basis:** `feature/chips-wallet`

## 1. Planung

### Ziel
Die komplette Texas-Hold'em-Logik als **reine, UI-unabhängige Funktionen**. Jede Aktion erzeugt einen
neuen Spielzustand (unveränderlich). Zufall (Kartenmischen, Bot-Verhalten) wird über einen
injizierbaren Zufallsgenerator gesteuert, damit die Tests deterministisch sind.
Der Pokertisch (UI) folgt im Branch `feature/poker-table`.

### Spielregeln (aus dem Prototyp)
- 4 Plätze: „Du“ + Bots Vera, Ruben, Milla; Bots starten mit 600 Jetons.
- Blinds 10 / 20. Small Blind = Dealer + 1, Big Blind = Dealer + 2, erster Spieler = Dealer + 3.
- Setzrunden Pre-Flop → Flop (3 Karten) → Turn (1) → River (1) → Showdown.
- Mindesterhöhung = letzte Erhöhungsdifferenz (mindestens Big Blind).
  Nur eine echte Erhöhung eröffnet die Runde für die anderen neu (ein All-In unter dem Mindestbetrag gilt als „call for less“).
- Haupt- und Nebenpots nach eingezahlten Beträgen (All-In-Regel). Unteilbare Restjetons gehen an den ersten Gewinner links vom Dealer.
- Handrangfolge: Höchste Karte, Paar, Zwei Paare, Drilling, Straße, Flush, Full House, Vierling, Straight Flush, Royal Flush; Kicker entscheiden.

### Umzusetzende Funktionen

| Datei → Funktion | Inhalt | Aufbau |
|---|---|---|
| `lib/poker/cards.ts` → `newDeck(rng)` | 52 Karten, gemischt | Fisher-Yates mit `rng()` |
| `cards.ts` → `parseCard("As")`, `cardText(card)` | Hilfen für Tests und Anzeige | Rang `2–9,T,J,Q,K,A`, Farbe `s h d c` |
| `lib/poker/evaluate.ts` → `eval5(cards)` | Bewertung von genau 5 Karten | Kategorie + Tiebreaker → numerischer `score` (Basis 16) |
| `evaluate.ts` → `evalBest(cards)` | Beste 5 aus 5–7 Karten (bei < 5: Paar/High Card) | alle 21 Kombinationen |
| `evaluate.ts` → `handName(result)` | deutscher Name der Hand | „Royal Flush“ = Straight Flush mit Ass hoch |
| `lib/poker/engine.ts` → `newHand(stacks, dealer, deck)` | Neue Hand austeilen, Blinds setzen | 2 Karten je Spieler, `toAct = dealer+3` |
| `engine.ts` → `applyAction(state, action, target?)` | `fold`, `call` (inkl. Schieben), `raise` (inkl. All-In) | klont den Zustand, bucht Einsatz, prüft ob Setzrunde beendet |
| `engine.ts` → `advanceRunout(state)` | Wenn niemand mehr handeln kann (alle All-In): nächste Strasse aufdecken | Phase `runout` → wird von der UI zeitverzögert aufgerufen |
| `engine.ts` → `buildPots(players)` | Haupt-/Nebenpots | Stufen der `committed`-Beträge |
| `engine.ts` → Ergebnis `state.result` | Titel, Art (win/lose/info), Untertitel, Zeilen je Spieler mit Hand und Netto | nach Showdown oder wenn alle anderen passen |
| `lib/poker/bot.ts` → `botDecision(state, rng)` | KI der Computergegner | Handstärke (Pre-Flop Heuristik / Post-Flop `evalBest`) + Rauschen, Pot-Odds |
| `engine.ts` → `callInfo`, `minRaiseTarget`, `maxRaiseTarget` | Hilfen für die Aktionsleiste | benötigter Betrag, Min/Max beim Erhöhen |

### Akzeptanzkriterien
- Alle Handkategorien werden korrekt erkannt, inkl. „Wheel“ (A-2-3-4-5) und Kicker-Vergleich.
- Blinds, Reihenfolge, Strassenwechsel und Showdown folgen den Regeln oben.
- Side-Pots werden korrekt verteilt; Split-Pots teilen gerecht, Restjeton an den ersten Gewinner links vom Dealer.
- Die Jetonsumme am Tisch bleibt in jeder Situation erhalten (Invariante).

## 2. Tests (Red)

| Testdatei | Fälle |
|---|---|
| `lib/poker/cards.test.ts` | `parseCard`/`cards`, ungültige Karte, `cardText` (A, K, Q, J, 10, 7), 52 eindeutige Karten, deterministisches Mischen mit Seed |
| `lib/poker/evaluate.test.ts` | alle 10 Kategorien (parametrisiert mit `it.each`), Wheel A-5, A-5-Straight-Flush ≠ Royal, Kategorie-Vergleich, Kicker, Gleichstand, beste 5 aus 7, Pre-Flop-Bewertung |
| `lib/poker/engine.test.ts` | Blinds + Reihenfolge, Dealer-Rotation, Blind-All-In, Unveränderlichkeit, Flop/Turn/River, Passen, Mindesterhöhung, Neueröffnung nach Raise, „call for less“, Aktionsleisten-Hilfen, Sieg ohne Showdown, Showdown-Gewinn/Verlust, Split-Pot mit Restjeton, Haupt-/Nebenpot, automatischer Runout, `buildPots`, `nextHandStacks` |
| `lib/poker/bot.test.ts` | `handStrength` pre-/post-flop, Bot erhöht mit AA, passt mit 7-2 gegen grosse Erhöhung, schiebt ohne Einsatz |

**Test-Hilfe `rig()`:** baut ein Deck so, dass `pop()` zuerst die gewünschten Startkarten und danach das Board liefert –
so lassen sich Showdown-Situationen exakt nachstellen. Der Zufall der Bots wird mit `() => 0.5` neutralisiert.

**Invariante:** Mehrere Tests prüfen, dass die Summe aller Jetons am Tisch unverändert bleibt.

**Ergebnis Red-Phase:** 4 Testdateien rot (Module fehlen). ✔
