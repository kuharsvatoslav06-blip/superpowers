// ============ core helpers (pure functions of time — every frame renders independently) ============
const W = 1920, H = 1080, FPS = 30;
const PI = Math.PI, TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const sm = (a, b, t) => { t = inv(a, b, t); return t * t * (3 - 2 * t); };
const eOut = t => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
const eIn = t => { t = clamp(t); return t * t * t; };
const eIO = t => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const eElastic = t => { t = clamp(t); return t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * TAU / 3) + 1; };
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = n => rng(Math.floor(n) * 9973 + 7)();
const hash2 = (a, b) => rng((Math.floor(a) * 73856093) ^ (Math.floor(b) * 19349663))();
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i; const a = hash(i + seed * 1013), b = hash(i + 1 + seed * 1013); const u = f * f * (3 - 2 * f); return lerp(a, b, u) * 2 - 1; }
function fbm1(x, seed = 0) { return noise1(x, seed) * 0.6 + noise1(x * 2.1, seed + 5) * 0.28 + noise1(x * 4.3, seed + 9) * 0.12; }
const wrap = (x, a, b) => a + ((((x - a) % (b - a)) + (b - a)) % (b - a));

// keyframes: kf(t, [[t0, v0], [t1, v1], ...], ease) — numbers or arrays
function kf(t, keys, ease = eIO) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    if (t <= t1) { const k = ease((t - t0) / (t1 - t0)); return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], k)) : lerp(v0, v1, k); }
  }
  return keys[keys.length - 1][1];
}

// ---------- colour ----------
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function rgba(h, a) { const c = hex2rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
function mix(h1, h2, t) { const a = hex2rgb(h1), b = hex2rgb(h2); return '#' + a.map((v, i) => Math.round(lerp(v, b[i], clamp(t))).toString(16).padStart(2, '0')).join(''); }
function shade(h, a) { return a < 0 ? mix(h, '#000000', -a) : mix(h, '#ffffff', a); }

// ---------- drawing ----------
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); }
function circ(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0.01, r), 0, TAU); }
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function radial(ctx, x, y, r, stops, r0 = 0) { const g = ctx.createRadialGradient(x, y, r0, x, y, Math.max(1, r)); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function linear(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
function glow(ctx, x, y, r, col, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = radial(ctx, x, y, r, [[0, col], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
function line(ctx, x0, y0, x1, y1) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
const INK = '#111014';

// ---------- camera ----------
// cam: {x, y} world point at screen centre, z zoom, r roll (rad), shake px
function applyCam(ctx, c, t = 0) {
  const sh = c.shake || 0;
  const sx = sh ? fbm1(t * 9, 1) * sh : 0, sy = sh ? fbm1(t * 9, 2) * sh : 0;
  ctx.translate(W / 2 + sx, H / 2 + sy);
  if (c.r) ctx.rotate(c.r);
  ctx.scale(c.z || 1, c.z || 1);
  ctx.translate(-(c.x ?? W / 2), -(c.y ?? H / 2));
}
// parallax: draw a layer with depth factor p (0 = fixed to screen, 1 = world)
function withParallax(ctx, c, p, fn, t = 0) {
  ctx.save();
  const z = 1 + ((c.z || 1) - 1) * p;
  const sh = (c.shake || 0) * p;
  ctx.translate(W / 2 + (sh ? fbm1(t * 9, 1) * sh : 0), H / 2 + (sh ? fbm1(t * 9, 2) * sh : 0));
  if (c.r) ctx.rotate(c.r);
  ctx.scale(z, z);
  ctx.translate(-((c.x ?? W / 2) - W / 2) * p - W / 2, -((c.y ?? H / 2) - H / 2) * p - H / 2);
  fn(ctx); ctx.restore();
}

// ---------- canvas pool for transitions ----------
const POOL = []; let poolTop = 0;
function borrow() { if (!POOL[poolTop]) POOL[poolTop] = mk(); const c = POOL[poolTop++]; const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.clearRect(0, 0, W, H); return c; }
function giveBack() { poolTop--; }

// Shot sequencer. shots: [{d: seconds, f(ctx, lt, d, t), tr: 'cut'|'fade'|'whip'|'zoom'|'flash'|'white', td}]
// `scale` stretches all shot durations (so a scene can be lengthened/shortened in story.json).
function seq(ctx, lt, t, shots, scale = 1) {
  let s = 0;
  for (let i = 0; i < shots.length; i++) {
    const d = shots[i].d * scale, e = s + d;
    if (lt < e || i === shots.length - 1) {
      const sl = lt - s, prev = shots[i - 1], tr = shots[i].tr || 'cut', td = shots[i].td ?? (tr === 'whip' ? 0.45 : tr === 'zoom' ? 0.6 : 0.5);
      if (i > 0 && sl < td && tr !== 'cut') {
        const pd = prev.d * scale, k = sl / td;
        const A = borrow(), B = borrow(); const a = A.getContext('2d'), b = B.getContext('2d');
        prev.f(a, pd + sl, pd, t); shots[i].f(b, sl, d, t);
        transition(ctx, A, B, k, tr);
        giveBack(); giveBack();
      } else shots[i].f(ctx, sl, d, t);
      return { i, sl, d };
    }
    s = e;
  }
}
function transition(ctx, A, B, k, tr) {
  ctx.save();
  if (tr === 'fade') { ctx.drawImage(A, 0, 0); ctx.globalAlpha = eIO(k); ctx.drawImage(B, 0, 0); }
  else if (tr === 'black') { const a = k < 0.5 ? 1 - k * 2 : (k - 0.5) * 2; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = a; ctx.drawImage(k < 0.5 ? A : B, 0, 0); }
  else if (tr === 'white' || tr === 'flash') { ctx.drawImage(k < 0.5 ? A : B, 0, 0); ctx.fillStyle = '#fff'; ctx.globalAlpha = tr === 'flash' ? Math.max(0, 1 - k * 1.6) : 1 - Math.abs(k * 2 - 1); if (tr === 'flash' && k < 0.06) ctx.globalAlpha = 1; ctx.fillRect(0, 0, W, H); }
  else if (tr === 'whip') {
    const e = eIO(k), off = e * W;
    for (let j = 0; j < 6; j++) { ctx.globalAlpha = 0.28; const o = j * 40 * Math.sin(k * PI); ctx.drawImage(A, -off - o, 0); ctx.drawImage(B, W - off - o, 0); }
    ctx.globalAlpha = 0.5; ctx.drawImage(A, -off, 0); ctx.drawImage(B, W - off, 0);
  } else if (tr === 'zoom') {
    const e = eIO(k);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(1 + e * 2.5, 1 + e * 2.5); ctx.translate(-W / 2, -H / 2); ctx.globalAlpha = 1 - e; ctx.drawImage(A, 0, 0); ctx.restore();
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(0.4 + 0.6 * e, 0.4 + 0.6 * e); ctx.translate(-W / 2, -H / 2); ctx.globalAlpha = e; ctx.drawImage(B, 0, 0); ctx.restore();
  }
  ctx.restore();
}

// ---------- deterministic particles ----------
// spawn(rate, life): yields particles alive at time t, each with seed r() and age
function particles(t, { rate, life, t0 = -1e9, t1 = 1e9, seed = 1 }, fn) {
  const first = Math.max(Math.floor((t - life) * rate), Math.ceil(t0 * rate)), last = Math.min(Math.floor(t * rate), Math.floor(t1 * rate));
  for (let n = first; n <= last; n++) {
    const born = n / rate, age = t - born; if (age < 0 || age > life) continue;
    fn(rng(n * 7919 + seed * 104729), age / life, age, n);
  }
}

// text helper with stroke
function label(ctx, txt, x, y, size, o = {}) {
  ctx.save(); ctx.font = `${o.weight || 700} ${size}px ${o.font || 'Oswald'}`; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (o.stroke !== false) { ctx.lineJoin = 'round'; ctx.lineWidth = size * (o.sw || 0.16); ctx.strokeStyle = o.strokeCol || 'rgba(0,0,0,0.85)'; ctx.strokeText(txt, x, y); }
  ctx.fillStyle = o.col || '#fff'; ctx.fillText(txt, x, y); ctx.restore();
}
