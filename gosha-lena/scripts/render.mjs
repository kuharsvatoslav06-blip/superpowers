// Рендер серии: node scripts/render.mjs day01 [--frames=0-90]
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { existsSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const id = process.argv[2] || 'day01';
const framesArg = process.argv.find((a) => a.startsWith('--frames='));
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const assets = path.join(root, 'assets');
const episode = JSON.parse(readFileSync(path.join(root, 'episodes', `${id}.json`), 'utf8'));
const total = episode.scenes.reduce((a, s) => a + s.duration, 0);

// озвучка: реальный файл или заглушка тишины нужной длины
const voiceSrc = existsSync(path.join(assets, episode.voice.src)) ? episode.voice.src : null;
const stub = path.join(assets, episode.voice.stub);
if (!voiceSrc) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', String(total), '-c:a', 'libmp3lame', '-b:a', '64k', stub]);
  console.log(`[voice] ${episode.voice.src} не найден → заглушка тишины ${total} с`);
}
const availableSfx = existsSync(path.join(assets, 'sfx')) ? readdirSync(path.join(assets, 'sfx')).filter((f) => /\.(mp3|wav|ogg|m4a)$/i.test(f)) : [];
const musicSrc = episode.music && existsSync(path.join(assets, episode.music.src)) ? episode.music.src : null;
console.log(`[sfx] ${availableSfx.length ? availableSfx.join(', ') : 'нет файлов — пропускаю'}; [music] ${musicSrc ?? 'нет — пропускаю'}`);

const inputProps = { episode, voiceSrc, availableSfx, musicSrc };
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: assets });
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const composition = await selectComposition({ serveUrl, id: 'Episode', inputProps, browserExecutable });
mkdirSync(path.join(root, 'out'), { recursive: true });
const out = path.join(root, 'out', `${id}.mp4`);
await renderMedia({
  composition, serveUrl, codec: 'h264', audioCodec: 'aac', outputLocation: out, inputProps, browserExecutable,
  crf: 20, enforceAudioTrack: true, imageFormat: 'jpeg', jpegQuality: 92,
  frameRange: framesArg ? framesArg.split('=')[1].split('-').map(Number) : undefined,
  onProgress: ({ progress }) => { const p = Math.round(progress * 100); if (p % 10 === 0 && p !== globalThis.__lp) { globalThis.__lp = p; console.log(`${p}%`); } },
});
// громкость под соцсети: −14 LUFS, пик −1.5 dBTP (видео копируется без перекодирования)
const tmp = out.replace(/\.mp4$/, '.tmp.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', out, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', tmp]);
execFileSync('mv', [tmp, out]);
console.log(`\n→ ${out}`);
