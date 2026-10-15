# Feature: Landingpage (`feature/landing-page`)

**User Story:** US-04 · **Sprint:** 2 · **Story Points:** 2 · **Basis:** `feature/chips-wallet`

## 1. Planung

### Ziel
Der erste Eindruck: ein goldenes Wappen, der Titel „Casino Goldenes Ass“, schwebende Jetons,
drei Feature-Karten und die Schaltfläche „Casino betreten“, die zum Jetons-Kauf führt.

### Umzusetzende Funktionen

| Funktion / Datei | Inhalt | Aufbau |
|---|---|---|
| `components/screens/landing/landingContent.ts` → `LANDING_FEATURES` | Texte der drei Karten (♠ Texas Hold’em, ◉ Europäischer Kessel, ❖ Ein Guthaben) | Konstante |
| `…/landingContent.ts` → `FLOAT_CHIPS` | Position, Grösse, Rotation, Animation der 4 schwebenden Jetons (20, 50, 500, 10) | Konstante aus dem Prototyp |
| `components/screens/landing/LandingScreen.tsx` | Bildschirm | Glow-Hintergrund, Linienraster, Wappen mit rotierenden Ringen (`crestSpin`), Titel mit Gold-Verlauf, CTA, Karten, Fusszeile |
| `LandingScreen.module.css` | Styles 1:1 aus dem Prototyp | inkl. Animationen `rise`, `shimmer`, `floatChip` |
| `CasinoApp` | Bildschirm `landing` verwendet `LandingScreen` | |

### Akzeptanzkriterien
- Titel „Casino Goldenes Ass“ und Untertitel „Poker & Roulette“ sind sichtbar.
- Drei Feature-Karten und vier schwebende Jetons werden angezeigt.
- Klick auf „Casino betreten“ wechselt zum Bildschirm `buy`.

## 2. Tests (Red)

| Testdatei | Fälle |
|---|---|
| `components/screens/landing/LandingScreen.test.tsx` | Titel/Untertitel, 3 Feature-Karten, 4 schwebende Jetons (20/50/500/10), CTA „Casino betreten“ → Kaufbildschirm inkl. Header |

Die Tests rendern die ganze `CasinoApp` (Integrationstest), damit auch der Bildschirmwechsel geprüft wird.

**Ergebnis Red-Phase:** Testdatei rot (`landingContent` fehlt). ✔

## 3. Umsetzung (Green)

- Inhalte (Karten, schwebende Jetons) als Daten in `landingContent.ts`, Darstellung in `LandingScreen.tsx`.
- Schwebende Jetons nutzen die gemeinsame `Chip`-Komponente; Rotation über die CSS-Variable `--r`,
  die in der Keyframe-Animation `floatChip` verwendet wird (wie im Prototyp).
- Wappen: zwei gegenläufig rotierende Ringe (`crestSpin` 26 s / 34 s rückwärts) um ein goldenes Medaillon.
- Gestaffeltes Einblenden via `rise` mit Verzögerungen 0 / .1 / .2 / .3 s.

**Ergebnis Green-Phase:** 43/43 Tests grün, Typecheck und Lint fehlerfrei.

## 4. Probleme & Lösungen

| Problem | Lösung |
|---|---|
| TypeScript kennt die CSS-Variable `--r` im `style`-Objekt nicht. | Style-Objekt als `CSSProperties` casten. |
| Der Hauptbereich soll ohne Header die volle Höhe füllen. | `.main` mit `min-height: 100vh` und `flex: 1`. |

## 5. Änderungswünsche (Iteration 3)

**Wünsche Product Owner:**
- Text „Est. 2026 · Schulprojekt“ über dem Titel entfernen.
- Fusszeile der Startseite („Spielgeld in CHF · Ab 18 · …“) entfernen – wie der Footer auf allen anderen Seiten.
- Überall „Europäischer Kessel“ durch „Roulette“ ersetzen (Feature-Karte und Einleitungstext).

**Geprüft, keine Änderung nötig:**
- Name: Im Design (Titel, Header, Vorschaubild) heisst das Casino „Casino Goldenes Ass“ – so ist es bereits umgesetzt.
- Logo-Animation: Im Design blendet das Wappen mit `rise` ein, und zwei goldene Ringe drehen sich gegenläufig
  (`crestSpin` 26 s bzw. 34 s pro Umdrehung). Ist bereits 1:1 so umgesetzt; im Browser per `getAnimations()` verifiziert (siehe `dev-integration.md`).

**Tests (Red):** `LandingScreen.test.tsx` erwartet: kein „Est. 2026“-Text, keine Fusszeile, Karte „Roulette“, kein „europäische…“ → 3 Fälle rot.

**Umsetzung (Green):** Span `est` und Fusszeile `bottom` inkl. CSS entfernt, Karte und Einleitung auf „Roulette“ umbenannt.
Die Startseite wirkt dadurch ruhiger (Wappen → Titel → Text → Button → Karten). → 44/44 Tests grün.

## Bugfix (Iteration 3): Animationen liefen nicht

**Befund:** Im Browser lief keine Animation aus `components/screens/landing/LandingScreen.module.css` (`rise shimmer crestSpin`). CSS Modules benennen Animationsnamen lokal um,
die `@keyframes` lagen aber nur global in `globals.css` (Details: `feature-project-setup.md`, Abschnitt 5).

**Test (Red):** `components/screens/landing/animations.test.ts` prüft mit `missingKeyframesIn`, dass jede verwendete Animation im selben Modul
definiert ist → rot.

**Umsetzung (Green):** `@keyframes` (rise shimmer crestSpin) direkt in `components/screens/landing/LandingScreen.module.css` definiert → werden gemeinsam mit dem Namen umbenannt
und laufen im Browser. Alle Tests grün.
