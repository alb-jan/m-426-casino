# Feature: Kasse / Auszahlung (`feature/cashout`)

**User Story:** US-07 · **Sprint:** 2 · **Story Points:** 2 · **Basis:** `feature/chips-wallet`

## 1. Planung

### Ziel
„Schritt 3 von 3 · Kasse“: Der Spieler sieht, wie viel er eingezahlt und ausbezahlt bekommen hat und
seine Bilanz. Danach kann er eine neue Sitzung starten oder doch weiterspielen.

### Umzusetzende Funktionen

| Funktion / Datei | Inhalt | Aufbau |
|---|---|---|
| `lib/cashout.ts` → `exitStats(bought, cashed)` | Drei Kennzahlen „Eingezahlt“, „Ausgezahlt“, „Bilanz“ | Liste `{ label, value, color }`; Bilanz grün mit `+CHF` bzw. rot mit `−CHF` |
| `components/screens/exit/ExitScreen.tsx` | Kassen-Karte | Titel „Auszahlung“, Dank, 3 Kennzahlen, Buttons „Neue Sitzung starten“ (→ `reset`, Kauf) und „Doch weiterspielen“ (→ Lobby) |
| `CasinoApp` | Bildschirm `exit` verwendet `ExitScreen` | |

### Akzeptanzkriterien
- Eingezahlt CHF 50.00, ausbezahlt CHF 45.50 → Bilanz `−CHF 4.50` (rot).
- Eingezahlt CHF 50.00, ausbezahlt CHF 62.00 → Bilanz `+CHF 12.00` (grün); ausgeglichen `+CHF 0.00`.
- „Neue Sitzung starten“ setzt alles zurück und zeigt den Kaufbildschirm mit Guthaben 0.
- „Doch weiterspielen“ führt zurück in die Lobby.

## 2. Tests (Red)

| Testdatei | Fälle |
|---|---|
| `lib/cashout.test.ts` | Verlust (rot, `−CHF`), Gewinn (grün, `+CHF`), ausgeglichen, Tausendertrennzeichen |
| `components/screens/exit/ExitScreen.test.tsx` | Titel + Kennzahlen, neue Sitzung (Kaufbildschirm, Guthaben 0), weiterspielen (Lobby, Guthaben bleibt) |

**Ergebnis Red-Phase:** 2 Testdateien rot. ✔
