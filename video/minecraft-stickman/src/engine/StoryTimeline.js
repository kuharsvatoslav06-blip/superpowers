// StoryTimeline: maps global time -> scene + local time, evaluates scene transitions,
// and gathers every timed audio cue (scene-authored, motion-derived, UI-derived) into one sorted list.
import { SCENES, DURATION } from '../story/script.js';
import { clamp, Ease } from './AnimationSystem.js';

export class StoryTimeline {
  constructor(sceneImpls) { this.scenes = SCENES.map(s => ({ ...s, impl: sceneImpls[s.id] })); this.duration = DURATION; }
  locate(t) {
    t = clamp(t, 0, this.duration - 1e-6);
    for (let i = 0; i < this.scenes.length; i++) { const s = this.scenes[i]; if (t < s.start + s.dur) return { i, s, lt: t - s.start }; }
    const i = this.scenes.length - 1; return { i, s: this.scenes[i], lt: t - this.scenes[i].start };
  }
  /** Post-processing contribution of the transitions around time t. */
  transition(t) {
    const { i, s, lt } = this.locate(t); const out = {};
    const apply = (tr, k, incoming) => { // k: 0 at the cut point -> 1 at the far edge of the transition
      const v = 1 - k;
      switch (tr.type) {
        case 'fade': out.fade = Math.max(out.fade || 0, Ease.inOut(v)); break;
        case 'flash': out.flash = Math.max(out.flash || 0, incoming ? Ease.in(v) : Ease.in3(v)); break;
        case 'blocks': out.wipe = Math.max(out.wipe || 0, incoming ? v : v); out.wipeColor = [0, 0, 0]; break;
        case 'glitch': out.glitch = Math.max(out.glitch || 0, v * 1.2); out.rgb = Math.max(out.rgb || 0, v); if (v > 0.8) out.fade = Math.max(out.fade || 0, (v - 0.8) * 5 * 0.6); break;
        case 'warp': out.warp = Math.max(out.warp || 0, Ease.in(v) * 1.4); out.flash = Math.max(out.flash || 0, Math.pow(v, 3)); out.flashColor = [0.75, 0.4, 1]; break;
        default: break;
      }
    };
    const half = tr => (tr.dur || 0) / 2;
    if (s.transition && s.transition.type !== 'cut' && lt < half(s.transition)) apply(s.transition, lt / half(s.transition), true);
    const next = this.scenes[i + 1];
    if (next && next.transition && next.transition.type !== 'cut') { const h = half(next.transition); const rem = s.dur - lt; if (rem < h) apply(next.transition, rem / h, false); }
    return out;
  }
  cues(extra = []) {
    const out = [...extra];
    for (const s of this.scenes) { const c = s.impl?.cues?.() || []; for (const e of c) if (e.t >= -0.01 && e.t <= s.dur + 0.5) out.push({ ...e, t: s.start + e.t, scene: s.id }); }
    return out.sort((a, b) => a.t - b.t);
  }
}
