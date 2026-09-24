# Integration: `dev`-Branch

Der Branch `dev` ist **nur lokal** und dient dazu, die ganze App mit allen Features zusammen zu testen.
Er wurde von `main` abgezweigt; `main` selbst wurde nie verändert.

## 1. Merge-Reihenfolge

Alle Features wurden mit `git merge --no-ff` gemerged, damit jedes Feature als eigener Merge-Commit in der Historie sichtbar bleibt.

| # | Branch | Sprint | Konflikte |
|---|---|---|---|
| 1 | feature/project-setup | 1 | – |
| 2 | feature/notifications | 1 | – |
| 3 | feature/chips-wallet | 1 | – |
| 4 | feature/landing-page | 2 | – |
| 5 | feature/chip-purchase | 2 | `components/CasinoApp.tsx` (Imports) |
| 6 | feature/lobby | 2 | `components/CasinoApp.tsx` (Imports) |
| 7 | feature/cashout | 2 | `components/CasinoApp.tsx` (Imports) |
| 8 | feature/poker-engine | 3 | – |
| 9 | feature/poker-table | 3 | `components/CasinoApp.tsx` (Imports) |
| 10 | feature/roulette-engine | 4 | – |
| 11 | feature/roulette-table | 4 | `components/CasinoApp.tsx` (Imports) |
| 12 | feature/roulette-3d-wheel | 4 | – |
| 13 | feature/poker-table (Bugfix Iteration 2) | Review | – |
| 14 | feature/roulette-3d-wheel (Bugfix Iteration 2) | Review | – |

### Konfliktlösung
Die Sprint-2- bis Sprint-4-Bildschirme wurden parallel von `feature/chips-wallet` abgezweigt. Jeder Branch ersetzt in
`CasinoApp.tsx` einen anderen Platzhalter durch seinen Bildschirm und fügt **eine Import-Zeile an derselben Stelle** ein.
Git erkennt das als Konflikt, obwohl sich die Änderungen fachlich nicht widersprechen.

**Lösung:** In allen 5 Fällen bestand der Konflikt ausschliesslich aus Import-Zeilen → beide Seiten übernommen und
alphabetisch sortiert (kleines Skript, das nur reine Import-Konflikte automatisch löst und bei allen anderen abbricht).
Die `switch`-Fälle für die Bildschirme mergten ohne Konflikt, da jeder Branch eine andere Zeile geändert hat.
Nach der Integration war die Platzhalter-Komponente unbenutzt und wurde in `dev` entfernt (`chore(dev)`-Commit).

## 2. Integrationstest

| Prüfung | Ergebnis |
|---|---|
| `npm test` | **31 Testdateien, 218 Tests grün** |
| `npx tsc --noEmit` | keine Fehler |
| `npm run lint` | keine Fehler, keine Warnungen |
| `next build` (Produktion) | erfolgreich, Seite `/` statisch vorgerendert |
| Durchklick im echten Browser (Headless Chrome mit WebGL/SwiftShader) | Landing → Kauf (CHF 100) → Lobby → Roulette (3D-Drehung) → Lobby → Poker (ganze Hand) → Kasse ✔ |

Die Screenshots wurden mit einem Puppeteer-Skript erstellt (Viewport 1440 × 980 wie im Design-Prototyp) und mit dem Design verglichen.

## 3. Sprint-Review: gefundene Fehler (Iteration 2)

| Fehler | Gefunden durch | Behoben in | Vorgehen |
|---|---|---|---|
| Blind-Jetons blieben im Entwicklungsmodus an den Plätzen stehen | Screenshot + Auslesen der Jeton-Positionen im Browser | `feature/poker-table` | Regressionstest in `<StrictMode>` (rot) → idempotenter Effekt (grün) → erneut in `dev` gemerged |
| 3D-Kessel aus Holz erschien weiss | Screenshot | `feature/roulette-3d-wheel` | Test für Material-Korrektur (rot) → Holzfarben gesetzt (grün) → erneut in `dev` gemerged |

Bugs wurden bewusst **auf dem Feature-Branch** behoben (nicht direkt in `dev`), damit jeder Feature-Branch für sich korrekt bleibt.
Die visuelle Kontrolle des 3D-Kessels bestätigte ausserdem: Die Kugel liegt nach der Drehung im Fach der angezeigten Gewinnzahl
(Stichprobe: 26 → Kugel im schwarzen Fach zwischen 3 und 0).

## 4. Retrospektiven

### Sprint 1 – Fundament
- 👍 Reine Logik (`lib/`) getrennt von React → sehr schnelle, stabile Tests.
- 👍 Observer-Event-Bus: Spiele kennen die Toast-Komponente nicht.
- 👎 Locale-Formatierung von Node und Browser unterscheidet sich → früh erkannt dank Tests.
- 🔁 Massnahme: Formatierung immer selbst implementieren, nie auf `toLocaleString` für sichtbare Texte verlassen.

### Sprint 2 – Casino-Rahmen
- 👍 Integrationstests über die ganze `CasinoApp` prüfen auch den Bildschirmwechsel.
- 👎 Paralleles Arbeiten an derselben Datei (`CasinoApp.tsx`) führt zu vorhersehbaren Merge-Konflikten.
- 🔁 Massnahme: Für ein grösseres Projekt eine Bildschirm-Registry (je Feature eine eigene Datei) verwenden.

### Sprint 3 – Poker
- 👍 Deck-Injektion (`rigDeck`) und Zufalls-Injektion machen selbst komplexe Showdowns und Bot-Verhalten deterministisch testbar.
- 👍 Abweichung vom Prototyp (Restjeton-Regel) durch Test aufgedeckt und korrigiert.
- 👎 Timer-basierte UI-Tests brauchen Sorgfalt (Toast-Lebensdauer, schrittweises Vorspulen).
- 🔁 Massnahme: Animations-Effekte zusätzlich im StrictMode testen (siehe Bugfix).

### Sprint 4 – Roulette
- 👍 Die Kesselmathematik ist unabhängig von three.js → für alle 37 Zahlen bewiesen, dass die Kugel richtig landet.
- 👍 Analyse der GLB-Binärdaten statt Raten der Orientierung.
- 👎 Prozedurale Blender-Materialien gehen beim glTF-Export verloren – erst im Browser sichtbar.
- 🔁 Massnahme: Visuelle Abnahme im Browser als festen Bestandteil der Definition of Done aufnehmen.

## 5. Product Backlog – Stand

| ID | Status |
|---|---|
| US-01 bis US-12 | ✅ Done |

### Neue Einträge für spätere Sprints
| ID | User Story | Prio |
|---|---|---|
| US-13 | Als Spieler möchte ich auf Kolonnen (2 : 1) setzen können (im Design in der Legende erwähnt, aber ohne Felder). | 3 |
| US-14 | Als Spieler möchte ich, dass mein Guthaben ein Neuladen der Seite übersteht (z. B. `localStorage`). | 3 |
| US-15 | Favicon für die App (derzeit 404 auf `/favicon.ico`). | 4 |
