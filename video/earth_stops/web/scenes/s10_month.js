// ===== Scene 10 — Через один месяц (10:15–11:30) =====
(() => {
  const ID = 's10';
  function shotCalendar(ctx, lt, d, t) { calendarFlip(ctx, lt, d, 7, 30, 'ДЕНЬ', 'ПРОШЁЛ МЕСЯЦ'); }

  // B — split screen: recovering vs still struggling
  function shotSplit(ctx, lt, d, t) {
    const halves = [
      { x0: 0, title: 'ВОССТАНАВЛИВАЕТСЯ', col: GRN, cam: { x: 2500 + lt * 30, y: 480, z: 0.9 }, o: { sky: 'day', ruin: 0.25, lit: 0, nearWalkers: true } },
      { x0: W / 2, title: 'ВСЁ ЕЩЁ В РУИНАХ', col: RED, cam: { x: 5200 + lt * 20, y: 480, z: 0.9 }, o: { sky: ['#4a4a52', '#7d7a74', '#a8998a'], ruin: 1, birds: false } },
    ];
    for (const hlf of halves) {
      const B = borrow(), g = B.getContext('2d');
      citySet(g, Object.assign({ t, cam: hlf.cam }, hlf.o));
      if (hlf.x0 === 0) towerCrane(g, 700, 640, 0.9, t, 1);
      ctx.save(); ctx.beginPath(); ctx.rect(hlf.x0, 0, W / 2, H); ctx.clip(); ctx.drawImage(B, hlf.x0 - W / 4, 0); ctx.restore(); giveBack();
      label(ctx, hlf.title, hlf.x0 + W / 4, 110, 54, { col: hlf.col, alpha: sm(0.4, 0.9, lt) });
    }
    ctx.fillStyle = '#fff'; ctx.fillRect(W / 2 - 3, 0, 6, H);
    chapterCard(ctx, lt - 99, d, '', '');
  }
  // C — engineers rebuilding a bridge from blueprints
  function shotBridge(ctx, lt, d, t) {
    const cam = { x: 960, y: 540, z: 1.0 };
    sky(ctx, 'day'); cloudLayer(ctx, t, { seed: 61, n: 6, y0: 60, y1: 240, speed: 10 });
    ctx.save(); applyCam(ctx, cam, t);
    drawSea(ctx, t, 700, 1200, { c0: '#2d6fa8', c1: '#4a96c8' });
    const k = clamp(lt / d);
    ctx.save(); ctx.beginPath(); ctx.rect(-200, -200, 400 + 1900 * (0.45 + k * 0.4), 1500); ctx.clip(); drawBridge(ctx, -100, 2020, 560, { t, sway: 0, snap: 0 }); ctx.restore();
    towerCrane(ctx, 1700, 700, 1.0, t, 3);
    ctx.restore();
    // blueprint card
    ctx.save(); ctx.globalAlpha = sm(0.6, 1.0, lt); ctx.translate(1450, 820); ctx.rotate(-0.04); ctx.fillStyle = '#1d4f91'; rrect(ctx, -300, -150, 600, 300, 12); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
    for (let x = -280; x < 280; x += 40) line(ctx, x, -140, x, 140); for (let y = -140; y < 140; y += 40) line(ctx, -290, y, 290, y);
    ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-250, 60); ctx.quadraticCurveTo(0, -150, 250, 60); ctx.stroke(); line(ctx, -270, 60, 270, 60); ctx.restore();
    drawStick(ctx, 1080, 1000, 30, { pose: P.point(t), dir: 1, t, seed: 1, outfit: Object.assign({}, RESCUER, { shirt: '#2a9d8f', capCol: '#ffffff' }), expr: 'focus' });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ИНЖЕНЕРЫ', 'восстанавливают мосты и дороги');
  }
  // D — a rebuilt clinic with a calm queue
  function shotClinic(ctx, lt, d, t) {
    const cam = { x: 960 + lt * 15, y: 560, z: 1.1 };
    sky(ctx, 'day');
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#9c9686'; ctx.fillRect(-500, 760, 3000, 500);
    ctx.fillStyle = '#f2f4f6'; ctx.fillRect(900, 380, 760, 380); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(900, 380, 760, 380);
    ctx.fillStyle = '#9ad1ee'; for (let i = 0; i < 5; i++) ctx.fillRect(940 + i * 140, 430, 90, 90); ctx.fillStyle = '#5b4636'; ctx.fillRect(1230, 620, 110, 140);
    ctx.fillStyle = '#e53935'; ctx.fillRect(1250, 330, 60, 18); ctx.fillRect(1271, 309, 18, 60); label(ctx, 'КЛИНИКА', 1280, 580, 40, { col: '#e53935', stroke: false });
    drawStick(ctx, 1180, 830, 26, { pose: P.wave(t), dir: -1, t, seed: 1, outfit: DOCTOR, expr: 'smile' });
    for (let i = 0; i < 6; i++) drawStick(ctx, 1020 - i * 140, 840, i === 2 ? 14 : 24, { pose: P.stand(t, i), dir: 1, t, seed: 20 + i, outfit: randomOutfit(400 + i), expr: i === 0 ? 'smile' : 'neutral' });
    ctx.restore();
    lowerThird(ctx, lt - 0.2, d - 0.2, 'МЕДИЦИНА', 'клиники снова принимают людей');
  }
  // E — ordinary citizens: a tent school and a community garden
  function shotCommunity(ctx, lt, d, t) {
    const cam = { x: 960, y: 560, z: 1.05 };
    sky(ctx, 'day'); cloudLayer(ctx, t, { seed: 71, n: 6, y0: 60, y1: 240, speed: 10 });
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#7fa35a'; ctx.fillRect(-500, 720, 3000, 600);
    drawTent(ctx, 500, 820, 1.7, { col: '#f4d35e', label: 'ШКОЛА' });
    ctx.fillStyle = '#2d3440'; ctx.fillRect(330, 600, 160, 90); label(ctx, '2+2=4', 410, 645, 34, { col: '#fff', stroke: false });
    for (let i = 0; i < 4; i++) drawStick(ctx, 420 + i * 70, 890, 13, { pose: i === 1 ? P.wave(t) : P.sitGround(t), dir: -1, t, seed: 30 + i, outfit: randomOutfit(410 + i), expr: 'happy' });
    drawStick(ctx, 280, 880, 24, { pose: P.point(t), dir: 1, t, seed: 35, outfit: { shirt: '#8e5bd6', hair: 'bun', hairCol: '#3b2516', glasses: true }, expr: 'smile' });
    // garden rows
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const x = 1100 + i * 80, y = 820 + r * 60, g = clamp(lt / d + 0.3); ctx.fillStyle = '#5a3c26'; ctx.fillRect(x - 30, y, 60, 10); ctx.fillStyle = '#3f9b4a'; ell(ctx, x, y - 10 * g, 18 * g, 12 * g); ctx.fill(); }
    drawStick(ctx, 1500, 860, 25, { pose: P.dig(t), dir: -1, t, seed: 36, outfit: randomOutfit(420), prop: 'shovel', expr: 'smile' });
    ctx.restore();
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ОБЫЧНЫЕ ЛЮДИ', 'школы в палатках, общие огороды');
  }
  // F — the globe as a status map
  function shotGlobeStatus(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const o = { rot: 0.7 - lt * 0.05, lat0: 0.25, res: 2, night: 0.3, sun: [-0.4, -0.3, 0.86], cloudA: 0.4 };
    drawGlobe(ctx, W / 2 - 200, 560, 440, o);
    const pts = [[51, 0, GRN], [56, 38, YEL], [40, -74, GRN], [-23, -43, RED], [19, 73, YEL], [36, 140, GRN], [30, 31, YEL], [-34, 151, GRN], [6, 3, RED], [1, 104, RED], [-12, -77, YEL], [40, 116, GRN]];
    pts.forEach(([la, lo, col], i) => { const [x, y, z] = globePt(W / 2 - 200, 560, 440, la, lo, o); if (z < 0.05 || lt < 0.5 + i * 0.2) return; const p = (t * 1.1 + i * 0.3) % 1; ctx.strokeStyle = col; ctx.globalAlpha = (1 - p) * z; ctx.lineWidth = 3; circ(ctx, x, y, 8 + p * 30); ctx.stroke(); ctx.globalAlpha = z; ctx.fillStyle = col; circ(ctx, x, y, 9); ctx.fill(); ctx.globalAlpha = 1; });
    [['ВОССТАНАВЛИВАЮТСЯ', GRN], ['ЧАСТИЧНО', YEL], ['ДОЛГОСРОЧНЫЕ ПРОБЛЕМЫ', RED]].forEach(([n, c], i) => { const a = sm(1 + i * 0.4, 1.4 + i * 0.4, lt); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = c; circ(ctx, 1320, 400 + i * 110, 18); ctx.fill(); ctx.restore(); label(ctx, n, 1360, 400 + i * 110, 40, { align: 'left', alpha: a }); });
  }
  // G — coastal region still flooded, boats deliver supplies
  function shotBoats(ctx, lt, d, t) {
    const cam = { x: 4300 + lt * 30, y: 520, z: 1.0 };
    const lvl = ROAD + 40;
    citySet(ctx, { t, cam, sky: ['#6f8fb2', '#a9c2d8', '#d8d6cc'], ruin: 0.6, birds: true, walkers: false, inWorld: g => {
      g.fillStyle = 'rgba(70,115,150,0.88)'; g.beginPath(); g.moveTo(2500, H + 800); for (let x = 2500; x < 7000; x += 12) g.lineTo(x, lvl + Math.sin(x / 45 + t * 2) * 5); g.lineTo(7000, H + 800); g.fill();
      for (let i = 0; i < 3; i++) { const x = 3600 + i * 600 + lt * (60 + i * 15), y = lvl + 30 + Math.sin(t * 2 + i) * 5; g.save(); g.translate(x, y); g.rotate(Math.sin(t * 1.5 + i) * 0.04); g.fillStyle = ['#e67e22', '#ecf0f1', '#c0392b'][i]; poly(g, [[-90, -20], [90, -20], [70, 20], [-70, 20]]); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.fillStyle = '#c8955a'; g.fillRect(-40, -50, 50, 30); drawStick(g, 40, -20, 12, { pose: P.stand(t, i), dir: 1, t, seed: i, outfit: RESCUER, expr: 'determined' }); g.restore(); }
    } });
    lowerThird(ctx, lt - 0.2, d - 0.2, 'ПОБЕРЕЖЬЯ', 'вода уходит медленно, помощь везут на лодках');
  }
  // H — night: the city partially lit
  function shotNight(ctx, lt, d, t) {
    const cam = { x: 3000 + lt * 40, y: 380, z: 0.8 };
    citySet(ctx, { t, cam, sky: 'night', ruin: 0.4, lit: 0.35 + lt / d * 0.2, lampOn: 0.7, cloudA: 0.2, cloudCol: '#3a4260', midCol: '#1c2236', farCol: '#2a3148', haze: 'rgba(5,10,30,0.35)', birds: false });
    stars(ctx, 150, 22, t, 0.8, 0, 0, W, 380);
  }
  // I — Alex and neighbours plan the rebuild around a table
  function shotPlan(ctx, lt, d, t) {
    const cam = { x: 960, y: 600, z: lerp(1.25, 1.4, lt / d) };
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#e9e1cc'], [1, '#c8bb9c']]); ctx.fillRect(0, 0, W, H);
    ctx.save(); applyCam(ctx, cam, t);
    ctx.fillStyle = '#a69a80'; ctx.fillRect(-500, 840, 3000, 400);
    drawAlex(ctx, 760, 880, 28, { pose: P.point(t), dir: 1, t, expr: 'determined', talk: lt > 1 && lt < 4.5 });
    drawStick(ctx, 1180, 880, 27, { pose: P.think(t), dir: -1, t, seed: 3, outfit: randomOutfit(431), expr: 'focus' });
    drawStick(ctx, 1330, 880, 26, { pose: P.stand(t), dir: -1, t, seed: 4, outfit: RESCUER, expr: 'smile' });
    ctx.fillStyle = '#7a5230'; ctx.fillRect(820, 700, 330, 22); ctx.fillRect(840, 722, 14, 160); ctx.fillRect(1116, 722, 14, 160);
    ctx.fillStyle = '#f4f1ea'; ctx.fillRect(850, 680, 270, 24); ctx.strokeStyle = '#1d4f91'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) line(ctx, 870 + i * 60, 684, 900 + i * 60, 700);
    ctx.restore();
  }

  const SHOTS = [
    { d: 5.5, f: shotCalendar },
    { d: 10.0, f: shotSplit, tr: 'zoom' },
    { d: 8.0, f: shotBridge, tr: 'fade' },
    { d: 7.5, f: shotClinic, tr: 'whip' },
    { d: 8.0, f: shotCommunity, tr: 'whip' },
    { d: 9.0, f: shotGlobeStatus, tr: 'fade' },
    { d: 9.0, f: shotBoats, tr: 'fade' },
    { d: 8.0, f: shotNight, tr: 'fade' },
    { d: 10.0, f: shotPlan, tr: 'fade' },
  ];
  function cues(S) {
    const s = S.shots;
    return [
      { t: S.t0, music: 'emotional', fade: 1.5 },
      ...[0, 1, 2, 3, 4, 5].map(i => ({ t: s[0] + 0.5 + i * 0.75, type: 'tick', gain: 0.7 })), { t: s[1] - 0.3, type: 'whoosh', d: 0.8 },
      { t: s[1], type: 'city', d: 10, gain: 0.5 }, { t: s[2], type: 'construction', d: 8, gain: 0.6 }, { t: s[3], type: 'crowd', d: 15.5, gain: 0.4 },
      { t: s[5], type: 'space', d: 9 }, ...[0, 1, 2].map(i => ({ t: s[5] + 1 + i * 0.4, type: 'pop', gain: 0.5 })),
      { t: s[6], type: 'beach', d: 9, gain: 0.6 }, { t: s[6], type: 'engine', d: 9, gain: 0.4 }, { t: s[7], type: 'night', d: 8 }, { t: s[8], type: 'crowd', d: 10, gain: 0.3 },
    ];
  }
  SCN[ID] = { design: 75, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
