"use client";

import { useEffect, useRef, useState } from "react";
import { isWebGLAvailable } from "./webgl";
import styles from "./RouletteWheel3D.module.css";

export const MODEL_URL = "/models/roulette-wheel.glb";
/** Dauer der Ersatz-Animation ohne WebGL (wie der Spinner im Prototyp). */
export const FALLBACK_SPIN_MS = 2200;

export interface WheelSceneHandle { spinTo(target:number,duration:number):Promise<void>; dispose():void }
export type WheelSceneFactory = (element:HTMLElement,modelUrl:string)=>Promise<WheelSceneHandle>;
const defaultSceneFactory:WheelSceneFactory = async(element,url)=>{
  const {createWheelScene}=await import("./wheelScene");
  return createWheelScene(element,url);
};
interface Props {
  sceneFactory?:WheelSceneFactory;
  webglAvailable?:()=>boolean;
  /** Gewinnzahl der laufenden Drehung oder null im Ruhezustand */
  target: number | null;
  /** wird aufgerufen, sobald die Kugel liegen bleibt */
  onSpinEnd: (roundId?: number) => void;
  spinId?: number;
  duration?: number;
}

type Status = "loading" | "ready" | "fallback";

export function RouletteWheel3D({ target, onSpinEnd, duration = 5200, spinId, sceneFactory = defaultSceneFactory, webglAvailable = isWebGLAvailable }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<WheelSceneHandle | null>(null);
  const endRef = useRef(onSpinEnd);
  const spinningFor = useRef<number | null>(null);
  const [status, setStatus] = useState<Status>(() => webglAvailable() ? "loading" : "fallback");

  useEffect(() => {
    endRef.current = onSpinEnd;
  }, [onSpinEnd]);

  // Szene aufbauen: three.js wird erst hier (clientseitig, eigener Chunk) geladen
  useEffect(() => {
    let cancelled = false;
    const el = canvasRef.current;
    const start = async () => {
      if (!el || !webglAvailable()) return;
      const scene = await sceneFactory(el, MODEL_URL);
      if (cancelled) return scene.dispose();
      sceneRef.current = scene;
      setStatus("ready");
    };
    start().catch(() => {
      if (!cancelled) setStatus("fallback");
    });
    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [sceneFactory, webglAvailable]);

  // Drehung starten, sobald eine Gewinnzahl feststeht
  useEffect(() => {
    if (target === null) {
      spinningFor.current = null;
      return;
    }
    const token = spinId ?? target;
    if (spinningFor.current === token) return;
    let cancelled = false;
    const complete = endRef.current;
    if (status === "ready" && sceneRef.current) {
      spinningFor.current = token;
      sceneRef.current.spinTo(target, duration).then(() => { if (!cancelled) complete(spinId); }).catch(() => { if (!cancelled) { spinningFor.current = null; setStatus("fallback"); } });
      return () => { cancelled = true; spinningFor.current = null; };
    } else if (status === "fallback") {
      spinningFor.current = token;
      const t = setTimeout(() => complete(spinId), FALLBACK_SPIN_MS);
      return () => {
        clearTimeout(t);
        spinningFor.current = null;
      };
    }
  }, [target, status, duration, spinId]);

  const spinning = target !== null;

  return (
    <div className={styles.stage} data-testid="wheel-stage">
      <div ref={canvasRef} className={styles.canvas} data-testid="wheel-canvas" />
      {status === "loading" && (
        <div className={styles.overlay}>
          <span className={styles.ring} />
          <span>Kessel wird geladen …</span>
        </div>
      )}
      {status === "fallback" && (
        <div className={styles.overlay} data-testid="wheel-fallback">
          <div className={styles.fallbackWheel} style={{ animationPlayState: spinning ? "running" : "paused" }}>
            <span className={styles.fallbackWood} />
            <span className={styles.fallbackCone} />
          </div>
        </div>
      )}
      {status === "ready" && <div className={styles.hint}>Ziehen zum Drehen · Mausrad zum Zoomen</div>}
    </div>
  );
}
