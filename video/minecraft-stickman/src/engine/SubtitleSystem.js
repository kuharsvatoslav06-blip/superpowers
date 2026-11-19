// SubtitleSystem: animated word-by-word subtitles plus all 2D screen overlays (title, chapter cards,
// crafting / chest / inventory panels, book pages, map, countdown, end card). Pure function of time.
import { LINES, OVERLAYS, globalize } from '../story/script.js';
import { clamp, prog, Ease, hash, lerp, rng, TAU } from './AnimationSystem.js';
import VOICE from '../generated/voice.js';

const W = 1920, H = 1080;
const FONT = { sub: '800 52px Montserrat', subI: 'italic 700 52px Montserrat', pixel: 'Silkscreen', mono: 'VT323', big: 'Montserrat' };

// ------------------------------------------------------------- subtitles
function parseWords(text) {
  const out = []; let hl = false;
  for (const raw of text.split(/\s+/)) {
    let w = raw; let on = hl;
    if (w.startsWith('*')) { on = true; w = w.slice(1); }
    let close = false; if (w.endsWith('*')) { close = true; w = w.slice(0, -1); } else if (/\*[^a-z]*$/i.test(w)) { close = true; w = w.replace('*', ''); }
    out.push({ w, hl: on }); hl = on && !close;
  }
  return out;
}
export function lineTiming(line) {
  const v = VOICE[line.id]; const words = parseWords(line.text);
  const dur = v ? v.dur : Math.max(0.8, words.length * 0.36);
  const chars = words.map(w => w.w.length + 2); const total = chars.reduce((a, b) => a + b, 0);
  let acc = 0; words.forEach((w, i) => { w.t = (acc / total) * dur * 0.92; acc += chars[i]; });
  return { words, dur };
}
const SUBS = globalize(LINES).map(l => ({ ...l, ...lineTiming(l) }));
export function speaking(t, who = 'hero') { // 0..1 talk intensity for lip flap (dialogue only, not narration)
  for (const l of SUBS) if (l.who === who && l.kind !== 'nar' && t >= l.gt && t <= l.gt + l.dur) return 1;
  return 0;
}
function chunkWords(words) { // break into readable chunks (max ~34 chars)
  const chunks = []; let cur = []; let len = 0;
  for (const w of words) { if (cur.length && len + w.w.length > 34) { chunks.push(cur); cur = []; len = 0; } cur.push(w); len += w.w.length + 1; }
  if (cur.length) chunks.push(cur); return chunks;
}
function drawSubtitles(ctx, t) {
  for (const l of SUBS) {
    const lt = t - l.gt; if (lt < 0 || lt > l.dur + 0.6) continue;
    const chunks = chunkWords(l.words);
    let ci = 0; for (let i = 0; i < chunks.length; i++) if (lt >= chunks[i][0].t - 0.02) ci = i;
    const chunk = chunks[ci]; const end = ci + 1 < chunks.length ? chunks[ci + 1][0].t : l.dur + 0.6;
    const fadeOut = clamp((end - lt) / 0.15);
    const italic = l.kind === 'whisper' || l.kind === 'read' || l.kind === 'nar';
    const size = l.kind === 'whisper' ? 46 : 52;
    ctx.font = `${italic ? 'italic 700' : '800'} ${size}px Montserrat`;
    const space = ctx.measureText(' ').width; const widths = chunk.map(w => ctx.measureText(w.w).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (chunk.length - 1);
    let x = W / 2 - total / 2; const y = 990;
    const base = l.kind === 'entity' ? '#ff5a5a' : l.kind === 'nar' ? '#fff3d6' : '#ffffff';
    const hlc = l.kind === 'entity' ? '#ff1e1e' : '#ffd23a';
    chunk.forEach((w, i) => {
      const k = clamp((lt - w.t) / 0.14); if (k <= 0) { x += widths[i] + space; return; }
      const s = 0.55 + 0.45 * Ease.outBack(k);
      ctx.save(); ctx.translate(x + widths[i] / 2, y); ctx.scale(s, s); ctx.globalAlpha = k * fadeOut;
      if (l.kind === 'entity') ctx.translate((hash(t * 30 + i) - 0.5) * 6, (hash(t * 40 + i) - 0.5) * 3);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      ctx.lineWidth = 11; ctx.strokeStyle = 'rgba(0,0,0,0.95)'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
      ctx.strokeText(w.w, 0, 0); ctx.shadowColor = 'transparent';
      ctx.fillStyle = w.hl ? hlc : base; ctx.fillText(w.w, 0, 0); ctx.restore();
      x += widths[i] + space;
    });
  }
}

// ------------------------------------------------------------- pixel icons
const ICONS = {
  log: ['..bbbbbbbb..', '.bLLLLLLLLb.', 'bLlllllllLLb', 'bLlrrrrrlLLb', 'bLlr..rrlLLb', 'bLlrrrrrlLLb', 'bLllllllllLb', 'bBBdBBdBBBBb', 'bBdBBdBBdBBb', 'bBBdBBBdBBBb', '.bBdBBdBBBb.', '..bbbbbbbb..'],
  planks: ['pppppppppppp', 'pPPPPPPPPPPp', 'pPPPPPnPPPPp', 'dddddddddddd', 'pPPPPPPPPPPp', 'pPnPPPPPPPPp', 'dddddddddddd', 'pPPPPPPPPPPp', 'pPPPPPPPnPPp', 'dddddddddddd', 'pPPPPPPPPPPp', 'pppppppppppp'],
  table: ['dddddddddddd', 'dPPkPPkPPPPd', 'dPPkPPkPPPPd', 'dkkkkkkkkkkd', 'dPPkPPkPPPPd', 'dBBBBBBBBBBd', 'dBggBBBBsBBd', 'dBgBBBBBsBBd', 'dBgBBBBBsBBd', 'dBgBBBBBsBBd', 'dBBBBBBBBBBd', 'dddddddddddd'],
  stick: ['..........dd', '.........dsd', '........dsd.', '.......dsd..', '......dsd...', '.....dsd....', '....dsd.....', '...dsd......', '..dsd.......', '.dsd........', 'dsd.........', 'dd..........'],
  woodPickaxe: ['..hhhhhhh...', '.hHHHHHHHh..', 'hHh..dsdHHh.', 'hh...dsd.hHh', '.....dsd..hh', '.....dsd....', '.....dsd....', '.....dsd....', '.....dsd....', '.....dsd....', '.....dsd....', '.....ddd....'],
  diamondPickaxe: ['..ccccccc...', '.cCCCCCCCc..', 'cCc..dsdCCc.', 'cc...dsd.cCc', '.....dsd..cc', '.....dsd....', '.....dsd....', '.....dsd....', '.....dsd....', '.....dsd....', '.....dsd....', '.....ddd....'],
  goldenApple: ['.....dg.....', '.....d.gg...', '...yyddyy...', '..yYYYYYYy..', '.yYWYYYYYYy.', '.yYWYYYYYYy.', '.yYYYYYYYYy.', '.yYYYYYYYYy.', '.yYYYYYYYYy.', '..yYYYYYYy..', '...yyyyyy...', '............'],
  book: ['..bbbbbbbbb.', '.bRRRRRRRRwb', '.bRRRRRRRRwb', '.bRRggggRRwb', '.bRRgRRgRRwb', '.bRRggggRRwb', '.bRRRRRRRRwb', '.bRRRRRRRRwb', '.bRRRRRRRRwb', '.bRRRRRRRRwb', '.bbbbbbbbbwb', '..wwwwwwwww.'],
  map: ['mmmmmmmmmmmm', 'mMMMMMMMMMMm', 'mMgggMMMMMMm', 'mMggggMbbMMm', 'mMMgMMMbbbMm', 'mMMMMMMMbMMm', 'mMMMxMMMMMMm', 'mMMMMMgggMMm', 'mMbbMMggggMm', 'mMbbbMMMMMMm', 'mMMMMMMMMMMm', 'mmmmmmmmmmmm'],
  iron: ['............', '....oooo....', '...oIIIIo...', '..oIiIIIIo..', '.oIIIIIiIIo.', '.oIiIIIIIIo.', '.oIIIIiIIo..', '..oIIIIIIo..', '...ooIIo....', '.....oo.....', '............', '............'],
};
const ICOL = { b: '#3d2a12', L: '#b08d59', l: '#c9a46a', r: '#8a6a3a', B: '#6b4f2a', d: '#3d2a12', p: '#6e5230', P: '#b48a55', n: '#5b4326', k: '#5b4326',
  g: '#9a9a9a', s: '#8f6538', h: '#3d2a12', H: '#b48a55', c: '#0f4d48', C: '#7ff5ea', y: '#a0761a', Y: '#f5c542', W: '#fff6c8', R: '#7a2e1a', w: '#efe6cc', m: '#6b5a3a', M: '#e2d3a6', x: '#d8322a', o: '#6e4e3a', I: '#d8a77e', i: '#f0d0b0' };
export function drawIcon(ctx, name, x, y, size) {
  const rows = ICONS[name]; if (!rows) return; const p = size / 12;
  rows.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '.') return; ctx.fillStyle = (name === 'book' && ch === 'g') ? '#e6c24a' : ICOL[ch]; ctx.fillRect(Math.round(x + c * p), Math.round(y + r * p), Math.ceil(p), Math.ceil(p)); }));
}

// ------------------------------------------------------------- UI primitives
function pixelText(ctx, text, x, y, size, color = '#fff', align = 'left', shadow = true, font = FONT.pixel, weight = 400) {
  ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if (shadow) { ctx.fillStyle = 'rgba(40,40,40,0.95)'; ctx.fillText(text, x + size * 0.1, y + size * 0.1); }
  ctx.fillStyle = color; ctx.fillText(text, x, y);
}
function panel(ctx, x, y, w, h) {
  ctx.fillStyle = '#000'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = '#c6c6c6'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, w, 6); ctx.fillRect(x, y, 6, h);
  ctx.fillStyle = '#555555'; ctx.fillRect(x, y + h - 6, w, 6); ctx.fillRect(x + w - 6, y, 6, h);
}
function slot(ctx, x, y, s, glow = 0) {
  ctx.fillStyle = '#8b8b8b'; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = '#373737'; ctx.fillRect(x, y, s, 4); ctx.fillRect(x, y, 4, s);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y + s - 4, s, 4); ctx.fillRect(x + s - 4, y, 4, s);
  if (glow > 0) { ctx.fillStyle = `rgba(255,255,255,${0.45 * glow})`; ctx.fillRect(x + 4, y + 4, s - 8, s - 8); }
}
function tooltip(ctx, text, x, y, color = '#ffffff', a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.font = `400 26px ${FONT.pixel}`; const w = ctx.measureText(text).width + 28;
  ctx.fillStyle = 'rgba(16,0,16,0.94)'; ctx.fillRect(x, y, w, 46); ctx.strokeStyle = '#2a0a5e'; ctx.lineWidth = 4; ctx.strokeRect(x + 3, y + 3, w - 6, 40);
  pixelText(ctx, text, x + 14, y + 33, 26, color); ctx.restore();
}
function popScale(lt, d = 0.25) { return Ease.outBack(clamp(lt / d)); }

// ------------------------------------------------------------- overlay renderers
const R = {};
R.title = (ctx, lt, o, t) => {
  const a = clamp(lt / 0.15) * clamp((o.gend - o.gt - lt) / 0.3);
  ctx.save(); ctx.globalAlpha = a * 0.55; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const s1 = 1 + 0.9 * (1 - Ease.out3(clamp(lt / 0.22)));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 470); ctx.scale(s1, s1); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 96px ${FONT.big}`; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.lineJoin = 'round'; ctx.strokeText('I SURVIVED 100 DAYS', 0, -58); ctx.strokeText('IN MINECRAFT', 0, 52);
  ctx.fillStyle = '#ffffff'; ctx.fillText('I SURVIVED 100 DAYS', 0, -58); ctx.fillStyle = '#5fd35a'; ctx.fillText('IN MINECRAFT', 0, 52); ctx.restore();
  const k2 = clamp((lt - 0.85) / 0.12);
  if (k2 > 0) {
    const jit = (hash(Math.floor(t * 24)) - 0.5) * 14 * (lt < 1.4 ? 1 : 0.25);
    ctx.save(); ctx.globalAlpha = a * k2; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 74px ${FONT.big}`;
    const y = 660; const txt = '...BUT SOMETHING WAS WRONG';
    ctx.lineWidth = 14; ctx.strokeStyle = '#000'; ctx.strokeText(txt, W / 2 + jit, y);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,0,60,0.9)'; ctx.fillText(txt, W / 2 + jit - 6, y); ctx.fillStyle = 'rgba(0,200,255,0.7)'; ctx.fillText(txt, W / 2 + jit + 6, y);
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#ff2b3a'; ctx.fillText(txt, W / 2 + jit, y); ctx.restore();
  }
};
R.chapter = (ctx, lt, o, t) => {
  const dur = o.gend - o.gt; const k = Ease.out3(clamp(lt / 0.4)) - Ease.in3(clamp((lt - dur + 0.4) / 0.4));
  const x = -520 + 600 * k; let jx = 0; if (o.glitch && hash(Math.floor(t * 20)) < 0.25) jx = (hash(t * 99) - 0.5) * 30;
  ctx.save(); ctx.globalAlpha = clamp(k * 1.4);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - 80 + jx, 70, 520, 150); ctx.fillStyle = o.glitch ? '#ff2b6a' : '#5fd35a'; ctx.fillRect(x - 80 + jx, 70, 10, 150);
  pixelText(ctx, o.text, x - 40 + jx, 150, 70, '#ffffff', 'left', true, FONT.pixel, 700);
  pixelText(ctx, o.sub, x - 38 + jx, 196, 30, o.glitch ? '#ff9ab8' : '#cfeec0');
  ctx.restore();
};
R.pickup = (ctx, lt, o) => {
  const dur = o.gend - o.gt; const a = clamp(lt / 0.15) * clamp((dur - lt) / 0.35); const y = 640 - Ease.out(clamp(lt / dur)) * 40;
  ctx.save(); ctx.globalAlpha = a; const s = popScale(lt); ctx.translate(1450, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(-20, -50, 450, 84); drawIcon(ctx, o.icon, -6, -44, 72);
  pixelText(ctx, o.text, 80, 6, 32, '#ffffff'); ctx.restore();
};
R.montage = (ctx, lt, o, t) => {
  const dur = o.gend - o.gt; const a = clamp(lt / 0.1) * clamp((dur - lt) / 0.2);
  ctx.save(); ctx.globalAlpha = a; pixelText(ctx, '▶▶ FAST FORWARD', W - 70, 110, 40, '#ffffff', 'right');
  const n = Math.min(4, 1 + Math.floor(lt / (dur / 4))); const s = 1 + 0.3 * (1 - clamp(((lt % (dur / 4)) / 0.15)));
  ctx.translate(1530, 520); ctx.scale(s, s); pixelText(ctx, 'x' + n, 0, 0, 150, '#ffd23a', 'center', true, FONT.pixel, 700); ctx.restore();
  // speed lines
  ctx.save(); ctx.globalAlpha = a * 0.35; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; const r = rng(Math.floor(t * 15) + 1);
  for (let i = 0; i < 22; i++) { const y = r() * H, x = r() * W, l = 120 + r() * 300; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.stroke(); } ctx.restore();
};
R.craft = (ctx, lt, o) => {
  const dur = o.gend - o.gt; const a = Ease.outBack(clamp(lt / 0.3)); const out = clamp((dur - lt) / 0.25);
  const px = 1040, py = 230, S = 92;
  ctx.save(); ctx.globalAlpha = out; ctx.translate(px + 360, py + 180); ctx.scale(a, a); ctx.translate(-(px + 360), -(py + 180));
  panel(ctx, px, py, 720, 380); pixelText(ctx, 'Crafting', px + 30, py + 52, 30, '#404040', 'left', false);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) slot(ctx, px + 40 + c * S, py + 80 + r * S, S);
  // arrow
  ctx.fillStyle = '#8b8b8b'; ctx.fillRect(px + 360, py + 205, 90, 26); ctx.beginPath(); ctx.moveTo(px + 450, py + 185); ctx.lineTo(px + 500, py + 218); ctx.lineTo(px + 450, py + 251); ctx.fill();
  const rx = px + 540, ry = py + 170; slot(ctx, rx, ry, S + 20, 0);
  // step 1: log -> 4 planks ; step 2: 4 planks -> crafting table
  if (lt < 1.5) {
    if (lt > 0.5) drawIcon(ctx, 'log', px + 40 + S + 10, py + 80 + S + 10, S - 20);
    if (lt > 0.75) { const s = popScale(lt - 0.75); ctx.save(); ctx.translate(rx + 56, ry + 56); ctx.scale(s, s); drawIcon(ctx, 'planks', -40, -40, 80); pixelText(ctx, '4', 30, 40, 30, '#fff', 'right'); ctx.restore(); }
  } else {
    const cells = [[0, 0], [1, 0], [0, 1], [1, 1]];
    cells.forEach(([c, r], i) => { if (lt > 1.55 + i * 0.12) drawIcon(ctx, 'planks', px + 40 + c * S + 10, py + 80 + r * S + 10, S - 20); });
    if (lt > 2.15) { const s = popScale(lt - 2.15); ctx.save(); ctx.translate(rx + 56, ry + 56); ctx.scale(s, s); drawIcon(ctx, 'table', -42, -42, 84); ctx.restore(); if (lt > 2.3) slot(ctx, rx, ry, S + 20, 0.5 * Math.abs(Math.sin(lt * 9))), drawIcon(ctx, 'table', rx + 14, ry + 14, 84); }
  }
  ctx.restore();
};
R.craft.cues = o => [0.5, 0.75, 1.55, 1.67, 1.79, 1.91, 2.15].map((d, i) => ({ t: o.gt + d, id: i === 1 || i === 6 ? 'craftDone' : 'click', gain: 0.8 }));
R.watch = (ctx, lt, o, t) => {
  const dur = o.gend - o.gt; const a = Ease.outBack(clamp(lt / 0.25)) * clamp((dur - lt) / 0.15);
  const cx = 1460, cy = 470, r = 250;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(a, a);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(0, 0, r + 14, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f2e6c8'; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#111'; ctx.stroke();
  // stick-arm with watch
  ctx.fillStyle = '#121212'; ctx.fillRect(-r, -24, r * 2, 48);
  ctx.fillStyle = '#333'; ctx.fillRect(-120, -95, 240, 190); ctx.fillStyle = '#9fc77a'; ctx.fillRect(-100, -72, 200, 144);
  const late = lt > 1.25; const blink = late && Math.floor(lt * 4) % 2 === 0;
  ctx.font = `400 92px ${FONT.mono}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1d2a12';
  ctx.fillText(late ? (blink ? '11:59' : '11 59') : '11:58', 0, -6); ctx.font = `400 40px ${FONT.mono}`; ctx.fillText('PM', 70, 48);
  ctx.restore(); void t;
};
R.watch.cues = o => [{ t: o.gt + 0.05, id: 'whoosh', gain: 0.4 }, { t: o.gt + 1.25, id: 'beep', gain: 0.6 }];
R.dayStamp = (ctx, lt, o, t) => {
  const dur = o.gend - o.gt; const n = Math.floor(lt / 0.06); const txt = o.text.slice(0, n);
  const a = clamp((dur - lt) / 0.3); const flick = hash(Math.floor(t * 20)) < 0.08 ? 0.3 : 1;
  ctx.save(); ctx.globalAlpha = a * flick; ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 440, W, 170);
  ctx.translate(W / 2 + (hash(Math.floor(t * 30)) - 0.5) * 4, 560); pixelText(ctx, txt, 0, 0, 96, '#ff3b3b', 'center', true, FONT.pixel, 700);
  if (lt % 0.5 < 0.25 && n >= o.text.length) { ctx.fillStyle = '#ff3b3b'; ctx.fillRect(470, -70, 26, 80); }
  ctx.restore();
};
R.dayStamp.cues = o => [...o.text].map((ch, i) => ch === ' ' ? null : { t: o.gt + i * 0.06, id: 'type', gain: 0.5 }).filter(Boolean);
R.tag = (ctx, lt, o, t) => {
  const dur = o.gend - o.gt; const k = Ease.outBack(clamp(lt / 0.3)) * clamp((dur - lt) / 0.25);
  ctx.save(); ctx.translate(W - 80, 90); ctx.scale(k, k); ctx.rotate(-0.04);
  ctx.fillStyle = '#e8283a'; ctx.fillRect(-430, -10, 430, 100); ctx.fillStyle = '#fff'; ctx.fillRect(-430, 80, 430, 10);
  pixelText(ctx, o.text, -405, 62, 46, '#ffffff', 'left', true, FONT.pixel, 700);
  pixelText(ctx, (Math.floor(t * 4) % 2 ? '▶▶ ' : '▶ ') + o.sub, -40, 160, 40, '#ffd23a', 'right');
  ctx.restore();
};
R.actionBar = (ctx, lt, o) => {
  const dur = o.gend - o.gt; const a = clamp(lt / 0.2) * clamp((dur - lt) / 0.5);
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.font = `400 40px ${FONT.pixel}`;
  const w = ctx.measureText(o.text).width + 50; ctx.fillRect(W / 2 - w / 2, 802, w, 64); pixelText(ctx, o.text, W / 2, 848, 40, '#ffffff', 'center'); ctx.restore();
};
R.actionBar.cues = o => [{ t: o.gt, id: 'error', gain: 0.7 }];
const CHEST_ITEMS = [['diamondPickaxe', 'Diamond Pickaxe', '#7ff5ea', 0.7, 3], ['goldenApple', 'Golden Apple x3', '#ffd23a', 2.2, 5], ['book', 'Strange Book', '#d68cff', 3.7, 12], ['map', 'Map', '#ffffff', 5.0, 14]];
R.chest = (ctx, lt, o) => {
  const dur = o.gend - o.gt; const a = Ease.outBack(clamp(lt / 0.3)); const out = clamp((dur - lt) / 0.3);
  const px = 990, py = 200, S = 84; const cols = 9;
  ctx.save(); ctx.globalAlpha = out; ctx.translate(px + 400, py + 170); ctx.scale(a, a); ctx.translate(-(px + 400), -(py + 170));
  panel(ctx, px, py, 800, 350); pixelText(ctx, 'Chest', px + 28, py + 48, 30, '#404040', 'left', false);
  for (let r = 0; r < 3; r++) for (let c = 0; c < cols; c++) slot(ctx, px + 22 + c * S, py + 70 + r * S, S);
  let last = null;
  for (const [icon, name, col, at, idx] of CHEST_ITEMS) {
    const k = lt - at; if (k < 0) continue;
    const c = idx % cols, r = Math.floor(idx / cols); const x = px + 22 + c * S, y = py + 70 + r * S;
    const s = popScale(k, 0.3); slot(ctx, x, y, S, clamp(1 - k / 0.8));
    ctx.save(); ctx.translate(x + S / 2, y + S / 2); ctx.scale(s, s); drawIcon(ctx, icon, -32, -32, 64); if (icon === 'goldenApple') pixelText(ctx, '3', 36, 38, 26, '#fff', 'right'); ctx.restore();
    last = [name, col, x + S, y - 10, k];
  }
  if (last) tooltip(ctx, last[0], last[2], last[3], last[1], clamp(last[4] / 0.2));
  ctx.restore();
};
R.chest.cues = o => [{ t: o.gt, id: 'click', gain: 0.6 }, ...CHEST_ITEMS.map(([icon, , , at]) => ({ t: o.gt + at, id: icon === 'diamondPickaxe' ? 'shine' : 'pop', gain: 0.8 }))];
function bookPage(ctx, x, y, w, h, lines, revealChars, pageLabel, red, t) {
  ctx.fillStyle = '#2a1a0e'; ctx.fillRect(x - 10, y - 10, w + 20, h + 20);
  const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#f6ecd0'); g.addColorStop(1, '#e3d3a8'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(120,90,50,0.12)'; for (let i = 0; i < 40; i++) ctx.fillRect(x + hash(i) * w, y + hash(i + 50) * h, 3, 3);
  pixelText(ctx, pageLabel, x + w - 30, y + 50, 34, '#6b5a3a', 'right', false, FONT.mono);
  let n = revealChars; ctx.font = `400 58px ${FONT.mono}`;
  lines.forEach((ln, i) => {
    const s = ln.slice(0, Math.max(0, n)); n -= ln.length;
    const jx = red ? (hash(Math.floor(t * 18) + i) - 0.5) * 5 : 0;
    pixelText(ctx, s, x + 50 + jx, y + 150 + i * 70, 58, red ? '#9e1010' : '#2b1d12', 'left', false, FONT.mono);
  });
}
R.book = (ctx, lt, o, t) => {
  const dur = o.gend - o.gt; const a = Ease.out3(clamp(lt / 0.35)) * clamp((dur - lt) / 0.35);
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
  ctx.translate(0, (1 - a) * 80);
  const x = 560, y = 110, w = 800, h = 760;
  if (o.page === 'first') {
    bookPage(ctx, x, y, w, h, ["If you're reading", 'this, the world', 'has already', 'noticed you.'], Math.floor((lt - 0.8) / 0.055), 'Page 1 of 3', false, t);
  } else {
    // flip through blank pages, then the last page
    const flips = [0.6, 1.4, 2.2];
    let page = 0; for (const f of flips) if (lt > f) page++;
    if (page < 3) { bookPage(ctx, x, y, w, h, page === 0 ? ["If you're reading", 'this, the world', 'has already', 'noticed you.'] : ['', '', '...'], 999, `Page ${page + 1} of 4`, false, t); }
    else bookPage(ctx, x, y, w, h, ['You reset the', 'world.', '', "You didn't", 'reset me.'], Math.floor((lt - 2.8) / 0.07), 'Page 4 of 4', true, t);
    const fk = flips.map(f => clamp((lt - f) / 0.25)).find(k => k > 0 && k < 1);
    if (fk !== undefined) { ctx.fillStyle = '#efe2bd'; ctx.beginPath(); const px = x + w - fk * w; ctx.moveTo(px, y); ctx.quadraticCurveTo(px - 60 * Math.sin(fk * Math.PI), y + h / 2, px, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y); ctx.fill(); }
  }
  ctx.restore();
};
R.book.cues = o => o.page === 'first' ? [{ t: o.gt, id: 'page', gain: 0.8 }] : [0, 0.6, 1.4, 2.2].map(d => ({ t: o.gt + d, id: 'page', gain: 0.8 }));
R.map = (ctx, lt, o, t) => {
  const dur = o.gend - o.gt; const a = Ease.outBack(clamp(lt / 0.3)) * clamp((dur - lt) / 0.3);
  const cx = 1380, cy = 500, S = 640;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(a, a); ctx.rotate(-0.03);
  ctx.fillStyle = '#5b4326'; ctx.fillRect(-S / 2 - 18, -S / 2 - 18, S + 36, S + 36); ctx.fillStyle = '#e2d3a6'; ctx.fillRect(-S / 2, -S / 2, S, S);
  const N = 40, c = S / N;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const v = Math.sin(x * 0.31) + Math.cos(y * 0.27) + Math.sin((x + y) * 0.13) * 1.5 + hash(x * 13 + y * 7) * 0.4;
    ctx.fillStyle = v < -0.9 ? '#6f8fd8' : v < -0.5 ? '#c9bf8a' : v < 1.0 ? '#9fb26a' : v < 1.8 ? '#7d9a52' : '#8a7a5a';
    ctx.fillRect(-S / 2 + x * c, -S / 2 + y * c, c + 0.5, c + 0.5);
  }
  // player marker
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(15, 16); ctx.lineTo(0, 8); ctx.lineTo(-15, 16); ctx.closePath(); ctx.fill(); ctx.stroke();
  // red dot moving toward the player, accelerating
  const k = Ease.in(clamp((lt - 0.8) / (dur - 1.4)));
  const dx = lerp(250, 30, k), dy = lerp(-240, -30, k);
  const pulse = (lt * 2) % 1; ctx.strokeStyle = `rgba(255,30,30,${1 - pulse})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(dx, dy, 14 + pulse * 40, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#ff1e1e'; ctx.beginPath(); ctx.arc(dx, dy, 14, 0, TAU); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore(); void t;
};
R.map.cues = o => { const out = [{ t: o.gt, id: 'page', gain: 0.6 }]; let d = 0.8, step = 0.55; while (d < o.gend - o.gt - 0.2) { out.push({ t: o.gt + d, id: 'radar', gain: 0.55 }); d += step; step = Math.max(0.16, step * 0.86); } return out; };
R.countdown = (ctx, lt, o, t) => {
  const n = o.from - Math.floor(lt); if (n < 1) return; const k = lt % 1;
  const s = 1.35 - 0.35 * Ease.out3(clamp(k / 0.3));
  ctx.save(); ctx.globalAlpha = 0.25 * (1 - k); ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, W, H); ctx.restore();
  ctx.save(); ctx.translate(1700, 170); ctx.scale(s, s); pixelText(ctx, String(n), 0, 50, 150, n <= 3 ? '#ff2b2b' : '#ffffff', 'center', true, FONT.pixel, 700); ctx.restore(); void t;
};
R.countdown.cues = o => { const out = []; for (let i = 0; i < o.from; i++) out.push({ t: o.gt + i, id: i >= o.from - 3 ? 'beepHigh' : 'beep', gain: 0.8 }); return out; };
R.inventory = (ctx, lt, o, t) => {
  const dur = o.gend - o.gt; const a = Ease.outBack(clamp(lt / 0.3)) * clamp((dur - lt) / 0.3);
  const zoom = 1 + Ease.inOut(clamp((lt - 3.0) / 1.5)) * 0.9;
  const px = 560, py = 260, S = 88; const bx = px + 22 + 6 * S, by = py + 300 + 2 * S + S / 2;
  ctx.save(); ctx.globalAlpha = clamp(a * 1.2); ctx.fillStyle = `rgba(0,0,0,${0.35 + 0.3 * clamp((lt - 3) / 1.5)})`; ctx.fillRect(0, 0, W, H);
  ctx.translate(bx + S / 2, by); ctx.scale(a * zoom, a * zoom); ctx.translate(-(bx + S / 2), -by);
  ctx.translate(lerp(0, W / 2 - (bx + S / 2), clamp((lt - 3) / 1.5)) / zoom, lerp(0, H / 2 - by, clamp((lt - 3) / 1.5)) / zoom);
  panel(ctx, px, py, 836, 640); pixelText(ctx, 'Inventory', px + 28, py + 50, 30, '#404040', 'left', false);
  ctx.fillStyle = '#000'; ctx.fillRect(px + 40, py + 70, 200, 210); ctx.fillStyle = '#2b2b2b'; ctx.fillRect(px + 44, py + 74, 192, 202);
  // tiny stickman portrait
  ctx.strokeStyle = '#111'; ctx.fillStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(px + 140, py + 120, 26, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px + 140, py + 146); ctx.lineTo(px + 140, py + 210); ctx.moveTo(px + 140, py + 160); ctx.lineTo(px + 110, py + 195); ctx.moveTo(px + 140, py + 160); ctx.lineTo(px + 170, py + 195); ctx.moveTo(px + 140, py + 210); ctx.lineTo(px + 120, py + 260); ctx.moveTo(px + 140, py + 210); ctx.lineTo(px + 160, py + 260); ctx.strokeStyle = '#ddd'; ctx.stroke();
  for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) slot(ctx, px + 22 + c * S, py + 300 + r * S, S);
  for (let c = 0; c < 9; c++) slot(ctx, px + 22 + c * S, py + 300 + 3 * S + 16, S);
  const glow = 0.5 + 0.5 * Math.sin(t * 6);
  slot(ctx, bx, by - S / 2, S, lt > 2.2 ? glow : 0);
  drawIcon(ctx, 'book', bx + 12, by - S / 2 + 12, 64);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(190,90,255,${0.25 + 0.2 * glow})`; ctx.fillRect(bx + 10, by - S / 2 + 10, S - 20, S - 20); ctx.restore();
  if (lt > 2.2) tooltip(ctx, 'Strange Book', bx + S, by - S / 2 - 20, '#d68cff', clamp((lt - 2.2) / 0.2));
  ctx.restore();
};
R.inventory.cues = o => [{ t: o.gt, id: 'click', gain: 0.7 }, { t: o.gt + 2.2, id: 'stinger', gain: 0.6 }];
R.theEnd = (ctx, lt, o, t) => {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const a = clamp(lt / 1.2); const g = hash(Math.floor(t * 16)) < 0.18 ? 1 : 0;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 150px ${FONT.big}`;
  const jx = g * (hash(t * 50) - 0.5) * 30;
  ctx.fillStyle = '#f2f2f2'; ctx.fillText('THE END', W / 2 - 60 + jx, H / 2);
  const q = lt > 1.6; if (q) { ctx.fillStyle = g ? '#ffffff' : '#ff1e3c'; ctx.fillText('?', W / 2 + 330 + jx * 2, H / 2); }
  if (g) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,0,80,0.6)'; ctx.fillText('THE END', W / 2 - 66 + jx, H / 2 + 4); ctx.fillStyle = 'rgba(0,200,255,0.5)'; ctx.fillText('THE END', W / 2 - 54 + jx, H / 2 - 4); }
  ctx.restore();
  // two glowing eyes in the dark, very late
  if (lt > 4.2) { const e = clamp((lt - 4.2) / 0.6) * (lt % 2.3 < 0.12 ? 0 : 1); ctx.save(); ctx.globalAlpha = e * 0.9; ctx.shadowColor = '#c040ff'; ctx.shadowBlur = 30; ctx.fillStyle = '#e070ff'; ctx.fillRect(W / 2 - 120, 860, 70, 16); ctx.fillRect(W / 2 + 50, 860, 70, 16); ctx.restore(); }
};
R.theEnd.cues = o => [{ t: o.gt + 1.6, id: 'glitchShort', gain: 0.6 }];

const OVS = globalize(OVERLAYS);
export class SubtitleSystem {
  constructor() { this.enabled = true; }
  draw(ctx, t, opts = {}) {
    for (const o of OVS) { if (t < o.gt || t > o.gend) continue; R[o.type]?.(ctx, t - o.gt, o, t); }
    if (opts.subtitles !== false) drawSubtitles(ctx, t);
  }
  cues() { const out = []; for (const o of OVS) if (R[o.type]?.cues) out.push(...R[o.type].cues(o)); return out; }
  lines() { return SUBS; }
}
