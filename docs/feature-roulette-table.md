# Feature: Roulettetisch (`feature/roulette-table`)

**User Story:** US-11 · **Sprint:** 4 · **Story Points:** 5 · **Basis:** `feature/roulette-engine`

## 1. Planung

### Ziel
Der Roulettetisch aus dem Prototyp: links die Ergebnisanzeige (Platzhalter „?“, Spinner „Kessel dreht“,
Gewinnzahl mit Farbe und Nettogewinn), die letzten 10 Zahlen und der Button „Drehen“; rechts das Tableau
mit Jeton-Wahl, Zahlenfeld 0–36, Dutzenden, einfachen Chancen und Quoten-Legende.
Der 3D-Kessel folgt im Branch `feature/roulette-3d-wheel`.

### Umzusetzende Funktionen

| Datei → Funktion | Inhalt | Aufbau |
|---|---|---|
| `components/screens/roulette/useRoulette.ts` | Spiel-Hook | Zustand `bets`, `denom`, `spinning`, `result`, `history`, `pending`; Aktionen `place`, `clearBets`, `pickDenom`, `spin`, `finishSpin` |
| `useRoulette` → `place(key)` | Jeton setzen | zieht den Jeton-Wert sofort vom Wallet ab; Warnung bei zu wenig Guthaben; gesperrt während der Drehung |
| `useRoulette` → `clearBets()` | Einsätze zurücknehmen | Betrag zurück ins Wallet + Info-Toast |
| `useRoulette` → `spin()` | Drehung starten | Warnung ohne Einsatz; Gewinnzahl wird **sofort** bestimmt (`spinNumber(rng)`), aufgelöst wird nach der Animation |
| `useRoulette` → `finishSpin()` | Auswertung | Auszahlung ins Wallet, Verlauf (max. 10), Toast über `spinMessage` |
| `components/screens/roulette/ResultPanel.tsx` | Linke Spalte | drei Zustände: leer / dreht / Ergebnis, farbiger Rahmen (grün bei Gewinn) |
| `components/screens/roulette/BettingBoard.tsx` | Tableau | Jeton-Wahl (10–500, goldene Umrandung), 0 + 36 Zahlen im Grid, Dutzende, Aussen-Felder, Einsatz-Marker |
| `components/screens/roulette/RouletteScreen.tsx` | Zusammenbau | Props `rng`, `spinDuration` für Tests |

### Akzeptanzkriterien
- Ein Klick auf ein Feld setzt den gewählten Jeton-Wert; Guthaben und Gesamteinsatz werden sofort angepasst.
- Mehrere Einsätze pro Runde sind möglich; „Einsätze löschen“ erstattet alles zurück.
- „Drehen“ ohne Einsatz zeigt eine Warnung; während der Drehung sind Einsätze gesperrt.
- Nach der Drehung: Gewinnzahl, Farbe, Nettogewinn, Verlauf und Toast; das Guthaben enthält die Auszahlung.

## 2. Tests (Red)

| Testdatei | Fälle |
|---|---|
| `components/screens/roulette/RouletteScreen.test.tsx` | Titel/Tableau (alle 37 Zahlen, Aussen-Felder, Quoten), Setzen mit Jeton-Wert + Abzug + Marker, Warnung bei zu wenig Guthaben, Einsätze löschen, Drehen ohne Einsatz, Drehung mit Sperre → Gewinnzahl/Farbe/Netto/Guthaben/Toast/Verlauf, Verlust bei Zéro |

Zufall per Prop: `rngFor(n) = () => (n + 0.5) / 37` liefert exakt die Zahl `n`. Zahlenfelder haben `aria-label="Zahl n"`,
damit sie trotz Einsatz-Marker eindeutig auffindbar sind (gleichzeitig besser für Screenreader).

**Ergebnis Red-Phase:** Testdatei rot. ✔

## 3. Umsetzung (Green)

- **`useRoulette`** trennt „Gewinnzahl bestimmen“ (sofort bei `spin()`, in `pending`) von „auswerten“ (`finishSpin()`).
  Standardmässig wertet ein Timer nach 2.2 s aus; mit `spinDuration: null` übernimmt später der 3D-Kessel das Timing.
  Die Einsätze der Drehung werden in einem Ref eingefroren, damit spätere Renders sie nicht verändern.
- Einsätze werden beim Setzen sofort vom Wallet abgebucht (`adjustChips(-denom)`), die Auszahlung beim Auswerten gutgeschrieben –
  „Verbleibend“ und Header stimmen dadurch immer.
- `BettingBoard` rendert Zahlen aus `GRID` mit Farbe aus `numberBg`, Marker-Stile über CSS-Modules-`composes`.
- `ResultPanel` zeigt die drei Zustände des Prototyps inkl. `settleGlow`-Animation bei der Gewinnzahl.

**Ergebnis Green-Phase:** 58/58 Tests grün, Typecheck und Lint fehlerfrei.

## 4. Probleme & Lösungen

| Problem | Lösung |
|---|---|
| `getByText("Schwarz")` war mehrdeutig, weil das Aussen-Feld „Schwarz“ denselben Text hat. | Farbname im Ergebnis über `data-testid="spin-color"` geprüft (Test präzisiert, Verhalten unverändert). |
| Einsatz-Marker verändert den zugänglichen Namen eines Zahlenfelds („17 20“). | `aria-label` für alle Felder („Zahl 17“, „Rot“, „Jeton 50“). |
| Jeton-Wahl braucht einen Zustand für Screenreader. | `aria-pressed` auf dem gewählten Jeton. |

## 5. Änderungswunsch (Iteration 3): „Europäischer Kessel“ → „Roulette“

**Test (Red):** Die Seitenüberschrift soll nur noch „Roulette“ lauten (statt „Roulette · Europäischer Kessel“) → rot.
Texte wie „Kessel dreht“ bleiben, da sie das Gerät beschreiben und nicht den Spielnamen.

**Umsetzung (Green):** Überschrift in `RouletteScreen` auf „Roulette“ gekürzt. → alle Tests grün.
