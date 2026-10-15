# Feature: Jetons & Guthaben (`feature/chips-wallet`)

**User Story:** US-03 · **Sprint:** 1 · **Story Points:** 5 · **Basis:** `feature/notifications`

## 1. Planung

### Ziel
Ein zentrales Jeton-Guthaben, das über alle Bildschirme (Kauf, Lobby, Poker, Roulette, Kasse)
geteilt wird, plus die visuelle Jeton-Darstellung und der App-Rahmen (Header mit Guthaben, Footer).

### Architekturentscheid: Bildschirm-Zustandsmaschine statt Routen
Der Prototyp ist eine Single-Page-App mit den Bildschirmen `landing → buy → lobby → poker/roulette → exit`.
Wir bilden das als Zustand (`screen`) in einem React-Context ab, statt eigene Next.js-Routen zu verwenden:
- Das Guthaben ist reiner Client-Zustand (kein Backend) und darf beim Wechsel nicht verloren gehen.
- Ungültige Direkteinstiege (z. B. Poker ohne Jetons) sind so ausgeschlossen.
- Die Logik bleibt als reiner Reducer vollständig testbar.

### Umzusetzende Funktionen

| Funktion / Datei | Inhalt | Aufbau |
|---|---|---|
| `lib/chips.ts` → `CHIP_STYLES`, `DENOMS` | Hausfarben: 10 Blau, 20 Rot, 50 Grün, 100 Schwarz, 500 Violett | Konstanten aus dem Prototyp |
| `lib/chips.ts` → `calculateChips(amount)` | Betrag → minimale Anzahl Jetons (Greedy) | absteigend über `DENOMS`; Rest < 10 wird zu einem 10er aufgerundet |
| `lib/chips.ts` → `chipView(value)` | Darstellungsdaten eines Jetons | `conic-gradient` mit 8 Randstreifen, Basis-/Schriftfarbe |
| `lib/chips.ts` → `chipStack(amount, max)` | Jeton-Stapel für Einsätze/Pot | `calculateChips(...).slice(0,max).map(chipView)` |
| `lib/wallet.ts` → `RATE`, `MIN_CHF`, `MAX_CHF` | 1 CHF = 10 Jetons, min. 5, max. 500 CHF | Konstanten |
| `lib/wallet.ts` → `walletReducer` | Zustand `{ screen, chips, bought, cashed }` | Aktionen `navigate`, `deposit`, `setChips`, `adjustChips`, `cashOut`, `reset` |
| `lib/wallet.ts` → `chipsToChf(chips)` | Auszahlungswert | `chips / RATE` |
| `components/casino/CasinoProvider.tsx` | Context + `useCasino()` | `useReducer(walletReducer)` + Aktionsfunktionen |
| `components/chips/Chip.tsx` | Jeton-Grafik in beliebiger Grösse | Rand (conic-gradient) + gestrichelter Innenkreis mit Wert |
| `components/layout/Header.tsx` / `Footer.tsx` | App-Rahmen gemäss Design | Logo „A ♠“, Guthaben-Pille mit 100er-Jeton, „← Zurück zur Spielauswahl“ nur im Spiel |
| `components/CasinoApp.tsx` | App-Shell | Provider, Hintergrund, Header/Footer ausser auf der Landingpage, Bildschirm-Umschaltung |

### Akzeptanzkriterien
- `calculateChips(880)` → `[500,100,100,100,50,20,10]`; `calculateChips(5)` → `[10]`.
- Eine Einzahlung erhöht Jetons und eingezahlten Frankenbetrag; `cashOut` setzt den ausbezahlten Betrag und wechselt zur Kasse.
- `adjustChips` kann das Guthaben nie negativ machen.
- Der Header zeigt das Guthaben formatiert (`1’000 Jetons`), die Zurück-Schaltfläche nur in Poker/Roulette.
- Auf der Landingpage werden Header und Footer nicht angezeigt.

## 2. Tests (Red)

| Testdatei | Getestete Einheit | Fälle |
|---|---|---|
| `lib/chips.test.ts` | `calculateChips`, `chipView`, `chipStack` | Greedy-Zerlegung, Aufrunden von Resten, Randstreifen, Fallback, Stapel-Limit |
| `lib/wallet.test.ts` | Konstanten, `walletReducer`, `chipsToChf` | Startzustand, Navigation, Einzahlung, Guthaben nie negativ, Auszahlung, Neustart |
| `components/chips/Chip.test.tsx` | `Chip` | Grösse und Wert |
| `components/layout/Header.test.tsx` | `Header` + `CasinoProvider` | Guthaben formatiert, Zurück-Button nur im Spiel und führt zur Lobby |
| `components/CasinoApp.test.tsx` | App-Shell | kein Header/Footer auf der Landingpage, sonst sichtbar |

**Ergebnis Red-Phase:** 5 neue Testdateien rot (Module fehlen), 6 bestehende grün. ✔

## 3. Umsetzung (Green)

- `lib/chips.ts` und `lib/wallet.ts` sind reine Funktionen ohne React – dadurch schnell und isoliert testbar.
- `CasinoProvider` kapselt `useReducer(walletReducer)`; die Aktionsfunktionen werden einmalig mit `useMemo`
  erzeugt, damit Konsumenten stabile Referenzen erhalten (wichtig für `useEffect`-Abhängigkeiten in den Spielen).
- `Chip` bildet die Jetons aus dem Prototyp nach (Rand = `conic-gradient` mit 8 weissen Streifen, Innenkreis gestrichelt).
- `Header` (sticky, Blur-Hintergrund) und `Footer` 1:1 nach Design; Header-Styles als CSS-Modul inkl. Hover und
  einer Mobile-Anpassung (< 720px).
- `CasinoApp` ist die App-Shell: `NotificationProvider` → `CasinoProvider` → Hintergrund-Verlauf, Header, Bildschirm, Footer.
  Noch nicht umgesetzte Bildschirme sind Platzhalter, die in den Sprint-2-Branches ersetzt werden.

**Ergebnis Green-Phase:** 39/39 Tests grün, Typecheck und Lint fehlerfrei.

## 4. Probleme & Lösungen

| Problem | Lösung |
|---|---|
| Bash-Heredoc mit vielen Sonderzeichen (`’`, Backticks) brach beim Anlegen der Dateien ab. | Dateien direkt mit dem Editor geschrieben statt per Shell-Skript. |
| `useCasino()` ausserhalb des Providers würde still `null` liefern. | Hook wirft eine sprechende Fehlermeldung – Fehler fallen im Test sofort auf. |
| Header-Jeton hat im Design einen anderen Schatten und Innenabstand als die Tisch-Jetons. | `Chip` erhält optionale Props `inset`, `fontSize`, `style`. |

## 5. Änderungswunsch (Iteration 3): Footer entfernen

**Wunsch Product Owner:** Der Footer soll auf allen Seiten verschwinden.

**Test (Red):** `CasinoApp.test.tsx` prüft für alle Bildschirme, dass kein `contentinfo` (Footer) gerendert wird → 3 Fälle rot.

**Umsetzung (Green):** `components/layout/Footer.tsx` gelöscht, Einbindung in `CasinoApp` entfernt. → 43/43 Tests grün.
