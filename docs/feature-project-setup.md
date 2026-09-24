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
