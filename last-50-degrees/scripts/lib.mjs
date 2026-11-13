// Общие утилиты для скриптов: загрузка серий (TS → JS через esbuild) и поиск браузера.
import {build} from 'esbuild';
import {existsSync, mkdirSync, readdirSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Собирает src/episodes/index.ts + timing.ts в временный ESM-файл и импортирует его. */
export async function loadEpisodes() {
  const out = path.join(os.tmpdir(), `l50-episodes-${process.pid}.mjs`);
  const entry = path.join(os.tmpdir(), `l50-entry-${process.pid}.ts`);
  const {writeFileSync} = await import('node:fs');
  writeFileSync(
    entry,
    `export {EPISODES} from ${JSON.stringify(path.join(ROOT, 'src/episodes/index.ts'))};\n` +
      `export {episodeTiming, resolveLines, sceneSeconds} from ${JSON.stringify(path.join(ROOT, 'src/episodes/timing.ts'))};\n`,
  );
  await build({entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'silent'});
  return import(pathToFileURL(out).href);
}

/** Браузер: REMOTION_BROWSER → предустановленный headless-shell → null (Remotion скачает свой). */
export function findBrowser() {
  if (process.env.REMOTION_BROWSER) return process.env.REMOTION_BROWSER;
  const base = '/opt/pw-browsers';
  if (existsSync(base)) {
    for (const d of readdirSync(base)) {
      if (d.startsWith('chromium_headless_shell')) {
        const p = path.join(base, d, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
        if (existsSync(p)) return p;
      }
    }
  }
  return null;
}

export const ensureDir = (p) => {
  mkdirSync(p, {recursive: true});
  return p;
};
