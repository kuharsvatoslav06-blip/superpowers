// ===== Scene 5 — Океаны (4:15–5:30) =====
(() => {
  const ID = 's05';

  function drawShip(ctx, x, y, s, tilt = 0, col = '#c0392b') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
    ctx.fillStyle = col; poly(ctx, [[-260, -20], [250, -20], [215, 40], [-235, 40]]); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#2d3440'; ctx.fillRect(-260, -26, 510, 10);
    const cc = ['#2980b9', '#e67e22', '#27ae60', '#8e44ad', '#f1c40f', '#c0392b'];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) { ctx.fillStyle = cc[(r * 3 + c) % 6]; ctx.fillRect(-200 + c * 46, -60 - r * 34, 44, 32); ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5; ctx.strokeRect(-200 + c * 46, -60 - r * 34, 44, 32); }
    ctx.fillStyle = '#f2f2f2'; ctx.fillRect(170, -130, 70, 110); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(170, -130, 70, 110); ctx.fillStyle = '#2d3440'; ctx.fillRect(178, -120, 54, 16);
    ctx.restore();
  }
  // sea surface with a travelling swell: h(x) = base wave + big crest
  function seaSurface(ctx, t, x0, x1, base, crestX, crestH, o = {}) {
    const hgt = x => base - Math.sin(x / 90 + t * 2) * 10 - Math.sin(x / 37 + t * 3.3) * 4 - crestH * Math.exp(-(((x - crestX) / (o.width || 520)) ** 2)) * (x < crestX ? 1 : 0.85 + 0.15 * Math.exp(-(x - crestX) / 120));
    ctx.fillStyle = linear(ctx, 0, base - crestH, 0, H + 200, [[0, o.c0 || '#3c8fcf'], [1, o.c1 || '#0d3f73']]);
    ctx.beginPath(); ctx.moveTo(x0, H + 400); for (let x = x0; x <= x1; x += 8) ctx.lineTo(x, hgt(x)); ctx.lineTo(x1, H + 400); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 6; ctx.beginPath(); for (let x = x0; x <= x1; x += 8) { const y = hgt(x); x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
    // foam on the crest
    if (crestH > 40) particles(t, { rate: 60, life: 1, seed: 3 }, (r, q) => { const x = crestX - 200 + r() * 400 + q * 200, y = hgt(x) - q * 80 * r(); ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - q)})`; circ(ctx, x, y, 6 + r() * 14); ctx.fill(); });
    return hgt;
  }

  // A — oceans keep moving (orbit)
  function shotOrbit(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const R = 470, o = { rot: 2.75, lat0: 0.1, res: 2, night: 0.3, sun: [-0.4, -0.3, 0.86], cloudA: 0.5, t, tint: { c: [60, 140, 220], a: 0.0 } };
    drawGlobe(ctx, W / 2, 560, R, o);
    // flow arrows over ocean points
    for (let i = 0; i < 14; i++) { const lat = -45 + (i % 7) * 15, lon = 150 + Math.floor(i / 7) * 40 - 80 + ((lt * 12 + i * 7) % 40); const [x, y, z] = globePt(W / 2, 560, R, lat, lon, o); if (z < 0.1) continue; ctx.save(); ctx.globalAlpha = sm(0.5, 1.2, lt) * z; speedArrow(ctx, x - 40, y, 80, '', { col: '#9fe3ff', w: 6 }); ctx.restore(); }
    chapterCard(ctx, lt, d, 'ЧАСТЬ 3', 'ОКЕАНЫ');
    lowerThird(ctx, lt - 0.6, d - 0.6, '1,3 МЛРД КМ³ ВОДЫ', 'продолжают двигаться на восток');
  }

  // B — basin cross-section: water piles up against eastern shores
  function shotBasin(ctx, lt, d, t) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#0c1a36'], [1, '#1b2f57']]); ctx.fillRect(0, 0, W, H);
    const k = eIO(clamp((lt - 0.8) / 4)), slosh = Math.sin(lt * 1.6) * 0.15 * k;
    // basin
    ctx.fillStyle = '#6b4a2e'; ctx.beginPath(); ctx.moveTo(0, 420); ctx.lineTo(260, 440); ctx.quadraticCurveTo(400, 860, 960, 900); ctx.quadraticCurveTo(1520, 860, 1660, 440); ctx.lineTo(W, 420); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    ctx.fillStyle = '#4c8a3a'; ctx.fillRect(0, 405, 270, 20); ctx.fillRect(1650, 405, 270, 20);
    // water surface tilts toward the right (east)
    const yl = 470 + 220 * (k + slosh), yr = 470 - 260 * (k + slosh);
    ctx.save(); ctx.beginPath(); ctx.moveTo(240, 430); ctx.quadraticCurveTo(400, 860, 960, 890); ctx.quadraticCurveTo(1520, 860, 1680, 430); ctx.lineTo(1680, -200); ctx.lineTo(240, -200); ctx.closePath(); ctx.clip();
    ctx.fillStyle = 'rgba(40,130,210,0.9)'; ctx.beginPath(); ctx.moveTo(200, yl); for (let x = 200; x <= 1720; x += 10) ctx.lineTo(x, lerp(yl, yr, (x - 200) / 1520) + Math.sin(x / 60 + t * 4) * 6); ctx.lineTo(1720, H); ctx.lineTo(200, H); ctx.fill();
    ctx.restore();
    // overflow onto the east shore
    if (yr < 405) { ctx.fillStyle = 'rgba(40,130,210,0.85)'; const ov = Math.min(260, (405 - yr) * 2.2); ctx.beginPath(); ctx.moveTo(1660, 405); ctx.quadraticCurveTo(1660 + ov * 0.6, 405 - (405 - yr) * 0.5, 1660 + ov, 405); ctx.fill(); }
    speedArrow(ctx, 700, 300, 520, 'ВОДА: 1 670 км/ч →', { a: sm(0.4, 0.8, lt), size: 44, w: 14 });
    label(ctx, 'ЗАПАД', 130, 360, 40, { col: 'rgba(255,255,255,0.8)' }); label(ctx, 'ВОСТОК', 1790, 360, 40, { col: 'rgba(255,255,255,0.8)' });
    label(ctx, 'ВОДА НАКАТЫВАЕТ НА ВОСТОЧНЫЕ БЕРЕГА', W / 2, 110, 54, { col: YEL, alpha: sm(3, 3.5, lt) });
  }

  // C — open ocean: a giant swell lifts a cargo ship
  function shotSwell(ctx, lt, d, t) {
    const bob = Math.sin(t * 1.2) * 20;
    sky(ctx, ['#2f3e58', '#6a7a92', '#a9b4c2']);
    cloudLayer(ctx, t * 25, { seed: 33, n: 8, y0: 50, y1: 300, speed: 30, col: '#8e98a8', stretch: 2 });
    ctx.save(); ctx.translate(0, bob);
    const crestX = lerp(-600, 2100, lt / d), crestH = 380;
    const hgt = seaSurface(ctx, t, -100, W + 100, 700, crestX, crestH);
    const sx = 960, sy = hgt(sx), sl = (hgt(sx + 120) - hgt(sx - 120)) / 240;
    drawShip(ctx, sx, sy + 10, 1.3, Math.atan(sl) * 0.9);
    ctx.restore();
    windStreaks(ctx, t, { n: 30, a: 0.25, speed: 3000, col: '230,240,255' });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ОТКРЫТЫЙ ОКЕАН', 'гигантские волны');
  }

  // D — racing toward the coast with a water wall
  function shotWall(ctx, lt, d, t) {
    const k = lt / d;
    sky(ctx, ['#26324a', '#5d6a82', '#98a2b0']);
    // coast with lighthouse approaching
    const cx = lerp(1900, 1200, eIO(k)), cs = lerp(0.6, 1.1, eIO(k));
    ctx.save(); ctx.translate(cx, 660); ctx.scale(cs, cs);
    ctx.fillStyle = '#5a6a50'; ctx.beginPath(); ctx.moveTo(-200, 0); ctx.quadraticCurveTo(0, -140, 300, -180); ctx.lineTo(1400, -200); ctx.lineTo(1400, 300); ctx.lineTo(-200, 300); ctx.fill();
    ctx.fillStyle = '#f2f2f2'; poly(ctx, [[40, -110], [90, -110], [80, -330], [50, -330]]); ctx.fill(); ctx.fillStyle = '#c0392b'; ctx.fillRect(48, -260, 34, 28); ctx.fillRect(44, -180, 42, 28);
    ctx.fillStyle = '#2d3440'; ctx.fillRect(42, -370, 46, 40); glow(ctx, 65, -350, 90, 'rgba(255,240,170,0.9)', 0.6 + 0.4 * Math.sin(t * 4));
    for (let i = 0; i < 6; i++) drawBuilding(ctx, { x: 350 + i * 150, w: 120, h: 120 + hash(i) * 200, col: BLD_COLS[i], roof: 0, seed: i + 300 }, -180, { t });
    ctx.restore();
    // the water wall rises in front
    const wallH = lerp(100, 520, eIO(k));
    seaSurface(ctx, t, -100, W + 100, 900, lerp(300, 1000, k), wallH, { width: 700, c0: '#2f7fc0', c1: '#0b3462' });
    windStreaks(ctx, t, { n: 40, a: 0.3, speed: 3500, col: '230,240,255' });
    debris(ctx, t, { n: 20, vx: 900, vy: -40, size: 10, kinds: ['paper'], a: 0.5 });
    // spray
    particles(t, { rate: 40, life: 1.3, seed: 8 }, (r, q) => { const x = r() * W, y = 900 - wallH - q * 200 * r(); ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - q)})`; circ(ctx, x + q * 300, y, 8 + r() * 20); ctx.fill(); });
  }

  // E — port: containers swept, ships pushed onto the docks
  function shotPort(ctx, lt, d, t) {
    const cam = { x: lerp(900, 1050, lt / d), y: 540, z: 1.0, shake: 8 };
    sky(ctx, ['#3a4258', '#727b8c', '#a59c8a']);
    ctx.save(); applyCam(ctx, cam, t);
    const lvl = lerp(780, 640, eIO(clamp(lt / (d * 0.8))));
    // dock
    ctx.fillStyle = '#7e7a72'; ctx.fillRect(-500, 700, 3000, 500);
    // cranes
    for (const [x, i] of [[300, 0], [800, 1], [1500, 2]]) { const a = Math.sin(t * 2 + i) * 0.04 + 0.05 * clamp(lt / 3); ctx.save(); ctx.translate(x, 700); ctx.rotate(a); ctx.strokeStyle = '#e67e22'; ctx.lineWidth = 12; line(ctx, -60, 0, -60, -380); line(ctx, 60, 0, 60, -380); line(ctx, -200, -380, 260, -380); ctx.lineWidth = 6; line(ctx, -60, -200, 60, -380); line(ctx, 60, -200, -60, -380); ctx.strokeStyle = '#333'; ctx.lineWidth = 2; line(ctx, 180, -380, 180, -260 + Math.sin(t * 3 + i) * 40); ctx.restore(); }
    // containers being swept along
    for (let i = 0; i < 14; i++) { const r = rng(i + 40), x = -200 + i * 150 + (lt > 1 ? (lt - 1) ** 2 * (40 + r() * 60) : 0), floating = lt > 1.5 + r() * 2; const y = floating ? Math.min(700, lvl) - 40 + Math.sin(t * 2 + i) * 8 : 700 - 40 - (i % 2) * 42; ctx.save(); ctx.translate(x, y); ctx.rotate(floating ? Math.sin(t + i) * 0.2 : 0); ctx.fillStyle = ['#2980b9', '#e67e22', '#27ae60', '#8e44ad', '#c0392b'][i % 5]; ctx.fillRect(-70, -20, 140, 42); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.strokeRect(-70, -20, 140, 42); ctx.restore(); }
    drawShip(ctx, lerp(-200, 400, eIO(lt / d)), Math.min(760, lvl + 20), 1.0, -0.06 + Math.sin(t) * 0.03, '#2c3e50');
    // water
    ctx.fillStyle = 'rgba(40,110,170,0.85)'; ctx.beginPath(); ctx.moveTo(-500, H + 300); for (let x = -500; x < 2500; x += 10) ctx.lineTo(x, lvl + Math.sin(x / 50 + t * 4) * 8); ctx.lineTo(2500, H + 300); ctx.fill();
    ctx.restore();
    windStreaks(ctx, t, { n: 25, a: 0.25, speed: 2600 });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ПОРТЫ', 'контейнеры и суда сносит на берег');
  }

  // F — the same beach from scene 1, now empty under a dark sky, surge rolls in
  function shotBeachSurge(ctx, lt, d, t) {
    const cam = { x: 960, y: 620, z: 1.25, shake: 6 };
    sky(ctx, ['#2b3346', '#5d6478', '#8c8a86']);
    ctx.save(); applyCam(ctx, cam, t);
    drawSea(ctx, t * 3, 470, 760, { c0: '#20476e', c1: '#3c6f9a', surge: 1 });
    const push = lerp(0, -260, eIO(clamp(lt / d)));
    drawShore(ctx, t * 2, 740, -200, W + 200, { push: -push * 1.2, sand: '#cbb68a' });
    drawPalm(ctx, 140, 900, 1.6, t, 1, 0.5); drawPalm(ctx, 1800, 920, 1.5, t, 2, 0.5);
    drawUmbrella(ctx, 560 + lt * lt * 40, 900 - lt * 20, 1.2, ['#ff5a4d', '#fff'], lt * 0.5);
    drawUmbrella(ctx, 1320 + lt * lt * 30, 930, 1.1, ['#2a9df4', '#fff'], 0.3 + lt * 0.3);
    // water overruns the sand
    const wl = 760 - push * 0.9;
    ctx.fillStyle = 'rgba(50,110,160,0.85)'; ctx.beginPath(); ctx.moveTo(-200, 700); for (let x = -200; x < W + 220; x += 12) ctx.lineTo(x, Math.min(H + 300, wl + Math.sin(x / 60 + t * 3) * 10)); ctx.lineTo(W + 200, 700); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 5; ctx.beginPath(); for (let x = -200; x < W + 220; x += 12) ctx.lineTo(x, Math.min(H + 300, wl + Math.sin(x / 60 + t * 3) * 10)); ctx.stroke();
    ctx.restore();
    windStreaks(ctx, t, { n: 30, a: 0.25, speed: 3000 });
    label(ctx, 'ТОТ ЖЕ ПЛЯЖ', 170, 90, 40, { align: 'left', col: 'rgba(255,255,255,0.85)', alpha: sm(0.3, 0.8, lt) * (1 - sm(d - 0.8, d - 0.3, lt)) });
  }

  // G — water through the city streets
  function shotFlood(ctx, lt, d, t) {
    const cam = { x: 4300 + lt * 40, y: 520, z: lerp(1.15, 1.0, lt / d), shake: 5 };
    const lvl = lerp(ROAD + 260, ROAD - 60, eIO(clamp(lt / (d * 0.7))));
    citySet(ctx, { t, cam, sky: ['#2b3346', '#5d6478', '#8c8a86'], ruin: 0.4, nearWalkers: false, walkers: false, cloudCol: '#7d8391', inWorld: g => {
      // floating cars
      for (let i = 0; i < 5; i++) { const x = 3700 + i * 330 + lt * (90 + i * 20); drawCar(g, x, lvl + 30 + Math.sin(t * 2 + i) * 6, 0.75, { col: CAR_COLS[i + 2], dir: 1, tilt: Math.sin(t * 1.5 + i) * 0.15 }); }
      g.fillStyle = 'rgba(60,110,150,0.82)'; g.beginPath(); g.moveTo(-3000, H + 800); for (let x = 2500; x < 7000; x += 12) g.lineTo(x, lvl + Math.sin(x / 45 + t * 4) * 7); g.lineTo(7000, H + 800); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 3; g.beginPath(); for (let x = 2500; x < 7000; x += 12) g.lineTo(x, lvl + Math.sin(x / 45 + t * 4) * 7); g.stroke();
      debris(g, t, { n: 20, seed: 4, x0: 3500, x1: 6000, y0: lvl - 10, y1: lvl + 10, vx: 160, size: 14, kinds: ['chunk', 'paper'] });
    } });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ПРИБРЕЖНЫЕ ГОРОДА', 'улицы превращаются в реки');
  }

  // H — map: flooded coasts glowing along eastern shores
  function shotMapFlood(ctx, lt, d, t) {
    const cam = { x: lerp(1650, 1950, lt / d), y: 760, z: 0.64 };
    ctx.save(); applyCam(ctx, cam, t); worldMap(ctx);
    const k = eOut(clamp(lt / (d * 0.7)));
    ctx.save(); ctx.globalCompositeOperation = 'source-over';
    const path = p => { ctx.beginPath(); p.forEach(([lo, la], i) => { const [x, y] = mapXY(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); };
    for (const p of WORLD) { path(p); ctx.strokeStyle = `rgba(60,170,255,${0.9 * k})`; ctx.lineWidth = 8 + 30 * k; ctx.stroke(); }
    for (const p of WORLD) { path(p); ctx.fillStyle = '#e9dcb8'; ctx.fill(); }
    for (const p of WORLD) { path(p); ctx.strokeStyle = '#8c7a55'; ctx.lineWidth = 2.5; ctx.stroke(); }
    ctx.restore();
    ['НЬЮ-ЙОРК', 'ТОКИО', 'РИО-ДЕ-ЖАНЕЙРО', 'МУМБАИ', 'СИНГАПУР', 'ЛАГОС', 'СИДНЕЙ'].forEach((c, i) => { if (lt > 0.8 + i * 0.4) cityDot(ctx, c, t + i * 0.2, { col: CYAN, size: 36 }); });
    ctx.restore();
    label(ctx, 'ПОД УДАРОМ — ПОБЕРЕЖЬЯ ВСЕХ КОНТИНЕНТОВ', W / 2, 90, 50, { col: CYAN, alpha: sm(1, 1.5, lt) });
  }

  // I — globe: water redistributes; calm returns slowly
  function shotGlobeEnd(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const R = lerp(520, 430, eIO(lt / d)), o = { rot: 3.2, cloudRot: 3.2 - lt * 0.12, lat0: 0.15, res: 2, night: 0.4, sun: [-0.4, -0.3, 0.86], storm: lerp(1, 0.4, lt / d), t };
    drawGlobe(ctx, W / 2, 560, R, o);
    // ripple rings across the oceans
    for (let i = 0; i < 4; i++) { const p = ((lt * 0.35 + i / 4) % 1); ctx.strokeStyle = `rgba(140,220,255,${0.5 * (1 - p)})`; ctx.lineWidth = 3; ell(ctx, W / 2 + 80, 600, R * (0.2 + p * 0.8), R * (0.12 + p * 0.5)); ctx.stroke(); }
  }

  const SHOTS = [
    { d: 8.0, f: shotOrbit },
    { d: 8.5, f: shotBasin, tr: 'fade' },
    { d: 8.0, f: shotSwell, tr: 'whip' },
    { d: 8.0, f: shotWall, tr: 'cut' },
    { d: 8.0, f: shotPort, tr: 'flash' },
    { d: 8.0, f: shotBeachSurge, tr: 'whip' },
    { d: 9.0, f: shotFlood, tr: 'whip' },
    { d: 8.5, f: shotMapFlood, tr: 'fade' },
    { d: 9.0, f: shotGlobeEnd, tr: 'zoom' },
  ];
  function cues(S) {
    const s = S.shots, c = [{ t: S.t0, music: 'catastrophe', fade: 1.5 }];
    c.push({ t: s[0], type: 'space', d: s[1] - s[0] + 0.5 }, { t: s[1], type: 'ocean_roar', d: s[1 + 1] - s[1], gain: 0.5 }, { t: s[1] + 0.8, type: 'whoosh', d: 3, gain: 0.6 });
    c.push({ t: s[2], type: 'ocean_roar', d: s[7] - s[2], gain: 1.0 }, { t: s[2], type: 'storm', d: s[7] - s[2], gain: 0.6 });
    c.push({ t: s[3], type: 'rumble', d: 8 }, { t: s[3] + 6.5, type: 'riser', d: 0.1, gain: 0 }, { t: s[4], type: 'boom', gain: 0.9 }, { t: s[4], type: 'debris', d: 8, gain: 0.6 });
    c.push({ t: s[5] + 1, type: 'whoosh', d: 2 }, { t: s[6], type: 'hit', gain: 0.6 }, { t: s[6], type: 'debris', d: 8, gain: 0.4 });
    for (let i = 0; i < 7; i++) c.push({ t: s[7] + 0.8 + i * 0.4, type: 'pop', gain: 0.7 });
    c.push({ t: s[8], type: 'space', d: s[8] - s[7] + 2 }, { t: S.t0 + S.dur - 0.2, type: 'sub', d: 2.5 });
    return c.filter(x => x.gain !== 0);
  }
  SCN[ID] = { design: 75, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
