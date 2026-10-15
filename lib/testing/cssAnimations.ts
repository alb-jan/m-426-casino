import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const KEYWORDS = new Set([
  "none", "infinite", "linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end",
  "normal", "reverse", "alternate", "alternate-reverse", "forwards", "backwards", "both",
  "running", "paused", "initial", "inherit", "unset",
]);

/** Animationsnamen ohne @keyframes in derselben CSS-Datei. */
export function missingKeyframes(css: string): string[] {
  const defined = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
  const used = new Set<string>();
  for (const [, value] of css.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)) {
    for (const part of value.split(",")) {
      const name = part
        .trim()
        .split(/\s+/)
        .find((t) => /^[a-zA-Z_-][\w-]*$/.test(t) && !KEYWORDS.has(t) && !t.startsWith("var"));
      if (name) used.add(name);
    }
  }
  return [...used].filter((n) => !defined.has(n));
}

/** Prüft alle *.module.css eines Ordners rekursiv; nur Dateien mit Fehlern im Ergebnis. */
export function missingKeyframesIn(dir: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const walk = (d: string) => {
    for (const entry of readdirSync(d)) {
      const path = join(d, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (entry.endsWith(".module.css")) {
        const missing = missingKeyframes(readFileSync(path, "utf8"));
        if (missing.length) result[path.replaceAll("\\", "/")] = missing;
      }
    }
  };
  walk(dir);
  return result;
}
