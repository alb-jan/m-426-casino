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

## 3. Umsetzung (Green)

- **`wheelMath.ts`**: Der Plan legt den Endwinkel so fest, dass beim Einrasten (t = 0.84) die Kugel exakt über dem Zielfach
  des (weiterdrehenden) Rotors steht; der Startwinkel der Kugel liegt `ballTurns` volle Umdrehungen davor (gegenläufig).
  Danach läuft die Kugel mit dem Rotor mit – dadurch ist das Ergebnis mathematisch garantiert und nicht vom Zufall der Animation abhängig.
  Phasen wie in `wheel-stage.js`: Bahn (0–45 %), Auslauf (45–68 %), Abwurf mit Prellsprung (68–84 %), Mitlauf (84–100 %).
- **`wheelScene.ts`** (three.js, ohne React): Renderer mit Schatten, ACES-Tonemapping, Studio-Licht aus `wheel-stage.js`,
  GLB über `GLTFLoader`, Knoten `Rotor`/`Ball` per Namen. Im Ruhezustand dreht der Kessel langsam weiter und die Kugel liegt im letzten Fach.
  Nach der Drehung fährt die Kamera in die Draufsicht, beim nächsten Wurf zurück. Maus-Drag (linke Taste) dreht die Ansicht mit Nachlauf.
  `dispose()` gibt Geometrien, Materialien, Renderer, Listener und ResizeObserver frei.
- **`RouletteWheel3D.tsx`**: lädt `wheelScene` per `import()` erst im Browser → three.js landet in einem eigenen Chunk und wird
  nie serverseitig ausgeführt. Status `loading` / `ready` / `fallback`; ohne WebGL oder bei Ladefehler dreht ein CSS-Ersatz-Kessel 2.2 s.
- **Einbindung:** `RouletteScreen` nutzt `useRoulette({ spinDuration: null })` → die Runde wird erst ausgewertet, wenn `onSpinEnd`
  der 3D-Bühne kommt. `finishSpin` ist idempotent (Timer und Kessel könnten beide melden).
- Modell: `public/models/roulette-wheel.glb` (Export aus Blender), Quelldatei `assets/blender/RouletteRad.blend`.

**Ergebnis Green-Phase:** 108/108 Tests grün, Typecheck und Lint fehlerfrei.

## 4. Probleme & Lösungen

| Problem | Lösung |
|---|---|
| In welche Richtung sind die Zahlen im Blender-Modell angeordnet? Eine falsche Richtung würde die Kugel im falschen Fach landen lassen. | GLB-Binärdaten per Node-Skript ausgewertet: Schwerpunkte der roten/schwarzen Fächer ergeben die Richtung (`90° − k·360°/37`). **Gegenprobe:** Die Breite der Zahlen-Glyphen je Fach – alle einstelligen Zahlen (≤ 2.01°) liegen exakt in den vorhergesagten Fächern, alle zweistelligen sind ≥ 3.98° breit. |
| Radius/Höhe von Kugelbahn und Fächern waren unbekannt. | Vertices von `Bowl` und `Pockets` nach Radius gruppiert und die Oberflächenhöhe gemessen (Bahn r≈0.365, Fach r≈0.192). |
| jsdom hat kein WebGL; three.js lässt sich in Unit-Tests nicht rendern. | Bewegungslogik in reine Funktionen ausgelagert (44 Tests), three.js-Modul in Komponententests gemockt, `getContext` im Test-Setup gestubbt. |
| Bei der Kombination Timer + 3D-Ende könnte die Runde doppelt ausgewertet werden. | `finishSpin` prüft/leert den eingefrorenen Spin im Ref → idempotent. |
| `next dev` (Next 16) erzeugt automatisch `AGENTS.md` und `CLAUDE.md` im Projekt. | Nicht Teil des Features → nicht committet (lässt sich mit `agentRules: false` in `next.config.ts` abschalten). |
| Visuelle Kontrolle im Feature-Branch nicht möglich, da Landing/Kauf/Lobby in parallelen Branches liegen. | Visuelle Abnahme erfolgt nach der Integration im `dev`-Branch (siehe `dev-integration.md`). |

## 5. Bugfix aus der Integration (Iteration 2)

**Befund (visuelle Abnahme im `dev`-Branch, Headless-Chrome-Screenshots):** Kessel, Zahlenkranz, Kugel und Kamerafahrt
funktionieren; der Mahagoni-Kessel und die Kugelbahn erscheinen aber fast **weiss**.

**Ursache:** Die Materialien `Mahogany` und `BallTrack` verwenden in Blender prozedurale Holz-Texturen. Der glTF-Exporter kann
prozedurale Node-Setups nicht exportieren → im GLB fehlt `baseColorFactor` → three.js nimmt Weiss.

**Test zuerst (Red):** `components/roulette3d/materials.test.ts` – `applyMaterialOverrides` färbt nur diese zwei Materialien ein.

**Lösung (Green):** `components/roulette3d/materials.ts` mit `MATERIAL_OVERRIDES` (Mahagoni `#4A2412`, Bahn `#6E3F1C`);
`wheelScene` ruft `applyMaterialOverrides` beim Laden für jedes Mesh-Material auf. Alle anderen Materialien (Messing,
Fächer, Zahlen, Kugel) kommen korrekt aus Blender und bleiben unverändert. → 110/110 Tests grün.

**Alternative (verworfen):** Holz-Textur in Blender backen und als Bild ins GLB exportieren – mehr Dateigrösse und ohne
Blender-Zugriff im Build nicht reproduzierbar. Die Farbkorrektur ist dokumentiert und leicht rückgängig zu machen.

## 6. Änderungswunsch (Iteration 3): Zoomen mit dem Mausrad

**Wunsch Product Owner:** Im 3D-Modell soll man mit dem Mausrad hinein- und herauszoomen können.

**Planung:** Reine Funktion `zoomDistance(dist, deltaY)` in `components/roulette3d/camera.ts` (exponentiell, damit Zoom
in beide Richtungen symmetrisch ist und Trackpads mit kleinen `deltaY` weich zoomen), begrenzt auf `ZOOM_MIN`/`ZOOM_MAX`.
`wheelScene` hört auf `wheel` am Canvas (`passive: false` + `preventDefault`, damit die Seite dabei nicht scrollt).

**Tests (Red):** `camera.test.ts` (Richtung, Symmetrie, Grenzen) und Hinweistext „Ziehen zum Drehen · Mausrad zum Zoomen“
in `RouletteWheel3D.test.tsx` → rot.

**Umsetzung (Green):** `camera.ts` mit `zoomDistance` (Faktor `e^(deltaY · 0.0012)`, Grenzen 0.6 – 2.6; Start 1.48).
`wheelScene` registriert/entfernt den `wheel`-Listener; Kamerafahrten (Tisch ↔ Draufsicht) ändern nur den Neigungswinkel,
der gewählte Zoom bleibt also erhalten. Hinweis auf der Bühne: „Ziehen zum Drehen · Mausrad zum Zoomen“. → 113/113 Tests grün.

## Bugfix (Iteration 3): Animationen liefen nicht

**Befund:** Im Browser lief keine Animation aus `components/roulette3d/RouletteWheel3D.module.css` (`crestSpin`). CSS Modules benennen Animationsnamen lokal um,
die `@keyframes` lagen aber nur global in `globals.css` (Details: `feature-project-setup.md`, Abschnitt 5).

**Test (Red):** `components/roulette3d/animations.test.ts` prüft mit `missingKeyframesIn`, dass jede verwendete Animation im selben Modul
definiert ist → rot.
