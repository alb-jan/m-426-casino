# Feature: 3D-Roulettekessel (`feature/roulette-3d-wheel`)

**User Story:** US-12 · **Sprint:** 4 · **Story Points:** 8 · **Basis:** `feature/roulette-table`

## 1. Planung

### Ziel
Der in Blender modellierte Kessel (`RouletteRad.blend` → Export `RouletteRad.glb`) wird mit **three.js** im Browser
gerendert. Beim Drehen läuft die Kugel gegen die Drehrichtung auf der Bahn, verliert Tempo, fällt in den Kranz,
springt kurz und bleibt **genau im Fach der Gewinnzahl** liegen. Erst danach wird die Runde ausgewertet.
Vorlage ist die 3D-Bühne `wheel-stage.js` aus dem Design-Zip (Licht, Kamera, 4 Phasen der Kugel, Maus-Drag).

### Analyse des Modells (GLB)
| Knoten | Inhalt | Verwendung |
|---|---|---|
| `Rotor` (Gruppe: Cone, Frets, NumberRing, Numbers, Pockets, Turret) | drehender Teil | `rotation.y` animieren |
| `Ball` | Kugel (Radius 0.0105) | Position pro Frame setzen |
| `Bowl` | fester Kessel mit Kugelbahn | statisch |

Vermessung der Geometrie (Skript über die GLB-Vertexdaten):
- Kugelbahn: Radius ≈ 0.365, Höhe Kugelmitte ≈ 0.106 · Fächer: Radius ≈ 0.192, Höhe ≈ 0.037.
- Grünes Fach (0) liegt auf der +x-Achse. Aus den Schwerpunkten der roten (−85.1°) und schwarzen (−94.9°) Fächer folgt:
  **Fach k (Index in `WHEEL_ORDER`) liegt bei `atan2(x, z) = 90° − k · 360°/37`**.

### Umzusetzende Funktionen

| Datei → Funktion | Inhalt | Aufbau |
|---|---|---|
| `lib/roulette/wheelMath.ts` → `pocketAngle(index)` | Winkel eines Fachs im Rotor-Koordinatensystem | `π/2 − index · 2π/37` |
| `wheelMath.ts` → `numberAt(rotor, ballAngle)` | Welche Zahl liegt unter der Kugel? (Umkehrfunktion, für Tests) | Runden auf das nächste Fach |
| `wheelMath.ts` → `planSpin(num, rotorStart, opts)` | Plan einer Drehung | Endwinkel von Rotor und Kugel so wählen, dass die Kugel im Zielfach landet |
| `wheelMath.ts` → `sampleSpin(plan, t)` | Zustand zum Zeitpunkt t ∈ [0,1] | 4 Phasen: Bahn → Auslauf → Abwurf mit Prellsprung → Mitlauf im Fach |
| `components/roulette3d/webgl.ts` → `isWebGLAvailable()` | Browser-Check | Canvas `getContext("webgl2"/"webgl")` |
| `components/roulette3d/wheelScene.ts` → `createWheelScene(el, url)` | three.js-Szene | Renderer, Studio-Licht, Schattenfänger, GLB laden, Renderloop, Maus-Drag, Kamerafahrten; API `spinTo(num, ms)` → Promise, `dispose()` |
| `components/roulette3d/RouletteWheel3D.tsx` | React-Hülle | lädt die Szene per dynamischem `import()` (kein SSR, eigener Chunk); Fallback ohne WebGL; ruft `onSpinEnd` |
| `RouletteScreen` | Einbindung | Bühne (340 px) oben in der linken Spalte; Auswertung erst am Ende der Animation (`spinDuration: null`) |

### Akzeptanzkriterien
- Für **jede** Zahl 0–36 liegt die Kugel am Ende der Animation im richtigen Fach (`numberAt` = Gewinnzahl).
- Die Kugelbewegung ist stetig (keine Sprünge) und endet auf Fachhöhe.
- Ohne WebGL (z. B. alte Geräte, Tests) erscheint ein Ersatz-Kessel und das Spiel funktioniert weiter.
- Die Szene wird beim Verlassen des Tisches vollständig freigegeben (`dispose`).

## 2. Tests (Red)

| Testdatei | Fälle |
|---|---|
| `lib/roulette/wheelMath.test.ts` | Fachwinkel, `numberAt` (auch mit gedrehtem Rotor), Start auf der Bahn, **Landung im richtigen Fach für alle 37 Zahlen** (`it.each`), gegenläufige Umdrehungen, Stetigkeit über 600 Samples, Radius nimmt monoton ab, Endwinkel |
| `components/roulette3d/RouletteWheel3D.test.tsx` | Szene wird mit Container + Modell-URL erzeugt, `spinTo(17, 5000)` + `onSpinEnd`, `dispose` beim Unmount, Fallback ohne WebGL (inkl. Timer), Fallback bei Ladefehler |
| `components/screens/roulette/RouletteScreen3D.test.tsx` | Bühne im Roulettetisch sichtbar; Auswertung erst am Ende der Kessel-Animation (nicht vorher) |

three.js selbst wird in den Komponententests **gemockt** (`vi.mock("./wheelScene")`, `vi.mock("./webgl")`), da jsdom kein WebGL hat.
Die gesamte Bewegungslogik liegt deshalb in der reinen, voll testbaren Datei `wheelMath.ts`.
Test-Infrastruktur: `HTMLCanvasElement.prototype.getContext` liefert in `vitest.setup.ts` still `null`.

**Ergebnis Red-Phase:** 3 Testdateien rot. ✔
