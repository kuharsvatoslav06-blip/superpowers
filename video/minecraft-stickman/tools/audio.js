// AudioManager (offline): synthesizes the whole soundtrack — music by mood, ambience beds, every SFX cue
// (collected from the running animation so they are frame-accurate) and the voice-over with ducking.
// Output: build/soundtrack.wav (48 kHz stereo). Zero dependencies: all sounds are generated from math.
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { LINES, MUSIC, AMBIENCE, DURATION, G, sceneById } from '../src/story/script.js';
import { ROOT, startServer } from './server.js';
import { BUILD as BUILD_DIR, QUERY } from './paths.js';

const SR = 48000; const LEN = Math.ceil((DURATION + 1) * SR);
const BUILD = BUILD_DIR; void ROOT;

// ------------------------------------------------------------------ cues from the animation
async function getCues() {
  const { chromium } = createRequire(import.meta.url)('playwright');
  const srv = await startServer(0);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`http://127.0.0.1:${srv.address().port}/${QUERY}`);
  await page.waitForFunction(() => window.ready || window.bootError, null, { timeout: 300000 });
  const cues = await page.evaluate(() => window.collectCues());
  await browser.close(); srv.close(); return cues;
}

// ------------------------------------------------------------------ DSP helpers
let seed = 12345; const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) % 1e9) / 1e9; };
const noise = () => rnd() * 2 - 1;
const buf = sec => new Float32Array(Math.max(1, Math.round(sec * SR)));
const TAU = Math.PI * 2;
function lp(x, f) { const a = 1 - Math.exp(-TAU * f / SR); let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = y; } return x; }
function hp(x, f) { const a = 1 - Math.exp(-TAU * f / SR); let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = x[i] - y; } return x; }
function biquad(x, type, f, q = 0.7, fEnd = null) { // RBJ cookbook, optional linear frequency sweep
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0; const n = x.length;
  let b0, b1, b2, a1, a2;
  const coef = fr => { const w = TAU * Math.min(fr, SR * 0.45) / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
    let B0, B1, B2; if (type === 'lp') { B0 = (1 - c) / 2; B1 = 1 - c; B2 = (1 - c) / 2; } else if (type === 'hp') { B0 = (1 + c) / 2; B1 = -(1 + c); B2 = (1 + c) / 2; } else { B0 = al; B1 = 0; B2 = -al; }
    const A0 = 1 + al; b0 = B0 / A0; b1 = B1 / A0; b2 = B2 / A0; a1 = -2 * c / A0; a2 = (1 - al) / A0; };
  coef(f);
  for (let i = 0; i < n; i++) { if (fEnd && i % 64 === 0) coef(f + (fEnd - f) * i / n); const y = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y; }
  return x;
}
const env = (i, n, a, r) => { const t = i / SR, T = n / SR; return Math.min(1, t / Math.max(a, 1e-4)) * Math.min(1, (T - t) / Math.max(r, 1e-4)); };
const expd = (i, d) => Math.exp(-i / SR / d);
function noiseBuf(sec, shape = (t) => 1) { const b = buf(sec); for (let i = 0; i < b.length; i++) b[i] = noise() * shape(i / SR, i); return b; }
function tone(sec, f0, f1 = f0, { type = 'sine', decay = null, att = 0.002, rel = 0.02, vib = 0, vibF = 5 } = {}) {
  const b = buf(sec); let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const k = i / b.length; const f = f0 * Math.pow(f1 / f0, k) * (1 + vib * Math.sin(TAU * vibF * i / SR)); ph += f / SR;
    const p = ph % 1; let v = type === 'sine' ? Math.sin(TAU * p) : type === 'saw' ? 2 * p - 1 : type === 'square' ? (p < 0.5 ? 1 : -1) : type === 'tri' ? 1 - 4 * Math.abs(p - 0.5) : 0;
    b[i] = v * env(i, b.length, att, rel) * (decay ? expd(i, decay) : 1);
  }
  return b;
}
function mix(...bs) { const n = Math.max(...bs.map(b => b[0].length)); const o = new Float32Array(n); for (const [b, g] of bs) for (let i = 0; i < b.length; i++) o[i] += b[i] * g; return o; }
function crush(b, bits = 5, hold = 6) { const q = Math.pow(2, bits); let v = 0; for (let i = 0; i < b.length; i++) { if (i % hold === 0) v = Math.round(b[i] * q) / q; b[i] = v; } return b; }
const thump = (f = 90, d = 0.12, g = 1) => { const b = tone(d * 4, f * 1.8, f * 0.6, { decay: d }); for (let i = 0; i < b.length; i++) b[i] *= g; return b; };

// ------------------------------------------------------------------ SFX library
const SFX = {
  step: (c) => { const s = c.surface; if (s === 'stone') return mix([biquad(noiseBuf(0.08, t => Math.exp(-t * 60)), 'bp', 1800 + rnd() * 600, 1.2), 0.9], [thump(110, 0.03), 0.6]);
    if (s === 'wood') return mix([thump(150, 0.04), 1], [biquad(noiseBuf(0.06, t => Math.exp(-t * 70)), 'bp', 900, 1), 0.5]);
    return mix([lp(noiseBuf(0.1, t => Math.exp(-t * 40)), 1500 + rnd() * 900), 1.2], [thump(80, 0.03), 0.3]); },
  stepPhantom: () => mix([biquad(noiseBuf(0.1, t => Math.exp(-t * 45)), 'bp', 1300, 1.1), 1], [thump(85, 0.05), 0.9]),
  jump: () => biquad(noiseBuf(0.18, t => Math.sin(Math.PI * t / 0.18)), 'bp', 700, 1, 1600),
  punchWood: () => mix([thump(120, 0.05), 1], [lp(noiseBuf(0.07, t => Math.exp(-t * 50)), 1300), 0.8]),
  punch: () => SFX.punchWood(),
  craftHit: () => mix([thump(180, 0.04), 0.9], [biquad(noiseBuf(0.08, t => Math.exp(-t * 60)), 'bp', 1200, 2), 0.7]),
  hammer: () => SFX.craftHit(),
  mineStone: () => mix([biquad(noiseBuf(0.12, t => Math.exp(-t * 40)), 'bp', 2600, 2), 0.9], [tone(0.25, 1850, 1850, { decay: 0.05 }), 0.25], [tone(0.25, 2730, 2730, { decay: 0.04 }), 0.15], [thump(100, 0.04), 0.6]),
  mine: () => SFX.mineStone(),
  breakWood: () => mix([lp(noiseBuf(0.35, t => Math.exp(-t * 12) * (0.5 + 0.5 * Math.sign(Math.sin(t * 180)))), 1800), 1], [thump(90, 0.08), 0.8]),
  breakStone: () => mix([biquad(noiseBuf(0.4, t => Math.exp(-t * 10) * (0.6 + 0.4 * Math.sign(Math.sin(t * 230)))), 'bp', 1600, 0.8), 1.1], [thump(70, 0.1), 0.9]),
  pop: () => tone(0.09, 380, 950, { decay: 0.05 }),
  place: () => mix([thump(85, 0.06), 1], [lp(noiseBuf(0.08, t => Math.exp(-t * 50)), 1400), 0.6]),
  click: () => biquad(noiseBuf(0.025, t => Math.exp(-t * 300)), 'bp', 3200, 2),
  craftDone: () => mix([tone(0.6, 1046, 1046, { decay: 0.2 }), 0.3], [shift(tone(0.6, 1568, 1568, { decay: 0.25 }), 0.08), 0.3]),
  spawn: () => mix([biquad(noiseBuf(0.9, t => Math.sin(Math.PI * t / 0.9)), 'bp', 400, 2, 5000), 0.6], [sparkle(0.9, 14), 0.4]),
  land: () => thump(70, 0.08),
  impactDeep: () => mix([tone(3, 70, 28, { decay: 0.9 }), 1.2], [lp(noiseBuf(2, t => Math.exp(-t * 2.5)), 500), 0.9], [tone(1.5, 140, 50, { decay: 0.3 }), 0.4]),
  impact: () => mix([tone(1.2, 120, 45, { decay: 0.25 }), 1], [lp(noiseBuf(0.8, t => Math.exp(-t * 6)), 2200), 0.7]),
  titleHit: () => mix([SFX.impactDeep(), 0.9], [metal(1.6, 220), 0.35], [lp(noiseBuf(1.2, t => Math.exp(-t * 4)), 4000), 0.4]),
  whoosh: () => biquad(noiseBuf(0.45, t => Math.sin(Math.PI * t / 0.45) ** 2), 'bp', 500, 1.2, 2500),
  whooshDown: () => biquad(noiseBuf(0.9, t => Math.sin(Math.PI * t / 0.9) ** 2), 'bp', 3000, 1, 200),
  zombieGroan: (c) => growl(1.3, 95 * (c.pitch || 1)), zombieFar: () => lp(growl(1.6, 85), 900),
  creak: () => creak(0.9),
  woodSlam: () => mix([thump(70, 0.12), 1.3], [lp(noiseBuf(0.3, t => Math.exp(-t * 15)), 2500), 0.7], [creak(0.15), 0.4]),
  knock: () => mix([thump(130, 0.07), 1.4], [biquad(noiseBuf(0.08, t => Math.exp(-t * 80)), 'bp', 700, 1.5), 1], [thump(260, 0.02), 0.5]),
  doorOpen: () => mix([creak(0.8), 0.9], [shift(SFX.click(), 0.0), 0.6]),
  windGust: () => lp(noiseBuf(2.5, t => Math.sin(Math.PI * t / 2.5) ** 2), 700),
  stinger: () => { const fs_ = [110, 116.5, 155.6, 164.8, 233, 246.9, 466]; return mix([mix(...fs_.map(f => [tone(2.4, f, f * 0.99, { type: 'saw', decay: 0.8, att: 0.005 }), 0.12])), 1], [lp(noiseBuf(1.2, t => Math.exp(-t * 4)), 3000), 0.5], [tone(2, 55, 50, { decay: 0.7 }), 0.6]); },
  comedyBonk: () => tone(0.6, 520, 180, { decay: 0.25, vib: 0.06, vibF: 14 }),
  bedLie: () => lp(thump(60, 0.1), 600),
  error: () => mix([tone(0.22, 180, 180, { type: 'square', rel: 0.04 }), 0.25], [shift(tone(0.22, 140, 140, { type: 'square', rel: 0.04 }), 0.12), 0.25]),
  type: () => mix([biquad(noiseBuf(0.03, t => Math.exp(-t * 200)), 'bp', 2500, 3), 0.8], [tone(0.03, 1200, 1200, { decay: 0.01 }), 0.15]),
  beep: () => tone(0.14, 880, 880, { type: 'square', rel: 0.03 }).map(v => v * 0.35),
  beepHigh: () => tone(0.2, 1320, 1320, { type: 'square', rel: 0.03 }).map(v => v * 0.4),
  shine: () => sparkle(1.2, 18),
  caveEnter: () => lp(noiseBuf(2.5, t => Math.sin(Math.PI * t / 2.5)), 300),
  torchOut: () => mix([hp(noiseBuf(0.3, t => Math.exp(-t * 12)), 2000), 0.8], [lp(noiseBuf(0.15, t => Math.exp(-t * 30)), 400), 0.6]),
  shield: () => mix([metal(0.9, 310), 0.8], [thump(100, 0.06), 1]),
  glitch: () => glitchBurst(0.45), glitchShort: () => glitchBurst(0.16),
  rumble: () => mix([lp(noiseBuf(3.4, t => Math.min(1, t * 3) * Math.exp(-t * 0.6)), 140), 2.0], [lp(noiseBuf(3.4, t => Math.exp(-t * 0.8) * (Math.random() < 0.002 ? 1 : 0.15)), 1500), 0.6]),
  chestOpen: () => mix([creak(0.5), 0.7], [shift(thump(160, 0.04), 0.45), 0.8]),
  choir: () => pad(2.6, [261.6, 329.6, 392, 523.3], { formant: true, att: 0.3, rel: 1.2 }),
  enderAmbient: () => { const b = buf(3); let ph = 0; for (let i = 0; i < b.length; i++) { const t = i / SR; const f = 180 + 90 * Math.sin(t * 7.3) * Math.sin(t * 2.1); ph += f / SR; b[i] = Math.sin(TAU * ph) * Math.sin(Math.PI * t / 3) * 0.6; } return mix([b, 1], [lp(noiseBuf(3, t => Math.sin(Math.PI * t / 3)), 400), 0.4]); },
  heartbeat: () => mix([tone(0.25, 62, 45, { decay: 0.06 }), 1.3], [shift(tone(0.25, 55, 40, { decay: 0.06 }), 0.18), 0.9]),
  teleport: () => { const b = buf(0.8); let ph = 0; for (let i = 0; i < b.length; i++) { const t = i / SR; const f = 1400 * Math.exp(-t * 4) + 120; ph += f / SR; b[i] = Math.sin(TAU * ph) * (0.6 + 0.4 * Math.sin(t * 90)) * Math.exp(-t * 3.5); }
    return mix([b, 0.8], [biquad(noiseBuf(0.8, t => Math.exp(-t * 5)), 'bp', 2500, 1, 300), 0.6]); },
  radar: () => tone(0.25, 1500, 1500, { decay: 0.06 }).map(v => v * 0.5),
  page: () => biquad(noiseBuf(0.3, t => Math.sin(Math.PI * t / 0.3) * (0.6 + 0.4 * Math.sin(t * 120))), 'bp', 3500, 0.8),
  waterRise: () => { const b = buf(3.5); for (let k = 0; k < 40; k++) { const t0 = rnd() * 3.2, f = 300 + rnd() * 700; const s = tone(0.08, f, f * 2.2, { decay: 0.03 }); add(b, s, t0, 0.3); } return b; },
  oink: (c) => { const p = c.pitch || 1; const b = buf(0.5); for (let k = 0; k < 2; k++) add(b, mix([biquad(noiseBuf(0.16, t => Math.sin(Math.PI * t / 0.16) * (0.5 + 0.5 * Math.sin(t * 2 * Math.PI * 38 * p))), 'bp', 650 * p, 3), 1.2], [tone(0.16, 260 * p, 200 * p, { type: 'saw', rel: 0.05 }), 0.15]), k * 0.2, 1); return b; },
  moo: (c) => biquad(tone(1.0, 120 * (c.pitch || 1), 105, { type: 'saw', att: 0.1, rel: 0.3, vib: 0.02 }), 'bp', 500, 1.5).map(v => v * 0.6),
  blockVanish: () => mix([crush(tone(0.25, 1200, 200, { type: 'square', decay: 0.1 }), 4, 8), 0.4], [hp(noiseBuf(0.1, t => Math.exp(-t * 30)), 3000), 0.3]),
  skyCrack: () => { const b = buf(4.5); for (let k = 0; k < 60; k++) add(b, hp(noiseBuf(0.05, t => Math.exp(-t * 60)), 800), Math.pow(rnd(), 2) * 2.5, 0.7); return mix([b, 1], [tone(4.5, 45, 30, { decay: 1.6 }), 1.4], [lp(noiseBuf(4.5, t => Math.exp(-t * 0.9)), 260), 1.2]); },
  sadSting: () => pad(3, [220, 261.6, 329.6].map(f => f * 0.75), { att: 0.05, rel: 2, piano: true }),
  portalIgnite: () => mix([biquad(noiseBuf(1.4, t => Math.sin(Math.PI * t / 1.4)), 'bp', 200, 1.5, 3000), 0.8], [tone(1.4, 80, 220, { type: 'saw', att: 0.3, rel: 0.5 }), 0.15]),
  portalHum: (c) => { const d = c.dur || 8; const b = buf(d); let p1 = 0, p2 = 0; for (let i = 0; i < b.length; i++) { const t = i / SR; p1 += (70 + 3 * Math.sin(t * 1.3)) / SR; p2 += (141 + 5 * Math.sin(t * 0.7)) / SR; b[i] = (Math.sin(TAU * p1) * 0.6 + Math.sin(TAU * p2) * 0.3) * Math.min(1, t, d - t) * (0.8 + 0.2 * Math.sin(t * 9)); } return b; },
  portalEnter: () => mix([biquad(noiseBuf(1.5, t => Math.sin(Math.PI * t / 1.5)), 'bp', 300, 1.2, 4000), 1], [tone(1.5, 100, 600, { type: 'saw', att: 0.5, rel: 0.3 }), 0.12]),
  blockFall: () => tone(1.2, 900, 300, { att: 0.1, rel: 0.4 }).map(v => v * 0.15),
  computerHum: (c) => { const d = c.dur || 6; const b = buf(d); let p = 0; for (let i = 0; i < b.length; i++) { const t = i / SR; p += 60 / SR; b[i] = (Math.sin(TAU * p) + 0.5 * Math.sin(TAU * p * 2) + 0.25 * Math.sin(TAU * p * 3)) * 0.3 * Math.min(1, t, d - t); } return mix([b, 1], [lp(noiseBuf(d, t => Math.min(1, t, d - t)), 900), 0.25]); },
  alarm: () => { const b = buf(2); let ph = 0; for (let i = 0; i < b.length; i++) { const t = i / SR; const f = Math.floor(t * 4) % 2 ? 660 : 880; ph += f / SR; b[i] = (ph % 1 < 0.5 ? 1 : -1) * 0.25 * Math.min(1, (2 - t) * 4); } return lp(b, 3000); },
  servo: () => tone(0.6, 300, 520, { type: 'saw', att: 0.05, rel: 0.1 }).map(v => v * 0.12),
  ghostHit: () => mix([SFX.whoosh(), 0.7], [crush(tone(0.3, 800, 120, { type: 'square', decay: 0.1 }), 3, 10), 0.35]),
  buttonPress: () => mix([SFX.click(), 1], [thump(140, 0.05), 1]),
  flashBoom: () => mix([SFX.impactDeep(), 1], [hp(noiseBuf(2.5, t => Math.exp(-t * 1.5)), 1500), 0.6]),
  ringing: (c) => tone(c.dur || 3, 3600, 3600, { att: 0.05, rel: 1.5 }).map(v => v * 0.12),
  birds: (c) => { const d = c.dur || 10; const b = buf(d); for (let k = 0; k < d * 2.2; k++) { const t0 = rnd() * (d - 0.5); const f = 2500 + rnd() * 2000; for (let j = 0; j < 2 + Math.floor(rnd() * 3); j++) add(b, tone(0.07, f, f * (1.2 + rnd() * 0.5), { decay: 0.03 }), t0 + j * 0.09, 0.25); } return b; },
  blink: () => tone(0.05, 2000, 2400, { decay: 0.015 }).map(v => v * 0.2),
  bodyFall: () => mix([thump(70, 0.1), 1.2], [lp(noiseBuf(0.25, t => Math.exp(-t * 20)), 1200), 0.6]),
  gasp: () => mix([biquad(noiseBuf(0.45, t => Math.sin(Math.PI * t / 0.45) ** 0.5), 'bp', 1400, 1.2, 2200), 0.9], [hp(noiseBuf(0.45, t => Math.sin(Math.PI * t / 0.45)), 3000), 0.3]),
  stamp: () => mix([thump(110, 0.05), 1.2], [biquad(noiseBuf(0.08, t => Math.exp(-t * 60)), 'bp', 900, 1), 0.8]),
  tick: () => tone(0.05, 1800, 1800, { decay: 0.015 }).map(v => v * 0.5),
  cluck: () => { const b = buf(0.5); for (let k = 0; k < 3; k++) add(b, biquad(noiseBuf(0.07, t => Math.exp(-t * 40)), 'bp', 1100 + k * 200, 4), k * 0.12, 1.3); return b; },
  splash: () => mix([lp(noiseBuf(1.2, t => Math.exp(-t * 3) * (0.7 + 0.3 * Math.sin(t * 60))), 2500), 1.2], [thump(80, 0.1), 0.8]),
  shatter: () => { const b = buf(1.0); for (let k = 0; k < 40; k++) add(b, hp(tone(0.08, 2000 + rnd() * 4000, 1500, { decay: 0.03 }), 500), rnd() * 0.6, 0.3); return mix([b, 1], [hp(noiseBuf(0.5, t => Math.exp(-t * 8)), 2500), 0.6], [thump(90, 0.06), 0.8]); },
  grind: () => mix([biquad(noiseBuf(1.6, t => Math.sin(Math.PI * t / 1.6) * (0.6 + 0.4 * Math.sin(t * 37))), 'bp', 300, 2), 1.6], [lp(noiseBuf(1.6, t => Math.sin(Math.PI * t / 1.6)), 120), 1]),
  campfire: (c) => { const d = c.dur || 10; const b = lp(noiseBuf(d, t => 0.25 * Math.min(1, t, d - t)), 900); for (let k = 0; k < d * 6; k++) add(b, hp(noiseBuf(0.02, t => Math.exp(-t * 200)), 1500), rnd() * d, 0.5 * rnd()); return b; },
  signFlip: () => mix([tone(0.12, 520, 780, { decay: 0.05 }), 0.5], [biquad(noiseBuf(0.1, t => Math.exp(-t * 40)), 'bp', 2000, 1), 0.4]),
  thunderEcho: () => mix([SFX.impactDeep(), 1.1], [lp(noiseBuf(4, t => Math.exp(-t * 0.9) * (0.5 + 0.5 * Math.sin(t * 7))), 900), 0.9], [metal(2.5, 140), 0.25]),
  bigTeleport: () => mix([SFX.teleport(), 1.2], [tone(1.5, 60, 30, { decay: 0.5 }), 1.0], [biquad(noiseBuf(1.2, t => Math.exp(-t * 2)), 'bp', 800, 0.8, 150), 0.6]),
  sparkle1: () => sparkle(0.6, 5),
  achievement: () => { const b = buf(1.4); [72, 76, 79, 84].forEach((n, i) => add(b, tone(0.6, 440 * Math.pow(2, (n - 69) / 12), 440 * Math.pow(2, (n - 69) / 12), { type: 'tri', decay: 0.25 }), i * 0.11, 0.35)); return b; },
  // ---- episode 3
  breakDirt: () => mix([lp(noiseBuf(0.3, t => Math.exp(-t * 14)), 900), 1.1], [thump(80, 0.07), 0.9]),
  blockRegen: () => mix([tone(0.12, 500, 1300, { decay: 0.06 }), 0.35], [sparkle(0.5, 5), 0.35], [thump(120, 0.03), 0.4]),
  recordStop: () => { const b = buf(0.7); let ph = 0; for (let i = 0; i < b.length; i++) { const t = i / SR; const f = 420 * Math.pow(1 - t / 0.7, 2) + 20; ph += f / SR; b[i] = (2 * (ph % 1) - 1) * 0.3 * (1 - t / 0.7); } return lp(b, 2500); },
  originChime: () => mix(...[523.3, 659.3, 784, 1046.5].map((f, i) => [shift(tone(1.6, f, f, { type: 'tri', decay: 0.5 }), i * 0.07), 0.16]), [pad(1.6, [261.6, 392], { att: 0.05, rel: 1.2, cutoff: 1800 }), 0.25]),
  spiderHiss: () => mix([biquad(noiseBuf(0.7, t => Math.sin(Math.PI * t / 0.7) * (0.6 + 0.4 * Math.sin(t * 70))), 'bp', 3800, 1.5), 0.9], [crush(tone(0.4, 300, 220, { type: 'saw', decay: 0.2 }), 4, 6), 0.2]),
  netherFlip: () => mix([SFX.impact(), 0.8], [lp(noiseBuf(2.5, t => Math.exp(-t * 1.2)), 300), 1.0], [biquad(noiseBuf(1.5, t => Math.sin(Math.PI * t / 1.5)), 'bp', 200, 1, 1200), 0.5]),
  ghastCry: () => { const b = buf(1.6); let ph = 0; for (let i = 0; i < b.length; i++) { const t = i / SR; const f = 520 + 260 * Math.sin(t * 3.2) - t * 180 + 30 * Math.sin(t * 40); ph += f / SR; b[i] = (Math.sin(TAU * ph) * 0.6 + Math.sin(TAU * ph * 2.01) * 0.25) * Math.sin(Math.PI * t / 1.6) ** 0.6; } return mix([freeverb(b, 0.7, 0.4)[0], 1], [b, 0.6]); },
  fireball: () => mix([biquad(noiseBuf(0.9, t => Math.exp(-t * 2.5) * Math.min(1, t * 30)), 'bp', 900, 0.8, 300), 1.2], [thump(90, 0.06), 0.8]),
  explosion: () => mix([SFX.impactDeep(), 1.2], [lp(noiseBuf(1.8, t => Math.exp(-t * 3)), 1800), 1.2], [hp(noiseBuf(0.6, t => Math.exp(-t * 8)), 2500), 0.5]),
  fallWind: (c) => { const d = c.dur || 5; return mix([biquad(noiseBuf(d, t => Math.min(1, t * 2) * Math.min(1, (d - t) * 3) * (0.7 + 0.3 * Math.sin(t * 5))), 'bp', 600, 0.7, 1400), 0.9], [lp(noiseBuf(d, t => Math.min(1, t, d - t)), 150), 0.8]); },
  elevator: (c) => { const d = c.dur || 3.5; return mix([tone(d, 110, 330, { type: 'tri', att: 0.3, rel: 0.4 }), 0.25], [sparkle(d, 20), 0.35], [pad(d, [261.6, 329.6, 392], { att: 0.6, rel: 0.6, cutoff: 1400 }), 0.25]); },
  flashback: () => mix([biquad(noiseBuf(1.2, t => Math.sin(Math.PI * t / 1.2) ** 2), 'bp', 2000, 1, 400), 0.7], [metal(1.6, 330), 0.25]),
  gulp: () => mix([tone(0.18, 300, 140, { decay: 0.07 }), 0.6], [lp(noiseBuf(0.15, t => Math.exp(-t * 30)), 600), 0.4]),
  boneMeal: () => mix([sparkle(0.6, 6), 0.5], [tone(0.2, 900, 1600, { decay: 0.08 }), 0.15]),
  grow: () => mix([biquad(noiseBuf(1.0, t => Math.sin(Math.PI * t)), 'bp', 600, 1.2, 3000), 0.5], [sparkle(1.0, 10), 0.5]),
  worldRegrow: (c) => { const d = c.dur || 5; return mix([pad(d, [130.8, 196, 261.6, 329.6, 392], { att: d * 0.5, rel: 1.5, cutoff: 2000 }), 0.9], [lp(noiseBuf(d, t => Math.min(1, t / d * 1.5) * Math.exp(-Math.max(0, t - d * 0.8))), 300), 1.0], [sparkle(d, 40), 0.5]); },
  phaseChange: () => mix([tone(0.15, 660, 660, { type: 'square', rel: 0.05 }), 0.12], [shift(tone(0.2, 990, 990, { type: 'square', rel: 0.08 }), 0.12), 0.12], [thump(100, 0.05), 0.5]),
  riser: (c) => { const d = c.dur || 1.5; return mix([biquad(noiseBuf(d, t => Math.pow(t / d, 2)), 'bp', 300, 1, 6000), 0.8], [tone(d, 100, 800, { type: 'saw', att: d * 0.8, rel: 0.02 }), 0.12]); },
};
function shift(b, sec) { const o = new Float32Array(b.length + Math.round(sec * SR)); o.set(b, Math.round(sec * SR)); return o; }
function add(dst, src, t0, g = 1) { const o = Math.round(t0 * SR); for (let i = 0; i < src.length && o + i < dst.length; i++) if (o + i >= 0) dst[o + i] += src[i] * g; }
function sparkle(d, n) { const b = buf(d); for (let k = 0; k < n; k++) { const f = 2000 + rnd() * 4000; add(b, tone(0.3, f, f, { decay: 0.08 }), rnd() * (d - 0.3), 0.25); } return b; }
function metal(d, f) { return mix(...[1, 2.76, 5.4, 8.93].map((m, i) => [tone(d, f * m, f * m, { decay: d / (2 + i) }), 0.4 / (i + 1)])); }
function growl(d, f) { const b = buf(d); let ph = 0; for (let i = 0; i < b.length; i++) { const t = i / SR; const fr = f * (1 + 0.08 * Math.sin(t * 6) + 0.04 * noise()); ph += fr / SR; b[i] = (2 * (ph % 1) - 1) * Math.sin(Math.PI * t / d) ** 0.7; }
  return mix([biquad(b, 'bp', 520, 2), 1.4], [biquad(b.slice(), 'bp', 900, 3), 0.6]); }
function creak(d) { const b = buf(d); let ph = 0; for (let i = 0; i < b.length; i++) { const t = i / SR; ph += (90 + 40 * Math.sin(t * 9) + 30 * noise()) / SR; b[i] = (ph % 1 < 0.15 ? 1 : 0) * Math.sin(Math.PI * t / d); } return biquad(hp(b, 200), 'bp', 1100, 2); }
function glitchBurst(d) { const b = buf(d); let v = 0; for (let i = 0; i < b.length; i++) { if (i % Math.round(SR / (200 + 3000 * rnd())) === 0) v = rnd() < 0.5 ? (rnd() * 2 - 1) : 0; b[i] = v * 0.5 * (rnd() < 0.002 ? 0 : 1); } return crush(b, 3, 4); }

// ------------------------------------------------------------------ instruments
function pianoNote(f, d, g = 1) { const b = buf(d); for (let i = 0; i < b.length; i++) { const t = i / SR; const e = Math.exp(-t * 2.2) * Math.min(1, t * 400); b[i] = (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * 2 * f * t) * Math.exp(-t * 3) + 0.12 * Math.sin(TAU * 3 * f * t) * Math.exp(-t * 5)) * e * g * Math.min(1, (d - t) * 20); } return b; }
function pad(d, freqs, { att = 1, rel = 1, formant = false, cutoff = 1400, piano = false } = {}) {
  if (piano) return mix(...freqs.map(f => [pianoNote(f, d), 0.3]));
  const b = buf(d); const ph = freqs.flatMap(f => [f * 0.997, f * 1.003]).map(f => ({ f, p: rnd() }));
  for (let i = 0; i < b.length; i++) { let v = 0; for (const o of ph) { o.p += o.f / SR; v += 2 * (o.p % 1) - 1; } b[i] = v / ph.length * env(i, b.length, att, rel); }
  return formant ? mix([biquad(b, 'bp', 800, 2), 1.5], [biquad(b.slice(), 'bp', 1200, 3), 1]) : lp(lp(b, cutoff), cutoff * 1.5);
}
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
function drum(kind) {
  if (kind === 'kick') return tone(0.4, 150, 45, { decay: 0.12 });
  if (kind === 'snare') return mix([hp(noiseBuf(0.2, t => Math.exp(-t * 25)), 1200), 0.8], [tone(0.12, 220, 180, { decay: 0.05 }), 0.5]);
  if (kind === 'hat') return hp(noiseBuf(0.05, t => Math.exp(-t * 90)), 7000).map(v => v * 0.5);
  if (kind === 'taiko') return mix([tone(0.6, 90, 55, { decay: 0.18 }), 1.2], [lp(noiseBuf(0.3, t => Math.exp(-t * 18)), 800), 0.5]);
  return buf(0.01);
}

// ------------------------------------------------------------------ music moods (render a segment into a stereo-ish mono buffer)
const MOODS = {
  calm(d, s) { // gentle piano + warm pad, C major / A minor, 76 BPM, procedurally generated melody
    const b = buf(d); const beat = 60 / 76; const chords = [[48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 62]]; const scale = [72, 74, 76, 79, 81, 84];
    for (let bar = 0, t = 0; t < d; bar++, t += beat * 4) { const ch = chords[bar % 4]; add(b, pad(beat * 4.2, ch.map(NOTE), { att: 0.8, rel: 1.2, cutoff: 900 }), t, 0.18);
      add(b, pianoNote(NOTE(ch[0] - 12), beat * 4), t, 0.35);
      for (let k = 0; k < 4; k++) { if (rnd() < 0.75) add(b, pianoNote(NOTE(scale[Math.floor(rnd() * scale.length)]), beat * 2), t + k * beat + (rnd() < 0.3 ? beat / 2 : 0), 0.22); } }
    return b;
  },
  night(d) { const b = buf(d); const beat = 60 / 60; const chords = [[45, 52, 60, 64], [41, 48, 57, 60]];
    for (let bar = 0, t = 0; t < d; bar++, t += beat * 4) { add(b, pad(beat * 4.5, chords[bar % 2].map(NOTE), { att: 1.5, rel: 1.5, cutoff: 700 }), t, 0.22); if (rnd() < 0.7) add(b, pianoNote(NOTE([76, 79, 81, 84][Math.floor(rnd() * 4)]), 3), t + beat * (1 + Math.floor(rnd() * 2)), 0.12); }
    return b; },
  build(d) { const b = buf(d); const beat = 60 / 124; const bass = [48, 48, 55, 53]; const arp = [72, 76, 79, 84, 79, 76];
    for (let k = 0, t = 0; t < d; k++, t += beat / 2) { if (k % 2 === 0) add(b, drum('kick'), t, 0.5); if (k % 4 === 2) add(b, drum('snare'), t, 0.3); add(b, drum('hat'), t, 0.25);
      add(b, tone(beat / 2, NOTE(bass[Math.floor(k / 8) % 4] - 12), NOTE(bass[Math.floor(k / 8) % 4] - 12), { type: 'square', decay: 0.12 }), t, 0.12);
      add(b, tone(beat / 2, NOTE(arp[k % 6]), NOTE(arp[k % 6]), { type: 'tri', decay: 0.08 }), t, 0.14); }
    return b; },
  tense(d) { const b = buf(d); add(b, pad(d, [NOTE(33), NOTE(40)], { att: 2, rel: 0.5, cutoff: 300 }), 0, 0.7); const beat = 60 / 90;
    for (let t = 0; t < d; t += beat / 2) add(b, lp(tone(beat / 2, NOTE(45), NOTE(45), { type: 'saw', decay: 0.1 }), 600), t, 0.18 * Math.min(1, t / d + 0.4));
    const hi = buf(d); let p = 0; for (let i = 0; i < hi.length; i++) { const t = i / SR; p += (NOTE(82) + Math.sin(t * 40) * 6) / SR; hi[i] = Math.sin(TAU * p) * (t / d) * 0.08 * (0.6 + 0.4 * Math.sin(t * 50)); } add(b, hi, 0, 1);
    return b; },
  cave(d) { const b = buf(d); add(b, pad(d, [NOTE(26), NOTE(33)], { att: 3, rel: 2, cutoff: 200 }), 0, 0.9);
    for (let t = 1; t < d; t += 2.5 + rnd() * 2) add(b, pianoNote(NOTE([50, 53, 57, 58, 62][Math.floor(rnd() * 5)]), 3), t, 0.15);
    for (let t = 0.5; t < d; t += 1 + rnd() * 3) add(b, tone(0.15, 1800 + rnd() * 900, 900, { decay: 0.04 }), t, 0.06);
    return b; },
  chase(d) { const b = buf(d); const beat = 60 / 150; const bass = [38, 38, 41, 38, 36, 38, 43, 41];
    for (let k = 0, t = 0; t < d; k++, t += beat / 4) {
      if (k % 4 === 0) add(b, drum(k % 8 === 0 ? 'taiko' : 'kick'), t, 0.55); if (k % 8 === 4) add(b, drum('snare'), t, 0.35); if (k % 2 === 0) add(b, drum('hat'), t, 0.2);
      add(b, lp(tone(beat / 4, NOTE(bass[Math.floor(k / 2) % 8] - 12), NOTE(bass[Math.floor(k / 2) % 8] - 12), { type: 'saw', decay: 0.07 }), 900), t, 0.22);
      if (k % 16 === 0) add(b, pad(beat * 2, [NOTE(62), NOTE(65), NOTE(69)], { att: 0.01, rel: 0.4, cutoff: 2500 }), t, 0.2);
    }
    return b; },
  drone(d) { const b = buf(d); add(b, pad(d, [NOTE(26), NOTE(27), NOTE(38)], { att: d * 0.4, rel: 1, cutoff: 250 }), 0, 1.1);
    const s = buf(d); let p = 0; for (let i = 0; i < s.length; i++) { const t = i / SR; p += (NOTE(74) + Math.sin(t * 0.5) * 8) / SR; s[i] = Math.sin(TAU * p) * 0.05 * Math.min(1, t / (d * 0.6)); } add(b, s, 0, 1); return b; },
  mystery(d) { const b = buf(d); add(b, pad(d, [NOTE(45), NOTE(52), NOTE(57)], { att: 2, rel: 2, cutoff: 600 }), 0, 0.35); const mel = [81, 76, 79, 77, 76, 72, 74, 76]; const beat = 60 / 70;
    for (let k = 0, t = 0.5; t < d; k++, t += beat) { const f = NOTE(mel[k % 8]); add(b, mix([tone(1.5, f, f, { decay: 0.4 }), 0.5], [tone(1.5, f * 2.01, f * 2.01, { decay: 0.2 }), 0.15]), t, 0.25); } return b; },
  glitchAction(d) { const b = buf(d); const beat = 60 / 128; const bass = [38, 38, 50, 38, 41, 38, 48, 46];
    for (let k = 0, t = 0; t < d; k++, t += beat / 4) {
      if (k % 4 === 0) add(b, drum('kick'), t, 0.6); if (k % 8 === 4) add(b, drum('snare'), t, 0.3); if (k % 2 === 1) add(b, drum('hat'), t, 0.2);
      const n = bass[Math.floor(k / 2) % 8]; add(b, crush(tone(beat / 4, NOTE(n), NOTE(n), { type: 'square', decay: 0.06 }), 4, 3), t, 0.12);
      if (k % 32 === 28 && rnd() < 0.7) add(b, glitchBurst(beat), t, 0.4);
    }
    add(b, pad(d, [NOTE(50), NOTE(53), NOTE(57)], { att: 2, rel: 1, cutoff: 800 }), 0, 0.15); return b; },
  sad(d) { const b = buf(d); const chords = [[45, 48, 52], [41, 45, 48]]; for (let k = 0, t = 0; t < d; k++, t += 2.6) add(b, mix(...chords[k % 2].map(n => [pianoNote(NOTE(n + 12), 3), 0.3])), t, 0.8); return b; },
  void(d) { const b = buf(d); add(b, pad(d, [NOTE(33), NOTE(40), NOTE(45), NOTE(52)], { att: 3, rel: 2, cutoff: 500 }), 0, 0.6);
    for (let t = 1; t < d; t += 2.2) { const f = NOTE([69, 72, 76, 79, 84][Math.floor(rnd() * 5)]); add(b, metal(3, f).map(v => v * 0.25), t, 0.5); } return b; },
  countdown(d) { const b = buf(d); for (let t = 0; t < d; t += 0.5) { add(b, drum('kick'), t, 0.5 + t / d * 0.3); add(b, drum('hat'), t + 0.25, 0.2); }
    add(b, pad(d, [NOTE(38), NOTE(45)], { att: 0.5, rel: 0.1, cutoff: 400 }), 0, 0.5);
    const r = buf(d); let p = 0; for (let i = 0; i < r.length; i++) { const t = i / SR; p += NOTE(57 + 12 * t / d) / SR; r[i] = (2 * (p % 1) - 1) * 0.05 * (t / d); } add(b, lp(r, 2500), 0, 1); return b; },
  glitch(d) { const b = buf(d); for (let t = 0; t < d; t += 0.12) if (rnd() < 0.5) add(b, glitchBurst(0.1), t, 0.6); add(b, pad(d, [NOTE(30), NOTE(31)], { att: 0.05, rel: 0.1, cutoff: 300 }), 0, 0.8); return b; },
  hope(d) { const b = buf(d); const beat = 60 / 84; const chords = [[48, 55, 64], [43, 50, 59], [45, 52, 60], [41, 48, 57]]; const mel = [76, 79, 81, 79, 76, 74, 72, 74];
    for (let bar = 0, t = 0; t < d; bar++, t += beat * 4) { const ch = chords[bar % 4]; add(b, pad(beat * 4.3, ch.map(NOTE), { att: 0.6, rel: 1.2, cutoff: 1100 }), t, 0.2 + Math.min(0.15, t / d * 0.2));
      add(b, pianoNote(NOTE(ch[0] - 12), beat * 4), t, 0.3); for (let k = 0; k < 4; k++) add(b, pianoNote(NOTE(ch[k % 3] + 12), beat * 1.5), t + k * beat + beat / 2, 0.12);
      if (bar % 2 === 1) for (let k = 0; k < 4; k++) add(b, pianoNote(NOTE(mel[(bar * 2 + k) % 8]), beat * 2), t + k * beat, 0.2); }
    return b; },
  wonder(d) { const b = buf(d); const beat = 60 / 72; const chords = [[48, 55, 60, 64, 67], [41, 48, 57, 60, 65], [45, 52, 57, 60, 64], [43, 50, 55, 59, 62]];
    for (let bar = 0, t = 0; t < d; bar++, t += beat * 4) { const ch = chords[bar % 4]; const sw = Math.min(1, t / (d * 0.5) + 0.3);
      add(b, pad(beat * 4.4, ch.map(NOTE), { att: 0.4, rel: 1.4, formant: bar > 0, cutoff: 1600 }), t, 0.3 * sw); add(b, drum('taiko'), t, 0.35 * sw);
      for (let k = 0; k < 8; k++) add(b, tone(beat / 2, NOTE(ch[(k * 2) % 5] + 12), NOTE(ch[(k * 2) % 5] + 12), { type: 'tri', decay: 0.15 }), t + k * beat / 2, 0.1 * sw);
      add(b, pianoNote(NOTE(ch[4] + 12), beat * 3), t, 0.25); }
    return b; },
  end(d) { const b = buf(d); add(b, SFX.impactDeep(), 0, 0.8); add(b, pad(d, [NOTE(26), NOTE(33), NOTE(38)], { att: 0.5, rel: 2.5, cutoff: 300 }), 0, 0.8); return b; },
};
const AMB = {
  day: d => mix([lp(noiseBuf(d, t => 0.5 + 0.3 * Math.sin(t * 0.3)), 600), 0.25], [SFX.birds({ dur: d }), 0.5]),
  night: d => { const b = mix([lp(noiseBuf(d, t => 0.5 + 0.3 * Math.sin(t * 0.21)), 400), 0.3]); for (let t = 0; t < d; t += 0.9 + rnd() * 0.6) { for (let j = 0; j < 3; j++) add(b, tone(0.03, 4300, 4300, { decay: 0.01 }), t + j * 0.05, 0.05); } return b; },
  cave: d => { const b = mix([lp(noiseBuf(d, t => 0.6 + 0.3 * Math.sin(t * 0.17)), 180), 0.6]); for (let t = 0.5; t < d; t += 1.5 + rnd() * 3) add(b, tone(0.12, 1400 + rnd() * 800, 700, { decay: 0.03 }), t, 0.12); return b; },
  wind: d => mix([biquad(noiseBuf(d, t => 0.5 + 0.4 * Math.sin(t * 0.4)), 'bp', 500, 0.6), 0.4], [lp(noiseBuf(d), 120), 0.4]),
  sky: d => mix([biquad(noiseBuf(d, t => 0.5 + 0.35 * Math.sin(t * 0.37) * Math.sin(t * 0.11)), 'bp', 700, 0.5), 0.35], [lp(noiseBuf(d), 140), 0.25]),
  nether: d => { const b = mix([lp(noiseBuf(d, t => 0.7 + 0.3 * Math.sin(t * 0.3)), 120), 0.9]); for (let t = 0.2; t < d; t += 0.15 + rnd() * 0.5) add(b, hp(noiseBuf(0.03, t2 => Math.exp(-t2 * 120)), 1200), t, 0.25 * rnd()); for (let t = 1; t < d; t += 3 + rnd() * 3) add(b, lp(noiseBuf(0.5, t2 => Math.exp(-t2 * 5)), 400), t, 0.5); return b; },
  void: d => mix([lp(noiseBuf(d, t => 0.5 + 0.4 * Math.sin(t * 0.13)), 150), 0.5], [pad(d, [NOTE(21)], { att: 3, rel: 3, cutoff: 120 }), 0.6]),
};

// ------------------------------------------------------------------ reverb (Freeverb)
function freeverb(inL, room = 0.82, damp = 0.35, spread = 23) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], aps = [556, 441, 341, 225]; const scale = SR / 44100;
  const run = (off) => { const out = new Float32Array(inL.length);
    const cs = combs.map(c => ({ b: new Float32Array(Math.round((c + off) * scale)), i: 0, f: 0 })), as = aps.map(a => ({ b: new Float32Array(Math.round((a + off) * scale)), i: 0 }));
    for (let n = 0; n < inL.length; n++) { const x = inL[n] * 0.015; let y = 0;
      for (const c of cs) { const o = c.b[c.i]; c.f = o * (1 - damp) + c.f * damp; c.b[c.i] = x + c.f * room; if (++c.i >= c.b.length) c.i = 0; y += o; }
      for (const a of as) { const o = a.b[a.i]; const v = -y + o; a.b[a.i] = y + o * 0.5; if (++a.i >= a.b.length) a.i = 0; y = v; }
      out[n] = y; }
    return out; };
  return [run(0), run(spread)];
}

// ------------------------------------------------------------------ WAV io
function readWav(file) { const d = fs.readFileSync(file); let p = 12, fmt, data; while (p < d.length) { const id = d.toString('ascii', p, p + 4), sz = d.readUInt32LE(p + 4); if (id === 'fmt ') fmt = { ch: d.readUInt16LE(p + 10), sr: d.readUInt32LE(p + 12), bits: d.readUInt16LE(p + 22) }; if (id === 'data') data = d.subarray(p + 8, p + 8 + sz); p += 8 + sz + (sz % 2); }
  const n = data.length / 2 / fmt.ch; const o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = data.readInt16LE(i * 2 * fmt.ch) / 32768; return o; }
function writeWav(file, L, R) { const n = L.length; const b = Buffer.alloc(44 + n * 4); b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4); } fs.writeFileSync(file, b); }

// ------------------------------------------------------------------ main
const t0 = Date.now();
fs.mkdirSync(BUILD, { recursive: true });
const cuesFile = path.join(BUILD, 'cues.json');
let cues; if (process.argv.includes('--cached') && fs.existsSync(cuesFile)) cues = JSON.parse(fs.readFileSync(cuesFile)); else { cues = await getCues(); fs.writeFileSync(cuesFile, JSON.stringify(cues, null, 0)); }
console.log(`cues: ${cues.length}`);
const music = new Float32Array(LEN), amb = new Float32Array(LEN), sfxL = new Float32Array(LEN), sfxR = new Float32Array(LEN), voice = new Float32Array(LEN), sfxSend = new Float32Array(LEN);
// music
for (const m of MUSIC) { const st = G(m.scene, m.t), d = m.end - m.t; seed = Math.round(st * 1000) + 7; const seg = MOODS[m.mood](d, st);
  const n = Math.round(d * SR), o = Math.round(st * SR); for (let i = 0; i < n && i < seg.length && o + i < LEN; i++) { const t = i / SR; const e = Math.min(1, t / m.fin, (d - t) / m.fout); music[o + i] += seg[i] * Math.max(0, e) * m.gain; } }
// ambience
for (const a of AMBIENCE) { const st = G(a.scene, a.t), d = a.end - a.t; seed = Math.round(st * 77) + 3; const seg = AMB[a.kind](d); const n = seg.length; for (let i = 0; i < n; i++) { const t = i / SR; seg[i] *= Math.min(1, t / 1.0, (d - t) / 1.0) * a.gain; } add(amb, seg, st, 1); }
// sfx
const missing = new Set(); const cache = new Map();
for (const c of cues) { const fn = SFX[c.id]; if (!fn) { missing.add(c.id); continue; }
  const key = c.id + (c.surface || '') + (c.pitch || '') + (c.dur || ''); let s;
  const variants = ['step', 'stepPhantom', 'punchWood', 'mineStone', 'place', 'type', 'click', 'craftHit'].includes(c.id) ? 4 : 1;
  const vk = key + '#' + Math.floor(rnd() * variants); if (cache.has(vk)) s = cache.get(vk); else { seed = (vk.length * 991 + cache.size * 31) | 1; s = fn(c); cache.set(vk, s); }
  const pan = c.id.startsWith('step') ? (rnd() - 0.5) * 0.3 : (rnd() - 0.5) * 0.2; const g = (c.gain ?? 1) * 0.55;
  add(sfxL, s, c.t, g * (1 - pan)); add(sfxR, s, c.t, g * (1 + pan)); add(sfxSend, s, c.t, g * (c.id === 'stepPhantom' || c.id === 'knock' ? 1.2 : 0.35)); }
if (missing.size) console.warn('no sound for cue ids:', [...missing].join(', '));
// voice
for (const l of LINES) { const f = path.join(BUILD, 'voice', l.id + '.wav'); if (!fs.existsSync(f)) continue; const v = readWav(f); add(voice, v, G(l.scene, l.t), l.kind === 'whisper' ? 0.8 : l.kind === 'blockFar' ? 0.6 : 1.0); }
// ducking envelope from voice
const duck = new Float32Array(LEN); { let e = 0; const att = 1 - Math.exp(-1 / (0.03 * SR)), rel = 1 - Math.exp(-1 / (0.35 * SR)); for (let i = 0; i < LEN; i++) { const x = Math.abs(voice[i]) > 0.02 ? 1 : 0; e += (x > e ? att : rel) * (x - e); duck[i] = e; } }
// reverbs
const [mL, mR] = freeverb(music, 0.86, 0.3); const [sL, sR] = freeverb(sfxSend, 0.8, 0.4); const [vL, vR] = freeverb(voice, 0.5, 0.5);
const L = new Float32Array(LEN), R = new Float32Array(LEN);
for (let i = 0; i < LEN; i++) {
  const dm = 1 - 0.5 * duck[i], da = 1 - 0.35 * duck[i];
  const mus = (music[i] * 0.75) * dm, musL = mus + mL[i] * 0.55 * dm, musR = mus + mR[i] * 0.55 * dm;
  L[i] = musL * 0.8 + amb[i] * da * 0.7 + sfxL[i] + sL[i] * 0.5 + voice[i] * 1.0 + vL[i] * 0.12;
  R[i] = musR * 0.8 + amb[i] * da * 0.7 + sfxR[i] + sR[i] * 0.5 + voice[i] * 1.0 + vR[i] * 0.12;
}
// gentle bus compression + soft-clip limiter
const sample = []; for (let i = 0; i < LEN; i += 37) sample.push(Math.abs(L[i]));
sample.sort((x, y) => x - y); const p999 = sample[Math.floor(sample.length * 0.9985)];
const pre = 0.8 / Math.max(p999, 1e-6); // big impacts get soft-clipped instead of pulling the whole mix down for (let i = 0; i < LEN; i++) { L[i] = Math.tanh(L[i] * pre) * 0.92; R[i] = Math.tanh(R[i] * pre) * 0.92; }
writeWav(path.join(BUILD, 'soundtrack.wav'), L, R);
console.log(`soundtrack: build/soundtrack.wav  ${(LEN / SR).toFixed(1)}s  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
void sceneById;
