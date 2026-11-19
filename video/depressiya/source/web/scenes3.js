// ===== «Депрессия: почему нет сил даже встать» =====
const BLU = '#8ab8ff', PNK = '#ff5a6a';
function desat(ctx, k) { if (k <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = clamp(k); ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// 0. hook: empty gaze close-up
function dHook(ctx, lt, t) {
  bg(ctx, '#3a4466', '#0a0c18', 540, 900, 1200);
  ctx.save(); camera(ctx, lt, 1.0, 1.12, 3, 540, 900, 2, t);
  ctx.translate(540, 980); ctx.scale(1.4, 1.4);
  drawHero(ctx, { t, open: 0.55, look: { x: -0.5, y: 0.5 }, pupil: 13, mouth: 'sad', brow: 0.65, bags: 1, red: 0.15, shirt: '#3a3f5a', skin: '#c8a090' });
  ctx.restore(); desat(ctx, 0.35);
}
// bedroom (day or dawn)
function bedroom(ctx, t, o = {}) {
  const sun = o.sun ?? 1;
  bg(ctx, '#4a5276', '#141830', 540, 700, 1500);
  const wx = 250, wy = 330, ww = 580, wh = 560;
  ctx.fillStyle = linear(ctx, 0, wy, 0, wy + wh, [[0, '#7ac0ff'], [1, '#d8f0ff']]); ctx.fillRect(wx, wy, ww, wh);
  glow(ctx, 700, 470, 260, 'rgba(255,240,170,0.9)', sun); ctx.fillStyle = '#fff6c8'; ell(ctx, 700, 470, 70, 70); ctx.fill();
  ctx.fillStyle = '#9ab0c8'; for (let i = 0; i < 6; i++) ctx.fillRect(wx + i * 100, wy + wh - 120 - (i % 3) * 50, 80, 200);
  ctx.strokeStyle = '#1a1d33'; ctx.lineWidth = 24; ctx.strokeRect(wx, wy, ww, wh); ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.stroke();
  ctx.fillStyle = 'rgba(255,240,180,0.10)'; ctx.beginPath(); ctx.moveTo(wx, wy + wh); ctx.lineTo(wx + ww, wy + wh); ctx.lineTo(1000, 1700); ctx.lineTo(120, 1700); ctx.fill();
}
function bedWithHero(ctx, t, o = {}) {
  ctx.fillStyle = '#2a3058'; rrect(ctx, -40, 1240, 1160, 800, 40); ctx.fill();
  ctx.fillStyle = '#d9dbf0'; ell(ctx, 300, 1400, 250, 105, -0.05); ctx.fill();
  ctx.save(); ctx.translate(310, 1375); ctx.rotate(-Math.PI / 2 + 0.08); ctx.scale(0.42, 0.42);
  drawHero(ctx, { t, open: o.open ?? 0.6, look: { x: -0.8, y: 0.3 }, pupil: 12, red: 0.1, bags: 0.9, mouth: 'sad', brow: 0.6, noBody: true, skin: '#c8a090' });
  ctx.restore();
  ctx.fillStyle = linear(ctx, 0, 1380, 0, 1920, [[0, '#6a78b0'], [1, '#2a3270']]);
  ctx.beginPath(); ctx.moveTo(470, 1300); ctx.bezierCurveTo(600, 1250, 800, 1280, 1120, 1300); ctx.lineTo(1120, 1920); ctx.lineTo(380, 1920); ctx.bezierCurveTo(330, 1700, 400, 1450, 470, 1300); ctx.fill();
}
function phone(ctx, x, y, s, draw) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#0c0d14'; rrect(ctx, -130, -250, 260, 500, 36); ctx.fill(); ctx.fillStyle = '#1a1e30'; rrect(ctx, -116, -230, 232, 460, 24); ctx.fill(); draw && draw(); ctx.restore(); }
// 1. "not laziness": noon, 14 missed calls
function dLazy(ctx, lt, t) {
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 5, 540, 1100); bedroom(ctx, t); bedWithHero(ctx, t, { open: 0.55 });
  ctx.restore();
  const vib = Math.sin(t * 60) * 5 * (Math.floor(t * 1.5) % 2);
  phone(ctx, 880 + vib, 1470, 0.62, () => { ctx.fillStyle = '#fff'; ctx.font = '700 64px Oswald'; ctx.textAlign = 'center'; ctx.fillText('12:47', 0, -120);
    ctx.fillStyle = '#ff3344'; rrect(ctx, -95, -40, 190, 120, 20); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 70px Oswald'; ctx.fillText('14', 0, 45); ctx.font = '700 30px Oswald'; ctx.fillText('ПРОПУЩЕННЫХ', 0, 130); });
  desat(ctx, 0.3);
}
// 2. alarm, colour drains
function alarm(ctx, x, y, s, t, ring) {
  ctx.save(); ctx.translate(x + (ring ? Math.sin(t * 70) * 6 : 0), y); ctx.rotate(ring ? Math.sin(t * 50) * 0.06 : 0); ctx.scale(s, s);
  ctx.fillStyle = '#ff6a3a'; for (const sx of [-1, 1]) { ell(ctx, sx * 80, -110, 50, 40); ctx.fill(); }
  ctx.fillStyle = '#e04a2a'; ell(ctx, 0, 0, 140, 140); ctx.fill(); ctx.fillStyle = '#fff8ec'; ell(ctx, 0, 0, 112, 112); ctx.fill();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -80); ctx.moveTo(0, 0); ctx.lineTo(0, 70); ctx.stroke();
  if (ring) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 175 + i * 30, sx > 0 ? -0.6 : Math.PI - 0.6, sx > 0 ? 0.6 : Math.PI + 0.6); ctx.stroke(); } }
  ctx.restore();
}
function dAlarm(ctx, lt, t) {
  ctx.save(); camera(ctx, lt, 1.0, 1.08, 6, 540, 1150);
  ctx.fillStyle = '#e8d8ff'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffd0a0'; ctx.fillRect(0, 0, W, 300);
  ctx.fillStyle = '#ff9a8a'; ell(ctx, 540, 1180, 470, 330); ctx.fill(); ctx.fillStyle = '#ffffff'; ell(ctx, 540, 1150, 430, 290); ctx.fill();
  ctx.save(); ctx.translate(540, 1150); ctx.scale(0.72, 0.72);
  drawHero(ctx, { t, open: 0.75, look: { x: 0, y: -0.6 }, pupil: 13, mouth: 'sad', brow: 0.6, bags: 0.9, shirt: '#ff8a3a', skin: '#e0a88e' });
  ctx.restore();
  ctx.fillStyle = '#4a9aff'; ctx.beginPath(); ctx.moveTo(-40, 1600); ctx.quadraticCurveTo(540, 1480, 1120, 1600); ctx.lineTo(1120, 1960); ctx.lineTo(-40, 1960); ctx.fill();
  ctx.fillStyle = '#ffd23a'; for (let i = 0; i < 6; i++) { ell(ctx, 120 + i * 170, 1720 + (i % 2) * 60, 40, 40); ctx.fill(); }
  ctx.restore();
  alarm(ctx, 850, 780, 0.75, t, lt < 2.4);
  ctx.font = '700 64px Oswald'; ctx.textAlign = 'center'; ctx.fillStyle = '#222'; ctx.fillText('07:00', 850, 940);
  desat(ctx, sm(0.8, 5, lt));
}
// 3. anhedonia: favourite things lose colour
function guitar(ctx, c) { ctx.fillStyle = c('#c8702a'); ell(ctx, 0, 40, 90, 100); ctx.fill(); ell(ctx, 0, -50, 70, 75); ctx.fill(); ctx.fillStyle = '#111'; ell(ctx, 0, 10, 26, 26); ctx.fill(); ctx.fillStyle = c('#5a3418'); ctx.fillRect(-12, -260, 24, 220); ctx.fillRect(-22, -290, 44, 40); }
function mug(ctx, c, t) { ctx.fillStyle = c('#3a8ad0'); rrect(ctx, -80, -70, 160, 180, 20); ctx.fill(); ctx.strokeStyle = c('#3a8ad0'); ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(85, 20, 45, -1.3, 1.3); ctx.stroke();
  ctx.strokeStyle = c('#ffffff'); ctx.lineWidth = 7; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 35, -90); ctx.quadraticCurveTo(i * 35 + 20 * Math.sin(t * 2 + i), -140, i * 35, -190); ctx.stroke(); } }
function chat(ctx, c) { ctx.fillStyle = c('#3dc46a'); rrect(ctx, -150, -100, 300, 150, 40); ctx.fill(); ctx.beginPath(); ctx.moveTo(-90, 40); ctx.lineTo(-120, 100); ctx.lineTo(-40, 45); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '700 40px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ГУЛЯТЬ?', 0, -28); ctx.fillStyle = c('#ffd23a'); ell(ctx, 0, 140, 50, 50); ctx.fill(); ctx.fillStyle = '#222'; ell(ctx, -17, 128, 6, 6); ctx.fill(); ell(ctx, 17, 128, 6, 6); ctx.fill(); ctx.strokeStyle = '#222'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 142, 24, 0.3, Math.PI - 0.3); ctx.stroke(); }
function headphones(ctx, c) { ctx.strokeStyle = c('#e03a8a'); ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(0, 20, 120, Math.PI, 0); ctx.stroke(); ctx.fillStyle = c('#e03a8a'); rrect(ctx, -150, 0, 60, 120, 20); ctx.fill(); rrect(ctx, 90, 0, 60, 120, 20); ctx.fill(); ctx.fillStyle = c('#ffd23a'); ctx.font = '700 80px Oswald'; ctx.textAlign = 'center'; ctx.fillText('♪', 0, 60); }
function dAnhedonia(ctx, lt, t) {
  bg(ctx, '#5a6aa0', '#151a34', 540, 1100, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 6, 540, 1150);
  const items = [[guitar, 300, 900], [mug, 780, 900], [chat, 300, 1420], [headphones, 780, 1420]];
  items.forEach(([fn, x, y], i) => { const k = sm(1.0 + i * 0.9, 1.8 + i * 0.9, lt), a = eBack(sm(0.1 + i * 0.12, 0.5 + i * 0.12, lt));
    if (a <= 0) return; ctx.save(); ctx.translate(x, y - k * 20); ctx.scale(a * (1 - k * 0.12), a * (1 - k * 0.12)); ctx.globalAlpha = 1 - k * 0.2;
    if (k < 0.6) glow(ctx, 0, 0, 230, 'rgba(255,240,180,0.5)', 1 - k); fn(ctx, h => mix(h, '#9a9ca6', k), t); ctx.restore(); });
  ctx.restore();
}
// 4. energy + broken sleep
function clockFace(ctx, x, y, label, night, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.fillStyle = 'rgba(0,0,0,0.55)'; rrect(ctx, -190, -90, 380, 180, 30); ctx.fill();
  ctx.font = '700 96px "DejaVu Sans Mono"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = night ? '#8ab8ff' : '#ffd23a'; ctx.fillText(label, 30, 4);
  if (night) { ctx.fillStyle = '#8ab8ff'; ctx.beginPath(); ctx.arc(-140, 0, 34, 0.6, Math.PI * 2 - 0.6); ctx.arc(-124, -6, 28, Math.PI * 2 - 0.9, 0.9, true); ctx.fill(); }
  else { ctx.fillStyle = '#ffd23a'; ell(ctx, -140, 0, 26, 26); ctx.fill(); ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 6; for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(-140 + Math.cos(an) * 36, Math.sin(an) * 36); ctx.lineTo(-140 + Math.cos(an) * 50, Math.sin(an) * 50); ctx.stroke(); } }
  ctx.restore();
}
function dEnergy(ctx, lt, t) {
  bg(ctx, '#404a7a', '#0c0f22', 540, 1000, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 6, 540, 1100);
  const v = energyAt(t), col = energyCol(v);
  ctx.save(); ctx.translate(540, 920); battery(ctx, -300, -130, 560, 260, v, col);
  ctx.font = '700 120px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 12; ctx.strokeStyle = '#000'; ctx.strokeText(Math.round(v) + '%', -20, 6); ctx.fillStyle = '#fff'; ctx.fillText(Math.round(v) + '%', -20, 6); ctx.restore();
  const flip = Math.floor(lt / 1.2) % 2; clockFace(ctx, 540, 1400, flip ? '13:00' : '03:00', !flip, sm(1.2, 1.6, lt));
  ctx.font = '700 44px Oswald'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.globalAlpha = sm(1.4, 1.8, lt); ctx.fillText(flip ? 'СПИТ ДО ОБЕДА' : 'НЕ МОЖЕТ УСНУТЬ', 540, 1560); ctx.globalAlpha = 1;
  ctx.restore();
}
// 5. amygdala & negative words
const NEG = [['ПРОВАЛ', 760, 380], ['ОШИБКА', 180, 300], ['СТЫД', 860, 640], ['ОПЯТЬ', 120, 980], ['ВСЁ ПЛОХО', 700, 1240]];
function dAmyNeg(ctx, lt, t) {
  bg(ctx, '#6a2ab0', '#12052a', 540, 1000, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.08, 6, 500, 1000); ctx.translate(20, 470);
  drawHeadBrain(ctx, t, { amy: sm(0.5, 1.2, lt) * (0.75 + 0.25 * Math.sin(t * 5)) });
  NEG.forEach(([w, x, y], i) => { const a = eBack(sm(0.8 + i * 0.5, 1.2 + i * 0.5, lt)); if (a <= 0) return; ctx.save(); ctx.translate(x + Math.sin(t + i) * 10, y + Math.cos(t * 0.8 + i) * 10); ctx.scale(a, a); ctx.rotate((i % 2 ? 1 : -1) * 0.08);
    ctx.font = '700 56px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 10; ctx.strokeStyle = '#000'; ctx.strokeText(w, 0, 0); ctx.fillStyle = '#ff5a6a'; ctx.fillText(w, 0, 0);
    ctx.strokeStyle = 'rgba(255,90,106,0.5)'; ctx.lineWidth = 3; ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo((AMY[0] - x) * 0.7, (AMY[1] - y) * 0.7); ctx.stroke(); ctx.restore(); });
  tag(ctx, AMY[0] + 20, AMY[1] + 20, 620, 1080, 'МИНДАЛИНА', '#ff8a9a', sm(0.6, 1.0, lt));
  ctx.restore();
}
// 6. frontal cortex dims
function dFrontal(ctx, lt, t) {
  bg(ctx, '#5a24a0', '#0e0424', 540, 1000, 1300);
  ctx.save(); camera(ctx, lt, 1.04, 1.0, 6, 500, 1000); ctx.translate(20, 470);
  const d = sm(1.0, 4, lt);
  glow(ctx, 330, 360, 220, 'rgba(255,240,150,0.7)', 1 - d);
  drawHeadBrain(ctx, t, { amy: 0.35, dimFront: d });
  // to-do list fading
  ctx.save(); ctx.translate(-20, 1000); ctx.globalAlpha = 1 - d * 0.6; ctx.fillStyle = '#f4f1e6'; rrect(ctx, 0, 0, 300, 260, 16); ctx.fill();
  ctx.font = '700 34px Oswald'; ctx.fillStyle = '#333'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ['ПЛАН ДНЯ', '☐ ДУШ', '☐ ЕДА', '☐ РАБОТА'].forEach((s, i) => { ctx.globalAlpha = (1 - d * 0.6) * (i ? 1 - sm(1.5 + i * 0.6, 2.2 + i * 0.6, lt) * 0.8 : 1); ctx.fillText(s, 26, 44 + i * 58); }); ctx.restore();
  tag(ctx, 280, 400, 320, 430, 'ЛОБНАЯ КОРА', '#c0c4d4', sm(0.8, 1.2, lt));
  ctx.restore();
}
// 7. cortisol
function iconX(ctx, x, y, kind, p) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ell(ctx, 0, 0, 95, 95); ctx.fill(); ctx.fillStyle = '#e8e0ff'; ctx.strokeStyle = '#e8e0ff'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  if (kind === 0) { ctx.beginPath(); ctx.arc(0, 0, 45, 0.6, Math.PI * 2 - 0.6); ctx.arc(20, -8, 38, Math.PI * 2 - 0.9, 0.9, true); ctx.fill(); }
  else if (kind === 1) { ctx.beginPath(); ctx.moveTo(-25, -50); ctx.lineTo(-25, 50); ctx.moveTo(-40, -50); ctx.lineTo(-40, -15); ctx.moveTo(-10, -50); ctx.lineTo(-10, -15); ctx.moveTo(30, -50); ctx.quadraticCurveTo(55, -20, 30, 0); ctx.lineTo(30, 50); ctx.stroke(); }
  else { ctx.font = '700 100px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 6); }
  ctx.strokeStyle = '#ff3a4a'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-70, -70); ctx.lineTo(lerp(-70, 70, p), lerp(-70, 70, p)); ctx.stroke(); ctx.restore();
}
function dCortisol(ctx, lt, t) {
  bg(ctx, '#6a1ea0', '#120322', 540, 1100, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.08, 6, 540, 1100); torso(ctx, '#e8b4a8');
  for (let y = 620; y < 1950; y += 70) { ctx.fillStyle = '#f6efe2'; rrect(ctx, 505, y, 70, 56, 12); ctx.fill(); }
  for (const s of [-1, 1]) { const kx = 540 + s * 230, ky = 1100;
    ctx.fillStyle = '#a8343a'; ctx.beginPath(); ctx.ellipse(kx, ky, 105, 165, s * 0.15, 0, 7); ctx.fill();
    glow(ctx, kx, ky - 175, 140, 'rgba(255,160,40,1)', 0.6 + 0.3 * Math.sin(t * 3));
    ctx.fillStyle = '#ffa52a'; ctx.beginPath(); ctx.moveTo(kx - 80, ky - 140); ctx.quadraticCurveTo(kx, ky - 250, kx + 80, ky - 140); ctx.quadraticCurveTo(kx, ky - 165, kx - 80, ky - 140); ctx.fill();
    const r = rng(s > 0 ? 8 : 9); for (let i = 0; i < 10; i++) { const ph = ((lt * 0.45 + r()) % 1), x = kx + (r() - 0.5) * 160, y = ky - 160 + ph * 520; ctx.globalAlpha = Math.sin(ph * Math.PI); ctx.fillStyle = '#ffb04a';
      ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.quadraticCurveTo(x + 16, y, x, y + 12); ctx.quadraticCurveTo(x - 16, y, x, y - 22); ctx.fill(); } ctx.globalAlpha = 1; }
  tag(ctx, 720, 940, 770, 800, 'КОРТИЗОЛ', '#ffb04a', sm(0.5, 0.9, lt));
  ctx.restore();
  [0, 1, 2].forEach(i => { const a = eBack(sm(1.5 + i * 0.4, 1.9 + i * 0.4, lt)); if (a <= 0) return; ctx.save(); ctx.translate(250 + i * 290, 1660); ctx.scale(a, a); iconX(ctx, 0, 0, i, eOut(sm(2.0 + i * 0.4, 2.4 + i * 0.4, lt))); ctx.restore(); });
}
// 8. connections thin out
function dSynapse(ctx, lt, t) {
  bg(ctx, '#4a1a8a', '#0c0320', 540, 1100, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 6, 540, 1100);
  NLINKS.forEach(([a, b], i) => { const A = NEUR[a], B = NEUR[b], fade = sm(0.8 + i * 0.25, 1.6 + i * 0.25, lt), cut = i % 3 !== 0 ? fade : fade * 0.5;
    const mx = (A.x + B.x) / 2 + 60, my = (A.y + B.y) / 2 - 40; ctx.strokeStyle = `rgba(220,180,255,${0.85 - cut * 0.7})`; ctx.lineWidth = 7 - cut * 5; ctx.setLineDash(cut > 0.5 ? [8, 22] : []);
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.quadraticCurveTo(mx, my, B.x, B.y); ctx.stroke(); ctx.setLineDash([]);
    if (cut < 0.6) { const p = (lt * 0.5 + i * 0.13) % 1; const x = (1 - p) * (1 - p) * A.x + 2 * (1 - p) * p * mx + p * p * B.x, y = (1 - p) * (1 - p) * A.y + 2 * (1 - p) * p * my + p * p * B.y; glow(ctx, x, y, 26, 'rgba(255,240,255,1)', 1 - cut); } });
  NEUR.forEach((n, i) => { const d = sm(1 + i * 0.3, 3 + i * 0.3, lt) * 0.6; ctx.strokeStyle = mix('#e0c8ff', '#6a5a80', d);
    for (const [x1, y1, x2, y2, dep] of n.segs) { if (dep > 3 - d * 2) continue; ctx.lineWidth = 6 - dep * 1.3; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    glow(ctx, n.x, n.y, 100, 'rgba(200,150,255,0.8)', 0.8 - d); ctx.fillStyle = mix('#f0e0ff', '#5a5070', d); ell(ctx, n.x, n.y, 32, 28); ctx.fill(); });
  ctx.restore();
}
// 9. cancelling plans in messenger
function dCancel(ctx, lt, t) {
  bg(ctx, '#1a2a8a', '#03061e', 540, 1000, 1400);
  ctx.fillStyle = '#ffa63c'; ctx.globalAlpha = 0.5; ctx.fillRect(700, 600, 300, 400); ctx.globalAlpha = 1; glow(ctx, 850, 800, 400, 'rgba(255,160,60,0.35)');
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 5.5, 540, 1150);
  phone(ctx, 540, 1180, 1.9, () => {
    ctx.fillStyle = '#10131f'; rrect(ctx, -116, -230, 232, 460, 24); ctx.fill(); ctx.fillStyle = '#20263a'; ctx.fillRect(-116, -230, 232, 50);
    ctx.font = '700 22px Oswald'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ДРУЗЬЯ', 0, -205);
    const bub = (x, y, w, txt, mine, a) => { if (a <= 0) return; ctx.globalAlpha = a; ctx.fillStyle = mine ? '#3a6ad0' : '#2e3346'; rrect(ctx, x, y, w, 50, 16); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 20px Oswald'; ctx.textAlign = 'left'; ctx.fillText(txt, x + 12, y + 26); ctx.globalAlpha = 1; };
    bub(-104, -160, 180, 'ВСТРЕЧАЕМСЯ В 7?', false, sm(0.2, 0.5, lt));
    bub(-104, -100, 140, 'ТЫ ИДЁШЬ? 🙂'.replace('🙂', ''), false, sm(0.7, 1.0, lt));
    const full = 'ПРОСТИ, СЕГОДНЯ НЕ СМОГУ', n = Math.floor(clamp((lt - 1.4) / 1.6) * full.length);
    if (lt > 1.2 && n < full.length) { ctx.fillStyle = '#20263a'; rrect(ctx, -110, 150, 220, 50, 14); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 18px Oswald'; ctx.textAlign = 'left'; ctx.fillText(full.slice(0, n) + (Math.floor(t * 3) % 2 ? '|' : ''), -100, 176); }
    if (n >= full.length) bub(-30, -30, 134, '', true, 1), (ctx.fillStyle = '#fff', ctx.font = '700 15px Oswald', ctx.textAlign = 'left', ctx.fillText('ПРОСТИ, СЕГОДНЯ', -20, -12), ctx.fillText('НЕ СМОГУ', -20, 6));
  });
  ctx.restore();
  const ca = sm(3.6, 4.0, lt); if (ca > 0) { ctx.save(); ctx.globalAlpha = ca; ctx.translate(540, 1720); ctx.fillStyle = 'rgba(0,0,0,0.6)'; rrect(ctx, -260, -60, 520, 120, 24); ctx.fill(); ctx.font = '700 52px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('ВСТРЕЧА 19:00', 0, 4);
    ctx.strokeStyle = '#ff3a4a'; ctx.lineWidth = 10; const p = eOut(sm(4.0, 4.4, lt)); ctx.beginPath(); ctx.moveTo(-210, 0); ctx.lineTo(lerp(-210, 210, p), 0); ctx.stroke(); ctx.restore(); }
}
// 10. vicious loop
function dLoop(ctx, lt, t) {
  bg(ctx, '#18207a', '#02031a', 540, 1150, 1100);
  const rot = t * 0.6;
  ctx.save(); ctx.translate(540, 1180);
  ctx.strokeStyle = 'rgba(140,160,255,0.45)'; ctx.lineWidth = 10; ctx.beginPath();
  for (let a = 0; a < Math.PI * 9; a += 0.05) { const r = 18 * a; const x = Math.cos(a - rot) * r, y = Math.sin(a - rot) * r * 0.9; a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  glow(ctx, 0, 0, 240, 'rgba(90,100,255,0.8)', 0.6);
  const labels = [['НЕТ СИЛ', '#fff'], ['ИЗБЕГАЮ', '#ffd23a'], ['ВИНА', '#ff5a6a'], ['ЕЩЁ МЕНЬШЕ СИЛ', '#8ab8ff']];
  const R = lerp(380, 260, sm(0, 5.5, lt));
  const pos = labels.map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 2 + rot * 0.25; return [Math.cos(a) * R, Math.sin(a) * R * 0.9]; });
  for (let i = 0; i < 4; i++) { const [x0, y0] = pos[i], [x1, y1] = pos[(i + 1) % 4]; const a = sm(0.4 + i * 0.5, 0.9 + i * 0.5, lt); if (a <= 0) continue;
    const mx = (x0 + x1) * 0.75, my = (y0 + y1) * 0.75; ctx.strokeStyle = `rgba(200,210,255,${a})`; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25); ctx.quadraticCurveTo(mx * 1.35, my * 1.35, x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75); ctx.stroke();
    const ex = x0 * 0.25 + x1 * 0.75, ey = y0 * 0.25 + y1 * 0.75, an = Math.atan2(ey - my * 1.35, ex - mx * 1.35); ctx.fillStyle = `rgba(200,210,255,${a})`; ctx.beginPath(); ctx.moveTo(ex + Math.cos(an) * 24, ey + Math.sin(an) * 24); ctx.lineTo(ex + Math.cos(an + 2.4) * 24, ey + Math.sin(an + 2.4) * 24); ctx.lineTo(ex + Math.cos(an - 2.4) * 24, ey + Math.sin(an - 2.4) * 24); ctx.fill(); }
  labels.forEach(([txt, col], i) => { const a = eBack(sm(0.1 + i * 0.5, 0.5 + i * 0.5, lt)); if (a <= 0) return; const [x, y] = pos[i]; ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    ctx.font = '700 54px Oswald'; const w = ctx.measureText(txt).width + 50; ctx.fillStyle = 'rgba(0,0,0,0.75)'; rrect(ctx, -w / 2, -44, w, 88, 44); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 3); ctx.restore(); });
  ctx.restore();
}
// 11. intrusive thoughts -> "СИМПТОМ"
function cloud(ctx, x, y, w, txt, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.fillStyle = 'rgba(40,44,70,0.92)';
  ctx.beginPath(); for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; ctx.moveTo(0, 0); ctx.ellipse(Math.cos(an) * w * 0.42, Math.sin(an) * 48, w * 0.2, 60, 0, 0, 7); } ctx.fill(); ell(ctx, 0, 0, w * 0.5, 70); ctx.fill();
  ctx.font = '700 52px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#c8ccdc'; ctx.fillText(txt, 0, 4); ctx.restore();
}
function dThoughts(ctx, lt, t) {
  bg(ctx, '#1c2470', '#02031a', 540, 1100, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.08, 5.5, 540, 1300);
  ctx.save(); ctx.translate(540, 1330); ctx.scale(0.8, 0.8);
  drawHero(ctx, { t, open: 0.5, look: { x: 0.2, y: 0.6 }, pupil: 12, mouth: 'sad', brow: 0.7, bags: 1, shirt: '#2a3058', skin: '#c8a090' });
  ctx.restore(); ctx.restore();
  cloud(ctx, 330 + Math.sin(t) * 10, 830, 520, 'Я БЕСПОЛЕЗЕН', sm(0.3, 0.8, lt));
  cloud(ctx, 690 + Math.cos(t) * 10, 1020, 620, 'НИЧЕГО НЕ ИЗМЕНИТСЯ', sm(0.9, 1.4, lt));
  const s = sm(3.0, 3.25, lt); if (s > 0) { ctx.save(); ctx.translate(540, 930); ctx.rotate(-0.18); const sc = lerp(1.8, 1, eOut(s)); ctx.scale(sc, sc); ctx.globalAlpha = s;
    ctx.strokeStyle = '#3dff7a'; ctx.lineWidth = 12; rrect(ctx, -280, -80, 560, 160, 18); ctx.stroke(); ctx.font = '700 110px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3dff7a'; ctx.fillText('СИМПТОМ', 0, 6); ctx.restore(); }
}
// 12. world map 280 000 000
function dWorld(ctx, lt, t) {
  bg(ctx, '#1a2a80', '#020418', 540, 1000, 1300);
  ctx.save(); camera(ctx, lt, 1.0, 1.06, 5.5, 540, 1000);
  const mx = -330, my = 760, mw = 1740, mh = 670, sh = -lt * 40, lit = sm(0.3, 4, lt);
  window.DOTS.forEach(([u, v], i) => { const on = hash(i * 3.7) < lit * 0.09; ctx.fillStyle = on ? '#ffd23a' : 'rgba(150,170,255,0.28)'; const s = on ? 10 : 8; ctx.fillRect(mx + sh + u * mw - s / 2, my + v * mh - s / 2, s, s); });
  const n = Math.round(280 * eOut(sm(0.3, 3.8, lt)));
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 150px Oswald'; ctx.lineWidth = 14; ctx.strokeStyle = '#000'; const s = `${n} 000 000`; ctx.strokeText(s, 540, 1590); ctx.fillStyle = '#ffd23a'; ctx.fillText(s, 540, 1590);
  ctx.font = '700 50px Oswald'; ctx.lineWidth = 8; ctx.strokeText('ЧЕЛОВЕК В МИРЕ', 540, 1720); ctx.fillStyle = '#fff'; ctx.fillText('ЧЕЛОВЕК В МИРЕ', 540, 1720);
  ctx.restore();
}
// 13. curtains open, light floods in
function dCurtains(ctx, lt, t) {
  const p = eOut(sm(0.4, 3.2, lt));
  bg(ctx, mix('#2a3058', '#3a7a5a', p), '#081410', 540, 800, 1500);
  ctx.save(); camera(ctx, lt, 1.0, 1.07, 5.5, 540, 1100);
  const wx = 220, wy = 420, ww = 640, wh = 760;
  ctx.fillStyle = linear(ctx, 0, wy, 0, wy + wh, [[0, '#ffe2a0'], [0.6, '#ffb07a'], [1, '#7ad0a0']]); ctx.fillRect(wx, wy, ww, wh);
  glow(ctx, 540, 1000, 380, 'rgba(255,250,210,1)', p); ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(540, 1050, 120, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = '#102018'; ctx.lineWidth = 24; ctx.strokeRect(wx, wy, ww, wh);
  ctx.fillStyle = `rgba(255,240,190,${0.22 * p})`; ctx.beginPath(); ctx.moveTo(wx, wy + wh); ctx.lineTo(wx + ww, wy + wh); ctx.lineTo(1100, 1920); ctx.lineTo(-20, 1920); ctx.fill();
  for (const s of [-1, 1]) { const cw = lerp(ww / 2 + 20, 90, p), x = s < 0 ? wx - 30 : wx + ww + 30 - cw; ctx.fillStyle = '#5a4a8a'; ctx.fillRect(x, 380, cw, 880); ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 6; for (let k = 20; k < cw; k += 50) { ctx.beginPath(); ctx.moveTo(x + k, 380); ctx.lineTo(x + k, 1260); ctx.stroke(); } }
  drawPerson(ctx, 540, 1310, 4.2, { body: '#1a1a2a', head: '#1a1a2a', hair: '#0a0a12' });
  ctx.fillStyle = '#0c1a12'; ctx.fillRect(-20, 1640, 1120, 300);
  ctx.restore(); desat(ctx, 0.4 * (1 - p));
}
// 14. therapy + weeks calendar
function dTherapy(ctx, lt, t) {
  bg(ctx, '#1a9a5a', '#02200e', 540, 900, 1400);
  ctx.save(); camera(ctx, lt, 1.0, 1.05, 6.5, 540, 1100);
  const x0 = 170, y0 = 790, cw = 740 / 7, ch = 66;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; rrect(ctx, x0 - 30, y0 - 90, 800, 4 * ch + 130, 24); ctx.fill();
  ctx.font = '700 36px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('НЕДЕЛИ ЛЕЧЕНИЯ', 540, y0 - 50);
  for (let w = 0; w < 4; w++) { const hl = w >= 1 && sm(1.5 + w * 0.4, 1.9 + w * 0.4, lt);
    ctx.fillStyle = hl ? `rgba(61,255,122,${0.35 * hl})` : 'rgba(0,0,0,0)'; rrect(ctx, x0 - 10, y0 + w * ch, 760, ch - 8, 12); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '700 30px Oswald'; ctx.textAlign = 'right'; ctx.fillText(String(w + 1), x0 - 20, y0 + w * ch + 32);
    for (let d = 0; d < 7; d++) { const done = (w * 7 + d) / 28 < sm(0.3, 4.5, lt); ctx.fillStyle = done ? '#3dff7a' : 'rgba(255,255,255,0.25)'; ell(ctx, x0 + 40 + d * cw, y0 + w * ch + 30, 14, 14); ctx.fill(); } }
  // capsule
  ctx.save(); ctx.translate(540, 1180); ctx.rotate(-0.4); ctx.fillStyle = '#fff'; rrect(ctx, -70, -30, 70, 60, 30); ctx.fill(); ctx.fillStyle = '#3dff7a'; rrect(ctx, 0, -30, 70, 60, 30); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#0a3a22'; ctx.fillRect(0, 1450, W, 520);
  for (const [x, s] of [[300, 1], [780, -1]]) { ctx.fillStyle = '#6a3a2a'; rrect(ctx, x - 120, 1460, 240, 80, 28); ctx.fill(); rrect(ctx, x - s * 110 - 22, 1260, 44, 280, 18); ctx.fill(); }
  drawPerson(ctx, 300, 1260, 2.1, { body: '#2a3a5a', head: '#c8a090', hair: '#1b1220' });
  drawPerson(ctx, 780, 1260, 2.1, { body: '#5a2a3a', head: '#e0b090', hair: '#6a4a2a', longHair: true, glasses: true });
  ctx.restore();
}
// 15. small steps: walk outside
function dWalk(ctx, lt, t) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, 1500, [[0, '#7ac8ff'], [0.7, '#ffd8a0'], [1, '#ffb88a']]); ctx.fillRect(0, 0, W, H);
  ctx.save(); camera(ctx, lt, 1.0, 1.05, 6, 540, 1200);
  glow(ctx, 800, 700, 300, 'rgba(255,250,210,1)'); ctx.fillStyle = '#fff6d0'; ell(ctx, 800, 700, 90, 90); ctx.fill();
  const off = lt * 60; ctx.fillStyle = '#2a7a4a'; for (let i = -1; i < 7; i++) { const x = ((i * 220 - off) % 1540 + 1540) % 1540 - 200; ctx.fillRect(x - 12, 1150, 24, 200); ell(ctx, x, 1100, 110, 140); ctx.fill(); }
  ctx.fillStyle = '#3a9a5a'; ctx.fillRect(0, 1330, W, 600); ctx.fillStyle = '#d8c8a0'; ctx.beginPath(); ctx.moveTo(380, 1920); ctx.lineTo(500, 1330); ctx.lineTo(580, 1330); ctx.lineTo(760, 1920); ctx.fill();
  const bob = Math.abs(Math.sin(t * 5)) * 14; drawPerson(ctx, 540, 1250 - bob, 3.2, { body: '#2f6a8a', head: '#e0a88e', hair: '#1b1220' });
  ctx.strokeStyle = '#1a2a3a'; ctx.lineWidth = 34; ctx.lineCap = 'round'; const sw = Math.sin(t * 5) * 40; ctx.beginPath(); ctx.moveTo(510, 1720 - bob); ctx.lineTo(500 + sw, 1820); ctx.moveTo(570, 1720 - bob); ctx.lineTo(580 - sw, 1820); ctx.stroke();
  ctx.restore();
  ['ПРОГУЛКА', 'РЕЖИМ СНА', 'ЗВОНОК ДРУГУ'].forEach((s, i) => { const a = eBack(sm(1.6 + i * 0.6, 2.0 + i * 0.6, lt)); if (a <= 0) return; ctx.save(); ctx.translate(540, 790 + i * 105); ctx.scale(a, a);
    ctx.font = '700 48px Oswald'; const w = ctx.measureText(s).width + 120; ctx.fillStyle = 'rgba(0,0,0,0.6)'; rrect(ctx, -w / 2, -42, w, 84, 42); ctx.fill(); ctx.strokeStyle = '#3dff7a'; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = '#3dff7a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-w / 2 + 28, 0); ctx.lineTo(-w / 2 + 42, 16); ctx.lineTo(-w / 2 + 68, -16); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 30, 3); ctx.restore(); });
}
// 16. help plate + sources
function dFinal(ctx, lt, t) {
  ctx.save(); camera(ctx, lt, 1.0, 1.04, 6, 540, 1000); dCurtainsStatic(ctx, t); ctx.restore();
  ctx.fillStyle = 'rgba(0,10,5,0.6)'; ctx.fillRect(0, 0, W, H);
  const a = eBack(sm(0.1, 0.5, lt)); ctx.save(); ctx.translate(540, 960); ctx.scale(a, a);
  ctx.fillStyle = 'rgba(8,20,14,0.9)'; rrect(ctx, -450, -290, 900, 580, 40); ctx.fill(); ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 10; ctx.stroke();
  warnIcon(ctx, 0, -190, 1.2);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 60px Oswald'; ctx.fillStyle = '#fff';
  ctx.fillText('ЕСЛИ ПОЯВИЛИСЬ МЫСЛИ', 0, -80); ctx.fillText('НАВРЕДИТЬ СЕБЕ —', 0, -5); ctx.fillStyle = '#3dff7a'; ctx.fillText('ЗВОНИ 112', 0, 85); ctx.fillStyle = '#fff'; ctx.font = '700 48px Oswald'; ctx.fillText('ИЛИ НА ТЕЛЕФОН ДОВЕРИЯ', 0, 165); ctx.restore();
  const sa = sm(1.0, 1.4, lt); ctx.save(); ctx.globalAlpha = sa; ctx.fillStyle = 'rgba(0,0,0,0.65)'; rrect(ctx, 200, 1700, 680, 80, 40); ctx.fill(); ctx.font = '400 36px Oswald'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Источники: ВОЗ (2023), StatPearls (NIH)', 540, 1741); ctx.restore();
}
function dCurtainsStatic(ctx, t) { dCurtains(ctx, 5, t); }

const SCENES = [
  [0, 3, dHook], [3, 8, dLazy],
  [8, 14, dAlarm], [14, 20, dAnhedonia], [20, 26, dEnergy],
  [26, 32, dAmyNeg], [32, 38, dFrontal], [38, 44, dCortisol], [44, 50, dSynapse],
  [50, 55.5, dCancel], [55.5, 61, dLoop], [61, 66.5, dThoughts], [66.5, 72, dWorld],
  [72, 77.5, dCurtains], [77.5, 84, dTherapy], [84, 90, dWalk], [90, 96, dFinal],
];
const CAPS = [
  { t0: 0.15, t1: 2.95, y: 1560, size: 112, text: 'Что такое\n*депрессия?*', accent: BLU, stagger: 0.12 },
  { t0: 3.25, t1: 7.95, y: 1010, size: 78, text: '*Это не лень.*\nЭто болезнь, которая забирает силы', accent: BLU },
  { t0: 8.3, t1: 13.95, y: 420, size: 76, text: 'Не грусть пару дней, а подавленность *две недели и дольше*', accent: YEL },
  { t0: 14.3, t1: 19.95, size: 72, y: 420, text: 'Пропадает радость от того, что раньше нравилось. Это называется *ангедония*', accent: YEL },
  { t0: 20.3, t1: 25.95, size: 70, y: 420, text: 'Сил нет даже на простые дела. Сон ломается: *бессонница* или сон по 12 часов', accent: YEL },
  { t0: 26.3, t1: 31.95, size: 72, y: 420, text: 'Миндалина сильнее реагирует на плохое. Мозг замечает прежде всего *негатив*', accent: YEL },
  { t0: 32.3, t1: 37.95, size: 72, y: 420, text: 'Лобная кора, которая помогает планировать и решать, работает *слабее*', accent: YEL },
  { t0: 38.3, t1: 43.95, size: 66, y: 420, text: 'Часто сбоит система стресса: *кортизол* держится высоким. Это бьёт по сну, аппетиту и памяти', accent: YEL },
  { t0: 44.3, t1: 49.95, size: 72, y: 420, text: 'Нейронам труднее создавать новые связи. Дело *не только в серотонине*', accent: YEL },
  { t0: 50.3, t1: 55.45, size: 80, y: 420, text: 'Нет сил, и человек *отменяет* встречи и дела', accent: PNK },
  { t0: 55.8, t1: 60.95, size: 70, y: 420, text: 'Меньше дел — меньше радости. Меньше радости — меньше сил. *Петля* замыкается', accent: PNK },
  { t0: 61.3, t1: 66.45, size: 68, y: 420, text: 'Мозг подбрасывает мысли «я бесполезен», «так будет всегда». Это *симптом*, а не правда', accent: PNK },
  { t0: 66.8, t1: 71.95, size: 72, y: 420, text: 'Депрессия есть примерно у *280 миллионов* человек. Женщины болеют чаще', accent: PNK },
  { t0: 72.3, t1: 77.45, size: 80, y: 420, text: 'Депрессия *лечится*. Для неё есть эффективная терапия', accent: GRN },
  { t0: 77.8, t1: 83.95, size: 66, y: 420, text: 'Помогают психотерапия и антидепрессанты. Таблетки действуют не сразу, обычно через *2–4 недели*', accent: GRN },
  { t0: 84.3, t1: 89.95, size: 68, y: 420, text: 'Маленькие шаги: прогулка, режим сна, звонок другу. *Действие идёт раньше* мотивации', accent: GRN },
];
function gradeCol(t) { if (t < 8) return ['#6a7090', 0.25]; if (t < 26) return ['#5a6a9a', 0.3]; if (t < 50) return ['#7a2ad0', 0.3]; if (t < 72) return ['#1a2a90', 0.35]; return ['#20d070', 0.28]; }
