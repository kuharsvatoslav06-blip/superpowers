#!/usr/bin/env node
/**
 * Рендер серий.
 *   node scripts/render.mjs ep01            — одна серия → out/ep01.mp4
 *   node scripts/render.mjs ep01 ep03       — несколько
 *   node scripts/render.mjs all             — все 10 серий
 *   node scripts/render.mjs still ep01      — контрольные стоп-кадры по каждой сцене → out/stills/
 *   node scripts/render.mjs still ep01 120 900   — стоп-кадры по номерам кадров
 * Опции: --concurrency=N  --crf=20
 */
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {ROOT, ensureDir, findBrowser, loadEpisodes} from './lib.mjs';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const opts = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => a.replace(/^--/, '').split('=')));
const pos = args.filter((a) => !a.startsWith('--'));
const stillMode = pos[0] === 'still';
if (stillMode) pos.shift();

// заглушки аудио (если ещё не созданы) и актуальный список аудиофайлов (озвучка / музыка / эффекты)
execFileSync('node', [path.join(ROOT, 'scripts/make-placeholder-audio.mjs'), '--if-missing'], {stdio: 'inherit'});
execFileSync('node', [path.join(ROOT, 'scripts/check-assets.mjs'), '--quiet'], {stdio: 'inherit'});

const {EPISODES, episodeTiming} = await loadEpisodes();
const ids = pos.length === 0 ? [] : pos[0] === 'all' ? EPISODES.map((e) => e.id) : pos.filter((p) => /^ep\d+$/.test(p));
if (ids.length === 0) {
  console.error('Укажите серию: ep01 … ep10 или all. Пример: npm run render -- ep01');
  process.exit(1);
}
const frameArgs = pos.filter((p) => /^\d+$/.test(p)).map(Number);

const browserExecutable = findBrowser();
if (browserExecutable) console.log('Браузер:', browserExecutable);
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), onProgress: () => {}});
const out = ensureDir(path.join(ROOT, 'out'));

for (const id of ids) {
  const ep = EPISODES.find((e) => e.id === id);
  if (!ep) {
    console.error(`Серия ${id} не найдена`);
    continue;
  }
  const comp = await selectComposition({serveUrl, id, browserExecutable: browserExecutable ?? undefined, inputProps: {ep}});
  if (stillMode) {
    const dir = ensureDir(path.join(out, 'stills'));
    const t = episodeTiming(ep);
    // по умолчанию — кадр на 40% каждой сцены; плюс последний кадр перед плашкой
    const frames = frameArgs.length
      ? frameArgs
      : t.starts.map((s, i) => s + Math.round(t.frames[i] * 0.4)).concat([t.endCardStart + 40]);
    for (const f of frames) {
      const file = path.join(dir, `${id}-f${String(f).padStart(4, '0')}.png`);
      await renderStill({composition: comp, serveUrl, output: file, frame: Math.min(f, comp.durationInFrames - 1), browserExecutable: browserExecutable ?? undefined, inputProps: {ep}, logLevel: 'error'});
      console.log('  ', file);
    }
    continue;
  }
  const file = path.join(out, `${id}.mp4`);
  console.log(`▶ ${id} «${ep.title}» — ${comp.durationInFrames} кадров (${(comp.durationInFrames / comp.fps).toFixed(1)} с)`);
  let last = -1;
  await renderMedia({
    composition: comp,
    serveUrl,
    codec: 'h264',
    outputLocation: file,
    crf: Number(opts.crf ?? 20),
    pixelFormat: 'yuv420p',
    concurrency: opts.concurrency ? Number(opts.concurrency) : undefined,
    browserExecutable: browserExecutable ?? undefined,
    inputProps: {ep},
    logLevel: 'error',
    onProgress: ({progress}) => {
      const p = Math.floor(progress * 10);
      if (p !== last) {
        last = p;
        process.stdout.write(`\r  ${p * 10}%`);
      }
    },
  });
  console.log(`\n  ✔ ${file}`);
}
