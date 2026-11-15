// ---------- scenes ----------
const RED = '#ff3344', YEL = '#ffd23a', GRN = '#3dff7a';

function stars(ctx, n, seed, t, ymax = 1000, a = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = r() * W, y = r() * ymax, s = r() * 2.5 + 0.8, tw = 0.5 + 0.5 * Math.sin(t * (1 + r() * 3) + i); ctx.fillStyle = `rgba(255,255,240,${(0.3 + 0.7 * tw) * a})`; ctx.fillRect(x, y, s, s); }
}
function camera(ctx, lt, z0 = 1, z1 = 1.07, dur = 6, cx = 540, cy = 960, shake = 0, t = 0) {
  const z = lerp(z0, z1, eOut(lt / dur) * 0.6 + lt / dur * 0.4);
  ctx.translate(cx + noise1(t * 6, 1) * shake, cy + noise1(t * 6, 2) * shake); ctx.scale(z, z); ctx.translate(-cx, -cy);
}

// 1. Hook face
function sHook(ctx, lt, t) {
  bg(ctx, '#7a2a6e', '#12051e', 540, 900, 1200);
  glow(ctx, 540, 1900, 900, 'rgba(255,90,30,0.55)', 0.8 + 0.2 * Math.sin(t * 7));
  ctx.save(); camera(ctx, lt, 1.0, 1.18, 3, 540, 900, 6 + lt * 3, t);
  ctx.translate(540, 980); ctx.scale(1.4, 1.4);
  drawHero(ctx, { t, open: 1.2, pupil: 9 + 3 * Math.sin(t * 2), jitter: 3.5, red: 0.7, bags: 0.9, mouth: 'scared', sweat: 1, brow: 1, shirt: '#3a2a7a' });
  ctx.restore();
}

// 2. Night window, awake in bed
function sWindow(ctx, lt, t) {
  bg(ctx, '#1d2a6a', '#05081e', 540, 600, 1500);
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 5, 540, 1000);
  // wall texture
  ctx.fillStyle = 'rgba(255,255,255,0.025)'; for (let x = 0; x < W; x += 90) ctx.fillRect(x, 0, 3, 1300);
  // window
  const wx = 250, wy = 330, ww = 580, wh = 600;
  ctx.fillStyle = linear(ctx, 0, wy, 0, wy + wh, [[0, '#0a1550'], [1, '#2a3f9a']]); ctx.fillRect(wx, wy, ww, wh);
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  stars(ctx, 60, 5, t, 1000);
  glow(ctx, 690, 470, 220, 'rgba(220,230,255,0.5)'); ctx.fillStyle = '#f2f0dc'; ell(ctx, 690, 470, 62, 62); ctx.fill();
  ctx.fillStyle = 'rgba(180,180,160,0.5)'; ell(ctx, 670, 455, 12, 10); ctx.fill(); ell(ctx, 710, 495, 9, 8); ctx.fill();
  const r = rng(8); ctx.fillStyle = '#060a24';
  for (let x = wx - 20; x < wx + ww + 20;) { const bw = 50 + r() * 70, bh = 120 + r() * 220; ctx.fillRect(x, wy + wh - bh, bw, bh); for (let yy = wy + wh - bh + 18; yy < wy + wh - 10; yy += 34) for (let xx = x + 10; xx < x + bw - 14; xx += 22) if (r() > 0.82) { ctx.fillStyle = 'rgba(255,200,90,0.85)'; ctx.fillRect(xx, yy, 10, 14); ctx.fillStyle = '#060a24'; } x += bw + 6; }
  ctx.restore();
  ctx.strokeStyle = '#0d0f22'; ctx.lineWidth = 26; ctx.strokeRect(wx, wy, ww, wh); ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
  // curtains
  for (const s of [-1, 1]) { const x = s < 0 ? wx - 60 : wx + ww + 60; ctx.fillStyle = '#2b1b5e'; ctx.beginPath(); ctx.moveTo(x - 70 * s * -1, 290); ctx.lineTo(x + 60 * s, 290); ctx.quadraticCurveTo(x + 40 * s + Math.sin(t) * 8, 700, x + 70 * s, 1150); ctx.lineTo(x - 30 * s, 1150); ctx.quadraticCurveTo(x - 10 * s, 700, x - 70 * s * -1 + 0, 290); ctx.fill(); }
  // moonlight beam
  ctx.fillStyle = 'rgba(160,190,255,0.10)'; ctx.beginPath(); ctx.moveTo(wx, wy + wh); ctx.lineTo(wx + ww, wy + wh); ctx.lineTo(1000, 1700); ctx.lineTo(120, 1700); ctx.fill();
  // bed
  ctx.fillStyle = '#1b1f4d'; rrect(ctx, -40, 1240, 1160, 800, 40); ctx.fill();
  ctx.fillStyle = '#d9dbf0'; ell(ctx, 300, 1400, 250, 105, -0.05); ctx.fill(); ctx.fillStyle = 'rgba(40,40,100,0.35)'; ell(ctx, 330, 1430, 220, 70); ctx.fill();
  // hero lying, face up
  ctx.save(); ctx.translate(310, 1375); ctx.rotate(-Math.PI / 2 + 0.08); ctx.scale(0.42, 0.42);
  drawHero(ctx, { t, open: 1.05, look: { x: -0.8, y: 0 }, pupil: 11, jitter: 1.2, red: 0.5, bags: 0.8, mouth: 'flat', brow: 0.7, noBody: true });
  ctx.restore();
  // blanket
  ctx.fillStyle = linear(ctx, 0, 1380, 0, 1920, [[0, '#4a5ad0'], [1, '#232a78']]);
  ctx.beginPath(); ctx.moveTo(470, 1300); ctx.bezierCurveTo(600, 1250, 800, 1280, 1120, 1300); ctx.lineTo(1120, 1920); ctx.lineTo(380, 1920); ctx.bezierCurveTo(330, 1700, 400, 1450, 470, 1300); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(520 + i * 120, 1340); ctx.quadraticCurveTo(560 + i * 130, 1600, 520 + i * 140, 1900); ctx.stroke(); }
  ctx.restore();
  // clock
  const cx = 850, cy = 1190; ctx.fillStyle = '#0b0b16'; rrect(ctx, cx - 120, cy - 50, 240, 100, 16); ctx.fill();
  ctx.font = '700 72px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const mins = 47 + Math.floor(lt * 1.2); ctx.fillStyle = '#ff2b3a'; ctx.shadowColor = '#ff2b3a'; ctx.shadowBlur = 20;
  ctx.fillText(`03${Math.floor(t * 2) % 2 ? ':' : ' '}${String(mins).padStart(2, '0')}`, cx, cy + 2); ctx.shadowBlur = 0;
}

// Venice skyline
const VEN = (() => { const r = rng(21), b = []; let x = -40; while (x < 1120) { const w = 60 + r() * 90, h = 160 + r() * 200; b.push({ x, w, h, k: r() }); x += w - 4; } return b; })();
function venSky(ctx, ox, base, col, lit) {
  ctx.fillStyle = col;
  for (const b of VEN) { const x = b.x + ox; ctx.fillRect(x, base - b.h, b.w, b.h + 5); if (b.k > 0.6) { ctx.beginPath(); ctx.moveTo(x - 6, base - b.h); ctx.lineTo(x + b.w / 2, base - b.h - 40); ctx.lineTo(x + b.w + 6, base - b.h); ctx.fill(); } }
  // domes
  const dome = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.fill(); ctx.fillRect(x - r, y, 2 * r, 140); ctx.fillRect(x - 4, y - r - 40, 8, 40); ctx.beginPath(); ctx.arc(x, y - r - 12, 12, 0, 7); ctx.fill(); };
  dome(300 + ox, base - 330, 85); dome(450 + ox, base - 300, 62); dome(170 + ox, base - 290, 55);
  // campanile
  ctx.fillRect(760 + ox, base - 720, 80, 720); ctx.beginPath(); ctx.moveTo(752 + ox, base - 720); ctx.lineTo(800 + ox, base - 860); ctx.lineTo(848 + ox, base - 720); ctx.fill();
  if (lit) { const r = rng(4); for (const b of VEN) for (let yy = base - b.h + 30; yy < base - 30; yy += 46) for (let xx = b.x + ox + 12; xx < b.x + ox + b.w - 20; xx += 30) if (r() > 0.78) { ctx.fillStyle = 'rgba(255,190,90,0.9)'; ctx.beginPath(); ctx.moveTo(xx, yy + 22); ctx.lineTo(xx, yy + 6); ctx.arc(xx + 7, yy + 6, 7, Math.PI, 0); ctx.lineTo(xx + 14, yy + 22); ctx.fill(); } ctx.fillStyle = 'rgba(255,190,90,0.9)'; ctx.fillRect(785 + ox, base - 680, 30, 40); }
}
function sVenice(ctx, lt, t) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, 1100, [[0, '#040a2e'], [0.6, '#123a9a'], [1, '#3d7ae0']]); ctx.fillRect(0, 0, W, H);
  stars(ctx, 120, 9, t, 800);
  ctx.save(); camera(ctx, lt, 1.08, 1.0, 6, 540, 900);
  glow(ctx, 300, 520, 330, 'rgba(200,220,255,0.45)'); ctx.fillStyle = '#eef0ff'; ell(ctx, 300, 520, 95, 95); ctx.fill();
  // big year
  ctx.font = '700 380px Oswald'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillText('1765', 540 - lt * 12, 900);
  const base = 1150, ox = -lt * 14;
  venSky(ctx, ox * 0.5 - 60, base - 40, '#14245e', false);
  venSky(ctx, ox, base, '#050818', true);
  // water
  ctx.fillStyle = linear(ctx, 0, base, 0, H, [[0, '#0c1f66'], [1, '#020414']]); ctx.fillRect(-100, base, W + 200, H - base + 100);
  ctx.save(); ctx.globalAlpha = 0.35; ctx.translate(0, base * 2); ctx.scale(1, -1); venSky(ctx, ox, base, '#000', true); ctx.restore();
  ctx.strokeStyle = 'rgba(160,200,255,0.35)'; ctx.lineWidth = 3; const r = rng(3);
  for (let i = 0; i < 40; i++) { const y = base + 20 + r() * 700, x = (r() * W + t * 30 * (r() + 0.3)) % (W + 200) - 100, w = 30 + r() * 90; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke(); }
  // gondola
  const gx = -200 + lt * 150, gy = base + 230 + Math.sin(t * 2) * 6; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.moveTo(gx - 200, gy - 40); ctx.quadraticCurveTo(gx - 120, gy + 25, gx, gy + 25); ctx.quadraticCurveTo(gx + 140, gy + 25, gx + 220, gy - 60); ctx.lineTo(gx + 210, gy - 10); ctx.quadraticCurveTo(gx + 100, gy + 5, gx - 150, gy - 5); ctx.closePath(); ctx.fill();
  ctx.fillRect(gx + 205, gy - 90, 10, 40);
  drawPerson(ctx, gx - 110, gy - 165, 0.95, { body: '#000' }); ctx.strokeStyle = '#000'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(gx - 160, gy - 120); ctx.lineTo(gx - 40, gy + 80); ctx.stroke();
  // lamp posts
  for (const lx of [880, 1000]) { ctx.fillStyle = '#000'; ctx.fillRect(lx + ox * 1.5, base - 200, 10, 200); glow(ctx, lx + 5 + ox * 1.5, base - 210, 80, 'rgba(255,190,90,0.8)'); }
  ctx.restore();
}

// Family tree
const TREE = (() => {
  const gens = [[{ x: 440 }, { x: 640, aff: 1, src: 1 }], [], [], []];
  const ys = [720, 1000, 1280, 1560];
  gens[1] = [{ x: 180, p: 0, aff: 1 }, { x: 400, p: 0 }, { x: 680, p: 0, aff: 1 }, { x: 900, p: 0 }];
  gens[2] = [{ x: 110, p: 0, aff: 1 }, { x: 260, p: 0 }, { x: 410, p: 0, aff: 1 }, { x: 600, p: 2 }, { x: 750, p: 2, aff: 1 }, { x: 900, p: 3 }, { x: 1010, p: 3 }];
  gens[3] = [{ x: 90, p: 0 }, { x: 200, p: 0, aff: 1 }, { x: 330, p: 2, aff: 1 }, { x: 450, p: 2 }, { x: 640, p: 4, aff: 1 }, { x: 760, p: 4 }, { x: 870, p: 4, aff: 1 }, { x: 990, p: 6 }];
  return { gens, ys };
})();
function sTree(ctx, lt, t) {
  bg(ctx, '#173a92', '#030a26', 540, 1100, 1300);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2; for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.save(); camera(ctx, lt, 1.0, 1.05, 6, 540, 1100);
  const { gens, ys } = TREE; let order = 0;
  const nodeT = (g, i) => 0.15 + g * 0.45 + i * 0.05;
  const dieT = (g, i) => 2.4 + g * 0.65 + i * 0.08;
  // links
  for (let g = 1; g < 4; g++) gens[g].forEach((n, i) => {
    const par = g === 1 ? { x: 540 } : gens[g - 1][n.p]; const py = ys[g - 1], cy = ys[g];
    const p = eOut((lt - nodeT(g, i) + 0.3) / 0.4); if (p <= 0) return;
    const dead = n.aff ? sm(dieT(g, i), dieT(g, i) + 0.5, lt) : 0;
    ctx.strokeStyle = n.aff ? mix('#9cc4ff', '#5a1020', dead) : '#9cc4ff'; ctx.globalAlpha = n.aff ? 1 - dead * 0.6 : 0.9; ctx.lineWidth = 8;
    const my = (py + cy) / 2; ctx.beginPath(); ctx.moveTo(par.x, py + 50); ctx.lineTo(par.x, lerp(py + 50, my, clamp(p * 2))); if (p > 0.5) { ctx.lineTo(lerp(par.x, n.x, (p - 0.5) * 2), my); } if (p >= 1) ctx.lineTo(n.x, cy - 50); ctx.stroke(); ctx.globalAlpha = 1;
  });
  // couple link
  ctx.strokeStyle = '#9cc4ff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(490, ys[0]); ctx.lineTo(590, ys[0]); ctx.stroke();
  for (let g = 0; g < 4; g++) gens[g].forEach((n, i) => {
    const p = eBack((lt - nodeT(g, i)) / 0.35); if (p <= 0) return;
    const red = n.aff ? sm(dieT(g, i) - 0.5, dieT(g, i), lt) : 0, dead = n.aff ? sm(dieT(g, i), dieT(g, i) + 0.6, lt) : 0;
    const r = Math.max(0.5, (g === 0 ? 58 : 48) * p);
    if (red > 0 && dead < 1) glow(ctx, n.x, ys[g], r * 2.4, 'rgba(255,40,60,0.8)', red * (1 - dead));
    ctx.fillStyle = mix(mix('#2a5fd8', '#d01b2a', red), '#1a1a28', dead); ell(ctx, n.x, ys[g], r, r); ctx.fill();
    ctx.strokeStyle = mix('#cfe0ff', '#30303c', dead); ctx.lineWidth = 6; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(n.x, ys[g], Math.max(1, r - 3), 0, 7); ctx.clip();
    drawPerson(ctx, n.x, ys[g] - r * 0.25, r / 62, { body: mix('#e8eeff', '#4a4a58', dead) }); ctx.restore();
  });
  ctx.font = '700 44px Oswald'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.globalAlpha = sm(0.2, 0.6, lt);
  ctx.fillText('1765', 540, ys[0] - 100); ctx.globalAlpha = 1;
  ctx.restore();
}

// Doctor office
function sDoctor(ctx, lt, t) {
  bg(ctx, '#21468f', '#060f30', 540, 800, 1400);
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 6, 540, 1100);
  // window blinds
  ctx.fillStyle = '#0b1640'; ctx.fillRect(650, 560, 330, 420); for (let y = 570; y < 980; y += 26) { ctx.fillStyle = 'rgba(180,210,255,0.35)'; ctx.fillRect(660, y, 310, 12); }
  // calendar
  ctx.fillStyle = '#f4efe2'; ctx.fillRect(130, 560, 210, 250); ctx.fillStyle = '#d01b2a'; ctx.fillRect(130, 560, 210, 60);
  ctx.font = '700 40px Oswald'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('ГОД', 235, 604);
  ctx.font = '700 108px Oswald'; ctx.fillStyle = '#1a1a2a'; const yr = Math.round(lerp(1979, 1986, eOut(lt / 1.2))); ctx.fillText(String(yr), 235, 735);
  // lightbox with scan
  ctx.fillStyle = '#0c1020'; rrect(ctx, 360, 600, 260, 300, 10); ctx.fill(); ctx.fillStyle = radial(ctx, 490, 750, 180, [[0, '#cfe6ff'], [1, '#6e9bd8']]); ctx.fillRect(375, 615, 230, 270);
  ctx.save(); ctx.translate(490, 750); ctx.scale(0.24, 0.24); ctx.translate(-540, -470); drawBrainShape(ctx, 0, { mono: true, thal: 0.9 }); ctx.restore();
  // shelf
  ctx.fillStyle = '#0a1230'; ctx.fillRect(100, 880, 230, 14); const r = rng(5); for (let x = 108; x < 320;) { const w = 18 + r() * 14, h = 70 + r() * 40; ctx.fillStyle = ['#7a2a3a', '#2a4a7a', '#c9a14a', '#3a6a4a'][Math.floor(r() * 4)]; ctx.fillRect(x, 880 - h, w, h); x += w + 3; }
  // doctor
  drawPerson(ctx, 760, 990, 2.4, { body: '#1a2240', coat: '#eef2ff', head: '#d29a82', hair: '#d9d9d9', glasses: true });
  // desk
  ctx.fillStyle = '#3a2418'; ctx.fillRect(-20, 1300, 1120, 70); ctx.fillStyle = '#26160e'; ctx.fillRect(-20, 1370, 1120, 600);
  // lamp
  ctx.fillStyle = '#111'; ctx.fillRect(150, 1160, 12, 140); ctx.beginPath(); ctx.moveTo(90, 1170); ctx.lineTo(220, 1170); ctx.lineTo(180, 1100); ctx.lineTo(130, 1100); ctx.fill();
  ctx.fillStyle = 'rgba(255,200,100,0.22)'; ctx.beginPath(); ctx.moveTo(95, 1170); ctx.lineTo(215, 1170); ctx.lineTo(520, 1310); ctx.lineTo(-40, 1310); ctx.fill();
  // paper with typing
  ctx.save(); ctx.translate(560, 1560); ctx.rotate(-0.04);
  ctx.fillStyle = '#f6f1e3'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.fillRect(-380, -230, 760, 470); ctx.shadowBlur = 0;
  const lines = ['THE NEW ENGLAND JOURNAL OF MEDICINE · 1986', '', 'FATAL FAMILIAL INSOMNIA', 'AND DYSAUTONOMIA', '', 'E. LUGARESI, R. MEDORI, P. MONTAGNA et al.'];
  const chars = Math.floor(Math.max(0, lt - 0.6) * 38); let used = 0;
  lines.forEach((l, i) => { const n = clamp(chars - used, 0, l.length); used += l.length; ctx.font = i === 2 || i === 3 ? '700 50px Oswald' : '400 26px "DejaVu Sans Mono"'; ctx.fillStyle = i === 2 || i === 3 ? '#8a1020' : '#222'; ctx.textAlign = 'left'; ctx.fillText(l.slice(0, n), -340, -160 + i * 64); });
  ctx.restore();
  ctx.restore();
}

// Brain (sagittal) shape: in 1080-wide coord box, brain centered ~(540,470)
const GYRI = (() => { const r = rng(77), a = []; for (let i = 0; i < 46; i++) { const x = 230 + r() * 620, y = 200 + r() * 420; const pts = [[x, y]]; let ang = r() * 6.28; for (let j = 0; j < 5; j++) { ang += (r() - 0.5) * 2.4; pts.push([pts[j][0] + Math.cos(ang) * 40, pts[j][1] + Math.sin(ang) * 40]); } a.push(pts); } return a; })();
const CORTEX = [[250, 470], [270, 320], [380, 200], [540, 160], [700, 190], [820, 300], [860, 450], [820, 570], [730, 610], [620, 600], [540, 640], [430, 640], [320, 590]];
function drawBrainShape(ctx, t, o = {}) {
  const base = o.mono ? '#e9eef8' : '#f2b9b0', line = o.mono ? 'rgba(40,60,100,0.55)' : 'rgba(150,40,60,0.55)';
  // cerebellum
  ctx.fillStyle = o.mono ? '#d8e2f2' : '#e89a90'; ell(ctx, 740, 640, 110, 70, 0.2); ctx.fill(); ctx.strokeStyle = line; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ell(ctx, 740, 640, 100 - i * 15, 60 - i * 9, 0.2); ctx.stroke(); }
  // stem
  ctx.fillStyle = o.mono ? '#cdd8ec' : '#e4a89a'; ctx.beginPath(); ctx.moveTo(560, 560); ctx.bezierCurveTo(600, 650, 600, 760, 620, 900); ctx.lineTo(690, 900); ctx.bezierCurveTo(670, 760, 670, 650, 650, 560); ctx.fill();
  ctx.beginPath(); spline(ctx, CORTEX); ctx.fillStyle = base; ctx.fill(); ctx.strokeStyle = line; ctx.lineWidth = 5; ctx.stroke();
  ctx.save(); ctx.beginPath(); spline(ctx, CORTEX); ctx.clip(); ctx.strokeStyle = line; ctx.lineWidth = 4;
  for (const g of GYRI) { ctx.beginPath(); spline(ctx, g, false); ctx.stroke(); }
  // corpus callosum
  ctx.strokeStyle = o.mono ? '#ffffff' : '#fbe7dc'; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(380, 470); ctx.bezierCurveTo(420, 350, 640, 340, 700, 450); ctx.stroke();
  ctx.strokeStyle = line; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  // thalamus
  const th = o.thal ?? 1;
  if (th > 0) { glow(ctx, 560, 500, 140, o.thalCol || 'rgba(255,60,40,0.9)', th * 0.8); ctx.fillStyle = o.thalFill || '#ff3a2a'; ell(ctx, 560, 500, 52, 36, -0.2); ctx.fill(); ctx.strokeStyle = 'rgba(80,0,0,0.6)'; ctx.lineWidth = 4; ctx.stroke(); }
}
const PROFILE = [[220, 300], [330, 170], [540, 110], [740, 170], [860, 330], [880, 520], [820, 700], [760, 820], [740, 1000], [760, 1200], [360, 1200], [360, 1060], [270, 1040], [220, 990], [230, 940], [200, 910], [215, 870], [185, 840], [130, 760], [175, 690], [190, 610], [175, 520], [195, 420]];
function sThalamus(ctx, lt, t) {
  bg(ctx, '#d01b2a', '#3a020a', 540, 800, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.12, 5.5, 560, 900);
  ctx.translate(20, 380);
  ctx.beginPath(); spline(ctx, PROFILE); ctx.fillStyle = '#e8907e'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 8; ctx.stroke();
  ctx.beginPath(); spline(ctx, PROFILE); ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(120,20,40,0.25)'; ctx.fillRect(0, 700, 1100, 600); ctx.restore();
  ctx.fillStyle = '#fbe0d6'; ctx.beginPath(); spline(ctx, CORTEX.map(([x, y]) => [lerp(540, x, 1.07), lerp(420, y, 1.08)])); ctx.fill();
  const th = 0.6 + 0.4 * Math.sin(t * 6);
  drawBrainShape(ctx, t, { thal: th });
  // signals
  const r = rng(12);
  for (let i = 0; i < 14; i++) { const tx = CORTEX[i % CORTEX.length]; const p = ((lt * 0.8 + r()) % 1); const cx = 560 + (tx[0] - 560) * 0.5, cy = 500 + (tx[1] - 500) * 0.5 - 40;
    const x = (1 - p) * (1 - p) * 560 + 2 * (1 - p) * p * cx + p * p * (lerp(560, tx[0], 0.85)), y = (1 - p) * (1 - p) * 500 + 2 * (1 - p) * p * cy + p * p * lerp(500, tx[1], 0.85);
    glow(ctx, x, y, 26, 'rgba(255,240,120,0.9)', sm(0, 0.1, p) * (1 - sm(0.8, 1, p)) * sm(0.3, 1, lt)); }
  for (let k = 0; k < 3; k++) { const p = ((lt * 0.7 + k / 3) % 1); ctx.strokeStyle = `rgba(255,220,120,${0.6 * (1 - p)})`; ctx.lineWidth = 5; ell(ctx, 560, 500, 50 + p * 260, 36 + p * 190, -0.2); ctx.stroke(); }
  // label
  const la = sm(0.5, 0.9, lt); ctx.globalAlpha = la; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(600, 480); ctx.lineTo(780, 380); ctx.lineTo(930, 380); ctx.stroke();
  ctx.fillStyle = '#000'; rrect(ctx, 770, 320, 230, 56, 6); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 40px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ТАЛАМУС', 885, 350); ctx.globalAlpha = 1;
  ctx.restore();
}

// Protein misfolding
function helixPts(n, cx, cy, len, amp, ph, bad) {
  const p = [];
  for (let i = 0; i < n; i++) { const u = i / (n - 1), x = cx - len / 2 + u * len; const a = u * Math.PI * 7 + ph; let y = cy + Math.sin(a) * amp, z = Math.cos(a);
    if (bad > 0) { const zz = ((i % 6) < 3 ? (i % 3) : 2 - (i % 3)) / 2; y = lerp(y, cy + (Math.floor(i / 6) % 2 ? 1 : -1) * 40 + (zz - 0.5) * 60, bad); z = lerp(z, (i % 2) - 0.5, bad); }
    p.push([x, y, z]); }
  return p;
}
function drawChain(ctx, pts, colA, colB, s = 1) {
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 8 * s; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  [...pts].sort((a, b) => a[2] - b[2]).forEach(([x, y, z]) => { const r = (16 + z * 6) * s; ctx.fillStyle = radial(ctx, x - r * 0.3, y - r * 0.3, r * 1.3, [[0, '#fff'], [0.25, colA], [1, colB]]); ell(ctx, x, y, r, r); ctx.fill(); });
}
function sProtein(ctx, lt, t) {
  bg(ctx, '#b0101e', '#2a0006', 540, 950, 1200);
  ctx.save(); camera(ctx, lt, 1.0, 1.1, 5.5, 540, 960, lt > 1.8 && lt < 2.4 ? 14 : 0, t);
  const bad = sm(1.8, 2.5, lt);
  if (lt > 1.75 && lt < 2.1) { ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - (lt - 1.75) / 0.35)})`; ctx.fillRect(0, 0, W, H); }
  // incoming copies
  const clump = sm(2.6, 4.6, lt);
  for (let k = 0; k < 5; k++) {
    if (k === 0) continue; const ang = k * 1.3 + 0.4; const sx = 540 + Math.cos(ang) * 900, sy = 960 + Math.sin(ang) * 900; const tx = 540, ty = 960 + (k - 2.5) * 70;
    const p = sm(2.4 + k * 0.25, 3.6 + k * 0.25, lt); if (p <= 0) continue;
    drawChain(ctx, helixPts(30, lerp(sx, tx, p), lerp(sy, ty, p), 620, 70, t * 2 + k, 1), '#8a2a9a', '#2a0a3a', 0.9);
  }
  drawChain(ctx, helixPts(30, 540, 960 - clump * 175, 620, 90, t * 2.2, bad), bad > 0.5 ? '#a03ab0' : '#ffd23a', bad > 0.5 ? '#3a0a4a' : '#c0501a', 1);
  if (lt > 4.2) { glow(ctx, 540, 960, 520, 'rgba(80,0,40,0.6)', sm(4.2, 5, lt)); }
  // virus / bacteria crossed
  const ia = sm(3.0, 3.4, lt);
  if (ia > 0) { ctx.globalAlpha = ia;
    const icon = (x, kind) => { ctx.save(); ctx.translate(x, 1520); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ell(ctx, 0, 0, 120, 120); ctx.fill();
      if (kind === 0) { ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = 8; for (let a = 0; a < 6.28; a += 0.7) { ctx.beginPath(); ctx.moveTo(Math.cos(a) * 50, Math.sin(a) * 50); ctx.lineTo(Math.cos(a) * 80, Math.sin(a) * 80); ctx.stroke(); ell(ctx, Math.cos(a) * 85, Math.sin(a) * 85, 10, 10); ctx.fillStyle = '#7dffb0'; ctx.fill(); } ell(ctx, 0, 0, 55, 55); ctx.fillStyle = '#3aa070'; ctx.fill(); }
      else { ctx.fillStyle = '#7dc8ff'; rrect(ctx, -90, -38, 180, 76, 38); ctx.fill(); ctx.strokeStyle = '#7dc8ff'; ctx.lineWidth = 5; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 30, 38); ctx.quadraticCurveTo(i * 30 + 15, 70, i * 30, 95); ctx.stroke(); } }
      const p = eOut((lt - 3.4 - x / 3000) / 0.3); ctx.strokeStyle = '#ff2b3a'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(-90, -90); ctx.lineTo(lerp(-90, 90, p), lerp(-90, 90, p)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(90, -90); ctx.lineTo(lerp(90, -90, p), lerp(-90, 90, p)); ctx.stroke(); ctx.restore(); };
    icon(330, 0); icon(750, 1); ctx.globalAlpha = 1; }
  ctx.font = '700 46px Oswald'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText(bad > 0.5 ? 'PrP — НЕПРАВИЛЬНАЯ ФОРМА' : 'БЕЛОК PrP', 540, 1240 + clump * 60);
  ctx.restore();
}

// Neurons dying
const NEUR = (() => { const r = rng(31), ns = []; const pos = [[200, 700], [520, 620], [860, 720], [330, 1000], [700, 980], [150, 1290], [500, 1300], [880, 1260], [340, 1560], [740, 1560]];
  for (const [x, y] of pos) { const segs = []; const grow = (x, y, a, l, d) => { if (d > 3) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; segs.push([x, y, x2, y2, d]); grow(x2, y2, a + (r() - 0.5) * 1.2 - 0.3, l * 0.7, d + 1); grow(x2, y2, a + (r() - 0.5) * 1.2 + 0.3, l * 0.7, d + 1); };
    for (let k = 0; k < 6; k++) grow(x, y, k / 6 * 6.28 + r(), 70 + r() * 40, 0); ns.push({ x, y, segs }); }
  return ns; })();
const NLINKS = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4], [3, 5], [3, 6], [4, 6], [4, 7], [5, 8], [6, 8], [6, 9], [7, 9]];
function sNeurons(ctx, lt, t) {
  bg(ctx, '#6a0820', '#14000a', 540, 1100, 1300);
  ctx.save(); camera(ctx, lt, 1.05, 1.0, 5.5, 540, 1100);
  const deathT = i => 1.0 + i * 0.32, dd = i => sm(deathT(i), deathT(i) + 0.6, lt);
  for (const [a, b] of NLINKS) { const A = NEUR[a], B = NEUR[b], d = Math.max(dd(a), dd(b)); ctx.strokeStyle = mix('#ff9ab0', '#3a1a24', d); ctx.globalAlpha = 0.8 - d * 0.4; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.quadraticCurveTo((A.x + B.x) / 2 + 60, (A.y + B.y) / 2 - 40, B.x, B.y); ctx.stroke(); ctx.globalAlpha = 1;
    if (d < 0.5) { const p = (lt * 0.9 + a * 0.13) % 1; const mx = (A.x + B.x) / 2 + 60, my = (A.y + B.y) / 2 - 40; const x = (1 - p) * (1 - p) * A.x + 2 * (1 - p) * p * mx + p * p * B.x, y = (1 - p) * (1 - p) * A.y + 2 * (1 - p) * p * my + p * p * B.y; glow(ctx, x, y, 30, 'rgba(255,240,200,1)', 1 - d * 2); } }
  NEUR.forEach((n, i) => { const d = dd(i), shr = 1 - d * 0.45;
    ctx.strokeStyle = mix('#ffc0cc', '#40303a', d);
    for (const [x1, y1, x2, y2, dep] of n.segs) { if (dep > 3 - d * 2.5) continue; ctx.lineWidth = (6 - dep * 1.3) * shr; ctx.beginPath(); ctx.moveTo(n.x + (x1 - n.x) * shr, n.y + (y1 - n.y) * shr); ctx.lineTo(n.x + (x2 - n.x) * shr, n.y + (y2 - n.y) * shr); ctx.stroke(); }
    if (d < 1) glow(ctx, n.x, n.y, 110, 'rgba(255,120,150,0.9)', (1 - d) * (0.7 + 0.3 * Math.sin(t * 5 + i)));
    ctx.fillStyle = mix('#ffd0d8', '#2a2028', d); ell(ctx, n.x, n.y, 34 * shr, 30 * shr); ctx.fill(); ctx.fillStyle = mix('#c03050', '#1a1018', d); ell(ctx, n.x, n.y, 13, 12); ctx.fill();
    // clumps
    const c = sm(deathT(i) - 0.5, deathT(i), lt); if (c > 0) { const r = rng(i + 50); for (let k = 0; k < 7; k++) { const a = r() * 6.28, rr = 40 + r() * 30; ctx.fillStyle = `rgba(110,20,120,${c})`; ell(ctx, n.x + Math.cos(a) * rr, n.y + Math.sin(a) * rr, 12 * c, 9 * c); ctx.fill(); } }
    if (d > 0 && d < 1) { ctx.strokeStyle = `rgba(255,60,60,${1 - d})`; ctx.lineWidth = 6; ell(ctx, n.x, n.y, 40 + d * 80, 40 + d * 80); ctx.stroke(); }
  });
  ctx.restore();
}

// EEG flatline
function sEEG(ctx, lt, t) {
  bg(ctx, '#7a0a18', '#160004', 540, 1000, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.07, 5.5, 540, 1050, lt > 4.2 && lt < 4.6 ? 10 : 0, t);
  const x0 = 70, y0 = 640, w = 940, h = 820;
  ctx.fillStyle = '#1b1b22'; rrect(ctx, x0 - 30, y0 - 30, w + 60, h + 140, 40); ctx.fill();
  ctx.fillStyle = '#04120a'; rrect(ctx, x0, y0, w, h, 20); ctx.fill();
  ctx.save(); rrect(ctx, x0, y0, w, h, 20); ctx.clip();
  ctx.strokeStyle = 'rgba(80,255,140,0.10)'; ctx.lineWidth = 2; for (let x = x0; x < x0 + w; x += 47) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + h); ctx.stroke(); } for (let y = y0; y < y0 + h; y += 47) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke(); }
  const flatT = 2.4, cols = ['#5dff9a', '#5dff9a', '#ffd23a'];
  ['ЭЭГ', 'СОН', 'ПУЛЬС'].forEach((lab, k) => {
    const cy = y0 + 170 + k * 250; const ampF = k === 2 ? 1 : 1 - sm(1.6, flatT, lt);
    const flat = k < 2 && lt > flatT; ctx.strokeStyle = flat ? '#ff3344' : cols[k]; ctx.lineWidth = 6; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 16; ctx.beginPath();
    for (let x = x0; x <= x0 + w; x += 4) { const ts = t * 1.0 - (x0 + w - x) / 520; let y;
      if (k === 0) y = Math.sin(ts * 9) * 50 + Math.sin(ts * 23) * 22 + Math.sin(ts * 51) * 10;
      else if (k === 1) y = Math.sin(ts * 3.2) * 90 + Math.sin(ts * 31) * 15 * (Math.sin(ts * 1.3) > 0.6 ? 1 : 0);
      else { const bp = (ts * bpmAt(t) / 60) % 1; y = bp < 0.05 ? -Math.sin(bp / 0.05 * Math.PI) * 120 : bp < 0.1 ? Math.sin((bp - 0.05) / 0.05 * Math.PI) * 40 : 0; }
      if (k < 2) y *= clamp(1 - sm(1.0, flatT, lt - (x0 + w - x) / 520));
      if (x === x0) ctx.moveTo(x, cy - y); else ctx.lineTo(x, cy - y); }
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.font = '700 40px Oswald'; ctx.fillStyle = 'rgba(160,255,190,0.85)'; ctx.textAlign = 'left'; ctx.fillText(lab, x0 + 24, cy - 100);
  });
  const pct = Math.round(100 * (1 - sm(1.0, flatT + 1.8, lt))); ctx.font = '700 60px Oswald'; ctx.textAlign = 'right'; ctx.fillStyle = pct === 0 ? '#ff3344' : '#5dff9a'; ctx.fillText(`СОН ${pct}%`, x0 + w - 24, y0 + 70);
  if (lt > flatT && Math.floor(t * 3) % 2) { ctx.fillStyle = 'rgba(255,40,60,0.15)'; ctx.fillRect(x0, y0, w, h); }
  ctx.restore();
  ctx.restore();
}

// Night: counter
function sCounter(ctx, lt, t) {
  bg(ctx, '#132063', '#02041a', 540, 1000, 1400);
  // warm window behind
  ctx.save(); camera(ctx, lt, 1.0, 1.08, 5.5, 540, 1200, 3, t);
  ctx.fillStyle = '#ffb347'; ctx.fillRect(640, 820, 340, 440); glow(ctx, 810, 1040, 420, 'rgba(255,170,60,0.5)');
  ctx.strokeStyle = '#090c2a'; ctx.lineWidth = 18; ctx.strokeRect(640, 820, 340, 440); ctx.beginPath(); ctx.moveTo(810, 820); ctx.lineTo(810, 1260); ctx.stroke();
  ctx.translate(500, 1340); ctx.scale(0.95, 0.95);
  drawHero(ctx, { t, open: 1.08, pupil: 8, jitter: 4, red: 1, bags: 1, mouth: 'flat', brow: 0.9, sweat: 0.6, shirt: '#24306e' });
  ctx.restore();
  // counter
  const hrs = Math.floor(lt * 24 * 1.7 + 30), d = Math.floor(hrs / 24), h = hrs % 24, m = Math.floor((lt * 1000) % 60);
  ctx.save(); ctx.translate(540, 680); ctx.fillStyle = 'rgba(0,0,0,0.7)'; rrect(ctx, -330, -90, 660, 180, 24); ctx.fill(); ctx.strokeStyle = '#ff2b3a'; ctx.lineWidth = 5; ctx.stroke();
  ctx.font = '700 34px Oswald'; ctx.fillStyle = '#ff8a94'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('БЕЗ СНА', 0, -52);
  ctx.font = '700 92px "DejaVu Sans Mono"'; ctx.fillStyle = '#ff2b3a'; ctx.shadowColor = '#ff2b3a'; ctx.shadowBlur = 24;
  ctx.fillText(`${String(d).padStart(2, '0')}д ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, 0, 22); ctx.restore();
}

// Hallucination room
let ROOMBUF = null;
function drawRoom(c, t, lt) {
  c.fillStyle = linear(c, 0, 0, 0, H, [[0, '#0e1650'], [1, '#05071c']]); c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(120,140,255,0.12)'; c.lineWidth = 3; for (let x = 0; x < W; x += 80) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 1350); c.stroke(); }
  c.fillStyle = '#ffa63c'; c.fillRect(110, 560, 380, 470); glow(c, 300, 800, 480, 'rgba(255,160,60,0.45)');
  c.strokeStyle = '#05061a'; c.lineWidth = 20; c.strokeRect(110, 560, 380, 470); c.beginPath(); c.moveTo(300, 560); c.lineTo(300, 1030); c.moveTo(110, 795); c.lineTo(490, 795); c.stroke();
  // door
  c.fillStyle = '#0a0d30'; c.fillRect(640, 520, 330, 820); c.fillStyle = '#000'; c.fillRect(660, 540, 120 + 40 * Math.sin(lt), 800);
  // shadow figure in doorway
  const fa = sm(1.5, 3, lt); if (fa > 0) { c.globalAlpha = fa; c.fillStyle = '#000'; c.beginPath(); c.ellipse(720, 760, 48, 60, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(640, 1340); c.bezierCurveTo(640, 900, 680, 830, 720, 830); c.bezierCurveTo(770, 830, 800, 900, 800, 1340); c.fill();
    c.fillStyle = '#ff2030'; c.shadowColor = '#ff2030'; c.shadowBlur = 25; c.beginPath(); c.ellipse(703, 755, 9, 5, 0, 0, 7); c.ellipse(737, 755, 9, 5, 0, 0, 7); c.fill(); c.shadowBlur = 0; c.globalAlpha = 1; }
  // eyes on wall
  const r = rng(91); for (let i = 0; i < 9; i++) { const x = 80 + r() * 920, y = 180 + r() * 1100, ap = sm(0.8 + i * 0.35, 1.2 + i * 0.35, lt) * (0.5 + 0.5 * Math.sin(t * 3 + i)); if (x > 100 && x < 500 && y > 540 && y < 1050) continue; if (ap <= 0.02) continue;
    c.fillStyle = `rgba(255,255,220,${ap * 0.9})`; c.beginPath(); c.ellipse(x, y, 34, 16 * ap, 0, 0, 7); c.fill(); c.fillStyle = `rgba(0,0,0,${ap})`; c.beginPath(); c.arc(x + Math.sin(t * 2 + i) * 10, y, 9, 0, 7); c.fill(); }
  // floor
  c.fillStyle = '#100a24'; c.fillRect(0, 1340, W, 600); c.strokeStyle = 'rgba(255,170,80,0.15)'; c.lineWidth = 3; for (let i = -10; i < 20; i++) { c.beginPath(); c.moveTo(540, 1340); c.lineTo(540 + i * 140, 1920); c.stroke(); }
  // lamp + chair silhouette
  c.fillStyle = '#000'; c.fillRect(150, 1150, 14, 260); c.beginPath(); c.moveTo(90, 1160); c.lineTo(225, 1160); c.lineTo(190, 1060); c.lineTo(125, 1060); c.fill();
  c.fillRect(380, 1250, 20, 330); c.fillRect(380, 1420, 220, 22); c.fillRect(580, 1420, 20, 160);
  c.beginPath(); c.ellipse(450, 1255, 60, 70, 0.2, 0, 7); c.fill();
}
function sHalluc(ctx, lt, t) {
  if (!ROOMBUF) ROOMBUF = mk();
  const c = ROOMBUF.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); drawRoom(c, t, lt);
  const amp = 8 + sm(0, 4.5, lt) * 55;
  ctx.fillStyle = '#05071c'; ctx.fillRect(0, 0, W, H);
  ctx.save(); camera(ctx, lt, 1.08, 1.18, 5.5, 540, 960, 5, t);
  for (let y = 0; y < H; y += 6) { const dx = Math.sin(y * 0.007 + t * 2.4) * amp + Math.sin(y * 0.023 - t * 3.7) * amp * 0.35; ctx.drawImage(ROOMBUF, 0, y, W, 6, dx, y, W, 6); }
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35 * sm(1, 4, lt);
  ctx.drawImage(ROOMBUF, 14 + Math.sin(t * 5) * 10, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
  if (hash(Math.floor(t * 15)) > 0.85) { const y = hash(t * 100) * H; ctx.drawImage(ctx.canvas, 0, y, W, 60, 40, y, W, 60); }
}

// Age plate
function sAge(ctx, lt, t) {
  bg(ctx, '#1a2a7a', '#03051c', 540, 900, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 5.5, 540, 1000);
  const p1 = sm(0.3, 1.6, lt), p2 = sm(1.8, 2.8, lt);
  const a = Math.round(lerp(0, 40, eOut(p1))), b = Math.round(lerp(40, 60, eOut(p2)));
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; rrect(ctx, 140, 700, 800, 420, 40); ctx.fill(); ctx.strokeStyle = '#ffa63c'; ctx.lineWidth = 6; ctx.stroke();
  ctx.font = '700 46px Oswald'; ctx.fillStyle = '#ffa63c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ВОЗРАСТ НАЧАЛА', 540, 770);
  ctx.font = '700 230px Oswald'; ctx.fillStyle = '#fff'; ctx.fillText(p2 > 0 ? `${a}–${b}` : String(a), 540, 950);
  // scale
  const sx = 120, ex = 960, y = 1340; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(ex, y); ctx.stroke();
  ctx.font = '700 34px Oswald'; for (let v = 0; v <= 90; v += 10) { const x = lerp(sx, ex, v / 90); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x - 2, y - 18, 4, 36); ctx.fillText(String(v), x, y + 50); }
  const hx0 = lerp(sx, ex, 40 / 90), hx1 = lerp(sx, ex, lerp(40, 60, eOut(p2)) / 90);
  if (p1 >= 1) { ctx.fillStyle = '#ff3344'; ctx.shadowColor = '#ff3344'; ctx.shadowBlur = 30; rrect(ctx, hx0, y - 20, Math.max(8, hx1 - hx0), 40, 20); ctx.fill(); ctx.shadowBlur = 0; }
  const mx = lerp(sx, hx0, eOut(p1)); drawPerson(ctx, mx, y - 200, 1.1, { body: '#fff' });
  ctx.restore();
}

// Hourglass
function sHourglass(ctx, lt, t) {
  bg(ctx, '#16206a', '#02031a', 540, 1000, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.08, 5.5, 540, 1050);
  const cx = 540, cy = 1060, hw = 230, hh = 360, p = clamp(lt / 5.2);
  // month ring
  for (let i = 0; i < 18; i++) { const a = -Math.PI / 2 + i / 18 * Math.PI * 2, on = p * 18 > i; const x = cx + Math.cos(a) * 470, y = cy + Math.sin(a) * 470;
    ctx.fillStyle = on ? '#ff3344' : 'rgba(255,255,255,0.15)'; if (on) { ctx.shadowColor = '#ff3344'; ctx.shadowBlur = 20; } ell(ctx, x, y, 22, 22); ctx.fill(); ctx.shadowBlur = 0; }
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(t * 0.8) * 0.03);
  ctx.fillStyle = '#5a3a20'; rrect(ctx, -hw - 40, -hh - 50, 2 * hw + 80, 50, 12); ctx.fill(); rrect(ctx, -hw - 40, hh, 2 * hw + 80, 50, 12); ctx.fill();
  const glass = () => { ctx.beginPath(); ctx.moveTo(-hw, -hh); ctx.lineTo(hw, -hh); ctx.bezierCurveTo(hw, -120, 20, -40, 20, 0); ctx.bezierCurveTo(20, 40, hw, 120, hw, hh); ctx.lineTo(-hw, hh); ctx.bezierCurveTo(-hw, 120, -20, 40, -20, 0); ctx.bezierCurveTo(-20, -40, -hw, -120, -hw, -hh); ctx.closePath(); };
  glass(); ctx.fillStyle = 'rgba(180,210,255,0.12)'; ctx.fill();
  ctx.save(); glass(); ctx.clip(); ctx.fillStyle = '#ffc04a';
  const topY = lerp(-hh + 40, -10, p); ctx.fillRect(-hw, topY, 2 * hw, -topY);
  const botH = lerp(0, hh - 40, p); ctx.beginPath(); ctx.moveTo(-hw, hh); ctx.lineTo(-hw, hh - botH * 0.7); ctx.quadraticCurveTo(0, hh - botH * 1.4, hw, hh - botH * 0.7); ctx.lineTo(hw, hh); ctx.fill();
  if (p < 1) { ctx.fillRect(-4, -5, 8, hh); }
  ctx.restore();
  glass(); ctx.strokeStyle = 'rgba(220,235,255,0.8)'; ctx.lineWidth = 6; ctx.stroke();
  ctx.restore();
  const mo = Math.min(18, Math.floor(p * 18) + 1);
  ctx.font = '700 64px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 10; ctx.strokeStyle = '#000'; ctx.strokeText(`МЕСЯЦ ${mo}`, cx, 1640); ctx.fillStyle = '#ffc04a'; ctx.fillText(`МЕСЯЦ ${mo}`, cx, 1640);
  ctx.restore();
}

// World map
const CASES = [[12.3, 45.4], [11.3, 44.5], [9.2, 45.5], [10, 51], [13.4, 52.5], [2.3, 48.8], [4.8, 45.7], [-2.5, 43.2], [-3.7, 40.4], [-1.5, 52.5], [16.4, 48.2], [8.5, 47.4], [4.9, 52.4], [-77, 39], [-87.6, 41.9], [-118, 34], [-74, 40.7], [145, -37.8], [151, -33.9], [139.7, 35.7], [135.5, 34.7], [114, 30.5], [121.5, 31.2], [126.9, 37.5], [-46.6, -23.5], [-99, 19.4], [34.8, 32], [18, 59.3], [-79.4, 43.7], [-123, 49.3]];
function sMap(ctx, lt, t) {
  bg(ctx, '#0f6a3a', '#011a0c', 540, 1000, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.08, 5, 540, 1000);
  const mx = -330, my = 760, mw = 1740, mh = 670, sh = -lt * 40;
  ctx.fillStyle = 'rgba(160,255,190,0.28)';
  for (const [u, v] of window.DOTS) { ctx.fillRect(mx + sh + u * mw - 4, my + v * mh - 4, 8, 8); }
  CASES.forEach(([lon, lat], i) => { const x = mx + sh + (lon + 180) / 360 * mw, y = my + (80 - lat) / 138 * mh; const ap = sm(0.3 + i * 0.1, 0.6 + i * 0.1, lt); if (ap <= 0) return;
    const pu = (t * 1.3 + i * 0.37) % 1; ctx.strokeStyle = `rgba(80,255,140,${(1 - pu) * ap})`; ctx.lineWidth = 3; ell(ctx, x, y, 10 + pu * 40, 10 + pu * 40); ctx.stroke();
    glow(ctx, x, y, 36, 'rgba(120,255,160,1)', ap); ctx.fillStyle = '#eaffee'; ell(ctx, x, y, 7 * ap, 7 * ap); ctx.fill(); });
  // counters
  const n = Math.round(200 * eOut(sm(0.4, 3.5, lt))), f = Math.round(70 * eOut(sm(0.6, 3.5, lt)));
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '700 200px Oswald'; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(`≈${n}`, 540, 1590); ctx.fillStyle = '#3dff7a'; ctx.fillText(`≈${n}`, 540, 1590);
  ctx.font = '700 54px Oswald'; ctx.lineWidth = 9; ctx.strokeText(`ЧЕЛОВЕК · ${f} СЕМЕЙ`, 540, 1730); ctx.fillStyle = '#fff'; ctx.fillText(`ЧЕЛОВЕК · ${f} СЕМЕЙ`, 540, 1730);
  ctx.restore();
}

// Lab
function flask(ctx, x, y, s, col, t, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const path = () => { ctx.beginPath(); ctx.moveTo(-25, -160); ctx.lineTo(-25, -60); ctx.lineTo(-100, 70); ctx.quadraticCurveTo(-110, 100, -80, 100); ctx.lineTo(80, 100); ctx.quadraticCurveTo(110, 100, 100, 70); ctx.lineTo(25, -60); ctx.lineTo(25, -160); ctx.closePath(); };
  path(); ctx.fillStyle = 'rgba(200,255,220,0.12)'; ctx.fill(); ctx.save(); path(); ctx.clip(); ctx.fillStyle = col; ctx.fillRect(-120, 0 + Math.sin(t * 3 + k) * 4, 240, 120);
  for (let i = 0; i < 6; i++) { const p = (t * 0.6 + i / 6 + k) % 1; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ell(ctx, Math.sin(i * 3 + k) * 50, 90 - p * 110, 6, 6); ctx.fill(); }
  ctx.restore(); path(); ctx.strokeStyle = 'rgba(220,255,230,0.85)'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
}
function sLab(ctx, lt, t) {
  bg(ctx, '#11804a', '#012010', 540, 900, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.07, 4.5, 540, 1100);
  // shelves
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(60, 760, 960, 14); ctx.fillRect(60, 1010, 960, 14);
  const r = rng(14); for (let i = 0; i < 10; i++) { const x = 90 + i * 92; ctx.fillStyle = `rgba(${150 + r() * 100},${200 + r() * 55},200,0.6)`; rrect(ctx, x, 760 - 60 - r() * 60, 50, 120, 6); ctx.fill(); }
  // bench
  ctx.fillStyle = '#0a2a18'; ctx.fillRect(-20, 1420, 1120, 520); ctx.fillStyle = '#1d4a30'; ctx.fillRect(-20, 1400, 1120, 30);
  flask(ctx, 200, 1300, 1.0, 'rgba(60,255,140,0.7)', t, 0); flask(ctx, 880, 1310, 0.9, 'rgba(120,200,255,0.7)', t, 1.3);
  // microscope
  ctx.fillStyle = '#0a1a10'; ctx.fillRect(330, 1360, 140, 40); ctx.fillRect(390, 1150, 30, 220); ctx.save(); ctx.translate(400, 1150); ctx.rotate(-0.4); ctx.fillRect(-20, -140, 40, 160); ctx.restore();
  // pill bottle with X
  ctx.save(); ctx.translate(640, 1200); const sc = eBack(sm(0.2, 0.7, lt)); ctx.scale(sc, sc);
  ctx.fillStyle = '#ff9a3a'; rrect(ctx, -90, -120, 180, 240, 20); ctx.fill(); ctx.fillStyle = '#fff'; rrect(ctx, -105, -170, 210, 60, 12); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(-80, -60, 160, 110);
  ctx.fillStyle = '#222'; ctx.font = '700 34px Oswald'; ctx.textAlign = 'center'; ctx.fillText('ЛЕКАРСТВО', 0, 8);
  const xp = eOut(sm(0.9, 1.3, lt)); ctx.strokeStyle = '#ff2b3a'; ctx.lineWidth = 34; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-170, -200); ctx.lineTo(lerp(-170, 170, xp), lerp(-200, 200, xp)); ctx.stroke(); const xp2 = eOut(sm(1.2, 1.6, lt)); if (xp2 > 0) { ctx.beginPath(); ctx.moveTo(170, -200); ctx.lineTo(lerp(170, -170, xp2), lerp(-200, 200, xp2)); ctx.stroke(); }
  ctx.restore();
  // symptom pills
  const pa = sm(2.2, 2.8, lt); if (pa > 0) { ctx.globalAlpha = pa; ['СОН', 'ТРЕВОГА', 'БОЛЬ'].forEach((s, i) => { const x = 230 + i * 310, y = 1640; ctx.fillStyle = 'rgba(0,0,0,0.5)'; rrect(ctx, x - 130, y - 45, 260, 90, 45); ctx.fill(); ctx.strokeStyle = '#3dff7a'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = '700 44px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y + 2); }); ctx.globalAlpha = 1; }
  ctx.restore();
}

// Scientists
function sScientists(ctx, lt, t) {
  bg(ctx, '#18a058', '#012012', 540, 800, 1400);
  ctx.save(); camera(ctx, lt, 1.0, 1.08, 5.5, 540, 1100);
  // dawn window
  ctx.fillStyle = linear(ctx, 0, 520, 0, 1000, [[0, '#ffd59a'], [1, '#ff8a5a']]); ctx.fillRect(120, 560, 840, 470);
  glow(ctx, 540, 1020, 300, 'rgba(255,240,180,0.9)', 0.6 + sm(0, 5, lt) * 0.4); ctx.fillStyle = '#fff4c8'; ctx.beginPath(); ctx.arc(540, 1030, 110 + lt * 6, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = '#06301a'; ctx.lineWidth = 18; ctx.strokeRect(120, 560, 840, 470); ctx.beginPath(); ctx.moveTo(540, 560); ctx.lineTo(540, 1030); ctx.stroke();
  // screen with helix
  ctx.fillStyle = '#041a0e'; rrect(ctx, 600, 1080, 380, 260, 16); ctx.fill(); ctx.strokeStyle = '#3dff7a'; ctx.lineWidth = 4; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.rect(610, 1090, 360, 240); ctx.clip();
  for (let x = 620; x < 970; x += 14) { const a = (x - 620) * 0.04 + t * 2; const y1 = 1210 + Math.sin(a) * 70, y2 = 1210 - Math.sin(a) * 70; ctx.strokeStyle = 'rgba(120,255,170,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke(); ctx.fillStyle = '#3dff7a'; ell(ctx, x, y1, 6, 6); ctx.fill(); ctx.fillStyle = '#ffd23a'; ell(ctx, x, y2, 6, 6); ctx.fill(); }
  ctx.restore();
  // floor
  ctx.fillStyle = '#05301a'; ctx.fillRect(-20, 1500, 1120, 450);
  // two scientists
  drawPerson(ctx, 300, 1180, 2.5, { body: '#0d2a1c', coat: '#f2fff6', head: '#e0a88c', hair: '#3a2416', longHair: true, glasses: false });
  drawPerson(ctx, 520, 1160, 2.65, { body: '#0d2a1c', coat: '#f2fff6', head: '#c98f74', hair: '#1a1210', glasses: true });
  // heart between
  const hp = sm(2.4, 3, lt); if (hp > 0) { drawHeart(ctx, 410, 1010 - lt * 10, 2.5 * eBack(hp) * (1 + beatPulse(t) * 0.12), '#ff4a5a'); }
  ctx.restore();
  // foundation plate
  const fa = sm(2.4, 2.8, lt); if (fa > 0) { ctx.save(); ctx.globalAlpha = fa; ctx.fillStyle = 'rgba(0,0,0,0.6)'; rrect(ctx, 250, 1660, 580, 110, 55); ctx.fill(); ctx.strokeStyle = '#3dff7a'; ctx.lineWidth = 4; ctx.stroke(); ctx.font = '700 58px Oswald'; ctx.fillStyle = '#3dff7a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PRION ALLIANCE', 540, 1716); ctx.restore(); }
}

// Peaceful sleep
function sSleep(ctx, lt, t) {
  bg(ctx, '#2a8a5a', '#03180c', 540, 1000, 1400);
  glow(ctx, 540, 1000, 800, 'rgba(255,220,150,0.35)');
  ctx.save(); camera(ctx, lt, 1.08, 1.0, 5, 540, 1100);
  ctx.fillStyle = '#e8f4ec'; ell(ctx, 540, 1240, 520, 260); ctx.fill(); ctx.fillStyle = 'rgba(40,80,60,0.2)'; ell(ctx, 540, 1290, 470, 200); ctx.fill();
  ctx.save(); ctx.translate(540, 1180 + Math.sin(t * 1.4) * 4); ctx.rotate(-0.12); ctx.scale(0.88, 0.88);
  drawHero(ctx, { t, open: 0, mouth: 'sleep', brow: 0.1, bags: 0.1, red: 0, shirt: '#2f6a8a', skin: '#e0a88e' });
  ctx.restore();
  ctx.fillStyle = linear(ctx, 0, 1500, 0, 1920, [[0, '#5ab088'], [1, '#2a6a4a']]); ctx.beginPath(); ctx.moveTo(-40, 1560); ctx.quadraticCurveTo(540, 1470, 1120, 1560); ctx.lineTo(1120, 1960); ctx.lineTo(-40, 1960); ctx.fill();
  ctx.restore();
  // Zzz
  for (let i = 0; i < 3; i++) { const p = ((lt * 0.35 + i / 3) % 1); ctx.globalAlpha = Math.sin(p * Math.PI); ctx.font = `700 ${60 + i * 26}px Oswald`; ctx.fillStyle = '#eaffef'; ctx.textAlign = 'center'; ctx.fillText('Z', 800 + p * 80 + i * 20, 900 - p * 260); }
  ctx.globalAlpha = 1;
  const sa = sm(1.8, 2.3, lt); if (sa > 0) { ctx.save(); ctx.globalAlpha = sa; ctx.fillStyle = 'rgba(0,0,0,0.6)'; rrect(ctx, 210, 1700, 660, 80, 40); ctx.fill(); ctx.font = '400 36px Oswald'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Источник: StatPearls (NIH), 2024', 540, 1741); ctx.restore(); }
}

const SCENES = [
  [0, 3, sHook], [3, 8, sWindow],
  [8, 14, sVenice], [14, 20, sTree], [20, 26, sDoctor],
  [26, 31.5, sThalamus], [31.5, 37, sProtein], [37, 42.5, sNeurons], [42.5, 48, sEEG],
  [48, 53.5, sCounter], [53.5, 59, sHalluc], [59, 64.5, sAge], [64.5, 70, sHourglass],
  [70, 75, sMap], [75, 79.5, sLab], [79.5, 85, sScientists], [85, 90, sSleep],
];
const CAPS = [
  { t0: 0.15, t1: 2.95, y: 1560, size: 112, text: 'Что такое\n*бессонница?*', accent: RED, stagger: 0.12 },
  { t0: 3.25, t1: 5.6, y: 1010, text: 'Это когда сон\n*не приходит*', accent: RED },
  { t0: 5.7, t1: 7.95, y: 1010, text: 'Но есть форма,\nот которой *не лечат*', accent: RED },
  { t0: 8.3, t1: 13.95, y: 420, text: '*Венеция, 1765.*\nПервый известный случай', accent: YEL },
  { t0: 14.3, t1: 19.95, y: 420, text: 'Болезнь передаётся\n*в семье*', accent: RED },
  { t0: 20.3, t1: 25.95, y: 420, size: 76, text: '*1986 год.* Её описывает\nЭлио Лугарези с коллегами', accent: YEL },
  { t0: 26.3, t1: 31.45, y: 1560, size: 78, text: '*Таламус* координирует работу мозга,\nв том числе *сон*', accent: YEL },
  { t0: 31.8, t1: 36.95, y: 420, text: '*Белок сломался.*\nЭто не вирус и не бактерия', accent: YEL, size: 80 },
  { t0: 37.3, t1: 42.45, y: 400, text: 'Больные белки\n*разрушают нейроны*', accent: YEL },
  { t0: 42.8, t1: 47.95, y: 440, text: 'Таламус разрушен,\nи *сон исчезает*', accent: YEL },
  { t0: 48.3, t1: 53.45, y: 410, size: 78, text: 'Сначала *бессонница*,\nпотом паника, паранойя и страхи', accent: RED, stagger: 0.18 },
  { t0: 53.8, t1: 58.95, y: 420, size: 96, text: 'Дальше\n*галлюцинации*', accent: RED, glitch: true },
  { t0: 59.3, t1: 64.45, y: 420, text: 'Обычно болезнь начинается\nв *40–60 лет*', accent: RED },
  { t0: 64.8, t1: 69.95, y: 410, size: 76, text: 'В среднем жизнь после первых симптомов:\n*18 месяцев*', accent: RED },
  { t0: 70.3, t1: 74.95, y: 420, size: 74, text: 'К 2018 году диагноз поставили\nоколо *200 человек* из 70 семей', accent: GRN },
  { t0: 75.3, t1: 79.45, y: 420, text: '*Лекарства нет.*\nЛечат только симптомы', accent: RED },
  { t0: 79.8, t1: 82.1, y: 420, text: 'Но поиск\n*не остановился*', accent: GRN },
  { t0: 82.2, t1: 84.95, y: 420, size: 70, text: 'Фонд *Prion Alliance* основали супруги,\nу которых заболела мама', accent: GRN, stagger: 0.05 },
  { t0: 85.3, t1: 89.9, y: 420, text: 'Сон — это *не роскошь*.\nЭто работа мозга', accent: GRN },
];
// grade colours per chapter
function gradeCol(t) { if (t < 8) return ['#6a2a9a', 0.25]; if (t < 26) return ['#1a4fe0', 0.35]; if (t < 48) return ['#ff1a2a', 0.3]; if (t < 70) return ['#1a2a90', 0.35]; return ['#20d070', 0.3]; }
