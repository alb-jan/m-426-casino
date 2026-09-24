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
