// EP3 COLD OPEN — "Don't jump." The edge of the island on day 90, one block in an empty sky, the block's eyes, day 100. Title.
import { prog, shakeEnv } from '../../engine/AnimationSystem.js';
import { OX, OZ } from '../../story/ep3/stages.js';

const CUTS = [0, 1.6, 4.2, 6.4, 10.0];
export default function cold(W) {
  const sc = () => W.scenes;
  function update(t) {
    let res; const S = W.stages.sky;
    if (t < 1.6) { res = sc().s2.update(38.0); const h = S.hero.root.position; W.cam.apply({ pos: [h.x - 0.9, h.y + 2.1, h.z - 1.7], look: [h.x + 0.3, h.y - 8, h.z + 7], fov: 60, t }); }
    else if (t < 4.2) { res = sc().s1.update(6.0 + (t - 1.6) * 0.3); const k = prog(t, 1.6, 4.2); W.cam.apply({ pos: [OX + 26 - k * 6, 64 + k * 1.5, OZ + 30 - k * 7], look: [OX, 61.4, OZ], fov: 34, t }); }
    else if (t < 6.4) res = sc().s3.update(11.0 + (t - 4.2) * 0.5);
    else if (t < 10.0) { res = sc().s9.update(1.0); const a = 0.7 + (t - 6.4) * 0.12; W.cam.apply({ pos: [OX + Math.sin(a) * 15, 67, OZ + Math.cos(a) * 15], look: [OX, 61, OZ], fov: 45, t }); }
    else { res = sc().s5.update(8.2 + (t - 10.0) * 0.5); }
    const post = { ...(res.post || {}) };
    const since = Math.min(...CUTS.map(c => (t >= c ? t - c : 99)));
    post.flash = since < 0.12 && t > 0.1 ? 0.5 * (1 - since / 0.12) : 0; post.fade = t < 0.3 ? 1 - t / 0.3 : 0; post.letterbox = 0; post.zoomBlur = 0;
    if (t >= 10.0) { post.saturation = 0.7; post.vignette = 1.3; post.shake = shakeEnv(t, [[10, 0.5, 0.3]]); }
    return { stage: res.stage, post, noSubs: false };
  }
  function cues() {
    return [{ t: 0.1, id: 'windGust', gain: 0.6 }, { t: 1.6, id: 'whoosh', gain: 0.4 }, { t: 4.2, id: 'originChime', gain: 0.7 }, { t: 6.4, id: 'whoosh', gain: 0.4 },
      { t: 8.6, id: 'riser', gain: 0.7, dur: 1.4 }, { t: 10.0, id: 'titleHit', gain: 1 }, { t: 10.2, id: 'ghastCry', gain: 0.5 }];
  }
  return { update, cues };
}
