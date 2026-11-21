// Episode 3 sets: the one-block sky island (all its phases), the bridge and the far island, the greedy player's
// flashback towers, the world below (grows back in rings), clouds under the island, and Origin, the talking block.
import * as THREE from 'three';
import { VoxelWorld, genTerrain, makeTree, Sky, LightRig, LIGHT, blockGeometry, crackMesh, atlas, BLOCKS, B, radialTex } from '../../engine/EnvironmentManager.js';
import { Stickman, makeItem } from '../../engine/CharacterController.js';
import { Bird, Spider, Ghast } from '../../engine/Mobs.js';
import { ParticleField } from '../../engine/Particles.js';
import { rng, hash, hash3, clamp } from '../../engine/AnimationSystem.js';
import { Sign, Chest } from '../props.js';
import { nameTag, HeldSign } from '../ep2/stages.js';

export const L3 = {
  sky: { ...LIGHT.day, bottom: 0x6a92cc, fogNear: 70, fogFar: 260, clouds: 1 },
  noon: { ...LIGHT.noon, bottom: 0x6a92cc, fogNear: 70, fogFar: 260 },
  sunset: { ...LIGHT.dusk, bottom: 0x27284a, fogNear: 60, fogFar: 230 },
  night: { ...LIGHT.night, bottom: 0x03060f, fogNear: 50, fogFar: 200, hemi: 1.15 },
  nether: { top: 0x2a0505, horizon: 0xa8341a, bottom: 0x1a0303, fog: 0x7a240e, fogNear: 30, fogFar: 150, hemiSky: 0xffa080, hemiGround: 0x3a0a0a, hemi: 1.25, sun: 0xff8a50, sunI: 1.7, amb: 0.25, stars: 0, moon: 0, sunAngle: 0.6, clouds: 0, exposure: 1 },
  end: { top: 0x000000, horizon: 0x160c26, bottom: 0x000000, fog: 0x0b0614, fogNear: 45, fogFar: 170, hemiSky: 0xd0b8ff, hemiGround: 0x2a2040, hemi: 1.45, sun: 0xe8dcff, sunI: 1.5, amb: 0.35, stars: 1, moon: 0, sunAngle: 1.0, clouds: 0, exposure: 1 },
  dawn: { ...LIGHT.morning, bottom: 0x6a92cc, fogNear: 70, fogFar: 260 },
  final: { ...LIGHT.day, bottom: 0x6a92cc, fogNear: 110, fogFar: 380, clouds: 1 },
};
export const OX = 0.5, OZ = 0.5, TOP = 61; // Origin column centre, standing height on the island
export const FAR = [52.5, 0.5];             // far island centre

function stage() {
  const scene = new THREE.Scene(); const lights = new LightRig(scene); const sky = new Sky(scene);
  const particles = new ParticleField(3000); scene.add(particles.points);
  const glowParticles = new ParticleField(2500, { additive: true, glow: true }); scene.add(glowParticles.points);
  const S = { scene, lights, sky, particles, glowParticles };
  S.light = (preset, t, extra) => S.lights.apply(preset, S.sky, S.cam, { time: t, ...extra });
  return S;
}

/** Origin: the first block. Changes its material by phase, grows a pixel face, glows when it talks, can shrink. */
export class OriginBlock {
  constructor(scene) {
    this.group = new THREE.Group(); scene.add(this.group);
    this.cube = new THREE.Mesh(blockGeometry('grass'), atlas().solid); this.group.add(this.cube); this.kind = 'grass';
    this.cv = document.createElement('canvas'); this.cv.width = this.cv.height = 32; this.ctx = this.cv.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.cv); this.tex.magFilter = THREE.NearestFilter; this.tex.minFilter = THREE.NearestFilter; this.tex.colorSpace = THREE.SRGBColorSpace;
    this.faceMat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, depthWrite: false, fog: false });
    this.faces = [0, 1, 2, 3].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.faceMat); const a = i * Math.PI / 2; m.position.set(Math.sin(a) * 0.503, 0, Math.cos(a) * 0.503); m.rotation.y = a; m.renderOrder = 3; this.group.add(m); return m; });
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(170,255,150,0.9)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); this.glow.scale.setScalar(3); this.group.add(this.glow);
    this.crack = crackMesh(); this.crack.visible = false; this.group.add(this.crack);
    this.light = new THREE.PointLight(0xb0ff90, 0, 9, 1.4); this.group.add(this.light);
    this.key = '';
  }
  setKind(kind) { if (kind === this.kind) return; this.kind = kind; this.cube.geometry = blockGeometry(kind); const d = BLOCKS[B[kind]]; this.cube.material = d.glow ? atlas().glow : atlas().solid; }
  drawFace(open, talk, lx, ly) {
    const key = [open, talk, lx, ly].map(v => v.toFixed(2)).join(); if (key === this.key) return; this.key = key;
    const x = this.ctx; x.clearRect(0, 0, 32, 32); if (open <= 0.01) { this.tex.needsUpdate = true; return; }
    const eh = Math.max(1, Math.round(8 * open)); const ey = 13 - eh / 2;
    for (const cx of [9, 19]) { x.fillStyle = 'rgba(10,10,10,0.92)'; x.fillRect(cx, Math.round(ey), 5, eh); if (eh > 3) { x.fillStyle = '#ffffff'; x.fillRect(cx + 1 + Math.round(lx * 2 + 1) - 1, Math.round(ey) + 1 + Math.round((ly + 1) * 1.5), 2, 2); } }
    const mo = Math.round(talk * 4); x.fillStyle = 'rgba(10,10,10,0.92)';
    if (mo > 0) { x.fillRect(12, 22, 9, 1 + mo); x.fillStyle = '#5a1a1a'; x.fillRect(13, 23, 7, Math.max(0, mo - 1)); }
    else { x.fillRect(13, 23, 7, 1); }
    this.tex.needsUpdate = true;
  }
  /** st: {kind, base:[x,y,z] bottom centre, scale, yaw, eyes 0..1, talk 0..1, glow 0..1, crack -1..4, visible, look:[x,y], hop} */
  apply(st) {
    const s = st.scale ?? 1; const base = st.base || [OX, 61, OZ];
    this.group.visible = st.visible !== false; if (!this.group.visible) { this.light.intensity = 0; return; }
    this.setKind(st.kind || 'grass');
    this.group.position.set(base[0], base[1] + s / 2 + (st.hop || 0), base[2]); this.group.scale.setScalar(s); this.group.rotation.set(st.tilt || 0, st.yaw || 0, st.roll || 0);
    const eyes = st.eyes || 0; this.faces.forEach(f => (f.visible = eyes > 0.01));
    this.drawFace(eyes, st.talk || 0, (st.look || [0, 0])[0], (st.look || [0, 0])[1]);
    const g = st.glow || 0; this.glow.visible = g > 0.01; this.glow.material.opacity = g * 0.8; this.glow.scale.setScalar(2.2 + g * 1.5);
    this.light.intensity = g * 6;
    const c = st.crack ?? -1; this.crack.visible = c >= 0; if (c >= 0) this.crack.userData.setStage(c);
  }
}

/** A pool of loose blocks (popping in, flying away, falling bridge pieces). */
function blockPool(scene, n) {
  const A = atlas(); const list = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(blockGeometry('dirt'), A.solid); m.visible = false; m.userData.kind = 'dirt'; scene.add(m); list.push(m); }
  return {
    list, used: 0,
    reset() { this.used = 0; for (const m of list) m.visible = false; },
    /** place block of kind with its min corner at [x,y,z] (cells) or explicit centre, scale */
    put(kind, c, { scale = 1, rot = null, centre = false } = {}) {
      const m = list[this.used++]; if (!m) return null;
      if (m.userData.kind !== kind) { m.geometry = blockGeometry(kind); const d = BLOCKS[B[kind]]; m.material = d.glow ? A.glow : d.water ? A.water : A.solid; m.userData.kind = kind; }
      m.visible = scale > 0.005; m.scale.setScalar(Math.max(scale, 0.001));
      if (centre) m.position.set(c[0], c[1], c[2]); else m.position.set(c[0] + 0.5, c[1] + 0.5 * scale + (1 - scale) * 0, c[2] + 0.5);
      if (rot) m.rotation.set(rot[0], rot[1], rot[2]); else m.rotation.set(0, 0, 0);
      return m;
    },
  };
}

/** Island voxel set. kind: 'grass' | 'nether' | 'end'. size: half extent of the top layer. */
function islandWorld(kind, half = 4, { farm = true, gen = true, holes = [], hole = false } = {}) {
  const w = new VoxelWorld(-8, 52, -8, 17, 12, 17);
  const top = kind === 'nether' ? 'netherrack' : kind === 'end' ? 'end_stone' : 'grass';
  const fill = kind === 'nether' ? 'netherrack' : kind === 'end' ? 'end_stone' : 'dirt';
  for (let x = -half; x <= half; x++) for (let z = -half; z <= half; z++) {
    if (x === 0 && z === 0 && hole) { w.set(0, 59, 0, fill); continue; } // Origin's own cell stays empty while it sits in the ground
    const r = Math.max(Math.abs(x), Math.abs(z)); if (r === half && Math.abs(x) === Math.abs(z) && half > 2) continue; // rounded corners
    w.set(x, 60, z, top);
    const depth = Math.max(0, half - r) + (hash3(x, 1, z) < 0.5 ? 1 : 0);
    for (let k = 1; k <= depth; k++) w.set(x, 60 - k, z, k > 2 && kind === 'grass' ? (hash3(x, k, z) < 0.3 ? 'stone' : 'dirt') : fill);
  }
  if (farm && half >= 4) for (let x = 2; x <= 4; x++) for (let z = -4; z <= -3; z++) { if (x === 4 && z === -4) continue;
    if (kind === 'grass') { if (x === 3 && z === -4) w.set(x, 60, z, 'water'); else { w.set(x, 60, z, 'farmland'); w.set(x, 61, z, 'wheat'); } } }
  if (gen && half >= 4) { w.set(5, 60, -1, 'water'); w.set(5, 60, 0, 'cobble'); w.set(5, 60, 1, 'lava'); for (let z = -1; z <= 1; z++) { w.set(6, 60, z, 'cobble'); w.set(5, 59, z, 'cobble'); w.set(6, 59, z, 'cobble'); } w.set(5, 61, -1, 'cobble'); w.set(5, 61, 1, 'cobble'); }
  if (kind === 'nether') for (const [x, z] of [[-3, -3], [-4, -2], [3, 3], [-3, 3]]) w.set(x, 60, z, 'lava');
  for (const [x, z] of holes) w.set(x, 60, z, 0);
  return w;
}
/** Cells of the house in build order (walls bottom-up, then roof), for the speed-build. */
export const HOUSE_CELLS = (() => { const out = [];
  for (let y = 61; y <= 63; y++) for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) { const edge = Math.abs(x) === 2 || Math.abs(z) === 2; if (!edge) continue; if (x === 0 && z === 2 && y <= 62) continue;
    const corner = Math.abs(x) === 2 && Math.abs(z) === 2; out.push([x, y, z, corner ? 'log' : y === 62 && (x === 0 || z === 0) ? 'glass' : 'planks']); }
  for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) out.push([x, 64, z, Math.abs(x) === 2 || Math.abs(z) === 2 ? 'log' : 'planks']);
  return out; })();
/** Sapling spots of the day-90 garden (outside house and farm). */
export const GARDEN = [[-4, -1], [-3, -3], [-4, 2], [4, 1], [-1, 4], [2, 4], [1, -4], [-2, -4], [4, 3]];
function houseWorld() {
  const w = new VoxelWorld(-3, 60, -3, 7, 6, 7); const roof = new VoxelWorld(-3, 60, -3, 7, 6, 7);
  for (let y = 61; y <= 63; y++) for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) {
    const edge = Math.abs(x) === 2 || Math.abs(z) === 2; if (!edge) continue;
    const corner = Math.abs(x) === 2 && Math.abs(z) === 2; let b = corner ? 'log' : 'planks';
    if (y === 62 && !corner && (x === 0 || z === 0)) b = 'glass';
    if (x === 0 && z === 2 && y <= 62) continue; // door gap facing +z
    w.set(x, y, z, b);
  }
  for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) roof.set(x, 64, z, Math.abs(x) === 2 || Math.abs(z) === 2 ? 'log' : 'planks');
  return { walls: w.build(), roof: roof.build() };
}
function farIsland() {
  const w = new VoxelWorld(44, 52, -8, 17, 12, 17); const cx = 52, cz = 0;
  for (let x = cx - 4; x <= cx + 4; x++) for (let z = cz - 4; z <= cz + 4; z++) { const d = Math.hypot(x - cx, z - cz); if (d > 4.3) continue; if (x === cx + 3 && z === cz - 1) continue; // a hole at the edge
    w.set(x, 60, z, d > 3.2 ? 'cobble' : hash3(x, 2, z) < 0.5 ? 'dirt' : 'grass'); const dep = Math.max(0, Math.round(3.5 - d)); for (let k = 1; k <= dep; k++) w.set(x, 60 - k, z, 'dirt'); }
  // ruined hut
  for (let y = 61; y <= 62; y++) for (let x = cx - 2; x <= cx + 1; x++) for (let z = cz - 3; z <= cz - 1; z++) { const edge = x === cx - 2 || x === cx + 1 || z === cz - 3; if (!edge) continue; if (hash3(x, y, z) < 0.35 + (y - 61) * 0.3) continue; w.set(x, y, z, hash3(x, y + 1, z) < 0.5 ? 'cobble' : 'mossy'); }
  w.set(cx + 2, 61, cz + 2, 'gold');
  return w.build();
}
function greedTowers() {
  const w = new VoxelWorld(-16, 52, -16, 33, 34, 33); const r = rng(44);
  for (const [cx, cz, h, b] of [[-9, -6, 22, 'gold'], [8, -9, 28, 'stonebrick'], [10, 7, 18, 'gold'], [-8, 9, 25, 'stonebrick'], [-13, 1, 14, 'diamond_ore'], [13, -1, 20, 'gold']]) {
    for (let y = 56; y < 56 + h; y++) for (let x = cx - 1; x <= cx + 1; x++) for (let z = cz - 1; z <= cz + 1; z++) if (r() < 0.95) w.set(x, y, z, b);
    w.set(cx, 56 + h, cz, 'glass');
  }
  for (let x = -6; x <= 6; x++) for (let z = -6; z <= 6; z++) if (Math.hypot(x, z) < 6.5) { w.set(x, 60, z, hash3(x, 5, z) < 0.5 ? 'stonebrick' : 'cobble'); w.set(x, 59, z, 'stone'); }
  return w.build();
}
/** The world below: terrain with ocean, mountains and a village, split into rings that can grow in one by one. */
function belowWorld(scene, rings = 7, R = 110) {
  const w = new VoxelWorld(-R, 0, -R, R * 2, 40, R * 2);
  genTerrain(w, { seed: 9, base: 15, amp: 13, scale: 0.022, flowers: 0.05, sea: 13 });
  // mountain range on the -x side
  for (let z = -R; z < R; z++) for (let x = -R; x < -30; x++) { const m = Math.max(0, 1 - Math.abs(z + 20) / 60) * Math.max(0, (-30 - x) / 50); const extra = Math.round(m * 16 * (0.7 + 0.3 * hash3(x, 0, z))); if (extra < 1) continue; const h = w.top(x, z); for (let y = h + 1; y <= Math.min(39, h + extra); y++) w.set(x, y, z, y > 33 ? 'quartz' : 'stone'); }
  // village on a flattened patch
  const VX = 34, VZ = -28; for (let x = VX - 12; x <= VX + 12; x++) for (let z = VZ - 12; z <= VZ + 12; z++) { for (let y = 15; y < 40; y++) w.set(x, y, z, 0); for (let y = 10; y <= 15; y++) w.set(x, y, z, y === 15 ? 'grass' : 'dirt'); }
  for (let x = VX - 10; x <= VX + 10; x++) w.set(x, 15, VZ, 'gravel'); for (let z = VZ - 10; z <= VZ + 10; z++) w.set(VX, 15, z, 'gravel');
  const house = (x0, z0) => { for (let y = 16; y <= 18; y++) for (let x = x0; x <= x0 + 4; x++) for (let z = z0; z <= z0 + 4; z++) { const e = x === x0 || x === x0 + 4 || z === z0 || z === z0 + 4; if (!e) continue; const c = (x === x0 || x === x0 + 4) && (z === z0 || z === z0 + 4); w.set(x, y, z, y === 16 ? 'cobble' : c ? 'log' : y === 17 && (x === x0 + 2 || z === z0 + 2) ? 'glass' : 'planks'); }
    for (let x = x0 - 1; x <= x0 + 5; x++) for (let z = z0 - 1; z <= z0 + 5; z++) w.set(x, 19, z, 'planks'); for (let x = x0; x <= x0 + 4; x++) for (let z = z0; z <= z0 + 4; z++) w.set(x, 20, z, 'cobble'); };
  house(VX - 9, VZ - 9); house(VX + 4, VZ - 9); house(VX - 9, VZ + 4); house(VX + 4, VZ + 4); house(VX - 2, VZ + 5);
  const groups = []; const step = R / rings;
  for (let i = 0; i < rings; i++) { const a = i * step, b = i === rings - 1 ? 1e9 : (i + 1) * step;
    const g = new THREE.Group(); g.add(w.build((x, y, z) => { const d = Math.hypot(x + 0.5, z + 0.5); return d >= a && d < b; })); scene.add(g); groups.push(g); }
  const r = rng(91);
  for (let i = 0; i < 140; i++) { const x = Math.floor(-R + 5 + r() * (2 * R - 10)), z = Math.floor(-R + 5 + r() * (2 * R - 10)); const h = w.top(x, z); if (h <= 14 || w.get(x, h, z) !== B.grass || Math.abs(x - VX) < 13 && Math.abs(z - VZ) < 13) continue;
    const d = Math.hypot(x, z); groups[Math.min(rings - 1, Math.floor(d / step))].add(makeTree(x, h + 1, z, i * 3 + 1, 4 + Math.floor(r() * 3))); }
  const ghost = new THREE.MeshBasicMaterial({ map: atlas().tex, vertexColors: true, transparent: true, opacity: 0.3, depthWrite: false, color: 0xa8d0ff, fog: false, alphaTest: 0.1 });
  groups.forEach(g => g.traverse(o => { if (o.isMesh) o.userData.mat = o.material; }));
  // camera spots for the flyover: the biggest open water and the highest peak
  let ocean = [60, 60], best = 0, peak = [-70, -20], ph = 0;
  for (let z = -R + 12; z < R - 12; z += 6) for (let x = -R + 12; x < R - 12; x += 6) {
    let wn = 0; for (let dz = -8; dz <= 8; dz += 4) for (let dx = -8; dx <= 8; dx += 4) if (w.get(x + dx, 13, z + dz) === B.water) wn++;
    if (wn > best && Math.hypot(x, z) > 30) { best = wn; ocean = [x, z]; }
    const hh = w.top(x, z); if (hh > ph) { ph = hh; peak = [x, z]; } }
  return { w, groups, ghost, VX, VZ, ocean, peak, peakH: ph,
    /** mode: 'off' | 'ghost' | 'real'; grow(i) 0..1 per ring (scale from below) */
    set(mode, { opacity = 0.3, grow = () => 1 } = {}) {
      groups.forEach((g, i) => { const k = mode === 'real' ? grow(i) : 1; g.visible = mode !== 'off' && k > 0.001; g.scale.set(1, Math.max(0.001, k), 1);
        g.traverse(o => { if (o.isMesh) o.material = mode === 'ghost' ? ghost : o.userData.mat; }); });
      ghost.opacity = opacity;
    } };
}

export function buildSky() {
  const S = stage(); const { scene } = S;
  S.island = { grass: islandWorld('grass').build(), nether: islandWorld('nether').build(), end: islandWorld('end').build(), small: islandWorld('grass', 2, { farm: false, gen: false, hole: true }).build() };
  // the day-5 island: small, with the cobblestone generator right at the edge
  { const w = islandWorld('grass', 2, { farm: false, gen: false, hole: true }); w.set(3, 60, -1, 'water'); w.set(3, 60, 0, 'cobble'); w.set(3, 60, 1, 'lava'); for (let z = -1; z <= 1; z++) w.set(4, 60, z, 'cobble'); S.island.gen5 = w.build(); }
  for (const m of Object.values(S.island)) scene.add(m);
  const h = houseWorld(); S.house = h.walls; S.roof = h.roof; scene.add(S.house, S.roof);
  S.tree = makeTree(-4, 61, 4, 7, 7); scene.add(S.tree);
  S.far = farIsland(); scene.add(S.far);
  { const w = new VoxelWorld(-6, 61, -6, 13, 1, 13); const r = rng(5); for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) { if (Math.abs(x) <= 2 && Math.abs(z) <= 2) continue; if (x >= 2 && z <= -3) continue; if (Math.max(Math.abs(x), Math.abs(z)) === 4 && Math.abs(x) === Math.abs(z)) continue; if (GARDEN.some(([a, b]) => a === x && b === z)) continue; if (x === -4 && z === 4) continue;
    const v = r(); if (v < 0.75) w.set(x, 61, z, v < 0.35 ? 'tallgrass' : v < 0.55 ? 'flower_red' : 'flower_yellow'); } S.flowers = w.build(); scene.add(S.flowers); }
  S.gardenTrees = GARDEN.map(([x, z], i) => { const g = new THREE.Group(); g.position.set(x + 0.5, 61, z + 0.5); const tr = makeTree(x, 61, z, 31 + i * 7, 4 + (i % 3)); tr.position.set(-(x + 0.5), -61, -(z + 0.5)); g.add(tr); scene.add(g); return g; });
  S.thrownPick = makeItem('stonePickaxe'); scene.add(S.thrownPick);
  S.farSign = new Sign(["DON'T TRUST", 'THE FIRST', 'BLOCK.']); S.farSign.group.position.set(50.5, 61, 1.5); S.farSign.group.rotation.y = -Math.PI / 2; scene.add(S.farSign.group);
  S.greed = greedTowers(); scene.add(S.greed);
  S.below = belowWorld(scene);
  S.pool = blockPool(scene, 160);
  S.origin = new OriginBlock(scene);
  S.chest = new Chest([OX, 60, OZ], 0); scene.add(S.chest.group);
  // clouds below the island
  S.clouds = new THREE.Group(); const cm = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x9a9a9a, transparent: true, opacity: 0.75, depthWrite: false }); S.cloudMat = cm;
  { const r = rng(17); for (let i = 0; i < 55; i++) { const w = 10 + r() * 26, d = 8 + r() * 18; const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), cm); const a = r() * Math.PI * 2, rad = 20 + r() * 200; m.position.set(Math.cos(a) * rad, 22 + r() * 5, Math.sin(a) * rad); S.clouds.add(m); } }
  scene.add(S.clouds);
  // characters and mobs
  S.hero = new Stickman(); scene.add(S.hero.root);
  S.other = new Stickman({ variant: 'shadow' }); scene.add(S.other.root);
  S.stranger = new Stickman(); scene.add(S.stranger.root);
  S.heroSign = new HeldSign(scene);
  S.chickens = [0, 1].map(() => { const b = new Bird(0xf4f4f4); b.root.scale.setScalar(2.2); scene.add(b.root); return b; });
  S.tags = [nameTag('NUGGET'), nameTag('ALSO NUGGET')]; S.tags.forEach(t => scene.add(t));
  S.spider = new Spider(); scene.add(S.spider.root);
  S.ghast = new Ghast(); scene.add(S.ghast.root);
  S.fireball = new THREE.Group(); { const core = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), new THREE.MeshBasicMaterial({ color: 0xffb030 })); const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('rgba(255,140,40,0.95)'), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); glow.scale.setScalar(3.4); S.fireball.add(core, glow); S.fireball.userData.core = core; } scene.add(S.fireball);
  S.beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 80, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xd8ffd0, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); scene.add(S.beam);
  S.newBlock = new THREE.Mesh(blockGeometry('grass'), atlas().solid); S.newBlock.position.set(-70.5, 70.5, -95.5); scene.add(S.newBlock);
  S.heroLight = new THREE.PointLight(0xffc890, 0, 10, 1.4); scene.add(S.heroLight);
  S.ground = () => TOP;
  S.reset = () => {
    S.particles.clear(); S.glowParticles.clear(); S.pool.reset();
    for (const m of Object.values(S.island)) m.visible = false;
    S.house.visible = S.roof.visible = S.tree.visible = S.far.visible = S.farSign.group.visible = S.greed.visible = false;
    S.below.set('off'); S.chest.group.visible = false; S.clouds.visible = true; S.cloudMat.opacity = 0.75; S.cloudMat.color.set(0xffffff); S.cloudMat.emissive.set(0x9a9a9a);
    S.hero.root.visible = true; S.other.root.visible = false; S.stranger.root.visible = false; S.heroSign.sign.group.visible = false;
    S.chickens.forEach(c => (c.root.visible = false)); S.tags.forEach(t => (t.visible = false)); S.spider.root.visible = false; S.ghast.root.visible = false; S.fireball.visible = false; S.beam.visible = false;
    S.newBlock.visible = false; S.heroLight.intensity = 0; S.flowers.visible = false; S.flowers.scale.set(1, 1, 1); S.flowers.position.y = 0; S.gardenTrees.forEach(g => (g.visible = false)); S.thrownPick.visible = false; S.origin.apply({ visible: true });
  };
  /** standard furnishing for a phase of the island */
  S.furnish = (phase, t) => {
    if (phase === 'small') S.island.small.visible = true;
    if (phase === 'gen5') S.island.gen5.visible = true;
    if (phase === 'farm' || phase === 'house' || phase === 'garden') { S.island.grass.visible = true; S.tree.visible = true; }
    if (phase === 'house') { S.house.visible = true; S.roof.visible = true; }
    if (phase === 'garden') { S.flowers.visible = true; S.gardenTrees.forEach(g => { g.visible = true; g.scale.setScalar(1); }); }
    if (phase === 'nether') { S.island.nether.visible = true; S.house.visible = true; S.roof.visible = true; }
    if (phase === 'end') { S.island.end.visible = true; S.house.visible = true; S.roof.visible = true; S.tree.visible = true; }
    if (['farm', 'house', 'end', 'garden'].includes(phase)) S.placeChickens(t);
  };
  S.placeChickens = (t, spots = [[-2.2, -3.0], [-1.0, -3.6]]) => {
    S.chickens.forEach((c, i) => { const [x, z] = spots[i]; const w = Math.sin(t * 0.7 + i * 2) * 0.6; c.apply({ pos: [x + w, TOP + 0.25, z + Math.cos(t * 0.5 + i) * 0.3], yaw: Math.cos(t * 0.7 + i * 2) > 0 ? 1.2 : -1.9, flap: 0, visible: true });
      S.tags[i].visible = true; S.tags[i].position.set(x + w, TOP + 1.45, z + Math.cos(t * 0.5 + i) * 0.3); });
  };
  return S;
}
export { B, hash, clamp };
