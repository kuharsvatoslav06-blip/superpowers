// ===== Scene 11 — Через один год (11:30–12:45) =====
(() => {
  const ID = 's11';

  // A — a year passes: seasons over the rebuilding street
  function shotSeasons(ctx, lt, d, t) {
    const k = clamp(lt / d), season = k * 4;            // 0 winter .. 4 next winter → autumn
    const leaf = season < 1 ? '#e8eef4' : season < 2 ? '#7fc35a' : season < 3 ? '#3f9b4a' : '#d9822b';
    const skyc = season < 1 ? 'grey' : season < 3 ? 'day' : ['#7a8aa8', '#c8b49a', '#f0cf9a'];
    citySet(ctx, { t, cam: { x: 2600, y: 420, z: 0.8 }, sky: skyc, sun: season >= 1 ? [1500, 200] : null, ruin: lerp(0.4, 0, k), nearWalkers: true, inWorld: g => { towerCrane(g, 2300, GY, 1.0, t, 1); towerCrane(g, 3100, GY, 0.9, t, 2); } });
    // seasonal particles
    if (season < 1) particles(t, { rate: 80, life: 4, seed: 3 }, (r, q) => { ctx.fillStyle = 'rgba(255,255,255,0.9)'; circ(ctx, r() * W + Math.sin(q * 6 + r() * 6) * 30, q * H, 3 + r() * 3); ctx.fill(); });
    if (season > 3) particles(t, { rate: 30, life: 4, seed: 4 }, (r, q) => { ctx.fillStyle = ['#d9822b', '#c0392b', '#f1c40f'][Math.floor(r() * 3)]; ctx.save(); ctx.translate(r() * W + q * 200, q * H); ctx.rotate(q * 10); ell(ctx, 0, 0, 9, 5); ctx.fill(); ctx.restore(); });
    const names = ['ЗИМА', 'ВЕСНА', 'ЛЕТО', 'ОСЕНЬ'];
    ctx.save(); ctx.fillStyle = 'rgba(8,10,20,0.7)'; rrect(ctx, 60, 50, 360, 120, 16); ctx.fill(); ctx.restore();
    label(ctx, names[Math.min(3, Math.floor(season))], 240, 95, 56, { col: leaf === '#e8eef4' ? '#bfe3ff' : leaf, stroke: false }); label(ctx, `МЕСЯЦ ${Math.max(1, Math.round(k * 12))}`, 240, 145, 28, { col: '#fff', stroke: false });
    chapterCard(ctx, lt, d, 'ЧАСТЬ 7', 'ЧЕРЕЗ ГОД');
  }
  // B — rebuilt district: fresh buildings, traffic, a tram
  function shotRebuilt(ctx, lt, d, t) {
    const cam = { x: 1600 + lt * 70, y: 500, z: lerp(1.05, 1.15, lt / d) };
    citySet(ctx, { t, cam, sky: 'day', sun: [1500, 180], nearWalkers: true, inWorld: g => {
      const x = 1200 + lt * 220; g.fillStyle = '#e04848'; rrect(g, x - 260, ROAD + 10, 520, 120, 18); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.fillStyle = '#bfe3f7'; for (let i = 0; i < 7; i++) { rrect(g, x - 240 + i * 70, ROAD + 28, 56, 50, 6); g.fill(); } g.strokeStyle = '#333'; g.lineWidth = 3; line(g, x, ROAD + 10, x - 40, ROAD - 60); line(g, -3000, ROAD - 60, 9000, ROAD - 60);
    } });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'НОВЫЕ КВАРТАЛЫ', 'город отстроен заново');
  }
  // C — normal life: café, kids playing in the park
  function shotNormal(ctx, lt, d, t) {
    const cam = { x: 960, y: 600, z: 1.1 };
    sky(ctx, 'day'); sun(ctx, 1600, 150, 44); cloudLayer(ctx, t, { seed: 81, n: 6, y0: 60, y1: 260, speed: 12 });
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#7fbf5a'; ctx.fillRect(-500, 760, 3000, 500);
    drawShopfront(ctx, 200, 760, 420, 420, 0, { t });
    for (const x of [300, 480]) { ctx.fillStyle = '#fff'; ell(ctx, x, 820, 50, 12); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 4; line(ctx, x, 820, x, 880); }
    drawStick(ctx, 250, 890, 22, { pose: P.sit(t), dir: 1, t, seed: 1, outfit: randomOutfit(501), prop: 'coffee', expr: 'smile' });
    drawStick(ctx, 540, 890, 22, { pose: P.sit(t), dir: -1, t, seed: 2, outfit: randomOutfit(502), expr: 'happy', talk: true });
    for (let i = 0; i < 4; i++) drawTree(ctx, 1000 + i * 260, 800, 1.3, { t, seed: i });
    const bx = lerp(1100, 1700, Math.abs(((lt * 0.4) % 2) - 1)), bh = Math.abs(Math.sin(lt * 3)) * 120;
    drawStick(ctx, 1050 + Math.sin(lt * 1.5) * 60, 900, 12, { pose: P.run(lt * 1.6), dir: 1, t, seed: 3, outfit: { shirt: '#f4d35e', hair: 'short' }, expr: 'happy' });
    drawStick(ctx, 1750 - Math.sin(lt * 1.3) * 60, 900, 12, { pose: P.run(lt * 1.5 + 0.5), dir: -1, t, seed: 4, outfit: { shirt: '#e86fa6', hair: 'pony', hairCol: '#6b4423' }, expr: 'happy' });
    ctx.fillStyle = '#ff5a4d'; circ(ctx, bx, 870 - bh, 14); ctx.fill();
    for (let i = 0; i < 3; i++) bird(ctx, wrap(300 + i * 200 + t * 50, -100, W + 100), 250 + Math.sin(t + i) * 20, 1.4, t, i);
    ctx.restore();
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ОБЫЧНАЯ ЖИЗНЬ', 'постепенно возвращается');
  }
  // D — infrastructure works: train runs, plane lands
  function shotInfra(ctx, lt, d, t) {
    sky(ctx, 'day'); cloudLayer(ctx, t, { seed: 91, n: 6, y0: 60, y1: 260, speed: 12 });
    skyline(ctx, 91, -800, 640, { width: 4000, hmin: 140, hmax: 400, col: '#a5b7cc' });
    ctx.fillStyle = '#8fae6a'; ctx.fillRect(0, 640, W, 500);
    const k = lt / d;
    drawPlane(ctx, lerp(300, 1500, k), lerp(200, 520, eOut(k)), 0.9, { t, tilt: 0.14 * (1 - k) });
    drawTrain(ctx, lerp(-1600, 400, k), 900, 6, { t });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ИНФРАСТРУКТУРА', 'поезда и самолёты снова в пути');
  }
  // E — changed forever: memorial park and an abandoned coastal zone
  function shotChanged(ctx, lt, d, t) {
    const cam = { x: 960 + lt * 20, y: 560, z: 1.0 };
    sky(ctx, ['#6f86a8', '#b9c4cf', '#e2d6bf']);
    ctx.save(); applyCam(ctx, cam, t);
    drawSea(ctx, t, 560, 1200, { c0: '#3d6f9a', c1: '#5a8fb8' });
    ctx.fillStyle = '#9c9686'; ctx.beginPath(); ctx.moveTo(-500, 700); ctx.lineTo(1100, 700); ctx.quadraticCurveTo(1200, 760, 1150, 1200); ctx.lineTo(-500, 1200); ctx.fill();
    // half-submerged old buildings offshore
    for (let i = 0; i < 4; i++) { drawBuilding(ctx, { x: 1300 + i * 170, w: 120, h: 220 + i * 40, col: '#8a8378', roof: 0, seed: 600 + i }, 700, { t, broken: 0.9, crumble: 0.3, cracks: 1 }); }
    ctx.fillStyle = 'rgba(61,111,154,0.85)'; ctx.fillRect(1180, 640, 1200, 600);
    // memorial
    ctx.fillStyle = '#d8d4cc'; poly(ctx, [[400, 700], [460, 700], [445, 380], [415, 380]]); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    label(ctx, '1 СЕКУНДА', 430, 600, 24, { col: '#555', stroke: false });
    for (let i = 0; i < 5; i++) { ctx.fillStyle = ['#e74c3c', '#f1c40f', '#ffffff', '#e86fa6', '#f39c12'][i]; circ(ctx, 380 + i * 22, 700, 9); ctx.fill(); }
    // fence
    ctx.strokeStyle = '#666'; ctx.lineWidth = 3; for (let x = 820; x < 1150; x += 30) line(ctx, x, 700, x, 640); line(ctx, 820, 655, 1150, 655); ctx.fillStyle = YEL; ctx.fillRect(940, 660, 90, 26); label(ctx, 'ЗАКРЫТО', 985, 673, 16, { col: '#222', stroke: false });
    drawStick(ctx, 520, 760, 24, { pose: P.stand(t), dir: -1, t, seed: 1, outfit: randomOutfit(601), expr: 'sad' });
    drawStick(ctx, 600, 760, 14, { pose: P.stand(t, 2), dir: -1, t, seed: 2, outfit: { shirt: '#f4d35e', hair: 'pony' }, expr: 'sad' });
    ctx.restore();
    lowerThird(ctx, lt - 0.2, d - 0.2, 'НЕКОТОРЫЕ МЕСТА', 'изменились навсегда');
  }
  // F — world montage of rebuilt cities (three panels)
  function shotMontage(ctx, lt, d, t) {
    ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, W, H);
    ['НЬЮ-ЙОРК', 'МОСКВА', 'СИДНЕЙ'].forEach((name, i) => {
      const x0 = i * W / 3, k = clamp((lt - i * 0.4) / 0.5);
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + 8, 8, W / 3 - 16, H - 16); ctx.clip(); ctx.globalAlpha = k;
      const B = borrow(), g = B.getContext('2d'); citySet(g, { t, cam: { x: 1500 + i * 1700 + lt * 40, y: 450, z: 0.9 }, sky: ['day', 'morning', ['#3f8fe0', '#8cc6f2', '#ffe9c8']][i], sun: [1500, 200], nearWalkers: true }); ctx.drawImage(B, x0 - W / 3, 0); giveBack();
      label(ctx, name, x0 + W / 6, 110, 52, { col: YEL });
      ctx.restore();
    });
  }
  // G — Alex on a rooftop at sunset, looking over the city
  function shotRoof(ctx, lt, d, t) {
    const cam = { x: lerp(1100, 960, eIO(lt / d)), y: 560, z: lerp(1.2, 1.0, eIO(lt / d)) };
    sky(ctx, 'dusk'); withParallax(ctx, cam, 0.05, g => sun(g, 1300, 620, 80, '#ffb070'), t);
    withParallax(ctx, cam, 0.12, g => cloudLayer(g, t, { seed: 4, n: 6, y0: 120, y1: 360, speed: 6, col: '#ffc8a8', shadow: '#c07890' }), t);
    withParallax(ctx, cam, 0.3, g => skyline(g, 11, -1600, 760, { width: 5200, hmin: 140, hmax: 380, col: '#6a5a8a', lit: 0.5 }), t);
    withParallax(ctx, cam, 0.55, g => skyline(g, 12, -2000, 860, { width: 6000, hmin: 200, hmax: 480, col: '#4a3f68', lit: 0.6 }), t);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#2e2838'; ctx.fillRect(-500, 880, 3000, 400); ctx.fillStyle = '#3c3448'; ctx.fillRect(-500, 860, 3000, 26);
    ctx.fillStyle = '#2a2433'; ctx.fillRect(300, 760, 120, 100); ctx.fillRect(1500, 720, 60, 140);
    drawAlex(ctx, 960, 862, 34, { pose: P.stand(t), dir: 1, t, expr: lt > 3 ? 'smile' : 'neutral', look: [0.8, -0.2] });
    ctx.restore();
    glow(ctx, 1300, 620, 900, 'rgba(255,170,90,0.18)');
  }
  // H — close on Alex, then pull back wide
  function shotClose(ctx, lt, d, t) {
    const k = eIO(clamp(lt / d));
    const cam = { x: lerp(980, 960, k), y: lerp(620, 560, k), z: lerp(3.2, 1.0, k) };
    sky(ctx, mixSky('dusk', ['#2b2f6e', '#8a4a7a', '#e0805a'], k)); withParallax(ctx, cam, 0.05, g => sun(g, 1300, lerp(620, 700, k), 80, '#ffb070', 1 - k * 0.5), t);
    withParallax(ctx, cam, 0.3, g => skyline(g, 11, -1600, 760, { width: 5200, hmin: 140, hmax: 380, col: '#6a5a8a', lit: 0.5 + k * 0.3 }), t);
    withParallax(ctx, cam, 0.55, g => skyline(g, 12, -2000, 860, { width: 6000, hmin: 200, hmax: 480, col: '#4a3f68', lit: 0.6 + k * 0.3 }), t);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#2e2838'; ctx.fillRect(-500, 880, 3000, 400); ctx.fillStyle = '#3c3448'; ctx.fillRect(-500, 860, 3000, 26);
    drawAlex(ctx, 960, 862, 34, { pose: P.stand(t), dir: 1, t, expr: lt < 2 ? 'neutral' : 'smile', look: [0.9, -0.2] });
    ctx.restore();
  }

  const SHOTS = [
    { d: 9.0, f: shotSeasons },
    { d: 8.0, f: shotRebuilt, tr: 'fade' },
    { d: 8.0, f: shotNormal, tr: 'whip' },
    { d: 8.0, f: shotInfra, tr: 'whip' },
    { d: 9.0, f: shotChanged, tr: 'fade' },
    { d: 7.0, f: shotMontage, tr: 'fade' },
    { d: 13.0, f: shotRoof, tr: 'fade' },
    { d: 13.0, f: shotClose, tr: 'cut' },
  ];
  function cues(S) {
    const s = S.shots;
    return [
      { t: S.t0, music: 'hope', fade: 2 },
      { t: s[0], type: 'wind', d: 9, gain: 0.25 }, { t: s[1], type: 'city', d: 16, gain: 0.7 }, { t: s[2] + 2, type: 'gull', gain: 0.3 },
      { t: s[3], type: 'jet', d: 8, gain: 0.5 }, { t: s[4], type: 'beach', d: 9, gain: 0.4 }, { t: s[5], type: 'city', d: 7, gain: 0.5 },
      { t: s[6], type: 'wind', d: 26, gain: 0.25 }, { t: s[6], type: 'city', d: 26, gain: 0.25 },
    ];
  }
  SCN[ID] = { design: 75, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
