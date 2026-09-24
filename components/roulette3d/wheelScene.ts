import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { planSpin, pocketAngle, sampleSpin, BALL_POCKET, type SpinPlan } from "@/lib/roulette/wheelMath";

/**
 * three.js-Bühne für den Blender-Kessel (Portierung von wheel-stage.js aus dem Design).
 * Bewusst ohne React: die Komponente RouletteWheel3D lädt dieses Modul dynamisch.
 */
export interface WheelScene {
  /** Kessel + Kugel auf die Zahl drehen; resolved beim Stillstand der Kugel. */
  spinTo(num: number, durationMs: number): Promise<void>;
  dispose(): void;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const PITCH_TABLE = 0.95;
const PITCH_TOP = 1.42;
const IDLE_SPEED = 0.12; // rad/s – der Kessel dreht im Ruhezustand langsam weiter

export async function createWheelScene(container: HTMLElement, modelUrl: string): Promise<WheelScene> {
  const width = () => container.clientWidth || 600;
  const height = () => container.clientHeight || 340;

  /* ---------- Renderer, Kamera, Licht ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width(), height(), false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width() / height(), 0.01, 50);

  // Studio-Licht: warmes Key, kühles Fill, goldenes Rim von hinten
  const key = new THREE.DirectionalLight(0xfff2d6, 2.1);
  key.position.set(3, 6, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -1;
  key.shadow.camera.right = key.shadow.camera.top = 1;
  const fill = new THREE.DirectionalLight(0xbfd8cd, 0.6);
  fill.position.set(-4, 2, -1);
  const rim = new THREE.DirectionalLight(0xe8b94a, 0.9);
  rim.position.set(-2, 3, -5);
  scene.add(key, fill, rim, new THREE.HemisphereLight(0x9fb8ac, 0x0a1712, 0.55));

  const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.34 }));
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.001;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

  /* ---------- Modell ---------- */
  const gltf = await new GLTFLoader().loadAsync(modelUrl);
  const model = gltf.scene;
  model.traverse((n) => {
    if ((n as THREE.Mesh).isMesh) n.castShadow = n.receiveShadow = true;
  });
  scene.add(model);
  const rotor = model.getObjectByName("Rotor") ?? model;
  const ball = model.getObjectByName("Ball");

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.z) / 2 || 0.41;
  const focusY = size.y * 0.4;

  /* ---------- Kamera (Orbit um die Kesselmitte) ---------- */
  const cam = { pitch: PITCH_TABLE, yaw: 0, dist: radius * 3.6 };
  let camAnim: ((now: number) => void) | null = null;

  const applyCamera = () => {
    const y = Math.sin(cam.pitch) * cam.dist;
    const r = Math.cos(cam.pitch) * cam.dist;
    camera.position.set(Math.sin(cam.yaw) * r, y, Math.cos(cam.yaw) * r);
    camera.lookAt(0, focusY, 0);
  };

  const moveCamera = (pitch: number, ms: number) => {
    const from = cam.pitch;
    const t0 = performance.now();
    camAnim = (now) => {
      const t = clamp((now - t0) / ms, 0, 1);
      cam.pitch = from + (pitch - from) * easeInOut(t);
      if (t >= 1) camAnim = null;
    };
  };

  /* ---------- Maus-Drag (linke Taste) ---------- */
  const drag = { on: false, x: 0, y: 0, vYaw: 0 };
  const el = renderer.domElement;
  el.style.cursor = "grab";
  el.style.touchAction = "none";
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    drag.on = true;
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.vYaw = 0;
    el.style.cursor = "grabbing";
    el.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!drag.on) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.vYaw = dx * 0.006;
    camAnim = null;
    cam.yaw -= dx * 0.006;
    cam.pitch = clamp(cam.pitch + dy * 0.005, 0.25, 1.5);
  };
  const onUp = (e: PointerEvent) => {
    drag.on = false;
    el.style.cursor = "grab";
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  };
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);

  const ro = new ResizeObserver(() => {
    renderer.setSize(width(), height(), false);
    camera.aspect = width() / height();
    camera.updateProjectionMatrix();
  });
  ro.observe(container);

  /* ---------- Kugel ---------- */
  const placeBall = (angle: number, r: number, h: number) => {
    ball?.position.set(Math.sin(angle) * r, h, Math.cos(angle) * r);
  };
  // Ruhezustand: Kugel liegt im Fach der Null und dreht mit dem Rotor
  let ballRel = pocketAngle(0);

  let spin: { plan: SpinPlan; t0: number; ms: number; done: () => void } | null = null;
  let last = performance.now();
  let raf = 0;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (spin) {
      const t = (now - spin.t0) / spin.ms;
      const s = sampleSpin(spin.plan, t);
      rotor.rotation.y = s.rotor;
      placeBall(s.ball.angle, s.ball.radius, s.ball.height);
      if (t >= 1) {
        ballRel = pocketAngle(spin.plan.index);
        const done = spin.done;
        spin = null;
        moveCamera(PITCH_TOP, 1400); // Kamera fährt über den Kessel (Draufsicht)
        done();
      }
    } else {
      rotor.rotation.y += IDLE_SPEED * dt;
      placeBall(ballRel + rotor.rotation.y, BALL_POCKET.radius, BALL_POCKET.height);
    }

    if (camAnim) camAnim(now);
    else if (!drag.on && Math.abs(drag.vYaw) > 0.0002) {
      cam.yaw -= drag.vYaw; // Nachlauf nach dem Ziehen
      drag.vYaw *= 0.93;
    }
    applyCamera();
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  return {
    spinTo(num, durationMs) {
      if (spin) spin.done();
      moveCamera(PITCH_TABLE, 700); // zurück in die Tischperspektive
      return new Promise<void>((resolve) => {
        spin = { plan: planSpin(num, rotor.rotation.y), t0: performance.now(), ms: durationMs, done: resolve };
      });
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      scene.traverse((n) => {
        const mesh = n as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => m.dispose());
      });
      renderer.dispose();
      el.remove();
    },
  };
}
