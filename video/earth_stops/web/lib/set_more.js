// ============ more sets: world map, bridge, airport, railway, ruined skyline ============
const MW = 3600, MH = 1800;
const mapXY = (lon, lat) => [(lon + 180) / 360 * MW, (90 - lat) / 180 * MH];
const CITIES = {
  'НЬЮ-ЙОРК': [-74, 40.7], 'ЛОНДОН': [-0.1, 51.5], 'МОСКВА': [37.6, 55.8], 'ТОКИО': [139.7, 35.7], 'СИДНЕЙ': [151.2, -33.9], 'РИО-ДЕ-ЖАНЕЙРО': [-43.2, -22.9],
  'КАИР': [31.2, 30.0], 'МУМБАИ': [72.9, 19.1], 'САН-ФРАНЦИСКО': [-122.4, 37.8], 'ДУБАЙ': [55.3, 25.2], 'СИНГАПУР': [103.8, 1.35], 'ЛАГОС': [3.4, 6.5],
  'МЕХИКО': [-99.1, 19.4], 'ПЕКИН': [116.4, 39.9], 'КЕЙПТАУН': [18.4, -33.9], 'ЛИМА': [-77.0, -12.0],
};
function worldMap(ctx, o = {}) {
  const key = 'map' + (o.style || 'day');
  const c = cached(key, MW, MH, g => {
    const night = o.style === 'night';
    g.fillStyle = night ? '#07142e' : '#1d5c96'; g.fillRect(0, 0, MW, MH);
    g.strokeStyle = night ? 'rgba(120,170,255,0.12)' : 'rgba(255,255,255,0.12)'; g.lineWidth = 2;
    for (let lon = -180; lon <= 180; lon += 30) { const [x] = mapXY(lon, 0); line(g, x, 0, x, MH); }
    for (let lat = -60; lat <= 60; lat += 30) { const [, y] = mapXY(0, lat); line(g, 0, y, MW, y); }
    g.fillStyle = night ? '#1a2a48' : '#e9dcb8'; g.strokeStyle = night ? '#3b5a8a' : '#8c7a55'; g.lineWidth = 2.5; g.lineJoin = 'round';
    for (const p of WORLD) { g.beginPath(); p.forEach(([lo, la], i) => { const [x, y] = mapXY(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); g.stroke(); }
  });
  ctx.drawImage(c, 0, 0);
}
function cityDot(ctx, name, t, o = {}) {
  const [x, y] = mapXY(...CITIES[name]); const p = (t * 1.2) % 1, col = o.col || RED;
  ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = (1 - p) * (o.a ?? 1); ctx.lineWidth = 4; circ(ctx, x, y, 10 + p * 50); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.globalAlpha = o.a ?? 1; ctx.fillStyle = col; circ(ctx, x, y, 11); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.stroke();
  if (o.label !== false) label(ctx, name, x, y - 38, o.size || 34, { col: '#fff' }); ctx.restore();
}

// suspension bridge spanning x0..x1, deck at y. o: {sway, snap 0..1, t, cars}
function drawBridge(ctx, x0, x1, y, o = {}) {
  const t = o.t || 0, sway = o.sway || 0, snap = o.snap || 0, col = o.col || '#c0392b';
  const tw = [lerp(x0, x1, 0.22), lerp(x0, x1, 0.78)], th = 380;
  const deckY = x => y + Math.sin((x - x0) / (x1 - x0) * PI * 3 + t * 5) * 26 * sway;
  // towers
  for (const [i, tx] of tw.entries()) { ctx.save(); ctx.translate(tx, y + 200); ctx.rotate(Math.sin(t * 3 + i) * 0.02 * sway); ctx.fillStyle = col; ctx.fillRect(-22, -th - 200, 14, th + 200); ctx.fillRect(8, -th - 200, 14, th + 200); ctx.fillRect(-22, -th - 160, 44, 16); ctx.fillRect(-22, -th + 40, 44, 16); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(-22, -th - 200, 14, th + 200); ctx.strokeRect(8, -th - 200, 14, th + 200); ctx.restore(); }
  // main cables
  ctx.strokeStyle = col; ctx.lineWidth = 6;
  const cableY = x => { const top = y - th; if (x < tw[0]) return lerp(y - 20, top, (x - x0) / (tw[0] - x0)) ; if (x > tw[1]) return lerp(top, y - 20, (x - tw[1]) / (x1 - tw[1])); const u = (x - tw[0]) / (tw[1] - tw[0]); return top + Math.sin(u * PI) * (th - 40) * 0.9 + Math.sin(t * 4) * 10 * sway; };
  ctx.beginPath(); for (let x = x0; x <= x1; x += 10) { const yy = cableY(x); x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke();
  // hangers (some snapped)
  ctx.lineWidth = 2;
  for (let x = x0 + 20; x < x1; x += 36) { const broken = snap > 0 && hash(x) < snap; if (broken) { ctx.strokeStyle = rgba('#c0392b', 0.8); line(ctx, x, cableY(x), x + 20 * Math.sin(t * 9 + x), cableY(x) + 50); continue; } ctx.strokeStyle = col; line(ctx, x, cableY(x), x, deckY(x)); }
  // deck
  ctx.fillStyle = '#5a5e66'; ctx.beginPath(); ctx.moveTo(x0, deckY(x0)); for (let x = x0; x <= x1; x += 10) ctx.lineTo(x, deckY(x)); for (let x = x1; x >= x0; x -= 10) ctx.lineTo(x, deckY(x) + 26); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = col; for (let x = x0; x < x1; x += 10) ctx.fillRect(x, deckY(x) + 18, 10, 8);
  return deckY;
}
// plane on the ground (with gear)
function drawParkedPlane(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt || 0); drawPlane(ctx, 0, -52 * s, s, { dir: o.dir || 1, t: o.t || 0, livery: o.livery || '#2462c9' });
  ctx.fillStyle = '#222'; for (const gx of [-30, 150]) { circ(ctx, gx * s * (o.dir || 1), -12 * s, 12 * s); ctx.fill(); }
  ctx.strokeStyle = '#444'; ctx.lineWidth = 4 * s; line(ctx, -30 * s * (o.dir || 1), -40 * s, -30 * s * (o.dir || 1), -14 * s); line(ctx, 150 * s * (o.dir || 1), -40 * s, 150 * s * (o.dir || 1), -14 * s);
  ctx.restore();
}
function drawTower(ctx, x, y, s, tilt = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
  ctx.fillStyle = '#d8dde4'; poly(ctx, [[-30, 0], [30, 0], [20, -300], [-20, -300]]); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#2d3a4a'; poly(ctx, [[-60, -300], [60, -300], [50, -360], [-50, -360]]); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#8fd0ff'; ctx.fillRect(-48, -350, 96, 36); ctx.fillStyle = '#e8ecf2'; ctx.fillRect(-56, -372, 112, 14); ctx.restore();
}
// train: n cars from x, rails at y. o: {derail 0..1, t}
function drawTrain(ctx, x, y, n, o = {}) {
  const d = o.derail || 0, t = o.t || 0;
  ctx.fillStyle = '#5a4636'; for (let k = -2000; k < 4000; k += 40) ctx.fillRect(x + k, y + 6, 22, 10);
  ctx.fillStyle = '#9aa0a8'; ctx.fillRect(x - 2000, y, 6000, 6);
  for (let i = 0; i < n; i++) {
    const cx = x + i * 330, r = rng(i + 3), off = d * (i * 40 + r() * 60), lift = d * Math.max(0, Math.sin(i * 1.7 + 1)) * 80 * clamp(d * 2), rot = d * (r() - 0.3) * 0.5 * (i > 0 ? 1 : 0.4);
    ctx.save(); ctx.translate(cx + 150 + off, y - lift); ctx.rotate(rot);
    ctx.fillStyle = i === 0 ? '#d63031' : '#e9ecef'; rrect(ctx, -150, -150, 300, 140, i === 0 ? [50, 16, 6, 6] : 10); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#d63031'; ctx.fillRect(-150, -60, 300, 14);
    ctx.fillStyle = '#9ad1ee'; for (let w = 0; w < 5; w++) { rrect(ctx, -130 + w * 55, -130, 42, 46, 6); ctx.fill(); }
    ctx.fillStyle = '#222'; for (const wx of [-100, -60, 60, 100]) { circ(ctx, wx, -6, 16); ctx.fill(); }
    ctx.restore();
  }
}
// skyline of detailed buildings that crumble with staggered timing. dmg(t) per building in [0..1]
function ruinSkyline(ctx, seed, x0, x1, gy, k, t, o = {}) {
  const bs = genBuildings(seed, x0, x1, { hmin: o.hmin || 260, hmax: o.hmax || 720, wmin: 110, wmax: 220, gap: 10, cols: o.cols });
  for (const b of bs) {
    const r = rng(b.seed + 1), start = r() * 0.6, q = clamp((k - start) / 0.5);
    const crumble = r() < (o.frac ?? 0.5) ? eIn(q) * (0.5 + r() * 0.5) : 0;
    drawBuilding(ctx, b, gy, { t, lit: o.lit || 0, tilt: (r() - 0.4) * 0.06 * q + Math.sin(t * 8 + b.seed) * 0.008 * (o.shake ?? 1) * (1 - q), broken: q * 0.8, crumble, cracks: q, hazeA: o.hazeA, haze: o.haze });
    if (crumble > 0.05 && q < 1) smoke(ctx, t, b.x + b.w / 2, gy - b.h * (1 - crumble * 0.6), { h: 300, w: 70, col: '#9a8a74', a: 0.5 * (1 - q * 0.5), drift: 120, seed: b.seed % 100 });
  }
}
