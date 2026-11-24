// ============ overlays: subtitles, infographics, title cards, post-processing ============
const YEL = '#ffd23a', RED = '#ff3b3b', CYAN = '#5fd8ff', GRN = '#52e07a';

// --- subtitles: classic two-line captions, one cue per phrase (same split as the exported SRT) ---
// cue rule (mirrored in tools/voice.py): up to ~84 characters, prefer ending at . ! ? then , ; : —
let SUBS = [];
const SUB_MAX = 84;
function splitCues(words) {
  const cues = []; let cur = [];
  const len = a => a.map(w => w.w).join(' ').length;
  words.forEach((w, i) => {
    cur.push(w); const n = words[i + 1], L = len(cur);
    const strong = /[.!?…]$/.test(w.w), weak = /[,;:—]$/.test(w.w);
    if (!n || (strong && L > 30) || (weak && L > 55) || L + 1 + n.w.length > SUB_MAX) { cues.push(cur); cur = []; }
  });
  return cues;
}
function twoLines(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return [text];
  const ws = text.split(' '); let best = null;
  for (let k = 1; k < ws.length; k++) { const a = ws.slice(0, k).join(' '), b = ws.slice(k).join(' '); const d = Math.max(ctx.measureText(a).width, ctx.measureText(b).width); if (!best || d < best[0]) best = [d, [a, b]]; }
  return best[1];
}
function buildSubs(lines) {
  SUBS = [];
  for (const L of lines) { const cs = splitCues(L.words); cs.forEach((c, i) => SUBS.push({ s: c[0].s, e: i < cs.length - 1 ? cs[i + 1][0].s - 0.04 : L.end + 0.35, text: c.map(w => w.w).join(' ') })); }
}
function drawSubs(ctx, t) {
  const c = SUBS.find(x => t >= x.s && t < x.e); if (!c) return;
  const size = 44, lh = size * 1.28; ctx.save(); ctx.font = `500 ${size}px Roboto`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const rows = twoLines(ctx, c.text, 1500), yb = H - 78;
  ctx.globalAlpha = clamp((t - c.s) / 0.12) * clamp((c.e - t) / 0.12);
  rows.forEach((r, i) => {
    const y = yb - (rows.length - 1 - i) * lh;
    ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.strokeText(r, W / 2, y);
    ctx.shadowColor = 'transparent'; ctx.fillStyle = '#ffffff'; ctx.fillText(r, W / 2, y);
  });
  ctx.restore();
}

// --- infographic badge: big number with label, pops in ---
function badge(ctx, x, y, lt, dur, big, small, o = {}) {
  const a = clamp(lt / 0.25) * clamp((dur - lt) / 0.3); if (a <= 0) return;
  const s = eBack(clamp(lt / 0.4)); ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `700 ${o.size || 84}px Oswald`; const bw = Math.max(ctx.measureText(big).width, 200) + 70, bh = (o.size || 84) * 1.75;
  ctx.fillStyle = 'rgba(10,14,28,0.72)'; rrect(ctx, -bw / 2, -bh / 2, bw, bh, 18); ctx.fill();
  ctx.strokeStyle = o.col || YEL; ctx.lineWidth = 4; ctx.stroke();
  label(ctx, big, 0, -bh * 0.1, o.size || 84, { col: o.col || YEL, stroke: false });
  label(ctx, small, 0, bh * 0.32, (o.size || 84) * 0.36, { col: '#fff', stroke: false });
  ctx.restore();
}
// counting number
const fmtNum = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
// arrow with label (speed vector)
function speedArrow(ctx, x, y, len, txt, o = {}) {
  const a = o.a ?? 1; if (a <= 0 || len < 2) { if (txt && a > 0) label(ctx, txt, x, y - 34, o.size || 30, { col: o.col || YEL, alpha: a }); return; }
  ctx.save(); ctx.globalAlpha *= a; const col = o.col || YEL, w = o.w || 10;
  ctx.strokeStyle = '#000'; ctx.lineWidth = w + 6; ctx.lineCap = 'round'; line(ctx, x, y, x + len - w * 1.5, y);
  ctx.strokeStyle = col; ctx.lineWidth = w; line(ctx, x, y, x + len - w * 1.5, y);
  ctx.fillStyle = col; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; poly(ctx, [[x + len + w, y], [x + len - w * 2, y - w * 2], [x + len - w * 2, y + w * 2]]); ctx.fill(); ctx.stroke();
  if (txt) label(ctx, txt, x + len / 2, y - 34, o.size || 30, { col });
  ctx.restore();
}
// big stamped text (e.g. "1 СЕКУНДА")
function stamp(ctx, txt, x, y, lt, dur, o = {}) {
  const a = clamp(lt / 0.08) * clamp((dur - lt) / 0.25); if (a <= 0) return;
  const s = lerp(o.from || 1.8, 1, eOut(clamp(lt / 0.25))); ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha = a;
  label(ctx, txt, 0, 0, o.size || 120, { col: o.col || '#fff', sw: 0.12 }); ctx.restore();
}
function lowerThird(ctx, lt, dur, title, sub) {
  const a = clamp(lt / 0.3) * clamp((dur - lt) / 0.4); if (a <= 0) return;
  const x = 90 - (1 - eOut(lt / 0.5)) * 80, y = 120; ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = YEL; ctx.fillRect(x, y - 38, 8, 76);
  label(ctx, title, x + 30, y - 10, 46, { align: 'left' }); if (sub) label(ctx, sub, x + 30, y + 30, 26, { align: 'left', col: 'rgba(255,255,255,0.85)' });
  ctx.restore();
}
function chapterCard(ctx, lt, dur, num, title) {
  const a = clamp(lt / 0.3) * clamp((dur - lt) / 0.4); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; const x = W - 90, y = 110;
  label(ctx, num, x, y - 26, 26, { align: 'right', col: YEL });
  label(ctx, title, x + (1 - eOut(lt / 0.5)) * 60, y + 16, 50, { align: 'right' });
  ctx.fillStyle = YEL; const w = 220 * eOut((lt - 0.2) / 0.5); ctx.fillRect(x - w, y + 50, w, 5); ctx.restore();
}

// --- post processing ---
let GRAIN = null;
function makeGrain() { GRAIN = [0, 1, 2, 3].map(k => { const c = mk(480, 270), g = c.getContext('2d'), d = g.createImageData(480, 270), r = rng(k + 100); for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); return c; }); }
function post(ctx, t, o = {}) {
  if (o.grade) { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = o.grade[1]; ctx.fillStyle = o.grade[0]; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  ctx.fillStyle = radial(ctx, W / 2, H / 2, W * 0.75, [[0.55, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${o.vig ?? 0.5})`]]); ctx.fillRect(0, 0, W, H);
  if (!GRAIN) makeGrain();
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.grain ?? 0.07; ctx.drawImage(GRAIN[Math.floor(t * 24) % 4], 0, 0, W, H); ctx.restore();
}
// chromatic split + flash for impacts (operates on finished frame)
function impact(ctx, k, cv) {
  if (k <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 * k; ctx.drawImage(cv, 14 * k, 0); ctx.drawImage(cv, -14 * k, 0); ctx.restore();
}
