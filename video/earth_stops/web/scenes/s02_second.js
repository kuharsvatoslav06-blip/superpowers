// ===== Scene 2 — Одна секунда (0:45–1:45) =====
(() => {
  const ID = 's02';
  const T0 = () => SC0(ID);
  const AX = 5200, AY = ROAD + 170 + 66;   // Alex's spot on the near sidewalk

  function clockBadge(ctx, txt, a, red) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(8,10,20,0.75)'; rrect(ctx, W - 330, 40, 280, 92, 14); ctx.fill();
    ctx.strokeStyle = red ? RED : 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = '700 64px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = red ? RED : '#7dff9a'; ctx.fillText(txt, W - 190, 88); ctx.restore();
  }
  const pad = n => String(n).padStart(2, '0');

  // A — calm before: Alex at the curb, clock ticking to 09:00:00
  function shotCalm(ctx, lt, d, t) {
    const cam = { x: AX + 60, y: AY - 190, z: lerp(1.9, 2.25, eIO(lt / d)) };
    const look = sm(d - 1.3, d - 0.7, lt);
    citySet(ctx, { t, cam, sky: 'day', sun: [1600, 160], nearWalkers: false, inWorld: g => {
      drawStick(g, AX - 230, AY, 25, { pose: P.stand(t, 3), dir: 1, t, seed: 61, outfit: randomOutfit(61), prop: 'coffee', expr: 'neutral' });
      drawStick(g, AX + 260, AY + 4, 24, { pose: P.phone(t, 2), dir: -1, t, seed: 62, outfit: randomOutfit(64), prop: 'phone', expr: 'focus', look: [-0.3, 0.6] });
      drawAlex(g, AX, AY, 26, { pose: look > 0.5 ? P.lookUp(t) : P.phone(t), dir: 1, t, prop: 'phone', expr: look > 0.5 ? 'confused' : 'smile', look: look > 0.5 ? [0, -1] : [0.4, 0.6] });
    } });
    const sec = 56 + Math.min(3, Math.floor(lt / d * 3.99));
    clockBadge(ctx, `08:59:${pad(sec)}`, clamp(lt / 0.4), false);
    lowerThird(ctx, lt, d - 0.3, 'АЛЕКС', 'обычное утро, 08:59');
  }

  // B — THE SECOND: slow motion, everything keeps moving east
  function shotSecond(ctx, lt, d, t) {
    const k = lt / d, ct = lt * 0.85;
    const cam = { x: AX + 60 + lt * 60, y: AY - 220, z: lerp(2.05, 1.55, eOut(k)), r: -0.13 * eOut(clamp(lt / 0.5)) + Math.sin(lt * 3) * 0.015, shake: lerp(34, 9, clamp(lt / 1.5)) };
    const lift = eIO(clamp((lt - 0.5) / 3));
    citySet(ctx, { t, cam, sky: mixSky('day', 'dust', k * 0.8), sun: [1600, 160], chaos: 1, ct, nearWalkers: false, inWorld: g => {
      // bystanders swept right
      drawStick(g, AX - 230 + ct * ct * 70, AY - lift * 120, 25, { pose: P.flail(t), dir: 1, t, seed: 61, outfit: randomOutfit(61), expr: 'shock', pose: Object.assign(P.flail(t), { rot: lift * 0.6 }) });
      drawStick(g, AX + 260 + ct * ct * 55, AY - lift * 90, 24, { pose: Object.assign(P.flail(t + 1), { rot: lift * 0.9 }), dir: -1, t, seed: 62, outfit: randomOutfit(64), expr: 'scared' });
      // coffee splash arc
      for (let i = 0; i < 14; i++) { const q = clamp(lt * 0.9 - i * 0.03); if (q <= 0) continue; ctx.fillStyle = '#7a4a2a'; circ(g, AX - 180 + q * 520 + i * 9, AY - 150 - Math.sin(q * 2) * 60 + i * 3, 6 - i * 0.25); g.fill(); }
      // Alex: lifted, flailing, drifting right
      const ax = AX + ct * ct * 40 + lt * 30, ay = AY - lift * 100;
      drawAlex(g, ax, ay, 26, { pose: Object.assign(P.flail(t), { rot: lift * 0.35 }), dir: 1, t, expr: lt < 0.6 ? 'surprised' : 'shock' });
      // his phone flies ahead, spinning
      g.save(); g.translate(ax + 80 + lt * 150, ay - 160 - lt * 30); g.rotate(lt * 4); g.scale(26, 26); g.fillStyle = '#16161c'; rrect(g, -0.3, -0.5, 0.6, 1, 0.1); g.fill(); g.fillStyle = '#7fd3ff'; rrect(g, -0.22, -0.42, 0.44, 0.84, 0.06); g.fill(); g.restore();
    } });
    // HUD: timer, slow-mo label, stamp
    const sec = clamp(lt / d);
    clockBadge(ctx, '09:00:00', 1, true);
    ctx.save(); ctx.fillStyle = 'rgba(8,10,20,0.75)'; rrect(ctx, 50, 40, 430, 120, 14); ctx.fill(); ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    label(ctx, `${sec.toFixed(3).replace('.', ',')} с`, 265, 88, 64, { col: '#fff', stroke: false });
    label(ctx, 'ЗАМЕДЛЕНО ×6', 265, 136, 26, { col: RED, stroke: false });
    stamp(ctx, 'СТОП', W / 2, H / 2 - 60, lt - 0.05, 1.3, { size: 220, col: RED });
    if (lt < 0.15) { ctx.fillStyle = `rgba(255,255,255,${1 - lt / 0.15})`; ctx.fillRect(0, 0, W, H); }
    speedArrow(ctx, 620, 300, 260, 'АЛЕКС: 1 670 км/ч', { a: sm(1.6, 2.0, lt), size: 36, col: YEL });
    speedArrow(ctx, 620, 980, 0, 'ЗЕМЛЯ: 0 км/ч', { a: sm(2.4, 2.8, lt), size: 40, col: RED });
  }

  // C — diagram: the ground stops, everything on it does not
  function shotDiagram(ctx, lt, d, t) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#0b1630'], [1, '#13284d']]); ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(120,170,255,0.08)'; ctx.lineWidth = 1; for (let x = 0; x < W; x += 60) line(ctx, x, 0, x, H); for (let y = 0; y < H; y += 60) line(ctx, 0, y, W, y);
    const stopT = VOword(ID, 1, /остановиться/) - T0() - 12.5, slideT = VOword(ID, 2, /не$/) - T0() - 12.5;
    const gv = 1 - sm(stopT, stopT + 0.5, lt);           // ground speed fraction
    const groundX = (lt < stopT ? lt : stopT + (lt - stopT) * 0) * 300 * 1;  // texture scroll
    const scroll = Math.min(lt, stopT + 0.25) * 320;
    const rel = Math.max(0, lt - slideT) ; const ox = rel * rel * 120 + rel * 90;   // objects sliding relative to ground
    ctx.save(); ctx.translate(W / 2, H); ctx.scale(1.3, 1.3); ctx.translate(-W / 2 - 60, -H + 40);
    // ground arc
    const cy = 2900, R = 2350;
    ctx.save(); ctx.beginPath(); ctx.arc(W / 2, cy, R, 0, TAU); ctx.fillStyle = '#3d7a3a'; ctx.fill(); ctx.clip();
    ctx.fillStyle = '#6b4a2e'; ctx.beginPath(); ctx.arc(W / 2, cy, R - 70, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4f3622'; for (let i = 0; i < 60; i++) { const a = -PI / 2 + ((i * 0.05 + scroll / R) % 3) - 1.5; ctx.save(); ctx.translate(W / 2 + Math.cos(a) * (R - 130), cy + Math.sin(a) * (R - 130)); ctx.rotate(a); ctx.fillRect(-12, -6, 24, 12); ctx.restore(); }
    ctx.restore();
    // grass tufts scroll with ground
    ctx.strokeStyle = '#2e5e2b'; ctx.lineWidth = 3; for (let i = 0; i < 70; i++) { const a = -PI / 2 + (((i * 0.04 + scroll / R) % 2.8) - 1.4); const x = W / 2 + Math.cos(a) * R, y = cy + Math.sin(a) * R; ctx.save(); ctx.translate(x, y); ctx.rotate(a + PI / 2); line(ctx, 0, 0, -4, -14); line(ctx, 6, 0, 8, -12); ctx.restore(); }
    // objects on the surface (move together, then slide)
    const gy = cy - R, tilt = clamp(rel / 2) * 0.25;
    ctx.save(); ctx.translate(ox, 0);
    drawBuilding(ctx, { x: 300, w: 180, h: 300, col: '#c9d3dd', roof: 1, seed: 7, glass: false }, gy + 8, { tilt: tilt * 0.6 });
    drawTree(ctx, 600, gy + 6, 1.3, { t, seed: 3, bend: tilt * 3 });
    drawCar(ctx, 900, gy + 4, 1.0, { col: '#e74c3c', dir: 1, tilt: tilt * 0.5 });
    drawAlex(ctx, 1180, gy + 4, 24, { pose: rel > 0 ? Object.assign(P.flail(t), { rot: tilt * 2 }) : P.stand(t), dir: 1, t, expr: rel > 0 ? 'shock' : 'neutral' });
    // ocean wedge
    ctx.fillStyle = '#2b7bc4'; ctx.beginPath(); ctx.moveTo(1400, gy + 10); for (let x = 1400; x <= 1700; x += 10) ctx.lineTo(x, gy - 50 - Math.sin(x / 30 + t * 3) * 8 - tilt * (x - 1400) * 0.6); ctx.lineTo(1700, gy + 10); ctx.fill();
    cloud(ctx, 600 + ox * 0.6, 300, 260, 5); cloud(ctx, 1300 + ox * 0.6, 270, 300, 6);
    ctx.restore();
    ctx.restore();
    // arrows
    const ga = sm(0.3, 0.7, lt);
    speedArrow(ctx, 780, 600, 360 * gv, gv > 0.02 ? 'ЗЕМЛЯ: 1 670 км/ч' : 'ЗЕМЛЯ: 0 км/ч', { a: ga, size: 42, col: gv > 0.02 ? YEL : RED, w: 14 });
    const oa = sm(1.0, 1.4, lt);
    for (const [x, y] of [[300, 330], [1240, 230], [1380, 420]]) speedArrow(ctx, x + ox * 1.3, y, 220, '1 670 км/ч', { a: oa, size: 38, w: 12 });
    if (lt > slideT) stamp(ctx, 'ИНЕРЦИЯ', W / 2, 120, lt - slideT - 0.6, 99, { size: 100, col: YEL });
    lowerThird(ctx, lt - 0.2, stopT + 0.5, 'ПОКА ВСЁ ВРАЩАЕТСЯ ВМЕСТЕ', 'никто не чувствует скорости');
  }

  // D — atmosphere, oceans, cars, buildings, people: cards that keep flying
  function shotList(ctx, lt, d, t) {
    ctx.fillStyle = linear(ctx, 0, 0, W, H, [[0, '#101a36'], [1, '#2a1630']]); ctx.fillRect(0, 0, W, H);
    const base = T0() + 23;
    const keys = [[/Атмосфера/, 'АТМОСФЕРА', 'cloud'], [/океаны/, 'ОКЕАНЫ', 'wave'], [/автомобили/, 'АВТОМОБИЛИ', 'car'], [/здания/, 'ЗДАНИЯ', 'bld'], [/люди/, 'ЛЮДИ', 'man']];
    const goT = VOword(ID, 3, /сохраняя/) - base;
    const go = Math.max(0, lt - goT);
    windStreaks(ctx, t, { n: 30 + Math.floor(go * 30), a: 0.15 + clamp(go) * 0.35, speed: 1500 + go * 1000, len: 300 });
    keys.forEach(([re, name, ic], i) => {
      const s = VOword(ID, 3, re) - base, k = lt - s; if (k < 0) return;
      const x = 240 + i * 360 + go * go * 160 * (1 + i * 0.15), y = 470 + Math.sin(t * 2 + i) * 8, sc = eBack(clamp(k / 0.35));
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(go * 0.05 * (i - 2));
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; rrect(ctx, -150, -190, 300, 380, 26); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.stroke();
      if (ic === 'cloud') cloud(ctx, 0, -20, 220, 3);
      if (ic === 'wave') { ctx.fillStyle = '#2b7bc4'; ctx.beginPath(); ctx.moveTo(-110, 60); for (let xx = -110; xx <= 110; xx += 8) ctx.lineTo(xx, -10 + Math.sin(xx / 25 + t * 3) * 18 - (xx + 110) * 0.25); ctx.lineTo(110, 60); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); for (let xx = -110; xx <= 110; xx += 8) ctx.lineTo(xx, -10 + Math.sin(xx / 25 + t * 3) * 18 - (xx + 110) * 0.25); ctx.stroke(); }
      if (ic === 'car') drawCar(ctx, 0, 40, 0.95, { col: '#f1c40f', kind: 'taxi', wheel: t * 8 });
      if (ic === 'bld') { drawBuilding(ctx, { x: -70, w: 140, h: 230, col: '#c2b5c9', roof: 3, seed: 3, glass: true }, 80, { t }); }
      if (ic === 'man') drawAlex(ctx, 0, 90, 22, { pose: go > 0 ? P.flail(t) : P.wave(t), t, dir: 0, expr: go > 0 ? 'shock' : 'smile' });
      label(ctx, name, 0, 140, 40, { col: '#fff' });
      ctx.restore();
      if (go > 0) speedArrow(ctx, x - 100, y - 240, 200, '1 670 км/ч', { a: clamp(go * 3), size: 28 });
    });
  }

  // E — car analogy: open-top car brakes, passenger keeps going (seat belt holds)
  function shotCar(ctx, lt, d, t) {
    const brakeT = VOword(ID, 4, /резко/) - T0() - 32.5 + 0.2;
    const v = 900, pos = lt < brakeT ? lt * v : brakeT * v + v * 0.12 * (1 - Math.exp(-(lt - brakeT) * 12));
    const jerk = lt > brakeT ? Math.exp(-(lt - brakeT) * 2.2) * Math.sin((lt - brakeT) * 9) : 0;
    const lunge = lt > brakeT ? clamp((lt - brakeT) / 0.18) * (1 - clamp((lt - brakeT - 0.5) / 1.2)) : 0;
    const cam = { x: 960, y: 560, z: 1, shake: lt > brakeT ? 16 * Math.exp(-(lt - brakeT) * 4) : 0 };
    sky(ctx, 'day');
    ctx.save(); applyCam(ctx, cam, t);
    ctx.save(); ctx.translate(-(pos * 0.15) % 1200, 0); skyline(ctx, 21, -1200, 700, { width: 4000, hmin: 150, hmax: 380, col: '#a9bdd6' }); ctx.restore();
    ctx.save(); ctx.translate(-pos % 900, 0); for (let x = -900; x < W + 1800; x += 450) drawTree(ctx, x, 720, 1.3, { t, seed: Math.floor((x + pos) / 450) }); ctx.restore();
    ctx.fillStyle = '#4a4d55'; ctx.fillRect(0, 720, W, 360); ctx.fillStyle = '#f2f2f2'; for (let x = -(pos % 220); x < W; x += 220) ctx.fillRect(x, 880, 110, 10);
    // skid marks
    if (lt > brakeT) { ctx.fillStyle = 'rgba(20,20,20,0.6)'; const L = Math.min(260, (lt - brakeT) * 2000); ctx.fillRect(960 - 320 - L, 934, L, 9); ctx.fillRect(960 + 200 - L, 934, L, 9); smoke(ctx, t, 640, 930, { h: 120, w: 40, col: '#ddd', a: 0.5 * clamp(1.6 - (lt - brakeT)), drift: -120, seed: 4 }); }
    // the car (convertible), pitched forward when braking
    ctx.save(); ctx.translate(960, 940); ctx.rotate(jerk * 0.05); ctx.scale(3.3, 3.3);
    ctx.fillStyle = '#e74c3c'; ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-120, -22); ctx.lineTo(-124, -58); ctx.quadraticCurveTo(-120, -72, -95, -72); ctx.lineTo(-50, -72); ctx.lineTo(-40, -60); ctx.lineTo(40, -60); ctx.lineTo(70, -72); ctx.lineTo(108, -66); ctx.quadraticCurveTo(126, -60, 124, -22); ctx.closePath();
    // passenger first (behind door), seat
    ctx.save(); ctx.fillStyle = '#5b3a22'; rrect(ctx, -46, -112, 14, 52, 4); ctx.fill(); ctx.restore();
    const lean = lunge * 0.85 - jerk * 0.1;
    drawAlex(ctx, -10, -40, 11, { pose: pose({ lean: 0.05 + lean, head: lunge * 0.3, aF: 1.3 + lunge * 0.6, eF: 0.4, aB: 1.1, eB: 0.6, lF: 1.5, kF: 1.4, lB: 1.4, kB: 1.4, bob: 1.45 }), dir: 1, t, expr: lunge > 0.2 ? 'shock' : 'smile' });
    // seat belt
    ctx.strokeStyle = '#333'; ctx.lineWidth = 3; line(ctx, -26, -84 + lean * 4, 2 + lean * 14, -50);
    ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(-120, -22); ctx.lineTo(-124, -58); ctx.quadraticCurveTo(-120, -72, -95, -72); ctx.lineTo(-50, -72); ctx.lineTo(-40, -60); ctx.lineTo(40, -60); ctx.lineTo(70, -72); ctx.lineTo(108, -66); ctx.quadraticCurveTo(126, -60, 124, -22); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(190,230,255,0.6)'; poly(ctx, [[40, -60], [62, -96], [66, -94], [48, -60]]); ctx.fill();
    ctx.fillStyle = '#ffe9a6'; ctx.fillRect(118, -54, 6, 10); ctx.fillStyle = lt > brakeT ? '#ff2020' : '#a33'; ctx.fillRect(-126, -54, 6, 10); if (lt > brakeT) glow(ctx, -126, -49, 30, 'rgba(255,40,40,0.8)');
    for (const wx of [-78, 78]) { ctx.fillStyle = '#1c1c22'; circ(ctx, wx, -20, 20); ctx.fill(); ctx.fillStyle = '#9aa0aa'; circ(ctx, wx, -20, 9); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 2.5; const a = pos / 20; line(ctx, wx, -20, wx + Math.cos(a) * 9, -20 + Math.sin(a) * 9); }
    // coffee flies forward out of the cup holder
    if (lt > brakeT) { const q = lt - brakeT; for (let i = 0; i < 8; i++) { ctx.fillStyle = '#7a4a2a'; circ(ctx, 20 + q * 140 + i * 6, -70 - Math.sin(clamp(q) * 2.5) * 30 + q * q * 60 + i * 2, 3 - i * 0.2); ctx.fill(); } }
    ctx.restore();
    ctx.restore();
    if (lt < brakeT) windStreaks(ctx, t, { n: 18, a: 0.35, speed: -2600, len: 260, y0: 100, y1: 700 });
    speedArrow(ctx, 640, 420, 300 * (lt < brakeT ? 1 : Math.max(0, 1 - (lt - brakeT) * 6)), lt < brakeT ? 'МАШИНА: 60 км/ч' : 'МАШИНА: 0', { a: sm(0.3, 0.6, lt), size: 36, col: lt < brakeT ? YEL : RED });
    if (lt > brakeT) { speedArrow(ctx, 1000, 330, 280, 'ПАССАЖИР: 60 км/ч', { a: sm(brakeT + 0.2, brakeT + 0.5, lt), size: 36, col: YEL }); stamp(ctx, 'ИНЕРЦИЯ', W / 2, 130, lt - brakeT - 0.5, 99, { size: 110, col: YEL }); }
  }

  // F — scale up: zoom out to the planet; the planet "brakes"
  function shotPlanet(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const brakeT = VOword(ID, 5, /тормозит/) - T0() - 40.5 + 0.1;
    const k = eIO(clamp(lt / 1.6)), R = lerp(3200, 420, k);
    const spin = lt < brakeT ? lt : brakeT + 0.25 * (1 - Math.exp(-(lt - brakeT) * 8));
    const rot = 2.1 - spin * 0.9;
    const cloudRot = rot - Math.max(0, lt - brakeT) * 0.9;    // the atmosphere keeps going
    const sh = lt > brakeT ? 18 * Math.exp(-(lt - brakeT) * 2.5) : 0;
    const cx = W / 2 + fbm1(t * 9, 1) * sh, cy = 560 + fbm1(t * 9, 2) * sh;
    drawGlobe(ctx, cx, cy, R, { rot, cloudRot, lat0: 0.15, res: 2, night: 0.6, sun: [-0.5, -0.4, 0.76], storm: clamp(lt - brakeT) * 0.6, t });
    if (lt > brakeT) {
      // sparks along the equator limb
      particles(t, { rate: 60, life: 0.7, t0: T0() + 40.5 + brakeT, t1: T0() + 40.5 + brakeT + 1.6, seed: 4 }, (r, q) => { const side = r() < 0.5 ? -1 : 1, x = cx + side * R * 0.98 + side * q * 260 * r(), y = cy + (r() - 0.5) * 120 - q * 120 * r(); ctx.fillStyle = `rgba(255,${180 + r() * 60},80,${1 - q})`; circ(ctx, x, y, 3 + r() * 4); ctx.fill(); });
      speedArrow(ctx, W / 2 - 160, 960, 0, 'ЗЕМЛЯ: 0 км/ч', { a: sm(brakeT + 0.2, brakeT + 0.5, lt), size: 46, col: RED });
      speedArrow(ctx, W / 2 - 340, 110, 680, 'АТМОСФЕРА И ОКЕАНЫ: 1 670 км/ч', { a: sm(brakeT + 0.6, brakeT + 1.0, lt), size: 40 });
    }
    // car icon shrinking away at the start
    if (lt < 1.2) { ctx.save(); ctx.globalAlpha = 1 - clamp(lt / 1.2); drawCar(ctx, W / 2, 620, lerp(1.6, 0.02, eIn(clamp(lt / 1.2))), { col: '#e74c3c' }); ctx.restore(); }
  }

  // G — the sweep hits the city: shake, shattering glass, sliding cars, bending trees, dust
  function shotSweep(ctx, lt, d, t, variant) {
    const ct = lt * 0.8 + (variant === 2 ? 3.5 : variant === 3 ? 6 : 0) * 0.8;
    const cams = {
      1: { x: 1500 + lt * 120, y: 470, z: lerp(0.95, 1.1, lt / d), r: -0.05 + Math.sin(t * 2) * 0.01, shake: 14 },
      2: { x: 2600 - lt * 40, y: 380, z: lerp(1.9, 2.2, lt / d), r: 0.04, shake: 18 },
      3: { x: 3200 + lt * 160, y: lerp(320, 200, lt / d), z: lerp(0.62, 0.55, lt / d), r: -0.03, shake: 10 },
    };
    citySet(ctx, { t, cam: cams[variant], sky: 'dust', chaos: 1, ct: ct + 1.2, nearWalkers: false, haze: `rgba(150,128,100,${0.08 + variant * 0.04})` });
    if (variant === 2) debris(ctx, t, { n: 26, seed: 31, vx: 1800, vy: 80, size: 22, kinds: ['glass', 'glass', 'brick'] });
    if (variant === 3) dust(ctx, t, { n: 30, vx: 1200, a: 0.35, size: 200, y0: 200, y1: H, col: '#a08868' });
  }

  const SHOTS = [
    { d: 6.0, f: shotCalm },
    { d: 6.5, f: shotSecond, tr: 'flash', td: 0.3 },
    { d: 10.5, f: shotDiagram, tr: 'white', td: 0.6 },
    { d: 9.5, f: shotList, tr: 'fade', td: 0.5 },
    { d: 8.0, f: shotCar, tr: 'whip' },
    { d: 6.0, f: shotPlanet, tr: 'zoom' },
    { d: 5.0, f: (c, l, d, t) => shotSweep(c, l, d, t, 1), tr: 'flash', td: 0.35 },
    { d: 4.0, f: (c, l, d, t) => shotSweep(c, l, d, t, 2), tr: 'cut' },
    { d: 4.5, f: (c, l, d, t) => shotSweep(c, l, d, t, 3), tr: 'cut' },
  ];
  function cues(S) {
    const [calm, stop, diag, list, car, planet, g1, g2, g3] = S.shots, end = S.t0 + S.dur;
    const listBase = T0() + 23, brakeCar = VOword(ID, 4, /резко/) + 0.2, brakePlanet = VOword(ID, 5, /тормозит/) + 0.1;
    const pops = [/Атмосфера/, /океаны/, /автомобили/, /здания/, /люди/].map(re => ({ t: VOword(ID, 3, re), type: 'pop' }));
    return [
      { t: S.t0, music: 'calm_quiet', fade: 0.3 }, { t: stop, music: 'slowmo', fade: 0 }, { t: diag, music: 'tension', fade: 1.5 }, { t: g1, music: 'catastrophe', fade: 0.2 },
      { t: calm, type: 'city', d: stop - calm, gain: 0.9 }, { t: calm, type: 'clock', d: stop - calm, gain: 0.8 },
      { t: stop, type: 'boom', gain: 1.0 }, { t: stop, type: 'hit' }, { t: stop + 0.05, type: 'glass', d: 2.5 }, { t: stop + 0.4, type: 'screech', d: 1.6, f: 1900, gain: 0.7 },
      { t: stop, type: 'storm', d: diag - stop + 0.6, gain: 0.8 }, { t: stop, type: 'debris', d: diag - stop }, { t: stop + 0.2, type: 'tinnitus', d: 5 }, { t: stop + 0.6, type: 'heartbeat', d: 5.5, gain: 0.9 },
      { t: diag, type: 'whoosh', d: 0.8 }, { t: VOword(ID, 1, /остановиться/), type: 'screech', d: 0.9, f: 1300, gain: 0.6 },
      { t: VOword(ID, 2, /не$/) + 0.4, type: 'whoosh', d: 1.2, gain: 0.5 },
      { t: list, type: 'whoosh_down', d: 0.6 }, ...pops, { t: VOword(ID, 3, /сохраняя/), type: 'whoosh', d: 1.4 }, { t: VOword(ID, 3, /сохраняя/), type: 'wind', d: car - VOword(ID, 3, /сохраняя/), gain: 0.5 },
      { t: car - 0.25, type: 'whoosh', d: 0.6 }, { t: car, type: 'engine', d: brakeCar - car + 0.3, gain: 1.2 }, { t: brakeCar - 0.05, type: 'screech', d: 0.9, f: 2600 }, { t: brakeCar + 0.15, type: 'thud' },
      { t: planet, type: 'whoosh_down', d: 1.2 }, { t: planet, type: 'space', d: g1 - planet },
      { t: brakePlanet, type: 'screech', d: 2.2, f: 520, gain: 1.2 }, { t: brakePlanet, type: 'rumble', d: 3.5 }, { t: brakePlanet, type: 'hit', gain: 0.8 },
      { t: g1, type: 'boom', gain: 0.8 }, { t: g1, type: 'storm', d: end - g1 + 1.2, gain: 1.1 }, { t: g1, type: 'debris', d: end - g1 }, { t: g1, type: 'rumble', d: end - g1 + 1 },
      { t: g2, type: 'glass', d: 3.0, gain: 1.0 }, { t: g3, type: 'whoosh_down', d: 1.0 },
    ];
  }
  SCN[ID] = { design: 60, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
