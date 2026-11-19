// CharacterController: the stickman rig (procedural face, limbs, held items) and the Actor
// timeline that turns keyframed paths/actions/expressions into a pose for any time t.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Poses, pose, blendPose, EXPR, blendExpr, Keys, prog, smooth, clamp, lerp, noise1, hash, TAU, Ease } from './AnimationSystem.js';

const LIMB_R = 0.05, UPPER_ARM = 0.33, LOWER_ARM = 0.33, UPPER_LEG = 0.43, LOWER_LEG = 0.43, TORSO = 0.6, HEAD_R = 0.24;
export const HIP_HEIGHT = UPPER_LEG + LOWER_LEG;

// ---------------------------------------------------------------- items
const PAL = {
  wood: ['#b48a55', '#7d5a2e', '#3d2a12'], diamond: ['#7ff5ea', '#2fb5a8', '#0f4d48'], stone: ['#a8a8a8', '#6f6f6f', '#333333'],
  iron: ['#e8e8e8', '#b0b0b0', '#555555'], stick: ['#8f6538', '#5d3d1c'],
};
function pixelItem(rows, colors, px = 0.034, grip = [0, 0]) {
  const geos = [];
  const h = rows.length;
  rows.forEach((row, r) => [...row].forEach((ch, c) => {
    const col = colors[ch]; if (!col) return;
    const g = new THREE.BoxGeometry(px, px, px * 1.2);
    g.translate((c - grip[0]) * px, (h - 1 - r - grip[1]) * px, 0);
    const color = new THREE.Color(col); const arr = [];
    for (let i = 0; i < g.attributes.position.count; i++) arr.push(color.r, color.g, color.b);
    g.setAttribute('color', new THREE.Float32BufferAttribute(arr, 3));
    geos.push(g);
  }));
  return new THREE.Mesh(mergeGeometries(geos), new THREE.MeshLambertMaterial({ vertexColors: true }));
}
function pickaxe(mat) {
  const [a, b, c] = PAL[mat]; const [s, d] = PAL.stick;
  return pixelItem([
    '..cccccccccc..', '.cbaaaaaaaabc.', 'cba..ess..abc', 'cb...ess...bc', 'c....ess....c', '.....ess.....', '.....ess.....',
    '.....ess.....', '.....ess.....', '.....ess.....', '.....ess.....', '.....ess.....', '.....ess.....'],
  { a, b, c, s, e: d }, 0.034, [6, 1]);
}
function sword(mat) {
  const [a, b, c] = PAL[mat]; const [s, d] = PAL.stick;
  return pixelItem(['....c....', '...cac...', '...cab...', '...cab...', '...cab...', '...cab...', '...cab...', '...cab...',
    '.ccccccc.', '....es...', '....es...', '...cec...'], { a, b, c, s, e: d }, 0.036, [4, 1]);
}
function torchItem() {
  const g = pixelItem(['..y..', '.yoy.', '.ooo.', '..f..', '..s..', '..e..', '..s..', '..e..', '..s..', '..e..'],
    { y: '#fff3a0', o: '#ffb43a', f: '#ff7a1a', s: '#8f6538', e: '#5d3d1c' }, 0.036, [2, 1]);
  g.traverse(o => { if (o.material) { o.material.emissive = new THREE.Color(0x553311); } });
  return g;
}
function boxItem(w, h, d, color, color2) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
  g.add(m);
  if (color2) { const p = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, h * 0.9, d * 1.08), new THREE.MeshLambertMaterial({ color: color2 })); p.position.x = w * 0.04; g.add(p); }
  return g;
}
function shieldItem() {
  const g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.62, 0.05), new THREE.MeshLambertMaterial({ color: 0x8a6236 }));
  const rim = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.66, 0.04), new THREE.MeshLambertMaterial({ color: 0x9a9a9a }));
  const boss = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), new THREE.MeshLambertMaterial({ color: 0xbcbcbc }));
  rim.position.z = -0.01; boss.position.z = 0.04;
  for (let i = -1; i <= 1; i++) { const plank = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.6, 0.052), new THREE.MeshLambertMaterial({ color: 0x5e3f1f })); plank.position.x = i * 0.13; g.add(plank); }
  g.add(face, rim, boss); return g;
}
const ITEM_FACTORY = {
  woodPickaxe: () => pickaxe('wood'), diamondPickaxe: () => pickaxe('diamond'), stonePickaxe: () => pickaxe('stone'),
  sword: () => sword('stone'), diamondSword: () => sword('diamond'), torch: torchItem,
  book: () => boxItem(0.06, 0.3, 0.24, 0x5a2d12, 0xf2e8cf), map: () => boxItem(0.03, 0.34, 0.34, 0xd9c79a),
  log: () => boxItem(0.24, 0.24, 0.24, 0x6b4f2a), shield: shieldItem,
  watch: () => { const g = boxItem(0.07, 0.05, 0.08, 0x333333); const f = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.03, 0.05), new THREE.MeshBasicMaterial({ color: 0xffe066 })); f.position.y = 0.012; g.add(f); return g; },
};
// Orientation of each item inside the hand socket (forearm points along -Y of the socket).
function mountItem(name) {
  const mesh = ITEM_FACTORY[name](); const g = new THREE.Group(); g.add(mesh); g.name = name;
  if (['woodPickaxe', 'diamondPickaxe', 'stonePickaxe', 'sword', 'diamondSword', 'torch'].includes(name)) {
    // sprite +Y (tool head) points forward out of the fist, sprite plane is vertical (right-handed basis).
    mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(
      new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(-1, 0, 0)));
    mesh.rotateZ(0.35); // tilt the tool head slightly upward
  } else if (name === 'shield') { mesh.position.set(-0.04, -0.02, 0.1); mesh.rotation.set(0, Math.PI / 2, 0); mesh.rotateX(0); }
  else if (name === 'book' || name === 'map') { mesh.position.set(0, -0.05, 0.08); mesh.rotation.set(0.9, 0, 0); }
  else if (name === 'watch') { mesh.position.set(0, 0.07, 0); }
  else mesh.position.set(0, -0.08, 0.06);
  return g;
}

// ---------------------------------------------------------------- face
function drawFace(ctx, f, variant) {
  const W = 256; ctx.clearRect(0, 0, W, W);
  ctx.save(); ctx.translate(128, 128); ctx.scale(1.28, 1.28); ctx.translate(-128, -122); drawFaceInner(ctx, f, variant); ctx.restore();
}
function drawFaceInner(ctx, f, variant) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const cx = 128, ey = 112, ex = 40;
  if (variant === 'shadow') { // glowing hollow eyes
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(cx + s * ex, ey); ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 24; ctx.fillStyle = '#f4f4ff';
      ctx.beginPath(); ctx.ellipse(0, 0, 15, 9 + 13 * clamp(f.eyeOpen, 0, 1.5), s * -0.15, 0, TAU); ctx.fill(); ctx.restore();
    }
    return;
  }
  const open = clamp(f.eyeOpen * f.blink, 0, 1.6);
  for (const s of [-1, 1]) {
    const x = cx + s * ex;
    const rx = 19 * f.eyeSize, ry = 25 * f.eyeSize * Math.max(open, 0.001);
    if (open < 0.14) { // closed eye: happy arc
      ctx.strokeStyle = '#111'; ctx.lineWidth = 7; ctx.beginPath();
      if (f.mouth > 0.4) ctx.arc(x, ey + 8, 16, Math.PI * 1.15, Math.PI * 1.85); else ctx.arc(x, ey - 6, 16, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.ellipse(x, ey, rx, ry, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.ellipse(x, ey, rx - 2, ry - 2, 0, 0, TAU); ctx.clip();
      const pr = 15 * f.pupil * f.eyeSize + 2; const px = x + f.lookX * (rx - pr * 0.6) * 0.8, py = ey + f.lookY * (ry - pr * 0.6) * 0.7;
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px - pr * 0.35, py - pr * 0.4, Math.max(2, pr * 0.32), 0, TAU); ctx.fill();
      if (open < 0.95) { // upper lid for half-closed (annoyed / deadpan) eyes
        ctx.fillStyle = '#f2f2f2'; ctx.fillRect(x - rx - 4, ey - ry - 4, rx * 2 + 8, (ry * 2 + 8) * (1 - open) * 0.6);
      }
      ctx.restore();
      if (open < 0.95) { ctx.strokeStyle = '#111'; ctx.lineWidth = 6; ctx.beginPath(); const ly = ey - ry - 4 + (ry * 2 + 8) * (1 - open) * 0.6; ctx.moveTo(x - rx, ly); ctx.lineTo(x + rx, ly); ctx.stroke(); }
    }
    // brows
    const by = ey - 26 * f.eyeSize - 14 - f.brow * 16 - (s < 0 ? f.smirk * 9 : 0) - Math.max(0, open - 1) * 12;
    const tilt = f.browTilt * 11 * (s < 0 ? 1 : 1);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.beginPath();
    // inner end is toward the center (cx); browTilt > 0 raises the outer end on the left brow only (quizzical)
    const inner = x - s * 16, outer = x + s * 18;
    if (f.browTilt >= 0 && s > 0) { ctx.moveTo(inner, by); ctx.lineTo(outer, by); }
    else { ctx.moveTo(inner, by - tilt * (f.browTilt < 0 ? -1 : 0) + (f.browTilt < 0 ? f.browTilt * 9 : 0)); ctx.lineTo(outer, by + (f.browTilt > 0 ? -tilt : -f.browTilt * 4)); }
    ctx.stroke();
  }
  // blush
  if (f.blush > 0.05) { ctx.fillStyle = `rgba(255,120,140,${f.blush * 0.45})`; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * 62, 150, 16, 8, 0, 0, TAU); ctx.fill(); } }
  // mouth
  const my = 172, mw = 30 * f.mouthW, curve = f.mouth * 16, mo = clamp(f.mouthOpen, 0, 1.2);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 7; ctx.fillStyle = '#2a0d0d';
  if (mo > 0.08) {
    const hgt = 8 + mo * 34;
    ctx.beginPath(); ctx.moveTo(cx - mw, my - curve * 0.3);
    ctx.quadraticCurveTo(cx, my + curve * 0.4 - (f.mouth < 0 ? hgt * 0.15 : 0), cx + mw, my - curve * 0.3 - f.smirk * 6);
    ctx.quadraticCurveTo(cx, my + hgt + curve * 0.6, cx - mw, my - curve * 0.3);
    ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#e0626b'; ctx.beginPath(); ctx.ellipse(cx, my + hgt + curve * 0.3, mw * 0.6, hgt * 0.35, 0, 0, TAU); ctx.fill(); ctx.restore();
  } else if (f.wobble > 0.2) {
    ctx.beginPath(); for (let i = 0; i <= 12; i++) { const x = cx - mw + (i / 12) * mw * 2; const y = my - curve * 0.4 + Math.sin(i * 1.6) * 3.5 * f.wobble; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(cx - mw, my - curve * 0.5 + f.smirk * 4); ctx.quadraticCurveTo(cx, my + curve, cx + mw, my - curve * 0.5 - f.smirk * 10); ctx.stroke();
  }
  // sweat drop
  if (f.sweat > 0.3) {
    const a = clamp((f.sweat - 0.3) / 0.5); ctx.fillStyle = `rgba(120,200,255,${a})`; ctx.strokeStyle = `rgba(20,60,120,${a})`; ctx.lineWidth = 3;
    const sx = 212, sy = 70 + f.sweatY * 30; ctx.beginPath(); ctx.moveTo(sx, sy - 18); ctx.quadraticCurveTo(sx + 14, sy + 4, sx, sy + 8); ctx.quadraticCurveTo(sx - 14, sy + 4, sx, sy - 18); ctx.fill(); ctx.stroke();
  }
}

// ---------------------------------------------------------------- stickman rig
const LIMB_GEO = new Map();
function limb(len, mat, r = LIMB_R) {
  const g = new THREE.Group();
  const key = len.toFixed(3) + r;
  if (!LIMB_GEO.has(key)) { const c = new THREE.CylinderGeometry(r, r, len, 10); c.translate(0, -len / 2, 0); LIMB_GEO.set(key, c); }
  const m = new THREE.Mesh(LIMB_GEO.get(key), mat); g.add(m);
  const j = new THREE.Mesh(new THREE.SphereGeometry(r * 1.05, 10, 8), mat); j.position.y = -len; g.add(j);
  const end = new THREE.Group(); end.position.y = -len; g.add(end); g.userData.end = end;
  return g;
}

export class Stickman {
  constructor({ variant = 'hero', scale = 1 } = {}) {
    this.variant = variant;
    const dark = variant === 'shadow';
    this.limbMat = new THREE.MeshLambertMaterial({ color: dark ? 0x050507 : 0x121212, emissive: dark ? 0x000000 : 0x050505, transparent: true });
    this.root = new THREE.Group(); this.root.scale.setScalar(scale);
    this.hips = new THREE.Group(); this.root.add(this.hips);
    this.spine = new THREE.Group(); this.hips.add(this.spine);
    const torso = limb(TORSO, this.limbMat, LIMB_R * 1.1); torso.rotation.x = Math.PI; this.spine.add(torso);
    this.neck = new THREE.Group(); this.neck.position.y = TORSO; this.spine.add(this.neck);
    this.head = new THREE.Group(); this.neck.add(this.head);
    const headMat = dark ? new THREE.MeshLambertMaterial({ color: 0x08080b, transparent: true }) : new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x4a4a4a, transparent: true });
    this.headMat = headMat;
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R, 28, 20), headMat); headMesh.position.y = HEAD_R + 0.03; this.head.add(headMesh);
    const outlineMat = new THREE.MeshBasicMaterial({ color: dark ? 0x9a7cff : 0x000000, side: THREE.BackSide, transparent: true, opacity: dark ? 0.35 : 1 });
    this.outlineMat = outlineMat;
    const outline = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R * 1.09, 24, 16), outlineMat); outline.position.copy(headMesh.position); this.head.add(outline);
    this.faceCanvas = document.createElement('canvas'); this.faceCanvas.width = this.faceCanvas.height = 256;
    this.faceCtx = this.faceCanvas.getContext('2d');
    this.faceTex = new THREE.CanvasTexture(this.faceCanvas); this.faceTex.colorSpace = THREE.SRGBColorSpace; this.faceTex.anisotropy = 4;
    const faceGeo = new THREE.SphereGeometry(HEAD_R * 1.012, 32, 24, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 0.95, 1.9);
    this.faceMat = new THREE.MeshBasicMaterial({ map: this.faceTex, transparent: true, depthWrite: false });
    if (!dark) this.faceMat = new THREE.MeshLambertMaterial({ map: this.faceTex, transparent: true, depthWrite: false, emissive: 0x333333, emissiveMap: this.faceTex });
    const face = new THREE.Mesh(faceGeo, this.faceMat); face.position.copy(headMesh.position); face.renderOrder = 2; this.head.add(face);
    // arms (both from the shoulder point), legs from the hip point
    this.lArm = limb(UPPER_ARM, this.limbMat); this.rArm = limb(UPPER_ARM, this.limbMat);
    this.lArm.position.set(0.03, TORSO - 0.06, 0); this.rArm.position.set(-0.03, TORSO - 0.06, 0);
    this.spine.add(this.lArm, this.rArm);
    this.lFore = limb(LOWER_ARM, this.limbMat); this.rFore = limb(LOWER_ARM, this.limbMat);
    this.lArm.userData.end.add(this.lFore); this.rArm.userData.end.add(this.rFore);
    this.lHand = this.lFore.userData.end; this.rHand = this.rFore.userData.end;
    for (const h of [this.lHand, this.rHand]) h.add(new THREE.Mesh(new THREE.SphereGeometry(LIMB_R * 1.5, 10, 8), this.limbMat));
    this.lLeg = limb(UPPER_LEG, this.limbMat); this.rLeg = limb(UPPER_LEG, this.limbMat);
    this.lLeg.position.x = 0.05; this.rLeg.position.x = -0.05; this.hips.add(this.lLeg, this.rLeg);
    this.lShin = limb(LOWER_LEG, this.limbMat); this.rShin = limb(LOWER_LEG, this.limbMat);
    this.lLeg.userData.end.add(this.lShin); this.rLeg.userData.end.add(this.rShin);
    // blob shadow
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2; this.shadow.position.y = 0.02; this.shadow.renderOrder = 1; this.root.add(this.shadow);
    this.items = { r: null, l: null, lw: null }; this.itemCache = {};
    this.faceKey = ''; this.opacity = 1;
  }
  setItem(slot, name) {
    if ((this.items[slot]?.name || null) === (name || null)) return;
    const sock = slot === 'r' ? this.rHand : this.lHand;
    if (this.items[slot]) sock.remove(this.items[slot]);
    this.items[slot] = null;
    if (!name) return;
    const key = slot + name; if (!this.itemCache[key]) this.itemCache[key] = mountItem(name);
    this.items[slot] = this.itemCache[key]; sock.add(this.items[slot]);
  }
  /** Apply a full state. st: {pos, yaw, pose, face, tilt, roll, visible, opacity, items:{r,l,lw}, scale} */
  apply(st) {
    const p = st.pose;
    this.root.visible = st.visible !== false;
    this.root.position.set(st.pos[0], st.pos[1], st.pos[2]);
    this.root.rotation.set(0, st.yaw || 0, 0);
    this.root.scale.setScalar(st.scale ?? 1);
    // hips: tilt (lying / falling) rotates about the hip pivot
    this.hips.position.set(0, HIP_HEIGHT + p.bob + (p.lift || 0), 0);
    this.hips.rotation.set(-(st.tilt || 0), 0, st.roll || 0);
    this.spine.rotation.set(p.lean, p.twist, -p.side, 'YXZ');
    this.head.rotation.set(p.headPitch, p.headYaw, p.headRoll, 'YXZ');
    this.lArm.rotation.set(-p.lShP, 0, p.lShR, 'ZXY'); this.rArm.rotation.set(-p.rShP, 0, -p.rShR, 'ZXY');
    this.lFore.rotation.set(-p.lEl, 0, 0); this.rFore.rotation.set(-p.rEl, 0, 0);
    this.lLeg.rotation.set(-p.lHipP, 0, p.lHipR, 'ZXY'); this.rLeg.rotation.set(-p.rHipP, 0, -p.rHipR, 'ZXY');
    this.lShin.rotation.set(p.lKn, 0, 0); this.rShin.rotation.set(p.rKn, 0, 0);
    const it = st.items || {};
    this.setItem('r', it.r); this.setItem('l', it.l);
    if (it.lw !== undefined || this._lw) { // wrist watch lives on the left hand socket too, separate slot
      if (!this._watch) { this._watch = mountItem('watch'); this._watch.position.set(0, 0.1, 0); this.lFore.add(this._watch); this._watch.position.set(0, -LOWER_ARM * 0.75, 0); }
      this._watch.visible = !!it.lw; this._lw = true;
    }
    const op = st.opacity ?? 1;
    if (op !== this.opacity) { this.opacity = op; for (const m of [this.limbMat, this.headMat, this.faceMat, this.outlineMat]) { m.opacity = op * (m === this.outlineMat && this.variant === 'shadow' ? 0.35 : 1); m.depthWrite = op > 0.99 && m !== this.faceMat; } }
    this.shadow.material.opacity = 0.35 * op * (st.shadow ?? 1);
    this.shadow.position.y = (st.groundY ?? st.pos[1]) - st.pos[1] + 0.03;
    this.shadow.visible = (st.shadow ?? 1) > 0;
    if (st.face) this.updateFace(st.face);
  }
  updateFace(f) {
    const key = Object.values(f).map(v => (typeof v === 'number' ? v.toFixed(2) : v)).join(',');
    if (key === this.faceKey) return;
    this.faceKey = key; drawFace(this.faceCtx, f, this.variant); this.faceTex.needsUpdate = true;
  }
  handWorld(slot = 'r', out = new THREE.Vector3()) { this.root.updateMatrixWorld(true); return (slot === 'r' ? this.rHand : this.lHand).getWorldPosition(out); }
  headWorld(out = new THREE.Vector3()) { this.root.updateMatrixWorld(true); return this.head.localToWorld(out.set(0, HEAD_R + 0.03, 0)); }
}

// ---------------------------------------------------------------- Actor timeline
const ACT_STRIDE = { walk: 1.25, run: 2.3, panicRun: 2.3, sneak: 0.75, tiptoe: 0.55, backAway: 1.0 };
const ACT_IMPACT = { punch: 0.35, mine: 0.55, hammer: 0.6, place: 0.5, swing: 0.4 };
const BLEND = 0.2;

/**
 * Actor: binds a rig to keyframed data.
 *  path:  [[t, [x, z]] | [t, [x, y, z]], ease]  (2D points snap to ground)
 *  yaw:   optional explicit [[t, radians, ease]] else faces travel direction
 *  acts:  [[t, name, opts]]  (crossfaded)
 *  expr:  [[t, name]]        (crossfaded)
 *  look:  [[t, [headYaw, headPitch]] , ease] additive head offsets
 *  eyes:  [[t, [lookX, lookY]], ease] pupil direction
 *  items: [[t, {r, l, lw}]]
 *  jumps: [[t0, dur, height]]
 *  tilt:  [[t, radians, ease]] whole-body pitch (lying down / falling back)
 */
export class Actor {
  constructor(rig, o) {
    this.rig = rig; this.o = o; this.ground = o.ground || (() => 0);
    this.path = new Keys(o.path.map(([t, p, e]) => [t, p, e || 'inOut']));
    this.is2D = o.path[0][1].length === 2;
    this.yawK = o.yaw ? new Keys(o.yaw) : null;
    this.acts = o.acts || [[0, 'idle']];
    this.exprs = o.expr || [[0, 'neutral']];
    this.lookK = o.look ? new Keys(o.look) : null;
    this.eyesK = o.eyes ? new Keys(o.eyes) : null;
    this.tiltK = o.tilt ? new Keys(o.tilt) : null;
    this.rollK = o.roll ? new Keys(o.roll) : null;
    this.items = o.items || [[0, {}]];
    this.jumps = o.jumps || [];
    this.talk = o.talk || (() => 0);
    this.opacityK = o.opacity ? new Keys(o.opacity) : null;
    this.visibleK = o.visible || null;
    this.extra = o.extra || null;
    this.yOff = o.yOff ? new Keys(o.yOff) : null;
    this._buildTables();
  }
  xyz(t) {
    const p = this.path.at(t);
    if (this.is2D) return [p[0], this.ground(p[0], p[1]), p[1]];
    return p[1] === null ? [p[0], this.ground(p[0], p[2]), p[2]] : p;
  }
  _buildTables() { // cumulative distance and smoothed travel direction, sampled at 60 Hz
    const t0 = Math.min(this.path.k[0][0], 0), t1 = Math.max(this.path.end, ...this.acts.map(a => a[0])) + 2;
    this.tab = { t0, dt: 1 / 60, dist: [], yaw: [] };
    let d = 0, yaw = this.o.yaw0 ?? 0, prev = this.xyz(t0);
    for (let t = t0; t <= t1 + 1e-6; t += this.tab.dt) {
      const p = this.xyz(t); const dx = p[0] - prev[0], dz = p[2] - prev[2]; const step = Math.hypot(dx, dz);
      d += step;
      if (step / this.tab.dt > 0.25) { const target = Math.atan2(dx, dz); let diff = target - yaw; while (diff > Math.PI) diff -= TAU; while (diff < -Math.PI) diff += TAU; yaw += diff * 0.22; }
      this.tab.dist.push(d); this.tab.yaw.push(yaw); prev = p;
    }
  }
  _tab(arr, t) { const i = clamp((t - this.tab.t0) / this.tab.dt, 0, arr.length - 1); const i0 = Math.floor(i); const f = i - i0; return lerp(arr[i0], arr[Math.min(i0 + 1, arr.length - 1)], f); }
  dist(t) { return this._tab(this.tab.dist, t); }
  actAt(t) { let i = 0; for (let k = 0; k < this.acts.length; k++) if (t >= this.acts[k][0]) i = k; return i; }
  _actPose(i, t) {
    const [ts, name, opts = {}] = this.acts[i]; const lt = Math.max(0, t - ts);
    const o = { ...opts };
    if (ACT_STRIDE[name]) { const moved = this.dist(t) - this.dist(ts); o.phase = moved > 0.05 || !opts.inPlace ? moved / (opts.stride || ACT_STRIDE[name]) : lt; if (opts.inPlace) o.phase = lt * (opts.rate || 1.8); }
    const fn = Poses[name] || Poses.idle; return fn(lt, o);
  }
  poseAt(t) {
    const i = this.actAt(t); let p = this._actPose(i, t);
    const ts = this.acts[i][0];
    if (i > 0 && t - ts < BLEND) p = blendPose(this._actPose(i - 1, t), p, smooth(prog(t, ts, ts + BLEND)));
    for (const [j0, dur, h] of this.jumps) { // jump pose overlay
      if (t >= j0 - 0.08 && t <= j0 + dur + 0.25) {
        const k = clamp((t - j0) / dur);
        const w = t < j0 ? (t - j0 + 0.08) / 0.08 : t > j0 + dur ? 1 - (t - j0 - dur) / 0.25 : 1;
        const jp = t > j0 + dur ? Poses.land(t - j0 - dur) : Poses.jump(0, { k });
        p = blendPose(p, jp, clamp(w)); void h;
      }
    }
    if (this.lookK) { const [hy, hp] = this.lookK.at(t); p.headYaw += hy; p.headPitch += hp; }
    if (this.extra) p = this.extra(t, p) || p;
    return p;
  }
  faceAt(t) {
    const ex = this.exprs; let i = 0; for (let k = 0; k < ex.length; k++) if (t >= ex[k][0]) i = k;
    let f = { ...EXPR[ex[i][1]] };
    if (i > 0 && t - ex[i][0] < 0.18) f = blendExpr(EXPR[ex[i - 1][1]], f, smooth(prog(t, ex[i][0], ex[i][0] + 0.18)));
    // blinking (deterministic): roughly every 3.5 s
    const bt = (t + this.o.blinkSeed || 0) % 3.7; f.blink = bt < 0.13 ? Math.abs(bt / 0.065 - 1) : 1;
    if (f.eyeOpen < 0.2) f.blink = 1;
    const e = this.eyesK ? this.eyesK.at(t) : [0, 0]; f.lookX = e[0]; f.lookY = e[1];
    if (f.wobble > 0.5) { f.lookX += noise1(t * 9) * 0.15; f.lookY += noise1(t * 9 + 40) * 0.1; }
    const tk = this.talk(t); if (tk > 0) { f.mouthOpen = Math.max(f.mouthOpen, (0.15 + 0.6 * Math.abs(noise1(t * 13))) * tk); }
    f.sweatY = (t * 0.6) % 1;
    return f;
  }
  state(t) {
    let pos = this.xyz(t);
    const groundY = pos[1];
    let y = pos[1];
    for (const [j0, dur, h] of this.jumps) if (t >= j0 && t <= j0 + dur) { const k = (t - j0) / dur; y += 4 * h * k * (1 - k); }
    if (this.yOff) y += this.yOff.at(t);
    const yaw = this.yawK ? this.yawK.at(t) : this._tab(this.tab.yaw, t);
    let items = {}; for (const [ts, it] of this.items) if (t >= ts) items = it;
    let visible = true; if (this.visibleK) for (const [ts, v] of this.visibleK) if (t >= ts) visible = v;
    return { pos: [pos[0], y, pos[2]], groundY, yaw, pose: this.poseAt(t), face: this.faceAt(t), items, visible,
      tilt: this.tiltK ? this.tiltK.at(t) : 0, roll: this.rollK ? this.rollK.at(t) : 0, opacity: this.opacityK ? this.opacityK.at(t) : 1 };
  }
  update(t) { const st = this.state(t); this.rig.apply(st); return st; }
  /** Sound cues derived from motion: footsteps from stride phase and impacts from swing phase. */
  events(tA, tB, surface = 'grass') {
    const out = [];
    for (let i = 0; i < this.acts.length; i++) {
      const [ts, name, opts = {}] = this.acts[i]; const te = i + 1 < this.acts.length ? this.acts[i + 1][0] : tB;
      const a = Math.max(ts, tA), b = Math.min(te, tB); if (b <= a) continue;
      if (ACT_STRIDE[name]) {
        const stride = opts.stride || ACT_STRIDE[name]; let last = null;
        for (let t = a; t < b; t += 1 / 120) {
          const ph = opts.inPlace ? (t - ts) * (opts.rate || 1.8) : (this.dist(t) - this.dist(ts)) / stride;
          const n = Math.floor(ph * 2 + 0.25);
          if (last !== null && n !== last) out.push({ t, id: 'step', surface: opts.surface || surface, gain: name === 'run' || name === 'panicRun' ? 1 : name === 'sneak' || name === 'tiptoe' ? 0.35 : 0.7 });
          last = n;
        }
      }
      if (ACT_IMPACT[name] && opts.sfx !== null) {
        const r = opts.rate ?? ({ punch: 3, mine: 2.2, hammer: 3.2, place: 5, swing: 2.5 })[name];
        for (let n = 0; ; n++) { const t = ts + (n + ACT_IMPACT[name]) / r; if (t >= te || t >= tB) break; if (t >= tA) out.push({ t, id: opts.sfx || name, gain: opts.gain ?? 1 }); }
      }
    }
    for (const [j0, dur] of this.jumps) { if (j0 >= tA && j0 < tB) out.push({ t: j0, id: 'jump', gain: 0.8 }); if (j0 + dur >= tA && j0 + dur < tB) out.push({ t: j0 + dur, id: 'step', surface, gain: 1 }); }
    return out;
  }
}
export { HEAD_R, TORSO };
export const _ease = Ease; export const _hash = hash; export const _pose = pose;
