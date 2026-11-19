// Analytic particle systems: every particle position is a closed-form function of time,
// so effects are fully deterministic and frames can be rendered out of order.
import * as THREE from 'three';
import { hash, clamp, TAU } from './AnimationSystem.js';

const VS = `attribute float size; attribute float alpha; attribute vec3 color; varying float vA; varying vec3 vC;
uniform float scale;
void main(){ vA = alpha; vC = color; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * scale / -mv.z; gl_Position = projectionMatrix * mv; }`;
const FS = `varying float vA; varying vec3 vC; uniform float glow;
void main(){ vec2 d = gl_PointCoord - 0.5; float r = max(abs(d.x),abs(d.y)); if (vA < 0.01) discard;
  float a = glow > 0.5 ? vA * smoothstep(0.5, 0.0, length(d)) : vA * step(r, 0.5);
  gl_FragColor = vec4(vC, a); }`;

export class ParticleField {
  constructor(capacity = 2000, { additive = false, glow = false } = {}) {
    this.cap = capacity;
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(capacity * 3); this.col = new Float32Array(capacity * 3); this.size = new Float32Array(capacity); this.alpha = new Float32Array(capacity);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1)); g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1));
    this.mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, uniforms: { scale: { value: 540 }, glow: { value: glow ? 1 : 0 } } });
    this.points = new THREE.Points(g, this.mat); this.points.frustumCulled = false; this.points.renderOrder = 5;
    this.emitters = []; this.n = 0; this._c = new THREE.Color();
  }
  add(e) { this.emitters.push(e); return e; }
  clear() { this.emitters.length = 0; }
  _push(x, y, z, color, size, alpha) {
    if (this.n >= this.cap) return; const i = this.n++;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this._c.set(color); this.col[i * 3] = this._c.r; this.col[i * 3 + 1] = this._c.g; this.col[i * 3 + 2] = this._c.b;
    this.size[i] = size; this.alpha[i] = alpha;
  }
  update(t, viewportH = 1080) {
    this.n = 0; this.mat.uniforms.scale.value = viewportH * 0.5;
    for (const e of this.emitters) if (e.enabled !== false) e.emit(t, this._push.bind(this));
    for (let i = this.n; i < this.cap; i++) this.alpha[i] = 0;
    const g = this.points.geometry; for (const k of ['position', 'color', 'size', 'alpha']) g.attributes[k].needsUpdate = true;
    g.setDrawRange(0, Math.max(this.n, 1));
  }
}

const pick = (arr, h) => arr[Math.floor(h * arr.length) % arr.length];

/** One-shot explosion of cubes (block break, teleport, spawn sparkle). */
export function burst({ t0, pos, n = 24, colors = ['#888'], speed = 3, up = 2, gravity = 9, life = 0.9, size = 0.12, seed = 1, spread = 0.4, implode = false }) {
  return { emit(t, push) {
    const lt = t - t0; if (lt < 0 || lt > life) return;
    for (let i = 0; i < n; i++) {
      const h1 = hash(seed * 31 + i), h2 = hash(seed * 17 + i * 3.1), h3 = hash(seed * 7 + i * 5.7), h4 = hash(seed + i * 9.3);
      const a = h1 * TAU, el = h2; const v = speed * (0.4 + h3 * 0.6);
      const vx = Math.cos(a) * v * (1 - el * 0.5), vz = Math.sin(a) * v * (1 - el * 0.5), vy = up * (0.3 + el);
      let k = lt; if (implode) k = life - lt;
      const x = pos[0] + (h4 - 0.5) * spread + vx * k, y = pos[1] + (h2 - 0.5) * spread + vy * k - (implode ? 0 : 0.5 * gravity * k * k), z = pos[2] + (h1 - 0.5) * spread + vz * k;
      const fade = implode ? clamp(lt / life * 3) : 1 - Math.pow(lt / life, 2);
      push(x, y, z, pick(colors, h3), size * (0.6 + h4 * 0.8) * (implode ? 1 : 1 - lt / life * 0.5), fade);
    }
  } };
}
/** Slowly drifting motes inside a box, looping. */
export function motes({ center, extent = [10, 4, 10], n = 120, colors = ['#ffffff'], size = 0.05, speed = 0.15, alpha = 0.6, seed = 3, twinkle = true }) {
  return { emit(t, push) {
    for (let i = 0; i < n; i++) {
      const h = [hash(seed + i * 1.3), hash(seed + i * 2.7), hash(seed + i * 4.1), hash(seed + i * 5.9)];
      const x = center[0] + (((h[0] + t * speed * (h[3] - 0.5) * 0.2) % 1 + 1) % 1 - 0.5) * extent[0];
      const y = center[1] + (((h[1] + t * speed * 0.05 * (0.5 + h[2])) % 1 + 1) % 1 - 0.5) * extent[1];
      const z = center[2] + (((h[2] + t * speed * (h[0] - 0.5) * 0.2) % 1 + 1) % 1 - 0.5) * extent[2];
      const tw = twinkle ? 0.5 + 0.5 * Math.sin(t * (1 + h[3] * 3) + h[0] * 20) : 1;
      push(x, y, z, pick(colors, h[3]), size * (0.6 + h[1]), alpha * tw);
    }
  } };
}
/** Particles spiralling up around an axis (portal, ender aura). */
export function swirl({ center, radius = 0.6, height = 2.5, n = 60, colors = ['#b050ff'], size = 0.09, speed = 0.6, alpha = 0.9, seed = 5, intensity = () => 1, inward = false }) {
  return { emit(t, push) {
    const I = intensity(t); if (I <= 0.01) return;
    for (let i = 0; i < n; i++) {
      const h = hash(seed + i * 3.3), h2 = hash(seed + i * 7.1);
      const life = ((t * speed + h) % 1);
      const a = h2 * TAU + life * 3; const r = radius * (inward ? 1 - life : 0.4 + life * 0.6) * (0.6 + h * 0.6);
      push(center[0] + Math.cos(a) * r, center[1] + (life - 0.2) * height, center[2] + Math.sin(a) * r, pick(colors, h2), size * (0.5 + h), alpha * Math.sin(life * Math.PI) * I);
    }
  } };
}
/** Rain of falling pixels (glitch fragments). */
export function fall({ center, extent = [20, 10, 20], n = 100, colors = ['#ff00ff'], size = 0.1, speed = 3, seed = 9, intensity = () => 1, up = false }) {
  return { emit(t, push) {
    const I = intensity(t); if (I <= 0.01) return;
    for (let i = 0; i < n; i++) {
      const h = [hash(seed + i), hash(seed + i * 2.2), hash(seed + i * 3.9)]; const k = ((h[1] + t * speed / extent[1] * (0.5 + h[2])) % 1);
      const y = up ? center[1] - extent[1] / 2 + k * extent[1] : center[1] + extent[1] / 2 - k * extent[1];
      push(center[0] + (h[0] - 0.5) * extent[0], y, center[2] + (h[2] - 0.5) * extent[2], pick(colors, h[2]), size, I * Math.sin(k * Math.PI));
    }
  } };
}
