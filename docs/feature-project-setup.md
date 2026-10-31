> Aktualisierung 29.10.2026: Dieses Dokument enthält historische Entwicklungsnotizen. Den aktuellen Vertrag und die belegten Änderungen beschreibt [release-improvement.md](release-improvement.md). Insbesondere Observer, Navigation, Roulette-State und Poker-Presenter wurden überarbeitet.

# Feature: Projekt-Setup (`feature/project-setup`)

**User Story:** US-01 · **Sprint:** 1 · **Story Points:** 3

## 1. Planung

### Ziel
Ein Fundament schaffen, auf dem alle weiteren Features testgetrieben entwickelt werden:
Test-Framework, gemeinsame Formatierungsfunktionen, Design-Tokens aus dem Prototyp
und das globale Layout (Schriften, Hintergrund, Animationen).

### Umzusetzende Funktionen

| Funktion / Datei | Inhalt | Aufbau |
|---|---|---|
| `vitest.config.mts` | Test-Runner-Konfiguration | Vitest + `@vitejs/plugin-react`, Umgebung `jsdom`, Pfad-Alias `@/` |
| `vitest.setup.ts` | Globales Test-Setup | `@testing-library/jest-dom`-Matcher, automatisches `cleanup`, Mock für `next/font/google` |
| `lib/format.ts` → `formatNumber(n)` | Ganzzahl im Schweizer Format (`1’000`) | `Math.round` + `toLocaleString('de-CH')` |
| `lib/format.ts` → `formatChf(n)` | Frankenbetrag mit 2 Nachkommastellen (`12.50`) | `toLocaleString('de-CH', {min/max 2 Stellen})` |
| `lib/format.ts` → `formatSigned(n)` | Gewinn/Verlust mit Vorzeichen (`+50`, `−50`, `±0`) | echtes Minuszeichen `−` wie im Design |
| `lib/theme.ts` → `COLORS` | Farb-Tokens des Designs (Gold, Grün, Text, Rot …) | konstantes Objekt, damit Komponenten keine „magischen“ Hex-Werte streuen |
| `app/fonts.ts` | Schriften Cormorant Garamond, Manrope, IBM Plex Mono | `next/font/google` mit CSS-Variablen |
| `app/layout.tsx` | Root-Layout, Metadaten „Casino Goldenes Ass“ | Schrift-Variablen am `<html>` |
| `app/globals.css` | Hintergrund-Verlauf, Keyframes (`rise`, `shimmer`, `floatChip`, `crestSpin`, `toastIn`, `panelIn`, `seatPulse`) | 1:1 aus dem `<helmet>` des Prototyps |

### Akzeptanzkriterien
- `npm test` führt Tests mit Vitest in einer DOM-Umgebung aus.
- `formatNumber(1000)` liefert `1’000`, `formatNumber(12.6)` liefert `13`.
- `formatChf(12.5)` liefert `12.50`, `formatChf(1000)` liefert `1’000.00`.
- `formatSigned(50)` → `+50`, `formatSigned(-50)` → `−50`, `formatSigned(0)` → `±0`.
- Die Metadaten der App tragen den Titel „Casino Goldenes Ass“.

## 2. Tests (Red)

Geschrieben **vor** der Umsetzung, Commit `test(setup): ...`.

| Testdatei | Getestete Einheit | Fälle |
|---|---|---|
| `lib/format.test.ts` | `formatNumber`, `formatChf`, `formatSigned` | Tausendertrennzeichen `’`, Rundung, 2 Nachkommastellen, Vorzeichen `+`/`−`/`±` |
| `lib/theme.test.ts` | `COLORS` | Hauptfarben entsprechen dem Prototyp |
| `app/layout.test.tsx` | `metadata`, `fontVariables` | Titel „Casino Goldenes Ass“, alle drei Schriften als CSS-Variablen |

Test-Infrastruktur im selben Commit: `vitest.config.mts`, `vitest.setup.ts`, npm-Skripte `test`, `test:watch`, `typecheck`.

**Ergebnis Red-Phase:** `npm test` → 3 von 3 Testdateien schlagen fehl
(`Failed to resolve import "./format"` usw.), da die Module noch nicht existieren. ✔ erwartet.

## 3. Umsetzung (Green)

- `lib/format.ts`: eigene Gruppierung der Tausender mit `’` per Regex, `toFixed(2)` für Franken.
- `lib/theme.ts`: alle im Prototyp verwendeten Farben als `COLORS`, dazu `GOLD_GRADIENT` für die Gold-Buttons.
- `app/fonts.ts`: drei Google-Schriften über `next/font/google` (selbst gehostet, kein Layout-Shift); `fontVariables` wird am `<html>` gesetzt.
- `app/globals.css`: Grundstile und alle Keyframes aus dem `<helmet>` des Prototyps; Utility-Klassen `.serif` und `.mono`.
- `app/layout.tsx`: Titel „Casino Goldenes Ass“, `lang="de"`.

**Ergebnis Green-Phase:** `npm test` → 7/7 Tests grün, `tsc --noEmit` und `eslint` ohne Fehler.

## 4. Probleme & Lösungen

| Problem | Ursache | Lösung |
|---|---|---|
| `formatNumber(1000)` lieferte `1'000` statt `1’000` (3 Tests rot) | Die ICU-Daten von Node formatieren `de-CH` mit ASCII-Apostroph, Chrome mit typografischem `’`. Server- und Client-Rendering würden sich unterscheiden (Hydration-Mismatch). | Tausendertrennzeichen selbst setzen (Regex `\B(?=(\d{3})+(?!\d))`), unabhängig von der Laufzeitumgebung. |
| `next/font/google` lässt sich in Vitest nicht ausführen | Die Funktion wird zur Build-Zeit vom Next-Compiler ersetzt. | Globaler Mock in `vitest.setup.ts`, der `className`/`variable` zurückgibt. |
| CRLF-Warnungen beim Commit | Windows mit `core.autocrlf=true` | unkritisch, Git normalisiert die Zeilenenden. |

## 5. Qualitätsregel (Iteration 3): Animationen in CSS-Modulen

**Befund:** Bei der Abnahme der Logo-Animation lief im Browser keine einzige Animation aus einem `.module.css`
(`document.getAnimations()` zeigte nur die Inline-Animationen). Ursache: CSS Modules benennen auch Animationsnamen lokal um
(`crestSpin` → `LandingScreen-module__…__crestSpin`), die `@keyframes` lagen aber global in `globals.css` → kein Treffer.

**Regel:** Jedes CSS-Modul definiert die `@keyframes`, die es verwendet, selbst (dann werden Name und Keyframes gleich umbenannt).

**Prüfhilfe (TDD):** `lib/testing/cssAnimations.ts`
- `missingKeyframes(css)` – liefert alle in `animation` / `animation-name` verwendeten Namen ohne `@keyframes` in derselben Datei
  (Schlüsselwörter, Zeiten und `var()` werden ignoriert).
- `missingKeyframesIn(ordner)` – prüft alle `*.module.css` eines Ordners rekursiv; Ergebnis `{ datei: [namen] }`.

**Test (Red):** `lib/testing/cssAnimations.test.ts` → rot (Modul fehlt).

**Umsetzung (Green):** Regex-basierte Prüfung, rekursiver Ordner-Scan. → 10/10 Tests grün. Die betroffenen Feature-Branches
übernehmen diesen Stand per `git merge feature/project-setup` und prüfen ihren eigenen Ordner.
