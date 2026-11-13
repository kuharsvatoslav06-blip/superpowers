#!/usr/bin/env node
/**
 * Сканирует public/ и пишет src/audio/available.json — список реально существующих аудиофайлов.
 *   public/sound-effects/<имя>.(mp3|wav|ogg|m4a)        — свои эффекты (приоритет)
 *   public/sound-effects/placeholder/<имя>.wav           — временные заглушки (npm run audio:placeholders)
 *   public/music/<имя>.*  | public/music/placeholder/<имя>.*
 *   public/voiceover/<epNN>/<epNN-sNN-lN>.(mp3|wav|ogg)  — озвучка реплик (id см. docs/voiceover)
 * Без --quiet печатает отчёт о недостающих ресурсах.
 */
import {existsSync, readdirSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {ROOT, loadEpisodes} from './lib.mjs';

const quiet = process.argv.includes('--quiet');
const pub = path.join(ROOT, 'public');
const EXT = ['.mp3', '.wav', '.ogg', '.m4a'];

const find = (dir, name) => {
  for (const e of EXT) if (existsSync(path.join(pub, dir, name + e))) return `${dir}/${name}${e}`;
  return null;
};

const SFX = ['siren', 'beep', 'impact', 'whoosh', 'hum', 'static', 'glitch', 'wind', 'heartbeat', 'click', 'door', 'lift', 'alarm', 'footsteps', 'radio', 'stinger'];
const MUSIC = ['tension', 'dark', 'cold', 'hope'];

const res = {sfx: {}, music: {}, voice: {}, voiceDur: {}};
const missing = {sfx: [], music: [], real: {sfx: 0, music: 0}};
for (const n of SFX) {
  const real = find('sound-effects', n);
  const ph = find('sound-effects/placeholder', n);
  const p = real ?? ph;
  if (p) res.sfx[n] = p;
  if (real) missing.real.sfx++;
  else missing.sfx.push(n);
}
for (const n of MUSIC) {
  const real = find('music', n);
  const ph = find('music/placeholder', n);
  const p = real ?? ph;
  if (p) res.music[n] = p;
  if (real) missing.real.music++;
  else missing.music.push(n);
}

let warnedProbe = false;
let lineCount = 0;
let voiced = 0;
try {
  const {EPISODES, resolveLines} = await loadEpisodes();
  for (const ep of EPISODES) {
    for (const s of ep.scenes) {
      for (const l of resolveLines(ep.id, s)) {
        lineCount++;
        const v = find(`voiceover/${ep.id}`, l.id);
        if (v) {
          res.voice[l.id] = v;
          voiced++;
          // реальная длительность дорожки: по ней строится тайминг сцен и субтитров
          const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(pub, v)], {encoding: 'utf8'});
          const d = parseFloat(r.stdout);
          if (Number.isFinite(d)) res.voiceDur[l.id] = Math.round(d * 100) / 100;
          else if (!warnedProbe) {
            warnedProbe = true;
            console.warn('ffprobe не найден: длительность озвучки оценивается по тексту (установите ffmpeg).');
          }
        }
      }
    }
  }
} catch (e) {
  console.warn('Не удалось прочитать серии для проверки озвучки:', e.message);
}

writeFileSync(path.join(ROOT, 'src/audio/available.json'), JSON.stringify(res, null, 2) + '\n');
if (!quiet) {
  console.log('Проверка ресурсов');
  console.log(`  Озвучка: ${voiced}/${lineCount} реплик (папка public/voiceover/<epNN>/<id>.mp3)`);
  console.log(`  Звуковые эффекты: свои ${missing.real.sfx}/${SFX.length}; без своих файла: ${missing.sfx.join(', ') || '—'}`);
  console.log(`  Музыка: свои ${missing.real.music}/${MUSIC.length}; без своих файла: ${missing.music.join(', ') || '—'}`);
  console.log('  Заглушки (если есть) лежат в public/…/placeholder/ и подменяются вашими файлами с тем же именем.');
}
