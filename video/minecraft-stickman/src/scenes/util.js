// Shared helpers for scene scripts.
import { sceneById } from '../story/script.js';
import { speaking } from '../engine/SubtitleSystem.js';
import { LIGHT, mixLight } from '../engine/EnvironmentManager.js';
import { clamp, prog, smooth } from '../engine/AnimationSystem.js';

export const talker = (id, who = 'hero') => lt => speaking(sceneById[id].start + lt, who);
export const head = (st, dy = 1.72) => [st.pos[0], st.pos[1] + dy, st.pos[2]];
export const chest = st => [st.pos[0], st.pos[1] + 1.2, st.pos[2]];
export const off = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
/** Point in front of a character (yaw), at distance d and height h relative to its feet. */
export const front = (st, d, h = 1.6, side = 0) => [st.pos[0] + Math.sin(st.yaw) * d + Math.cos(st.yaw) * side, st.pos[1] + h, st.pos[2] + Math.cos(st.yaw) * d - Math.sin(st.yaw) * side];
export const light = (a, b, k) => (k <= 0 ? LIGHT[a] : k >= 1 ? LIGHT[b] : mixLight(LIGHT[a], LIGHT[b], k));
export const fadeIn = (t, a, d = 0.3) => smooth(prog(t, a, a + d));
export const pulse = (t, a, b, edge = 0.2) => clamp(Math.min((t - a) / edge, (b - t) / edge, 1), 0, 1);
/** Shake impulses from a list of times. */
export const impulses = (times, amp = 0.3, dec = 0.25) => times.map(t => [t, amp, dec]);
