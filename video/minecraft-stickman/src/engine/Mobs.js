// Blocky creatures: zombie, ender-creature, farm animals and birds. Original low-poly designs.
import * as THREE from 'three';
import { TAU } from './AnimationSystem.js';

const lam = (c, e = 0) => new THREE.MeshLambertMaterial({ color: c, emissive: e });
function box(w, h, d, mat, pivotTop = false) { const g = new THREE.BoxGeometry(w, h, d); if (pivotTop) g.translate(0, -h / 2, 0); return new THREE.Mesh(g, mat); }
function faceTex(draw, size = 8) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const x = cv.getContext('2d'); draw(x);
  const t = new THREE.CanvasTexture(cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t;
}

export class Zombie {
  constructor() {
    this.root = new THREE.Group();
    const skin = 0x5d8f45, shirt = 0x4b5a3a, pants = 0x2f3550;
    const face = faceTex(x => { x.fillStyle = '#5d8f45'; x.fillRect(0, 0, 8, 8); x.fillStyle = '#4a7536'; x.fillRect(0, 0, 8, 2); x.fillRect(1, 6, 2, 1); x.fillRect(5, 5, 2, 1);
      x.fillStyle = '#101010'; x.fillRect(1, 3, 2, 2); x.fillRect(5, 3, 2, 2); x.fillStyle = '#3a2a1a'; x.fillRect(3, 6, 2, 1); });
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0xff3020, transparent: true, opacity: 0 });
    const headMats = [lam(skin), lam(skin), lam(0x4a7536), lam(skin), new THREE.MeshLambertMaterial({ map: face }), lam(skin)];
    this.hips = new THREE.Group(); this.hips.position.y = 0.75; this.root.add(this.hips);
    this.body = box(0.5, 0.75, 0.26, lam(shirt)); this.body.position.y = 0.375; this.hips.add(this.body);
    this.head = new THREE.Group(); this.head.position.y = 0.75; this.hips.add(this.head);
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), headMats); h.position.y = 0.25; this.head.add(h);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.07), this.eyeMat); e.position.set(s * 0.125, 0.25, 0.252); this.head.add(e); }
    this.lArm = new THREE.Group(); this.rArm = new THREE.Group();
    for (const [a, s] of [[this.lArm, 1], [this.rArm, -1]]) { a.position.set(s * 0.375, 0.68, 0); a.add(box(0.24, 0.72, 0.24, lam(skin), true)); this.hips.add(a); }
    this.lLeg = new THREE.Group(); this.rLeg = new THREE.Group();
    for (const [l, s] of [[this.lLeg, 1], [this.rLeg, -1]]) { l.position.set(s * 0.125, 0, 0); l.add(box(0.25, 0.75, 0.25, lam(pants), true)); this.hips.add(l); }
  }
  /** st: {pos,yaw,headYaw,headPitch,walk(phase),arms(0..1 raised), eyes(0..1 glow), visible, sway} */
  apply(st) {
    this.root.visible = st.visible !== false; this.root.position.set(...st.pos); this.root.rotation.y = st.yaw || 0;
    this.head.rotation.set(st.headPitch || 0, st.headYaw || 0, st.headRoll || 0, 'YXZ');
    const w = st.walk || 0; const s = Math.sin(w * TAU) * (st.walkAmt ?? 0);
    this.lLeg.rotation.x = s * 0.6; this.rLeg.rotation.x = -s * 0.6;
    const arms = st.arms ?? 1; const sway = st.sway || 0;
    this.lArm.rotation.x = -Math.PI / 2 * arms + sway * 0.05; this.rArm.rotation.x = -Math.PI / 2 * arms - sway * 0.05;
    this.body.rotation.z = sway * 0.02;
    this.eyeMat.opacity = st.eyes || 0;
  }
}

export class Enderman {
  constructor() {
    this.root = new THREE.Group();
    const black = lam(0x0c0b10, 0x050308);
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0xe070ff, transparent: true, fog: false });
    this.eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0xc040ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    this.mats = [black, this.eyeMat];
    this.hips = new THREE.Group(); this.hips.position.y = 1.55; this.root.add(this.hips);
    this.body = box(0.5, 0.8, 0.26, black); this.body.position.y = 0.4; this.hips.add(this.body);
    this.head = new THREE.Group(); this.head.position.y = 0.8; this.hips.add(this.head);
    const h = box(0.5, 0.5, 0.5, black); h.position.y = 0.25; this.head.add(h);
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.05), this.eyeMat); e.position.set(s * 0.12, 0.24, 0.252); this.head.add(e);
      const g = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2), this.eyeGlowMat); g.position.set(s * 0.12, 0.24, 0.26); this.head.add(g);
    }
    this.lArm = new THREE.Group(); this.rArm = new THREE.Group();
    for (const [a, s] of [[this.lArm, 1], [this.rArm, -1]]) { a.position.set(s * 0.31, 0.76, 0); a.add(box(0.12, 1.5, 0.12, black, true)); this.hips.add(a); }
    this.lLeg = new THREE.Group(); this.rLeg = new THREE.Group();
    for (const [l, s] of [[this.lLeg, 1], [this.rLeg, -1]]) { l.position.set(s * 0.12, 0, 0); l.add(box(0.12, 1.55, 0.12, black, true)); this.hips.add(l); }
    black.transparent = true;
  }
  apply(st) {
    this.root.visible = st.visible !== false && (st.opacity ?? 1) > 0.01;
    this.root.position.set(...st.pos); this.root.rotation.y = st.yaw || 0;
    const sq = st.stretch || 0, sc = st.scale || 1; this.root.scale.set((1 - sq * 0.6) * sc, (1 + sq * 1.2) * sc, (1 - sq * 0.6) * sc);
    this.head.rotation.set(st.headPitch || 0, st.headYaw || 0, st.headRoll || 0, 'YXZ');
    const sway = Math.sin((st.t || 0) * 0.8) * 0.03; this.lArm.rotation.x = sway; this.rArm.rotation.x = -sway; this.lArm.rotation.z = 0.04; this.rArm.rotation.z = -0.04;
    const op = st.opacity ?? 1; this.mats[0].emissive.setHex(st.rim ?? 0x050308); this.mats[0].opacity = op; this.mats[0].depthWrite = op > 0.99; this.eyeMat.opacity = op; this.eyeGlowMat.opacity = 0.35 * op * (st.glow ?? 1);
  }
}

export class Animal {
  constructor(kind = 'pig') {
    this.root = new THREE.Group(); this.kind = kind;
    const C = { pig: [0xf0a0a8, 0xe08890, 0x333333], cow: [0x4a3524, 0xf0f0f0, 0x222222], sheep: [0xeeeeee, 0xd8c8b0, 0x333333] }[kind];
    const body = box(kind === 'pig' ? 0.6 : 0.7, kind === 'pig' ? 0.5 : 0.6, 1.0, lam(C[0])); body.position.y = 0.6; this.root.add(body);
    if (kind === 'cow') for (let i = 0; i < 3; i++) { const sp = box(0.3, 0.25, 0.3, lam(C[1])); sp.position.set((i - 1) * 0.15 + 0.12, 0.72 + (i % 2) * 0.1, (i - 1) * 0.3); sp.scale.x = 1.2; this.root.add(sp); }
    const head = new THREE.Group(); head.position.set(0, 0.75, 0.55); this.root.add(head); this.head = head;
    const hd = box(0.45, 0.42, 0.4, lam(kind === 'sheep' ? C[1] : C[0])); head.add(hd);
    if (kind === 'pig') { const sn = box(0.22, 0.15, 0.08, lam(C[1])); sn.position.set(0, -0.06, 0.22); head.add(sn); }
    for (const s of [-1, 1]) { const e = box(0.07, 0.07, 0.02, new THREE.MeshBasicMaterial({ color: C[2] })); e.position.set(s * 0.13, 0.06, 0.205); head.add(e); }
    this.legs = [];
    for (const [x, z] of [[-0.2, 0.35], [0.2, 0.35], [-0.2, -0.35], [0.2, -0.35]]) { const l = new THREE.Group(); l.position.set(x, 0.35, z); l.add(box(0.18, 0.35, 0.18, lam(kind === 'cow' ? 0x3a2a1c : C[0]), true)); this.root.add(l); this.legs.push(l); }
  }
  apply(st) {
    this.root.visible = st.visible !== false; this.root.position.set(...st.pos);
    this.root.rotation.set(st.pitch || 0, st.yaw || 0, st.roll || 0, 'YXZ');
    const p = st.paddle || 0; this.legs.forEach((l, i) => { l.rotation.x = Math.sin(p * TAU + (i % 2) * Math.PI) * 0.7; });
    this.head.rotation.set(st.headPitch || 0, st.headYaw || 0, 0);
  }
}

export class Bird {
  constructor(color = 0x3a6ad8) {
    this.root = new THREE.Group(); const m = lam(color);
    const b = box(0.18, 0.14, 0.32, m); this.root.add(b);
    const beak = box(0.05, 0.05, 0.08, lam(0xffb020)); beak.position.z = 0.2; this.root.add(beak);
    this.lw = new THREE.Group(); this.rw = new THREE.Group();
    for (const [w, s] of [[this.lw, 1], [this.rw, -1]]) { const wing = box(0.3, 0.03, 0.18, m); wing.position.x = s * 0.15; w.add(wing); w.position.x = s * 0.08; this.root.add(w); }
  }
  apply(st) { this.root.position.set(...st.pos); this.root.rotation.set(0, st.yaw, st.bank || 0, 'YXZ'); const f = Math.sin(st.flap * TAU) * 0.8; this.lw.rotation.z = f; this.rw.rotation.z = -f; this.root.visible = st.visible !== false; }
}

export class Spider {
  constructor() {
    this.root = new THREE.Group(); const dark = lam(0x2a2420), dark2 = lam(0x1a1614);
    const face = faceTex(x => { x.fillStyle = '#2a2420'; x.fillRect(0, 0, 8, 8); x.fillStyle = '#d01818'; x.fillRect(1, 3, 2, 1); x.fillRect(5, 3, 2, 1); x.fillRect(2, 2, 1, 1); x.fillRect(5, 2, 1, 1); x.fillStyle = '#ff6060'; x.fillRect(3, 4, 1, 1); x.fillRect(4, 4, 1, 1); });
    this.body = new THREE.Group(); this.body.position.y = 0.45; this.root.add(this.body);
    const abd = box(0.75, 0.55, 0.8, dark); abd.position.z = -0.55; this.body.add(abd);
    const th = box(0.4, 0.35, 0.4, dark2); this.body.add(th);
    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.4), [dark, dark, dark, dark, new THREE.MeshLambertMaterial({ map: face, emissive: 0x330000, emissiveMap: face }), dark]); this.head.position.z = 0.38; this.body.add(this.head);
    this.legs = [];
    for (let i = 0; i < 8; i++) { const s = i < 4 ? 1 : -1; const k = i % 4; const l = new THREE.Group(); l.position.set(s * 0.18, 0, 0.15 - k * 0.15); l.rotation.y = s * (0.5 - k * 0.33) + (s < 0 ? Math.PI : 0); const seg = box(0.9, 0.08, 0.08, dark2); seg.position.x = 0.45; l.add(seg); l.rotation.z = 0.35; this.body.add(l); this.legs.push(l); }
  }
  apply(st) {
    this.root.visible = st.visible !== false; this.root.position.set(...st.pos); this.root.rotation.y = st.yaw || 0; this.root.scale.setScalar(st.scale ?? 1);
    const w = st.walk || 0; this.legs.forEach((l, i) => { l.rotation.z = 0.35 + Math.sin(w * TAU * 2 + i * 1.3) * 0.25; });
    this.body.position.y = 0.45 + Math.abs(Math.sin(w * TAU * 2)) * 0.03 + (st.hop || 0);
  }
}

export class Ghast {
  constructor() {
    this.root = new THREE.Group();
    this.cv = document.createElement('canvas'); this.cv.width = this.cv.height = 16; this.ctx = this.cv.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.cv); this.tex.magFilter = THREE.NearestFilter; this.tex.minFilter = THREE.NearestFilter; this.tex.colorSpace = THREE.SRGBColorSpace;
    const white = lam(0xf0f0f0, 0x303030); const faceM = new THREE.MeshLambertMaterial({ map: this.tex, emissive: 0x303030, emissiveMap: this.tex });
    this.body = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), [white, white, white, white, faceM, white]); this.body.position.y = 2; this.root.add(this.body);
    this.tent = []; for (let i = 0; i < 9; i++) { const g = new THREE.Group(); g.position.set(((i % 3) - 1) * 1.2, 0, (Math.floor(i / 3) - 1) * 1.2); const len = 2 + (i * 37 % 5) * 0.4; const t = box(0.3, len, 0.3, white, true); g.add(t); this.root.add(g); this.tent.push(g); }
    this.mode = -1; this.draw(0);
  }
  draw(mode) {
    if (mode === this.mode) return; this.mode = mode; const x = this.ctx;
    x.fillStyle = '#f0f0f0'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#d8d8d8'; x.fillRect(0, 14, 16, 2);
    if (mode === 0) { x.fillStyle = '#555'; x.fillRect(3, 6, 3, 1); x.fillRect(10, 6, 3, 1); x.fillStyle = '#a0a0a0'; x.fillRect(3, 7, 1, 3); x.fillRect(12, 7, 1, 2); x.fillStyle = '#555'; x.fillRect(6, 10, 4, 1); }
    else { x.fillStyle = '#111'; x.fillRect(3, 5, 3, 3); x.fillRect(10, 5, 3, 3); x.fillStyle = '#c02020'; x.fillRect(4, 8, 1, 3); x.fillRect(11, 8, 1, 3); x.fillStyle = '#111'; x.fillRect(5, 10, 6, 4); x.fillStyle = '#2a0505'; x.fillRect(6, 11, 4, 2); }
    this.tex.needsUpdate = true;
  }
  apply(st) {
    this.root.visible = st.visible !== false; this.root.position.set(...st.pos); this.root.rotation.y = st.yaw || 0; this.root.scale.setScalar(st.scale ?? 1);
    const t = st.t || 0; this.tent.forEach((g, i) => { g.rotation.x = Math.sin(t * 2.2 + i) * 0.25; g.rotation.z = Math.sin(t * 1.7 + i * 2) * 0.2; });
    this.draw(st.angry ? 1 : 0);
  }
}
