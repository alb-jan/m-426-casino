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
