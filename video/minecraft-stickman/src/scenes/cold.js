// COLD OPEN — a 4-second flash-forward montage, then the title slam. Built from the real scenes' frames.
import { shakeEnv, prog } from '../engine/AnimationSystem.js';

const CUTS = [0, 1.4, 2.6, 3.7, 4.4];

export default function cold(W) {
  const sc = () => W.scenes;
  function update(t) {
    let res;
    if (t < 1.4) { // the computer: WORLD STATUS: DELETING
      res = sc().s6.update(21.5 + t * 0.6);
      W.cam.apply({ pos: [0.3, 34.3, 25.6 - t * 0.6], look: [0, 34.3, 29.5], fov: 46, t, shake: shakeEnv(t, [[0, 0.4, 0.3]]) });
    } else if (t < 2.6) { // the stare
      res = sc().s4.update(37.0 + (t - 1.4));
      const k = prog(t, 1.4, 2.6);
      W.cam.apply({ pos: [-71.6 - k * 0.5, 7.7, -1.0 - k * 0.3], look: [-74.3, 7.8, -2.6], fov: 34, t });
    } else if (t < 3.7) { // the ground disappearing
      res = sc().s5.update(31.2 + (t - 2.6));
    } else if (t < 4.4) { // the chase
      res = sc().s3.update(37.6 + (t - 3.7));
    } else { // title over the three zombies with glowing eyes
      res = sc().s2.update(24.3 + (t - 4.4) * 0.4);
    }
    const post = { ...(res.post || {}) };
    const since = Math.min(...CUTS.map(c => (t >= c ? t - c : 99)));
    post.glitch = Math.max(post.glitch || 0, since < 0.18 ? 0.8 * (1 - since / 0.18) : 0);
    post.rgb = Math.max(post.rgb || 0, since < 0.25 ? 1 : 0.2);
    post.letterbox = 0;
    if (t >= 4.4) { post.saturation = 0.6; post.vignette = 1.4; }
    return { stage: res.stage, post, noSubs: false };
  }
  function cues() {
    return [
      { t: 0, id: 'glitch', gain: 0.9 }, { t: 0.05, id: 'impact', gain: 0.8 }, { t: 1.4, id: 'glitchShort', gain: 0.8 }, { t: 1.5, id: 'enderAmbient', gain: 0.5 },
      { t: 2.6, id: 'glitchShort', gain: 0.8 }, { t: 2.7, id: 'blockVanish', gain: 0.6 }, { t: 3.7, id: 'glitchShort', gain: 0.8 }, { t: 3.75, id: 'stepPhantom', gain: 0.6 },
      { t: 3.0, id: 'riser', gain: 0.7, dur: 1.4 }, { t: 4.4, id: 'titleHit', gain: 1 }, { t: 5.25, id: 'glitch', gain: 0.7 },
    ];
  }
  return { update, cues };
}
