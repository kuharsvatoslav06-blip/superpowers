// EP2 COLD OPEN — flash-forward: the Archive, "THEY'RE ALL YOU", the Watcher's eyes, the fall. Then the title.
import { shakeEnv, prog } from '../../engine/AnimationSystem.js';
import { WPOS } from './s7_watcher.js';

const CUTS = [0, 2.2, 4.4, 6.6, 9.0];
export default function cold(W) {
  const sc = () => W.scenes;
  function update(t) {
    let res;
    if (t < 2.2) res = sc().s6.update(9.0 + t * 0.8);
    else if (t < 4.4) {
      res = sc().s7.update(41.0 + (t - 2.2) * 0.3); const A = W.stages.archive; A.zeroSign.sign.setText(["THEY'RE", 'ALL YOU.']);
      const z = A.zero.root.position; W.cam.apply({ pos: [z.x + 1.6, 2.3, z.z + 1.6], look: [z.x, 2.1, z.z], fov: 42, t });
    } else if (t < 6.6) {
      res = sc().s7.update(7.0); const k = prog(t, 4.4, 6.6);
      W.stages.archive.lamps.forEach(L => (L.intensity = 0));
      W.cam.apply({ pos: [WPOS[0] - 2.4 + k * 0.6, 9.0, WPOS[2] + 2.4 - k * 0.6], look: [WPOS[0], 9.3, WPOS[2]], fov: 36, t, shake: shakeEnv(t, [[4.4, 0.3, 0.3]]) });
    } else if (t < 9.0) res = sc().s5.update(58.6 + (t - 6.6) * 0.8);
    else res = sc().s4.update(49.5 + (t - 9.0) * 0.4);
    const post = { ...(res.post || {}) };
    const since = Math.min(...CUTS.map(c => (t >= c ? t - c : 99)));
    post.glitch = Math.max(post.glitch || 0, since < 0.18 ? 0.8 * (1 - since / 0.18) : 0); post.rgb = Math.max(post.rgb || 0, since < 0.25 ? 1 : 0.2);
    post.letterbox = 0; post.fade = 0; post.flash = 0; post.zoomBlur = 0;
    if (t >= 9.0) { post.saturation = 0.6; post.vignette = 1.4; }
    return { stage: res.stage, post };
  }
  function cues() {
    return [{ t: 0, id: 'glitch', gain: 0.9 }, { t: 0.05, id: 'impact', gain: 0.7 }, { t: 2.2, id: 'glitchShort', gain: 0.8 }, { t: 2.3, id: 'signFlip', gain: 0.6 },
      { t: 4.4, id: 'glitchShort', gain: 0.8 }, { t: 4.5, id: 'enderAmbient', gain: 0.6 }, { t: 6.6, id: 'glitchShort', gain: 0.8 }, { t: 6.7, id: 'whooshDown', gain: 0.7 },
      { t: 7.6, id: 'riser', gain: 0.7, dur: 1.4 }, { t: 9.0, id: 'titleHit', gain: 1 }, { t: 9.85, id: 'glitch', gain: 0.6 }];
  }
  return { update, cues };
}
