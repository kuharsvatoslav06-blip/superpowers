// Episode 2 sets: the copied overworld (reused), the cave campfire (reused), the frozen village,
// the bedrock shaft with floating stairs, the endless Archive, and the reset world (reused).
import * as THREE from 'three';
import { buildOverworld, buildCave, buildFresh, caveZ } from '../stages.js';
import { VoxelWorld, genTerrain, makeTree, Sky, LightRig, LIGHT, blockMesh, B, radialTex } from '../../engine/EnvironmentManager.js';
import { Stickman } from '../../engine/CharacterController.js';
import { Enderman, Bird } from '../../engine/Mobs.js';
import { ParticleField } from '../../engine/Particles.js';
import { rng, hash3, clamp, smooth } from '../../engine/AnimationSystem.js';
import { Sign, Chest, textCanvas } from '../props.js';

export const L2 = {
  archive: { ...LIGHT.cave, top: 0x02040c, horizon: 0x0a1430, bottom: 0x000000, fog: 0x070d22, fogNear: 14, fogFar: 70, hemiSky: 0x7a9cff, hemiGround: 0x101428, hemi: 0.9, sun: 0x9ab4ff, sunI: 0.7, amb: 0.12 },
  shaft: { ...LIGHT.cave, fog: 0x0a0814, fogNear: 12, fogFar: 60, hemiSky: 0x9a90d0, hemiGround: 0x201830, hemi: 1.15, amb: 0.22 },
  village: { ...LIGHT.day, horizon: 0xc8dcf0, top: 0x5a8ad0, hemi: 1.3, sunI: 2.0, saturation: 0.9 },
};

function stage(withSky = true) {
  const scene = new THREE.Scene(); const lights = new LightRig(scene); const sky = withSky ? new Sky(scene) : null;
  const particles = new ParticleField(3000); scene.add(particles.points);
  const glowParticles = new ParticleField(2000, { additive: true, glow: true }); scene.add(glowParticles.points);
  const S = { scene, lights, sky, particles, glowParticles };
  S.light = (preset, t, extra) => S.lights.apply(preset, S.sky, S.cam, { time: t, ...extra });
  return S;
}

/** Floating name tag (canvas sprite) */
export function nameTag(text) {
  const { tex } = textCanvas(512, 96, (x, w, h) => { x.fillStyle = 'rgba(0,0,0,0.45)'; x.fillRect(0, 0, w, h); x.font = '400 54px Silkscreen'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffffff'; x.fillText(text, w / 2, h / 2 + 4); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); s.scale.set(1.7, 0.32, 1); s.renderOrder = 8; return s;
}
/** A handheld sign with flip-to-change-text animation. schedule: [[t, ['LINE', ...]], ...] */
export class HeldSign {
  constructor(parentScene) { this.sign = new Sign([''], { post: false }); this.sign.group.scale.set(1.05, 1.05, 1.05); parentScene.add(this.sign.group); }
  update(t, holder, schedule, visible = true) {
    let cur = null, tc = -99; for (const [ts, lines] of schedule) if (t >= ts) { cur = lines; tc = ts; }
    let next = null; for (const [ts] of schedule) if (ts > t) { next = ts; break; }
    const g = this.sign.group; g.visible = visible && !!cur && cur.length > 0 && cur[0] !== '';
    if (!g.visible) return;
    this.sign.setText(cur);
    const flip = Math.min(1, (t - tc) / 0.14, next ? (next - t) / 0.14 : 1);
    const y = holder.yaw; g.position.set(holder.pos[0] + Math.sin(y) * 0.48, holder.pos[1] + 1.22 + (holder.lift || 0), holder.pos[2] + Math.cos(y) * 0.48);
    g.rotation.set(0, y, 0); g.scale.set(1.05 * Math.max(0.02, flip), 1.05, 1.05);
  }
}
/** Static-faced cube monster that deletes what it touches */
export class Glitcher {
  constructor(scene) {
    this.cv = document.createElement('canvas'); this.cv.width = this.cv.height = 24; this.ctx = this.cv.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.cv); this.tex.magFilter = THREE.NearestFilter; this.tex.colorSpace = THREE.SRGBColorSpace;
    const side = new THREE.MeshLambertMaterial({ color: 0x2a2236, emissive: 0x3a0a4a }); const face = new THREE.MeshBasicMaterial({ map: this.tex });
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), [side, side, side, side, face, side]); scene.add(this.mesh);
    this.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(255,60,255,0.9)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); this.halo.scale.setScalar(4); this.mesh.add(this.halo);
  }
  apply({ pos, yaw = 0, visible = true, t = 0, seed = 1 }) {
    this.mesh.visible = visible; if (!visible) return;
    this.mesh.position.set(pos[0] + (hash3(t * 30, seed, 1) - 0.5) * 0.08, pos[1], pos[2] + (hash3(t * 30, seed, 2) - 0.5) * 0.08); this.mesh.rotation.set(0, yaw, 0);
    const f = Math.floor(t * 20); if (f !== this._f) { this._f = f; const x = this.ctx; for (let y = 0; y < 24; y++) for (let i = 0; i < 24; i++) { const v = hash3(i, y, f + seed * 99); x.fillStyle = v < 0.08 ? '#ff00ff' : v < 0.16 ? '#00ffaa' : `rgb(${v * 255 | 0},${v * 255 | 0},${v * 255 | 0})`; x.fillRect(i, y, 1, 1); } this.tex.needsUpdate = true; }
  }
}
/** Snow globe with a tiny copy of the hero's first world inside */
export function snowGlobe(withFigure = false) {
  const g = new THREE.Group();
  const w = new VoxelWorld(0, 0, 0, 9, 9, 9); w.fill(0, 0, 0, 8, 0, 8, 'grass'); w.fill(1, 1, 1, 3, 3, 3, 'planks'); w.set(1, 1, 1, 'log'); w.set(3, 1, 1, 'log'); w.set(1, 1, 3, 'log'); w.set(3, 1, 3, 'log'); w.fill(0, 4, 0, 4, 4, 4, 'planks'); w.set(2, 1, 1, 0); w.set(2, 2, 1, 0);
  for (let y = 2; y < 6; y++) w.set(6, y, 6, 'log'); w.fill(5, 5, 5, 7, 7, 7, 'leaves');
  const mini = w.build(); mini.scale.setScalar(0.06); mini.position.set(-0.27, -0.12, -0.27); g.add(mini);
  if (withFigure) { const fig = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.02), new THREE.MeshBasicMaterial({ color: 0x111111 })); fig.position.set(0.1, -0.02, 0.1); g.add(fig);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); hd.position.set(0.1, 0.05, 0.1); g.add(hd); }
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 20), new THREE.MeshPhongMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.22, shininess: 120, specular: 0xffffff, depthWrite: false }));
  glass.position.y = 0.08; g.add(glass);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.14, 20), new THREE.MeshLambertMaterial({ color: 0x5a3a1a })); base.position.y = -0.19; g.add(base);
  return g;
}

// =========================================================== copied overworld (extends episode-1 overworld)
export function buildOverCopy() {
  const S = buildOverworld(); const base = S.reset;
  S.nameTag = nameTag('PLAYER 47 (COPY)'); S.scene.add(S.nameTag);
  // farm: tilled rows with crops next to the house
  const farm = new VoxelWorld(10, 20, -6, 6, 3, 6); for (let x = 11; x <= 14; x++) for (let z = -5; z <= -2; z++) { farm.set(x, 20, z, x % 2 ? 'dirt' : 'water'); if (x % 2) farm.set(x, 21, z, 'tallgrass'); }
  S.farm = farm.build(); S.scene.add(S.farm);
  S.chicken = new Bird(0xf4f4f4); S.chicken.root.scale.setScalar(2.2); S.scene.add(S.chicken.root);
  S.line = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 4), new THREE.MeshBasicMaterial({ color: 0xdddddd })); S.scene.add(S.line);
  S.bobber = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshLambertMaterial({ color: 0xd8322a })); S.scene.add(S.bobber);
  S.sign3 = new Sign(['YOU SHOULD', 'HAVE OPENED IT.']); S.scene.add(S.sign3.group);
  S.reset = () => { base(); S.nameTag.visible = false; S.farm.visible = false; S.chicken.root.visible = false; S.line.visible = false; S.bobber.visible = false; S.sign3.group.visible = false; };
  return S;
}

// =========================================================== cave with campfire (extends episode-1 cave)
export function buildCaveCamp() {
  const S = buildCave(); const base = S.reset;
  const camp = new THREE.Group(); camp.position.set(-19.5, 5, caveZ(-20) + 0.5); S.scene.add(camp); S.camp = camp;
  for (let i = 0; i < 3; i++) { const l = blockMesh('log'); l.scale.set(0.25, 0.22, 0.95); l.rotation.y = i * 1.05; l.position.y = 0.11; camp.add(l); }
  S.fireGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(255,150,40,0.95)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); S.fireGlow.position.y = 0.5; S.fireGlow.scale.setScalar(1.6); camp.add(S.fireGlow);
  S.fireLight = new THREE.PointLight(0xff9a40, 0, 14, 1.4); S.fireLight.position.set(-19.5, 6.3, caveZ(-20) + 0.5); S.scene.add(S.fireLight);
  S.zeroSign = new HeldSign(S.scene);
  S.digBlocks = ['stone', 'deep', 'bedrock', 'glitch'].map(n => { const m = blockMesh(n); m.position.set(-30.5, 5.5, caveZ(-30.5) + 0.5); S.scene.add(m); return m; });
  S.reset = () => { base(); S.camp.visible = false; S.fireLight.intensity = 0; S.digBlocks.forEach(m => (m.visible = false)); };
  return S;
}

// =========================================================== frozen village
export function buildVillage() {
  const S = stage(); const w = new VoxelWorld(-40, 0, -40, 80, 34, 80); S.world = w;
  genTerrain(w, { seed: 33, base: 20, amp: 3, scale: 0.05, flowers: 0.05, flat: (x, z) => { const k = smooth(clamp(1 - Math.max(Math.abs(x), Math.abs(z - 2)) / 20)); return k > 0 ? [20, k] : null; } });
  // canyon + river on the +z side
  for (let x = -40; x < 40; x++) for (let z = 24; z < 40; z++) { const edge = z === 24; for (let y = 9; y <= 33; y++) w.set(x, y, z, 0); for (let y = 4; y <= 8; y++) w.set(x, y, z, 'stone'); if (z > 25 && z < 38) { w.set(x, 9, z, 'water'); w.set(x, 10, z, 'water'); } void edge; }
  for (let x = -40; x < 40; x++) for (let y = 9; y <= 20; y++) if (w.get(x, y, 23)) w.set(x, y, 23, y === 20 ? 'grass' : 'stone');
  // gravel plaza and paths
  for (let x = -14; x <= 14; x++) for (let z = -3; z <= 3; z++) w.set(x, 20, z, 'gravel');
  for (let z = -14; z <= 14; z++) for (let x = -2; x <= 2; x++) w.set(x, 20, z, 'gravel');
  for (let x = -15; x <= 15; x++) for (let z = -15; z <= 15; z++) for (let y = 21; y <= 22; y++) if (w.get(x, y, z) && !B[w.get(x, y, z)]) w.set(x, y, z, 0);
  // well
  for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) { w.set(x, 21, z, (x || z) ? 'cobble' : 'water'); }
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { w.set(x, 22, z, 'log'); w.set(x, 23, z, 'log'); } w.fill(-1, 24, -1, 1, 24, 1, 'planks');
  // houses
  const house = (x0, z0, door) => { for (let y = 21; y <= 24; y++) for (let x = x0; x <= x0 + 4; x++) for (let z = z0; z <= z0 + 4; z++) {
      const edge = x === x0 || x === x0 + 4 || z === z0 || z === z0 + 4; if (!edge) { w.set(x, y, z, 0); continue; }
      const corner = (x === x0 || x === x0 + 4) && (z === z0 || z === z0 + 4); let b = y === 21 ? 'cobble' : corner ? 'log' : 'planks';
      if (y === 23 && !corner && (x === x0 + 2 || z === z0 + 2)) b = 'glass'; w.set(x, y, z, b); }
    for (let x = x0 - 1; x <= x0 + 5; x++) for (let z = z0 - 1; z <= z0 + 5; z++) w.set(x, 25, z, 'planks'); for (let x = x0; x <= x0 + 4; x++) for (let z = z0; z <= z0 + 4; z++) w.set(x, 26, z, 'cobble');
    const [dx, dz] = door; w.set(dx, 21, dz, 0); w.set(dx, 22, dz, 0); };
  house(-12, -11, [-10, -7]); house(6, -11, [8, -7]); house(-12, 6, [-10, 6]); house(6, 6, [8, 6]); house(-22, -3, [-18, -1]);
  S.terrain = w.build(); S.scene.add(S.terrain);
  S.ground = (x, z) => w.top(Math.floor(x), Math.floor(z)) + 1;
  const r = rng(8); for (let i = 0; i < 40; i++) { const x = Math.floor(-38 + r() * 76), z = Math.floor(-38 + r() * 60); if (Math.abs(x) < 26 && Math.abs(z) < 20) continue; if (z > 20) continue; S.scene.add(makeTree(x, S.ground(x, z), z, i + 5, 5)); }
  S.villagers = [0, 1, 2, 3, 4, 5].map(() => { const v = new Stickman(); S.scene.add(v.root); return v; });
  S.hero = new Stickman(); S.scene.add(S.hero.root);
  S.reset = () => { S.particles.clear(); S.glowParticles.clear(); S.hero.root.visible = true; };
  return S;
}

// =========================================================== the shaft
export const HELIX = { cx: 0.5, cz: 0.5, r: 7, top: 52, drop: 0.42, step: 0.14, n: 105 };
export const helixPos = (i) => { const a = Math.PI / 2 + i * HELIX.step; return [HELIX.cx + Math.cos(a) * HELIX.r, HELIX.top - i * HELIX.drop, HELIX.cz + Math.sin(a) * HELIX.r]; };
export function buildShaft() {
  const S = stage(false); S.scene.background = new THREE.Color(0x000000);
  const w = new VoxelWorld(-14, 0, -14, 30, 60, 30);
  for (let y = 0; y < 60; y++) for (let z = -14; z < 16; z++) for (let x = -14; x < 16; x++) {
    const d = Math.hypot(x - 0.5, z - 0.5); if (d < 11.5 || d > 13.5) continue;
    w.set(x, y, z, y > 44 ? (hash3(x, y, z) < 0.05 ? 'iron_ore' : 'stone') : y > 26 ? 'deep' : y > 10 ? 'bedrock' : (hash3(x, y, z) < 0.3 ? 'glitch' : 'void'));
  }
  w.fill(-14, 58, -14, 15, 59, 15, 'stone'); for (let x = -1; x <= 1; x++) for (let z = 6; z <= 8; z++) { w.set(x, 58, z, 0); w.set(x, 59, z, 0); }
  S.terrain = w.build(); S.scene.add(S.terrain);
  S.steps = []; for (let i = 0; i < HELIX.n; i++) { const m = blockMesh(i % 5 === 0 ? 'obsidian' : 'cobble'); const p = helixPos(i); m.position.set(p[0], p[1] - 0.5, p[2]); m.userData = { i, p }; S.scene.add(m); S.steps.push(m); }
  S.glitchers = [0, 1, 2].map(() => new Glitcher(S.scene));
  S.hero = new Stickman(); S.scene.add(S.hero.root); S.zero = new Stickman({ variant: 'shadow' }); S.scene.add(S.zero.root);
  S.zeroSign = new HeldSign(S.scene);
  S.heroLight = new THREE.PointLight(0xd8a0ff, 0, 14, 1.3); S.scene.add(S.heroLight);
  S.pickLight = new THREE.PointLight(0xb050ff, 0, 6, 1.5); S.scene.add(S.pickLight);
  S.wallLights = [50, 38, 26, 14].map((y, i) => { const L = new THREE.PointLight(i % 2 ? 0x8a6cff : 0xffa060, 14, 26, 1.2); L.position.set(Math.cos(i * 1.7) * 9 + 0.5, y, Math.sin(i * 1.7) * 9 + 0.5); S.scene.add(L); return L; });
  S.reset = () => { S.particles.clear(); S.glowParticles.clear(); S.steps.forEach(m => { m.visible = true; m.scale.setScalar(1); m.position.set(m.userData.p[0], m.userData.p[1] - 0.5, m.userData.p[2]); m.rotation.set(0, 0, 0); }); S.glitchers.forEach(g => g.apply({ pos: [0, 0, 0], visible: false })); };
  return S;
}

// =========================================================== the archive
export function buildArchive() {
  const S = stage(); const w = new VoxelWorld(-44, 0, -44, 88, 12, 88); S.world = w;
  for (let z = -44; z < 44; z++) for (let x = -44; x < 44; x++) w.set(x, 0, z, (Math.floor(x / 2) + Math.floor(z / 2)) % 2 ? 'stonebrick' : 'brick_dark');
  for (let x = -40; x <= 40; x += 6) for (let z = -40; z <= 40; z++) {
    if (Math.hypot(x, z) < 12 || Math.abs(z) % 14 === 0) continue;
    for (let y = 1; y <= 7; y++) w.set(x, y, z, y === 7 ? 'brick_dark' : 'chest');
    if (z % 6 === 0) w.set(x, 8, z, 'lantern');
  }
  w.set(-22, 1, 6, 0);
  S.terrain = w.build(); S.scene.add(S.terrain);
  S.ground = () => 1;
  S.lamps = [[-17, 9, -5], [-17, 9, 9], [5, 9, -12], [0, 10, 0], [13, 9, 6]].map(p => { const L = new THREE.PointLight(0x7fb4ff, 0, 24, 1.1); L.position.set(...p); S.scene.add(L); return L; });
  // labels on chests along the hero's aisle (x = -20 shelf faces +x)
  S.labels = [['WORLD 12', 'PLAYER 12', 'DAY 31', -6.0], ['WORLD 30', 'PLAYER 30', 'DAY 99', -0.5], ['WORLD 47', 'PLAYER 47', 'DAY 1', 6.0]].map(([a, b, c, z]) => {
    const { tex } = textCanvas(256, 160, (x, W, H) => { x.fillStyle = '#d9c79a'; x.fillRect(0, 0, W, H); x.strokeStyle = '#5b4326'; x.lineWidth = 8; x.strokeRect(4, 4, W - 8, H - 8); x.fillStyle = '#2b1d12'; x.font = '400 40px VT323'; x.textAlign = 'center'; x.fillText(a, W / 2, 50); x.fillText(b, W / 2, 92); x.fillStyle = c === 'DAY 99' ? '#9e1010' : '#2b1d12'; x.fillText(c, W / 2, 134); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.39), new THREE.MeshLambertMaterial({ map: tex, emissive: 0x333333, emissiveMap: tex })); m.position.set(-20.97, 3.3, z + 0.5); m.rotation.y = Math.PI / 2; S.scene.add(m); return m; });
  S.myChest = new Chest([-21.5, 1, 6.5], Math.PI / 2); S.scene.add(S.myChest.group);
  S.globe = snowGlobe(false); S.scene.add(S.globe);
  S.shelfGlobes = []; for (let i = 0; i < 14; i++) { const g = snowGlobe(true); const z = -30 + i * 4.3; g.position.set(-9.5, 8.25, z); g.scale.setScalar(1.4); S.scene.add(g); S.shelfGlobes.push(g); }
  S.bigTable = blockMesh('table'); S.bigTable.scale.setScalar(3); S.bigTable.position.set(0, 2.5, 0); S.scene.add(S.bigTable);
  S.tableGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(255,255,255,0.9)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); S.tableGlow.position.set(0, 4.3, 0); S.tableGlow.scale.setScalar(5); S.scene.add(S.tableGlow);
  S.hero = new Stickman(); S.scene.add(S.hero.root); S.zero = new Stickman({ variant: 'shadow' }); S.scene.add(S.zero.root);
  S.zeroSign = new HeldSign(S.scene);
  S.watcher = new Enderman(); S.scene.add(S.watcher.root);
  S.heroLight = new THREE.PointLight(0xaac4ff, 0, 10, 1.4); S.scene.add(S.heroLight);
  S.eerie = new THREE.PointLight(0xb050ff, 0, 30, 1.0); S.scene.add(S.eerie);
  S.reset = () => { S.particles.clear(); S.glowParticles.clear(); S.myChest.update(0, 0); S.globe.visible = false; S.tableGlow.visible = false; S.watcher.root.visible = false; S.zero.root.visible = false; S.hero.root.visible = true; S.eerie.intensity = 0; S.lamps.forEach(L => (L.intensity = 10)); };
  return S;
}

// =========================================================== reset world, day 100 (extends episode-1 fresh world)
export function buildFresh100() {
  const S = buildFresh(); const base = S.reset;
  S.p48 = new Stickman(); S.scene.add(S.p48.root);
  S.heroSign = new HeldSign(S.scene);
  S.reset = () => { base(); S.p48.root.visible = false; };
  return S;
}
export { B };
