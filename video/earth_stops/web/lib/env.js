// ============ environment kit: sky, clouds, city, street, traffic, sea, beach, plane, debris ============
const CACHE = new Map();
function cached(key, w, h, draw) { let c = CACHE.get(key); if (!c) { c = mk(w, h); draw(c.getContext('2d')); CACHE.set(key, c); } return c; }

// time-of-day palettes: 0 night, 0.25 dawn, 0.5 day, 0.75 dusk
const SKIES = {
  day: ['#3f8fe0', '#8cc6f2', '#d9eefa'],
  morning: ['#4c8fd8', '#9fcbea', '#ffe2b8'],
  dusk: ['#2b2f6e', '#c45a6a', '#ffb36b'],
  night: ['#050a1e', '#0f1d45', '#283a6e'],
  storm: ['#3a3f4a', '#6b6e72', '#a59a84'],
  dust: ['#6a5a48', '#a0835c', '#cfae7c'],
  grey: ['#5e6f82', '#93a3b2', '#c4ccd2'],
};
function skyCols(name) { return SKIES[name] || name; }
function mixSky(a, b, k) { a = skyCols(a); b = skyCols(b); return a.map((c, i) => mix(c, b[i], k)); }
function sky(ctx, cols, y0 = 0, y1 = H) { cols = skyCols(cols); ctx.fillStyle = linear(ctx, 0, y0, 0, y1, [[0, cols[0]], [0.6, cols[1]], [1, cols[2]]]); ctx.fillRect(-W, -H, W * 3, H * 3); }
function sun(ctx, x, y, r, col = '#fff6d8', a = 1) { glow(ctx, x, y, r * 7, rgba('#fff0c0', 0.45), a); glow(ctx, x, y, r * 2.5, rgba('#ffffff', 0.6), a); ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; circ(ctx, x, y, r); ctx.fill(); ctx.restore(); }
function stars(ctx, n, seed, t, a = 1, x0 = 0, y0 = 0, w = W, h = H) { const r = rng(seed); ctx.save(); for (let i = 0; i < n; i++) { const x = x0 + r() * w, y = y0 + r() * h, s = r() * 2.2 + 0.6, tw = 0.6 + 0.4 * Math.sin(t * (1 + r() * 3) + i); ctx.fillStyle = `rgba(255,255,245,${tw * a * (0.4 + r() * 0.6)})`; ctx.fillRect(x, y, s, s); } ctx.restore(); }

// ---------- clouds ----------
function cloudShape(seed) { const r = rng(seed), n = 5 + Math.floor(r() * 4), p = []; for (let i = 0; i < n; i++) { const u = i / (n - 1); p.push([lerp(-0.5, 0.5, u) + (r() - 0.5) * 0.08, -Math.sin(u * PI) * (0.12 + r() * 0.12), 0.16 + Math.sin(u * PI) * (0.12 + r() * 0.1)]); } return p; }
function cloud(ctx, x, y, w, seed, o = {}) {
  const p = cloudShape(seed), a = o.a ?? 1, col = o.col || '#ffffff', sh = o.shadow || mix(col, '#7f95b8', 0.45), str = o.stretch || 1;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(w * str, w);
  ctx.fillStyle = sh; for (const [cx, cy, r] of p) { circ(ctx, cx, cy + 0.035, r); ctx.fill(); } ctx.fillRect(-0.5, -0.02, 1, 0.1);
  ctx.fillStyle = col; for (const [cx, cy, r] of p) { circ(ctx, cx, cy, r * 0.96); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (const [cx, cy, r] of p) { circ(ctx, cx - r * 0.25, cy - r * 0.3, r * 0.45); ctx.fill(); }
  ctx.restore();
}
// layer of clouds drifting; returns nothing. x range wraps
function cloudLayer(ctx, t, { seed = 1, n = 8, y0 = 100, y1 = 400, w0 = 180, w1 = 420, speed = 10, x0 = -600, x1 = W + 600, col, a = 1, stretch = 1, shadow }) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = wrap(r() * (x1 - x0) + x0 + t * speed * (0.6 + r() * 0.8), x0, x1), y = lerp(y0, y1, r()), w = lerp(w0, w1, r()); cloud(ctx, x, y, w, seed * 100 + i, { col, a, stretch, shadow }); }
}

// ---------- buildings ----------
const BLD_COLS = ['#c9d3dd', '#a8b6c6', '#d8c6ae', '#b9a28a', '#8fa3b8', '#e2d8c8', '#9cb0a6', '#c2b5c9', '#7f8ea3', '#d4b8a0'];
function genBuildings(seed, x0, x1, { hmin = 200, hmax = 600, wmin = 90, wmax = 200, gap = 6, cols = BLD_COLS } = {}) {
  const r = rng(seed), out = []; let x = x0;
  while (x < x1) { const w = lerp(wmin, wmax, r()), h = lerp(hmin, hmax, Math.pow(r(), 1.3)); out.push({ x, w, h, col: cols[Math.floor(r() * cols.length)], roof: Math.floor(r() * 5), win: Math.floor(r() * 3), seed: Math.floor(r() * 1e6), glass: r() < 0.3 }); x += w + gap + r() * gap * 2; }
  return out;
}
// draw a single building with optional damage. o: {lit 0..1 (night windows), detail, shake, tilt, broken 0..1, crumble 0..1, haze col, hazeA}
function drawBuilding(ctx, b, gy, o = {}) {
  const { x, w, h } = b; const r = rng(b.seed);
  ctx.save();
  if (o.tilt || o.dx) { ctx.translate(x + w / 2 + (o.dx || 0), gy); ctx.rotate(o.tilt || 0); ctx.translate(-(x + w / 2), -gy); }
  const top = gy - h, col = o.col || b.col;
  const body = () => { ctx.beginPath(); ctx.rect(x, top, w, h); if (b.roof === 1) { ctx.rect(x + w * 0.2, top - h * 0.08, w * 0.6, h * 0.08 + 1); } if (b.roof === 2) { ctx.rect(x + w * 0.35, top - h * 0.15, w * 0.3, h * 0.15 + 1); } };
  // crumble = top part missing with jagged edge
  if (o.crumble) {
    ctx.beginPath(); const cut = top + h * o.crumble * 0.6; ctx.moveTo(x, gy); ctx.lineTo(x, cut + r() * 30);
    const n = 7; for (let i = 1; i < n; i++) ctx.lineTo(x + w * i / n, cut + (r() - 0.3) * h * 0.15 * (o.crumble + 0.3)); ctx.lineTo(x + w, cut + r() * 40); ctx.lineTo(x + w, gy); ctx.closePath(); ctx.clip();
  }
  ctx.fillStyle = col; body(); ctx.fill();
  if (o.detail !== false) {
    // shading side
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + w * 0.78, top, w * 0.22, h);
    // windows
    const lit = o.lit || 0, ww = b.glass ? w * 0.9 : 14, cw = b.glass ? w : 26, rh = b.glass ? 22 : 34;
    const cols = Math.max(1, Math.floor((w - 16) / cw)), mx = (w - cols * cw) / 2 + (cw - (b.glass ? ww : 14)) / 2;
    for (let yy = top + 16; yy < gy - 30; yy += rh) for (let c = 0; c < cols; c++) {
      const wx = x + mx + c * cw, on = lit > 0 && hash2(b.seed + c, yy) < lit * 0.75;
      const broken = o.broken && hash2(b.seed + c * 3, yy * 7) < o.broken;
      if (broken) { ctx.fillStyle = '#1a1c22'; ctx.fillRect(wx, yy, b.glass ? ww : 14, rh * 0.55); continue; }
      ctx.fillStyle = on ? '#ffd98a' : (b.glass ? 'rgba(160,200,235,0.55)' : 'rgba(70,95,130,0.55)');
      ctx.fillRect(wx, yy, b.glass ? ww : 14, rh * 0.55);
      if (!on && !b.glass) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(wx, yy, 4, rh * 0.55); }
    }
    if (b.glass) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; poly(ctx, [[x + w * 0.1, top], [x + w * 0.35, top], [x + w * 0.05, gy], [x, gy], [x, top + h * 0.3]]); ctx.fill(); }
    if (b.roof === 3) { ctx.strokeStyle = '#444'; ctx.lineWidth = 3; line(ctx, x + w * 0.5, top, x + w * 0.5, top - 60); glow(ctx, x + w * 0.5, top - 60, 12, 'rgba(255,60,60,0.9)', 0.5 + 0.5 * Math.sin((o.t || 0) * 3 + b.seed)); }
    if (b.roof === 4) { ctx.fillStyle = shade(col, -0.2); ctx.fillRect(x + w * 0.15, top - 18, w * 0.25, 18); ctx.fillRect(x + w * 0.6, top - 12, w * 0.15, 12); }
  }
  ctx.strokeStyle = 'rgba(17,16,20,0.55)'; ctx.lineWidth = 2.5; body(); ctx.stroke();
  if (o.cracks) { ctx.strokeStyle = 'rgba(20,20,25,0.8)'; ctx.lineWidth = 2; const rr = rng(b.seed + 5); for (let k = 0; k < 3 * o.cracks; k++) { let cx = x + rr() * w, cy = top + rr() * h; ctx.beginPath(); ctx.moveTo(cx, cy); for (let j = 0; j < 5; j++) { cx += (rr() - 0.5) * 40; cy += rr() * 40; ctx.lineTo(cx, cy); } ctx.stroke(); } }
  if (o.hazeA) { ctx.fillStyle = rgba(o.haze || '#9fbfdc', o.hazeA); body(); ctx.fill(); }
  ctx.restore();
}
// cached flat skyline silhouette for far parallax
function skyline(ctx, seed, x, gy, { width = 4000, hmin = 120, hmax = 420, col = '#7d94b5', lit = 0, winA = 0.25 } = {}) {
  const c = cached(`sky${seed}_${hmin}_${hmax}_${col}_${lit}_${width}`, width, hmax + 80, g => {
    const bs = genBuildings(seed, 0, width, { hmin, hmax, wmin: 50, wmax: 150, gap: 2 }); g.fillStyle = col;
    for (const b of bs) { const top = hmax + 80 - b.h; g.fillRect(b.x, top, b.w, b.h); if (b.roof === 1) g.fillRect(b.x + b.w * 0.25, top - 20, b.w * 0.5, 20); if (b.roof === 3) g.fillRect(b.x + b.w * 0.48, top - 50, 3, 50);
      g.fillStyle = lit ? 'rgba(255,215,140,0.9)' : `rgba(255,255,255,${winA})`; for (let yy = top + 10; yy < hmax + 70; yy += 18) for (let xx = b.x + 6; xx < b.x + b.w - 8; xx += 12) if (hash2(xx, yy + seed) < (lit ? lit * 0.5 : 0.55)) g.fillRect(xx, yy, 5, 8); g.fillStyle = col; }
  });
  ctx.drawImage(c, x, gy - c.height);
}

// ---------- street furniture ----------
function drawTree(ctx, x, y, s, { t = 0, seed = 1, bend = 0, col = '#3f9b4a', leafA = 1 } = {}) {
  const r = rng(seed), sway = Math.sin(t * 1.4 + seed) * 0.03 + bend;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#5a3c26'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  const tx = Math.sin(sway) * 70, ty = -Math.cos(sway) * 70;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(tx * 0.2, -40, tx, ty - 20); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.globalAlpha *= 0.5; ctx.stroke(); ctx.globalAlpha /= 0.5;
  ctx.globalAlpha *= leafA;
  const blobs = [[0, -40, 34], [-26, -20, 26], [26, -22, 27], [-12, -60, 24], [16, -58, 22]];
  ctx.fillStyle = shade(col, -0.25); for (const [bx, by, br] of blobs) { circ(ctx, tx + bx + 3 + bend * by * 0.6, ty + by + 3, br); ctx.fill(); }
  ctx.fillStyle = col; for (const [bx, by, br] of blobs) { circ(ctx, tx + bx + bend * by * 0.6, ty + by, br); ctx.fill(); }
  ctx.fillStyle = shade(col, 0.2); for (const [bx, by, br] of blobs.slice(0, 3)) { circ(ctx, tx + bx - 6 + bend * by * 0.6, ty + by - 8, br * 0.45); ctx.fill(); }
  ctx.restore();
}
function drawPalm(ctx, x, y, s, t = 0, seed = 1, bend = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const sw = Math.sin(t * 1.1 + seed) * 0.04 + bend;
  ctx.strokeStyle = '#8a6a44'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  const tx = Math.sin(sw) * 200 + 30, ty = -Math.cos(sw) * 200;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10, -100, tx, ty); ctx.stroke();
  ctx.strokeStyle = '#6a4e30'; ctx.lineWidth = 2; for (let i = 1; i < 10; i++) { const k = i / 10, px = lerp(0, tx, k * k) + 10 * k * (1 - k) * 2, py = lerp(0, ty, k); line(ctx, px - 5, py, px + 5, py - 3); }
  for (let i = 0; i < 7; i++) { const a = -PI / 2 + (i - 3) * 0.5 + Math.sin(t * 2 + i) * 0.05 + bend * 1.5; ctx.strokeStyle = i % 2 ? '#2f8a3a' : '#3fa44a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * 60, ty + Math.sin(a) * 60 - 20, tx + Math.cos(a) * 100, ty + Math.sin(a) * 100 + 30); ctx.stroke(); }
  ctx.fillStyle = '#6b4a2a'; circ(ctx, tx - 6, ty + 6, 8); ctx.fill(); circ(ctx, tx + 6, ty + 8, 8); ctx.fill();
  ctx.restore();
}
function drawLamp(ctx, x, y, s, on = 0, tilt = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s); ctx.strokeStyle = '#2b2f38'; ctx.lineWidth = 6; line(ctx, 0, 0, 0, -220); ctx.beginPath(); ctx.moveTo(0, -220); ctx.quadraticCurveTo(0, -240, 30, -240); ctx.stroke(); ctx.fillStyle = '#2b2f38'; rrect(ctx, 22, -246, 34, 12, 4); ctx.fill(); if (on) { glow(ctx, 40, -232, 90, 'rgba(255,220,150,0.6)', on); ctx.fillStyle = '#ffe9b0'; ctx.fillRect(26, -235, 26, 4); } ctx.restore(); }
function drawTrafficLight(ctx, x, y, s, t = 0, phase = 0, tilt = 0, dead = false) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s); ctx.strokeStyle = '#2b2f38'; ctx.lineWidth = 6; line(ctx, 0, 0, 0, -170);
  ctx.fillStyle = '#23262e'; rrect(ctx, -16, -250, 32, 84, 6); ctx.fill();
  const st = Math.floor((t / 6 + phase) % 3);
  ['#ff3b30', '#ffcc00', '#34c759'].forEach((c, i) => { const on = !dead && st === 2 - i; ctx.fillStyle = on ? c : '#3a3d45'; circ(ctx, 0, -236 + i * 26, 9); ctx.fill(); if (on) glow(ctx, 0, -236 + i * 26, 30, rgba(c, 0.5)); });
  ctx.restore();
}
function drawBench(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#8a5a34'; ctx.fillRect(-60, -34, 120, 8); ctx.fillRect(-60, -58, 120, 8); ctx.fillStyle = '#2b2f38'; ctx.fillRect(-52, -30, 5, 30); ctx.fillRect(47, -30, 5, 30); ctx.restore(); }

// ---------- vehicles ----------
const CAR_COLS = ['#e74c3c', '#3498db', '#f1c40f', '#ecf0f1', '#2c3e50', '#16a085', '#9b59b6', '#e67e22', '#95a5a6', '#c0392b'];
// side view, facing +x when dir=1. y = road contact. s = scale (1 => ~ 200px long sedan)
function drawCar(ctx, x, y, s, o = {}) {
  const kind = o.kind || 'sedan', col = o.col || '#e74c3c', dir = o.dir || 1, wr = o.wheel || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); if (o.tilt) ctx.rotate(o.tilt * dir);
  ctx.lineJoin = 'round';
  const wheel = (wx, r = 20) => { ctx.fillStyle = '#1c1c22'; circ(ctx, wx, -r, r); ctx.fill(); ctx.fillStyle = '#9aa0aa'; circ(ctx, wx, -r, r * 0.45); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 2.5; for (let k = 0; k < 3; k++) { const a = wr + k * TAU / 3; line(ctx, wx, -r, wx + Math.cos(a) * r * 0.42, -r + Math.sin(a) * r * 0.42); } };
  if (kind === 'bus') {
    ctx.fillStyle = col; rrect(ctx, -170, -150, 340, 130, 14); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#bfe3f7'; for (let i = 0; i < 6; i++) { rrect(ctx, -150 + i * 50, -135, 40, 45, 5); ctx.fill(); }
    ctx.fillStyle = '#9ad1ee'; rrect(ctx, 140, -135, 26, 70, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(-170, -80, 340, 10);
    wheel(-110, 22); wheel(110, 22);
  } else if (kind === 'truck') {
    ctx.fillStyle = '#e8e8ea'; rrect(ctx, -170, -160, 230, 140, 6); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = col; rrect(ctx, 64, -125, 100, 105, 12); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#bfe3f7'; rrect(ctx, 110, -115, 45, 40, 6); ctx.fill();
    wheel(-120, 22); wheel(-70, 22); wheel(120, 22);
  } else {
    const L = kind === 'van' ? 1.05 : 1, roofH = kind === 'van' ? 95 : 70;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(-100 * L, -22); ctx.lineTo(-104 * L, -52); ctx.quadraticCurveTo(-100 * L, -64, -80 * L, -64);
    if (kind === 'van') { ctx.lineTo(-80 * L, -roofH - 30); ctx.lineTo(40, -roofH - 30); ctx.lineTo(75, -64); }
    else { ctx.lineTo(-55, -66); ctx.quadraticCurveTo(-35, -roofH - 32, 0, -roofH - 32); ctx.lineTo(25, -roofH - 32); ctx.quadraticCurveTo(45, -roofH - 30, 62, -64); }
    ctx.lineTo(92 * L, -58); ctx.quadraticCurveTo(106 * L, -52, 104 * L, -22); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#bfe3f7';
    if (kind === 'van') { rrect(ctx, -70, -roofH - 22, 50, 40, 5); ctx.fill(); rrect(ctx, -12, -roofH - 22, 46, 40, 5); ctx.fill(); }
    else { poly(ctx, [[-45, -66], [-30, -roofH - 24], [-4, -roofH - 24], [-4, -66]]); ctx.fill(); poly(ctx, [[4, -66], [4, -roofH - 24], [24, -roofH - 24], [52, -66]]); ctx.fill(); }
    if (kind === 'taxi') { ctx.fillStyle = '#222'; ctx.fillRect(-10, -roofH - 44, 26, 12); ctx.fillStyle = '#222'; for (let i = 0; i < 8; i++) ctx.fillRect(-90 + i * 22, -42, 11, 8); }
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-98 * L, -48, 190 * L, 4);
    ctx.fillStyle = '#ffe9a6'; ctx.fillRect(96 * L, -50, 8, 10); ctx.fillStyle = '#d33'; ctx.fillRect(-105 * L, -50, 6, 10);
    if (o.passenger) { drawStick(ctx, 10, -60, 9, { pose: o.passenger.pose || P.sit(), dir: 1, expr: o.passenger.expr, outfit: o.passenger.outfit || {}, t: o.t }); }
    wheel(-62 * L); wheel(62 * L);
  }
  ctx.restore();
}
// a lane of traffic; returns array of car x positions
function traffic(ctx, t, { y, dir = 1, speed = 260, n = 6, seed = 1, x0 = -400, x1 = W + 400, s = 0.8, kinds, stop = null, slide = null }) {
  const r = rng(seed), span = x1 - x0, list = [];
  for (let i = 0; i < n; i++) {
    const kind = kinds ? kinds[Math.floor(r() * kinds.length)] : (r() < 0.12 ? 'bus' : r() < 0.2 ? 'taxi' : r() < 0.3 ? 'van' : r() < 0.36 ? 'truck' : 'sedan');
    const col = kind === 'taxi' ? '#f6c90e' : kind === 'bus' ? '#e04848' : CAR_COLS[Math.floor(r() * CAR_COLS.length)];
    const base = x0 + span * (i + r() * 0.5) / n, v = speed * (0.85 + r() * 0.3);
    const dist = stop ? stop(t) * v : t * v;
    const x = wrap(base + dir * dist, x0, x1);
    list.push({ x, kind, col });
    const sl = slide ? slide(i, x) : null;
    drawCar(ctx, x + (sl ? sl.dx : 0), y + (sl ? sl.dy : 0), s, { kind, col, dir, wheel: dist / (20 * s) * dir, tilt: sl ? sl.tilt : 0 });
  }
  return list;
}

// ---------- street scene (side view) ----------
// draws road + sidewalk. roadY = top of road (far curb). returns layout
function drawStreet(ctx, x0, x1, roadY, o = {}) {
  const sw = o.sidewalk || 70, rh = o.roadH || 170;
  ctx.fillStyle = '#b9b3a8'; ctx.fillRect(x0, roadY - sw, x1 - x0, sw);          // far sidewalk
  ctx.fillStyle = '#8f897f'; ctx.fillRect(x0, roadY - 8, x1 - x0, 8);
  ctx.fillStyle = '#4a4d55'; ctx.fillRect(x0, roadY, x1 - x0, rh);               // road
  ctx.fillStyle = 'rgba(255,255,255,0.03)'; for (let x = Math.floor(x0 / 37) * 37; x < x1; x += 37) ctx.fillRect(x, roadY + hash(x) * rh, 18, 3);
  ctx.fillStyle = '#f2f2f2'; for (let x = Math.floor(x0 / 160) * 160; x < x1; x += 160) ctx.fillRect(x, roadY + rh / 2 - 4, 80, 8);
  ctx.fillStyle = '#d0cabf'; ctx.fillRect(x0, roadY + rh, x1 - x0, o.nearW || 120);  // near sidewalk
  ctx.fillStyle = '#a19a8e'; ctx.fillRect(x0, roadY + rh, x1 - x0, 10);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 2; for (let x = Math.floor(x0 / 90) * 90; x < x1; x += 90) line(ctx, x, roadY + rh + 10, x - 20, roadY + rh + (o.nearW || 120));
  if (o.crack) { ctx.strokeStyle = '#1d1e22'; ctx.lineWidth = 4; const r = rng(77); for (let k = 0; k < 6; k++) { let cx = lerp(x0, x1, r()), cy = roadY + r() * rh; ctx.beginPath(); ctx.moveTo(cx, cy); for (let j = 0; j < 8 * o.crack; j++) { cx += (r() - 0.3) * 60; cy += (r() - 0.5) * 30; ctx.lineTo(cx, cy); } ctx.stroke(); } }
  return { farWalk: roadY - sw * 0.35, lane1: roadY + rh * 0.42, lane2: roadY + rh * 0.92, nearWalk: roadY + rh + (o.nearW || 120) * 0.55 };
}
// storefront-level building with details for close shots
function drawShopfront(ctx, x, gy, w, h, seed, o = {}) {
  const r = rng(seed), col = BLD_COLS[Math.floor(r() * BLD_COLS.length)], aw = ['#e74c3c', '#2a9d8f', '#f4a261', '#3d5a80', '#8e5bd6'][Math.floor(r() * 5)];
  drawBuilding(ctx, { x, w, h, col, roof: 0, seed, glass: false }, gy, o);
  ctx.save(); if (o.dx) ctx.translate(o.dx, 0);
  ctx.fillStyle = '#2d3440'; ctx.fillRect(x + 10, gy - 120, w - 20, 120);
  ctx.fillStyle = 'rgba(170,210,240,0.55)'; ctx.fillRect(x + 20, gy - 110, w * 0.55, 100); ctx.fillStyle = '#5b4636'; ctx.fillRect(x + w * 0.7, gy - 105, w * 0.2, 105);
  ctx.fillStyle = aw; for (let i = 0; i < Math.floor(w / 30); i++) { ctx.fillStyle = i % 2 ? aw : '#f5f1e8'; ctx.fillRect(x + 6 + i * 30, gy - 150, 30, 30); }
  ctx.beginPath(); ctx.moveTo(x + 6, gy - 120); for (let i = 0; i <= Math.floor(w / 30); i++) ctx.arc(x + 21 + i * 30, gy - 120, 15, PI, 0, true); ctx.fillStyle = aw; ctx.fill();
  ctx.fillStyle = '#fff8e8'; rrect(ctx, x + w / 2 - 60, gy - 196, 120, 34, 6); ctx.fill(); ctx.fillStyle = aw; ctx.font = '700 22px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(['КАФЕ', 'ПЕКАРНЯ', 'ЦВЕТЫ', 'АПТЕКА', 'КНИГИ', 'МАРКЕТ'][seed % 6], x + w / 2, gy - 179);
  ctx.restore();
}

// ---------- sea & beach ----------
function drawSea(ctx, t, hy, y1, o = {}) {
  const c0 = o.c0 || '#1f6fb5', c1 = o.c1 || '#43a6d8', x0 = o.x0 ?? -200, x1 = o.x1 ?? W + 200, surge = o.surge || 0;
  ctx.fillStyle = linear(ctx, 0, hy, 0, y1, [[0, c0], [1, c1]]); ctx.fillRect(x0, hy, x1 - x0, y1 - hy);
  for (let k = 0; k < 9; k++) {
    const yy = lerp(hy + 6, y1, Math.pow(k / 9, 1.6)), amp = 2 + k * 1.6 + surge * k * 5, len = 60 + k * 30, sp = 0.6 + k * 0.15;
    ctx.strokeStyle = `rgba(255,255,255,${0.12 + k * 0.03})`; ctx.lineWidth = 1 + k * 0.35;
    ctx.beginPath(); for (let x = x0; x <= x1; x += 12) { const y = yy + Math.sin(x / len + t * sp + k * 1.7) * amp; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
  }
  glow(ctx, o.sunX ?? W * 0.7, hy + 30, 260, 'rgba(255,250,220,0.25)');
}
function drawShore(ctx, t, y, x0 = -200, x1 = W + 200, o = {}) {
  // wet sand + moving foam line (waves wash in/out)
  const wash = Math.sin(t * 0.9) * 14 + (o.push || 0);
  ctx.fillStyle = o.sand || '#f0d9a6'; ctx.fillRect(x0, y, x1 - x0, H * 2);
  ctx.fillStyle = 'rgba(160,130,90,0.25)'; ctx.fillRect(x0, y, x1 - x0, 26 + wash);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.moveTo(x0, y - 4); for (let x = x0; x <= x1; x += 16) ctx.lineTo(x, y + wash + Math.sin(x / 70 + t * 1.3) * 6 + Math.sin(x / 23 + t * 2) * 2); ctx.lineTo(x1, y - 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(70,170,220,0.55)'; ctx.beginPath(); ctx.moveTo(x0, y - 10); for (let x = x0; x <= x1; x += 16) ctx.lineTo(x, y + wash - 6 + Math.sin(x / 70 + t * 1.3) * 6); ctx.lineTo(x1, y - 30); ctx.lineTo(x0, y - 30); ctx.closePath(); ctx.fill();
}
function drawUmbrella(ctx, x, y, s, cols = ['#ff5a4d', '#fff'], tilt = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s); ctx.strokeStyle = '#555'; ctx.lineWidth = 4; line(ctx, 0, 0, 0, -150);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = cols[i % 2]; ctx.beginPath(); ctx.moveTo(0, -165); ctx.lineTo(-110 + i * 36.6, -120); ctx.quadraticCurveTo(-92 + i * 36.6, -128, -73.4 + i * 36.6, -120); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-110, -120); ctx.lineTo(0, -165); ctx.lineTo(110, -120); ctx.stroke(); ctx.restore();
}
function drawTowel(ctx, x, y, w, col) { ctx.fillStyle = col; poly(ctx, [[x, y], [x + w, y], [x + w - 12, y + 26], [x - 12, y + 26]]); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x + w * 0.2, y + 4, 8, 20); ctx.fillRect(x + w * 0.6, y + 4, 8, 20); }
function bird(ctx, x, y, s, t, seed = 0) { const f = Math.sin(t * 9 + seed * 3) * 0.6; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-12, -5 * f); ctx.quadraticCurveTo(-6, -8 * f - 3, 0, 0); ctx.quadraticCurveTo(6, -8 * f - 3, 12, -5 * f); ctx.stroke(); ctx.restore(); }

// ---------- airliner (side view) ----------
function drawPlane(ctx, x, y, s, { dir = 1, t = 0, livery = '#2462c9', tilt = 0, roll = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s); ctx.rotate(tilt);
  ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
  // far wing
  ctx.fillStyle = '#c9d0da'; poly(ctx, [[10, -8], [-40, -8], [-90, -70 + roll * 20], [-70, -70 + roll * 20]]); ctx.fill(); ctx.stroke();
  // tail fin
  ctx.fillStyle = livery; poly(ctx, [[-150, -10], [-205, -80], [-180, -80], [-110, -12]]); ctx.fill(); ctx.stroke();
  // fuselage
  ctx.fillStyle = '#f7f9fc'; ctx.beginPath(); ctx.moveTo(-200, -8); ctx.quadraticCurveTo(-200, -26, -160, -26); ctx.lineTo(160, -26); ctx.quadraticCurveTo(210, -24, 222, 0); ctx.quadraticCurveTo(210, 18, 160, 18); ctx.lineTo(-150, 18); ctx.quadraticCurveTo(-190, 12, -200, -8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = livery; ctx.fillRect(-170, 4, 350, 6);
  ctx.fillStyle = '#2b3a55'; for (let i = 0; i < 20; i++) { circ(ctx, -130 + i * 14, -10, 3.2); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(190, -16); ctx.quadraticCurveTo(206, -14, 212, -6); ctx.lineTo(194, -6); ctx.closePath(); ctx.fill();
  // tailplane
  ctx.fillStyle = '#dfe4ea'; poly(ctx, [[-160, -4], [-205, 4], [-190, 8], [-140, 2]]); ctx.fill(); ctx.stroke();
  // near wing + engine
  ctx.fillStyle = '#dfe4ea'; poly(ctx, [[30, 6], [-30, 6], [-80, 70 - roll * 20], [-58, 70 - roll * 20]]); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#b8c0cc'; rrect(ctx, -12, 22, 46, 18, 8); ctx.fill(); ctx.stroke();
  // blinking light
  if (Math.sin(t * 6) > 0.6) glow(ctx, -205, -80, 14, 'rgba(255,60,60,1)');
  ctx.restore();
}
function contrail(ctx, x, y, len, dir = 1, a = 1) { ctx.save(); ctx.globalAlpha *= a; for (const dy of [-6, 6]) { ctx.strokeStyle = linear(ctx, x, 0, x - dir * len, 0, [[0, 'rgba(255,255,255,0.9)'], [1, 'rgba(255,255,255,0)']]); ctx.lineWidth = 7; ctx.lineCap = 'round'; line(ctx, x, y + dy, x - dir * len, y + dy * 2.2); } ctx.restore(); }

// ---------- debris, dust, wind ----------
function dust(ctx, t, { x0 = -200, x1 = W + 200, y0 = 0, y1 = H, n = 60, seed = 3, vx = 900, vy = -40, a = 0.5, size = 40, col = '#b49a78' }) {
  const r = rng(seed); ctx.save();
  for (let i = 0; i < n; i++) { const x = wrap(r() * (x1 - x0) + t * vx * (0.6 + r() * 0.8), x0, x1), y = r() * (y1 - y0) + y0 + Math.sin(t * 2 + i) * 20 + t * vy * r() % 200, s = size * (0.5 + r()); ctx.globalAlpha = a * (0.3 + r() * 0.7); ctx.fillStyle = radial(ctx, x, y, s, [[0, col], [1, rgba(col, 0)]]); ctx.fillRect(x - s, y - s, 2 * s, 2 * s); }
  ctx.restore();
}
function windStreaks(ctx, t, { n = 40, a = 0.5, speed = 3000, seed = 5, ang = 0, len = 300, y0 = 0, y1 = H, col = '255,255,255' }) {
  const r = rng(seed); ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const L = len * (0.5 + r()), x = wrap(r() * (W + 2 * L) + t * speed * (0.7 + r() * 0.6), -L, W + L), y = lerp(y0, y1, r()) + Math.sin(t * 3 + i) * 6; ctx.strokeStyle = `rgba(${col},${a * (0.3 + r() * 0.7)})`; ctx.lineWidth = 1 + r() * 2.5; line(ctx, x, y, x - Math.cos(ang) * L, y - Math.sin(ang) * L); }
  ctx.restore();
}
// flying debris (stylised, rotating chunks/papers/leaves) moving with velocity
function debris(ctx, t, { n = 30, seed = 9, x0 = -300, x1 = W + 300, y0 = 0, y1 = H, vx = 1400, vy = 0, size = 18, kinds = ['chunk', 'paper', 'leaf'], a = 1 }) {
  const r = rng(seed); ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) {
    const k = kinds[Math.floor(r() * kinds.length)], sp = 0.6 + r() * 0.8;
    const x = wrap(r() * (x1 - x0) + t * vx * sp, x0, x1), y = r() * (y1 - y0) + y0 + Math.sin(t * 3 + i) * 30 + t * vy * sp, s = size * (0.5 + r()), rot = t * (r() - 0.5) * 14 + r() * 6;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    if (k === 'chunk') { ctx.fillStyle = ['#8d8a84', '#a89c88', '#6f6a63'][i % 3]; poly(ctx, [[-s, -s * 0.6], [s * 0.8, -s * 0.8], [s, s * 0.5], [-s * 0.4, s * 0.8]]); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke(); }
    else if (k === 'paper') { ctx.scale(1, Math.sin(t * 9 + i)); ctx.fillStyle = '#f4f1ea'; ctx.fillRect(-s * 0.6, -s * 0.8, s * 1.2, s * 1.6); }
    else if (k === 'leaf') { ctx.fillStyle = ['#4c9a3f', '#7fb341', '#d9a23a'][i % 3]; ell(ctx, 0, 0, s * 0.7, s * 0.35); ctx.fill(); }
    else if (k === 'glass') { ctx.fillStyle = 'rgba(190,230,255,0.85)'; poly(ctx, [[0, -s], [s * 0.5, s * 0.6], [-s * 0.4, s * 0.3]]); ctx.fill(); if (Math.sin(t * 20 + i) > 0.7) glow(ctx, 0, 0, s * 1.5, 'rgba(255,255,255,0.8)'); }
    else if (k === 'brick') { ctx.fillStyle = '#b5553a'; ctx.fillRect(-s, -s * 0.45, s * 2, s * 0.9); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(-s, -s * 0.45, s * 2, s * 0.9); }
    ctx.restore();
  }
  ctx.restore();
}
// smoke column
function smoke(ctx, t, x, y, { h = 400, w = 60, n = 14, col = '#4a4a50', a = 0.6, drift = 60, seed = 1 } = {}) {
  ctx.save();
  particles(t, { rate: n / 4, life: 4, seed }, (r, k, age) => { const yy = y - k * h, xx = x + k * drift + Math.sin(age * 2 + r() * 6) * 15, s = w * (0.5 + k * 1.6); ctx.globalAlpha = a * Math.sin(k * PI) * (0.6 + r() * 0.4); ctx.fillStyle = radial(ctx, xx, yy, s, [[0, col], [1, rgba(col, 0)]]); ctx.fillRect(xx - s, yy - s, s * 2, s * 2); });
  ctx.restore();
}
function fire(ctx, t, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (let i = 0; i < 5; i++) { const h = 40 + 25 * Math.sin(t * 9 + i * 2), w = 18 + i * 3; ctx.fillStyle = ['#ff3d00', '#ff7a00', '#ffb000', '#ffd84a', '#fff3b0'][i]; ctx.beginPath(); ctx.moveTo(-w, 0); ctx.quadraticCurveTo(-w * 0.8, -h * 0.6, Math.sin(t * 7 + i) * 6, -h * (1 - i * 0.12)); ctx.quadraticCurveTo(w * 0.8, -h * 0.6, w, 0); ctx.fill(); } glow(ctx, 0, -30, 120, 'rgba(255,140,40,0.45)'); ctx.restore(); }
