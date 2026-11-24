// ===== Scene 9 — Первая неделя (9:00–10:15) =====
(() => {
  const ID = 's09';
  const dayBg = (ctx, cam, t, seed = 301, ruin = 1) => {
    sky(ctx, ['#4f86c6', '#93c0e6', '#e3e6dc']); withParallax(ctx, cam, 0.1, g => cloudLayer(g, t, { seed: 5, n: 6, y0: 60, y1: 260, speed: 12 }), t);
    withParallax(ctx, cam, 0.3, g => ruinSkyline(g, seed, -600, 2600, 640, ruin, t, { hmin: 160, hmax: 440, frac: 0.5, shake: 0, haze: '#93c0e6', hazeA: 0.4 }), t);
  };

  function shotCalendar(ctx, lt, d, t) { calendarFlip(ctx, lt, d, 1, 7, 'ДЕНЬ', 'ПЕРВАЯ НЕДЕЛЯ'); }

  // B — large-scale operation: helicopters, trucks, excavators
  function shotOperation(ctx, lt, d, t) {
    const cam = { x: 960 + lt * 25, y: 540, z: 1.0 };
    dayBg(ctx, cam, t);
    ctx.save(); applyCam(ctx, cam, t); campGround(ctx, 960, 640, t, { ground: '#8f8775' });
    ctx.fillStyle = '#7d7466'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(300 + i * 420, 700, 180, 70, 0, PI, 0); ctx.fill(); }
    drawService(ctx, 'excavator', 600, 760, 1.0, { t });
    drawService(ctx, 'excavator', 1500, 760, 0.9, { t: t + 2, dir: -1 });
    for (let i = 0; i < 3; i++) drawService(ctx, 'truck', -300 + ((lt * 160 + i * 500) % 2600), 930, 0.9, { t });
    ctx.restore();
    drawHeli(ctx, lerp(-200, 2100, lt / d), 200, 1.0, t, { col: '#2a7f62' });
    drawHeli(ctx, lerp(2200, 300, lt / d), 330, 0.7, t, { dir: -1, col: '#e04848' });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'СПАСАТЕЛЬНЫЕ ОПЕРАЦИИ', 'техника со всего мира');
    chapterCard(ctx, lt, d, 'ЧАСТЬ 6', 'ВОССТАНОВЛЕНИЕ');
  }
  // C — people unite: a human chain passing boxes
  function shotChain(ctx, lt, d, t) {
    const cam = { x: 960, y: 600, z: 1.15 };
    dayBg(ctx, cam, t, 311);
    ctx.save(); applyCam(ctx, cam, t); campGround(ctx, 960, 700, t);
    const n = 8;
    for (let i = 0; i < n; i++) {
      const x = 250 + i * 200, ph = (lt * 0.8 + i * 0.125) % 1, isAlex = i === 4;
      const ps = pose({ lean: 0.15, aF: lerp(0.4, 1.6, Math.sin(ph * PI)), eF: 0.6, aB: lerp(0.3, 1.4, Math.sin(ph * PI)), eB: 0.7 });
      const o = { pose: ps, dir: 1, t, seed: i, expr: isAlex ? 'smile' : ['determined', 'smile', 'focus'][i % 3] };
      if (isAlex) drawAlex(ctx, x, 860, 26, o); else drawStick(ctx, x, 860, 25, Object.assign(o, { outfit: randomOutfit(320 + i) }));
    }
    // boxes traveling along the chain
    for (let b = 0; b < 6; b++) { const p = ((lt * 0.18 + b / 6) % 1), x = lerp(200, 1800, p), y = 650 - Math.abs(Math.sin(p * n * PI)) * 40; ctx.fillStyle = '#c8955a'; ctx.fillRect(x - 30, y - 24, 60, 48); ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = 3; ctx.strokeRect(x - 30, y - 24, 60, 48); }
    ctx.restore();
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ЛЮДИ ОБЪЕДИНЯЮТСЯ', 'каждый помогает, чем может');
  }
  // D — aid point: food & water queue
  function shotAid(ctx, lt, d, t) {
    const cam = { x: 960 + lt * 15, y: 580, z: 1.1 };
    dayBg(ctx, cam, t, 321);
    ctx.save(); applyCam(ctx, cam, t); campGround(ctx, 960, 680, t);
    drawTent(ctx, 1400, 820, 1.6, { col: '#e9e4d8', cross: true, label: 'ПУНКТ ПОМОЩИ' });
    ctx.fillStyle = '#3d6e9e'; rrect(ctx, 1700, 660, 180, 160, 20); ctx.fill(); label(ctx, 'ВОДА', 1790, 740, 34, { col: '#fff', stroke: false });
    ctx.fillStyle = '#8a5a34'; ctx.fillRect(1100, 780, 260, 16); ctx.fillStyle = '#c8955a'; for (let i = 0; i < 4; i++) ctx.fillRect(1110 + i * 62, 740, 50, 40);
    drawStick(ctx, 1260, 860, 26, { pose: P.carry(0.2), dir: -1, t, seed: 2, outfit: DOCTOR, prop: 'box', expr: 'smile' });
    for (let i = 0; i < 7; i++) { const step = Math.floor(lt / 2.2) * 0.0, x = 1080 - i * 140 + ((lt * 30) % 140) * (i > 0 ? 1 : 0); drawStick(ctx, x, 870, i === 3 ? 13 : 24, { pose: P.stand(t, i), dir: 1, t, seed: 10 + i, outfit: randomOutfit(330 + i), expr: i === 0 ? 'relief' : 'neutral' }); }
    ctx.restore();
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ВРЕМЕННЫЕ ПУНКТЫ ПОМОЩИ', 'еда, вода, медикаменты');
  }
  // E — power restored to one block: lights blink on, people cheer
  function shotPower(ctx, lt, d, t) {
    const on = lt > 3.5;
    const cam = { x: 3400, y: 420, z: 0.95 };
    citySet(ctx, { t, cam, sky: 'dusk', ruin: 0.5, lit: on ? 0.9 : 0, lampOn: on ? 1 : 0, birds: false, haze: on ? null : 'rgba(10,10,30,0.25)', inWorld: g => {
      // utility pole with a worker
      g.strokeStyle = '#3a2a1a'; g.lineWidth = 14; line(g, 3000, ROAD + 160, 3000, ROAD - 360); g.lineWidth = 8; line(g, 2920, ROAD - 330, 3080, ROAD - 330);
      g.strokeStyle = '#111'; g.lineWidth = 3; g.beginPath(); g.moveTo(2600, ROAD - 300); g.quadraticCurveTo(2800, ROAD - 250, 2920, ROAD - 330); g.moveTo(3080, ROAD - 330); g.quadraticCurveTo(3300, ROAD - 250, 3600, ROAD - 300); g.stroke();
      drawStick(g, 3020, ROAD - 250, 18, { pose: P.hammer(t), dir: -1, t, seed: 1, outfit: RESCUER, prop: 'hammer', expr: 'focus' });
      if (lt > 3.3 && lt < 3.6) glow(g, 3000, ROAD - 330, 120, 'rgba(180,230,255,1)');
      for (let i = 0; i < 6; i++) drawStick(g, 3200 + i * 110, ROAD + 236, 22, { pose: on ? P.armsUp(t + i) : P.lookUp(t), dir: i % 2 ? 1 : -1, t, seed: 40 + i, outfit: randomOutfit(340 + i), expr: on ? 'happy' : 'worried' });
    } });
    if (on) stamp(ctx, 'СВЕТ ЕСТЬ!', W / 2, 130, lt - 3.6, 99, { size: 90, col: YEL });
  }
  // F — what recovery costs: resource bars
  function shotResources(ctx, lt, d, t) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#122040'], [1, '#1f3260']]); ctx.fillRect(0, 0, W, H);
    const rows = [['МАТЕРИАЛЫ', 0.92, '#ffb347'], ['ЭНЕРГИЯ', 0.8, YEL], ['ЛЮДИ И ТЕХНИКА', 0.86, CYAN], ['ВРЕМЯ', 1.0, RED]];
    rows.forEach(([name, v, col], i) => {
      const k = eOut(clamp((lt - 0.4 - i * 0.6) / 1.4)), y = 300 + i * 160;
      label(ctx, name, 640, y, 46, { align: 'right' });
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; rrect(ctx, 680, y - 34, 1000, 68, 14); ctx.fill();
      ctx.fillStyle = col; rrect(ctx, 680, y - 34, Math.max(12, 1000 * v * k), 68, 14); ctx.fill();
      if (i === 3 && k > 0.9) label(ctx, 'ГОДЫ', 1180, y, 44, { col: '#fff' });
    });
    label(ctx, 'ЦЕНА ВОССТАНОВЛЕНИЯ', W / 2, 140, 64, { col: YEL });
  }
  // G — building together (Alex hammering)
  function shotBuild(ctx, lt, d, t) {
    const cam = { x: 960, y: 600, z: lerp(1.15, 1.25, lt / d) };
    dayBg(ctx, cam, t, 331, 0.7);
    ctx.save(); applyCam(ctx, cam, t); campGround(ctx, 960, 700, t);
    towerCrane(ctx, 1600, 760, 1.1, t, 2);
    // timber frame going up
    const k = clamp(lt / d);
    ctx.strokeStyle = '#b07a44'; ctx.lineWidth = 16; for (let i = 0; i < 5; i++) line(ctx, 500 + i * 160, 840, 500 + i * 160, 840 - 360 * clamp(k * 1.6 - i * 0.12));
    if (k > 0.4) { ctx.lineWidth = 14; line(ctx, 480, 480 + 20, 480 + 680 * clamp((k - 0.4) * 2), 500); }
    drawAlex(ctx, 560, 880, 27, { pose: P.hammer(t), dir: 1, t, prop: 'hammer', expr: 'determined' });
    drawStick(ctx, 900, 880, 26, { pose: P.carry(lt), dir: -1, t, seed: 1, outfit: RESCUER, prop: 'box', expr: 'smile' });
    drawStick(ctx, 1180, 880, 16, { pose: P.wave(t), dir: -1, t, seed: 2, outfit: { shirt: '#f4d35e', hair: 'short' }, expr: 'happy' });
    ctx.restore();
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ВМЕСТЕ', 'восстанавливают дома');
  }
  // H — map: aid flows between continents
  function shotFlows(ctx, lt, d, t) {
    const cam = { x: 1800, y: 760, z: 0.6 };
    ctx.save(); applyCam(ctx, cam, t); worldMap(ctx);
    const routes = [['ЛОНДОН', 'ЛАГОС'], ['ПЕКИН', 'СИДНЕЙ'], ['НЬЮ-ЙОРК', 'РИО-ДЕ-ЖАНЕЙРО'], ['МОСКВА', 'МУМБАИ'], ['ТОКИО', 'СИНГАПУР'], ['МЕХИКО', 'ЛИМА'], ['ДУБАЙ', 'КАИР'], ['КЕЙПТАУН', 'МУМБАИ']];
    routes.forEach(([a, b], i) => {
      const k = clamp((lt - 0.3 - i * 0.35) / 1.6); if (k <= 0) return;
      const [x0, y0] = mapXY(...CITIES[a]), [x1, y1] = mapXY(...CITIES[b]); const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - Math.hypot(x1 - x0, y1 - y0) * 0.3;
      ctx.strokeStyle = GRN; ctx.lineWidth = 12; ctx.setLineDash([26, 16]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); ctx.moveTo(x0, y0);
      for (let q = 0; q <= k; q += 0.02) { const x = (1 - q) * (1 - q) * x0 + 2 * (1 - q) * q * mx + q * q * x1, y = (1 - q) * (1 - q) * y0 + 2 * (1 - q) * q * my + q * q * y1; ctx.lineTo(x, y); }
      ctx.stroke(); ctx.setLineDash([]);
      cityDot(ctx, a, t + i, { col: GRN, label: false }); if (k >= 1) cityDot(ctx, b, t + i, { col: GRN, label: false });
    });
    ctx.restore();
    label(ctx, 'ПОМОЩЬ ИДЁТ СО ВСЕГО МИРА', W / 2, 100, 56, { col: GRN, alpha: sm(0.5, 1, lt) });
  }
  // I — dusk: Alex looks at the first lit windows
  function shotDusk(ctx, lt, d, t) {
    const cam = { x: 3500, y: 560, z: lerp(1.6, 1.4, lt / d) };
    citySet(ctx, { t, cam, sky: 'dusk', ruin: 0.5, lit: 0.6, lampOn: 1, birds: false, inWorld: g => drawAlex(g, 3300, ROAD + 236, 28, { pose: P.lookUp(t), dir: 1, t, expr: lt > 2 ? 'smile' : 'awe', look: [0.4, -1] }) });
  }

  const SHOTS = [
    { d: 5.5, f: shotCalendar },
    { d: 9.5, f: shotOperation, tr: 'zoom' },
    { d: 8.0, f: shotChain, tr: 'whip' },
    { d: 8.0, f: shotAid, tr: 'whip' },
    { d: 9.0, f: shotPower, tr: 'fade' },
    { d: 8.0, f: shotResources, tr: 'fade' },
    { d: 9.0, f: shotBuild, tr: 'fade' },
    { d: 9.0, f: shotFlows, tr: 'fade' },
    { d: 9.0, f: shotDusk, tr: 'fade' },
  ];
  function cues(S) {
    const s = S.shots;
    return [
      { t: S.t0, music: 'emotional', fade: 1.5 },
      ...[0, 1, 2, 3, 4, 5].map(i => ({ t: s[0] + 0.5 + i * 0.75, type: 'tick', gain: 0.7 })), { t: s[1] - 0.3, type: 'whoosh', d: 0.8 },
      { t: s[1], type: 'engine', d: 9.5, gain: 0.9 }, { t: s[1], type: 'construction', d: 9.5, gain: 0.5 },
      { t: s[2], type: 'crowd', d: 16, gain: 0.5 }, { t: s[4], type: 'construction', d: 3.5, gain: 0.4 }, { t: s[4] + 3.4, type: 'hit', gain: 0.4 }, { t: s[4] + 3.6, type: 'crowd', d: 5, gain: 1.3 },
      ...[0, 1, 2, 3].map(i => ({ t: s[5] + 0.4 + i * 0.6, type: 'pop', gain: 0.6 })),
      { t: s[6], type: 'construction', d: 9, gain: 0.8 }, { t: s[7], type: 'whoosh', d: 2, gain: 0.3 }, { t: s[8], type: 'night', d: 9, gain: 0.6 },
    ];
  }
  SCN[ID] = { design: 75, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
