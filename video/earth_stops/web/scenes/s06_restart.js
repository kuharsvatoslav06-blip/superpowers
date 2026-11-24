// ===== Scene 6 — Земля снова начинает вращаться (5:30–6:30) =====
(() => {
  const ID = 's06';

  // A — the second ends: timer hits 1,000 and the planet turns again
  function shotRestart(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const startT = 2.4, spin = lt < startT ? 0 : (lt - startT) * (lt - startT) * 0.04 + (lt - startT) * 0.05;
    const o = { rot: 3.4 - spin, cloudRot: 3.4 - spin - lt * 0.05, lat0: 0.15, res: 2, night: 0.6, sun: [-0.5, -0.35, 0.79], storm: 0.7, t };
    drawGlobe(ctx, W / 2, 560, 440, o);
    const v = Math.min(1, 0.95 + lt * 0.025);
    ctx.save(); ctx.fillStyle = 'rgba(8,10,20,0.75)'; rrect(ctx, W / 2 - 210, 60, 420, 120, 16); ctx.fill(); ctx.strokeStyle = lt > startT ? GRN : RED; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    label(ctx, `${(lt > startT ? 1 : v).toFixed(3).replace('.', ',')} с`, W / 2, 110, 70, { col: lt > startT ? GRN : '#fff', stroke: false });
    label(ctx, lt > startT ? 'ВРАЩЕНИЕ ВОЗОБНОВИЛОСЬ' : 'СЕКУНДА ИСТЕКАЕТ', W / 2, 160, 26, { col: lt > startT ? GRN : RED, stroke: false });
    if (lt > startT) { const a = clamp((lt - startT) / 0.6); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = GRN; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(W / 2, 580, 560, 130, 0, 0.3, PI - 0.3); ctx.stroke(); const ax = W / 2 + Math.cos(0.3) * 560, ay = 580 + Math.sin(0.3) * 130; ctx.fillStyle = GRN; ctx.translate(ax, ay); ctx.rotate(-0.6); poly(ctx, [[24, 0], [-16, -18], [-16, 18]]); ctx.fill(); ctx.restore(); }
    if (lt > startT && lt < startT + 0.15) { ctx.fillStyle = `rgba(255,255,255,${1 - (lt - startT) / 0.15})`; ctx.fillRect(0, 0, W, H); }
    chapterCard(ctx, lt - 0.3, d, 'ЧАСТЬ 4', 'ПОСЛЕ СЕКУНДЫ');
  }
  // B — not back to normal: storms everywhere, city lights winking out
  function shotStorms(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const o = { rot: 4.2 - lt * 0.04, cloudRot: 4.2 - lt * 0.09, lat0: 0.2, res: 2, night: lerp(1, 0.25, clamp(lt / d)), sun: [0.75, -0.2, 0.62], storm: 1, t, cloudA: 1 };
    drawGlobe(ctx, W / 2 - 150, 560, 500, o);
    for (let i = 0; i < 6; i++) { const lat = -50 + i * 20, lon = 60 + i * 23; const [x, y, z] = globePt(W / 2 - 150, 560, 500, lat, lon, o); if (z < 0.2) continue; ctx.save(); ctx.translate(x, y); ctx.rotate(-t * 2 - i); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 4; for (let a = 0; a < 2; a++) { ctx.beginPath(); for (let k = 0; k < 30; k++) { const r = 4 + k * 1.6, an = a * PI + k * 0.35; k ? ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r * z) : ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r * z); } ctx.stroke(); } ctx.restore(); }
    lowerThird(ctx, lt - 0.3, d - 0.2, 'ШТОРМЫ И БЛЭКАУТЫ', 'планета вращается, но последствия остаются');
  }
  // C — the ruined street, dust settling, silence
  function shotRuinStreet(ctx, lt, d, t) {
    const cam = { x: 5200 + lt * 40, y: 500, z: lerp(1.0, 1.08, lt / d) };
    citySet(ctx, { t, cam, sky: ['#4a4a52', '#7d7a74', '#a8998a'], ruin: 1, cloudCol: '#8f8c88', midCol: '#6f7178', farCol: '#8d8c8a', birds: false, inWorld: g => { smoke(g, t, 5600, GY - 200, { h: 600, w: 90, col: '#3a3a40', a: 0.6, seed: 2 }); fire(g, t, 5600, GY - 180, 1.2); smoke(g, t, 4700, GY - 300, { h: 500, w: 70, col: '#4a4a50', a: 0.5, seed: 5 }); } });
    dust(ctx, t, { n: 40, vx: 25, vy: 10, a: 0.35, size: 90, col: '#b0a490' });
    particles(t, { rate: 30, life: 6, seed: 4 }, (r, q) => { ctx.fillStyle = `rgba(230,220,200,${0.6 * Math.sin(q * PI)})`; circ(ctx, r() * W + q * 60, r() * H * 0.8 + q * 200, 2 + r() * 2); ctx.fill(); });
  }
  // D — damaged roads and highway
  function shotRoads(ctx, lt, d, t) {
    const cam = { x: lerp(800, 1100, lt / d), y: 560, z: 1.0 };
    sky(ctx, ['#4f5560', '#868680', '#b0a38c']);
    withParallax(ctx, cam, 0.2, g => skyline(g, 81, -800, 600, { width: 4000, hmin: 120, hmax: 300, col: '#8d8f94' }), t);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#7a7466'; ctx.fillRect(-500, 600, 3000, 600);
    // broken elevated highway
    ctx.fillStyle = '#9a9ca2'; for (const x of [0, 500, 1300, 1800]) ctx.fillRect(x, 470, 60, 260);
    ctx.fillStyle = '#7d8088'; ctx.fillRect(-200, 430, 960, 44); ctx.save(); ctx.translate(1120, 450); ctx.rotate(0.35); ctx.fillRect(-380, -20, 520, 44); ctx.restore(); ctx.fillRect(1260, 430, 900, 44);
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-200, 430, 960, 44); ctx.strokeRect(1260, 430, 900, 44);
    // cracked road surface with overturned cars
    ctx.fillStyle = '#4a4d55'; ctx.fillRect(-500, 800, 3000, 140);
    ctx.strokeStyle = '#1d1e22'; ctx.lineWidth = 5; const r = rng(3); for (let k = 0; k < 10; k++) { let x = r() * 2400 - 200, y = 800 + r() * 140; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 7; j++) { x += (r() - 0.3) * 70; y += (r() - 0.5) * 40; ctx.lineTo(x, Math.max(800, Math.min(940, y))); } ctx.stroke(); }
    drawCar(ctx, 500, 880, 0.9, { col: '#3498db', tilt: PI * 0.95, dir: 1 }); drawCar(ctx, 1250, 900, 0.9, { col: '#e67e22', tilt: -0.4, dir: -1 }); drawCar(ctx, 1700, 860, 0.8, { col: '#ecf0f1', tilt: 0.2, kind: 'van' });
    ctx.restore();
    dust(ctx, t, { n: 20, vx: 20, a: 0.25, size: 100, col: '#b0a490' });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ДОРОГИ', 'разорваны и завалены');
  }
  // E — landscapes changed: flooded lowlands, flattened forest, smoke
  function shotLandscape(ctx, lt, d, t) {
    const cam = { x: lerp(850, 1100, lt / d), y: 540, z: lerp(1.05, 1.0, lt / d) };
    sky(ctx, ['#545b66', '#8e8c84', '#b8ab92']);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#5a6a4a'; ctx.beginPath(); ctx.moveTo(-500, 620); for (let x = -500; x < 2500; x += 80) ctx.lineTo(x, 600 - Math.sin(x / 300) * 60); ctx.lineTo(2500, 1200); ctx.lineTo(-500, 1200); ctx.fill();
    // new lake where the sea surged inland
    ctx.fillStyle = 'rgba(70,120,160,0.9)'; ell(ctx, 1100, 800, 900, 130); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.15)'; for (let i = 0; i < 8; i++) ctx.fillRect(500 + i * 160 + Math.sin(t + i) * 20, 770 + (i % 3) * 25, 90, 3);
    for (let i = 0; i < 10; i++) drawTree(ctx, 700 + i * 90, 790 + (i % 2) * 20, 0.6, { t, seed: i, leafA: 0.6 });   // treetops poking out
    for (let i = 0; i < 12; i++) { ctx.save(); ctx.translate(-300 + i * 70, 700 + (i % 3) * 30); ctx.rotate(1.4); ctx.fillStyle = '#5a3c26'; ctx.fillRect(0, -6, 120, 12); ctx.restore(); }
    smoke(ctx, t, 1900, 600, { h: 700, w: 110, col: '#3a3a40', a: 0.6, seed: 8, drift: 200 });
    ctx.restore();
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ЛАНДШАФТ ИЗМЕНИЛСЯ', 'вода и ветер перекроили местность');
  }
  // F — night over the ruined city: blackout, only fires
  function shotNight(ctx, lt, d, t) {
    const cam = { x: 6000 + lt * 30, y: 450, z: 0.85 };
    citySet(ctx, { t, cam, sky: 'night', ruin: 1, lit: 0, cloudA: 0.25, cloudCol: '#3a4260', midCol: '#1c2236', farCol: '#2a3148', haze: 'rgba(5,10,30,0.45)', birds: false, inWorld: g => { for (const x of [5500, 6100, 6700]) { fire(g, t + x, x, GY + 30, 1.1); smoke(g, t, x, GY - 20, { h: 500, w: 70, col: '#222', a: 0.5, seed: x }); } } });
    stars(ctx, 200, 12, t, 0.9, 0, 0, W, 420);
  }
  // G — from orbit: before / after lights
  function shotLights(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const o = { rot: 4.9, lat0: 0.3, res: 2, sun: [0.9, -0.1, -0.4], cloudA: 0.3, ambient: 0.05 };
    const split = W / 2;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, split, H); ctx.clip(); drawGlobe(ctx, W / 2, 600, 480, Object.assign({}, o, { night: 1.3 })); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(split, 0, W - split, H); ctx.clip(); drawGlobe(ctx, W / 2, 600, 480, Object.assign({}, o, { night: 0.08 })); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.fillRect(split - 2, 0, 4, H);
    label(ctx, 'ДО', split - 300, 120, 70, { col: YEL }); label(ctx, 'ПОСЛЕ', split + 300, 120, 70, { col: RED });
  }
  // H — fade out on Alex's silhouette lying in the dust (leads into scene 7)
  function shotFadeOut(ctx, lt, d, t) {
    ctx.fillStyle = '#0d0d10'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 1 - sm(d - 2.5, d, lt);
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#2a2622'], [1, '#4a4238']]); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#5a5248'; for (let i = 0; i < 12; i++) { const r = rng(i); poly(ctx, [[r() * W, 860], [r() * W + 120, 860 - r() * 60], [r() * W + 220, 860]]); ctx.fill(); } ctx.fillRect(0, 860, W, 300);
    drawAlex(ctx, 960, 870, 30, { pose: P.lie(t), dir: 1, t, expr: 'sleep' });
    dust(ctx, t, { n: 20, vx: 10, a: 0.3, size: 90, col: '#9a8e7c' });
    ctx.restore();
  }

  const SHOTS = [
    { d: 8.0, f: shotRestart },
    { d: 8.0, f: shotStorms, tr: 'fade' },
    { d: 8.0, f: shotRuinStreet, tr: 'zoom' },
    { d: 7.0, f: shotRoads, tr: 'fade' },
    { d: 7.0, f: shotLandscape, tr: 'fade' },
    { d: 7.5, f: shotNight, tr: 'black' },
    { d: 7.5, f: shotLights, tr: 'fade' },
    { d: 7.0, f: shotFadeOut, tr: 'black' },
  ];
  function cues(S) {
    const s = S.shots;
    return [
      { t: S.t0, music: 'aftermath', fade: 2 },
      { t: s[0], type: 'space', d: s[2] - s[0] }, { t: s[0] + 2.4, type: 'hit', gain: 0.9 }, { t: s[0] + 2.4, type: 'sub', d: 3 }, { t: s[0] + 2.2, type: 'reverse', d: 1.5 },
      { t: s[1], type: 'storm', d: 8, gain: 0.35 },
      { t: s[2] - 0.4, type: 'whoosh_down', d: 1 }, { t: s[2], type: 'wind', d: s[5] - s[2], gain: 0.35 }, { t: s[2], type: 'fire', d: 8, gain: 0.8 },
      { t: s[3] + 2, type: 'thud', gain: 0.4 }, { t: s[5], type: 'night', d: 7.5 }, { t: s[5], type: 'fire', d: 7.5, gain: 0.6 },
      { t: s[6], type: 'space', d: 7.5 }, { t: s[6] + 0.5, type: 'pop' }, { t: s[6] + 0.9, type: 'pop' },
      { t: s[7], type: 'wind', d: 7, gain: 0.2 },
    ];
  }
  SCN[ID] = { design: 60, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
