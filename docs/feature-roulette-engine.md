> Aktualisierung 29.10.2026: Dieses Dokument enthält historische Entwicklungsnotizen. Den aktuellen Vertrag und die belegten Änderungen beschreibt [release-improvement.md](release-improvement.md). Insbesondere Observer, Navigation, Roulette-State und Poker-Presenter wurden überarbeitet.

# Feature: Roulette-Spiellogik (`feature/roulette-engine`)

**User Story:** US-10 · **Sprint:** 4 · **Story Points:** 5 · **Basis:** `feature/chips-wallet`

## 1. Planung

### Ziel
Die Regeln des europäischen Roulettes (37 Fächer, eine Null) als reine Funktionen:
Farben, Tableau-Anordnung, Kesselreihenfolge, Einsätze verwalten, Auszahlung berechnen und Ergebnistexte erzeugen.

### Einsätze und Quoten

| Einsatz-Schlüssel | Bedeutung | Auszahlung (inkl. Einsatz) | Quote |
|---|---|---|---|
| `n:0` … `n:36` | Einzelzahl (Plein) | 36 × | 35 : 1 |
| `d1` / `d2` / `d3` | 1.–3. Dutzend (1–12, 13–24, 25–36) | 3 × | 2 : 1 |
| `red` / `black` | Rot / Schwarz | 2 × | 1 : 1 |
| `even` / `odd` | Gerade / Ungerade | 2 × | 1 : 1 |
| `low` / `high` | 1–18 / 19–36 | 2 × | 1 : 1 |

Bei **Zéro (0)** verlieren alle Aussen-Einsätze; nur ein Einsatz direkt auf 0 gewinnt.

### Umzusetzende Funktionen

| Datei → Funktion | Inhalt | Aufbau |
|---|---|---|
| `lib/roulette/rules.ts` → `WHEEL_ORDER` | Fächer im Uhrzeigersinn: 0, 32, 15, 19, 4, … 26 | Konstante (auch für den 3D-Kessel) |
| `rules.ts` → `RED`, `numberColor(n)`, `colorName(n)`, `numberBg(n)` | Farben der Zahlen | `Set` der roten Zahlen |
| `rules.ts` → `GRID` | Tableau 3 Reihen × 12 Spalten (oben 3, 6, 9 …) | Konstante aus dem Prototyp |
| `rules.ts` → `placeBet(bets, key, amount)`, `totalBet(bets)` | Einsätze als Objekt `{ key: Jetons }` | unveränderlich |
| `rules.ts` → `payout(num, bets)` | Summe der Auszahlungen | Tabelle oben |
| `rules.ts` → `spinNumber(rng)` | Zufallszahl 0–36 | `floor(rng() × 37)` |
| `rules.ts` → `resolveSpin(num, bets)` | `{ num, out, net, total }` | `net = out − total` |
| `rules.ts` → `spinMessage(result)` | Toast `{ kind, title, msg }` | „Gewonnen!“ / „Runde beendet“ / „Verloren“ |

### Akzeptanzkriterien
- Alle Quoten der Tabelle werden korrekt ausbezahlt, mehrere Einsätze werden summiert.
- Zéro lässt alle Aussen-Einsätze verlieren.
- Der Kessel enthält jede Zahl genau einmal; es gibt 18 rote und 18 schwarze Zahlen.

## 2. Tests (Red)

| Testdatei | Fälle |
|---|---|
| `lib/roulette/rules.test.ts` | Kessel: 37 eindeutige Fächer, Reihenfolge, Rot/Schwarz abwechselnd; Farben/Namen/Hintergründe; Tableau-Anordnung; Einsätze summieren (unveränderlich); Auszahlung Plein/Dutzend/einfache Chancen; Zéro-Regel; Zufallszahl 0–36; Nettogewinn; Toast-Texte für Gewinn, Teilgewinn, Verlust |

**Ergebnis Red-Phase:** Testdatei rot (`./rules` fehlt). ✔

## 3. Umsetzung (Green)

- Einsätze als unveränderliches Objekt `Bets = Partial<Record<BetKey, number>>`; `BetKey` ist ein Template-Literal-Typ
  (`n:${number}` oder Aussen-Einsatz) → Tippfehler bei Schlüsseln fallen schon beim Kompilieren auf.
- `payout` behandelt Plein-Einsätze separat; Aussen-Einsätze über `outsideWins` (Multiplikator 2 bzw. 3) und nur für Zahlen ≠ 0.
- `spinNumber` begrenzt auf 36, falls ein Zufallsgenerator genau 1 liefern sollte.
- `WHEEL_ORDER` wird später vom 3D-Kessel verwendet, um das Zielfach der Kugel zu bestimmen.

**Ergebnis Green-Phase:** 51/51 Tests grün, Typecheck und Lint fehlerfrei.

## 4. Probleme & Lösungen

| Problem | Lösung |
|---|---|
| `Object.entries` liefert `[string, number \| undefined]` – TypeScript verliert den Schlüsseltyp. | Einmaliger Cast auf `[BetKey, number][]` in `payout`; die öffentliche API bleibt typsicher. |
| Der Prototyp nennt „Dutzend / Kolonne 2 : 1“, bietet aber nur Dutzend-Felder an. | Umfang bewusst wie im Design (nur Dutzende); Kolonnen als mögliche Erweiterung im Backlog vermerkt. |
