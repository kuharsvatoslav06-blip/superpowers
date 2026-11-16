// Проверка: по кадру из каждой сцены + контактный лист с безопасными зонами.
// node scripts/check-frames.mjs day01 [доля_сцены=0.75]
import { readFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const id = process.argv[2] || 'day01';
const mode = process.argv[3] || '0.75'; // число = доля сцены, 'caption' = середина последнего слова субтитра
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ep = JSON.parse(readFileSync(path.join(root, 'episodes', `${id}.json`), 'utf8'));
const dir = path.join(root, 'out', `${id}_check`);
mkdirSync(dir, { recursive: true });
let t0 = 0;
const files = [];
for (const s of ep.scenes) {
  const t = t0 + (mode === 'caption' && s.caption ? Math.min((s.caption.parts ? s.caption.parts[s.caption.parts.length - 1].end : s.caption.end) + 0.3, s.duration - 0.05) : s.duration * Number(mode));
  const f = path.join(dir, `${s.id}${mode === 'caption' ? '_cap' : ''}.png`);
  // красные полосы — безопасные зоны TikTok/Reels: 150 px сверху, 300 px снизу
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', t.toFixed(2), '-i', path.join(root, 'out', `${id}.mp4`), '-frames:v', '1',
    '-vf', 'drawbox=x=0:y=0:w=iw:h=150:color=red@0.35:t=fill,drawbox=x=0:y=ih-300:w=iw:h=300:color=red@0.35:t=fill', f]);
  files.push(f);
  console.log(`${s.id}  t=${t.toFixed(2)}s → ${f}`);
  t0 += s.duration;
}
const args = files.flatMap((f) => ['-i', f]);
const n = files.length;
execFileSync('ffmpeg', ['-v', 'error', '-y', ...args, '-filter_complex',
  files.map((_, i) => `[${i}]scale=360:640[s${i}]`).join(';') + ';' + files.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${n}:layout=` +
  files.map((_, i) => `${(i % 6) * 360}_${Math.floor(i / 6) * 640}`).join('|') + ':fill=black',
  path.join(dir, `sheet${mode === 'caption' ? '_cap' : ''}.png`)]);
console.log('sheet →', path.join(dir, 'sheet.png'));
