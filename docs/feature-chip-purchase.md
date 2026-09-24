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
