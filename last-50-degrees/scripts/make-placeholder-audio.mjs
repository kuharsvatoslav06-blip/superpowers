#!/usr/bin/env node
/**
 * Генерирует ВРЕМЕННЫЕ синтетические звуки (ffmpeg, без внешних файлов) в public/sound-effects/placeholder и public/music/placeholder.
 * Это не настоящий саунд-дизайн и не озвучка — только чтобы черновой рендер не был немым.
 * Чтобы заменить заглушку, положите свой файл с тем же именем в public/sound-effects/ или public/music/
 * (например public/sound-effects/siren.mp3) — он автоматически получит приоритет.
 */
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {ROOT, ensureDir} from './lib.mjs';

if (process.argv.includes('--if-missing') && existsSync(path.join(ROOT, 'public/sound-effects/placeholder/siren.wav'))) process.exit(0);
const sfxDir = ensureDir(path.join(ROOT, 'public/sound-effects/placeholder'));
const musDir = ensureDir(path.join(ROOT, 'public/music/placeholder'));

const gen = (file, expr, dur, post = '') => {
  const args = ['-y', '-v', 'error', '-f', 'lavfi', '-i', `aevalsrc='${expr}':s=22050:d=${dur}`];
  if (post) args.push('-af', post);
  if (file.endsWith('.mp3')) args.push('-ac', '1', '-c:a', 'libmp3lame', '-b:a', '96k');
  else args.push('-ac', '1', '-c:a', 'pcm_s16le');
  args.push(file);
  const r = spawnSync('ffmpeg', args, {encoding: 'utf8'});
  if (r.status !== 0) console.error('ffmpeg ошибка для', file, r.stderr);
};
const noise = (file, dur, post) => {
  const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', `anoisesrc=d=${dur}:c=pink:r=22050:a=0.5`, '-af', post, '-ac', '1', '-c:a', 'pcm_s16le', file], {encoding: 'utf8'});
  if (r.status !== 0) console.error('ffmpeg ошибка для', file, r.stderr);
};
const s = (n) => path.join(sfxDir, n + '.wav');
const m = (n) => path.join(musDir, n + '.mp3');

gen(s('siren'), '0.35*sin(2*PI*(820*t-150/(2*PI*0.9)*cos(2*PI*0.9*t)))', 7, 'afade=t=out:st=6.4:d=0.6');
gen(s('beep'), '0.4*sin(2*PI*1100*t)', 0.2, 'afade=t=out:st=0.12:d=0.08');
gen(s('impact'), '0.9*sin(2*PI*52*t)*exp(-3.2*t)+0.35*(random(0)-0.5)*exp(-14*t)', 1.4);
gen(s('door'), '0.8*sin(2*PI*70*t)*exp(-6*t)+0.3*(random(0)-0.5)*exp(-30*t)', 0.9);
gen(s('stinger'), '0.8*sin(2*PI*46*t)*exp(-1.6*t)+0.25*sin(2*PI*(330-120*t)*t)*exp(-2*t)+0.2*(random(0)-0.5)*exp(-9*t)', 2.4);
gen(s('hum'), '0.18*(sin(2*PI*50*t)+0.6*sin(2*PI*100*t)+0.3*sin(2*PI*150*t))*(0.8+0.2*sin(2*PI*0.7*t))', 4, 'afade=t=in:d=0.4,afade=t=out:st=3.4:d=0.6');
gen(s('lift'), '0.22*sin(2*PI*(70*t+9*t*t))+0.1*sin(2*PI*140*t)', 4, 'afade=t=in:d=0.3,afade=t=out:st=3.4:d=0.6');
gen(s('alarm'), '0.3*sin(2*PI*880*t)*lt(mod(t*3,1),0.5)', 4);
gen(s('glitch'), '0.3*sin(2*PI*(180+620*mod(floor(t*40),7))*t)*lt(mod(t*14,1),0.55)+0.15*(random(0)-0.5)', 0.7, 'afade=t=out:st=0.5:d=0.2');
gen(s('heartbeat'), 'sin(2*PI*58*t)*0.8*(exp(-16*mod(t,0.95))+0.7*gte(mod(t,0.95),0.27)*exp(-16*(mod(t,0.95)-0.27)))', 3.8);
gen(s('click'), '0.5*(random(0)-0.5)*exp(-120*t)+0.3*sin(2*PI*1800*t)*exp(-90*t)', 0.12);
gen(s('footsteps'), '0.6*(random(0)-0.5)*exp(-28*mod(t,0.46))*lt(mod(t,0.46),0.12)+0.5*sin(2*PI*70*t)*exp(-30*mod(t,0.46))', 6, 'lowpass=f=900');
gen(s('radio'), '0.5*(random(0)-0.5)*(0.6+0.4*sin(2*PI*9*t))*lt(mod(t*2.3,1),0.8)', 4, 'bandpass=f=1800:width_type=h:w=2400,afade=t=in:d=0.2,afade=t=out:st=3.5:d=0.5');
noise(s('static'), 4, 'bandpass=f=2200:width_type=h:w=3000,volume=0.7,afade=t=in:d=0.2,afade=t=out:st=3.5:d=0.5');
noise(s('wind'), 8, 'lowpass=f=700,tremolo=f=0.35:d=0.5,volume=1.6,afade=t=in:d=1,afade=t=out:st=7:d=1');
noise(s('whoosh'), 1, 'highpass=f=300,lowpass=f=4500,afade=t=in:d=0.4,afade=t=out:st=0.45:d=0.55,volume=1.4');

// Музыка: тянущиеся «дроны» ~40 с (зацикливаются).
const drone = (name, freqs, lfo) => {
  const sum = freqs.map((f, i) => `${(0.16 / (i + 1)).toFixed(3)}*sin(2*PI*${f}*t+${i}*0.7)`).join('+');
  gen(m(name), `(${sum})*(0.75+0.25*sin(2*PI*${lfo}*t))`, 40, 'afade=t=in:d=1.5,afade=t=out:st=38:d=2');
};
drone('tension', [55, 82.4, 110, 116.5], 0.11);
drone('dark', [41.2, 61.7, 82.4, 98], 0.07);
drone('cold', [110, 164.8, 220, 329.6], 0.13);
drone('hope', [130.8, 196, 261.6, 392], 0.09);
console.log('Заглушки аудио созданы в public/sound-effects/placeholder и public/music/placeholder');
