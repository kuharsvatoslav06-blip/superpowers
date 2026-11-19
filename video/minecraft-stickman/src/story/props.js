// Reusable props: torches, signs, chest, door, bed, portal, giant computer, reset button.
import * as THREE from 'three';
import { blockMesh, radialTex, atlas, tileUV, T } from '../engine/EnvironmentManager.js';
import { hash, TAU } from '../engine/AnimationSystem.js';

const lam = (c, e = 0) => new THREE.MeshLambertMaterial({ color: c, emissive: e });

export class Torch {
  constructor(pos, { wall = null, color = 0xffa040, light = null, intensity = 6, distance = 11 } = {}) {
    this.group = new THREE.Group(); this.group.position.set(...pos);
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 0.1), lam(0x8f6538)); stick.position.y = -0.1; this.group.add(stick);
    if (wall) { this.group.rotation.set(wall[0], 0, wall[1]); }
    this.flame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.14), new THREE.MeshBasicMaterial({ color: 0xffe08a })); this.flame.position.y = 0.24; this.group.add(this.flame);
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(255,170,60,0.9)'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, color }));
    this.glow.scale.setScalar(1.6); this.glow.position.y = 0.26; this.group.add(this.glow);
    this.light = light; this.baseI = intensity; this.distance = distance; this.color = color; this.seed = hash(pos[0] * 3 + pos[2]);
  }
  /** on: 0..1 */
  update(t, on = 1) {
    const f = 0.85 + 0.15 * Math.sin(t * 13 + this.seed * 20) * Math.sin(t * 7.3 + this.seed * 9);
    this.group.visible = on > 0.02; this.glow.material.opacity = on * f; this.flame.scale.setScalar(0.9 + 0.2 * f);
    if (this.light) { this.light.intensity = this.baseI * on * f; this.light.distance = this.distance; this.light.color.set(this.color); this.flame.getWorldPosition(this.light.position); }
  }
}

export function textCanvas(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { tex: t, canvas: cv, ctx: x };
}
function woodBoard(x, w, h) {
  x.fillStyle = '#b8925a'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(90,60,25,${0.12 + hash(i) * 0.15})`; x.fillRect(hash(i * 3) * w, hash(i * 7) * h, 30 + hash(i) * 80, 4); }
  x.strokeStyle = '#6e5230'; x.lineWidth = 12; x.strokeRect(6, 6, w - 12, h - 12);
}
export class Sign {
  constructor(lines, { post = true } = {}) {
    this.group = new THREE.Group();
    const { tex } = textCanvas(512, 256, (x, w, h) => {
      woodBoard(x, w, h); x.fillStyle = '#1a1209'; x.textAlign = 'center'; x.textBaseline = 'middle';
      const size = lines.length > 2 ? 50 : 62; x.font = `700 ${size}px Silkscreen`;
      lines.forEach((l, i) => x.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.15));
    });
    const side = lam(0x8a6a3a);
    this.board = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.08), [side, side, side, side, new THREE.MeshLambertMaterial({ map: tex, emissive: 0x222222, emissiveMap: tex }), side]);
    this.board.position.y = post ? 1.05 : 0; this.group.add(this.board);
    if (post) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.85, 0.09), lam(0x6e5230)); p.position.y = 0.42; this.group.add(p); }
  }
}

export class Chest {
  constructor(pos, yaw = 0) {
    this.group = new THREE.Group(); this.group.position.set(...pos); this.group.rotation.y = yaw;
    const A = atlas();
    const mk = (h, tiles) => { const g = new THREE.BoxGeometry(0.88, h, 0.88); const uv = g.attributes.uv; const order = [tiles.side, tiles.side, tiles.top, tiles.top, tiles.front, tiles.side];
      for (let f = 0; f < 6; f++) { const [u0, v0, u1, v1] = tileUV(order[f]); for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) ? u1 : u0, uv.getY(k) ? v1 : v0); } } return new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: A.tex })); };
    this.base = mk(0.62, { side: T.chest_side, top: T.chest_top, front: T.chest_side }); this.base.position.y = 0.31; this.group.add(this.base);
    this.lidPivot = new THREE.Group(); this.lidPivot.position.set(0, 0.62, -0.44); this.group.add(this.lidPivot);
    this.lid = mk(0.26, { side: T.chest_side, top: T.chest_top, front: T.chest_front }); this.lid.position.set(0, 0.13, 0.44); this.lidPivot.add(this.lid);
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(255,215,120,1)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    this.glow.position.set(0, 0.9, 0); this.glow.scale.setScalar(2.2); this.group.add(this.glow);
  }
  update(open = 0, glow = 0) { this.lidPivot.rotation.x = -open * 1.6; this.glow.material.opacity = glow; this.glow.visible = glow > 0.01; }
}

export class Door { // 1x2 door hinged on its left edge
  constructor(pos, yaw = 0) {
    this.group = new THREE.Group(); this.group.position.set(...pos); this.group.rotation.y = yaw;
    this.pivot = new THREE.Group(); this.pivot.position.x = -0.5; this.group.add(this.pivot);
    const A = atlas();
    const panel = (tile, y) => { const g = new THREE.BoxGeometry(1, 1, 0.16); const [u0, v0, u1, v1] = tileUV(tile); const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) ? u1 : u0, uv.getY(k) ? v1 : v0); const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: A.tex })); m.position.set(0.5, y, 0); return m; };
    this.pivot.add(panel(T.door_low, 0.5), panel(T.door_high, 1.5));
  }
  update(open = 0, shake = 0) { this.pivot.rotation.y = open * 1.5; this.group.position.x += 0; this.pivot.position.z = shake; }
}

export class Bed {
  constructor(pos, yaw = 0) {
    this.group = new THREE.Group(); this.group.position.set(...pos); this.group.rotation.y = yaw;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 1), lam(0x8a6236)); frame.position.y = 0.15; this.group.add(frame);
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 0.98), lam(0xb3312c)); sheet.position.set(-0.3, 0.4, 0); this.group.add(sheet);
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.98), lam(0xf0f0f0)); pillow.position.set(0.72, 0.4, 0); this.group.add(pillow);
  }
}

const portalFS = `uniform float time; uniform float amount; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
void main(){ vec2 p = floor(vUv * vec2(16.0, 24.0)) / vec2(16.0, 24.0); vec2 c = p - 0.5; float r = length(c);
  float a = atan(c.y, c.x); float s = sin(a * 3.0 + r * 18.0 - time * 3.0) * 0.5 + 0.5; float n = h(p + floor(time * 8.0) * 0.01);
  vec3 col = mix(vec3(0.35, 0.05, 0.6), vec3(0.85, 0.45, 1.0), s * 0.8 + n * 0.2);
  gl_FragColor = vec4(col * (0.8 + 0.4 * amount), 0.82 * amount); }`;
export class Portal {
  constructor(pos, { w = 2, h = 3, frame = true } = {}) {
    this.group = new THREE.Group(); this.group.position.set(...pos);
    if (frame) { for (let x = -1; x <= w; x++) for (let y = -1; y <= h; y++) { if (x >= 0 && x < w && y >= 0 && y < h) continue; const b = blockMesh('obsidian'); b.position.set(x + 0.5, y + 0.5, 0.5); this.group.add(b); } }
    this.uniforms = { time: { value: 0 }, amount: { value: 1 } };
    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({ uniforms: this.uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }', fragmentShader: portalFS }));
    this.plane.position.set(w / 2, h / 2, 0.5); this.group.add(this.plane);
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(170,70,255,0.8)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    this.glow.position.set(w / 2, h / 2, 0.8); this.glow.scale.set(w * 3, h * 2.4, 1); this.group.add(this.glow);
    this.center = [pos[0] + w / 2, pos[1] + h / 2, pos[2] + 0.5];
  }
  update(t, amount = 1) { this.uniforms.time.value = t; this.uniforms.amount.value = amount; this.plane.visible = amount > 0.01; this.glow.material.opacity = amount * (0.7 + 0.2 * Math.sin(t * 3)); }
}

// ------------------------------------------------------------ giant computer
function drawScreen(x, w, h, st) {
  const { mode, t, pct, count, glitch } = st;
  x.fillStyle = mode === 'detected' || mode === 'count' ? '#1a0003' : '#020a04'; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(255,255,255,0.03)'; for (let y = 0; y < h; y += 6) x.fillRect(0, y, w, 2);
  const green = '#3dff7a', red = '#ff2b3a';
  x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.font = '400 46px VT323';
  const log = ['> SYSTEM v1.0.0', '> SCANNING CHUNKS...', '> ENTITIES: 1 PLAYER, 1 UNKNOWN', '> RESET PROTOCOL: STANDBY'];
  x.fillStyle = mode === 'deleting' ? 'rgba(61,255,122,0.55)' : 'rgba(255,60,60,0.5)'; log.forEach((l, i) => x.fillText(l, 40, 60 + i * 44));
  x.textAlign = 'center';
  if (mode === 'deleting' || mode === 'boot') {
    x.fillStyle = green; x.font = '400 112px VT323'; x.fillText('WORLD STATUS:', w / 2, 330);
    const blink = Math.floor(t * 2.5) % 2 === 0; x.fillStyle = blink ? red : '#ff7a7a'; x.font = '400 150px VT323'; x.fillText('DELETING', w / 2, 460);
    x.strokeStyle = green; x.lineWidth = 6; x.strokeRect(160, 510, w - 320, 54); x.fillStyle = green; x.fillRect(170, 520, (w - 340) * pct, 34);
    x.font = '400 46px VT323'; x.fillText(Math.floor(pct * 100) + '%', w / 2, 610);
  } else if (mode === 'detected') {
    const k = Math.floor(t * 4) % 2; x.fillStyle = k ? red : '#ffffff'; x.font = '400 170px VT323'; x.fillText('PLAYER', w / 2, 350); x.fillText('DETECTED.', w / 2, 500);
  } else if (mode === 'count') {
    x.fillStyle = red; x.font = '400 70px VT323'; x.fillText('DELETION IN', w / 2, 250); x.font = '400 300px VT323'; x.fillText(String(count), w / 2, 520);
  } else if (mode === 'white') { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); }
  if (glitch > 0) { for (let i = 0; i < 14 * glitch; i++) { const y = hash(t * 7 + i) * h; const hh = 6 + hash(i + t) * 40; x.drawImage(x.canvas, 0, y, w, hh, (hash(i * 3 + t) - 0.5) * 120 * glitch, y, w, hh); } }
}
export class Computer {
  constructor(pos) {
    this.group = new THREE.Group(); this.group.position.set(...pos);
    const metal = lam(0x2a2d34), dark = lam(0x15161a), accent = lam(0x3a3f48);
    this.mats = [metal, dark, accent];
    const mon = new THREE.Mesh(new THREE.BoxGeometry(8.4, 5.2, 0.8), metal); mon.position.y = 4.4; this.group.add(mon);
    const bez = new THREE.Mesh(new THREE.BoxGeometry(8.0, 4.8, 0.1), dark); bez.position.set(0, 4.4, -0.42); this.group.add(bez);
    this.screen = textCanvas(1024, 640, () => {});
    this.screenMat = new THREE.MeshBasicMaterial({ map: this.screen.tex });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 4.45), this.screenMat); scr.position.set(0, 4.4, -0.48); scr.rotation.y = Math.PI; this.group.add(scr);
    const neck = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 0.6), accent); neck.position.y = 1.0; this.group.add(neck);
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.4, 2.0), metal); base.position.y = 0.2; this.group.add(base);
    // cables to the void
    for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 6 + i), dark); c.position.set(-2.4 + i * 1.6, 0.3, 3.2 + i * 0.5); this.group.add(c); }
    const kb = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.25, 1.4), accent); kb.position.set(0, 0.6, -2.6); this.group.add(kb);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 12; c++) { const k = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.3), dark); k.position.set(-2.1 + c * 0.38, 0.78, -3.0 + r * 0.4); this.group.add(k); }
    // the eye (webcam) on top
    this.eye = new THREE.Group(); this.eye.position.set(0, 7.25, -0.1); this.group.add(this.eye);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), lam(0xdddddd, 0x222222)); this.eye.add(ball);
    this.iris = new THREE.Mesh(new THREE.CircleGeometry(0.2, 18), new THREE.MeshBasicMaterial({ color: 0xff2030 })); this.iris.position.z = -0.43; this.iris.rotation.y = Math.PI; this.eye.add(this.iris);
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(80,255,140,0.6)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    this.glow.position.set(0, 4.4, -1.4); this.glow.scale.set(16, 10, 1); this.group.add(this.glow);
    this.light = null; this.key = '';
  }
  update(st) {
    const key = [st.mode, Math.floor(st.t * 8), Math.round(st.pct * 100), st.count, Math.round(st.glitch * 4)].join('|');
    if (key !== this.key) { this.key = key; drawScreen(this.screen.ctx, 1024, 640, st); this.screen.tex.needsUpdate = true; }
    const red = st.mode === 'detected' || st.mode === 'count';
    this.glow.material.color.set(red ? 0xff3040 : 0x50ff8c); this.glow.material.opacity = 0.6 + 0.2 * Math.sin(st.t * 5);
    if (this.light) { this.light.color.set(red ? 0xff3344 : 0x55ff99); this.light.intensity = (st.lightI ?? 25) * (0.85 + 0.15 * Math.sin(st.t * 6)); }
    this.eye.rotation.set(st.eyePitch || 0, st.eyeYaw || 0, 0);
    this.iris.material.color.set(st.eyeOn ? 0xff2030 : 0x333333);
    const gl = st.ghost || 0; for (const m of this.mats) { m.wireframe = gl > 0.5; m.emissive.setRGB(gl * 0.2, gl * 0.8, gl * 0.4); }
  }
}

export class ResetButton {
  constructor(pos) {
    this.group = new THREE.Group(); this.group.position.set(...pos);
    const ped = blockMesh('metal'); ped.position.y = 0.5; this.group.add(ped);
    const ped2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.8), lam(0x3a3f48)); ped2.position.y = 1.1; this.group.add(ped2);
    this.cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.2, 20), lam(0xd81e2a, 0x550000)); this.cap.position.y = 1.3; this.group.add(this.cap);
    const { tex } = textCanvas(512, 128, (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffcc00'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
      x.fillStyle = '#ffcc00'; x.font = '700 64px Silkscreen'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('RESET WORLD', w / 2, h / 2 + 4); });
    this.label = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), new THREE.MeshBasicMaterial({ map: tex })); this.label.position.set(0, 0.62, -0.51); this.label.rotation.y = Math.PI; this.group.add(this.label);
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(255,40,40,0.9)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    this.glow.position.y = 1.4; this.glow.scale.setScalar(1.6); this.group.add(this.glow);
  }
  update(t, press = 0, glow = 1) { this.cap.position.y = 1.3 - press * 0.12; this.glow.material.opacity = glow * (0.5 + 0.4 * Math.sin(t * 6)); }
}
void TAU;
