// ===== «Паника: что происходит в теле за 10 минут» =====

// ---------- metro car ----------
function drawMetro(ctx, t, o = {}) {
  const dawn = o.dawn || 0;
  ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, mix('#2a3c7c', '#3d6a58', dawn)], [1, mix('#0c1534', '#10261c', dawn)]]); ctx.fillRect(0, 0, W, H);
  // ad strip
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 300, W, 150);
  const r = rng(5); for (let x = 20; x < W; x += 260) { ctx.fillStyle = ['#c8465a', '#3a8ad0', '#e0b040', '#6a5ad0'][Math.floor(r() * 4)]; ctx.globalAlpha = 0.55; rrect(ctx, x, 320, 230, 110, 8); ctx.fill(); ctx.globalAlpha = 1; }
  // windows
  for (const [x, w] of [[50, 440], [590, 440]]) {
    ctx.save(); rrect(ctx, x, 500, w, 430, 40); ctx.clip();
    if (dawn < 1) { ctx.fillStyle = '#04060f'; ctx.fillRect(x, 500, w, 430);
      for (let i = 0; i < 7; i++) { const yy = 540 + i * 58, sp = 900 + i * 130, xx = ((-(t * sp) + i * 377) % (w + 600) + w + 600) % (w + 600) + x - 300; ctx.fillStyle = `rgba(255,220,150,${0.5 * (1 - dawn)})`; ctx.fillRect(xx, yy, 260, 5); } }
    if (dawn > 0) { ctx.globalAlpha = dawn; ctx.fillStyle = linear(ctx, 0, 500, 0, 930, [[0, '#ffd99a'], [0.6, '#ff9a6a'], [1, '#3a7a5a']]); ctx.fillRect(x, 500, w, 430);
      glow(ctx, x + w * 0.6, 900, 220, 'rgba(255,245,200,0.9)'); ctx.fillStyle = '#1c3a2a'; const rr = rng(9); for (let xx = x - 40; xx < x + w; xx += 60) { const off = (t * 120) % 60; ctx.fillRect(xx - off, 930 - 80 - rr() * 140, 50, 200); } ctx.globalAlpha = 1; }
    ctx.restore();
    ctx.strokeStyle = '#8a9ac8'; ctx.lineWidth = 14; rrect(ctx, x, 500, w, 430, 40); ctx.stroke();
  }
  // seats + floor
  ctx.fillStyle = mix('#203a9a', '#2a6a5a', dawn); rrect(ctx, -20, 1330, W + 40, 120, 30); ctx.fill();
  ctx.fillStyle = mix('#18286a', '#1d4a3a', dawn); ctx.fillRect(-20, 1440, W + 40, 120);
  ctx.fillStyle = '#0a0f22'; ctx.fillRect(0, 1560, W, 400);
  // handrail + poles
  ctx.strokeStyle = '#e6c04a'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, 280); ctx.lineTo(W, 280); ctx.stroke();
  for (const x of [270, 810]) { ctx.beginPath(); ctx.moveTo(x, 280); ctx.lineTo(x, 1920); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x - 3, 280, 4, 1640); }
}
function sway(ctx, t, a = 1) { ctx.translate(540, 1920); ctx.rotate(Math.sin(t * 1.3) * 0.006 * a); ctx.translate(-540 + Math.sin(t * 0.9) * 6 * a, -1920 + Math.abs(Math.sin(t * 2.6)) * 3 * a); }
const CROWD = (() => { const r = rng(44), a = []; for (let i = 0; i < 14; i++) a.push({ x: -60 + r() * 1200, y: 1050 + r() * 260, s: 2.4 + r() * 1.4, c: ['#1c2440', '#2a1c34', '#13202e', '#2c2c3c', '#1a2a2a'][Math.floor(r() * 5)], hair: r() > 0.5 ? '#0c0c12' : '#2a1a12', long: r() > 0.7 }); return a.sort((p, q) => p.y - q.y); })();

// hook: calm hero in the metro
function pHook(ctx, lt, t) {
  ctx.save(); camera(ctx, lt, 1.0, 1.05, 4, 540, 1200); sway(ctx, t); drawMetro(ctx, t);
  ctx.translate(540, 1240); ctx.scale(0.88, 0.88);
  drawHero(ctx, { t, open: 0.85, look: { x: 0.3, y: 0.1 }, pupil: 15, mouth: 'flat', brow: 0.2, bags: 0.2, shirt: '#3a4a7a' });
  ctx.restore();
}
// 1. doors close, crowded car
function pDoors(ctx, lt, t) {
  ctx.save(); camera(ctx, lt, 1.0, 1.08, 5.5, 540, 1200); sway(ctx, t, 0.6); drawMetro(ctx, t);
  // doors in the middle
  const k = eOut(sm(0.2, 1.4, lt)), dw = 230;
  ctx.fillStyle = '#05070f'; ctx.fillRect(540 - dw * 1.05, 470, dw * 2.1, 1100);
  for (const s of [-1, 1]) { const x = 540 + s * lerp(dw * 2.1, 0, k) / 2; ctx.fillStyle = '#7a8ab8'; ctx.fillRect(s < 0 ? x - dw : x, 470, dw, 1100); ctx.fillStyle = 'rgba(10,15,40,0.8)'; rrect(ctx, (s < 0 ? x - dw : x) + 40, 560, dw - 80, 380, 20); ctx.fill();
    ctx.fillStyle = '#ff8a2a'; for (let j = 0; j < 3; j++) { ctx.beginPath(); const bx = (s < 0 ? x - 30 : x + 30), by = 1050 + j * 60; ctx.moveTo(bx, by); ctx.lineTo(bx - s * 30, by + 25); ctx.lineTo(bx, by + 50); ctx.lineTo(bx + s * 12, by + 50); ctx.lineTo(bx - s * 18, by + 25); ctx.lineTo(bx + s * 12, by); ctx.fill(); } }
  // crowd sliding in
  CROWD.forEach((p, i) => { const dx = (1 - eOut(sm(0.3 + i * 0.08, 1.6 + i * 0.08, lt))) * (p.x < 540 ? -400 : 400);
    drawPerson(ctx, p.x + dx, p.y, p.s, { body: p.c, head: shade('#c98f7a', -0.55), hair: p.hair, longHair: p.long }); });
  // hero among them, slightly tense
  ctx.save(); ctx.translate(540, 1420); ctx.scale(0.62, 0.62);
  drawHero(ctx, { t, open: 0.95, look: { x: -0.6 + Math.sin(t * 1.5) * 0.4, y: 0 }, pupil: 13, mouth: 'flat', brow: 0.5, bags: 0.3, shirt: '#3a4a7a' });
  ctx.restore(); ctx.restore();
}

// head with brain (profile facing left), coordinates of sThalamus
const AMY = [440, 585], HYPO = [505, 560], FRONT = [[250, 470], [270, 320], [380, 200], [450, 180], [450, 600], [320, 590]];
function drawHeadBrain(ctx, t, o = {}) {
  ctx.beginPath(); spline(ctx, PROFILE); ctx.fillStyle = o.skin || '#e8907e'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = '#fbe0d6'; ctx.beginPath(); spline(ctx, CORTEX.map(([x, y]) => [lerp(540, x, 1.07), lerp(420, y, 1.08)])); ctx.fill();
  drawBrainShape(ctx, t, { thal: o.thal ?? 0 });
  if (o.dimFront) { ctx.save(); ctx.beginPath(); spline(ctx, CORTEX); ctx.clip(); ctx.fillStyle = linear(ctx, 200, 0, 520, 0, [[0, `rgba(20,10,30,${0.75 * o.dimFront})`], [1, 'rgba(20,10,30,0)']]); ctx.fillRect(150, 100, 400, 600); ctx.restore(); }
  const a = o.amy ?? 1;
  if (a > 0) { glow(ctx, AMY[0], AMY[1], 120 + 60 * a, 'rgba(255,40,40,0.95)', a); ctx.fillStyle = mix('#ffb0a0', '#ff2020', a); ell(ctx, AMY[0], AMY[1], 30, 20, 0.5); ctx.fill(); ctx.strokeStyle = 'rgba(80,0,0,0.7)'; ctx.lineWidth = 4; ctx.stroke(); }
}
function tag(ctx, x0, y0, x1, y1, text, col = '#fff', a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.font = '700 38px Oswald'; const w = ctx.measureText(text).width + 34; const bx = x1 > x0 ? x1 : x1 - w;
  ctx.fillStyle = '#000'; rrect(ctx, bx, y1 - 30, w, 60, 6); ctx.fill(); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, bx + 17, y1 + 2); ctx.restore();
}
// 2. amygdala
function pAmygdala(ctx, lt, t) {
  bg(ctx, '#1f4fc0', '#040c30', 540, 900, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.1, 6.5, 500, 1000); ctx.translate(20, 470);
  const a = sm(0.8, 1.6, lt) * (0.75 + 0.25 * Math.sin(t * 8));
  drawHeadBrain(ctx, t, { amy: a });
  for (let kk = 0; kk < 3; kk++) { const p = ((lt * 0.9 + kk / 3) % 1); if (lt < 1.2) break; ctx.strokeStyle = `rgba(255,80,80,${0.7 * (1 - p)})`; ctx.lineWidth = 6; ell(ctx, AMY[0], AMY[1], 30 + p * 260, 20 + p * 200, 0.5); ctx.stroke(); }
  // "danger" eye icon from outside
  const ia = sm(0.2, 0.6, lt) * (1 - sm(1.6, 2.2, lt)); if (ia > 0) { ctx.save(); ctx.globalAlpha = ia; ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 6; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); ctx.moveTo(-40, 520); ctx.quadraticCurveTo(200, 560, AMY[0] - 30, AMY[1]); ctx.stroke(); ctx.restore(); }
  tag(ctx, AMY[0] + 20, AMY[1] + 20, 620, 1080, 'МИНДАЛИНА', '#ff6a6a', sm(1.0, 1.4, lt));
  ctx.restore();
}
// 3. hypothalamus -> sympathetic, pulse 72 -> 110
function pSymp(ctx, lt, t) {
  bg(ctx, '#2a3ab0', '#06082a', 540, 900, 1300);
  const fl = Math.max(0, Math.sin(lt * 9)) * (1 - sm(0, 2.5, lt)); if (fl > 0) { ctx.fillStyle = `rgba(255,30,40,${0.35 * fl})`; ctx.fillRect(0, 0, W, H); }
  ctx.save(); camera(ctx, lt, 1.05, 1.0, 6, 540, 900, lt < 2 ? 8 : 2, t); ctx.translate(40, 420); ctx.scale(0.92, 0.92);
  drawHeadBrain(ctx, t, { amy: 1 });
  const p = sm(0.4, 1.4, lt); ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(AMY[0], AMY[1]); ctx.lineTo(lerp(AMY[0], HYPO[0], p), lerp(AMY[1], HYPO[1], p)); ctx.stroke();
  if (p > 0.95) { glow(ctx, HYPO[0], HYPO[1], 90, 'rgba(255,220,80,0.9)', 0.9); ctx.fillStyle = '#ffd23a'; ell(ctx, HYPO[0], HYPO[1], 22, 16); ctx.fill(); }
  tag(ctx, HYPO[0], HYPO[1] - 10, 700, 470, 'ГИПОТАЛАМУС', '#ffd23a', sm(1.2, 1.6, lt));
  // sympathetic chain down the spinal cord
  const q = sm(1.6, 3.2, lt); if (q > 0) { ctx.strokeStyle = '#ff4a4a'; ctx.lineWidth = 14; ctx.shadowColor = '#ff2a2a'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(620, 640); ctx.lineTo(650, lerp(640, 1400, q)); ctx.stroke(); ctx.shadowBlur = 0;
    for (let i = 0; i < 8; i++) { const y = 700 + i * 90; if (y > lerp(640, 1400, q)) break; ctx.fillStyle = '#ffb04a'; ell(ctx, 630 + i * 3, y, 14, 14); ctx.fill(); ctx.strokeStyle = 'rgba(255,170,80,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(630 + i * 3, y); ctx.lineTo(760 + Math.sin(i) * 30, y + 40); ctx.stroke(); } }
  ctx.restore();
  const bpm = Math.round(bpmAt(t)); ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(0,0,0,0.55)'; rrect(ctx, 290, 1610, 500, 190, 30); ctx.fill();
  drawHeart(ctx, 390, 1705, 3.2 + beatPulse(t) * 1.2, '#ff2b3a'); ctx.font = '700 130px Oswald'; ctx.fillStyle = '#fff'; ctx.fillText(String(bpm), 600, 1708); ctx.restore();
}

// torso section helpers
function torso(ctx, col = '#f0b4a4') {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(140, 2000); ctx.bezierCurveTo(120, 1300, 150, 800, 280, 560); ctx.quadraticCurveTo(540, 470, 800, 560); ctx.bezierCurveTo(930, 800, 960, 1300, 940, 2000); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 8; ctx.stroke();
}
// 4. adrenals
function pAdrenal(ctx, lt, t) {
  bg(ctx, '#c01020', '#2a0006', 540, 1100, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.1, 5.5, 540, 1150); torso(ctx);
  // spine
  for (let y = 620; y < 1950; y += 70) { ctx.fillStyle = '#f6efe2'; rrect(ctx, 505, y, 70, 56, 12); ctx.fill(); }
  // vessels
  ctx.fillStyle = '#d0202a'; rrect(ctx, 590, 560, 46, 1400, 23); ctx.fill(); ctx.fillStyle = '#3a5ad0'; rrect(ctx, 440, 560, 46, 1400, 23); ctx.fill();
  const flow = (t * 300) % 80; ctx.fillStyle = 'rgba(255,200,200,0.5)'; for (let y = 560 + flow; y < 1960; y += 80) { ell(ctx, 613, y, 10, 16); ctx.fill(); }
  // kidneys + adrenals
  for (const s of [-1, 1]) { const kx = 540 + s * 230, ky = 1260;
    ctx.fillStyle = '#a8343a'; ctx.beginPath(); ctx.ellipse(kx, ky, 105, 165, s * 0.15, 0, 7); ctx.fill(); ctx.fillStyle = '#c84a50'; ctx.beginPath(); ctx.ellipse(kx + s * 15, ky, 70, 125, s * 0.15, 0, 7); ctx.fill();
    ctx.fillStyle = '#f2e0c8'; ell(ctx, kx - s * 70, ky + 10, 34, 50); ctx.fill();
    const g = 0.5 + 0.5 * Math.sin(t * 10); glow(ctx, kx, ky - 175, 140, 'rgba(255,220,60,1)', sm(0.4, 1, lt) * (0.6 + 0.4 * g));
    ctx.fillStyle = '#ffc02a'; ctx.beginPath(); ctx.moveTo(kx - 80, ky - 140); ctx.quadraticCurveTo(kx, ky - 250, kx + 80, ky - 140); ctx.quadraticCurveTo(kx, ky - 165, kx - 80, ky - 140); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.stroke();
    // sparks to aorta
    const r = rng(s > 0 ? 3 : 4); for (let i = 0; i < 22; i++) { const ph = ((lt * 0.8 + r()) % 1); if (lt < 0.6) break; const sx = kx + (r() - 0.5) * 100, sy = ky - 190, ex = 613, ey = 700 + r() * 1100;
      const x = lerp(sx, ex, ph) + Math.sin(ph * 9 + i) * 20, y = lerp(sy, ey, ph) - Math.sin(ph * Math.PI) * 120; glow(ctx, x, y, 24, 'rgba(255,230,80,1)', 1 - ph * 0.6); ctx.fillStyle = '#fff6b0'; ell(ctx, x, y, 5, 5); ctx.fill(); } }
  tag(ctx, 330, 1090, 380, 840, 'НАДПОЧЕЧНИКИ', '#ffd23a', sm(0.8, 1.2, lt));
  ctx.restore();
}
// 5. heart + lungs
function pHeartLungs(ctx, lt, t) {
  bg(ctx, '#d01828', '#300008', 540, 1100, 1300);
  ctx.save(); camera(ctx, lt, 1.05, 1.0, 6, 540, 1150); torso(ctx, '#f4bcac');
  const br = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * lerp(0.4, 0.9, sm(0, 4, lt))), ls = 1 + 0.1 * br;
  // trachea
  ctx.strokeStyle = '#f2d6c8'; ctx.lineWidth = 46; ctx.beginPath(); ctx.moveTo(540, 520); ctx.lineTo(540, 860); ctx.moveTo(540, 860); ctx.lineTo(430, 960); ctx.moveTo(540, 860); ctx.lineTo(650, 960); ctx.stroke();
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(540 + s * 190, 1150); ctx.scale(ls, ls);
    ctx.fillStyle = radial(ctx, 0, 0, 300, [[0, '#ffb6c0'], [1, '#d0606e']]); ctx.beginPath(); ctx.moveTo(s * -40, -300); ctx.bezierCurveTo(s * 180, -300, s * 230, 100, s * 200, 300); ctx.quadraticCurveTo(s * 40, 360, s * -70, 260); ctx.quadraticCurveTo(s * -40, 0, s * -40, -300); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = 'rgba(160,40,60,0.5)'; ctx.lineWidth = 4; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(s * -30, -150 + i * 50); ctx.quadraticCurveTo(s * 60, -100 + i * 60, s * (120 + i * 10), -60 + i * 70); ctx.stroke(); }
    ctx.restore(); }
  // heart
  const hp = beatPulse(t); ctx.save(); ctx.translate(560, 1260); ctx.scale(1 + hp * 0.16, 1 + hp * 0.16);
  glow(ctx, 0, 0, 260, 'rgba(255,40,40,0.8)', hp);
  ctx.fillStyle = '#c0182a'; ctx.beginPath(); ctx.moveTo(0, 200); ctx.bezierCurveTo(-230, 40, -170, -170, -40, -130); ctx.quadraticCurveTo(0, -120, 20, -90); ctx.bezierCurveTo(140, -200, 260, -40, 0, 200); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#3a5ad0'; rrect(ctx, -60, -220, 40, 120, 20); ctx.fill(); ctx.fillStyle = '#e02a3a'; rrect(ctx, 0, -240, 46, 140, 23); ctx.fill();
  ctx.restore();
  // air arrows
  ctx.globalAlpha = br; ctx.fillStyle = '#e8f6ff'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + s * 90, 600); ctx.lineTo(540 + s * 130, 660); ctx.lineTo(540 + s * 50, 660); ctx.fill(); } ctx.globalAlpha = 1;
  ctx.restore();
  const bpm = Math.round(bpmAt(t)); ctx.save(); ctx.textAlign = 'center'; ctx.font = '700 120px Oswald'; ctx.lineWidth = 14; ctx.strokeStyle = '#000'; ctx.strokeText(`${bpm}`, 540, 1780); ctx.fillStyle = '#fff'; ctx.fillText(`${bpm}`, 540, 1780); ctx.font = '700 40px Oswald'; ctx.fillStyle = '#ffd23a'; ctx.fillText('УДАРОВ В МИНУТУ', 540, 1840); ctx.restore();
}
// hand for numbness scene / chest
function hand(ctx, x, y, s, rot, blue, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const sk = mix('#d29a82', '#6a7ad8', blue * 0.6);
  ctx.fillStyle = sk; rrect(ctx, -90, -40, 180, 200, 60); ctx.fill(); ctx.fillRect(-60, 140, 120, 200);
  const fx = [[-70, -150, 36, 140], [-25, -190, 38, 180], [22, -180, 38, 170], [66, -140, 34, 130]];
  for (const [fx0, fy, fw, fh] of fx) { ctx.fillStyle = linear(ctx, 0, fy, 0, fy + fh, [[0, mix(sk, '#3a4ad0', blue)], [0.6, sk], [1, sk]]); rrect(ctx, fx0 - fw / 2, fy, fw, fh + 40, fw / 2); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.stroke(); }
  ctx.save(); ctx.translate(-110, 30); ctx.rotate(-0.7); ctx.fillStyle = linear(ctx, 0, -110, 0, 0, [[0, mix(sk, '#3a4ad0', blue)], [1, sk]]); rrect(ctx, -20, -120, 40, 140, 20); ctx.fill(); ctx.stroke(); ctx.restore();
  // tingling
  if (blue > 0.2) { const r = rng(7); for (let i = 0; i < 16; i++) { const px = (r() - 0.5) * 220, py = -200 + r() * 150, a = 0.5 + 0.5 * Math.sin(t * 12 + i * 2); ctx.fillStyle = `rgba(200,230,255,${a * blue})`; ell(ctx, px, py, 5, 5); ctx.fill(); } }
  ctx.restore();
}
// 6. dizziness + numb hands
function pDizzy(ctx, lt, t) {
  bg(ctx, '#b0102a', '#22000a', 540, 1000, 1300);
  const sp = sm(0.5, 4, lt);
  ctx.save(); camera(ctx, lt, 1.0, 1.1, 6.5, 540, 1100);
  ctx.translate(540, 1080); ctx.rotate(Math.sin(t * 1.6) * 0.05 * sp); ctx.translate(-540, -1080);
  for (const [dx, a] of [[-18 * sp, 0.35 * sp], [18 * sp, 0.35 * sp], [0, 1]]) { ctx.save(); ctx.globalAlpha = a; ctx.translate(540 + dx * Math.sin(t * 2), 1100); ctx.scale(0.78, 0.78);
    drawHero(ctx, { t, open: 0.8, look: { x: Math.sin(t * 3) * 0.6, y: -0.3 }, pupil: 10, mouth: 'scared', brow: 0.9, bags: 0.6, red: 0.4, sweat: 0.8, skin: mix('#d29a82', '#b8a0b8', sp * 0.5) }); ctx.restore(); }
  // swirl around head
  for (let i = 0; i < 6; i++) { const a = t * 3 + i / 6 * Math.PI * 2; const x = 540 + Math.cos(a) * 300, y = 760 + Math.sin(a) * 70; ctx.globalAlpha = sp * (0.5 + 0.5 * Math.sin(a)); ctx.fillStyle = '#fff4a0'; ctx.font = '700 60px Oswald'; ctx.textAlign = 'center'; ctx.fillText('✦', x, y); }
  ctx.globalAlpha = 1; ctx.restore();
  const b = sm(1.2, 4, lt); hand(ctx, 170, 1650, 1.25, 0.35, b, t); hand(ctx, 910, 1650, 1.25, -0.35, b, t);
  // blood redistribution arrows
  ctx.save(); ctx.globalAlpha = sm(0.5, 1, lt); ctx.strokeStyle = '#4a6aff'; ctx.lineWidth = 10; ctx.setLineDash([24, 18]); ctx.lineDashOffset = t * 80;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(540 + s * 360, 1500); ctx.lineTo(540 + s * 160, 1650); ctx.stroke(); } ctx.restore();
}
// 7. CO2 drop
function co2Text(ctx, x, y, size, col) { ctx.font = `700 ${size}px Oswald`; ctx.fillStyle = col; ctx.textAlign = 'left'; const w = ctx.measureText('CO').width; ctx.fillText('CO', x, y); ctx.font = `700 ${size * 0.5}px Oswald`; ctx.fillText('2', x + w + 4, y + size * 0.22); return w + size * 0.32; }
function pCO2(ctx, lt, t) {
  bg(ctx, '#a00c22', '#200008', 540, 1000, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 6, 540, 1100);
  // molecules leaving
  const r = rng(12); for (let i = 0; i < 26; i++) { const ph = ((lt * (0.25 + r() * 0.2) + r()) % 1), x = 120 + r() * 840, y = 1800 - ph * 1100; ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * (r() - 0.5) * 2); ctx.strokeStyle = '#ddd'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.stroke(); ctx.fillStyle = '#ff4a4a'; ell(ctx, -42, 0, 18, 18); ctx.fill(); ell(ctx, 42, 0, 18, 18); ctx.fill(); ctx.fillStyle = '#333'; ell(ctx, 0, 0, 22, 22); ctx.fill(); ctx.restore(); }
  ctx.globalAlpha = 1;
  // plate
  const pa = eBack(sm(0.2, 0.7, lt)); ctx.save(); ctx.translate(540, 900); ctx.scale(pa, pa); ctx.fillStyle = 'rgba(0,0,0,0.7)'; rrect(ctx, -300, -150, 600, 300, 40); ctx.fill(); ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 8; ctx.stroke();
  ctx.textBaseline = 'middle'; const w = co2Text(ctx, -230, 0, 190, '#fff');
  const ay = Math.sin(t * 5) * 12; ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.moveTo(-230 + w + 50, -60 + ay); ctx.lineTo(-230 + w + 130, -60 + ay); ctx.lineTo(-230 + w + 130, 20 + ay); ctx.lineTo(-230 + w + 175, 20 + ay); ctx.lineTo(-230 + w + 90, 110 + ay); ctx.lineTo(-230 + w + 5, 20 + ay); ctx.lineTo(-230 + w + 50, 20 + ay); ctx.fill(); ctx.restore();
  // level meter
  const lvl = lerp(1, 0.55, sm(0.8, 4.5, lt)); ctx.fillStyle = 'rgba(0,0,0,0.5)'; rrect(ctx, 240, 1200, 600, 70, 35); ctx.fill(); ctx.fillStyle = mix('#ffd23a', '#ff3a3a', 1 - lvl); rrect(ctx, 250, 1210, 580 * lvl, 50, 25); ctx.fill();
  ctx.font = '700 40px Oswald'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(`УРОВЕНЬ В КРОВИ: ${Math.round(lvl * 100)}%`, 540, 1340);
  ctx.restore();
}

// 8. clutching chest, "Я умираю"
function pChest(ctx, lt, t) {
  bg(ctx, '#7a0016', '#140004', 540, 1100, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.1, 6, 540, 1250, 7, t); sway(ctx, t, 0.4);
  ctx.save(); ctx.translate(540, 1270); ctx.scale(0.8, 0.8);
  drawHero(ctx, { t, open: 1.15, look: { x: 0, y: -0.2 }, pupil: 8, jitter: 4, mouth: 'scared', brow: 1, bags: 0.8, red: 0.8, sweat: 1, shirt: '#3a2a5a' });
  ctx.restore();
  hand(ctx, 600, 1830, 1.1, 2.6, 0, t);
  const ba = eBack(sm(0.6, 1.1, lt)); ctx.save(); ctx.translate(560, 780); ctx.scale(ba, ba);
  ctx.fillStyle = '#fff'; for (const [x, y, r] of [[-60, 120, 18], [-30, 90, 26]]) { ell(ctx, x, y + 80, r, r); ctx.fill(); }
  ctx.beginPath(); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; ctx.moveTo(0, 0); ctx.ellipse(Math.cos(a) * 230, Math.sin(a) * 60, 90, 70, 0, 0, 7); } ctx.fill(); ell(ctx, 0, 0, 270, 90); ctx.fill();
  ctx.font = '700 84px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#d0101a'; ctx.fillText('Я УМИРАЮ', Math.sin(t * 30) * 2 * sm(1.5, 2, lt), 6); ctx.restore();
  ctx.restore();
}
// 9. vicious spiral
function pSpiral(ctx, lt, t) {
  bg(ctx, '#6a0014', '#100003', 540, 1150, 1100);
  const sp = 1 + lt * 0.35, rot = t * sp;
  ctx.save(); ctx.translate(540, 1180);
  ctx.strokeStyle = 'rgba(255,90,90,0.55)'; ctx.lineWidth = 10; ctx.beginPath();
  for (let a = 0; a < Math.PI * 9; a += 0.05) { const r = 18 * a; const x = Math.cos(a - rot) * r, y = Math.sin(a - rot) * r * 0.9; a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  glow(ctx, 0, 0, 260, 'rgba(255,40,40,0.9)', 0.6 + 0.4 * beatPulse(t));
  const labels = [['СТРАХ', '#fff'], ['АДРЕНАЛИН', '#ffd23a'], ['СИЛЬНЕЕ СТРАХ', '#ff5a5a']];
  const R = lerp(400, 250, sm(0, 6.5, lt));
  const pos = labels.map((_, i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 3 + rot * 0.35; return [Math.cos(a) * R, Math.sin(a) * R * 0.9]; });
  for (let i = 0; i < 3; i++) { const [x0, y0] = pos[i], [x1, y1] = pos[(i + 1) % 3]; const a = sm(0.3 + i * 0.4, 0.8 + i * 0.4, lt); if (a <= 0) continue;
    ctx.strokeStyle = `rgba(255,220,120,${a})`; ctx.lineWidth = 8; ctx.beginPath(); const mx = (x0 + x1) * 0.75, my = (y0 + y1) * 0.75; ctx.moveTo(x0 * 0.8 + x1 * 0.2, y0 * 0.8 + y1 * 0.2); ctx.quadraticCurveTo(mx * 1.3, my * 1.3, x0 * 0.2 + x1 * 0.8, y0 * 0.2 + y1 * 0.8); ctx.stroke();
    const ex = x0 * 0.2 + x1 * 0.8, ey = y0 * 0.2 + y1 * 0.8, ang = Math.atan2(ey - my * 1.3, ex - mx * 1.3); ctx.fillStyle = `rgba(255,220,120,${a})`; ctx.beginPath(); ctx.moveTo(ex + Math.cos(ang) * 26, ey + Math.sin(ang) * 26); ctx.lineTo(ex + Math.cos(ang + 2.4) * 26, ey + Math.sin(ang + 2.4) * 26); ctx.lineTo(ex + Math.cos(ang - 2.4) * 26, ey + Math.sin(ang - 2.4) * 26); ctx.fill(); }
  labels.forEach(([txt, col], i) => { const a = eBack(sm(0.1 + i * 0.4, 0.5 + i * 0.4, lt)); if (a <= 0) return; const [x, y] = pos[i]; ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    ctx.font = '700 58px Oswald'; const w = ctx.measureText(txt).width + 50; ctx.fillStyle = 'rgba(0,0,0,0.75)'; rrect(ctx, -w / 2, -45, w, 90, 45); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 3); ctx.restore(); });
  ctx.restore();
}
// 10. amygdala on fire, frontal cortex dimmed, 160
function pOverload(ctx, lt, t) {
  bg(ctx, '#8a0010', '#140002', 540, 1000, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.12, 6.5, 480, 1000, 4, t); ctx.translate(20, 470);
  drawHeadBrain(ctx, t, { amy: 0.8 + 0.2 * Math.sin(t * 12), dimFront: sm(0.8, 2.5, lt) });
  for (let kk = 0; kk < 3; kk++) { const p = ((lt * 1.4 + kk / 3) % 1); ctx.strokeStyle = `rgba(255,60,60,${0.8 * (1 - p)})`; ctx.lineWidth = 8; ell(ctx, AMY[0], AMY[1], 30 + p * 300, 20 + p * 230, 0.5); ctx.stroke(); }
  tag(ctx, AMY[0] + 20, AMY[1] + 20, 620, 1080, 'МИНДАЛИНА', '#ff5a5a', sm(0.3, 0.7, lt));
  tag(ctx, 280, 400, 320, 430, 'ЛОБНАЯ КОРА', '#9aa0b0', sm(1.2, 1.6, lt));
  ctx.restore();
  const bpm = Math.round(bpmAt(t)); ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(0,0,0,0.6)'; rrect(ctx, 290, 1640, 500, 190, 30); ctx.fill();
  drawHeart(ctx, 390, 1735, 3.2 + beatPulse(t) * 1.3, '#ff2b3a'); ctx.font = '700 130px Oswald'; ctx.fillStyle = '#ff3344'; ctx.fillText(String(bpm), 600, 1738); ctx.restore();
}

// 11. clock: 10 minutes
function pClock(ctx, lt, t) {
  bg(ctx, '#127a48', '#01180c', 540, 1000, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 6, 540, 1100);
  const cx = 540, cy = 1000, R = 300, m = 10 * eOut(sm(0.3, 3.5, lt));
  ctx.fillStyle = '#f4f1e6'; ell(ctx, cx, cy, R, R); ctx.fill(); ctx.strokeStyle = '#0a2a1a'; ctx.lineWidth = 18; ctx.stroke();
  ctx.fillStyle = 'rgba(255,60,60,0.35)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R - 20, -Math.PI / 2, -Math.PI / 2 + m / 60 * Math.PI * 2); ctx.fill();
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, l = i % 5 ? 14 : 34; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = i % 5 ? 3 : 7; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * (R - 30), cy - Math.cos(a) * (R - 30)); ctx.lineTo(cx + Math.sin(a) * (R - 30 - l), cy - Math.cos(a) * (R - 30 - l)); ctx.stroke(); }
  const am = m / 60 * Math.PI * 2; ctx.strokeStyle = '#d0101a'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(am) * (R - 70), cy - Math.cos(am) * (R - 70)); ctx.stroke();
  ctx.fillStyle = '#111'; ell(ctx, cx, cy, 18, 18); ctx.fill();
  ctx.font = '700 70px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#111'; ctx.fillText(`${Math.floor(m)} МИН`, cx, cy + 140);
  // timeline 0..20
  const x0 = 140, x1 = 940, y = 1500, mx = v => lerp(x0, x1, v / 20);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  ctx.font = '700 34px Oswald'; ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let v = 0; v <= 20; v += 5) { ctx.fillRect(mx(v) - 2, y - 16, 4, 32); ctx.fillText(String(v), mx(v), y + 50); }
  const ha = sm(2.5, 3.5, lt); if (ha > 0) { ctx.fillStyle = `rgba(61,255,122,${0.85 * ha})`; rrect(ctx, mx(5), y - 22, (mx(20) - mx(5)) * eOut(ha), 44, 22); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText('5–20 МИНУТ', mx(12.5), y - 60); }
  const pa = sm(1.5, 2.2, lt); if (pa > 0) { ctx.globalAlpha = pa; ctx.fillStyle = '#ff3344'; ctx.beginPath(); ctx.moveTo(mx(10), y - 26); ctx.lineTo(mx(10) - 22, y - 70); ctx.lineTo(mx(10) + 22, y - 70); ctx.fill(); ctx.fillText('ПИК', mx(10), y - 100 - ha * 30); ctx.globalAlpha = 1; }
  ctx.restore();
}
// 12. pulse falling 160 -> 75
function pFall(ctx, lt, t) {
  bg(ctx, '#18a058', '#011a0c', 540, 1000, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.05, 6, 540, 1100);
  const x0 = 100, y0 = 760, w = 880, h = 700; ctx.fillStyle = 'rgba(0,0,0,0.55)'; rrect(ctx, x0 - 20, y0 - 20, w + 40, h + 40, 30); ctx.fill();
  const vy = v => y0 + h - (v - 60) / 110 * h;
  ctx.strokeStyle = 'rgba(160,255,190,0.15)'; ctx.lineWidth = 2; ctx.font = '700 30px Oswald'; ctx.fillStyle = 'rgba(200,255,220,0.6)'; ctx.textAlign = 'right';
  for (const v of [75, 90, 120, 160]) { ctx.beginPath(); ctx.moveTo(x0, vy(v)); ctx.lineTo(x0 + w, vy(v)); ctx.stroke(); ctx.fillText(String(v), x0 + w - 10, vy(v) - 12); }
  const T0 = 71, T1 = 77, p = clamp(lt / 5.5); ctx.strokeStyle = '#3dff7a'; ctx.lineWidth = 8; ctx.shadowColor = '#3dff7a'; ctx.shadowBlur = 20; ctx.beginPath();
  for (let i = 0; i <= 200 * p; i++) { const u = i / 200, tt = lerp(T0 - 0.3, T1, u), v = bpmAt(tt) + Math.sin(u * 60) * 4 * (1 - u); const x = x0 + u * w, y = vy(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke(); ctx.shadowBlur = 0;
  ctx.restore();
  const bpm = Math.round(bpmAt(t)); ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  drawHeart(ctx, 360, 1660, 3.4 + beatPulse(t) * 1.2, bpm < 95 ? '#3dff7a' : '#ff3344'); ctx.font = '700 160px Oswald'; ctx.lineWidth = 16; ctx.strokeStyle = '#000'; ctx.strokeText(String(bpm), 600, 1665); ctx.fillStyle = bpm < 95 ? '#3dff7a' : '#fff'; ctx.fillText(String(bpm), 600, 1665); ctx.restore();
}
// 13. slow exhale at dawn
function pExhale(ctx, lt, t) {
  ctx.save(); camera(ctx, lt, 1.06, 1.0, 6, 540, 1200); drawMetro(ctx, t, { dawn: 1 });
  const drop = eOut(sm(0.5, 4, lt)) * 40;
  ctx.save(); ctx.translate(540, 1260 + drop * 0.3); ctx.scale(0.82, 0.82);
  // shoulders lower: draw body shifted
  ctx.save(); ctx.translate(0, drop); drawHero(ctx, { t, open: 0, mouth: 'sleep', brow: 0.1, bags: 0.3, shirt: '#2f6a8a', skin: '#e0a88e', noBody: false }); ctx.restore();
  ctx.restore();
  // breath cloud
  const cyc = ((lt - 0.8) % 5 + 5) % 5, ex = cyc > 2 ? (cyc - 2) / 3 : 0;
  if (lt > 0.8 && ex > 0) { for (let i = 0; i < 4; i++) { const k = ex - i * 0.12; if (k <= 0) continue; ctx.fillStyle = `rgba(240,255,250,${0.25 * (1 - k)})`; ell(ctx, 540 + k * 40, 1520 + k * 120, 40 + k * 160, 25 + k * 80); ctx.fill(); } }
  ctx.restore();
  // breathing guide
  const inh = cyc <= 2 ? cyc / 2 : 1 - (cyc - 2) / 3, r = 80 + 70 * Math.sin(inh * Math.PI / 2);
  ctx.save(); ctx.translate(880, 1020); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ell(ctx, 0, 0, 170, 170); ctx.fill(); ctx.strokeStyle = '#3dff7a'; ctx.lineWidth = 8; ell(ctx, 0, 0, r, r); ctx.stroke(); glow(ctx, 0, 0, r, 'rgba(61,255,122,0.4)');
  ctx.font = '700 40px Oswald'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lt < 0.8 ? 'ДЫШИ' : cyc <= 2 ? 'ВДОХ' : 'ВЫДОХ', 0, 0); ctx.restore();
}
// 14. therapist + CBT triangle
function pCBT(ctx, lt, t) {
  bg(ctx, '#1a9a5a', '#02200e', 540, 900, 1400);
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 4, 540, 1200);
  ctx.fillStyle = 'rgba(255,240,200,0.12)'; ctx.fillRect(0, 0, W, 1400); ctx.fillStyle = '#0a3a22'; ctx.fillRect(0, 1400, W, 520);
  // plant + lamp
  ctx.fillStyle = '#5a3a20'; rrect(ctx, 470, 1300, 140, 120, 14); ctx.fill(); ctx.fillStyle = '#2a8a4a'; for (let i = 0; i < 7; i++) { ctx.save(); ctx.translate(540, 1300); ctx.rotate(-1.2 + i * 0.4); ell(ctx, 0, -90, 22, 90); ctx.fill(); ctx.restore(); }
  // chairs and people
  for (const [x, s] of [[230, 1], [850, -1]]) { ctx.fillStyle = '#6a3a2a'; rrect(ctx, x - 130, 1330, 260, 90, 30); ctx.fill(); rrect(ctx, x - s * 120 - 25, 1100, 50, 300, 20); ctx.fill(); ctx.fillRect(x - 110, 1420, 20, 120); ctx.fillRect(x + 90, 1420, 20, 120); }
  drawPerson(ctx, 230, 1120, 2.3, { body: '#2a3a5a', head: '#d29a82', hair: '#1b1220' });
  drawPerson(ctx, 850, 1120, 2.3, { body: '#5a2a3a', head: '#e0b090', hair: '#6a4a2a', longHair: true, glasses: true });
  ctx.fillStyle = '#f4f1e6'; ctx.save(); ctx.translate(780, 1300); ctx.rotate(-0.3); ctx.fillRect(-40, -30, 80, 60); ctx.restore();
  // CBT triangle
  const nodes = [['МЫСЛИ', 540, 700], ['ЧУВСТВА', 300, 1010], ['ДЕЙСТВИЯ', 780, 1010]];
  for (let i = 0; i < 3; i++) { const a = sm(0.4 + i * 0.3, 0.8 + i * 0.3, lt); const [, x0, y0] = nodes[i], [, x1, y1] = nodes[(i + 1) % 3]; ctx.strokeStyle = `rgba(61,255,122,${a})`; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(lerp(x0, x1, 0.22), lerp(y0, y1, 0.22)); ctx.lineTo(lerp(x0, x1, lerp(0.22, 0.78, a)), lerp(y0, y1, lerp(0.22, 0.78, a))); ctx.stroke(); }
  nodes.forEach(([txt, x, y], i) => { const a = eBack(sm(0.1 + i * 0.3, 0.5 + i * 0.3, lt)); if (a <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.font = '700 46px Oswald'; const w = ctx.measureText(txt).width + 50; ctx.fillStyle = 'rgba(0,0,0,0.7)'; rrect(ctx, -w / 2, -40, w, 80, 40); ctx.fill(); ctx.strokeStyle = '#3dff7a'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 3); ctx.restore(); });
  const ka = sm(1.4, 1.8, lt); ctx.globalAlpha = ka; ctx.font = '700 90px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3dff7a'; ctx.fillText('КПТ', 540, 905); ctx.globalAlpha = 1;
  ctx.restore();
}
// 15/16. warning + source
function warnIcon(ctx, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(55, 45); ctx.lineTo(-55, 45); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#111'; ctx.fillRect(-6, -18, 12, 38); ell(ctx, 0, 32, 7, 7); ctx.fill(); ctx.restore(); }
function pFinal(ctx, lt, t) {
  ctx.save(); camera(ctx, lt, 1.0, 1.04, 3, 540, 1000); drawMetro(ctx, t, { dawn: 1 }); ctx.restore();
  ctx.fillStyle = 'rgba(0,10,5,0.55)'; ctx.fillRect(0, 0, W, H);
  const a = eBack(sm(0.1, 0.5, lt)); ctx.save(); ctx.translate(540, 980); ctx.scale(a, a);
  ctx.fillStyle = 'rgba(20,0,4,0.88)'; rrect(ctx, -440, -260, 880, 520, 40); ctx.fill(); ctx.strokeStyle = '#ff3344'; ctx.lineWidth = 10; ctx.stroke();
  warnIcon(ctx, 0, -150, 1.3);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 70px Oswald'; ctx.fillStyle = '#fff';
  ctx.fillText('ЕСЛИ БОЛЬ В ГРУДИ', 0, -10); ctx.fillText('ВПЕРВЫЕ —', 0, 75); ctx.fillStyle = '#ff3344'; ctx.fillText('ВЫЗОВИ ВРАЧА', 0, 160); ctx.restore();
  const sa = sm(0.8, 1.2, lt); ctx.save(); ctx.globalAlpha = sa; ctx.fillStyle = 'rgba(0,0,0,0.65)'; rrect(ctx, 170, 1700, 740, 80, 40); ctx.fill(); ctx.font = '400 36px Oswald'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Источник: Simply Psychology, Ada Health', 540, 1741); ctx.restore();
}

const SCENES = [
  [0, 4, pHook],
  [4, 9.5, pDoors], [9.5, 16, pAmygdala], [16, 22, pSymp],
  [22, 27.5, pAdrenal], [27.5, 33.5, pHeartLungs], [33.5, 40, pDizzy], [40, 46, pCO2],
  [46, 52, pChest], [52, 58.5, pSpiral], [58.5, 65, pOverload],
  [65, 71, pClock], [71, 77, pFall], [77, 83.9, pExhale], [83.9, 88.4, pCBT], [88.4, 93, pFinal],
];
const CAPS = [
  { t0: 0.15, t1: 3.98, y: 1560, size: 92, text: '*Это не сердце.*\nЭто тревога, которая притворяется смертью', accent: RED, stagger: 0.09 },
  { t0: 4.3, t1: 9.45, text: 'Ничего не случилось.\n*Никакой угрозы*', y: 420, accent: YEL },
  { t0: 9.8, t1: 15.95, size: 70, y: 420, text: '*Миндалина*, зона страха, замечает «опасность» и запускает сигнал тревоги', accent: YEL },
  { t0: 16.3, t1: 21.95, size: 72, y: 420, text: 'Сигнал идёт в гипоталамус.\nВключается *симпатическая система*', accent: YEL },
  { t0: 22.3, t1: 27.45, y: 420, text: 'В кровь выбрасывается\n*адреналин*', accent: YEL },
  { t0: 27.8, t1: 33.45, size: 76, y: 420, text: 'Пульс растёт. Дыхание учащается.\n*Тело готово бежать*', accent: YEL },
  { t0: 33.8, t1: 39.95, size: 68, y: 420, text: 'Из-за перераспределения крови появляются *головокружение* и *онемение* рук и ног', accent: YEL },
  { t0: 40.3, t1: 45.95, size: 68, y: 420, text: 'Частое дыхание снижает уровень *углекислого газа* в крови, что вызывает головокружение', accent: YEL },
  { t0: 46.3, t1: 51.95, size: 80, y: 420, text: 'Тело реагирует, и мозг решает:\n*«Это инфаркт»*', accent: YEL },
  { t0: 52.3, t1: 58.45, size: 68, y: 420, text: 'Мысль «со мной что-то не так» становится *новой угрозой*. Миндалина срабатывает сильнее', accent: YEL },
  { t0: 58.8, t1: 64.95, size: 70, y: 420, text: 'Миндалина перевозбуждена, лобная кора реагирует слабее. *Логика отключается*', accent: YEL, glitch: true },
  { t0: 65.3, t1: 70.95, size: 70, y: 420, text: 'Пик обычно приходится на *первые 10 минут*. Большинство атак длится 5–20 минут', accent: GRN },
  { t0: 71.3, t1: 76.95, size: 68, y: 420, text: 'Организм не может держать боевой режим бесконечно. *Парасимпатическая система* берёт управление', accent: GRN },
  { t0: 77.25, t1: 83.85, size: 66, y: 420, text: 'Что помогает: *дышать плавно*, выдыхать длиннее вдоха и напомнить себе: «это пройдёт»', accent: GRN },
  { t0: 84.15, t1: 88.35, size: 70, y: 420, text: '*Когнитивно-поведенческая терапия* помогает снизить частоту панических атак', accent: GRN },
];
function gradeCol(t) { if (t < 4) return ['#3a5ad0', 0.2]; if (t < 22) return ['#1a4fe0', 0.3]; if (t < 46) return ['#ff1a2a', 0.3]; if (t < 65) return ['#8a0010', 0.35]; return ['#20d070', 0.28]; }
