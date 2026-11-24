// ===== Scene 7 — Первые часы (6:30–7:45) =====
(() => {
  const ID = 's07';
  const ruinSky = ['#4a4a52', '#7d7a74', '#a8998a'];
  const RUIN = { sky: ruinSky, ruin: 1, cloudCol: '#8f8c88', midCol: '#6f7178', farCol: '#8d8c8a', birds: false };

  // A — Alex wakes: blinking POV, then sits up in the dust
  function shotWake(ctx, lt, d, t) {
    const cam = { x: 960, y: 760, z: lerp(1.6, 1.3, eIO(lt / d)) };
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#3a342e'], [1, '#5a4e42']]); ctx.fillRect(0, 0, W, H);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#6a6052'; ctx.fillRect(-500, 870, 3000, 400);
    for (let i = 0; i < 16; i++) { const r = rng(i + 9); ctx.fillStyle = ['#7a7062', '#5c544a', '#8a8070'][i % 3]; poly(ctx, [[r() * 2200 - 200, 875], [r() * 2200 - 100, 875 - 20 - r() * 70], [r() * 2200, 875]]); ctx.fill(); }
    const k = clamp((lt - 4.5) / 3);
    drawAlex(ctx, 960, 872, 30, { pose: k <= 0 ? P.lie(t) : mixPose(P.lie(t), P.sitGround(t), eIO(k)), dir: 1, t, expr: lt < 3.4 ? 'sleep' : 'dazed', look: [0.2, 0] });
    ctx.restore();
    dust(ctx, t, { n: 24, vx: 10, a: 0.35, size: 80, col: '#b0a490' });
    // blinking eyelids
    const eye = lt < 3.4 ? 0 : lt < 4.2 ? 0.5 + 0.5 * Math.sin((lt - 3.4) * 10) : lt < 4.8 ? 1 - clamp((lt - 4.4) * 6) * 0.6 : 1;
    const lid = (1 - clamp(eye)) * H / 2;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, lid); ctx.fillRect(0, H - lid, W, lid);
    if (lt < 6) { ctx.save(); ctx.globalAlpha = 0.5 * (1 - clamp((lt - 3.4) / 2.5)); ctx.filter = 'blur(8px)'; ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  // B — he stands and looks around the ruined street
  function shotLook(ctx, lt, d, t) {
    const cam = { x: 5200, y: 700, z: lerp(1.9, 1.6, eIO(lt / d)) };
    const k = clamp(lt / 1.8), dir = lt < 4 ? -1 : 1;
    citySet(ctx, Object.assign({ t, cam, inWorld: g => { smoke(g, t, 5600, GY - 200, { h: 600, w: 90, col: '#3a3a40', a: 0.5, seed: 2 }); fire(g, t, 5650, GY - 160, 1); drawAlex(g, 5200, ROAD + 236, 28, { pose: k < 1 ? P.getUp(eIO(k)) : P.stand(t), dir: k < 1 ? 1 : dir, t, expr: lt < 4 ? 'dazed' : 'worried', look: [dir * 0.8, 0] }); } }, RUIN));
    dust(ctx, t, { n: 30, vx: 25, a: 0.3, size: 90, col: '#b0a490' });
  }
  // C — walking through the empty street
  function shotWalk(ctx, lt, d, t) {
    const ax = 5300 + lt * 85, cam = { x: ax + 100, y: 640, z: 1.7 };
    citySet(ctx, Object.assign({ t, cam, inWorld: g => {
      drawCar(g, 5700, ROAD + 120, 0.8, { col: '#e74c3c', tilt: PI * 0.97 }); smoke(g, t, 5900, ROAD + 40, { h: 400, w: 60, col: '#333', a: 0.5, seed: 9 });
      drawAlex(g, ax, ROAD + 236, 28, { pose: P.walk(lt * 1.1, 0.7), dir: 1, t, expr: 'worried' });
    } }, RUIN));
    dust(ctx, t, { n: 30, vx: 25, a: 0.3, size: 90, col: '#b0a490' });
  }
  // D — other survivors; Alex helps someone up
  function shotSurvivors(ctx, lt, d, t) {
    const cam = { x: 6300, y: 640, z: 1.5 };
    const help = clamp((lt - 2) / 2.5);
    citySet(ctx, Object.assign({ t, cam, inWorld: g => {
      const y = ROAD + 236;
      drawStick(g, 6550, y, 26, { pose: P.getUp(eIO(help)), dir: -1, t, seed: 5, outfit: randomOutfit(81), expr: help > 0.8 ? 'relief' : 'dazed' });
      drawAlex(g, 6420, y, 28, { pose: help < 1 ? P.crouch(t) : P.hug(t), dir: 1, t, expr: 'worried' });
      drawStick(g, 5900, y - 10, 22, { pose: P.sitGround(t), dir: 1, t, seed: 6, outfit: randomOutfit(82), expr: 'sad' });
      drawStick(g, 6000 + lt * 20, y, 25, { pose: P.walk(lt, 0.5), dir: 1, t, seed: 7, outfit: randomOutfit(83), expr: 'scared', prop: 'flashlight' });
      drawStick(g, 6800, y, 25, { pose: P.wave(t), dir: -1, t, seed: 8, outfit: randomOutfit(84), expr: 'worried' });
    } }, RUIN));
    lowerThird(ctx, lt - 0.4, d - 0.2, 'ВЫЖИВШИЕ', 'люди выбираются из зданий');
  }
  // E — infrastructure down: icons crossed out as they are named
  function shotSystems(ctx, lt, d, t) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#1a1c24'], [1, '#2b2a30']]); ctx.fillRect(0, 0, W, H);
    const base = SC0(ID) + 34 - 1.5;
    const items = [[/Электричество/, 'ЭЛЕКТРИЧЕСТВО', 'bolt'], [/связь/, 'СВЯЗЬ', 'sig'], [/транспорт/, 'ТРАНСПОРТ', 'bus'], [/снабжения/, 'СНАБЖЕНИЕ', 'box']];
    items.forEach(([re, name, ic], i) => {
      const s0 = VOword(ID, 2, re) - base, k = lt - s0; const x = 300 + i * 440, y = 470;
      const a = clamp((k + 0.5) / 0.4); if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); const s = eBack(clamp((k + 0.5) / 0.4)); ctx.scale(s, s);
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; rrect(ctx, -170, -190, 340, 380, 30); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = YEL; ctx.strokeStyle = YEL; ctx.lineWidth = 14; ctx.lineCap = 'round';
      if (ic === 'bolt') { poly(ctx, [[20, -130], [-50, 10], [0, 10], [-20, 110], [60, -30], [10, -30]]); ctx.fill(); }
      if (ic === 'sig') { for (let j = 0; j < 4; j++) { ctx.fillRect(-75 + j * 40, 60 - j * 40, 26, 40 + j * 40); } }
      if (ic === 'bus') { drawCar(ctx, 0, 70, 0.6, { kind: 'bus', col: YEL }); }
      if (ic === 'box') { ctx.fillStyle = '#c8955a'; ctx.fillRect(-80, -70, 160, 130); ctx.strokeStyle = '#8a5a34'; ctx.lineWidth = 6; ctx.strokeRect(-80, -70, 160, 130); line(ctx, -80, -20, 80, -20); }
      label(ctx, name, 0, 150, 36, { col: '#fff' });
      if (k > 0.35) { const q = eOut(clamp((k - 0.35) / 0.25)); ctx.strokeStyle = RED; ctx.lineWidth = 18; line(ctx, -120, -120, -120 + 240 * q, -120 + 240 * q); if (q >= 1) line(ctx, 120, -120, 120 - 240 * clamp((k - 0.6) / 0.25), -120 + 240 * clamp((k - 0.6) / 0.25)); }
      ctx.restore();
    });
    label(ctx, 'СИСТЕМЫ ЖИЗНЕОБЕСПЕЧЕНИЯ', W / 2, 110, 54, { col: YEL, alpha: sm(0.2, 0.7, lt) });
  }
  // F — trying to reach family: no signal
  function shotCalls(ctx, lt, d, t) {
    const cam = { x: 6200, y: 640, z: 1.55 };
    citySet(ctx, Object.assign({ t, cam, inWorld: g => {
      const y = ROAD + 236;
      drawAlex(g, 6200, y, 28, { pose: P.phone(t), dir: 1, t, prop: 'phone', expr: lt > 3 ? 'sad' : 'worried', look: [0.4, 0.5] });
      drawStick(g, 5880, y, 25, { pose: P.phone(t, 2), dir: 1, t, seed: 3, outfit: randomOutfit(91), prop: 'phone', expr: 'worried' });
      drawStick(g, 6560, y, 24, { pose: P.think(t), dir: -1, t, seed: 4, outfit: { shirt: '#e86fa6', hair: 'long', hairCol: '#3b2516' }, expr: 'sad' });
    } }, RUIN));
    // phone screen overlay
    const a = clamp((lt - 0.8) / 0.4);
    if (a > 0) {
      ctx.save(); ctx.globalAlpha = a; ctx.translate(1500, 520); ctx.rotate(0.06);
      ctx.fillStyle = '#16161c'; rrect(ctx, -170, -320, 340, 640, 40); ctx.fill(); ctx.fillStyle = '#1f2a3a'; rrect(ctx, -150, -295, 300, 590, 26); ctx.fill();
      // crack
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-140, -200); ctx.lineTo(-40, -120); ctx.lineTo(-60, -40); ctx.lineTo(40, 20); ctx.lineTo(140, 10); ctx.stroke();
      label(ctx, 'МАМА', 0, -150, 50, { col: '#fff', stroke: false });
      label(ctx, lt < 3.5 ? 'Вызов' + '.'.repeat(1 + Math.floor(lt * 2) % 3) : 'НЕТ СЕТИ', 0, -90, 34, { col: lt < 3.5 ? '#aab' : RED, stroke: false });
      ctx.fillStyle = '#e53935'; circ(ctx, 0, 200, 46); ctx.fill(); ctx.restore();
    }
  }
  // G — emergency services arrive
  function shotServices(ctx, lt, d, t) {
    const cam = { x: 5600 + lt * 50, y: 560, z: 1.15 };
    citySet(ctx, Object.assign({ t, cam, inWorld: g => {
      const L1 = ROAD + 170 * 0.92;
      drawService(g, 'fire', lerp(4600, 5500, eOut(clamp(lt / 3))), L1, 1.0, { t });
      drawService(g, 'ambulance', lerp(7000, 6300, eOut(clamp((lt - 0.6) / 3))), L1, 0.95, { t, dir: -1 });
      // fire being fought
      fire(g, t, 5900, GY - 100, 1.4); smoke(g, t, 5900, GY - 140, { h: 600, w: 90, col: '#3a3a40', a: 0.5, seed: 3 });
      if (lt > 3) { for (let i = 0; i < 40; i++) { const q = ((t * 1.5 + i / 40) % 1); g.fillStyle = `rgba(190,225,255,${0.7 * (1 - q)})`; circ(g, lerp(5700, 5900, q), lerp(ROAD + 80, GY - 120, q) - Math.sin(q * PI) * 140, 6 + q * 6); g.fill(); } }
      drawStick(g, 5700, ROAD + 236, 25, { pose: P.point(t), dir: 1, t, seed: 4, outfit: FIREFIGHTER, expr: 'determined' });
      drawStick(g, 6150, ROAD + 236, 25, { pose: P.carry(lt), dir: -1, t, seed: 5, outfit: DOCTOR, expr: 'determined', prop: 'box' });
    } }, RUIN));
    lowerThird(ctx, lt - 0.3, d - 0.2, 'АВАРИЙНЫЕ СЛУЖБЫ', 'работают на пределе');
  }
  // H — rescuers searching the rubble with flashlights
  function shotSearch(ctx, lt, d, t) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#1e2128'], [1, '#3a352e']]); ctx.fillRect(0, 0, W, H);
    const cam = { x: 960 + lt * 20, y: 560, z: 1.05 };
    ctx.save(); applyCam(ctx, cam, t);
    ruinSkyline(ctx, 91, -300, 2300, 760, 1, t, { hmin: 250, hmax: 600, frac: 0.8, shake: 0, haze: '#20242c', hazeA: 0.5 });
    ctx.fillStyle = '#4a4238'; ctx.beginPath(); ctx.moveTo(-400, 1200); for (let x = -400; x < 2400; x += 60) ctx.lineTo(x, 820 - Math.abs(Math.sin(x / 260)) * 160 - hash(x) * 30); ctx.lineTo(2400, 1200); ctx.fill();
    const ppl = [[600, 700, 'dig', 1], [900, 690, 'flashlight', 1], [1250, 720, 'flashlight', -1], [1500, 760, 'dig', -1]];
    for (const [x, y, k, dir] of ppl) drawStick(ctx, x, y + 40, 24, { pose: k === 'dig' ? P.dig(t + x) : P.point(t), dir, t, seed: x, outfit: RESCUER, prop: k === 'dig' ? 'shovel' : 'flashlight', expr: 'determined' });
    ctx.restore();
    dust(ctx, t, { n: 30, vx: 15, a: 0.3, size: 80, col: '#8a8070' });
    lowerThird(ctx, lt - 0.3, d - 0.2, 'ПОИСКОВЫЕ ОТРЯДЫ', 'ищут выживших');
  }
  // I — dusk: helicopter with searchlight over the smoking city
  function shotHeli(ctx, lt, d, t) {
    const cam = { x: 7000 + lt * 60, y: 380, z: 0.75 };
    citySet(ctx, Object.assign({}, RUIN, { t, cam, sky: 'dusk', haze: 'rgba(40,20,30,0.3)', inWorld: g => { for (const x of [6600, 7300, 7900]) smoke(g, t, x, GY - 100, { h: 800, w: 100, col: '#2a2228', a: 0.55, seed: x }); } }));
    drawHeli(ctx, lerp(300, 1500, lt / d), 260 + Math.sin(t) * 12, 1.4, t, { beam: true });
  }

  const SHOTS = [
    { d: 10.0, f: shotWake },
    { d: 8.0, f: shotLook, tr: 'fade' },
    { d: 8.0, f: shotWalk, tr: 'cut' },
    { d: 8.0, f: shotSurvivors, tr: 'fade' },
    { d: 9.0, f: shotSystems, tr: 'fade' },
    { d: 8.0, f: shotCalls, tr: 'fade' },
    { d: 8.0, f: shotServices, tr: 'whip' },
    { d: 8.5, f: shotSearch, tr: 'fade' },
    { d: 7.5, f: shotHeli, tr: 'fade' },
  ];
  function cues(S) {
    const s = S.shots, c = [{ t: S.t0, music: 'aftermath', fade: 2 }];
    c.push({ t: s[0], type: 'tinnitus', d: 6 }, { t: s[0] + 3.4, type: 'heartbeat', d: 5, gain: 0.6 }, { t: s[0] + 2, type: 'wind', d: s[4] - s[0], gain: 0.25 });
    c.push({ t: s[1], type: 'fire', d: 16, gain: 0.5 }, { t: s[3], type: 'crowd', d: 8, gain: 0.6 });
    [/Электричество/, /связь/, /транспорт/, /снабжения/].forEach(re => { const w = VOword(ID, 2, re); c.push({ t: w - 0.5, type: 'pop' }, { t: w + 0.4, type: 'hit', gain: 0.35 }); });
    c.push({ t: s[5] + 1, type: 'radio', d: 3 }, { t: s[5] + 3.5, type: 'notify', gain: 0.5 });
    c.push({ t: s[6], type: 'siren', d: 8, gain: 1.2 }, { t: s[6], type: 'engine', d: 4 }, { t: s[6] + 3, type: 'storm', d: 5, gain: 0.2 });
    c.push({ t: s[7], type: 'construction', d: 8.5, gain: 0.6 }, { t: s[8], type: 'engine', d: 7.5, gain: 0.8 }, { t: s[8], type: 'wind', d: 7.5, gain: 0.3 });
    return c;
  }
  SCN[ID] = { design: 75, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
