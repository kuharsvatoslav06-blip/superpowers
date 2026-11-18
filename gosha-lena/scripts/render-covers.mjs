// Обложки серии: node scripts/render-covers.mjs day01
// → out/<id>_cover_tiktok.png (1080×1920) и out/<id>_cover_youtube.jpg (1280×720, < 2 МБ)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { readFileSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';

const id = process.argv[2] || 'day01';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const assets = path.join(root, 'assets');
const episode = JSON.parse(readFileSync(path.join(root, 'episodes', `${id}.json`), 'utf8'));
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: assets });
mkdirSync(path.join(root, 'out'), { recursive: true });
for (const [comp, file, imageFormat] of [['CoverVertical', `${id}_cover_tiktok.png`, 'png'], ['CoverYouTube', `${id}_cover_youtube.jpg`, 'jpeg']]) {
  const inputProps = { episode };
  const composition = await selectComposition({ serveUrl, id: comp, inputProps, browserExecutable });
  const output = path.join(root, 'out', file);
  await renderStill({ composition, serveUrl, output, inputProps, browserExecutable, imageFormat, ...(imageFormat === 'jpeg' ? { jpegQuality: 92 } : {}) });
  console.log(`→ ${output} (${(statSync(output).size / 1024).toFixed(0)} КБ)`);
}

// Версия для YouTube Shorts: обложка первыми 2 кадрами (0.07 с) — её можно выбрать кадром-обложкой в приложении
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const video = path.join(root, 'out', `${id}.mp4`);
if (existsSync(video)) {
  const shorts = path.join(root, 'out', `${id}_shorts.mp4`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-loop', '1', '-framerate', '30', '-t', '0.0667', '-i', path.join(root, 'out', `${id}_cover_tiktok.png`),
    '-f', 'lavfi', '-t', '0.0667', '-i', 'anullsrc=r=48000:cl=stereo', '-i', video, '-filter_complex',
    '[0:v]scale=1080:1920,format=yuv420p,setsar=1[c];[2:v]format=yuv420p,setsar=1[v];[c][1:a][v][2:a]concat=n=2:v=1:a=1[ov][oa]',
    '-map', '[ov]', '-map', '[oa]', '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', shorts]);
  console.log(`→ ${shorts} (обложка первым кадром)`);
}
