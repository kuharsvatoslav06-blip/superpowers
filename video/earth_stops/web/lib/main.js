// ============ main render loop ============
// story.json drives scene order/durations; timing.json (from tools/voice.py) drives subtitles.
const SCN = {};            // scene registry: SCN[id] = { design: seconds, draw(ctx, lt, d, t, k) }
let STORY = null, PLAN = [], TIMING = null;
// narration timing helpers for syncing visuals to the voice (global seconds)
function VO(id, n) { const L = TIMING && TIMING.lines.find(l => l.scene === id && l.n === n); return L || { start: 1e9, end: 1e9, words: [] }; }
function VOword(id, n, re) { const L = VO(id, n); const w = L.words.find(x => re.test(x.w)); return w ? w.s : L.start; }
function SC0(id) { const p = PLAN.find(q => q.id === id); return p ? p.start : 0; }
const cv = document.getElementById('c'), ctx = cv.getContext('2d');

function planScenes(story) {
  let s = 0; PLAN = story.scenes.map(sc => { const p = { ...sc, start: s, end: s + sc.dur }; s += sc.dur; return p; });
  return s;
}
function drawSceneAt(g, i, t) {
  const sc = PLAN[i], fn = SCN[sc.id]; g.save();
  if (!fn) { g.fillStyle = '#222'; g.fillRect(0, 0, W, H); label(g, sc.title || sc.id, W / 2, H / 2, 60); }
  else fn.draw(g, t - sc.start, sc.dur, t, sc.dur / fn.design);
  g.restore();
}
function render(t) {
  poolTop = 0;
  let i = PLAN.findIndex(p => t >= p.start && t < p.end); if (i < 0) i = PLAN.length - 1;
  const sc = PLAN[i], lt = t - sc.start, tin = sc.in || { type: 'cut' };
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const td = tin.d ?? 0.6;
  if (i > 0 && tin.type !== 'cut' && lt < td) {
    const A = borrow(), B = borrow();
    drawSceneAt(A.getContext('2d'), i - 1, t); drawSceneAt(B.getContext('2d'), i, t);
    transition(ctx, A, B, lt / td, tin.type); giveBack(); giveBack();
  } else drawSceneAt(ctx, i, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  post(ctx, t, { grade: sc.grade, vig: sc.vig, grain: sc.grain });
  if (STORY.subtitles !== false) drawSubs(ctx, t);
  // global fade in/out
  if (t < 0.8) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.8})`; ctx.fillRect(0, 0, W, H); }
  const total = PLAN[PLAN.length - 1].end; if (t > total - 1.5) { ctx.fillStyle = `rgba(0,0,0,${sm(total - 1.5, total - 0.2, t)})`; ctx.fillRect(0, 0, W, H); }
}
window.init = async (story, timing) => {
  STORY = story; TIMING = timing; const total = planScenes(story);
  buildSubs(timing ? timing.lines : []);
  await document.fonts.load('700 50px Oswald'); await document.fonts.load('700 50px Oswald', 'ЖЖ'); await document.fonts.ready;
  await loadGlobeTextures();
  return { total, scenes: PLAN.map(p => [p.id, p.start, p.end]) };
};
// audio plan: scenes declare cues next to their visuals -> build/plan.json -> tools/audio.py
// SCN[id].cues(S) gets S = {t0, dur, k, shots: [global shot start times]} and returns
// [{t, type, d?, gain?, pan?}] (sound effects / ambience) and [{t, music: mood, fade?}] (score changes)
window.exportPlan = () => PLAN.map(p => {
  const fn = SCN[p.id], k = fn ? p.dur / fn.design : 1; let acc = p.start; const shots = [];
  if (fn && fn.shots) for (const d of fn.shots) { shots.push(+acc.toFixed(3)); acc += d * k; }
  const S = { t0: p.start, dur: p.dur, k, shots };
  return { id: p.id, start: p.start, dur: p.dur, music: p.music, shots, cues: fn && fn.cues ? fn.cues(S) : [] };
});
window.frame = (t, q = 0.9) => { render(t); return cv.toDataURL('image/jpeg', q); };
window.frameRaw = (t) => { render(t); };
