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
