// CameraController: keyframed shots (position / look-at / fov / roll), follow helpers, procedural shake + handheld drift.
import * as THREE from 'three';
import { Keys, noise1, lerp, Ease } from './AnimationSystem.js';

export class CameraController {
  constructor(aspect = 16 / 9) {
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.05, 1200);
    this._look = new THREE.Vector3();
  }
  /** s: {pos:[x,y,z], look:[x,y,z], fov, roll, shake, handheld, t} */
  apply(s) {
    const c = this.camera; const t = s.t || 0;
    const sh = s.shake || 0, hh = s.handheld ?? 0.02;
    const ox = noise1(t * 23 + 1) * sh * 0.25 + noise1(t * 0.9 + 10) * hh;
    const oy = noise1(t * 21 + 7) * sh * 0.25 + noise1(t * 0.8 + 20) * hh;
    const oz = noise1(t * 19 + 3) * sh * 0.15;
    c.position.set(s.pos[0] + ox, s.pos[1] + oy, s.pos[2] + oz);
    this._look.set(s.look[0] + ox * 0.5, s.look[1] + oy * 0.5, s.look[2]);
    c.up.set(0, 1, 0); c.lookAt(this._look);
    c.rotateZ((s.roll || 0) + noise1(t * 17 + 5) * sh * 0.03);
    if (c.fov !== (s.fov || 50)) { c.fov = s.fov || 50; c.updateProjectionMatrix(); }
  }
}

/**
 * Shot list helper. shots: [{t:[t0,t1], pos:[from,to] | pos, look:[from,to] | look, fov:[a,b] | a, roll, ease, shake}]
 * pos/look entries may be functions of local time (for following a character).
 */
export function shot(t, list) {
  let s = list[0]; for (const c of list) if (t >= c.t[0]) s = c;
  const k0 = Math.min(1, Math.max(0, (t - s.t[0]) / (s.t[1] - s.t[0])));
  const k = (typeof s.ease === 'function' ? s.ease : Ease[s.ease || 'inOut'])(k0);
  const val = (v, def) => {
    if (v === undefined) return def;
    if (typeof v === 'function') return v(t, k);
    if (v instanceof Keys) return v.at(t);
    if (Array.isArray(v) && Array.isArray(v[0])) return v[0].map((a, i) => lerp(a, v[1][i], k));
    if (Array.isArray(v) && typeof v[0] === 'function') { const a = v[0](t), b = v[1](t); return a.map((x, i) => lerp(x, b[i], k)); }
    if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' && typeof def === 'number') return lerp(v[0], v[1], k);
    return v;
  };
  return { pos: val(s.pos), look: val(s.look), fov: val(s.fov, 50), roll: val(s.roll, 0), shake: val(s.shake, 0), handheld: s.handheld, cut: s.t[0] };
}
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const orbit = (c, r, ang, h) => [c[0] + Math.sin(ang) * r, c[1] + h, c[2] + Math.cos(ang) * r];
