// ===== Scene 1 — Обычный день (0:00–0:45) =====
(() => {
  const ID = 's01';
  const EQ = '1 670 км/ч';

  // A — wide city street, morning. Slow pan + speed badge.
  function shotCity(ctx, lt, d, t) {
    const cam = { x: lerp(700, 1250, lt / d), y: 520, z: lerp(1.0, 1.08, eIO(lt / d)) };
    citySet(ctx, { t, cam, sky: 'morning', sun: [1500, 210], nearWalkers: true });
    // speed badge synced with line 1
    const s = VO(ID, 1).start - SC0(ID) + 0.6, k = lt - s;
    if (k > 0) {
      const v = 1670 * eOut(clamp(k / 1.8));
      badge(ctx, 400, 190, k, 99, `${fmtNum(v)} км/ч`, 'СКОРОСТЬ ВРАЩЕНИЯ НА ЭКВАТОРЕ');
      // mini spinning globe icon
      ctx.save(); const a = clamp(k / 0.3); ctx.globalAlpha = a; drawGlobe(ctx, 700, 190, 62, { rot: -t * 1.2, lat0: 0.3, res: 1, night: 0, halo: 0.6 }); ctx.restore();
    }
  }

  // B — tracking shot on Alex walking with phone; "everything moves together" arrows
  function shotAlex(ctx, lt, d, t) {
    const ax = 1180 + lt * 95, ay = ROAD + 170 + 66;
    const cam = { x: ax + 140 - lt * 6, y: ay - 170, z: lerp(2.25, 2.1, lt / d) };
    const l2 = VO(ID, 2).start - SC0(ID) - 7.5, k2 = lt - l2;  // arrows appear with line 2
    const lookUp = sm(0.3, 0.8, k2) * (1 - sm(3.6, 4.2, k2));
    citySet(ctx, {
      t, cam, sky: 'morning', sun: [1500, 210], nearWalkers: false, inWorld: (g, L) => {
        // a few pedestrians walking the other way past Alex
        for (let i = 0; i < 4; i++) { const px = ax + 900 - lt * (170 + i * 25) - i * 420; drawStick(g, px, ay, 25, { pose: P.walk(lt * 1.3 + i * 0.3), dir: -1, t, seed: i + 50, outfit: randomOutfit(70 + i), expr: i === 1 ? 'smile' : 'neutral', prop: i === 2 ? 'coffee' : null }); }
        drawAlex(g, ax, ay, 26, { pose: lookUp > 0.5 ? mixPose(P.walkPhone(lt * 1.25), P.lookUp(t), lookUp) : P.walkPhone(lt * 1.25), dir: 1, t, prop: 'phone', expr: lookUp > 0.5 ? (k2 > 2.4 ? 'smile' : 'confused') : 'focus', look: lookUp > 0.5 ? [0.5, -1] : [0.4, 0.6] });
      }
    });
    // arrows: everything shares the same velocity
    if (k2 > 0) {
      const base = (x, y, i) => { const a = clamp((k2 - i * 0.35) / 0.3); speedArrow(ctx, x, y, 240 * eOut(a), EQ, { a, size: 44, w: 14 }); };
      base(900, 330, 0);          // Alex
      base(160, 560, 1);          // car / street
      base(1420, 200, 2);         // building
      const ga = clamp((k2 - 1.2) / 0.4); if (ga > 0) { ctx.save(); ctx.globalAlpha = ga; ctx.fillStyle = 'rgba(10,14,28,0.6)'; rrect(ctx, W / 2 - 460, 70 - 44, 920, 88, 14); ctx.fill(); label(ctx, 'ВСЁ ДВИЖЕТСЯ ВМЕСТЕ С ПЛАНЕТОЙ →', W / 2, 70, 46, { col: YEL, stroke: false }); ctx.restore(); }
    }
  }

  // C — beach life
  function shotBeach(ctx, lt, d, t) {
    const cam = { x: lerp(880, 1040, lt / d), y: lerp(700, 690, lt / d), z: lerp(1.55, 1.62, lt / d) };
    sky(ctx, 'day', 0, 480);
    withParallax(ctx, cam, 0.05, g => sun(g, 1500, 150, 50), t);
    withParallax(ctx, cam, 0.1, g => cloudLayer(g, t, { seed: 41, n: 6, y0: 60, y1: 260, w0: 180, w1: 380, speed: 10 }), t);
    ctx.save(); applyCam(ctx, cam, t);
    drawSea(ctx, t, 470, 760, { sunX: 1500 });
    // sailboat on horizon
    const bx = 400 + lt * 8; ctx.fillStyle = '#fff'; poly(ctx, [[bx, 462], [bx + 22, 410], [bx + 24, 462]]); ctx.fill(); ctx.fillStyle = '#555'; poly(ctx, [[bx - 12, 462], [bx + 36, 462], [bx + 28, 470], [bx - 6, 470]]); ctx.fill();
    drawShore(ctx, t, 740);
    // beach crowd
    drawPalm(ctx, 140, 900, 1.6, t, 1); drawPalm(ctx, 1800, 920, 1.5, t, 2);
    drawUmbrella(ctx, 560, 900, 1.2, ['#ff5a4d', '#fff']); drawUmbrella(ctx, 1320, 930, 1.1, ['#2a9df4', '#fff']);
    drawTowel(ctx, 470, 905, 170, '#f4a261'); drawStick(ctx, 560, 925, 15, { pose: P.lie(t), dir: 1, t, seed: 1, outfit: randomOutfit(3), expr: 'happy' });
    drawTowel(ctx, 1230, 940, 170, '#8e5bd6'); drawStick(ctx, 1300, 935, 15, { pose: P.sit(t), dir: -1, t, seed: 2, outfit: randomOutfit(9), expr: 'smile', prop: 'coffee' });
    drawStick(ctx, 1400, 942, 15, { pose: P.sit(t), dir: -1, t, seed: 4, outfit: { shirt: '#e86fa6', hair: 'pony', hairCol: '#6b4423' }, expr: 'smile' });
    // kid & dad playing ball
    const kx = 860 + Math.sin(lt * 1.2) * 90, ballP = (lt * 0.9) % 1, bxb = lerp(780, 1060, Math.abs(((lt * 0.45) % 2) - 1)), bh = Math.abs(Math.sin(lt * PI * 0.9)) * 160;
    drawStick(ctx, kx, 900, 11, { pose: P.run(lt * 1.6), dir: Math.cos(lt * 1.2) > 0 ? 1 : -1, t, seed: 5, outfit: { shirt: '#f4d35e', hair: 'short' }, expr: 'happy' });
    drawStick(ctx, 1110, 905, 17, { pose: P.wave(t), dir: -1, t, seed: 6, outfit: { shirt: '#2a9d8f', hair: 'cap', capCol: '#e2574c' }, expr: 'smile' });
    ctx.fillStyle = '#ff5a4d'; circ(ctx, bxb, 880 - bh, 12); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(bxb - 12, 876 - bh, 24, 5);
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ell(ctx, bxb, 900, 14 - bh * 0.04, 4); ctx.fill();
    // swimmers
    for (let i = 0; i < 3; i++) { const sx = 300 + i * 520 + Math.sin(t * 0.5 + i) * 20, sy = 640 + i * 18 + Math.sin(t * 1.6 + i) * 4; ctx.fillStyle = '#fff'; circ(ctx, sx, sy, 10); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ell(ctx, sx, sy + 9, 22, 4); ctx.fill(); }
    ctx.restore();
    withParallax(ctx, cam, 0.5, g => { for (let i = 0; i < 4; i++) bird(g, wrap(300 + i * 240 - t * 40, -100, W + 100), 300 + Math.sin(t * 0.8 + i * 2) * 40, 1.6, t, i); }, t);
  }

  // D — airliner above the clouds
  function shotPlane(ctx, lt, d, t) {
    sky(ctx, ['#1c4f9c', '#4f8fd6', '#a9d3f4']);
    sun(ctx, 300, 160, 38);
    cloudLayer(ctx, t, { seed: 51, n: 5, y0: 150, y1: 300, w0: 150, w1: 260, speed: -60, a: 0.8 });
    const px = lerp(780, 1100, eIO(lt / d)), py = 470 + Math.sin(lt * 1.4) * 10;
    contrail(ctx, px - 230, py - 8, 900, 1, 0.9);
    drawPlane(ctx, px, py, 1.25, { t, tilt: Math.sin(lt * 1.4) * 0.02 });
    // sea of clouds rushing by (parallax)
    for (let row = 0; row < 4; row++) cloudLayer(ctx, t, { seed: 60 + row, n: 7 + row * 2, y0: 820 + row * 70, y1: 860 + row * 80, w0: 220 + row * 90, w1: 380 + row * 130, speed: -(220 + row * 300), a: 1, x0: -800, x1: W + 800, col: mix('#c9dcf2', '#ffffff', row / 3), shadow: mix('#7f9dc6', '#aebfd8', row / 3), stretch: 1.6 });
    const k = lt - (VO(ID, 3).start - SC0(ID) - 21.5);
    if (k > 0) badge(ctx, 1520, 210, k, 99, '≈ 465 м', 'КАЖДУЮ СЕКУНДУ НА ЭКВАТОРЕ', { size: 76 });
  }

  // E — camera rises above the city into space
  function shotRise(ctx, lt, d, t) {
    const u = lt / d, alt = eIO(clamp(u * 1.05)) * 0.85 + clamp(u) * 0.15;            // 0 street .. 1 orbit
    const camY = lerp(520, -5200, alt), z = lerp(1, 0.75, alt);
    const skyC = alt < 0.5 ? mixSky('morning', ['#0b2f73', '#2b63b8', '#7fb3e6'], alt * 2) : mixSky(['#0b2f73', '#2b63b8', '#7fb3e6'], ['#000005', '#020818', '#0a2350'], (alt - 0.5) * 2);
    const cam = { x: 1250, y: lerp(520, -3600, alt), z: lerp(1.08, 0.42, sm(0, 0.6, alt)) };
    citySet(ctx, { t, cam, sky: skyC, sun: [1500, 210], sunA: 1 - alt, nearWalkers: true, birds: false, cloudA: 0.95 * (1 - sm(0.3, 0.5, alt)) });
    stars(ctx, 300, 9, t, sm(0.55, 0.9, alt));
    // cloud deck the camera flies through
    const cy = lerp(H + 500, -1100, sm(0.2, 0.6, alt));
    for (let row = 0; row < 5; row++) cloudLayer(ctx, t, { seed: 80 + row, n: 9, y0: cy + row * 150, y1: cy + row * 150 + 80, w0: 420, w1: 760, speed: 14, a: 0.97, x0: -900, x1: W + 900, stretch: 1.4 });
    // Earth's curved horizon appears
    const hk = sm(0.62, 1.0, alt);
    if (hk > 0) { ctx.save(); ctx.globalAlpha = hk; drawGlobe(ctx, W / 2, lerp(H + 5200, H + 1600, hk), lerp(5600, 2200, hk), { rot: 1.25 - t * 0.02, lat0: 0.5, res: 3, night: 0.6, sun: [0.5, -0.6, 0.62] }); ctx.restore(); }
  }

  // F — the spinning Earth, rotation arrows, "1 second" stamps, then the title slam
  function shotGlobe(ctx, lt, d, t) {
    spaceBg(ctx, t);
    const k = eIO(clamp(lt / 3.2)), R = lerp(2200, 430, k), cy = lerp(H + 1600 - 0, 560, k);
    const rot = 1.25 - t * 0.12, o = { rot, lat0: lerp(0.45, 0.16, k), res: 2, night: 0.7, sun: [-0.55, -0.4, 0.73], t };
    // title slam timing: right after line 6
    const titleT = VO(ID, 6).end - SC0(ID) - 34.5 + 0.25, tk = lt - titleT;
    ctx.save();
    if (tk > 0) { ctx.translate(W / 2, H / 2); const z = 1 + tk * 0.03; ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
    drawGlobe(ctx, W / 2, cy, R, o);
    // equator + rotation arrow
    const ea = sm(3.0, 3.8, lt) * (tk > 0 ? 0.0 : 1);
    if (ea > 0) {
      ctx.save(); ctx.globalAlpha = ea; ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(255,210,58,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); let first = true;
      for (let lon = -180; lon <= 180; lon += 3) { const [x, y, z] = globePt(W / 2, cy, R, 0, lon, o); if (z > 0) { first ? ctx.moveTo(x, y) : ctx.lineTo(x, y); first = false; } else first = true; }
      ctx.stroke(); ctx.setLineDash([]);
      // curved arrow in front of the globe
      ctx.strokeStyle = YEL; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(W / 2, cy + R * 0.05, R * 1.2, R * 0.28, 0, 0.35, PI - 0.35); ctx.stroke();
      const ax = W / 2 + Math.cos(0.35) * R * 1.2, ay = cy + R * 0.05 + Math.sin(0.35) * R * 0.28;
      ctx.fillStyle = YEL; ctx.save(); ctx.translate(ax, ay); ctx.rotate(-0.55); poly(ctx, [[20, 0], [-14, -16], [-14, 16]]); ctx.fill(); ctx.restore();
      label(ctx, EQ, W / 2 + R * 0.95, cy + R * 0.45, 44, { col: YEL });
      ctx.restore();
    }
    ctx.restore();
    // stamps synced to line 5 words
    const base = SC0(ID) + 34.5;
    const s1 = VOword(ID, 5, /минуту/) - base, s2 = VOword(ID, 5, /^час/) - base, s3 = VOword(ID, 5, /секунду/) - base;
    if (tk <= 0) {
      stamp(ctx, 'НЕ НА МИНУТУ', 420, 200, lt - s1 + 0.25, s3 - s1 + 2.6, { size: 70, rot: -0.04 });
      stamp(ctx, 'НЕ НА ЧАС', 1500, 200, lt - s2 + 0.25, s3 - s2 + 2.6, { size: 70, rot: 0.04 });
      stamp(ctx, '1 СЕКУНДА', W / 2, 140, lt - s3 + 0.1, 3.5, { size: 120, col: YEL });
    }
    // title slam
    if (tk > 0) {
      ctx.fillStyle = `rgba(0,0,0,${0.55 * clamp(tk / 0.2)})`; ctx.fillRect(0, 0, W, H);
      if (tk < 0.12) { ctx.fillStyle = `rgba(255,255,255,${1 - tk / 0.12})`; ctx.fillRect(0, 0, W, H); }
      const s = lerp(1.35, 1, eOut(clamp(tk / 0.35)));
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s, s);
      label(ctx, 'ЧТО, ЕСЛИ ЗЕМЛЯ', 0, -95, 120, { sw: 0.1 });
      label(ctx, 'ОСТАНОВИТСЯ', 0, 40, 150, { col: YEL, sw: 0.1 });
      label(ctx, 'НА 1 СЕКУНДУ?', 0, 170, 96, { sw: 0.1 });
      ctx.restore();
    }
  }

  const SHOTS = [
    { d: 7.5, f: shotCity },
    { d: 7.5, f: shotAlex, tr: 'fade', td: 0.6 },
    { d: 6.5, f: shotBeach, tr: 'whip' },
    { d: 6.5, f: shotPlane, tr: 'whip' },
    { d: 6.5, f: shotRise, tr: 'fade', td: 0.5 },
    { d: 10.5, f: shotGlobe, tr: 'fade', td: 0.8 },
  ];
  function cues(S) {
    const [city, alex, beach, plane, rise, globe] = S.shots, slam = VO(ID, 6).end + 0.25;
    return [
      { t: S.t0, music: 'calm', fade: 2.5 }, { t: rise, music: 'tension', fade: 2.5 }, { t: slam - 0.05, music: 'silence', fade: 0.05 },
      { t: city, type: 'city', d: beach - city + 0.4, gain: 0.9 },
      { t: VO(ID, 1).start + 0.6, type: 'pop' }, { t: alex + 1.5, type: 'notify', gain: 0.7 },
      { t: VO(ID, 2).start + 0.1, type: 'whoosh', d: 0.6, gain: 0.5 },
      { t: beach - 0.25, type: 'whoosh', d: 0.6 }, { t: beach, type: 'beach', d: plane - beach + 0.4 },
      { t: plane - 0.25, type: 'whoosh', d: 0.6 }, { t: plane, type: 'jet', d: rise - plane + 0.5, gain: 0.7 }, { t: VO(ID, 3).start + 0.4, type: 'pop' },
      { t: rise, type: 'wind', d: 5, gain: 0.5 }, { t: globe + 0.2, type: 'riser', d: 5.5, gain: 0.6 },
      { t: globe, type: 'space', d: slam - globe + 3 },
      { t: VOword(ID, 5, /минуту/) + 0.05, type: 'hit', gain: 0.45 }, { t: VOword(ID, 5, /^час/) + 0.05, type: 'hit', gain: 0.5 }, { t: VOword(ID, 5, /секунду/) + 0.05, type: 'hit', gain: 0.7 },
      { t: slam, type: 'reverse', d: 1.8 }, { t: slam, type: 'slam' }, { t: slam, type: 'sub', d: 2.2 },
    ];
  }
  SCN[ID] = { design: 45, shots: SHOTS.map(s => s.d), cues, draw: (ctx, lt, d, t, k) => seq(ctx, lt, t, SHOTS, k) };
})();
