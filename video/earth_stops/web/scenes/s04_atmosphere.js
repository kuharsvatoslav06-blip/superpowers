// ===== Scene 4 — Атмосфера не остановилась (3:00–4:15) =====
(() => {
  const ID = 's04';

  // A — orbit: surface frozen, clouds keep streaming east
  function shotOrbitClouds(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const R = lerp(470, 520, lt / d), o = { rot: 1.0, cloudRot: 1.0 - lt * 0.35, lat0: 0.18, res: 2, night: 0.5, sun: [-0.5, -0.35, 0.79], storm: 0.4 + lt * 0.05, t };
    drawGlobe(ctx, W / 2, 560, R, o);
    // flow arrows hugging the limb
    for (let i = 0; i < 5; i++) { const lat = -40 + i * 20, a = sm(0.5 + i * 0.2, 1.0 + i * 0.2, lt); const ph = (lt * 0.5 + i * 0.13) % 1; ctx.save(); ctx.globalAlpha = a * Math.sin(ph * PI); const [x, y] = globePt(W / 2, 560, R, lat, -60 + ph * 120, o); speedArrow(ctx, x - 60, y, 120, '', { col: CYAN, w: 7 }); ctx.restore(); }
    lowerThird(ctx, lt - 0.5, d - 0.3, 'ПОВЕРХНОСТЬ: 0 км/ч', 'а воздух продолжает лететь на восток');
    chapterCard(ctx, lt, d, 'ЧАСТЬ 2', 'АТМОСФЕРА');
  }

  // B — wind comparison chart
  function shotChart(ctx, lt, d, t) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#0c1a36'], [1, '#1b2f57']]); ctx.fillRect(0, 0, W, H);
    windStreaks(ctx, t, { n: 30, a: 0.12, speed: 2200, len: 300 });
    const rows = [['УРАГАН 1 КАТЕГОРИИ', 119, '#7fb3ff'], ['УРАГАН 5 КАТЕГОРИИ', 252, '#ffb347'], ['РЕКОРДНЫЙ ПОРЫВ', 408, '#ff7043'], ['ВЕТЕР ПОСЛЕ ОСТАНОВКИ', 1670, RED]];
    const x0 = 600, maxW = 960;
    rows.forEach(([name, v, col], i) => {
      const k = eOut(clamp((lt - 0.5 - i * 0.9) / 1.2)); if (k <= 0) return; const y = 260 + i * 170;
      label(ctx, name, x0 - 30, y, 40, { align: 'right' });
      ctx.fillStyle = col; rrect(ctx, x0, y - 40, Math.max(10, maxW * v / 1670 * k), 80, 14); ctx.fill();
      label(ctx, `${fmtNum(v * k)} км/ч`, x0 + Math.max(10, maxW * v / 1670 * k) + 20, y, 48, { align: 'left', col: '#fff' });
      if (i === 3 && k > 0.5) { const sh = Math.sin(t * 30) * 3; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; rrect(ctx, x0 - 6 + sh, y - 46, maxW * k + 12, 92, 18); ctx.stroke(); }
    });
    label(ctx, 'СКОРОСТЬ ВЕТРА У ЭКВАТОРА', W / 2, 110, 60, { col: YEL });
    label(ctx, 'оценка для мгновенной остановки', W / 2, 165, 30, { col: 'rgba(255,255,255,0.75)', stroke: false });
  }

  // C — city in a supersonic storm
  function shotCityStorm(ctx, lt, d, t) {
    const cam = { x: 3600 + lt * 70, y: 480, z: lerp(1.0, 1.15, lt / d), r: -0.03, shake: 14 };
    citySet(ctx, { t, cam, sky: 'storm', chaos: 1, ct: 2 + lt * 0.5, traffic: false, haze: 'rgba(60,64,80,0.25)', cloudCol: '#8d929c', midCol: '#5d6678', farCol: '#7a8292' });
    // horizontal rain
    windStreaks(ctx, t, { n: 140, a: 0.35, speed: 5200, len: 140, ang: 0.08, col: '200,215,235' });
    if ((t * 0.7) % 1 < 0.05) { ctx.fillStyle = 'rgba(220,230,255,0.35)'; ctx.fillRect(0, 0, W, H); }
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ГОРОДА', 'ветер сильнее любого урагана');
  }

  // D — forest flattened
  function shotForest(ctx, lt, d, t) {
    const cam = { x: lerp(800, 1150, lt / d), y: 560, z: 1.05, shake: 10 };
    sky(ctx, ['#3e4656', '#777d86', '#a89f8c']);
    withParallax(ctx, cam, 0.15, g => cloudLayer(g, t * 40, { seed: 4, n: 9, y0: 40, y1: 260, speed: 25, col: '#9a9ea6', stretch: 2.2 }), t);
    withParallax(ctx, cam, 0.35, g => { g.fillStyle = '#4c5e48'; g.beginPath(); g.moveTo(-600, 640); for (let x = -600; x < 2600; x += 60) g.lineTo(x, 600 - Math.sin(x / 210) * 50 - hash(x) * 25); g.lineTo(2600, 900); g.lineTo(-600, 900); g.fill(); }, t);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#5f7a3c'; ctx.fillRect(-500, 760, 3200, 500);
    for (let row = 0; row < 3; row++) for (let i = 0; i < 18; i++) {
      const x = -300 + i * 150 + row * 70 + hash(i + row * 50) * 60, y = 680 + row * 70, s = 0.9 + row * 0.25, r = hash(i * 3 + row);
      const snapped = r < 0.25 && lt > 1 + r * 8;
      if (snapped) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#5a3c26'; ctx.fillRect(-5 * s, -26 * s, 10 * s, 26 * s); ctx.restore(); continue; }
      drawTree(ctx, x, y, s, { t, seed: i + row * 20, bend: 1.1 + Math.sin(t * 13 + i) * 0.12, leafA: 1 - clamp(lt / d) * 0.8, col: ['#3f8f45', '#2f7a3a', '#4f9a40'][row] });
    }
    ctx.restore();
    debris(ctx, t, { n: 70, vx: 1700, vy: -60, size: 12, kinds: ['leaf', 'leaf', 'leaf', 'chunk'] });
    windStreaks(ctx, t, { n: 50, a: 0.3, speed: 3800 });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ЛЕСА', 'деревья не выдерживают нагрузки');
  }

  // E — open fields, farm, power lines
  function shotFields(ctx, lt, d, t) {
    const cam = { x: lerp(900, 1050, lt / d), y: 560, z: lerp(1.0, 1.1, lt / d), shake: 8 };
    sky(ctx, ['#5a6070', '#9c9a90', '#d2bb8e']);
    withParallax(ctx, cam, 0.12, g => cloudLayer(g, t * 50, { seed: 14, n: 9, y0: 40, y1: 300, speed: 30, col: '#b3aea4', stretch: 2.6 }), t);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#c9a34a'; ctx.fillRect(-500, 640, 3000, 600);
    ctx.strokeStyle = '#a8832e'; ctx.lineWidth = 3;
    for (let y = 650; y < 1100; y += 18) { ctx.beginPath(); for (let x = -500; x < 2500; x += 24) { const yy = y + Math.sin(x / 60 - t * 9 + y) * (4 + (y - 640) * 0.02); x === -500 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
    // power line towers swinging
    const pole = (x, i) => { const a = Math.sin(t * 5 + i) * 0.05 + 0.08; ctx.save(); ctx.translate(x, 700); ctx.rotate(a); ctx.strokeStyle = '#3a3d44'; ctx.lineWidth = 6; line(ctx, 0, 0, 0, -300); line(ctx, -60, -270, 60, -270); ctx.restore(); return [x + Math.sin(a) * 300, 700 - Math.cos(a) * 300 + 30]; };
    const tops = [-100, 500, 1100, 1700, 2300].map(pole);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 2; for (let k = 0; k < tops.length - 1; k++) { const [a, b] = [tops[k], tops[k + 1]]; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2 + Math.sin(t * 7 + k) * 60, a[1] + 60 + Math.sin(t * 9 + k) * 40, b[0], b[1]); ctx.stroke(); }
    if (Math.sin(t * 11) > 0.92) glow(ctx, tops[2][0], tops[2][1], 120, 'rgba(160,220,255,0.9)');
    // farmhouse losing its roof
    const roofOff = eIn(clamp((lt - 1.5) / 2.5));
    ctx.fillStyle = '#c0392b'; ctx.fillRect(1250, 560, 260, 160); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(1250, 560, 260, 160);
    ctx.fillStyle = '#5a3c26'; ctx.fillRect(1350, 640, 50, 80); ctx.fillStyle = '#9ad1ee'; ctx.fillRect(1280, 600, 45, 40); ctx.fillRect(1440, 600, 45, 40);
    ctx.save(); ctx.translate(1380 + roofOff * 900, 560 - roofOff * 400); ctx.rotate(roofOff * 3); ctx.fillStyle = '#6b4a3a'; poly(ctx, [[-150, 0], [150, 0], [0, -100]]); ctx.fill(); ctx.stroke(); ctx.restore();
    // rolling hay bales
    for (let i = 0; i < 4; i++) { const x = 200 + i * 300 + lt * lt * 60 + lt * 200, y = 820 + i * 40; ctx.save(); ctx.translate(x, y); ctx.rotate(x / 50); ctx.fillStyle = '#e0bf63'; circ(ctx, 0, 0, 50); ctx.fill(); ctx.strokeStyle = '#a8832e'; ctx.lineWidth = 3; ctx.stroke(); circ(ctx, 0, 0, 30); ctx.stroke(); ctx.restore(); }
    ctx.restore();
    dust(ctx, t, { n: 40, vx: 1400, a: 0.4, size: 140, y0: 400, y1: H, col: '#c8aa78' });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'РАВНИНЫ', 'ничто не сдерживает ветер');
  }

  // F — giant storm systems spinning up (top-down)
  function shotCyclone(ctx, lt, d, t) {
    ctx.fillStyle = '#123e6e'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); const z = lerp(0.9, 1.25, eIO(lt / d)); ctx.scale(z, z); ctx.rotate(-lt * 0.25);
    for (let arm = 0; arm < 4; arm++) for (let i = 0; i < 70; i++) {
      const u = i / 70, a = arm * PI / 2 + u * 7, r = 30 + u * 620; const x = Math.cos(a) * r, y = Math.sin(a) * r * 0.92, s = 30 + u * 90;
      ctx.fillStyle = radial(ctx, x, y, s, [[0, `rgba(245,248,255,${0.85 - u * 0.5})`], [1, 'rgba(245,248,255,0)']]); ctx.fillRect(x - s, y - s, 2 * s, 2 * s);
    }
    ctx.fillStyle = '#0d2f55'; circ(ctx, 0, 0, 34); ctx.fill();
    ctx.restore();
    // second, smaller cyclone
    ctx.save(); ctx.translate(320, 820); ctx.scale(0.35, 0.35); ctx.rotate(-lt * 0.6);
    for (let arm = 0; arm < 3; arm++) for (let i = 0; i < 40; i++) { const u = i / 40, a = arm * TAU / 3 + u * 6, r = 20 + u * 600; const x = Math.cos(a) * r, y = Math.sin(a) * r, s = 40 + u * 90; ctx.fillStyle = radial(ctx, x, y, s, [[0, `rgba(240,245,255,${0.8 - u * 0.5})`], [1, 'rgba(240,245,255,0)']]); ctx.fillRect(x - s, y - s, 2 * s, 2 * s); }
    ctx.restore();
    label(ctx, 'ГИГАНТСКИЕ ШТОРМОВЫЕ СИСТЕМЫ', W / 2, 100, 56, { col: YEL, alpha: sm(0.5, 1, lt) });
  }

  // G — mountains: snow ripped off the peaks
  function shotMountains(ctx, lt, d, t) {
    const cam = { x: lerp(900, 1100, lt / d), y: 540, z: lerp(1.05, 1.15, lt / d), shake: 6 };
    sky(ctx, ['#2d3c5c', '#6f86a8', '#c4cfdc']);
    const range = (p, seed, base, hgt, col, snow) => withParallax(ctx, cam, p, g => { const r = rng(seed); g.fillStyle = col; g.beginPath(); g.moveTo(-800, H + 200); const pk = []; for (let x = -800; x < 2800; x += 260) { const y = base - r() * hgt; pk.push([x + 130, y]); g.lineTo(x, base - r() * hgt * 0.3); g.lineTo(x + 130, y); } g.lineTo(2930, base); g.lineTo(2800, H + 200); g.fill(); if (snow) { g.fillStyle = '#f4f7fb'; for (const [x, y] of pk) { poly(g, [[x, y], [x + 45, y + 70], [x + 15, y + 60], [x - 10, y + 80], [x - 45, y + 70]]); g.fill(); } } return pk; }, t);
    range(0.2, 5, 720, 420, '#4a5a74', true);
    range(0.5, 6, 880, 380, '#2c3a4e', true);
    // snow plumes streaming off the ridges
    particles(t, { rate: 50, life: 1.6, seed: 9 }, (r, q) => { const x = r() * W - 200 + q * 900, y = 300 + r() * 300 - q * 60, s = 30 + q * 120; ctx.fillStyle = radial(ctx, x, y, s, [[0, `rgba(255,255,255,${0.55 * (1 - q)})`], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(x - s, y - s, 2 * s, 2 * s); });
    windStreaks(ctx, t, { n: 60, a: 0.35, speed: 4000 });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ГОРЫ', 'снег и камни срываются со склонов');
  }

  // H — globe wrapped in streamlines
  function shotStreams(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const R = 430, cx = W / 2, cy = 560, o = { rot: 2.4, cloudRot: 2.4 - lt * 0.3, lat0: 0.2, res: 2, night: 0.5, sun: [-0.4, -0.3, 0.86], storm: 1, t };
    drawGlobe(ctx, cx, cy, R, o);
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const lat = -60 + i * 8, ph = lt * 0.35 + i * 0.37;
      for (let s = 0; s < 3; s++) {
        const lon0 = ((ph + s / 3) % 1) * 300 - 150; ctx.beginPath(); let first = true;
        for (let k = 0; k < 18; k++) { const lon = lon0 + k * 3; const [x, y, z] = globePt(cx, cy, R * 1.06, lat + Math.sin(lon / 30 + i) * 3, lon, o); if (z < -0.05) { first = true; continue; } first ? ctx.moveTo(x, y) : ctx.lineTo(x, y); first = false; }
        ctx.strokeStyle = `rgba(120,220,255,${0.65 * Math.cos(lat * PI / 180)})`; ctx.lineWidth = 3; ctx.stroke();
      }
    }
    ctx.restore();
    label(ctx, 'ВСЯ АТМОСФЕРА В ДВИЖЕНИИ', W / 2, 90, 56, { col: CYAN, alpha: sm(0.5, 1, lt) });
  }

  // I — descend toward the ocean
  function shotDescend(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const k = eIn(clamp(lt / d)), R = lerp(430, 5200, k), cy = lerp(560, 560 + 4300 * 0.9, k);
    drawGlobe(ctx, W / 2, cy, R, { rot: 2.9, cloudRot: 2.9 - lt * 0.2, lat0: lerp(0.2, -0.1, k), res: lerp(2, 3, k), night: 0.3, sun: [-0.3, -0.5, 0.81], storm: 0.6, t });
    ctx.fillStyle = `rgba(30,90,150,${sm(0.7, 1, k)})`; ctx.fillRect(0, 0, W, H);
  }

  const SHOTS = [
    { d: 8.0, f: shotOrbitClouds },
    { d: 8.0, f: shotChart, tr: 'fade' },
    { d: 8.0, f: shotCityStorm, tr: 'flash' },
    { d: 8.0, f: shotForest, tr: 'whip' },
    { d: 8.0, f: shotFields, tr: 'whip' },
    { d: 8.0, f: shotCyclone, tr: 'fade' },
    { d: 8.0, f: shotMountains, tr: 'whip' },
    { d: 10.0, f: shotStreams, tr: 'fade' },
    { d: 9.0, f: shotDescend, tr: 'fade' },
  ];
  function cues(S) {
    const s = S.shots, c = [{ t: S.t0, music: 'catastrophe', fade: 1.5 }];
    c.push({ t: s[0], type: 'space', d: s[1] - s[0] + 0.5 }, { t: s[0], type: 'wind', d: s[1] - s[0], gain: 0.4 });
    for (let i = 0; i < 4; i++) c.push({ t: s[1] + 0.5 + i * 0.9, type: 'whoosh', d: 1.2, gain: 0.5 + i * 0.15 });
    c.push({ t: s[2], type: 'storm', d: s[7] - s[2], gain: 1.0 }, { t: s[2], type: 'hit' });
    c.push({ t: s[2] + 2, type: 'thud' }, { t: s[3], type: 'debris', d: 8, gain: 0.6 }, { t: s[3] + 3, type: 'thud', gain: 0.8 });
    c.push({ t: s[4] + 1.5, type: 'whoosh', d: 1.5 }, { t: s[4] + 4, type: 'screech', d: 0.8, f: 3200, gain: 0.4 });
    c.push({ t: s[5], type: 'rumble', d: 8 }, { t: s[6], type: 'wind', d: 8, gain: 0.9 });
    c.push({ t: s[7], type: 'space', d: s[8] - s[7] + 4 }, { t: s[8] + 2, type: 'riser', d: 0.1, gain: 0 }, { t: S.t0 + S.dur, type: 'whoosh_down', d: 2.5 });
    return c.filter(x => x.gain !== 0);
  }
  SCN[ID] = { design: 75, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
