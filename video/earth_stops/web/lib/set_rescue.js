// ============ rescue & recovery sets: vehicles, tents, fire, calendar ============
function flashLights(ctx, x, y, t, cols = ['#ff2d2d', '#2d6bff']) { const on = Math.floor(t * 4) % 2; glow(ctx, x - 14, y, 60, rgba(cols[0], 0.8), on ? 1 : 0.15); glow(ctx, x + 14, y, 60, rgba(cols[1], 0.8), on ? 0.15 : 1); ctx.fillStyle = on ? cols[0] : '#661010'; ctx.fillRect(x - 24, y - 6, 20, 12); ctx.fillStyle = on ? '#102066' : cols[1]; ctx.fillRect(x + 4, y - 6, 20, 12); }
function drawService(ctx, kind, x, y, s, o = {}) {
  const t = o.t || 0, dir = o.dir || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const wheel = wx => { ctx.fillStyle = '#1c1c22'; circ(ctx, wx, -24, 24); ctx.fill(); ctx.fillStyle = '#9aa0aa'; circ(ctx, wx, -24, 10); ctx.fill(); };
  ctx.strokeStyle = INK; ctx.lineWidth = 3;
  if (kind === 'fire') {
    ctx.fillStyle = '#d62828'; rrect(ctx, -200, -160, 300, 136, 8); ctx.fill(); ctx.stroke(); rrect(ctx, 100, -130, 100, 106, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9ad1ee'; rrect(ctx, 140, -120, 50, 44, 6); ctx.fill(); ctx.fillStyle = '#c9ced6'; ctx.fillRect(-190, -178, 270, 12); ctx.strokeStyle = '#888'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) line(ctx, -185 + i * 30, -178, -185 + i * 30, -166);
    ctx.fillStyle = '#f4f4f4'; ctx.fillRect(-200, -70, 400, 10); flashLights(ctx, 150, -136, t); wheel(-130); wheel(-40); wheel(140);
  } else if (kind === 'ambulance') {
    ctx.fillStyle = '#f4f6f8'; rrect(ctx, -180, -170, 250, 146, 10); ctx.fill(); ctx.stroke(); rrect(ctx, 70, -120, 100, 96, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9ad1ee'; rrect(ctx, 105, -110, 55, 40, 6); ctx.fill(); ctx.fillStyle = '#e53935'; ctx.fillRect(-180, -80, 350, 12); ctx.fillRect(-80, -150, 50, 16); ctx.fillRect(-63, -167, 16, 50);
    flashLights(ctx, 0, -178, t); wheel(-110); wheel(110);
  } else if (kind === 'excavator') {
    ctx.fillStyle = '#333'; rrect(ctx, -150, -50, 300, 50, 25); ctx.fill(); ctx.fillStyle = '#555'; for (let i = 0; i < 7; i++) { circ(ctx, -120 + i * 40, -25, 14); ctx.fill(); }
    ctx.fillStyle = '#f5b700'; rrect(ctx, -110, -150, 180, 100, 10); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#9ad1ee'; ctx.fillRect(-90, -140, 60, 50);
    const a = -0.6 + Math.sin(t * 1.2) * 0.35, b = 1.2 + Math.sin(t * 1.2 + 1) * 0.4; ctx.strokeStyle = '#e0a400'; ctx.lineWidth = 22; ctx.lineCap = 'round';
    const j1 = [60 + Math.cos(a) * 200, -110 + Math.sin(a) * 200], j2 = [j1[0] + Math.cos(a + b) * 170, j1[1] + Math.sin(a + b) * 170];
    line(ctx, 60, -110, j1[0], j1[1]); line(ctx, j1[0], j1[1], j2[0], j2[1]); ctx.fillStyle = '#666'; ctx.save(); ctx.translate(j2[0], j2[1]); ctx.rotate(a + b); poly(ctx, [[0, -10], [50, -30], [60, 30], [0, 20]]); ctx.fill(); ctx.restore();
  } else if (kind === 'truck') {
    drawCar(ctx, 0, 0, 1, { kind: 'truck', col: '#2a7f62' });
  }
  ctx.restore();
}
function drawHeli(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1), s); ctx.rotate(o.tilt ?? 0.08);
  if (o.beam) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = linear(ctx, 0, 0, 0, 900, [[0, 'rgba(255,250,210,0.35)'], [1, 'rgba(255,250,210,0)']]); poly(ctx, [[-10, 20], [10, 20], [260, 900], [-180, 900]]); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = o.col || '#e04848'; ell(ctx, 0, 0, 70, 38); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#9ad1ee'; ell(ctx, 28, -6, 30, 22); ctx.fill(); ctx.fillStyle = o.col || '#e04848'; poly(ctx, [[-60, -10], [-180, -16], [-180, 0], [-60, 14]]); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#333'; ctx.lineWidth = 4; line(ctx, -40, 40, 50, 40); line(ctx, -20, 30, -20, 40); line(ctx, 30, 30, 30, 40); line(ctx, 0, -38, 0, -50);
  const b = Math.sin(t * 50); ctx.lineWidth = 6; line(ctx, -150 * b, -52, 150 * b, -52); ctx.lineWidth = 3; line(ctx, -180, -8 - 30 * b, -180, -8 + 30 * b);
  ctx.restore();
}
function drawTent(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const col = o.col || '#e9e4d8';
  ctx.fillStyle = col; poly(ctx, [[-130, 0], [-90, -110], [90, -110], [130, 0]]); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = shade(col, -0.25); poly(ctx, [[-30, 0], [0, -80], [30, 0]]); ctx.fill();
  if (o.cross) { ctx.fillStyle = '#e53935'; ctx.fillRect(-70, -80, 40, 12); ctx.fillRect(-56, -94, 12, 40); }
  if (o.label) label(ctx, o.label, 0, -128, 22, { col: '#fff' });
  ctx.restore();
}
function campfire(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#5a3c26'; ctx.lineWidth = 9; line(ctx, -40, 4, 40, -8); line(ctx, -40, -8, 40, 4); fire(ctx, t, 0, -2, 0.9); glow(ctx, 0, -30, 380, 'rgba(255,150,60,0.35)'); ctx.restore(); }
function calendarFlip(ctx, lt, d, from, to, unit, sub) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, H, [[0, '#101a30'], [1, '#22304d']]); ctx.fillRect(0, 0, W, H);
  const k = clamp((lt - 0.4) / (d - 1.6)), n = Math.round(lerp(from, to, eIO(k))), flip = (lt * 4) % 1;
  ctx.save(); ctx.translate(W / 2, H / 2 - 20); const s = eBack(clamp(lt / 0.4)); ctx.scale(s, s);
  ctx.fillStyle = '#f4f1ea'; rrect(ctx, -230, -230, 460, 440, 30); ctx.fill(); ctx.fillStyle = '#d62828'; rrect(ctx, -230, -230, 460, 110, [30, 30, 0, 0]); ctx.fill();
  ctx.fillStyle = '#333'; for (const x of [-120, 120]) { rrect(ctx, x - 12, -260, 24, 60, 10); ctx.fill(); }
  label(ctx, unit, 0, -175, 52, { col: '#fff', stroke: false });
  label(ctx, String(n), 0, 50, 220, { col: '#1d1d24', stroke: false });
  if (k > 0 && k < 1) { ctx.save(); ctx.globalAlpha = 1 - flip; ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-230, -120 + flip * 330, 460, 6); ctx.restore(); }
  ctx.restore();
  label(ctx, sub, W / 2, H - 230, 60, { col: YEL, alpha: sm(d - 1.4, d - 0.9, lt) });
}
function sunArcSky(ctx, k) {  // k 0..1 across a day (0 dawn, 0.5 noon, 1 night)
  const cols = k < 0.25 ? mixSky('dusk', 'morning', k * 4) : k < 0.6 ? mixSky('morning', 'day', (k - 0.25) / 0.35) : k < 0.8 ? mixSky('day', 'dusk', (k - 0.6) / 0.2) : mixSky('dusk', 'night', (k - 0.8) / 0.2);
  sky(ctx, cols); const a = PI * (1 - clamp(k / 0.85)); const sx = W / 2 + Math.cos(a) * 900, sy = 760 - Math.sin(a) * 620; if (k < 0.85) sun(ctx, sx, sy, 44, k > 0.65 ? '#ffd0a0' : '#fff6d8'); stars(ctx, 300, 4, k * 30, sm(0.78, 0.95, k));
}
function towerCrane(ctx, x, y, s, t, seed = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#f5b700'; ctx.lineWidth = 6;
  for (let k = 0; k < 12; k++) { line(ctx, -14, -k * 40, 14, -(k + 1) * 40); line(ctx, 14, -k * 40, -14, -(k + 1) * 40); }
  line(ctx, -14, 0, -14, -480); line(ctx, 14, 0, 14, -480);
  const a = Math.sin(t * 0.3 + seed) * 0.4; ctx.save(); ctx.translate(0, -480); ctx.scale(Math.cos(a), 1);
  line(ctx, -120, 0, 360, 0); line(ctx, -120, -16, 360, -16); ctx.fillStyle = '#555'; ctx.fillRect(-130, -10, 50, 40);
  const hx = 120 + Math.sin(t * 0.5 + seed) * 120, hy = 120 + Math.sin(t * 0.7 + seed) * 60; ctx.strokeStyle = '#333'; ctx.lineWidth = 2; line(ctx, hx, 0, hx, hy); ctx.fillStyle = '#7f8c8d'; ctx.fillRect(hx - 40, hy, 80, 20);
  ctx.restore(); ctx.restore();
}
// generic ground-level "camp" layout for recovery scenes (world coords around x0)
function campGround(ctx, x0, gy, t, o = {}) {
  ctx.fillStyle = o.ground || '#8a8270'; ctx.fillRect(x0 - 3000, gy, 6000, 800);
}
