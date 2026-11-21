// Shared helpers for episode 3 scenes.
import { sceneById } from '../../story/script.js';
import { speaking } from '../../engine/SubtitleSystem.js';
import { clamp, prog, smooth, Ease, noise1 } from '../../engine/AnimationSystem.js';
import { OX, OZ, TOP } from '../../story/ep3/stages.js';

/** 0..1 talking intensity of Origin with a syllable flutter, for its mouth. */
export const originTalk = (id, lt) => { const s = speaking(sceneById[id].start + lt, 'block'); return s > 0 ? clamp(0.25 + Math.abs(noise1(lt * 11)) * 1.1) : 0; };
/** Glow of Origin: on while it talks, fades in/out. */
export const originGlow = (id, lt, base = 0) => { let g = base; for (let d = 0; d <= 0.6; d += 0.15) { if (speaking(sceneById[id].start + lt - d, 'block') || speaking(sceneById[id].start + lt + d, 'block')) { g = Math.max(g, 1 - d / 0.8); } } return g; };
/** Blink: eyes open value with periodic blinks. */
export const blinkEyes = (t, open = 1, seed = 0) => { const b = (t + seed) % 4.1; return b < 0.14 ? open * Math.abs(b / 0.07 - 1) : open; };
/** Pop-in scale for a block that appears at time a. */
export const popIn = (t, a, d = 0.18) => (t < a ? 0 : Ease.outBack(clamp((t - a) / d)));
/** A parabolic arc between p0 and p1 with height h, k 0..1 */
export const arc = (p0, p1, h, k) => [p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k + 4 * h * k * (1 - k), p0[2] + (p1[2] - p0[2]) * k];
export const ORIGIN_TOP = [OX, TOP, OZ];
export { prog, smooth, clamp };
