// ===== Scene 8 — Первые 24 часа (7:45–9:00) =====
(() => {
  const ID = 's08';
  const RUIN = { ruin: 1, cloudCol: '#8f8c88', midCol: '#6f7178', farCol: '#8d8c8a', birds: false };

  // A — time-lapse: one day passes over the ruined city
  function shotTimelapse(ctx, lt, d, t) {
    const k = lt / d * 0.95;
    const cols = k < 0.25 ? mixSky('dusk', 'morning', k * 4) : k < 0.6 ? mixSky('morning', 'day', (k - 0.25) / 0.35) : k < 0.8 ? mixSky('day', 'dusk', (k - 0.6) / 0.2) : mixSky('dusk', 'night', (k - 0.8) / 0.2);
    const a = PI * (1 - clamp(k / 0.85));
    citySet(ctx, Object.assign({}, RUIN, { t: t * 6, cam: { x: 3000, y: 380, z: 0.72 }, sky: cols, sun: k < 0.85 ? [W / 2 + Math.cos(a) * 900, 760 - Math.sin(a) * 620] : null, haze: `rgba(5,10,30,${0.5 * sm(0.75, 0.95, k)})`, lampOn: 0 }));
    stars(ctx, 200, 4, t, sm(0.8, 0.95, k), 0, 0, W, 450);
    const hr = Math.floor(lerp(1, 24, k));
    ctx.save(); ctx.fillStyle = 'rgba(8,10,20,0.75)'; rrect(ctx, 60, 50, 330, 110, 16); ctx.fill(); ctx.restore();
    label(ctx, `ЧАС ${hr}`, 225, 95, 60, { col: YEL, stroke: false }); label(ctx, 'ПОСЛЕ СОБЫТИЯ', 225, 140, 24, { col: '#fff', stroke: false });
    chapterCard(ctx, lt, d, 'ЧАСТЬ 5', 'ПЕРВЫЕ СУТКИ');
  }
  // B — an aid camp goes up
  function shotCamp(ctx, lt, d, t) {
    const cam = { x: 960 + lt * 30, y: 560, z: 1.0 };
    sky(ctx, ['#5a6a82', '#9aa7b6', '#d6cbb4']);
    withParallax(ctx, cam, 0.3, g => ruinSkyline(g, 101, -600, 2600, 640, 1, t, { hmin: 160, hmax: 420, frac: 0.6, shake: 0, haze: '#9aa7b6', hazeA: 0.45 }), t);
    ctx.save(); applyCam(ctx, cam, t); campGround(ctx, 960, 640, t);
    const up = (i) => eBack(clamp((lt - 0.5 - i * 0.9) / 0.6));
    [[400, '#e9e4d8', true, 'ПОМОЩЬ'], [800, '#5c8a5a', false], [1200, '#e9e4d8', true], [1600, '#3d6e9e', false]].forEach(([x, col, cross, lb], i) => { const s = up(i); if (s <= 0) return; ctx.save(); ctx.translate(x, 700); ctx.scale(1, s); drawTent(ctx, 0, 0, 1.3, { col, cross, label: lb }); ctx.restore(); });
    drawStick(ctx, 600, 820, 26, { pose: P.hammer(t), dir: 1, t, seed: 1, outfit: RESCUER, prop: 'hammer', expr: 'determined' });
    drawStick(ctx, 1000 + lt * 30, 840, 26, { pose: P.carry(lt), dir: 1, t, seed: 2, outfit: randomOutfit(121), prop: 'box', expr: 'determined' });
    drawAlex(ctx, 1400 - lt * 20, 850, 28, { pose: P.carry(lt + 0.5), dir: -1, t, prop: 'box', expr: 'determined' });
    drawStick(ctx, 1750, 830, 25, { pose: P.point(t), dir: -1, t, seed: 3, outfit: RESCUER, expr: 'determined' });
    ctx.restore();
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ЛАГЕРЯ ПОМОЩИ', 'палатки, вода, первая помощь');
  }
  // C — rescuers inspect buildings, marking them
  function shotInspect(ctx, lt, d, t) {
    const cam = { x: 5300 + lt * 20, y: 560, z: 1.4 };
    citySet(ctx, Object.assign({}, RUIN, { t, cam, sky: ['#5a6070', '#8e8c84', '#b8ab92'], inWorld: g => {
      const y = ROAD + 236;
      // spray-painted inspection mark on a facade
      const q = clamp((lt - 1.5) / 1.2); g.save(); g.strokeStyle = '#ff5a1f'; g.lineWidth = 10; g.lineCap = 'round';
      if (q > 0) { line(g, 5150, 420, 5150 + 120 * clamp(q * 2), 420 + 120 * clamp(q * 2)); if (q > 0.5) line(g, 5270, 420, 5270 - 120 * clamp(q * 2 - 1), 420 + 120 * clamp(q * 2 - 1)); }
      g.restore(); if (q >= 1) label(g, 'ПРОВЕРЕНО', 5210, 380, 36, { col: '#ff5a1f' });
      drawStick(g, 5150, y, 27, { pose: P.point(t), dir: 1, t, seed: 4, outfit: RESCUER, prop: 'flashlight', expr: 'focus' });
      drawStick(g, 5420, y, 27, { pose: P.think(t), dir: -1, t, seed: 5, outfit: RESCUER, expr: 'focus' });
    } }));
    lowerThird(ctx, lt - 0.2, d - 0.2, 'СПАСАТЕЛИ', 'обследуют каждое здание');
  }
  // D — field hospital tent (no injuries shown, just care)
  function shotHospital(ctx, lt, d, t) {
    const cam = { x: 960, y: 560, z: lerp(1.0, 1.08, lt / d) };
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#e8e2d2'], [1, '#c9bfa6']]); ctx.fillRect(0, 0, W, H);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.strokeStyle = 'rgba(120,100,70,0.35)'; ctx.lineWidth = 4; for (let x = -200; x < 2200; x += 240) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + 120, 120, x + 240, 0); ctx.stroke(); }
    ctx.fillStyle = '#a69a80'; ctx.fillRect(-300, 820, 2600, 400);
    glow(ctx, 960, 120, 500, 'rgba(255,245,210,0.6)'); ctx.fillStyle = '#fff8d8'; circ(ctx, 960, 110, 22); ctx.fill();
    for (const x of [380, 960, 1540]) {
      ctx.fillStyle = '#8a9099'; ctx.fillRect(x - 170, 760, 8, 60); ctx.fillRect(x + 162, 760, 8, 60); ctx.fillStyle = '#f4f6f8'; rrect(ctx, x - 180, 730, 360, 40, 10); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#7fa8d1'; rrect(ctx, x - 100, 722, 250, 30, 12); ctx.fill();
      drawStick(ctx, x - 120, 730, 16, { pose: P.lie(t), dir: 1, t, seed: x, outfit: randomOutfit(x), expr: x === 960 ? 'smile' : 'sleep' });
      ctx.strokeStyle = '#8a9099'; ctx.lineWidth = 4; line(ctx, x + 210, 820, x + 210, 560); ctx.fillStyle = 'rgba(200,230,255,0.8)'; rrect(ctx, x + 190, 560, 40, 60, 8); ctx.fill();
    }
    drawStick(ctx, 1080, 830, 26, { pose: P.point(t), dir: -1, t, seed: 9, outfit: DOCTOR, expr: 'smile' });
    drawStick(ctx, 520, 830, 26, { pose: P.carry(lt), dir: -1, t, seed: 8, outfit: Object.assign({}, DOCTOR, { hair: 'bun', shirt: '#7fc8a9' }), prop: 'box', expr: 'determined' });
    ctx.restore();
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ВРАЧИ', 'полевые госпитали работают круглосуточно');
  }
  // E — people heading to shelter at dusk
  function shotShelter(ctx, lt, d, t) {
    const cam = { x: 960 + lt * 40, y: 540, z: 1.0 };
    sky(ctx, 'dusk'); sun(ctx, 1500, 700, 70, '#ffb070', 0.8);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#3a3550'; ctx.beginPath(); ctx.ellipse(1700, 760, 520, 220, 0, PI, 0); ctx.fill();   // stadium shelter
    ctx.fillStyle = '#ffd98a'; for (let i = 0; i < 9; i++) ctx.fillRect(1280 + i * 95, 640, 40, 14); label(ctx, 'УКРЫТИЕ', 1700, 600, 40, { col: '#ffd98a' });
    ctx.fillStyle = '#4a4258'; ctx.fillRect(-500, 760, 3000, 400);
    for (let i = 0; i < 12; i++) { const x = -100 + i * 120 + lt * 70 + (i % 3) * 20, y = 840 + (i % 2) * 30; drawStick(ctx, x, y, i % 4 === 0 ? 14 : 22, { pose: P.walk(lt * 1.1 + i * 0.3, 0.7), dir: 1, t, seed: i, outfit: randomOutfit(140 + i), expr: 'worried', prop: i % 3 === 0 ? 'brief' : null }); }
    ctx.restore();
    lowerThird(ctx, lt - 0.2, d - 0.2, 'БЕЗОПАСНЫЕ МЕСТА', 'люди ищут укрытие на ночь');
  }
  // F — the same night around the world (three panels)
  function shotWorld(ctx, lt, d, t) {
    ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, W, H);
    const names = ['ТОКИО', 'КАИР', 'ЛИМА'];
    names.forEach((name, i) => {
      const x0 = i * W / 3, k = clamp((lt - i * 0.4) / 0.5);
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + 8, 8, W / 3 - 16, H - 16); ctx.clip(); ctx.globalAlpha = k;
      ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#050a1e'], [1, '#283a6e']]); ctx.fillRect(x0, 0, W / 3, H);
      stars(ctx, 60, i + 5, t, 1, x0, 0, W / 3, 500);
      ctx.save(); ctx.translate(x0 + W / 6 - 960 * 0.6, 0); ctx.scale(0.6, 1); ruinSkyline(ctx, 200 + i, -200, 2100, 800, 1, t, { hmin: 200, hmax: 560, frac: 0.6, shake: 0, haze: '#0a1030', hazeA: 0.65 }); ctx.restore();
      ctx.fillStyle = '#141824'; ctx.fillRect(x0, 800, W / 3, 300);
      campfire(ctx, x0 + W / 6, 900, 0.9, t + i);
      for (let j = 0; j < 4; j++) drawStick(ctx, x0 + W / 6 - 180 + j * 120 + (j > 1 ? 60 : 0), 930, 17, { pose: P.sitGround(t), dir: j < 2 ? 1 : -1, t, seed: i * 4 + j, outfit: randomOutfit(160 + i * 4 + j), expr: 'sad' });
      label(ctx, name, x0 + W / 6, 110, 52, { col: YEL });
      ctx.restore();
    });
  }
  // G — night: Alex at a campfire with other survivors
  function shotFire(ctx, lt, d, t) {
    const cam = { x: 960, y: 640, z: lerp(1.35, 1.5, lt / d) };
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#040814'], [1, '#141b33']]); ctx.fillRect(0, 0, W, H); stars(ctx, 250, 8, t);
    ctx.save(); applyCam(ctx, cam, t);
    ruinSkyline(ctx, 211, -400, 2400, 760, 1, t, { hmin: 180, hmax: 500, frac: 0.6, shake: 0, haze: '#060a18', hazeA: 0.8 });
    ctx.fillStyle = '#1a1612'; ctx.fillRect(-500, 760, 3000, 500);
    campfire(ctx, 960, 880, 1.2, t);
    drawAlex(ctx, 760, 900, 26, { pose: P.sitGround(t), dir: 1, t, expr: lt > 4 ? 'smile' : 'sad', look: [0.6, 0.3] });
    drawStick(ctx, 1160, 900, 25, { pose: P.sitGround(t), dir: -1, t, seed: 3, outfit: randomOutfit(181), expr: 'sad' });
    drawStick(ctx, 600, 905, 18, { pose: P.sitGround(t), dir: 1, t, seed: 4, outfit: { shirt: '#f4d35e', hair: 'pony', hairCol: '#6b4423' }, expr: 'sleep' });
    drawStick(ctx, 1320, 895, 26, { pose: P.sitGround(t), dir: -1, t, seed: 5, outfit: RESCUER, expr: 'smile', talk: lt > 1 && lt < 4 });
    ctx.fillStyle = 'rgba(255,140,50,0.12)'; ctx.fillRect(-500, -500, 3000, 2000);
    ctx.restore();
  }
  // H — a generator lights a corner; a radio crackles
  function shotGenerator(ctx, lt, d, t) {
    const cam = { x: 960, y: 600, z: 1.2 };
    ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, W, H);
    const on = lt > 1.5, flick = on ? (lt < 2 ? (Math.sin(lt * 60) > 0 ? 1 : 0.2) : 1) : 0;
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#2a2a33'; ctx.fillRect(-500, 820, 3000, 500);
    glow(ctx, 1150, 520, 700, 'rgba(255,230,170,0.45)', flick);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 5; line(ctx, 1150, 820, 1150, 480); ctx.fillStyle = flick ? '#fff6d0' : '#444'; rrect(ctx, 1110, 460, 80, 30, 6); ctx.fill();
    ctx.fillStyle = '#d35400'; rrect(ctx, 700, 730, 200, 100, 10); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#333'; ctx.fillRect(720, 750, 60, 40);
    if (on) smoke(ctx, t, 880, 720, { h: 200, w: 20, col: '#666', a: 0.4, seed: 3 });
    ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(900, 800); ctx.quadraticCurveTo(1030, 850, 1150, 800); ctx.stroke();
    ctx.globalAlpha = 0.3 + 0.7 * flick;
    drawStick(ctx, 1300, 840, 26, { pose: P.stand(t), dir: -1, t, seed: 1, outfit: randomOutfit(191), prop: 'radio', expr: 'focus' });
    drawStick(ctx, 1480, 840, 25, { pose: P.stand(t, 2), dir: -1, t, seed: 2, outfit: randomOutfit(192), expr: 'worried' });
    drawAlex(ctx, 1040, 840, 27, { pose: P.stand(t, 3), dir: 1, t, expr: 'focus' });
    ctx.restore();
    if (on && lt > 2.5) { ctx.save(); ctx.globalAlpha = clamp((lt - 2.5) / 0.4); ctx.fillStyle = 'rgba(10,14,28,0.8)'; rrect(ctx, 1260, 200, 560, 120, 20); ctx.fill(); label(ctx, '«…пункты помощи открыты…»', 1540, 260, 36, { col: '#fff', stroke: false }); ctx.restore(); }
  }
  // I — dawn of day two over the tent camp
  function shotDawn(ctx, lt, d, t) {
    const k = lt / d;
    sky(ctx, mixSky('night', 'dusk', clamp(k * 1.5))); sun(ctx, 1400, lerp(900, 640, k), 70, '#ffc890', clamp(k * 2));
    ctx.save(); applyCam(ctx, { x: 960, y: 540, z: 1.0 }, t);
    ruinSkyline(ctx, 221, -400, 2400, 760, 1, t, { hmin: 180, hmax: 520, frac: 0.5, shake: 0, haze: '#3a3050', hazeA: 0.5 });
    ctx.fillStyle = '#3e3a44'; ctx.fillRect(-500, 760, 3000, 500);
    for (let i = 0; i < 6; i++) drawTent(ctx, 300 + i * 260, 860 + (i % 2) * 30, 0.9, { col: i % 2 ? '#e9e4d8' : '#5c8a5a', cross: i === 2 });
    ctx.restore();
    label(ctx, 'ДЕНЬ 2', W / 2, 120, 70, { col: YEL, alpha: sm(1.5, 2.2, lt) });
  }

  const SHOTS = [
    { d: 9.0, f: shotTimelapse },
    { d: 8.5, f: shotCamp, tr: 'fade' },
    { d: 7.5, f: shotInspect, tr: 'whip' },
    { d: 8.0, f: shotHospital, tr: 'whip' },
    { d: 8.0, f: shotShelter, tr: 'fade' },
    { d: 8.0, f: shotWorld, tr: 'fade' },
    { d: 9.0, f: shotFire, tr: 'fade' },
    { d: 8.0, f: shotGenerator, tr: 'fade' },
    { d: 9.0, f: shotDawn, tr: 'fade' },
  ];
  function cues(S) {
    const s = S.shots;
    return [
      { t: S.t0, music: 'emotional', fade: 2 },
      { t: s[0], type: 'wind', d: 9, gain: 0.25 }, ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ t: s[0] + 0.5 + i, type: 'tick', gain: 0.6 })),
      { t: s[1], type: 'construction', d: 8.5, gain: 0.6 }, ...[0, 1, 2, 3].map(i => ({ t: s[1] + 0.6 + i * 0.9, type: 'pop', gain: 0.6 })),
      { t: s[2], type: 'crowd', d: 7.5, gain: 0.4 }, { t: s[2] + 1.5, type: 'whoosh', d: 1, gain: 0.3 },
      { t: s[3], type: 'crowd', d: 8, gain: 0.3 }, { t: s[4], type: 'crowd', d: 8, gain: 0.6 }, { t: s[5], type: 'night', d: 8 }, { t: s[5], type: 'fire', d: 8, gain: 0.4 },
      { t: s[6], type: 'fire', d: 9, gain: 0.8 }, { t: s[6], type: 'night', d: 9 },
      { t: s[7] + 1.5, type: 'engine', d: 6.5, gain: 0.7 }, { t: s[7] + 2.5, type: 'radio', d: 5, gain: 1.2 },
      { t: s[8], type: 'wind', d: 9, gain: 0.2 }, { t: s[8] + 1.5, type: 'gull', gain: 0.4 },
    ];
  }
  SCN[ID] = { design: 75, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
