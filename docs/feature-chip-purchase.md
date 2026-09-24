# Feature: Jetons-Kauf (`feature/chip-purchase`)

**User Story:** US-05 · **Sprint:** 2 · **Story Points:** 5 · **Basis:** `feature/chips-wallet`

## 1. Planung

### Ziel
„Schritt 1 von 3“: Der Spieler tauscht Franken in Jetons. Eingaben werden validiert,
Fehler verständlich angezeigt, ein erfolgreicher Kauf wird per Toast bestätigt und führt in die Lobby.

### Umzusetzende Funktionen

| Funktion / Datei | Inhalt | Aufbau |
|---|---|---|
| `lib/purchase.ts` → `parseAmount(input)` | Text → Zahl; akzeptiert `12,50` und `12.50`, ignoriert Fremdzeichen | `replace(',', '.')`, Nicht-Ziffern entfernen, `parseFloat` |
| `lib/purchase.ts` → `previewChips(input)` | Vorschau „Du erhältst“ | `floor(betrag × RATE)`, bei ungültiger Eingabe 0 |
| `lib/purchase.ts` → `validatePurchase(input)` | Prüft leer / ungültig / < min / > max | Rückgabe `{ ok: true, chf, chips }` oder `{ ok: false, error }` mit den Texten aus dem Prototyp |
| `components/screens/buy/BuyScreen.tsx` | Formular links, Info-Spalte rechts | Eingabe mit „CHF … Franken“, Schnellwahl 10/20/50/100 CHF, Kurs-Box, Fehlerbox, Kauf-Button; Enter löst Kauf aus |
| `components/screens/buy/ChipLegend.tsx` | „Jeton-Werte im Haus“ | 5 Jetons mit Farbname und Frankengegenwert |
| `CasinoApp` | Bildschirm `buy` verwendet `BuyScreen` | |

### Fehlermeldungen (aus dem Prototyp)
| Fall | Meldung |
|---|---|
| leer | Bitte gib einen Betrag ein. |
| keine Zahl / ≤ 0 | Ungültiger Betrag – bitte nur Zahlen eingeben, z. B. 25 oder 12.50. |
| < CHF 5 | Der Mindestbetrag beträgt CHF 5 (= 50 Jetons). |
| > CHF 500 | Pro Kauf sind maximal CHF 500 möglich. |

### Akzeptanzkriterien
- CHF 25 ergibt 250 Jetons; CHF 12,55 ergibt 125 Jetons (abgerundet).
- Ungültige Eingaben zeigen die passende Meldung und färben das Eingabefeld rot; Tippen entfernt die Meldung.
- Nach dem Kauf: Guthaben erhöht, Toast „250 Jetons gekauft“ / „Für CHF 25.00 – viel Erfolg am Tisch!“, Wechsel zur Lobby.

## 2. Tests (Red)

| Testdatei | Fälle |
|---|---|
| `lib/purchase.test.ts` | `parseAmount` (Punkt/Komma, Fremdzeichen, NaN), `previewChips` (Kurs, Abrunden, ungültig → 0), `validatePurchase` (gültig, Grenzen 5 / 500, leer, ungültig, 0, 4.99, 500.01) |
| `components/screens/buy/BuyScreen.test.tsx` | Texte/Kurs/Limits, Live-Vorschau, Schnellwahl, Fehleranzeige + Zurücksetzen beim Tippen, erfolgreicher Kauf (Guthaben, Toast, Lobby), Enter-Taste, Jeton-Legende |

**Ergebnis Red-Phase:** 2 Testdateien rot (`./purchase` fehlt, Kaufbildschirm fehlt). ✔

## 3. Umsetzung (Green)

- `lib/purchase.ts` enthält die komplette Validierung als reine Funktion; der Bildschirm ruft nur `validatePurchase`
  auf und entscheidet anhand von `ok` – damit sind UI und Geschäftsregeln getrennt.
- `BuyScreen` hält nur den Eingabetext und die Fehlermeldung als lokalen State; das Guthaben wird über
  `deposit()` im `CasinoProvider` verbucht, der Toast über `useNotify()` (Observer) ausgelöst.
- `ChipLegend` zeigt die Jetons aufsteigend (10 → 500) mit Frankengegenwert (`formatChf(d / RATE)`).
- Layout zweispaltig (1.15fr / .85fr) wie im Prototyp, unter 860 px einspaltig.

**Ergebnis Green-Phase:** 54/54 Tests grün, Typecheck und Lint fehlerfrei.

## 4. Probleme & Lösungen

| Problem | Lösung |
|---|---|
| Gleitkomma: `4.35 * 10` ergibt `43.49999…` → `floor` würde 43 statt 43.5 → 43 liefern, bei Beträgen wie `0.29 * 10 = 2.8999…` aber einen Jeton zu wenig. | Vor dem Abrunden auf 3 Nachkommastellen runden: `floor(round(chf × RATE × 1000) / 1000)`. |
| Fehlermeldung soll beim Tippen verschwinden, aber nicht bei jedem Rendern. | Gemeinsame `pick()`-Funktion für Eingabe und Schnellwahl setzt Betrag und leert den Fehler. |
