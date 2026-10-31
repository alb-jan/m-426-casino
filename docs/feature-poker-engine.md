> Aktualisierung 29.10.2026: Dieses Dokument enthält historische Entwicklungsnotizen. Den aktuellen Vertrag und die belegten Änderungen beschreibt [release-improvement.md](release-improvement.md). Insbesondere Observer, Navigation, Roulette-State und Poker-Presenter wurden überarbeitet.

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

## 3. Umsetzung (Green)

- **Unveränderlichkeit:** `applyAction` und `advanceRunout` klonen den Zustand (`players`, `deck`, `community`)
  und geben einen neuen zurück. Dadurch kann die UI den Zustand direkt in React-State speichern und vorher/nachher vergleichen
  (z. B. für die Jeton-Flug-Animation).
- **Score-Kodierung:** `eval5` kodiert Kategorie und bis zu 5 Tiebreaker als Zahl zur Basis 16
  (`score = cat·16⁵ + t0·16⁴ + …`) – ein einziger Zahlenvergleich entscheidet über Sieger inkl. Kicker.
- **Phasen:** `bet` (Setzrunde), `runout` (niemand kann mehr setzen, UI ruft `advanceRunout` mit Verzögerung auf), `done`.
- **Side-Pots:** `buildPots` bildet Stufen aus den unterschiedlichen `committed`-Beträgen; jeder Pot hat eine eigene Liste
  berechtigter Spieler. Eingezahlte Jetons von Spielern, die gepasst haben, fliessen in den Pot ihrer Stufe.
- **Bots:** `botDecision` ist eine reine Funktion mit injizierbarem Zufall (Handstärke + Rauschen ±0.08, Pot-Odds, Bet-Sizing ½ bzw. ¾ Pot).
- **Ergebnis:** `state.result` enthält alles, was das Ergebnis-Overlay braucht (Titel, Farbe, Zeilen je Spieler, Gewinner-Sitze).

**Ergebnis Green-Phase:** 49/49 Poker-Tests (88 gesamt) grün, Typecheck und Lint fehlerfrei.

## 4. Probleme & Lösungen

| Problem | Lösung |
|---|---|
| Der Prototyp verteilt den Restjeton eines Split-Pots zuerst an den **Dealer**. Nach den Regeln geht er an den ersten Gewinner **links** vom Dealer. | Sortierung über `(i − dealer − 1 + 4) % 4` statt `(i − dealer + 4) % 4`; per Test abgesichert. |
| Im Prototyp musste bei „alle All-In“ ein einzelner übrig gebliebener Spieler alleine weiter „schieben“. | Neue Phase `runout`: wenn höchstens ein Spieler handeln kann, werden die Karten ohne Setzrunde aufgedeckt. |
| Ein Spieler kann bereits durch den Big Blind All-In sein und wäre trotzdem als Erster „am Zug“. | Nach dem Posten der Blinds wird `toAct` auf den nächsten handlungsfähigen Spieler gesetzt (Test „Blind-All-In“). |
| Kurzes All-In-Raise hätte die Mindesterhöhung verkleinert. | `minRaise = max(BB, Erhöhung, bisheriges minRaise)`. |
| Tests für Showdowns brauchen bekannte Karten. | Deck-Injektion in `newHand` + Test-Helfer `rig()`; `newDeck(rng)` für reproduzierbares Mischen. |
| Bash-Heredoc mit `python` im Test-Fix brach ab (Python-Heredoc nicht terminiert). | Datei trotzdem korrekt ersetzt; künftig Dateien nur noch mit dem Editor ändern. |

## 5. Iteration 4: Stärkere Bots (Research-basiert)

### Ausgangslage
Beim Testen gewann der Product Owner fast jede Hand. Eine Simulation (3000 Hände je Spielweise) bestätigte das:
Wer **immer Pot-gross setzt**, gewinnt 89 % der Hände (98 % davon ohne Showdown, Bots passen in 42 % ihrer Züge).
Ursachen: Die Handstärke war eine grobe Formel (ein Paar ≈ 0.35), Mitgehen erst bei *Handstärke > Pot-Odds + 0.1*, kaum Erhöhungen, keine Bluffs.

### Research (Zusammenfassung)
- Echte Online-Pokerräume verbieten Bots; Hausbots im Casino-Bereich dürfen keine Zusatzinformationen haben.
- Spitzen-KIs (Libratus, Pluribus) nutzen *Counterfactual Regret Minimization* – für ein Schulprojekt zu aufwendig.
- Praxisübliche regelbasierte Bots: **Gewinnwahrscheinlichkeit per Monte-Carlo-Simulation**, Entscheidung über **Pot-Odds**,
  **dosierte Bluffs**, **Gegnermodell** (Aggressivität des Gegners beobachten).

### Umzusetzende Funktionen

| Datei → Funktion | Inhalt | Aufbau |
|---|---|---|
| `lib/poker/random.ts` → `seededRng(seed)`, `hashSeed(text)` | reproduzierbarer Zufall | Mulberry32 |
| `lib/poker/equity.ts` → `estimateEquity(hole, board, gegner, rng, samples)` | Gewinnwahrscheinlichkeit 0…1 | zufällige Gegnerhände + Restboard ziehen, `evalBest` vergleichen, Split anteilig |
| `lib/poker/opponentModel.ts` → `newProfile`, `observe`, `aggression` | Gedächtnis über den Spieler | zählt Aktionen und grosse Einsätze (≥ ½ Pot) |
| `lib/poker/bot.ts` → `botDecision(state, rng, opts)` | neue Entscheidungslogik | siehe unten |

**Entscheidungslogik**
- Equity per Simulation gegen alle noch aktiven Gegner (deterministisch geseedet aus Karten + Situation).
- *Wertgrenze* = `1.6 / (Gegner + 1) + 0.05` (max. 0.75): darüber setzt/erhöht der Bot (½ bzw. ¾ Pot).
- Gegen einen Einsatz: **mitgehen, wenn Equity + Gegner-Bonus ≥ Pot-Odds**; Gegner-Bonus = 0.08 × Aggressivität des Spielers.
- **Bluffs**: ab dem Flop mit ≤ 2 Gegnern in 10 % der Fälle, wenn niemand gesetzt hat; seltene Bluff-Erhöhung (4 %).

### Akzeptanzkriterien
- AA gegen 1 Gegner ≈ 85 % Equity, gegen 3 Gegner ≈ 64 %; 7-2 offsuit deutlich schwächer.
- Gegen ein All-In geht der Bot mit starken Händen mit und passt mit Müll.
- **Ausbeuten nicht mehr möglich:** „immer All-In“ und „immer Pot-gross setzen“ verlieren auf Dauer Jetons (Simulation als Test).

### Tests (Red)

| Testdatei | Fälle |
|---|---|
| `lib/poker/random.test.ts` | reproduzierbar, Wertebereich, Gleichverteilung, `hashSeed` stabil |
| `lib/poker/equity.test.ts` | bekannte Werte (AA vs 1/3 Gegner, 7-2o), unschlagbare Hand = 1, Split = 0.5, reproduzierbar |
| `lib/poker/opponentModel.test.ts` | neutraler Start, Dauer-Aggressor erkannt, Mitgehen/kleine Erhöhungen zählen nicht, unveränderlich |
| `lib/poker/bot.test.ts` | `valueBar`; `chooseAction`: Pot-Odds, Gegner-Bonus, Pot-Odds mit kurzem Stack, Wert-Einsatz in BB-Schritten, Re-Raise, Schieben, Bluff-Regeln; `botDecision`: All-In mit AA mitgehen / mit 7-2 passen, Drilling setzt, Profil, Reproduzierbarkeit |
| `lib/poker/botStrength.test.ts` | **Abnahme-Simulation**: „immer All-In“, „immer Pot-gross“, „immer minimal erhöhen“ verlieren über 300 Hände |

Die alten Tests für `handStrength` entfallen, da die Funktion durch `estimateEquity` ersetzt wird.
`lib/poker/testDeck.ts` (`rigDeck`) wurde unverändert aus `feature/poker-table` übernommen.

**Ergebnis Red-Phase:** 5 Testdateien rot (Module fehlen). ✔

### Umsetzung (Green)

- `random.ts`: Mulberry32 + FNV-1a-Hash. Die Equity-Simulation wird aus Karten + Gegnerzahl geseedet → gleiche Situation,
  gleiche Einschätzung (reproduzierbar, testbar); Zufall nur noch für Bluff-Entscheidungen.
- `equity.ts`: Teil-Mischen (nur benötigte Karten ziehen), beste Hand per `evalBest`, Split anteilig. 250 Durchläufe ≈ 15 ms pro Entscheidung.
- `bot.ts`: `botDecision` = Equity berechnen → reine Regel `chooseAction` (Wert-Einsatz, Pot-Odds, Re-Raise, Bluffs, Gegner-Bonus).
- `opponentModel.ts`: zählt die Aktionen des Spielers; Aggressivität = Anteil Einsätze ≥ ½ Pot (ab 4 Aktionen).

### Messung vorher / nachher (je 1000 Hände, Spieler mit 1000 Jetons gegen 3 Bots)

| Spielweise | vorher: gewonnen / Ø pro Hand | nachher: gewonnen / Ø pro Hand |
|---|---|---|
| immer mitgehen | 30 % / −52 | 37 % / −96 |
| immer minimal erhöhen | 32 % / −92 | 37 % / −156 |
| **immer Pot-gross setzen** | **89 % / +62** | **38 % / −131** |
| **immer All-In** | – | **34 % / −83** |
| **vernünftig** (gleiche Logik wie die Bots) | – | **26 % / +3.8** (fairer Anteil bei 4 Spielern: 25 %) |

Bots passen jetzt in ~20 % statt 42 % ihrer Züge gegen grosse Einsätze und erhöhen selbst (bis 17 %).
Fazit: Stumpfe Strategien lassen sich nicht mehr ausnutzen; wer vernünftig spielt, spielt etwa ausgeglichen.

### Probleme & Lösungen

| Problem | Lösung |
|---|---|
| Monte-Carlo mit dem injizierten Test-Zufall `() => 0.5` würde immer dieselben Karten ziehen → Equity 0 oder 1. | Equity bekommt einen eigenen, aus der Situation geseedeten Generator; der injizierte Zufall steuert nur Bluffs. |
| Die Simulation als Test wäre mit 250 Durchläufen pro Entscheidung zu langsam. | `samples` als Option; der Abnahme-Test nutzt 120 Durchläufe (Laufzeit wenige Sekunden). |
| Vitest unterdrückt `console.log` erfolgreicher Tests – Messwerte waren unsichtbar. | Messungen in eine temporäre Datei geschrieben (nicht im Repo). |

**Ergebnis Green-Phase:** 110/110 Tests grün, Typecheck und Lint fehlerfrei.
