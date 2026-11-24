// ============ stickman rig: white heads, black outlines, expressive faces ============
// Units: head radius = 1. Origin = ground point under the hip. Angles in radians, 0 = pointing down,
// positive = rotated toward the facing direction.
const LIMB = { torso: 2.35, neck: 0.25, uarm: 1.35, farm: 1.25, thigh: 1.55, shin: 1.5 };

const POSE0 = { lean: 0, head: 0, aF: 0.12, eF: 0.15, aB: -0.12, eB: 0.15, lF: 0.05, kF: 0.05, lB: -0.05, kB: 0.05, bob: 0, rot: 0, dx: 0 };
function pose(o) { return Object.assign({}, POSE0, o); }
function mixPose(a, b, k) { const o = {}; for (const key in POSE0) o[key] = lerp(a[key] ?? POSE0[key], b[key] ?? POSE0[key], k); return o; }

const P = {
  stand: (t = 0, seed = 0) => pose({ lean: 0.02 + Math.sin(t * 1.3 + seed) * 0.015, head: Math.sin(t * 0.7 + seed) * 0.04, aF: 0.1 + Math.sin(t * 1.3 + seed) * 0.02, aB: -0.1, bob: Math.sin(t * 2.6 + seed) * 0.02 }),
  walk: (p, amt = 1) => {
    const s = Math.sin(p * TAU), c = Math.cos(p * TAU);
    return pose({ lean: 0.07 * amt, head: -0.03, aF: -0.45 * s * amt, eF: 0.25 + 0.2 * Math.max(0, -s), aB: 0.45 * s * amt, eB: 0.25 + 0.2 * Math.max(0, s),
      lF: 0.42 * s * amt, kF: (0.1 + 0.75 * Math.max(0, -c)) * amt, lB: -0.42 * s * amt, kB: (0.1 + 0.75 * Math.max(0, c)) * amt, bob: -Math.abs(c) * 0.12 * amt + 0.06 });
  },
  run: (p) => {
    const s = Math.sin(p * TAU), c = Math.cos(p * TAU);
    return pose({ lean: 0.3, head: -0.2, aF: -0.9 * s, eF: 1.5, aB: 0.9 * s, eB: 1.5, lF: 0.75 * s + 0.15, kF: 0.3 + 1.1 * Math.max(0, -c), lB: -0.75 * s + 0.15, kB: 0.3 + 1.1 * Math.max(0, c), bob: Math.abs(s) * 0.25 - 0.15 });
  },
  phone: (t = 0, seed = 0) => pose({ lean: 0.08, head: 0.28 + Math.sin(t * 0.8 + seed) * 0.03, aF: 0.38, eF: 2.05, aB: -0.08, eB: 0.2, bob: Math.sin(t * 2.4 + seed) * 0.02 }),
  walkPhone: (p) => { const w = P.walk(p, 0.75); return Object.assign(w, { aF: 0.38, eF: 2.05, head: 0.3, lean: 0.1 }); },
  shock: (t = 0) => pose({ lean: -0.15, head: -0.15, aF: 1.2 + Math.sin(t * 20) * 0.08, eF: 0.9, aB: -1.2 - Math.sin(t * 19) * 0.08, eB: -0.9, lF: 0.2, kF: 0.25, lB: -0.25, kB: 0.25, bob: -0.12 }),
  armsUp: (t = 0) => pose({ lean: -0.05, aF: 2.6 + Math.sin(t * 9) * 0.25, eF: 0.4, aB: -2.6 - Math.sin(t * 8) * 0.25, eB: -0.4, lF: 0.15, lB: -0.15 }),
  flail: (t = 0) => pose({ lean: -0.35, head: -0.3, aF: 2.2 + Math.sin(t * 13) * 0.7, eF: 0.8 + Math.sin(t * 11) * 0.5, aB: -2.0 + Math.sin(t * 12 + 1) * 0.7, eB: -0.6 + Math.sin(t * 10) * 0.5, lF: 0.6 + Math.sin(t * 9) * 0.5, kF: 0.9, lB: -0.4 + Math.sin(t * 8 + 2) * 0.5, kB: 0.6 }),
  sit: (t = 0) => pose({ lean: -0.05, aF: 0.5, eF: 0.6, aB: -0.3, eB: 0.4, lF: 1.5, kF: 1.5, lB: 1.4, kB: 1.4, bob: 1.45 }),
  lie: (t = 0) => pose({ rot: -PI / 2, aF: 2.8, eF: 0.6, aB: 2.6, eB: 0.7, lF: 0.05, lB: -0.1, kF: 0.4, bob: 0, dx: 0 }),
  crouch: (t = 0) => pose({ lean: 0.5, head: -0.25, aF: 1.6, eF: 1.9, aB: 1.3, eB: 1.9, lF: 1.25, kF: 2.2, lB: 0.9, kB: 2.0, bob: 1.55 }),
  cover: (t = 0) => pose({ lean: 0.4, head: 0.35, aF: 2.5, eF: 2.0, aB: 2.3, eB: 2.1, lF: 1.0, kF: 1.9, lB: 0.6, kB: 1.6, bob: 1.1 + Math.sin(t * 30) * 0.02 }),
  point: (t = 0) => pose({ lean: 0.02, aF: 1.45, eF: 0.1, aB: -0.1, eB: 0.2 }),
  wave: (t = 0) => pose({ aF: 2.5, eF: 0.5 + Math.sin(t * 8) * 0.4, aB: -0.1 }),
  think: (t = 0) => pose({ head: 0.12, aF: 0.6, eF: 2.4, aB: 0.5, eB: 1.5 }),
  lookUp: (t = 0) => pose({ lean: -0.1, head: -0.45, aF: 0.2, aB: -0.2 }),
  carry: (p) => { const w = P.walk(p, 0.6); return Object.assign(w, { aF: 1.1, eF: 0.9, aB: 1.0, eB: 1.0, lean: 0.12 }); },
  dig: (t) => { const k = Math.sin(t * 4); return pose({ lean: 0.55 + k * 0.2, head: -0.2, aF: 1.2 + k * 0.5, eF: 0.5, aB: 1.0 + k * 0.5, eB: 0.8, lF: 0.4, kF: 0.6, lB: -0.3, kB: 0.4, bob: 0.25 }); },
  hammer: (t) => { const k = Math.max(0, Math.sin(t * 6)); return pose({ lean: 0.25, aF: 1.4 + k * 1.3, eF: 0.4 + k * 0.6, aB: 0.9, eB: 1.2, lF: 0.2, lB: -0.15 }); },
  hug: (t = 0) => pose({ lean: 0.15, aF: 1.4, eF: 1.3, aB: 1.3, eB: 1.4 }),
  sitGround: (t = 0) => pose({ lean: 0.25, head: 0.3, aF: 0.9, eF: 1.2, aB: 0.7, eB: 1.3, lF: 1.7, kF: 2.6, lB: 1.5, kB: 2.5, bob: 2.75 }),
  getUp: (k) => mixPose(P.sitGround(), P.stand(), k),
};

// outfits: {shirt, hair: 'alex'|'short'|'pony'|'bald'|'bun'|'cap', hat, tie, skirt, glasses, bag}
const RESCUER = { shirt: '#ff7a1a', vest: true, hair: 'helmet', capCol: '#f5b700' };
const FIREFIGHTER = { shirt: '#2b2f38', vest: true, hair: 'helmet', capCol: '#d62828' };
const DOCTOR = { shirt: '#5fa8d3', coat: true, cross: true, hair: 'short' };
const ALEX = { shirt: '#2f73d9', hood: true, hair: 'alex', strap: '#e0a030', shoes: '#f2f2f2', name: 'alex' };
const OUTFIT_COLS = ['#e2574c', '#f0a43a', '#4caf6d', '#8e5bd6', '#3a3a46', '#d9d9de', '#e86fa6', '#2a9d8f', '#c0392b', '#7f8c8d', '#f4d35e', '#264653'];
function randomOutfit(seed) {
  const r = rng(seed * 31 + 3);
  const hairs = ['short', 'short', 'pony', 'bald', 'bun', 'cap', 'short', 'long'];
  return { shirt: OUTFIT_COLS[Math.floor(r() * OUTFIT_COLS.length)], hair: hairs[Math.floor(r() * hairs.length)], tie: r() < 0.2, skirt: r() < 0.15, glasses: r() < 0.2, bag: r() < 0.25 ? 'brief' : null, scale: 0.88 + r() * 0.2, hairCol: ['#111', '#3b2516', '#6b4423', '#c49a54', '#111'][Math.floor(r() * 5)], capCol: OUTFIT_COLS[Math.floor(r() * 12)] };
}

function limbPt(x, y, ang, len, dir) { return [x + Math.sin(ang) * len * dir, y + Math.cos(ang) * len]; }

// main draw. o: {pose, dir(+1/-1/0 front), expr, look:[x,y], t, seed, outfit, prop, lw, alpha, blink}
function drawStick(ctx, x, y, s, o = {}) {
  const p = o.pose || P.stand(o.t || 0, o.seed || 0), dir = o.dir === undefined ? 1 : o.dir, fd = dir === 0 ? 1 : dir;
  const out = o.outfit || {}, sc = s * (out.scale || 1), lw = o.lw || 0.3;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const hipH = LIMB.thigh + LIMB.shin;
  // hip & whole-body rotation (pivot at hip)
  const hx = (p.dx || 0), hy = -hipH + (p.bob || 0);
  ctx.translate(hx, hy); if (p.rot) ctx.rotate(p.rot * fd);
  const neck = limbPt(0, 0, PI - p.lean, LIMB.torso, fd); // up from hip
  const sh = [lerp(0, neck[0], 0.88), lerp(0, neck[1], 0.88)];
  const headAng = p.lean + p.head;
  const hc = [neck[0] + Math.sin(headAng) * fd * (1 + LIMB.neck), neck[1] - Math.cos(headAng) * (1 + LIMB.neck)];
  const arm = (a, e) => { const el = limbPt(sh[0], sh[1], a, LIMB.uarm, fd); const ha = limbPt(el[0], el[1], a + e, LIMB.farm, fd); return [el, ha]; };
  const leg = (l, k) => { const kn = limbPt(0, 0, l, LIMB.thigh, fd); const ft = limbPt(kn[0], kn[1], l - k, LIMB.shin, fd); return [kn, ft]; };
  const [elF, haF] = arm(p.aF, p.eF), [elB, haB] = arm(p.aB, p.eB);
  const [knF, ftF] = leg(p.lF, p.kF), [knB, ftB] = leg(p.lB, p.kB);
  const back = '#3a3a40';
  const stroke = (pts, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) ctx.lineTo(q[0], q[1]); ctx.stroke(); };
  const foot = (kn, ft, col, l, k) => { const a = l - k; const tip = [ft[0] + Math.cos(a) * 0.45 * fd, ft[1] - Math.sin(a) * 0.45 * (dir === 0 ? 0 : 1)]; stroke([ft, tip], out.shoes || col, lw * 1.25); };
  // back limbs
  stroke([[0, 0], knB, ftB], back, lw); foot(knB, ftB, back, p.lB, p.kB);
  if (out.bag === 'brief' && !o.prop) drawBrief(ctx, haB[0], haB[1], fd);
  stroke([sh, elB, haB], back, lw); circ(ctx, haB[0], haB[1], lw * 0.75); ctx.fillStyle = back; ctx.fill();
  // backpack (Alex)
  if (out.strap) { const bx = (sh[0] + 0) / 2 - 0.55 * fd, by = (sh[1]) / 2 - 0.1; ctx.fillStyle = '#d98a1f'; rrect(ctx, bx - 0.4, by - 0.75, 0.8, 1.5, 0.3); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.12; ctx.stroke(); }
  // torso + clothing
  if (out.shirt) {
    stroke([[0, 0.1], sh], INK, 1.05 + 0.24); stroke([[0, 0.1], sh], out.shirt, 1.05);
    if (out.skirt) { ctx.fillStyle = out.shirt; poly(ctx, [[-0.5, -0.4], [0.5, -0.4], [0.9, 1.2], [-0.9, 1.2]]); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.12; ctx.stroke(); }
    if (out.tie) stroke([[lerp(0, sh[0], 0.85) + 0.05 * fd, lerp(0, sh[1], 0.85)], [lerp(0, sh[0], 0.45) + 0.1 * fd, lerp(0, sh[1], 0.45)]], '#b8202a', 0.22);
    if (out.strap) stroke([[sh[0] - 0.3 * fd, sh[1] + 0.1], [0.25 * fd, -0.6]], out.strap, 0.16);
    if (out.vest) { const m = (k) => [lerp(0, sh[0], k), lerp(0.1, sh[1], k)]; stroke([[m(0.35)[0] - 0.5, m(0.35)[1]], [m(0.35)[0] + 0.5, m(0.35)[1]]], '#e8f0f0', 0.16); stroke([[m(0.6)[0] - 0.5, m(0.6)[1]], [m(0.6)[0] + 0.5, m(0.6)[1]]], '#e8f0f0', 0.16); }
    if (out.coat) { stroke([sh, [0, 0.9]], '#f4f6f8', 1.15); ctx.strokeStyle = INK; ctx.lineWidth = 0.06; line(ctx, sh[0] * 0.5, sh[1] * 0.5 + 0.1, 0, 0.9); if (out.cross) { ctx.fillStyle = '#e53935'; ctx.fillRect(sh[0] * 0.7 - 0.15, sh[1] * 0.7 - 0.05, 0.3, 0.1); ctx.fillRect(sh[0] * 0.7 - 0.05, sh[1] * 0.7 - 0.15, 0.1, 0.3); } }
    if (out.hood) { ctx.fillStyle = shade(out.shirt, -0.15); ell(ctx, neck[0] - 0.55 * fd, neck[1] + 0.05, 0.62, 0.38, -0.3 * fd); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.12; ctx.stroke(); }
  } else stroke([[0, 0], neck], INK, lw);
  stroke([neck, [hc[0] - Math.sin(headAng) * fd * 0.8, hc[1] + Math.cos(headAng) * 0.8]], INK, lw);
  // front leg
  stroke([[0, 0], knF, ftF], INK, lw); foot(knF, ftF, INK, p.lF, p.kF);
  // head
  drawHead(ctx, hc[0], hc[1], headAng * fd, dir, o, out);
  // front arm + prop
  stroke([sh, elF, haF], INK, lw);
  if (o.prop) drawProp(ctx, o.prop, haF, Math.atan2(haF[1] - elF[1], haF[0] - elF[0]), fd, o.t || 0);
  if (out.sleeves) stroke([sh, elF], out.shirt, lw * 2);
  circ(ctx, haF[0], haF[1], lw * 0.75); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
  return { hand: haF, head: hc };
}
function drawBrief(ctx, x, y, fd) { ctx.fillStyle = '#5b3a22'; rrect(ctx, x - 0.5, y + 0.05, 1.0, 0.7, 0.1); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.1; ctx.stroke(); }
function drawProp(ctx, kind, h, ang, fd, t) {
  ctx.save(); ctx.translate(h[0], h[1]);
  if (kind === 'phone') { ctx.rotate(-0.25 * fd); ctx.fillStyle = '#16161c'; rrect(ctx, -0.28, -0.75, 0.56, 0.95, 0.1); ctx.fill(); ctx.fillStyle = '#7fd3ff'; rrect(ctx, -0.2, -0.66, 0.4, 0.74, 0.06); ctx.fill(); glow(ctx, 0, -0.3, 1.4, 'rgba(140,210,255,0.35)'); }
  else if (kind === 'coffee') { ctx.fillStyle = '#f4efe6'; poly(ctx, [[-0.3, -0.7], [0.3, -0.7], [0.22, 0.2], [-0.22, 0.2]]); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.1; ctx.stroke(); ctx.fillStyle = '#8a5a3a'; ctx.fillRect(-0.28, -0.45, 0.55, 0.25); ctx.fillStyle = '#2b2b2b'; ctx.fillRect(-0.34, -0.82, 0.68, 0.14); }
  else if (kind === 'brief') drawBrief(ctx, 0, 0, fd);
  else if (kind === 'flashlight') { ctx.rotate(ang); ctx.fillStyle = '#333'; ctx.fillRect(-0.1, -0.15, 0.8, 0.3); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,240,180,0.18)'; poly(ctx, [[0.8, -0.1], [9, -2.2], [9, 2.2], [0.8, 0.1]]); ctx.fill(); }
  else if (kind === 'box') { ctx.fillStyle = '#c8955a'; ctx.fillRect(-0.9 * fd - 0.2, -1.0, 1.6, 1.1); ctx.strokeStyle = INK; ctx.lineWidth = 0.1; ctx.strokeRect(-0.9 * fd - 0.2, -1.0, 1.6, 1.1); }
  else if (kind === 'hammer') { ctx.rotate(ang); ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 0.18; line(ctx, -0.3, 0, 1.1, 0); ctx.fillStyle = '#555'; ctx.fillRect(0.9, -0.35, 0.3, 0.7); }
  else if (kind === 'shovel') { ctx.rotate(ang); ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 0.16; line(ctx, -0.8, 0, 2.2, 0); ctx.fillStyle = '#777'; poly(ctx, [[2.2, -0.35], [2.9, -0.3], [3.0, 0.3], [2.2, 0.35]]); ctx.fill(); }
  else if (kind === 'radio') { ctx.fillStyle = '#ffb000'; rrect(ctx, -0.3, -0.8, 0.6, 1.0, 0.1); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.08; ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 0.08; line(ctx, 0.15, -0.8, 0.2, -1.4); }
  else if (kind === 'ball') { ctx.fillStyle = '#ff5a4d'; circ(ctx, 0.3 * fd, -0.3, 0.5); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(0.3 * fd - 0.5, -0.38, 1, 0.16); }
  ctx.restore();
}

function blinkAt(t, seed) { const per = 3.2 + hash(seed) * 2.5, ph = (t + hash(seed + 9) * per) % per; return ph < 0.13 ? 1 - Math.abs(ph - 0.065) / 0.065 : 0; }

// head with face. dir 0 = front, ±1 = 3/4 view toward that side
function drawHead(ctx, x, y, tilt, dir, o, out) {
  const t = o.t || 0, expr = o.expr || 'neutral', fd = dir === 0 ? 0 : dir;
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt * 0.6);
  // hair behind
  const hc = out.hairCol || '#151515';
  if (out.hair === 'pony') { ctx.fillStyle = hc; ell(ctx, -0.95 * (fd || 1), 0.1, 0.45, 0.7, 0.5 * (fd || 1)); ctx.fill(); }
  if (out.hair === 'long') { ctx.fillStyle = hc; rrect(ctx, -1.08, -0.6, 2.16, 1.8, 0.6); ctx.fill(); }
  // skull
  circ(ctx, 0, 0, 1); ctx.fillStyle = o.headCol || '#ffffff'; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; ell(ctx, 0.25, 0.35, 0.8, 0.6); ctx.fill();
  ctx.lineWidth = 0.13; ctx.strokeStyle = INK; circ(ctx, 0, 0, 1); ctx.stroke();
  // hair on top
  ctx.fillStyle = hc;
  if (out.hair === 'alex') {
    ctx.fillStyle = '#1b1410';
    ctx.beginPath(); ctx.moveTo(-0.95, -0.25); ctx.quadraticCurveTo(-1.05, -1.0, -0.2, -1.12);
    ctx.lineTo(-0.05, -1.45); ctx.lineTo(0.2, -1.12); ctx.lineTo(0.55, -1.38); ctx.lineTo(0.6, -1.0); ctx.lineTo(1.0, -1.05);
    ctx.quadraticCurveTo(1.05, -0.5, 0.92, -0.35); ctx.quadraticCurveTo(0.5, -0.75, 0.05, -0.62); ctx.quadraticCurveTo(-0.5, -0.55, -0.95, -0.25); ctx.fill();
  } else if (out.hair === 'short' || out.hair === 'pony' || out.hair === 'long') {
    ctx.beginPath(); ctx.arc(0, 0, 1.04, PI + 0.25, -0.25); ctx.quadraticCurveTo(0, -0.55, -0.98, -0.25); ctx.fill();
  } else if (out.hair === 'bun') { ctx.beginPath(); ctx.arc(0, 0, 1.04, PI + 0.3, -0.3); ctx.quadraticCurveTo(0, -0.6, -0.96, -0.3); ctx.fill(); circ(ctx, -0.1, -1.15, 0.42); ctx.fill(); }
  else if (out.hair === 'helmet') { ctx.fillStyle = out.capCol || '#f5b700'; ctx.beginPath(); ctx.arc(0, -0.05, 1.08, PI + 0.05, -0.05); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.1; ctx.stroke(); ctx.fillRect(-1.25, -0.12, 2.5, 0.16); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-0.15, -1.0, 0.3, 0.9); }
  else if (out.hair === 'cap') { ctx.fillStyle = out.capCol || '#e2574c'; ctx.beginPath(); ctx.arc(0, -0.1, 1.04, PI + 0.15, -0.15); ctx.closePath(); ctx.fill(); ctx.fillRect(-0.1 + 0.4 * (fd || 1), -0.32, 0.9 * (fd || 1), 0.16); }
  // face
  const fx = fd * 0.32 + (o.look ? o.look[0] * 0.12 : 0), fy = 0.05 + (o.look ? o.look[1] * 0.1 : 0);
  const blink = Math.max(o.blink || 0, (expr === 'happy' || expr === 'sleep' || expr === 'dazed') ? 0 : blinkAt(t, (o.seed || 0) + 3));
  const E = FACES[expr] || FACES.neutral;
  const ex = 0.36, ey = -0.08 + fy;
  ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const cx = fx + side * ex * (1 - Math.abs(fd) * 0.12 * side * fd), cy = ey;
    drawEye(ctx, cx, cy, E, blink, side, o.look, t);
    // brows
    if (E.brow !== null) { const [ba, bh] = E.brow; ctx.lineWidth = 0.1; ctx.beginPath(); ctx.moveTo(cx - 0.17, cy - 0.3 - bh + ba * side * -0.1); ctx.lineTo(cx + 0.17, cy - 0.3 - bh + ba * side * 0.1); ctx.stroke(); }
  }
  if (out.glasses) { ctx.lineWidth = 0.07; for (const side of [-1, 1]) { circ(ctx, fx + side * ex, ey, 0.22); ctx.stroke(); } line(ctx, fx - 0.14, ey, fx + 0.14, ey); }
  drawMouth(ctx, fx * 0.9, 0.45 + fy * 0.5, E.mouth, t, o.talk);
  if (E.sweat) { const k = (t * 0.7) % 1; ctx.fillStyle = '#9fd6ff'; ctx.globalAlpha = 1 - k; ctx.beginPath(); const sx = 0.85 * (fd >= 0 ? -1 : 1), sy = -0.5 + k * 0.6; ctx.moveTo(sx, sy - 0.22); ctx.quadraticCurveTo(sx + 0.13, sy, sx, sy + 0.08); ctx.quadraticCurveTo(sx - 0.13, sy, sx, sy - 0.22); ctx.fill(); ctx.globalAlpha = 1; }
  if (E.blush) { ctx.fillStyle = 'rgba(255,110,110,0.35)'; ell(ctx, fx - 0.55, 0.3, 0.17, 0.09); ctx.fill(); ell(ctx, fx + 0.55, 0.3, 0.17, 0.09); ctx.fill(); }
  ctx.restore();
}
// eyes: kind 'dot' | 'big' | 'happy' | 'closed' | 'wide' | 'half' | 'x'
const FACES = {
  neutral: { eye: 'dot', brow: [0, 0], mouth: 'line' },
  smile: { eye: 'dot', brow: [0, 0.03], mouth: 'smile' },
  happy: { eye: 'happy', brow: [0, 0.06], mouth: 'grin', blush: true },
  focus: { eye: 'dot', brow: [0.3, -0.03], mouth: 'line' },
  surprised: { eye: 'big', brow: [0, 0.14], mouth: 'o' },
  shock: { eye: 'wide', brow: [-0.5, 0.18], mouth: 'scream' },
  scared: { eye: 'wide', brow: [-0.7, 0.12], mouth: 'wobble', sweat: true },
  worried: { eye: 'dot', brow: [-0.7, 0.08], mouth: 'down' },
  sad: { eye: 'dot', brow: [-0.8, 0.05], mouth: 'down' },
  determined: { eye: 'dot', brow: [0.9, -0.02], mouth: 'firm' },
  confused: { eye: 'dot', brow: [0.6, 0.06], mouth: 'squiggle' },
  dazed: { eye: 'half', brow: [-0.3, 0.0], mouth: 'line' },
  sleep: { eye: 'closed', brow: [0, 0], mouth: 'line' },
  relief: { eye: 'happy', brow: [-0.4, 0.05], mouth: 'smile' },
  awe: { eye: 'big', brow: [-0.2, 0.12], mouth: 'smallo' },
};
function drawEye(ctx, cx, cy, E, blink, side, look, t) {
  const lx = look ? look[0] * 0.06 : 0, ly = look ? look[1] * 0.06 : 0;
  if (E.eye === 'happy') { ctx.lineWidth = 0.1; ctx.beginPath(); ctx.arc(cx, cy + 0.06, 0.13, PI + 0.3, -0.3); ctx.stroke(); return; }
  if (E.eye === 'closed' || blink > 0.6) { ctx.lineWidth = 0.08; ctx.beginPath(); ctx.arc(cx, cy - 0.05, 0.12, 0.4, PI - 0.4); ctx.stroke(); return; }
  if (E.eye === 'big' || E.eye === 'wide') {
    const r = E.eye === 'wide' ? 0.22 : 0.19;
    ctx.fillStyle = '#fff'; ell(ctx, cx, cy, r, r * 1.12 * (1 - blink)); ctx.fill(); ctx.lineWidth = 0.07; ctx.stroke();
    ctx.fillStyle = INK; const pr = E.eye === 'wide' ? 0.06 + Math.sin(t * 25) * 0.005 : 0.1; circ(ctx, cx + lx, cy + ly, pr); ctx.fill();
    ctx.fillStyle = '#fff'; circ(ctx, cx + lx - 0.03, cy + ly - 0.04, 0.025); ctx.fill(); return;
  }
  if (E.eye === 'half') { ctx.fillStyle = INK; ell(ctx, cx + lx, cy + 0.03, 0.09, 0.05); ctx.fill(); ctx.lineWidth = 0.07; line(ctx, cx - 0.15, cy - 0.04, cx + 0.15, cy - 0.04); return; }
  ctx.fillStyle = INK; ell(ctx, cx + lx, cy + ly, 0.095, 0.13 * (1 - blink)); ctx.fill();
  ctx.fillStyle = '#fff'; circ(ctx, cx + lx - 0.03, cy + ly - 0.045, 0.03); ctx.fill();
}
function drawMouth(ctx, x, y, m, t, talk) {
  ctx.lineWidth = 0.09; ctx.strokeStyle = INK; ctx.fillStyle = INK;
  if (talk) { const k = Math.abs(Math.sin(t * 13)) * 0.15 + 0.04; ctx.fillStyle = '#3a1418'; ell(ctx, x, y, 0.16, k); ctx.fill(); ctx.stroke(); return; }
  if (m === 'line') line(ctx, x - 0.15, y, x + 0.15, y);
  else if (m === 'smile') { ctx.beginPath(); ctx.arc(x, y - 0.12, 0.2, 0.5, PI - 0.5); ctx.stroke(); }
  else if (m === 'grin') { ctx.beginPath(); ctx.moveTo(x - 0.24, y - 0.06); ctx.quadraticCurveTo(x, y + 0.32, x + 0.24, y - 0.06); ctx.closePath(); ctx.fillStyle = '#3a1418'; ctx.fill(); ctx.stroke(); }
  else if (m === 'o') { ctx.fillStyle = '#3a1418'; ell(ctx, x, y + 0.02, 0.11, 0.15); ctx.fill(); ctx.stroke(); }
  else if (m === 'smallo') { ctx.fillStyle = '#3a1418'; ell(ctx, x, y + 0.02, 0.07, 0.08); ctx.fill(); ctx.stroke(); }
  else if (m === 'scream') { ctx.fillStyle = '#3a1418'; ell(ctx, x, y + 0.06, 0.2, 0.24 + Math.sin(t * 30) * 0.015); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e86a7a'; ell(ctx, x, y + 0.2, 0.11, 0.06); ctx.fill(); }
  else if (m === 'wobble') { ctx.beginPath(); ctx.moveTo(x - 0.2, y + 0.05); for (let i = 1; i <= 8; i++) ctx.lineTo(x - 0.2 + i * 0.05, y + 0.05 + Math.sin(i * 2 + t * 18) * 0.03); ctx.stroke(); }
  else if (m === 'down') { ctx.beginPath(); ctx.arc(x, y + 0.17, 0.17, PI + 0.6, -0.6); ctx.stroke(); }
  else if (m === 'firm') { ctx.lineWidth = 0.11; line(ctx, x - 0.17, y + 0.02, x + 0.17, y - 0.01); }
  else if (m === 'squiggle') { ctx.beginPath(); ctx.moveTo(x - 0.18, y); ctx.bezierCurveTo(x - 0.06, y - 0.1, x + 0.04, y + 0.1, x + 0.18, y - 0.03); ctx.stroke(); }
}

// Convenience: Alex
function drawAlex(ctx, x, y, s, o = {}) { return drawStick(ctx, x, y, s, Object.assign({ outfit: ALEX, seed: 42 }, o)); }

// A crowd walker on a line: deterministic pedestrian with walk cycle, wraps across [x0, x1]
function walker(ctx, i, t, { x0 = -200, x1 = W + 200, y = 900, s = 40, seed = 1, speed = null, prop = null, expr = 'neutral' }) {
  const r = rng(seed * 1000 + i * 17), dir = r() < 0.5 ? 1 : -1, v = (speed ?? (60 + r() * 50)) * (s / 40);
  const x = wrap(r() * (x1 - x0) + dir * v * t, x0, x1);
  const ph = t * v / (s * 3.0) + r();
  const out = randomOutfit(seed * 100 + i);
  const pr = prop ?? (r() < 0.25 ? 'phone' : r() < 0.2 ? 'coffee' : null);
  drawStick(ctx, x, y, s, { pose: pr === 'phone' ? P.walkPhone(ph) : P.walk(ph), dir, t, seed: i + seed, outfit: out, prop: pr, expr: pr === 'phone' ? 'focus' : expr });
  return { x, dir };
}
