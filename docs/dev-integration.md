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

## 6. Iteration 3 – Änderungswünsche des Product Owners

| Wunsch | Ergebnis | Branch |
|---|---|---|
| Name wie im Design | Geprüft: Design heisst „Casino Goldenes Ass“ (Titel, Header, Vorschaubild) – war bereits korrekt, keine Änderung | – |
| Logo auf der Startseite animiert wie im Design | Animation war im Code vorhanden, lief aber nicht (siehe Bugfix unten) → behoben | landing-page |
| Footer auf allen Seiten entfernen | Footer-Komponente gelöscht, Fusszeile der Startseite entfernt | chips-wallet, landing-page |
| „Est. 2026 · Schulprojekt“ entfernen | entfernt | landing-page |
| „Europäischer Kessel“ → „Roulette“ | Startseite (Karte + Text), Lobby, Roulette-Titel | landing-page, lobby, roulette-table |
| Zoomen mit dem Mausrad im 3D-Kessel | `zoomDistance` + `wheel`-Listener, Grenzen 0.6 – 2.1, Seite scrollt nicht mit | roulette-3d-wheel |
| Betragsfeld „schöner und cleaner“ | Platzhalter `0.00` dezent, Einheit nur einmal (`CHF`), Gold-Fokusrahmen | chip-purchase |

Alle Wünsche wurden testgetrieben auf dem jeweiligen Feature-Branch umgesetzt (Test → Umsetzung → Doku) und danach in `dev` gemerged.
Keine Merge-Konflikte.

### Bugfix: CSS-Animationen liefen nicht

Bei der Prüfung der Logo-Animation zeigte `document.getAnimations()` im Browser nur die Inline-Animationen (schwebende Jetons).
**Ursache:** CSS Modules benennen Animationsnamen lokal um (`crestSpin` → `LandingScreen-module__…__crestSpin`), die
`@keyframes` lagen aber global in `globals.css`. Betroffen waren auch Toasts, Poker-Ergebnis-Overlay, Roulette-Spinner,
Gewinnzahl-Glow und der 3D-Ladering.

**Vorgehen:** Prüfhilfe `missingKeyframesIn` in `feature/project-setup` (mit eigenen Tests), dann in jedem betroffenen Branch
(`notifications`, `landing-page`, `poker-table`, `roulette-table`, `roulette-3d-wheel`) Basis nachgezogen, roter Test für den
eigenen Ordner, `@keyframes` lokal im Modul definiert → grün. **Nachweis im Browser:** Logo-Ringe drehen (26 s / 34 s),
`rise`-Einblendungen und `shimmer` laufen.

### Integrationstest Iteration 3

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 38 Testdateien, 235 Tests grün |
| `tsc --noEmit`, `npm run lint` | fehlerfrei |
| `next build` | erfolgreich |
| Browser (Headless Chrome) | kein Footer auf allen Seiten, Animationen laufen, Zoom rein/raus funktioniert ohne Seiten-Scroll |

### Retrospektive Iteration 3
- 👎 Unit-Tests in jsdom konnten nicht erkennen, dass CSS-Animationen nie liefen – erst die Abnahme im echten Browser.
- 👍 Der Fehler wurde in eine **automatisch prüfbare Regel** übersetzt, damit er nicht wiederkommt.
- 👎 Lokale Testumgebung: Unter deutschem Windows lautet der Port-Status `ABHÖREN` und `grep` hielt die Ausgabe wegen des
  Umlauts für binär → ein alter Server lief unbemerkt weiter und lieferte veraltete Seiten. Lösung: `grep -a`.

## 7. Iteration 4 – Stärkere Poker-Bots

**Auslöser:** Der Product Owner gewann beim Poker fast immer. Analyse per Simulation: Mit grossen Einsätzen gewann man 89 % der Hände,
weil die Bots ihre Hände unterschätzten und zu oft passten. Danach Research zu Poker in Online-Casinos und zu Poker-KIs
(Zusammenfassung in `feature-poker-engine.md`, Abschnitt 5).

| Branch | Änderung |
|---|---|
| `feature/poker-engine` | Monte-Carlo-Equity, Pot-Odds-Regel, Wert-Einsätze/Re-Raises, dosierte Bluffs, Gegnermodell, Abnahme-Simulation als Test |
| `feature/poker-table` | Spielerprofil wird über die Hände geführt und an die Bots übergeben |

Merge in `dev` ohne Konflikte. **Integrationstest:** 43 Testdateien, 258 Tests grün; Typecheck, Lint, Build fehlerfrei.

**Browser-Test (Headless Chrome, 8 Hände nur All-In):** keine Fehler; die Bots gehen jetzt mit guten Händen gegen All-Ins mit
(Showdowns statt kampfloser Siege). Der Testlauf endete zufällig im Plus – daher zusätzlich eine Sitzungs-Simulation mit
mitgenommenen Stacks (40 Sitzungen à 30 Hände):

| Spielweise | pleite | Ø pro Sitzung |
|---|---|---|
| immer All-In | 38 / 40 | −93 |
| immer Pot-gross | 40 / 40 | −1000 |
| vernünftig | 15 / 40 | −70 |

**Offener Punkt (Entscheid Product Owner):** Bots, die pleite gehen, werden wie im Design-Prototyp gratis auf 600 Jetons aufgefüllt.
Dadurch kann eine seltene Glückssträhne lawinenartig wachsen (in den 2 von 40 gewonnenen All-In-Sitzungen). Mögliche Alternative:
Bots ohne Jetons verlassen den Tisch und werden erst später ersetzt.
