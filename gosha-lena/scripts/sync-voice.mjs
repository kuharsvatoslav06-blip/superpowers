// Синхронизация серии с озвучкой ElevenLabs.
//   node scripts/sync-voice.mjs day01 [--tight]
//
// 1) ffmpeg silencedetect находит куски речи в assets/voice/<id>.mp3;
// 2) куски раскладываются по фразам субтитров по числу слогов (динамическое программирование:
//    доля длительности ≈ доля слогов) — распознавание речи не нужно;
// 3) внутри фразы слова раскладываются по кускам так же — так субтитры попадают в паузы («Прыщи, борода и… антенна»);
// 4) каждой сцене пишется scene.voice = { from, to, at }: какой отрезок файла звучит и с какой секунды сцены.
//    Длительности сцен сохраняются (раскладка по сценарию). Если фраза не влезает — сцена удлиняется.
//    С флагом --tight сцены укорачиваются до «фраза + 1.2 с» (но не короче 2.5 с).
// Старая версия JSON сохраняется в episodes/<id>.before-sync.json.
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const id = process.argv[2] || 'day01';
const tight = process.argv.includes('--tight');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const file = path.join(root, 'episodes', `${id}.json`);
const ep = JSON.parse(readFileSync(file, 'utf8'));
const voice = path.join(root, 'assets', ep.voice.src);

/* ---------- куски речи ---------- */
const r = spawnSync('ffmpeg', ['-hide_banner', '-i', voice, '-af', 'silencedetect=noise=-38dB:d=0.18', '-f', 'null', '-'], { encoding: 'utf8' });
const log = r.stderr;
const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(log);
if (!m) { console.error('Не удалось прочитать', voice); process.exit(1); }
const total = +m[1] * 3600 + +m[2] * 60 + +m[3];
const segs = [];
let cur = 0, inSil = false;
for (const [, k, v] of log.matchAll(/silence_(start|end): ([\d.]+)/g)) {
  if (k === 'start') { if (+v - cur > 0.12) segs.push({ s: cur, e: +v }); inSil = true; }
  else { cur = +v; inSil = false; }
}
if (!inSil && total - cur > 0.12) segs.push({ s: cur, e: total });

/* ---------- слоги ---------- */
const syl = (t) => Math.max(1, (t.toLowerCase().match(/[аеёиоуыэюяaeiouy]/g) || []).length);

/* ---------- разбиение последовательности на k групп ---------- */
// cost(i, j, g): цена группы элементов [i, j) как g-й цели; bonus(i): награда за границу перед элементом i.
const partition = (n, k, cost, bonus) => {
  const INF = 1e18;
  const dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(INF));
  const from = Array.from({ length: k + 1 }, () => Array(n + 1).fill(-1));
  dp[0][0] = 0;
  for (let g = 1; g <= k; g++)
    for (let j = g; j <= n - (k - g); j++)
      for (let i = g - 1; i < j; i++) {
        if (dp[g - 1][i] >= INF) continue;
        const v = dp[g - 1][i] + cost(i, j, g - 1) - (j < n ? bonus(j) : 0);
        if (v < dp[g][j]) { dp[g][j] = v; from[g][j] = i; }
      }
  const cuts = [n];
  for (let g = k, j = n; g > 0; g--) { j = from[g][j]; cuts.unshift(j); }
  return cuts;
};
const logErr = (a, b) => Math.log(Math.max(a, 1e-3) / Math.max(b, 1e-3)) ** 2;

const capScenes = ep.scenes.filter((s) => s.caption);
const phrases = capScenes.map((s) => (s.caption.parts ? s.caption.parts.map((p) => p.text).join(' ') : s.caption.text));
if (segs.length < phrases.length) {
  console.error(`Нашёл ${segs.length} кусков речи на ${phrases.length} фраз. Нужны паузы ≥0.2 с между фразами.`);
  process.exit(1);
}
const sylls = phrases.map(syl);
const speech = segs.reduce((a, g) => a + g.e - g.s, 0);
const rate = sylls.reduce((a, b) => a + b, 0) / speech; // слогов в секунду
const gapBefore = (i) => segs[i].s - segs[i - 1].e;
const segDur = (i, j) => segs.slice(i, j).reduce((a, g) => a + g.e - g.s, 0);
// границы фраз = длинные паузы (теги <break>), длины фраз ≈ слоги / темп
const segCuts = partition(segs.length, phrases.length, (i, j, g) => 0.5 * logErr(segDur(i, j), sylls[g] / rate), (i) => 8 * gapBefore(i));

copyFileSync(file, file.replace(/\.json$/, '.before-sync.json'));
console.log(`Озвучка ${total.toFixed(2)} с, кусков речи: ${segs.length}, фраз: ${phrases.length}\n`);

capScenes.forEach((s, j) => {
  const group = segs.slice(segCuts[j], segCuts[j + 1]);
  const from = Math.max(0, group[0].s - 0.04);
  const to = Math.min(total, group[group.length - 1].e + 0.12);
  const len = to - from;
  const words = phrases[j].split(/\s+/).filter(Boolean);
  // слова → куски речи внутри фразы
  let parts;
  if (group.length > 1 && words.length >= group.length) {
    const ws = words.map((w) => syl(w.replace(/\*\*/g, '')));
    const gDur = group.map((g) => g.e - g.s);
    const gSum = gDur.reduce((a, b) => a + b, 0), wSum = ws.reduce((a, b) => a + b, 0);
    // слова внутри фразы: доля слогов ≈ доля длительности куска, граница после знака препинания — бонус
    const wc = partition(words.length, group.length,
      (i, j, g) => logErr(ws.slice(i, j).reduce((a, b) => a + b, 0) / wSum, gDur[g] / gSum),
      (i) => (/[.,!?…:;]$/.test(words[i - 1]) ? 1.5 : 0));
    parts = group.map((g, i) => ({ text: words.slice(wc[i], wc[i + 1]).join(' '), s: g.s - from, e: g.e - from }));
  } else {
    parts = [{ text: words.join(' '), s: group[0].s - from, e: group[group.length - 1].e - from }];
  }
  const oldAt = s.voice?.at ?? s.caption.start ?? 0.3;
  if (tight) s.duration = +Math.max(2.5, oldAt + len + 1.2).toFixed(2);
  const at = +Math.max(0, Math.min(oldAt, s.duration - len - 0.3)).toFixed(3);
  if (at + len + 0.3 > s.duration) s.duration = +(at + len + 0.4).toFixed(2);
  s.voice = { from: +from.toFixed(3), to: +to.toFixed(3), at };
  s.caption = {
    accent: s.caption.accent,
    parts: parts.map((p) => ({ text: p.text, start: +(at + p.s).toFixed(3), end: +(at + p.e).toFixed(3) })),
  };
  console.log(`${s.id.padEnd(14)} голос ${from.toFixed(2)}–${to.toFixed(2)} с → в сцене с ${at.toFixed(2)} с (сцена ${s.duration} с)`);
  parts.forEach((p) => console.log(`    ${(at + p.s).toFixed(2)}–${(at + p.e).toFixed(2)}  ${p.text}`));
});
writeFileSync(file, JSON.stringify(ep, null, 2) + '\n');
console.log(`\nГотово. Проверьте тайминги наклеек/эмоций в сценах, если они привязаны к словам.`);
