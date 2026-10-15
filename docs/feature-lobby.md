# Feature: Spielauswahl / Lobby (`feature/lobby`)

**User Story:** US-06 · **Sprint:** 2 · **Story Points:** 3 · **Basis:** `feature/chips-wallet`

## 1. Planung

### Ziel
„Schritt 2 von 3“: Der Spieler sieht sein Guthaben (inkl. Auszahlungswert in CHF), wählt Poker oder
Roulette oder verlässt das Casino über die Kasse.

### Umzusetzende Funktionen

| Funktion / Datei | Inhalt | Aufbau |
|---|---|---|
| `lib/lobby.ts` → `GAME_MIN_CHIPS` | Mindestguthaben: Poker 20 (Big Blind), Roulette 10 (kleinster Jeton) | Konstante |
| `lib/lobby.ts` → `checkGameEntry(game, chips)` | Darf der Spieler an den Tisch? | `{ ok: true }` oder `{ ok: false, title, msg }` (Warn-Toast-Texte aus dem Prototyp) |
| `components/screens/lobby/LobbyScreen.tsx` | Kopfbereich mit Guthaben-Box, zwei Spielkarten, „Casino verlassen“-Leiste | Karten sind Buttons; Hover hebt Karte an und färbt den Rand gold |
| `components/screens/lobby/GameArt.tsx` | Kartenpaar A♠/K♥ und Mini-Roulettekessel (conic-gradient) | reine Darstellung |
| `CasinoApp` | Bildschirm `lobby` verwendet `LobbyScreen` | |

### Akzeptanzkriterien
- Guthaben `1’000 Jetons` und `≈ CHF 100.00 Auszahlungswert` sind sichtbar.
- Klick auf Poker/Roulette mit genügend Jetons öffnet den Tisch.
- Mit zu wenig Jetons erscheint ein Warn-Toast („Zu wenig Jetons“) und die Lobby bleibt offen.
- „Auszahlen & verlassen“ führt zur Kasse.

## 2. Tests (Red)

| Testdatei | Fälle |
|---|---|
| `lib/lobby.test.ts` | Mindestguthaben, Zutritt erlaubt, Poker < 20 und Roulette < 10 verweigert inkl. Texte |
| `components/screens/lobby/LobbyScreen.test.tsx` | Schritt/Titel/Guthaben/CHF-Wert, beide Spielkarten, Poker öffnen, Roulette öffnen, Warnung bei zu wenig Jetons, Auszahlung |

**Ergebnis Red-Phase:** 2 Testdateien rot. ✔

## 3. Umsetzung (Green)

- Zutrittsregeln in `lib/lobby.ts` (rein, testbar); `LobbyScreen` meldet eine Verweigerung als `warn`-Toast.
- Spielkarten sind echte `<button>`-Elemente (Tastatur-bedienbar); der Hover-Effekt (Rand gold, −3 px) liegt auf der inneren Karte.
- `GameArt`: Mini-Spielkarten und der Roulettekessel aus drei Ebenen (`conic-gradient` Zahlenkranz, Holzring, Messingkegel) + Kugel – 1:1 aus dem Prototyp.
- „Auszahlen & verlassen“ ruft `cashOut()` aus dem Wallet auf, der Betrag wird dort gespeichert.

**Ergebnis Green-Phase:** 49/49 Tests grün, Typecheck und Lint fehlerfrei.

## 4. Probleme & Lösungen

| Problem | Lösung |
|---|---|
| Das Design verwendet `style-hover` auf einem Kind-Element des Buttons. | CSS-Selektor `.gameBtn:hover .gameCard` statt Inline-Style. |
| Der Titel „Poker“/„Roulette“ ist ein `h2` innerhalb eines Buttons – der Test sucht den Button per Name. | Button per Teiltext `Platz nehmen →` / `Setzen →` finden (Regex), Überschrift separat per Rolle `heading`. |

## 5. Änderungswunsch (Iteration 3): „Europäischer Kessel“ → „Roulette“

**Test (Red):** Die Roulette-Karte soll „Roulette mit einer Null. Mehrere Einsätze pro Runde möglich.“ zeigen,
„Europäischer Kessel“ darf nicht mehr vorkommen → rot.

**Umsetzung (Green):** Text in `LobbyScreen` angepasst. → alle Tests grün.
