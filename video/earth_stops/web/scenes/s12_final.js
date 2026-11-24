// ===== Scene 12 — Финал (12:45–13:30) =====
(() => {
  const ID = 's12';

  // A — the Earth turning calmly
  function shotGlobe(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const R = lerp(400, 470, lt / d);
    drawGlobe(ctx, W / 2, 560, R, { rot: 0.9 - t * 0.04, lat0: 0.3, res: 2, night: 0.9, sun: [-0.6, -0.35, 0.72], t });
    glow(ctx, 250, 200, 400, 'rgba(255,240,200,0.12)');
  }
  // B — zoom down through the clouds to the city
  function shotDive(ctx, lt, d, t) {
    const k = eIn(clamp(lt / d));
    spaceBg(ctx, t, 1 - k);
    drawGlobe(ctx, W / 2, lerp(560, 560 + 5000, k), lerp(470, 5600, k), { rot: 0.9 - t * 0.04, lat0: lerp(0.3, 0.9, k), res: lerp(2, 3, k), night: 0.5, sun: [-0.6, -0.35, 0.72], t });
    const c = sm(0.6, 1, k);
    if (c > 0) { ctx.fillStyle = `rgba(190,220,250,${c})`; ctx.fillRect(0, 0, W, H); cloudLayer(ctx, t, { seed: 7, n: 10, y0: lerp(H, -300, c), y1: lerp(H + 400, 200, c), w0: 500, w1: 900, a: c }); }
  }
  // C — an ordinary morning again (rhymes with the opening)
  function shotMorning(ctx, lt, d, t) {
    const cam = { x: lerp(700, 1100, lt / d), y: 520, z: lerp(1.0, 1.06, eIO(lt / d)) };
    citySet(ctx, { t, cam, sky: 'morning', sun: [1500, 210], nearWalkers: true });
  }
  // D — Alex stops, looks up, puts the phone away and smiles
  function shotAlex(ctx, lt, d, t) {
    const stopT = 2.5, ax = 1180 + Math.min(lt, stopT) * 95, ay = ROAD + 236;
    const cam = { x: ax + 60, y: ay - 190, z: lerp(2.0, 2.4, eIO(lt / d)) };
    const up = sm(stopT, stopT + 0.8, lt), away = lt > stopT + 3;
    citySet(ctx, { t, cam, sky: 'morning', sun: [1500, 210], inWorld: g => {
      for (let i = 0; i < 3; i++) { const px = ax + 800 - lt * (160 + i * 30) - i * 420; drawStick(g, px, ay, 25, { pose: P.walk(lt * 1.3 + i * 0.3), dir: -1, t, seed: i + 70, outfit: randomOutfit(700 + i), expr: 'smile' }); }
      const ps = lt < stopT ? P.walkPhone(lt * 1.25) : away ? P.stand(t) : mixPose(P.phone(t), P.lookUp(t), up);
      drawAlex(g, ax, ay, 26, { pose: ps, dir: 1, t, prop: away ? null : 'phone', expr: lt < stopT ? 'focus' : lt < stopT + 1.5 ? 'awe' : 'smile', look: lt < stopT ? [0.4, 0.6] : [0.3, -0.8] });
    } });
  }
  // E — sunset over the horizon; title and fade
  function shotSunset(ctx, lt, d, t) {
    const k = lt / d;
    sky(ctx, mixSky('dusk', ['#151a3a', '#5a3060', '#c0604a'], k));
    sun(ctx, 960, lerp(640, 780, k), 90, '#ffb070', 1 - k * 0.6);
    cloudLayer(ctx, t, { seed: 9, n: 6, y0: 120, y1: 380, speed: 5, col: '#ffc8a8', shadow: '#b06a80' });
    skyline(ctx, 11, -1600, 800, { width: 5200, hmin: 140, hmax: 380, col: '#3a2f56', lit: 0.4 + k * 0.4 });
    skyline(ctx, 12, -2000, 900, { width: 6000, hmin: 200, hmax: 480, col: '#2a2240', lit: 0.5 + k * 0.4 });
    ctx.fillStyle = '#1e1830'; ctx.fillRect(0, 900, W, 200);
    for (let i = 0; i < 6; i++) walker(ctx, i, t, { y: 960, s: 14, seed: 90 });
    stars(ctx, 120, 33, t, sm(0.5, 1, k), 0, 0, W, 400);
    const a = sm(2.5, 3.5, lt) * (1 - sm(d - 2.5, d - 1.2, lt));
    label(ctx, 'ОДНА СЕКУНДА', W / 2, 330, 110, { col: '#fff', alpha: a, sw: 0.08 });
    label(ctx, 'может изменить всё', W / 2, 430, 46, { col: YEL, alpha: a, stroke: false });
  }

  const SHOTS = [
    { d: 9.0, f: shotGlobe },
    { d: 6.0, f: shotDive, tr: 'cut' },
    { d: 8.0, f: shotMorning, tr: 'fade', td: 0.8 },
    { d: 10.0, f: shotAlex, tr: 'fade' },
    { d: 12.0, f: shotSunset, tr: 'fade', td: 1.2 },
  ];
  function cues(S) {
    const s = S.shots;
    return [
      { t: S.t0, music: 'final', fade: 2.5 },
      { t: s[0], type: 'space', d: 15 }, { t: s[1] + 1, type: 'riser', d: 0.1, gain: 0 }, { t: s[2] - 0.5, type: 'whoosh_down', d: 1.5, gain: 0.5 },
      { t: s[2], type: 'city', d: 18, gain: 0.7 }, { t: s[3] + 2.6, type: 'notify', gain: 0.3 }, { t: s[4], type: 'wind', d: 12, gain: 0.2 },
    ].filter(x => x.gain !== 0);
  }
  SCN[ID] = { design: 45, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
