// Пересинхронизация серии по реальной озвучке.
// node scripts/sync-voice.mjs day01
// 1) ищет фразы в assets/voice/<id>.mp3 через ffmpeg silencedetect;
// 2) склеивает соседние куски, пока фраз не станет столько же, сколько субтитров;
// 3) ставит начало каждой сцены за 0.25 с до её фразы, длительность — до следующей фразы;
// 4) пропорционально масштабирует все тайминги внутри сцены (t, камера, тряска, сообщения).
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const id = process.argv[2] || 'day01';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const file = path.join(root, 'episodes', `${id}.json`);
const ep = JSON.parse(readFileSync(file, 'utf8'));
const voice = path.join(root, 'assets', ep.voice.src);

const r = spawnSync('ffmpeg', ['-hide_banner', '-i', voice, '-af', 'silencedetect=noise=-38dB:d=0.22', '-f', 'null', '-'], { encoding: 'utf8' });
const log = r.stderr;
const dur = Number(/Duration: (\d+):(\d+):([\d.]+)/.exec(log).slice(1).reduce((a, v, i) => a + Number(v) * [3600, 60, 1][i], 0));
const sil = [...log.matchAll(/silence_(start|end): ([\d.]+)/g)].map((m) => [m[1], Number(m[2])]);
let segs = [];
let cur = 0;
for (const [k, v] of sil) {
  if (k === 'start') { if (v - cur > 0.15) segs.push({ s: cur, e: v }); }
  else cur = v;
}
if (sil.length === 0 || sil[sil.length - 1][0] === 'end') segs.push({ s: cur, e: dur });

const scenes = ep.scenes.filter((s) => s.caption);
const N = scenes.length;
if (segs.length < N) {
  console.error(`Нашёл ${segs.length} фраз, а субтитров ${N}. Сделайте паузы ≥0.4 с между фразами (тег <break time="0.6s" />) и перезапишите.`);
  process.exit(1);
}
while (segs.length > N) {
  let best = 1;
  for (let i = 1; i < segs.length; i++) if (segs[i].s - segs[i - 1].e < segs[best].s - segs[best - 1].e) best = i;
  segs[best - 1].e = segs[best].e;
  segs.splice(best, 1);
}

copyFileSync(file, file.replace(/\.json$/, '.before-sync.json'));
const LEAD = 0.25;
const starts = segs.map((g, i) => (i === 0 ? 0 : Math.max(0, g.s - LEAD)));
const scaleTimes = (o, k) => {
  if (Array.isArray(o)) return o.map((x) => scaleTimes(x, k));
  if (o && typeof o === 'object') {
    const out = {};
    for (const [key, v] of Object.entries(o)) {
      if (['t', 'punchAt', 'stampAt', 'until', 'dur'].includes(key) && typeof v === 'number') out[key] = +(v * k).toFixed(3);
      else if (key === 'typing' && Array.isArray(v)) out[key] = v.map((x) => +(x * k).toFixed(3));
      else out[key] = scaleTimes(v, k);
    }
    return out;
  }
  return o;
};
// сцены без субтитров не трогаем; каждая сцена с субтитром получает свою фразу
let ci = 0;
for (let i = 0; i < ep.scenes.length; i++) {
  const s = ep.scenes[i];
  if (!s.caption) continue;
  const g = segs[ci];
  const start = starts[ci];
  const end = ci + 1 < N ? starts[ci + 1] : Math.max(g.e + 1.8, dur + 0.5);
  const newDur = +(end - start).toFixed(3);
  const k = newDur / s.duration;
  const { caption, ...rest } = s;
  Object.assign(s, scaleTimes(rest, k));
  s.duration = newDur;
  s.caption = { ...caption, start: +(g.s - start).toFixed(3), end: +(g.e - start).toFixed(3) };
  console.log(`${s.id.padEnd(14)} ${start.toFixed(2)}–${end.toFixed(2)} с  «${caption.text.replace(/\*\*/g, '')}»`);
  ci++;
}
writeFileSync(file, JSON.stringify(ep, null, 2) + '\n');
console.log(`Готово. Старая версия: ${path.basename(file).replace('.json', '.before-sync.json')}`);
