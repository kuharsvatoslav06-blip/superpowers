// Offline renderer: renders every frame in headless Chromium (parallel workers, resumable), writes an .srt
// for YouTube captions, and encodes the final 1920x1080 H.264 + AAC video with the soundtrack.
//   node tools/render.js [--workers 3] [--from 0] [--to <sec>] [--fps 30] [--out build/video.mp4] [--encode-only]
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import { createRequire } from 'node:module'; import { execFileSync } from 'node:child_process';
import { startServer, ROOT } from './server.js';
import { BUILD, QUERY, EP } from './paths.js';
import { DURATION, FPS, LINES, G } from '../src/story/script.js';
import VOICE from '../src/generated/voice.js';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const fps = +arg('fps', FPS), from = +arg('from', 0), to = +arg('to', DURATION), workers = +arg('workers', Math.max(1, Math.min(4, os.cpus().length - 1)));
const FR = path.join(BUILD, 'frames'); const out = path.resolve(ROOT, arg('out', path.relative(ROOT, path.join(BUILD, 'video.mp4'))));
fs.mkdirSync(FR, { recursive: true });

// ---- captions (.srt) for upload as closed captions
const ts = s => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const srt = LINES.map((l, i) => { const a = G(l.scene, l.t), d = VOICE[l.id]?.dur ?? 2; return `${i + 1}\n${ts(a)} --> ${ts(a + d + 0.3)}\n${l.text.replace(/\*/g, '')}\n`; }).join('\n');
fs.writeFileSync(path.join(BUILD, 'subtitles.srt'), srt);

const first = Math.round(from * fps), last = Math.min(Math.ceil(to * fps), Math.floor(DURATION * fps) - 1);
const todo = []; for (let f = first; f <= last; f++) if (!fs.existsSync(path.join(FR, `f${String(f).padStart(5, '0')}.jpg`))) todo.push(f);

if (!process.argv.includes('--encode-only') && todo.length) {
  console.log(`rendering ${todo.length} frames (${first}..${last}) with ${workers} workers`);
  const { chromium } = createRequire(import.meta.url)('playwright');
  const srv = await startServer(0); const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let done = 0; const t0 = Date.now(); let next = 0;
  await Promise.all([...Array(workers).keys()].map(async () => {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    page.on('pageerror', e => console.error('pageerror', e.message));
    await page.goto(`http://127.0.0.1:${port}/${QUERY}`); void EP;
    await page.waitForFunction(() => window.ready || window.bootError, null, { timeout: 300000 });
    const be = await page.evaluate(() => window.bootError); if (be) throw new Error(be);
    while (next < todo.length) {
      const f = todo[next++];
      const data = await page.evaluate(t => window.frame(t, 0.93), f / fps);
      fs.writeFileSync(path.join(FR, `f${String(f).padStart(5, '0')}.jpg`), Buffer.from(data.split(',')[1], 'base64'));
      if (++done % 150 === 0) { const el = (Date.now() - t0) / 1000; console.log(`${done}/${todo.length}  ${el.toFixed(0)}s elapsed, ~${((todo.length - done) * el / done / 60).toFixed(1)} min left`); }
    }
    await page.close();
  }));
  await browser.close(); srv.close();
}

// ---- encode
const audio = path.join(BUILD, 'soundtrack.wav');
const args = ['-loglevel', 'error', '-stats', '-y', '-framerate', String(fps), '-start_number', String(first), '-i', path.join(FR, 'f%05d.jpg')];
if (fs.existsSync(audio)) args.push('-ss', String(first / fps), '-t', String((last - first + 1) / fps), '-i', audio);
args.push('-frames:v', String(last - first + 1), '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', String(fps));
if (fs.existsSync(audio)) args.push('-c:a', 'aac', '-b:a', '192k', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000');
args.push('-movflags', '+faststart', out);
console.log('encoding ->', path.relative(ROOT, out));
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('done:', path.relative(ROOT, out), (fs.statSync(out).size / 1e6).toFixed(1) + ' MB');
