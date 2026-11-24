// ============ reusable city street "set" (side view) with optional chaos (planet stop) ============
// World layout (y): buildings stand on GY, road ROAD..ROAD+170, near sidewalk below.
const GY = 640, ROAD = 650;
const STREET_BLD = genBuildings(2024, -3000, 9000, { hmin: 330, hmax: 760, wmin: 150, wmax: 280, gap: 4 });

// o: {sky, sun:[x,y], t, cam, chaos: 0..1 (sweep strength), ct: seconds since stop (scaled), lit, ruin: 0..1 (aftermath),
//     walkers: bool, traffic: bool, nearProps: bool, dustA}
function citySet(ctx, o) {
  const t = o.t || 0, cam = o.cam || { x: W / 2, y: H / 2, z: 1 }, ch = o.chaos || 0, ct = o.ct || 0, ruin = o.ruin || 0;
  const vx0 = cam.x - W / 2 / (cam.z || 1) - 400, vx1 = cam.x + W / 2 / (cam.z || 1) + 400;
  // --- sky (screen space) ---
  ctx.save(); sky(ctx, o.sky || 'day'); ctx.restore();
  if (o.sun) withParallax(ctx, cam, 0.05, g => sun(g, o.sun[0], o.sun[1], 46, '#fff6d8', o.sunA ?? 1), t);
  // clouds: stream right when chaos
  withParallax(ctx, cam, 0.12, g => cloudLayer(g, t + ch * ct * 40, { seed: 3, n: 9, y0: -40, y1: 300, w0: 200, w1: 420, speed: 8 + ch * 600, x0: -900, x1: W + 900, a: o.cloudA ?? 0.95, col: o.cloudCol, stretch: 1 + ch * 0.8 }), t);
  // birds
  if (!ch && o.birds !== false) withParallax(ctx, cam, 0.2, g => { for (let i = 0; i < 5; i++) bird(g, wrap(200 + i * 70 + t * 60, -100, W + 100), 180 + Math.sin(i * 2) * 30 + Math.sin(t + i) * 8, 1.2, t, i); }, t);
  // --- far skylines ---
  const shakeFar = ch * 6;
  withParallax(ctx, Object.assign({}, cam, { shake: (cam.shake || 0) + shakeFar }), 0.18, g => skyline(g, 11, -1600, GY - 40, { width: 5200, hmin: 160, hmax: 430, col: o.farCol || '#9fb5cf', lit: o.lit || 0, winA: 0.25 }), t);
  withParallax(ctx, Object.assign({}, cam, { shake: (cam.shake || 0) + shakeFar }), 0.4, g => skyline(g, 12, -2400, GY - 10, { width: 6400, hmin: 220, hmax: 560, col: o.midCol || '#7f97b4', lit: o.lit || 0, winA: 0.3 }), t);
  if (o.haze) { ctx.fillStyle = o.haze; ctx.fillRect(0, 0, W, H); }
  // --- main world layer ---
  ctx.save(); applyCam(ctx, cam, t);
  for (const b of STREET_BLD) {
    if (b.x + b.w < vx0 || b.x > vx1) continue;
    const r = rng(b.seed);
    const sway = ch ? Math.sin(ct * 9 + b.seed) * 0.012 * ch + ch * 0.02 * clamp(ct / 2) : 0;
    const crumble = ruin ? (r() < 0.45 ? ruin * (0.3 + r() * 0.5) : 0) : (ch && r() < 0.35 ? clamp((ct - 1.5 - r() * 2) / 2) * 0.55 : 0);
    const broken = Math.max(ruin * 0.6, ch ? clamp((ct - r() * 1.5) / 1.5) * 0.85 : 0);
    if (b.x % 3 < 1.2 && b.h < 520 && !ch && !ruin) drawShopfront(ctx, b.x, GY, b.w, b.h, b.seed % 1000, { lit: o.lit || 0, t });
    else drawBuilding(ctx, b, GY, { lit: o.lit || 0, t, tilt: sway, broken, crumble, cracks: ruin ? 1 : ch * clamp(ct / 2), col: ruin ? mix(b.col, '#8a8378', 0.35) : null });
  }
  // street
  const L = drawStreet(ctx, vx0, vx1, ROAD, { crack: ruin ? 1 : ch * clamp(ct / 2) });
  // rubble piles at building bases in the aftermath
  if (ruin) { const rr = rng(404); for (let x = Math.floor(vx0 / 260) * 260; x < vx1; x += 260) { const h = 30 + hash(x) * 70 * ruin, w = 160 + hash(x + 1) * 140; ctx.fillStyle = ['#8a8378', '#7a7266', '#9a9184'][Math.abs(x / 260) % 3 | 0]; ctx.beginPath(); ctx.moveTo(x - w / 2, GY + 8); for (let k = 0; k <= 6; k++) ctx.lineTo(x - w / 2 + w * k / 6, GY + 6 - Math.sin(k / 6 * PI) * h - hash(x + k) * 15); ctx.lineTo(x + w / 2, GY + 8); ctx.fill(); ctx.strokeStyle = 'rgba(20,20,25,0.5)'; ctx.lineWidth = 2; ctx.stroke(); } }
  // far props (trees + lamps on far sidewalk)
  for (let x = Math.floor(vx0 / 420) * 420; x < vx1; x += 420) {
    drawTree(ctx, x + 60, GY + 6, 0.9, { t, seed: x, bend: ch * (0.9 + 0.2 * Math.sin(ct * 14 + x)) * clamp(ct * 3), leafA: ruin ? 0.25 : 1 - ch * clamp(ct / 3) * 0.7 });
  }
  // traffic
  if (o.traffic !== false) {
    const slide = ch ? (i, x) => ({ dx: ch * ct * ct * (200 + (i % 3) * 120), dy: -ch * Math.max(0, ct - 1) * (i % 2) * 40, tilt: ch * clamp(ct - 0.4) * ((i % 3) - 1) * 0.6 }) : null;
    const stop = ch || ruin ? (tt => (o.carT0 ?? tt)) : null;
    if (!ruin) {
      traffic(ctx, t, { y: L.lane1, dir: -1, speed: 230, n: 7, seed: 5, x0: vx0 - 300, x1: vx1 + 300, s: 0.72, slide, stop });
      traffic(ctx, t, { y: L.lane2, dir: 1, speed: 260, n: 7, seed: 6, x0: vx0 - 300, x1: vx1 + 300, s: 0.8, slide, stop });
    } else {
      // abandoned, tilted cars
      const r = rng(99); for (let x = Math.floor(vx0 / 380) * 380; x < vx1; x += 380) { const k = r(); drawCar(ctx, x + k * 120, (k < 0.5 ? L.lane1 : L.lane2), 0.78, { col: CAR_COLS[Math.floor(r() * 10)], dir: r() < 0.5 ? 1 : -1, tilt: (r() - 0.5) * 0.25, kind: r() < 0.15 ? 'van' : 'sedan' }); }
    }
  }
  // far pedestrians
  if (o.walkers !== false && !ch && !ruin) for (let i = 0; i < 14; i++) walker(ctx, i, t, { x0: vx0, x1: vx1, y: GY - 2, s: 11, seed: 3 });
  // near sidewalk props: lamps, trees, traffic lights
  for (let x = Math.floor(vx0 / 600) * 600; x < vx1; x += 600) {
    const tilt = ch ? ch * clamp((ct - 0.5) / 1.5) * 0.5 * (hash(x) > 0.4 ? 1 : 0.3) : ruin ? (hash(x) - 0.5) * 0.3 : 0;
    drawLamp(ctx, x + 300, L.nearWalk - 30, 1.1, o.lampOn || 0, tilt);
    if (hash(x + 1) > 0.5) drawTrafficLight(ctx, x + 520, L.nearWalk - 30, 1.0, t, hash(x), tilt * 0.7, ch > 0 || ruin > 0);
    else drawTree(ctx, x + 520, L.nearWalk - 30, 1.25, { t, seed: x + 7, bend: ch * 1.1 * clamp(ct * 3), leafA: ruin ? 0.3 : 1 - ch * clamp(ct / 3) * 0.6 });
  }
  if (o.nearWalkers && !ch && !ruin) for (let i = 0; i < 10; i++) walker(ctx, i, t, { x0: vx0, x1: vx1, y: L.nearWalk + 10, s: 21, seed: 8 });
  if (o.inWorld) o.inWorld(ctx, L);
  ctx.restore();
  // --- chaos overlays (screen space) ---
  if (ch) {
    debris(ctx, ct * 0.9, { n: Math.floor(60 * ch), seed: 21, vx: 2200, vy: -120, size: 16, kinds: ['chunk', 'paper', 'leaf', 'glass', 'brick'], a: clamp(ct * 2) });
    windStreaks(ctx, t, { n: Math.floor(70 * ch), a: 0.45 * ch, speed: 4200, len: 420, seed: 8 });
    dust(ctx, ct, { n: 50, vx: 1500, vy: -30, a: 0.55 * ch * clamp((ct - 0.3) / 2), size: 120, y0: 300, y1: H + 100, col: '#b39a7a' });
    // dust wall sweeping in from the left
    const wx = lerp(-700, W + 1500, clamp(ct / 4.5));
    ctx.fillStyle = linear(ctx, wx - 1500, 0, wx, 0, [[0, `rgba(150,128,100,${0.22 * ch})`], [0.7, `rgba(150,128,100,${0.6 * ch})`], [1, 'rgba(150,128,100,0)']]); ctx.fillRect(0, 0, Math.max(0, wx), H);
  }
  if (o.dustA) { ctx.fillStyle = `rgba(160,140,115,${o.dustA})`; ctx.fillRect(0, 0, W, H); }
  return L;
}
