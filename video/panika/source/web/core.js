// ---------- core helpers ----------
const W = 1080, H = 1920, FPS = 30, DUR = 90;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (a, b, t) => { t = clamp((t - a) / (b - a)); return t * t * (3 - 2 * t); };
const eOut = t => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
const eIn = t => { t = clamp(t); return t * t * t; };
const eBack = t => { t = clamp(t); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = n => rng(Math.floor(n) * 9973 + 7)();
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i; const a = hash(i + seed * 1000), b = hash(i + 1 + seed * 1000); const u = f * f * (3 - 2 * f); return lerp(a, b, u) * 2 - 1; }
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function shade(h, a) { const c = hex2rgb(h).map(v => a < 0 ? v * (1 + a) : v + (255 - v) * a); return `rgb(${c.map(v => Math.round(v)).join(',')})`; }
function rgba(h, a) { const c = hex2rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
function mix(h1, h2, t) { const a = hex2rgb(h1), b = hex2rgb(h2); return '#' + a.map((v, i) => Math.round(lerp(v, b[i], t)).toString(16).padStart(2, '0')).join(''); }
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); }
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function spline(ctx, p, closed = true, ten = 0.5) {
  const n = p.length; const g = i => closed ? p[(i + n) % n] : p[clamp(i, 0, n - 1)];
  ctx.moveTo(p[0][0], p[0][1]);
  const m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * ten / 3, p1[1] + (p2[1] - p0[1]) * ten / 3, p2[0] - (p3[0] - p1[0]) * ten / 3, p2[1] - (p3[1] - p1[1]) * ten / 3, p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
function radial(ctx, x, y, r, stops) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function linear(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function glow(ctx, x, y, r, col, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = radial(ctx, x, y, r, [[0, col], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
function bg(ctx, c1, c2, cx = 540, cy = 900, r = 1300) { ctx.fillStyle = radial(ctx, cx, cy, r, [[0, c1], [1, c2]]); ctx.fillRect(0, 0, W, H); }
const OUT = 'rgba(20,6,26,0.85)';

// ---------- pulse ----------
function bpmAt(t) { const k = window.BPMK; for (let i = 0; i < k.length - 1; i++) if (t <= k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], (t - k[i][0]) / (k[i + 1][0] - k[i][0])); return k[k.length - 1][1]; }
function lastBeat(t) { let b = -10; for (const x of window.BEATS) { if (x <= t) b = x; else break; } return b; }
function beatPulse(t) { const d = t - lastBeat(t); return Math.exp(-d * 9); }

// ---------- hero ----------
const HERO_STUBBLE = (() => { const r = rng(11), a = []; for (let i = 0; i < 420; i++) { const x = (r() * 2 - 1) * 260, y = 150 + r() * 270; if (Math.abs(x) < 260 - (y - 150) * 0.5 && !(Math.abs(x) < 85 && y > 228 && y < 300)) a.push([x, y, 1.5 + r() * 2.2]); } return a; })();
const SWEAT = [[-170, -230, 0], [150, -260, 1.3], [40, -300, 2.1], [-230, 40, 0.7], [235, 10, 1.8], [-60, -250, 2.7], [200, -150, 0.4]];

function headPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(0, -405);
  ctx.bezierCurveTo(195, -405, 292, -285, 292, -110);
  ctx.bezierCurveTo(292, 40, 278, 170, 222, 282);
  ctx.bezierCurveTo(172, 372, 92, 414, 0, 416);
  ctx.bezierCurveTo(-92, 414, -172, 372, -222, 282);
  ctx.bezierCurveTo(-278, 170, -292, 40, -292, -110);
  ctx.bezierCurveTo(-292, -285, -195, -405, 0, -405);
  ctx.closePath();
}

// o: open, look{x,y}, pupil, red, bags, mouth, skin, shirt, sweat, t, brow(raise), lying
function drawHero(ctx, o) {
  const t = o.t || 0, skin = o.skin || '#d29a82', dark = shade(skin, -0.35), open = o.open ?? 1;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // body / hoodie
  if (!o.noBody) {
    ctx.fillStyle = o.shirt || '#2c3f9e';
    ctx.beginPath(); ctx.moveTo(-620, 1100); ctx.bezierCurveTo(-600, 700, -380, 600, -160, 560); ctx.lineTo(160, 560); ctx.bezierCurveTo(380, 600, 600, 700, 620, 1100); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = shade(o.shirt || '#2c3f9e', -0.3);
    ctx.beginPath(); ctx.moveTo(-210, 560); ctx.quadraticCurveTo(0, 760, 210, 560); ctx.lineTo(160, 545); ctx.quadraticCurveTo(0, 690, -160, 545); ctx.closePath(); ctx.fill();
  }
  // neck
  ctx.fillStyle = shade(skin, -0.22);
  ctx.beginPath(); ctx.moveTo(-145, 240); ctx.lineTo(-158, 590); ctx.quadraticCurveTo(0, 660, 158, 590); ctx.lineTo(145, 240); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(40,10,40,0.25)'; ctx.beginPath(); ctx.moveTo(-145, 300); ctx.quadraticCurveTo(0, 470, 145, 300); ctx.lineTo(145, 240); ctx.lineTo(-145, 240); ctx.fill();
  // ears
  for (const s of [-1, 1]) { ell(ctx, s * 290, -15, 50, 88); ctx.fillStyle = shade(skin, -0.08); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke(); ctx.beginPath(); ctx.arc(s * 292, -15, 30, s > 0 ? -1.2 : Math.PI - 1.2 + 2.4 - 2.4, s > 0 ? 1.2 : Math.PI + 1.2); ctx.strokeStyle = dark; ctx.lineWidth = 4; ctx.stroke(); }
  // head
  headPath(ctx); ctx.fillStyle = skin; ctx.fill();
  ctx.save(); headPath(ctx); ctx.clip();
  ctx.fillStyle = radial(ctx, -60, -120, 520, [[0, 'rgba(255,230,210,0.25)'], [0.55, 'rgba(0,0,0,0)'], [1, 'rgba(60,10,70,0.45)']]); ctx.fillRect(-400, -500, 800, 1000);
  ctx.fillStyle = 'rgba(70,20,90,0.18)'; ell(ctx, 230, 80, 90, 260); ctx.fill(); ell(ctx, -230, 80, 90, 260); ctx.fill();
  // cheeks redness
  if (o.red) { glow(ctx, -150, 110, 110, 'rgba(220,60,80,0.5)', o.red * 0.6); glow(ctx, 150, 110, 110, 'rgba(220,60,80,0.5)', o.red * 0.6); }
  // stubble
  ctx.fillStyle = 'rgba(45,25,35,0.32)';
  for (const [x, y, r] of HERO_STUBBLE) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  // forehead wrinkles
  const br = o.brow ?? 0.5;
  ctx.strokeStyle = rgba('#5a2a3a', 0.45 * br + 0.1); ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-120 + i * 8, -230 - i * 32); ctx.quadraticCurveTo(0, -250 - i * 32 - br * 10, 120 - i * 8, -230 - i * 32); ctx.stroke(); }
  ctx.restore();
  headPath(ctx); ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.stroke();
  // hair
  ctx.fillStyle = o.hair || '#1b1220';
  ctx.beginPath(); ctx.moveTo(-296, -95); ctx.bezierCurveTo(-312, -340, -175, -440, 0, -438); ctx.bezierCurveTo(175, -440, 312, -340, 296, -95);
  ctx.bezierCurveTo(282, -190, 250, -255, 205, -272); ctx.bezierCurveTo(110, -315, -110, -315, -205, -272); ctx.bezierCurveTo(-250, -255, -282, -190, -296, -95); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 3;
  for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(i * 30, -420 + Math.abs(i) * 6); ctx.lineTo(i * 34, -300 + Math.abs(i) * 4); ctx.stroke(); }
  // eyes
  const jit = o.jitter || 0;
  for (const s of [-1, 1]) drawEye(ctx, s * 118, -28, s, o, open, jit, t);
  // brows
  ctx.strokeStyle = o.hair || '#1b1220'; ctx.lineWidth = 22;
  for (const s of [-1, 1]) {
    const by = -128 - br * 40 + (o.angry ? 20 : 0);
    ctx.beginPath(); ctx.moveTo(s * 40, by + 8 - br * 22); ctx.quadraticCurveTo(s * 120, by - 28, s * 196, by + 14); ctx.stroke();
  }
  // nose
  ctx.strokeStyle = dark; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-26, -20); ctx.bezierCurveTo(-30, 50, -60, 105, -52, 135); ctx.stroke();
  ctx.fillStyle = 'rgba(255,235,220,0.25)'; ell(ctx, 12, 60, 14, 60); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-58, 140); ctx.quadraticCurveTo(-40, 168, 0, 168); ctx.quadraticCurveTo(40, 168, 58, 140); ctx.stroke();
  ctx.fillStyle = dark; ell(ctx, -26, 152, 12, 6); ctx.fill(); ell(ctx, 26, 152, 12, 6); ctx.fill();
  // nasolabial
  ctx.strokeStyle = rgba('#5a2a3a', 0.4); ctx.lineWidth = 4;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 72, 128); ctx.quadraticCurveTo(s * 110, 200, s * 100, 250); ctx.stroke(); }
  drawMouth(ctx, o.mouth || 'flat', t);
  // sweat
  if (o.sweat) for (const [x, y, ph] of SWEAT) {
    const k = ((t * 0.25 + ph * 0.37) % 1); const yy = y + k * 120; ctx.globalAlpha = o.sweat * (1 - k) * 0.95;
    ctx.fillStyle = '#e8f4ff'; ctx.beginPath(); ctx.moveTo(x, yy - 16); ctx.quadraticCurveTo(x + 10, yy, x, yy + 8); ctx.quadraticCurveTo(x - 10, yy, x, yy - 16); ctx.fill(); ctx.globalAlpha = 1;
  }
}
function drawEye(ctx, cx, cy, s, o, open, jit, t) {
  // bags
  if (o.bags) { ctx.fillStyle = `rgba(70,20,80,${0.45 * o.bags})`; ell(ctx, cx, cy + 52, 92, 36); ctx.fill(); ctx.strokeStyle = `rgba(60,15,60,${0.5 * o.bags})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy + 20, 78, 0.5, Math.PI - 0.5); ctx.stroke(); }
  if (open < 0.08) { // closed
    ctx.strokeStyle = OUT; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(cx - 70, cy); ctx.quadraticCurveTo(cx, cy + 34, cx + 70, cy); ctx.stroke();
    ctx.lineWidth = 4; for (let i = -2; i <= 2; i++) { const x = cx + i * 24, y = cy + 15 - Math.abs(i) * 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + i * 3, y + 14); ctx.stroke(); }
    return;
  }
  const up = 72 * open, lo = 48 * Math.min(1, open);
  const path = () => { ctx.beginPath(); ctx.moveTo(cx - 84, cy + 4); ctx.bezierCurveTo(cx - 50, cy - up, cx + 50, cy - up, cx + 84, cy - 2); ctx.bezierCurveTo(cx + 50, cy + lo, cx - 50, cy + lo, cx - 84, cy + 4); ctx.closePath(); };
  path(); ctx.fillStyle = mix('#f4eee8', '#f2b8b4', (o.red || 0) * 0.6); ctx.fill();
  ctx.save(); path(); ctx.clip();
  if (o.red) { ctx.strokeStyle = `rgba(200,20,40,${0.25 + o.red * 0.6})`; ctx.lineWidth = 2.2; const r = rng(s > 0 ? 3 : 4);
    for (let i = 0; i < 9; i++) { const side = r() > 0.5 ? 1 : -1; let x = cx + side * 84, y = cy + (r() - 0.5) * 40; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 4; j++) { x -= side * (10 + r() * 12); y += (r() - 0.5) * 18; ctx.lineTo(x, y); } ctx.stroke(); } }
  const lx = (o.look?.x || 0) * 26 + (jit ? noise1(t * 14, s + 3) * jit : 0), ly = (o.look?.y || 0) * 16 + (jit ? noise1(t * 13, s + 7) * jit : 0);
  const ix = cx + lx, iy = cy - 4 + ly;
  ctx.fillStyle = radial(ctx, ix, iy, 40, [[0, '#9fb9c9'], [0.6, '#6a8798'], [1, '#2c3d4c']]); ell(ctx, ix, iy, 38, 38); ctx.fill();
  ctx.strokeStyle = '#1c2630'; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = 'rgba(30,50,60,0.4)'; ctx.lineWidth = 2; for (let a = 0; a < 6.28; a += 0.4) { ctx.beginPath(); ctx.moveTo(ix + Math.cos(a) * 16, iy + Math.sin(a) * 16); ctx.lineTo(ix + Math.cos(a) * 34, iy + Math.sin(a) * 34); ctx.stroke(); }
  ctx.fillStyle = '#0b0b10'; ell(ctx, ix, iy, o.pupil || 14, o.pupil || 14); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; ell(ctx, ix - 13, iy - 13, 8, 8); ctx.fill(); ell(ctx, ix + 12, iy + 10, 4, 4); ctx.fill();
  ctx.fillStyle = 'rgba(60,20,40,0.18)'; ctx.fillRect(cx - 90, cy - up, 180, 22);
  ctx.restore();
  path(); ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.stroke();
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx - 86, cy + 4); ctx.bezierCurveTo(cx - 50, cy - up, cx + 50, cy - up, cx + 86, cy - 4); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(40,10,30,0.5)'; ctx.beginPath(); ctx.moveTo(cx - 70, cy - up * 0.55 - 14); ctx.bezierCurveTo(cx - 30, cy - up - 16, cx + 40, cy - up - 16, cx + 78, cy - up * 0.5 - 12); ctx.stroke();
}
function drawMouth(ctx, m, t) {
  ctx.strokeStyle = OUT; ctx.lineWidth = 6;
  if (m === 'scared') {
    ctx.fillStyle = '#4a0f1c'; ctx.beginPath(); ctx.moveTo(-82, 262); ctx.quadraticCurveTo(0, 228, 82, 262); ctx.quadraticCurveTo(0, 318, -82, 262); ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#f2ece2'; ctx.fillRect(-70, 240, 140, 24); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; for (let x = -45; x <= 45; x += 22) { ctx.beginPath(); ctx.moveTo(x, 240); ctx.lineTo(x, 264); ctx.stroke(); } ctx.restore();
    ctx.beginPath(); ctx.moveTo(-82, 262); ctx.quadraticCurveTo(0, 228, 82, 262); ctx.quadraticCurveTo(0, 318, -82, 262); ctx.stroke();
    ctx.fillStyle = 'rgba(190,90,100,0.6)'; ctx.beginPath(); ctx.moveTo(-60, 290); ctx.quadraticCurveTo(0, 322, 60, 290); ctx.quadraticCurveTo(0, 306, -60, 290); ctx.fill();
  } else if (m === 'smile' || m === 'sleep') {
    ctx.beginPath(); ctx.moveTo(-70, 255); ctx.quadraticCurveTo(0, m === 'smile' ? 292 : 275, 70, 255); ctx.stroke();
    ctx.fillStyle = 'rgba(190,90,100,0.45)'; ell(ctx, 0, 290, 40, 10); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(-75, 266); ctx.quadraticCurveTo(0, 254, 75, 270); ctx.stroke();
    ctx.fillStyle = 'rgba(190,90,100,0.45)'; ell(ctx, 0, 288, 42, 10); ctx.fill();
  }
}

// generic person (silhouette / simple)
function drawPerson(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineJoin = 'round';
  const body = o.body || '#222', head = o.head || body;
  ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(-60, 150); ctx.bezierCurveTo(-60, 70, -40, 40, 0, 40); ctx.bezierCurveTo(40, 40, 60, 70, 60, 150); ctx.closePath(); ctx.fill();
  if (o.coat) { ctx.fillStyle = o.coat; ctx.beginPath(); ctx.moveTo(-58, 150); ctx.bezierCurveTo(-58, 75, -40, 46, 0, 44); ctx.bezierCurveTo(40, 46, 58, 75, 58, 150); ctx.closePath(); ctx.fill(); ctx.fillStyle = o.body; ctx.beginPath(); ctx.moveTo(-14, 46); ctx.lineTo(0, 95); ctx.lineTo(14, 46); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 95); ctx.lineTo(0, 150); ctx.stroke(); }
  if (o.longHair) { ctx.fillStyle = o.hair || '#2a1a14'; ctx.beginPath(); ctx.ellipse(0, 10, 30, 42, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = head; ell(ctx, 0, 0, 26, 30); ctx.fill();
  if (o.hair) { ctx.fillStyle = o.hair; ctx.beginPath(); ctx.ellipse(0, -10, 27, 22, 0, Math.PI, 0); ctx.fill(); }
  if (o.glasses) { ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ell(ctx, -9, 0, 7, 6); ctx.stroke(); ell(ctx, 9, 0, 7, 6); ctx.stroke(); }
  ctx.restore();
}

// ---------- captions ----------
function parseCap(str) {
  const out = []; let acc = false;
  for (const line of str.split('\n')) {
    const words = [];
    for (const raw of line.split(' ')) { if (!raw) continue; const segs = []; let cur = '';
      for (const ch of raw) { if (ch === '*') { if (cur) segs.push({ s: cur, acc }); cur = ''; acc = !acc; continue; } cur += ch; }
      if (cur) segs.push({ s: cur, acc }); if (segs.length) words.push({ segs, w: segs.map(x => x.s).join(''), acc: segs.some(x => x.acc) }); }
    out.push(words);
  }
  return out;
}
function drawCaption(ctx, c, t) {
  const lt = t - c.t0, rem = c.t1 - t; if (lt < 0 || rem < 0) return;
  const size = c.size || 80, maxW = c.maxW || 940, stag = c.stagger ?? 0.06;
  ctx.save(); ctx.font = `700 ${size}px Oswald`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const sp = size * 0.26, rows = [];
  for (const line of parseCap(c.text.toUpperCase())) {
    let row = [], wsum = 0;
    for (const w of line) { const ww = ctx.measureText(w.w).width; if (row.length && wsum + sp + ww > maxW) { rows.push({ row, wsum }); row = []; wsum = 0; } wsum += (row.length ? sp : 0) + ww; row.push({ ...w, ww }); }
    if (row.length) rows.push({ row, wsum });
  }
  const lh = size * 1.1; let y0 = c.y - (rows.length - 1) * lh / 2; if (c.y < 900) y0 = Math.max(y0, 400 + size * 0.5);
  const fade = clamp(rem / 0.18); let k = 0;
  const jit = c.glitch ? (hash(Math.floor(t * 30)) > 0.7 ? 1 : 0) : 0;
  rows.forEach((r, ri) => {
    let x = (c.x || 540) - r.wsum / 2; const y = y0 + ri * lh;
    for (const w of r.row) {
      const p = (lt - k * stag) / 0.3; k++;
      if (p > 0) {
        const s = lerp(0.4, 1, eBack(p)), a = clamp(p * 3) * fade;
        ctx.save(); ctx.translate(x + w.ww / 2 + jit * (hash(k + t * 7) - 0.5) * 18, y + (1 - eOut(p)) * 20); ctx.scale(s, s); ctx.globalAlpha = a;
        ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.17; ctx.strokeStyle = '#000';
        ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowOffsetY = size * 0.07; ctx.shadowBlur = size * 0.15;
        ctx.strokeText(w.w, -w.ww / 2, 0); ctx.shadowColor = 'transparent';
        if (jit && w.acc) { ctx.fillStyle = 'rgba(0,255,255,0.7)'; ctx.fillText(w.w, -w.ww / 2 - 6, 0); }
        let sx = -w.ww / 2; for (const sg of w.segs) { ctx.fillStyle = sg.acc ? (c.accent || '#ff3344') : '#fff'; ctx.fillText(sg.s, sx, 0); sx += ctx.measureText(sg.s).width; }
        ctx.restore();
      }
      x += w.ww + sp;
    }
  });
  ctx.restore();
}

// ---------- HUD ----------
const CHAPTERS = window.CHAPTERS_CFG;
function drawHeart(ctx, x, y, s, col) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(-22, -6, -14, -24, 0, -12); ctx.bezierCurveTo(14, -24, 22, -6, 0, 8); ctx.fill(); ctx.restore(); }
function drawHUD(ctx, t) {
  const a = sm(window.HUD_START, window.HUD_START + 0.6, t) * (1 - sm(89.3, 89.9, t)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const x0 = 96, x1 = 984, gap = 16, sw = (x1 - x0 - gap * 3) / 4, y = 176;
  ctx.font = '700 31px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  CHAPTERS.forEach(([name, s, e], i) => {
    const x = x0 + i * (sw + gap), p = clamp((t - s) / (e - s)), active = t >= s && t < e;
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; rrect(ctx, x, y, sw, 9, 4); ctx.fill();
    if (p > 0) { ctx.fillStyle = '#ff2b3a'; rrect(ctx, x, y, Math.max(9, sw * p), 9, 4); ctx.fill(); }
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.strokeText(name, x + sw / 2, y + 44);
    ctx.fillStyle = active ? '#fff' : 'rgba(255,255,255,0.5)'; ctx.fillText(name, x + sw / 2, y + 44);
    if (active) { ctx.fillStyle = '#fff'; ctx.fillRect(x + sw / 2 - 30, y + 66, 60, 3); }
  });
  // pulse
  const bpm = Math.round(bpmAt(t) + noise1(t * 1.7, 9) * 1.4), bp = beatPulse(t);
  ctx.textAlign = 'right'; ctx.font = '700 28px Oswald'; ctx.lineWidth = 5; ctx.strokeText('пульс', x1, y + 92); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText('пульс', x1, y + 92);
  ctx.font = '700 56px Oswald'; ctx.lineWidth = 9; ctx.strokeText(String(bpm), x1, y + 138);
  ctx.fillStyle = window.calmPulse(t, bpm) ? '#4dff8a' : '#ff2b3a'; ctx.fillText(String(bpm), x1, y + 138);
  const tw = ctx.measureText(String(bpm)).width;
  drawHeart(ctx, x1 - tw - 34, y + 136, 1.25 + bp * 0.5, window.calmPulse(t, bpm) ? '#4dff8a' : '#ff2b3a');
  ctx.restore();
}
function drawChapterStamp(ctx, t) {
  CHAPTERS.forEach(([name, s], i) => {
    const lt = t - s; if (lt < 0.1 || lt > 1.9) return;
    const a = sm(0.1, 0.35, lt) * (1 - sm(1.5, 1.9, lt));
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const y = 1745; ctx.fillStyle = 'rgba(0,0,0,0.55)'; rrect(ctx, 340, y - 62, 400, 124, 18); ctx.fill();
    ctx.font = '700 30px Oswald'; ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText(`ГЛАВА ${i + 1}`, 540, y - 30);
    ctx.font = '700 62px Oswald'; ctx.fillStyle = '#fff'; ctx.fillText(name, 540 + (1 - eOut((lt - 0.1) / 0.4)) * 60, y + 18);
    ctx.restore();
  });
}
