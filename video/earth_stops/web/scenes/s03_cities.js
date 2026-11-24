// ===== Scene 3 — Что произошло с городами? (1:45–3:00) =====
(() => {
  const ID = 's03';
  const tag = (ctx, lt, d, city, sub) => lowerThird(ctx, lt - 0.2, d - 0.2, city, sub);

  // A — world map with the factors that matter
  function shotFactors(ctx, lt, d, t) {
    const cam = { x: lerp(1500, 1900, lt / d), y: lerp(760, 720, lt / d), z: lerp(0.62, 0.7, lt / d) };
    ctx.save(); applyCam(ctx, cam, t); worldMap(ctx);
    ['НЬЮ-ЙОРК', 'ЛОНДОН', 'МОСКВА', 'ТОКИО', 'РИО-ДЕ-ЖАНЕЙРО', 'КАИР', 'МУМБАИ', 'СИДНЕЙ'].forEach((c, i) => { if (lt > 0.3 + i * 0.25) cityDot(ctx, c, t + i * 0.3, { size: 40 }); });
    ctx.restore();
    const chips = ['ШИРОТА', 'ТИП ЗДАНИЙ', 'РЕЛЬЕФ', 'ПОГОДА'];
    chips.forEach((c, i) => { const k = lt - 1.2 - i * 0.45; if (k < 0) return; const s = eBack(clamp(k / 0.35)); ctx.save(); ctx.translate(240 + i * 380, 150); ctx.scale(s, s); ctx.fillStyle = 'rgba(10,14,28,0.8)'; rrect(ctx, -170, -46, 340, 92, 46); ctx.fill(); ctx.strokeStyle = YEL; ctx.lineWidth = 3; ctx.stroke(); label(ctx, c, 0, 2, 44, { col: '#fff', stroke: false }); ctx.restore(); });
    chapterCard(ctx, lt, d, 'ЧАСТЬ 1', 'ГОРОДА');
  }

  // B — New York street: cars slide, buses tip
  function shotStreet(ctx, lt, d, t) {
    const cam = { x: 2200 + lt * 90, y: 520, z: lerp(1.15, 1.3, lt / d), r: -0.04, shake: 12 };
    citySet(ctx, { t, cam, sky: 'dust', chaos: 1, ct: 0.15 + lt * 0.5, haze: 'rgba(150,128,100,0.08)', midCol: '#8a8d96', farCol: '#a5a19a' });
    tag(ctx, lt, d, 'НЬЮ-ЙОРК', 'улицы и транспорт');
  }

  // C — glass tower: windows burst, the tower sways
  function shotTower(ctx, lt, d, t) {
    const cam = { x: 960, y: lerp(300, -500, eIO(lt / d)), z: 1.0, r: 0.03 * Math.sin(t * 2), shake: 8 };
    sky(ctx, ['#3a4a6a', '#7f8ea8', '#bfae94']);
    withParallax(ctx, cam, 0.3, g => { skyline(g, 31, -800, 900, { width: 4000, hmin: 300, hmax: 700, col: '#8592a8' }); }, t);
    ctx.save(); applyCam(ctx, cam, t);
    const sway = Math.sin(t * 2.6) * 0.03 + 0.04 * clamp(lt / 2);
    const b = { x: 760, w: 400, h: 1700, col: '#7fa6c9', roof: 3, seed: 77, glass: true };
    ctx.save(); ctx.translate(960, 1000); ctx.rotate(sway * 0.4); ctx.translate(-960, -1000);
    drawBuilding(ctx, b, 1000, { t, broken: clamp(lt / d * 1.2), cracks: clamp(lt / 3) });
    // shattering bursts along the facade
    particles(t, { rate: 8, life: 1.4, seed: 7 }, (r, q) => { const y0 = 1000 - r() * 1600, x0 = 760 + r() * 400; for (let i = 0; i < 6; i++) { ctx.fillStyle = `rgba(200,235,255,${1 - q})`; const a = r() * 0.6 - 0.3; ctx.save(); ctx.translate(x0 + q * (300 + r() * 300), y0 + q * q * 400 + (r() - 0.5) * 60); ctx.rotate(q * 8 + i); poly(ctx, [[0, -9], [6, 6], [-5, 4]]); ctx.fill(); ctx.restore(); } });
    ctx.restore();
    // neighbours
    drawBuilding(ctx, { x: 300, w: 300, h: 900, col: '#b9a28a', roof: 4, seed: 8 }, 1000, { t, broken: 0.6, cracks: 1, tilt: 0.03 * clamp(lt / 3) });
    drawBuilding(ctx, { x: 1300, w: 330, h: 1100, col: '#a8b6c6', roof: 1, seed: 9 }, 1000, { t, broken: 0.5, cracks: 1, crumble: clamp((lt - 3) / 3) * 0.4 });
    ctx.restore();
    debris(ctx, t, { n: 30, vx: 1500, vy: 60, size: 14, kinds: ['glass', 'glass', 'paper'] });
    windStreaks(ctx, t, { n: 30, a: 0.3, speed: 3000 });
    tag(ctx, lt, d, 'ТОКИО', 'высотные здания');
  }

  // D — suspension bridge: oscillation, snapping hangers, surging water
  function shotBridge(ctx, lt, d, t) {
    const cam = { x: lerp(900, 1050, lt / d), y: 540, z: lerp(1.0, 1.12, lt / d), shake: 8 };
    sky(ctx, ['#4a5670', '#8a96aa', '#c7b89c']);
    withParallax(ctx, cam, 0.15, g => { cloudLayer(g, t * 30, { seed: 91, n: 8, y0: 60, y1: 300, speed: 30, col: '#c9c4bc', stretch: 1.6 }); }, t);
    withParallax(ctx, cam, 0.3, g => { g.fillStyle = '#6f7d74'; g.beginPath(); g.moveTo(-500, 700); g.quadraticCurveTo(300, 480, 900, 640); g.quadraticCurveTo(1500, 520, 2500, 700); g.lineTo(2500, 900); g.lineTo(-500, 900); g.fill(); }, t);
    ctx.save(); applyCam(ctx, cam, t);
    drawSea(ctx, t * 2.5, 700, 1200, { c0: '#28567d', c1: '#3f7fa8', surge: 0.6 + 0.4 * clamp(lt / 3) });
    const deckY = drawBridge(ctx, -100, 2020, 560, { t, sway: 0.4 + clamp(lt / 3) * 0.8, snap: clamp((lt - 2) / 4) * 0.5 });
    // cars on the deck sliding
    for (let i = 0; i < 6; i++) { const x = 100 + i * 330 + lt * lt * 25 * (1 + i * 0.2); drawCar(ctx, x, deckY(x) - 2, 0.42, { col: CAR_COLS[i], dir: i % 2 ? 1 : -1, tilt: Math.sin(t * 6 + i) * 0.1 * clamp(lt / 2) }); }
    // spray at the piers
    particles(t, { rate: 30, life: 1.2, seed: 5 }, (r, q) => { const x = (r() < 0.5 ? 0.22 : 0.78) * 2120 - 100 + q * 200; ctx.fillStyle = `rgba(255,255,255,${0.6 * (1 - q)})`; circ(ctx, x + r() * 80, 720 - Math.sin(q * PI) * (80 + r() * 120), 6 + r() * 8); ctx.fill(); });
    ctx.restore();
    windStreaks(ctx, t, { n: 25, a: 0.25, speed: 2800 });
    tag(ctx, lt, d, 'САН-ФРАНЦИСКО', 'мосты');
  }

  // E — airport: parked jets slide, tower leans, carts fly
  function shotAirport(ctx, lt, d, t) {
    const cam = { x: lerp(980, 1150, lt / d), y: 520, z: 1.0, shake: 10, r: -0.02 };
    sky(ctx, ['#7a6a58', '#b49a78', '#e0c79a']); sun(ctx, 1600, 200, 40, '#fff0d0', 0.5);
    withParallax(ctx, cam, 0.2, g => skyline(g, 41, -800, 640, { width: 4000, hmin: 120, hmax: 360, col: '#b8a690' }), t);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#9c968a'; ctx.fillRect(-500, 640, 3000, 600); ctx.fillStyle = '#7d786e'; ctx.fillRect(-500, 760, 3000, 160);
    ctx.fillStyle = '#f2f2f2'; for (let x = -500; x < 2500; x += 140) ctx.fillRect(x, 836, 70, 8);
    // terminal
    ctx.fillStyle = '#cfd6de'; ctx.fillRect(-300, 470, 900, 170); ctx.fillStyle = 'rgba(120,180,230,0.6)'; ctx.fillRect(-280, 490, 860, 90); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-300, 470, 900, 170);
    drawTower(ctx, 760, 640, 1.0, 0.08 * clamp(lt / 3) + Math.sin(t * 7) * 0.01);
    const k = clamp(lt / d);
    drawParkedPlane(ctx, 1000 + k * k * 500, 830, 1.0, { t, tilt: -0.05 * k });
    drawParkedPlane(ctx, 300 + k * k * 700, 930, 0.75, { t, dir: -1, tilt: 0.12 * k, livery: '#c0392b' });
    for (let i = 0; i < 5; i++) { const x = 600 + i * 90 + lt * lt * (60 + i * 25), y = 700 - Math.max(0, Math.sin(lt * 3 + i)) * 60 * k; ctx.save(); ctx.translate(x, y); ctx.rotate(lt * (i - 2)); ctx.fillStyle = ['#f39c12', '#3498db', '#8e44ad', '#16a085', '#e74c3c'][i]; ctx.fillRect(-22, -16, 44, 32); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(-22, -16, 44, 32); ctx.restore(); }
    ctx.restore();
    dust(ctx, t, { n: 30, vx: 1300, a: 0.35, size: 120, y0: 400, y1: H });
    tag(ctx, lt, d, 'ДУБАЙ', 'аэропорты');
  }

  // F — railway station: trains derail, canopy sags
  function shotRail(ctx, lt, d, t) {
    const cam = { x: lerp(900, 1100, lt / d), y: 540, z: lerp(1.05, 0.95, lt / d), shake: 12, r: 0.02 };
    sky(ctx, 'grey');
    withParallax(ctx, cam, 0.25, g => skyline(g, 51, -800, 560, { width: 4000, hmin: 140, hmax: 380, col: '#8f98a6' }), t);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#8a857c'; ctx.fillRect(-600, 560, 3200, 800);
    // station canopy
    const sag = clamp((lt - 1.5) / 3);
    ctx.fillStyle = '#56606e'; for (let x = -200; x < 2200; x += 400) ctx.fillRect(x, 330 + (x > 600 ? sag * 40 : 0), 18, 330);
    ctx.fillStyle = '#c8ced6'; ctx.beginPath(); ctx.moveTo(-300, 330); ctx.quadraticCurveTo(900, 230, 2300, 330 + sag * 180); ctx.lineTo(2300, 360 + sag * 180); ctx.quadraticCurveTo(900, 270, -300, 360); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#ffffff'; rrect(ctx, 760, 380, 400, 70, 10); ctx.fill(); label(ctx, 'ВОКЗАЛ', 960, 416, 44, { col: '#2d3a4a', stroke: false });
    drawTrain(ctx, -200 + lt * 40, 800, 6, { derail: eIn(clamp((lt - 0.8) / (d - 1))) * 1.2, t });
    ctx.restore();
    debris(ctx, t, { n: 24, vx: 1500, size: 16, kinds: ['chunk', 'paper', 'brick'] });
    tag(ctx, lt, d, 'МОСКВА', 'железные дороги');
  }

  // G — latitude explainer: speed falls toward the poles
  function shotLatitude(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const R = 400, cx = 760, cy = 560, o = { rot: 0.4 - t * 0.05, lat0: 0.12, res: 2, night: 0.4, sun: [-0.4, -0.3, 0.86] };
    drawGlobe(ctx, cx, cy, R, o);
    const rows = [[0, '1 670 км/ч', 'ЭКВАТОР', RED], [30, '1 450 км/ч', '30°', '#ff8a3b'], [56, '930 км/ч', 'МОСКВА · 56°', YEL], [75, '430 км/ч', '75°', GRN]];
    rows.forEach(([lat, v, name, col], i) => {
      const k = clamp((lt - 0.6 - i * 0.6) / 0.4); if (k <= 0) return;
      const [x0, y0] = globePt(cx, cy, R, lat, -90, o); let [x1, y1] = globePt(cx, cy, R, lat, 90, o);
      ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.ellipse(cx, y0, Math.abs(x1 - x0) / 2, 10, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      const bx = cx + R + 120, sy = [800, 620, 440, 260][i]; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(bx - 40, sy); ctx.lineTo(bx - 10, sy); ctx.stroke(); const y1_ = y1; y1 = sy;
      ctx.fillStyle = col; rrect(ctx, bx, y1 - 32, 20 + 560 * Math.cos(lat * PI / 180) * eOut(k), 64, 12); ctx.fill();
      label(ctx, v, bx + 30, y1, 40, { align: 'left', col: '#fff' }); label(ctx, name, bx + 600, y1, 30, { align: 'right', col: 'rgba(255,255,255,0.9)' });
      ctx.restore();
    });
    label(ctx, 'ЧЕМ БЛИЖЕ К ЭКВАТОРУ — ТЕМ СИЛЬНЕЕ УДАР', W / 2, 90, 52, { col: YEL, alpha: sm(3, 3.5, lt) });
  }

  // H — skyline crumbling, dust plumes
  function shotSkyline(ctx, lt, d, t) {
    const cam = { x: 960 + lt * 25, y: 520, z: lerp(1.15, 1.0, lt / d), shake: 9 };
    sky(ctx, ['#5a4e44', '#9c7f60', '#d0a874']);
    withParallax(ctx, cam, 0.3, g => { g.fillStyle = '#6a7a5a'; g.beginPath(); g.moveTo(-500, 760); g.quadraticCurveTo(200, 300, 700, 680); g.quadraticCurveTo(1100, 420, 1500, 700); g.quadraticCurveTo(1900, 500, 2400, 760); g.fill(); }, t);
    ctx.save(); applyCam(ctx, cam, t);
    ruinSkyline(ctx, 61, -400, 2400, 900, lt / d * 1.4, t, { hmin: 200, hmax: 600, frac: 0.55 });
    ctx.fillStyle = '#6b665e'; ctx.fillRect(-500, 900, 3000, 300);
    ctx.restore();
    dust(ctx, t, { n: 50, vx: 1100, a: 0.45, size: 160, y0: 500, y1: H });
    debris(ctx, t, { n: 30, vx: 1600, vy: 40, size: 14 });
    tag(ctx, lt, d, 'РИО-ДЕ-ЖАНЕЙРО', 'кварталы целиком');
  }

  // I — the dust front swallows the skyline, camera pulls back
  function shotDustFront(ctx, lt, d, t) {
    const cam = { x: 960, y: lerp(500, 300, lt / d), z: lerp(0.9, 0.55, eIO(lt / d)) };
    sky(ctx, ['#4c4036', '#8a6e52', '#b89068']);
    ctx.save(); applyCam(ctx, cam, t);
    ruinSkyline(ctx, 71, -1600, 3600, 900, 0.5 + lt / d * 0.6, t, { hmin: 200, hmax: 700, frac: 0.6, shake: 0.4 });
    ctx.fillStyle = '#6b665e'; ctx.fillRect(-2000, 900, 6000, 600);
    const fx = lerp(-2400, 4200, eIO(lt / d));
    for (let i = 0; i < 26; i++) { const r = rng(i), x = fx - r() * 1600, y = 900 - r() * 1300, s = 260 + r() * 300; ctx.fillStyle = radial(ctx, x, y, s, [[0, 'rgba(150,124,94,0.85)'], [1, 'rgba(150,124,94,0)']]); ctx.fillRect(x - s, y - s, 2 * s, 2 * s); }
    ctx.fillStyle = 'rgba(150,124,94,0.7)'; ctx.fillRect(-3000, -1500, fx - 1400 + 3000, 3000);
    ctx.restore();
    windStreaks(ctx, t, { n: 40, a: 0.3, speed: 3500 });
  }

  const SHOTS = [
    { d: 7.5, f: shotFactors },
    { d: 8.5, f: shotStreet, tr: 'zoom' },
    { d: 7.5, f: shotTower, tr: 'whip' },
    { d: 8.0, f: shotBridge, tr: 'whip' },
    { d: 7.5, f: shotAirport, tr: 'whip' },
    { d: 7.5, f: shotRail, tr: 'whip' },
    { d: 9.5, f: shotLatitude, tr: 'fade' },
    { d: 9.0, f: shotSkyline, tr: 'flash' },
    { d: 10.0, f: shotDustFront, tr: 'cut' },
  ];
  function cues(S) {
    const s = S.shots, end = S.t0 + S.dur;
    const c = [{ t: S.t0, music: 'catastrophe', fade: 0.6 }, { t: s[0], type: 'storm', d: S.dur, gain: 0.55 }, { t: s[0], type: 'rumble', d: S.dur, gain: 0.5 }];
    for (let i = 1; i < s.length; i++) c.push({ t: s[i] - 0.25, type: i === 6 ? 'whoosh_down' : 'whoosh', d: 0.6 });
    [0, 1, 2, 3].forEach(i => c.push({ t: s[0] + 1.2 + i * 0.45, type: 'pop' }));
    c.push({ t: s[1], type: 'debris', d: s[2] - s[1] }, { t: s[1] + 1, type: 'screech', d: 1.2, f: 2100 });
    c.push({ t: s[2], type: 'glass', d: 3 }, { t: s[2] + 3, type: 'glass', d: 3 });
    c.push({ t: s[3], type: 'ocean_roar', d: s[4] - s[3], gain: 0.7 }, { t: s[3] + 2.5, type: 'screech', d: 2.5, f: 380, gain: 0.8 });
    c.push({ t: s[4], type: 'debris', d: 7 }, { t: s[4] + 4, type: 'thud' });
    c.push({ t: s[5] + 1, type: 'screech', d: 2.4, f: 1600, gain: 0.9 }, { t: s[5] + 2.5, type: 'boom', gain: 0.6 }, { t: s[5], type: 'debris', d: 7 });
    for (let i = 0; i < 4; i++) c.push({ t: s[6] + 0.6 + i * 0.6, type: 'pop' });
    c.push({ t: s[7], type: 'boom', gain: 0.8 }, { t: s[7] + 3, type: 'boom', gain: 0.6 }, { t: s[7], type: 'debris', d: 9 });
    c.push({ t: s[8], type: 'riser', d: 0.1, gain: 0 }, { t: end - 1.5, type: 'whoosh_down', d: 2.5, gain: 0.8 });
    return c;
  }
  SCN[ID] = { design: 75, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
