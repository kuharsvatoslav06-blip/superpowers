// Stages: the persistent 3D sets (overworld, cave, void, fresh world). Scenes drive their state per frame.
import * as THREE from 'three';
import { VoxelWorld, genTerrain, makeTree, Sky, LightRig, LIGHT, blockMesh, crackMesh, B, BLOCKS, radialTex } from '../engine/EnvironmentManager.js';
import { Stickman } from '../engine/CharacterController.js';
import { Zombie, Enderman, Animal, Bird } from '../engine/Mobs.js';
import { ParticleField } from '../engine/Particles.js';
import { rng, hash3, clamp, smooth } from '../engine/AnimationSystem.js';
import { Torch, Sign, Chest, Door, Bed, Portal, Computer, ResetButton } from './props.js';

function baseStage(withSky = true) {
  const scene = new THREE.Scene(); const lights = new LightRig(scene); const sky = withSky ? new Sky(scene) : null;
  const particles = new ParticleField(3000); scene.add(particles.points);
  const glowParticles = new ParticleField(1500, { additive: true, glow: true }); scene.add(glowParticles.points);
  return { scene, lights, sky, particles, glowParticles };
}
const rectW = (x, z, x0, x1, z0, z1, m = 4) => { const dx = Math.max(x0 - x, 0, x - x1), dz = Math.max(z0 - z, 0, z - z1); return smooth(clamp(1 - Math.hypot(dx, dz) / m)); };

// =========================================================== OVERWORLD
export function buildOverworld() {
  const S = baseStage(); const { scene } = S;
  const w = new VoxelWorld(-64, 0, -64, 128, 48, 128); S.world = w;
  const flat = (x, z) => {
    const k = Math.max(smooth(clamp(1 - Math.hypot(x, z) / 14)), rectW(x, z, 1, 26, -4, 18), rectW(x, z, -24, 10, -4, 4), rectW(x, z, -9, 1, -15, -6));
    return k > 0 ? [20, k] : null;
  };
  genTerrain(w, { seed: 7, base: 20, amp: 5, scale: 0.045, flowers: 0.06, flat });
  // hill with the cave entrance (faces +x)
  for (let z = -22; z <= 22; z++) for (let x = -50; x <= -8; x++) {
    const d = Math.hypot((x + 30) * 0.9, z * 1.1); const add = Math.round(11 * smooth(clamp((17 - d) / 9)));
    if (add <= 0) continue; const top = w.top(x, z); const h = Math.max(top, 20 + add);
    for (let y = top; y <= h; y++) w.set(x, y, z, y === h ? 'grass' : y > h - 2 ? 'dirt' : 'stone');
    if (w.get(x, h + 1, z) && BLOCKS[w.get(x, h + 1, z)].cross) w.set(x, h + 1, z, 0);
  }
  // rocky cliff face around the mouth and the tunnel itself
  for (let z = -4; z <= 4; z++) for (let x = -19; x <= -16; x++) { const top = w.top(x, z); for (let y = 21; y <= top; y++) if ((hash3(x, y, z) < 0.7)) w.set(x, y, z, hash3(z, x, y) < 0.5 ? 'cobble' : 'stone'); }
  for (let x = -34; x <= -15; x++) for (let z = -1; z <= 1; z++) { for (let y = 21; y <= 23; y++) w.set(x, y, z, 0); w.set(x, 20, z, x > -18 ? 'gravel' : 'stone'); }
  for (let x = -16; x <= -14; x++) for (let z = -2; z <= 2; z++) for (let y = 21; y <= 26; y++) if (w.get(x, y, z) && (Math.abs(z) <= 1 && y <= 23)) w.set(x, y, z, 0);
  // pond
  for (let x = -7; x <= -1; x++) for (let z = -13; z <= -8; z++) { const edge = x === -7 || x === -1 || z === -13 || z === -8; w.set(x, 21, z, 0); if (edge) w.set(x, 20, z, 'sand'); else { w.set(x, 20, z, 'water'); w.set(x, 19, z, 'sand'); } }
  // house floor
  for (let x = 7; x <= 9; x++) for (let z = 5; z <= 7; z++) { w.set(x, 20, z, 'planks'); w.set(x, 21, z, 0); }
  for (let x = 5; x <= 11; x++) for (let z = 3; z <= 9; z++) if (w.get(x, 21, z) && BLOCKS[w.get(x, 21, z)].cross) w.set(x, 21, z, 0);
  // vanishing strip (S5): rendered as dynamic blocks so they can disappear
  const strip = []; for (let x = 0; x <= 7; x++) for (let z = -1; z <= 1; z++) for (let y = 19; y <= 20; y++) strip.push([x, y, z, BLOCKS[w.get(x, y, z)].name]);
  const inStrip = (x, y, z) => x >= 0 && x <= 7 && z >= -1 && z <= 1 && y <= 20;
  for (let x = 0; x <= 7; x++) for (let z = -1; z <= 1; z++) if (w.get(x, 21, z) && BLOCKS[w.get(x, 21, z)].cross) w.set(x, 21, z, 0);
  // the punched log (dynamic) under the punch tree
  S.punchLog = [3, 21, 2];
  S.terrain = w.build((x, y, z) => !inStrip(x, y, z) && !(x === 3 && y === 21 && z === 2)); scene.add(S.terrain);
  S.ground = (x, z) => w.top(Math.floor(x), Math.floor(z)) + 1;
  S.stripBlocks = strip.map(([x, y, z, name]) => { const m = blockMesh(name); m.position.set(x + 0.5, y + 0.5, z + 0.5); m.userData = { x, y, z }; scene.add(m); return m; });
  S.logBlock = blockMesh('log'); S.logBlock.position.set(3.5, 21.5, 2.5); scene.add(S.logBlock);
  S.crack = crackMesh(); S.crack.position.copy(S.logBlock.position); scene.add(S.crack);
  // trees
  S.trees = []; const r = rng(99);
  const special = [[3, 2, 6, 'punch'], [-11, 5, 5, 'g'], [-8, -4, 6, 'g'], [-4, 5, 5, 'g'], [-13, -5, 5, 'g'], [-6, 7, 6, 'g'], [12, -6, 5, ''], [-1, 9, 5, '']];
  for (const [x, z, h, tag] of special) {
    const y = tag === 'punch' ? 22 : S.ground(x, z);
    const tree = tag === 'punch' ? makeTreeNoBase(x, 21, z, h) : makeTree(x, y, z, x * 7 + z, h);
    if (tag === 'punch') S.punchTree = tree;
    tree.userData.tag = tag; tree.userData.base = [x + 0.5, y, z + 0.5]; scene.add(tree); S.trees.push(tree);
  }
  for (let i = 0; i < 150; i++) {
    const x = Math.floor(-58 + r() * 116), z = Math.floor(-58 + r() * 116);
    if (Math.hypot(x, z) < 9 || (x > 1 && x < 27 && z > -4 && z < 19) || (x > -25 && x < 11 && z > -5 && z < 5) || (x > -48 && x < -10 && z > -20 && z < 20) || (x > -10 && x < 2 && z > -16 && z < -5)) continue;
    if (S.trees.some(t => Math.hypot(t.userData.x - x, t.userData.z - z) < 4)) continue;
    const y = S.ground(x, z); const tree = makeTree(x, y, z, i + 3, 4 + Math.floor(r() * 3)); tree.userData.tag = ''; tree.userData.base = [x + 0.5, y, z + 0.5]; scene.add(tree); S.trees.push(tree);
  }
  // crafting table (placed in S1)
  S.table = blockMesh('table'); S.table.position.set(1.5, 21.5, 2.5); scene.add(S.table);
  // ---- the house
  const hb = houseBlocks(); S.houseBlocks = hb;
  const hw = new VoxelWorld(4, 20, 2, 9, 8, 9); for (const b of hb) hw.set(b.x, b.y, b.z, b.type);
  S.houseParts = {
    S: hw.build((x, y, z) => z === 4 && y < 24), N: hw.build((x, y, z) => z === 8 && y < 24), E: hw.build((x, y, z) => x === 10 && z > 4 && z < 8 && y < 24),
    W: hw.build((x, y, z) => x === 6 && z > 4 && z < 8 && y < 24), roof: hw.build((x, y, z) => y >= 24),
  };
  for (const p of Object.values(S.houseParts)) scene.add(p);
  S.houseDeleted = hw.build((x, y, z) => { const h = hash3(x * 1.3, y * 2.1, z * 0.7); if (z === 4 || x === 10) return y < 22 && h > 0.55; if (y >= 24) return h > 0.62 && x < 9; return h > 0.3; });
  scene.add(S.houseDeleted);
  S.houseGhost = []; { const gr = rng(5); for (let i = 0; i < 18; i++) { const m = blockMesh(gr() < 0.5 ? 'planks' : 'log'); m.userData.seed = gr(); m.userData.home = [5 + gr() * 7, 21 + gr() * 6, 3 + gr() * 6]; scene.add(m); S.houseGhost.push(m); } }
  S.buildMeshes = hb.map(b => { const m = blockMesh(b.type); m.position.set(b.x + 0.5, b.y + 0.5, b.z + 0.5); scene.add(m); return m; });
  S.door = new Door([8.5, 21, 4.5], 0); scene.add(S.door.group);
  S.shutter = new THREE.Group(); S.shutter.position.set(9.85, 22, 6); const sh = blockMesh('planks'); sh.scale.set(0.15, 1, 1); sh.position.set(0, 0.5, 0.5); S.shutter.add(sh); scene.add(S.shutter);
  S.bed = new Bed([8.0, 21, 7.5], 0); scene.add(S.bed.group);
  S.houseLight = new THREE.PointLight(0xffb060, 0, 9, 1.6); scene.add(S.houseLight);
  S.houseTorch = new Torch([8.5, 22.4, 7.75], { wall: [-0.35, 0], light: S.houseLight, intensity: 5, distance: 9 }); scene.add(S.houseTorch.group);
  S.handLight = new THREE.PointLight(0xffa040, 0, 10, 1.6); scene.add(S.handLight);
  // signs
  S.sign1 = new Sign(["DON'T GO", 'UNDERGROUND.']); S.sign1.group.position.set(8.5, 21, 2.6); scene.add(S.sign1.group);
  S.sign2 = new Sign(['YOU ARE NOT', 'THE FIRST.'], { post: false }); scene.add(S.sign2.group);
  // portal near the house
  S.portal = new Portal([14, 22, 12]); scene.add(S.portal.group); S.portalLight = new THREE.PointLight(0xb050ff, 0, 14, 1.4); S.portalLight.position.set(15, 23.5, 11.2); scene.add(S.portalLight);
  // characters
  S.hero = new Stickman(); scene.add(S.hero.root);
  S.shadowMan = new Stickman({ variant: 'shadow' }); scene.add(S.shadowMan.root);
  S.zombies = [0, 1, 2].map(() => { const z = new Zombie(); scene.add(z.root); return z; });
  S.animals = ['pig', 'cow', 'pig', 'sheep', 'pig'].map(k => { const a = new Animal(k); scene.add(a.root); return a; });
  S.floatWater = []; { const wr = rng(17); for (let i = 0; i < 16; i++) { const m = blockMesh('water'); m.userData = { x: -6 + Math.floor(wr() * 5) + 0.5, z: -12 + Math.floor(wr() * 4) + 0.5, s: wr() }; scene.add(m); S.floatWater.push(m); } }
  S.items = new THREE.Group(); scene.add(S.items); // dropped item cubes
  S.dropLog = blockMesh('log'); S.dropLog.scale.setScalar(0.25); scene.add(S.dropLog);
  S.reset = () => {
    for (const t of S.trees) { t.visible = true; t.scale.setScalar(1); t.position.set(0, 0, 0); }
    S.punchTree.userData.logs.visible = true;
    for (const m of S.stripBlocks) { m.visible = true; m.scale.setScalar(1); m.position.set(m.userData.x + 0.5, m.userData.y + 0.5, m.userData.z + 0.5); }
    S.logBlock.visible = true; S.crack.visible = false; S.table.visible = true; S.table.scale.setScalar(1);
    for (const p of Object.values(S.houseParts)) p.visible = true; S.houseDeleted.visible = false; for (const g of S.houseGhost) g.visible = false;
    for (const m of S.buildMeshes) m.visible = false;
    S.door.group.visible = true; S.door.update(0); S.shutter.visible = true; S.shutter.rotation.y = -1.5; S.bed.group.visible = true;
    S.houseTorch.update(0, 1); S.handLight.intensity = 0;
    S.sign1.group.visible = false; S.sign2.group.visible = false; S.portal.group.visible = false; S.portal.update(0, 0); S.portalLight.intensity = 0;
    S.hero.root.visible = true; S.shadowMan.root.visible = false; for (const z of S.zombies) z.root.visible = false; for (const a of S.animals) a.root.visible = false;
    for (const m of S.floatWater) m.visible = false; S.dropLog.visible = false;
    S.particles.clear(); S.glowParticles.clear(); S.terrain.visible = true; scene.background = null;
    if (S.terrain.children[0]) S.terrain.position.set(0, 0, 0);
  };
  S.light = (preset, t, extra) => S.lights.apply(preset, S.sky, S.cam, { time: t, ...extra });
  return S;
}
function makeTreeNoBase(x, y, z, h) { // punch tree: logs start one block above the dynamic base log; logs + leaves separate
  const logs = new VoxelWorld(x - 3, y, z - 3, 7, h + 4, 7), leaves = new VoxelWorld(x - 3, y, z - 3, 7, h + 4, 7); const r = rng(42);
  for (let i = 1; i < h; i++) logs.set(x, y + i, z, 'log');
  for (let yy = y + h - 3; yy <= y + h + 1; yy++) { const rad = yy >= y + h ? 1 : 2; for (let dz = -rad; dz <= rad; dz++) for (let dx = -rad; dx <= rad; dx++) { if (Math.abs(dx) === rad && Math.abs(dz) === rad && (yy > y + h - 2 || r() < 0.5)) continue; if (dx === 0 && dz === 0 && yy < y + h) continue; leaves.set(x + dx, yy, z + dz, 'leaves'); } }
  const g = new THREE.Group(); const lm = logs.build(), fm = leaves.build(); g.add(lm, fm); g.userData = { x, y, z, height: h, logs: lm, leaves: fm }; return g;
}
function houseBlocks() {
  const out = [];
  for (let y = 21; y <= 23; y++) for (let x = 6; x <= 10; x++) for (let z = 4; z <= 8; z++) {
    const edge = x === 6 || x === 10 || z === 4 || z === 8; if (!edge) continue;
    const corner = (x === 6 || x === 10) && (z === 4 || z === 8);
    if (x === 8 && z === 4 && y <= 22) continue; // doorway
    if (x === 10 && z === 6 && y === 22) { out.push({ x, y, z, type: 'glass' }); continue; }
    if (x === 6 && z === 6 && y === 22) { out.push({ x, y, z, type: 'glass' }); continue; }
    out.push({ x, y, z, type: corner ? 'log' : 'planks' });
  }
  for (let x = 5; x <= 11; x++) for (let z = 3; z <= 9; z++) out.push({ x, y: 24, z, type: (x === 5 || x === 11 || z === 3 || z === 9) ? 'log' : 'planks' });
  for (let x = 6; x <= 10; x++) for (let z = 4; z <= 8; z++) out.push({ x, y: 25, z, type: 'planks' });
  for (let x = 7; x <= 9; x++) for (let z = 5; z <= 7; z++) out.push({ x, y: 26, z, type: 'cobble' });
  return out;
}

// =========================================================== CAVE
export const caveZ = x => Math.round(1.2 * Math.sin(x * 0.09));
export function buildCave() {
  const S = baseStage(false); const { scene } = S; scene.background = new THREE.Color(0x000000);
  const w = new VoxelWorld(-80, 0, -12, 88, 16, 25); S.world = w; const r = rng(3);
  for (let y = 0; y < 16; y++) for (let z = -12; z <= 12; z++) for (let x = -80; x <= 7; x++) {
    const h = hash3(x, y, z); let b = y < 3 ? 'deep' : 'stone';
    if (h < 0.012) b = 'coal_ore'; else if (h < 0.018) b = 'iron_ore'; else if (h < 0.02 && y < 6) b = 'diamond_ore'; else if (h > 0.96) b = 'gravel'; else if (h > 0.93) b = 'cobble'; else if (h > 0.9 && y > 8) b = 'mossy';
    w.set(x, y, z, b);
  }
  for (let x = 6; x >= -56; x--) { const zc = caveZ(x); for (let z = zc - 1; z <= zc + 1; z++) for (let y = 5; y <= 8; y++) w.set(x, y, z, 0);
    if (r() < 0.5) w.set(x, 9, zc, 0); if (r() < 0.3) w.set(x, 8, zc + (r() < 0.5 ? 1 : -1), 'stone'); w.set(x, 4, zc, r() < 0.3 ? 'gravel' : 'stone'); }
  // iron ore the hero mines
  S.ironPos = [-13, 6, caveZ(-13) + 2]; w.set(...S.ironPos, 'stone');
  // the hidden passage and secret room
  S.passage = []; for (let x = -57; x >= -58; x--) for (let z = caveZ(-56) - 1; z <= caveZ(-56) + 1; z++) for (let y = 5; y <= 8; y++) S.passage.push([x, y, z]);
  for (let x = -59; x >= -63; x--) for (let z = -1; z <= 1; z++) for (let y = 5; y <= 7; y++) w.set(x, y, z, 0);
  for (let x = -76; x <= -63; x++) for (let z = -7; z <= 7; z++) for (let y = 4; y <= 11; y++) {
    const wall = x === -76 || x === -63 || z === -7 || z === 7 || y === 4 || y === 11;
    if (!wall) { w.set(x, y, z, 0); continue; }
    if (x === -63 && Math.abs(z) <= 1 && y >= 5 && y <= 7) { w.set(x, y, z, 0); continue; }
    w.set(x, y, z, y === 4 ? 'stonebrick' : (y >= 5 && y <= 7 && (z === -7 || z === 7) && (x % 3 !== 0)) ? 'bookshelf' : 'brick_dark');
  }
  w.set(-75, 10, -6, 'lantern'); w.set(-75, 10, 6, 'lantern'); w.set(-64, 10, -6, 'lantern'); w.set(-64, 10, 6, 'lantern');
  for (const [x, z] of [[-75, -6], [-75, 6], [-64, -6], [-64, 6]]) w.set(x, 9, z, 'cobweb');
  const inPassage = (x, y, z) => S.passage.some(p => p[0] === x && p[1] === y && p[2] === z);
  S.terrain = w.build((x, y, z) => !inPassage(x, y, z) && !(x === S.ironPos[0] && y === S.ironPos[1] && z === S.ironPos[2])); scene.add(S.terrain);
  S.ground = (x, z) => { for (let y = 12; y >= 1; y--) if (w.opaque(Math.floor(x), y, Math.floor(z)) && !w.opaque(Math.floor(x), y + 1, Math.floor(z))) return y + 1; return 5; };
  S.passageBlocks = S.passage.map(([x, y, z]) => { const m = blockMesh('stone'); m.position.set(x + 0.5, y + 0.5, z + 0.5); m.userData = { x, y, z }; scene.add(m); return m; });
  S.iron = blockMesh('iron_ore'); S.iron.position.set(S.ironPos[0] + 0.5, S.ironPos[1] + 0.5, S.ironPos[2] + 0.5); scene.add(S.iron);
  S.crack = crackMesh(); S.crack.position.copy(S.iron.position); scene.add(S.crack);
  // torches: 6 lit ones along the tunnel
  S.torches = [-4, -10, -18, -25, -32, -40].map((x, i) => {
    const side = i % 2 ? 1 : -1; const z = caveZ(x) + side * 1.42 + 0.5;
    const L = new THREE.PointLight(0xffa040, 0, 11, 1.5); scene.add(L);
    const tr = new Torch([x + 0.5, 6.9, z], { wall: [side * 0.35, 0], light: L, intensity: 7, distance: 11 }); scene.add(tr.group); return tr;
  });
  S.roomLights = [[-73, 9, 0], [-66, 9, 0]].map(p => { const L = new THREE.PointLight(0x7fd4ff, 0, 16, 1.2); L.position.set(...p); scene.add(L); return L; });
  S.heroLight = new THREE.PointLight(0xffa850, 0, 12, 1.4); scene.add(S.heroLight);
  S.eerie = new THREE.PointLight(0x9a6cff, 0, 9, 1.2); scene.add(S.eerie);
  S.chest = new Chest([-73.5, 5, 0.5], Math.PI / 2); scene.add(S.chest.group);
  S.hero = new Stickman(); scene.add(S.hero.root);
  S.shadowMan = new Stickman({ variant: 'shadow' }); scene.add(S.shadowMan.root);
  S.ender = new Enderman(); scene.add(S.ender.root);
  S.reset = () => {
    S.particles.clear(); S.glowParticles.clear(); S.iron.visible = true; S.crack.visible = false;
    for (const m of S.passageBlocks) { m.visible = true; m.scale.setScalar(1); m.position.set(m.userData.x + 0.5, m.userData.y + 0.5, m.userData.z + 0.5); m.rotation.set(0, 0, 0); }
    for (const t of S.torches) t.update(0, 1); for (const L of S.roomLights) L.intensity = 0; S.heroLight.intensity = 0; S.eerie.intensity = 0;
    S.chest.update(0, 0); S.shadowMan.root.visible = false; S.ender.root.visible = false; S.hero.root.visible = true;
  };
  S.light = (preset, t, extra) => S.lights.apply(preset, null, S.cam, { time: t, ...extra });
  return S;
}

// =========================================================== VOID
export function buildVoid() {
  const S = baseStage(); const { scene } = S;
  const w = new VoxelWorld(-8, 26, -4, 17, 6, 38); S.world = w;
  w.fill(-1, 29, -1, 1, 29, 1, 'obsidian');
  for (let x = -5; x <= 5; x++) for (let z = 21; z <= 31; z++) w.set(x, 29, z, (x === -5 || x === 5 || z === 21 || z === 31) ? 'metal' : 'void');
  for (let x = -4; x <= 4; x++) for (let z = 22; z <= 30; z++) if (Math.abs(x) + Math.abs(z - 26) < 4) w.set(x, 28, z, 'obsidian');
  w.set(0, 28, 26, 'glitch'); w.fill(-2, 27, 24, 2, 27, 28, 'obsidian');
  S.terrain = w.build(); scene.add(S.terrain);
  S.ground = (x, z) => { const xi = Math.floor(x), zi = Math.floor(z); for (let y = 31; y >= 26; y--) if (w.opaque(xi, y, zi)) return y + 1; return 30; };
  // stepping stones (dynamic so they can fall away)
  S.steps = []; for (let z = 2; z <= 20; z++) { const x = Math.round(Math.sin(z * 0.35) * 1.5); const m = blockMesh(z % 4 === 0 ? 'obsidian' : 'void'); m.userData = { x, z }; m.position.set(x + 0.5, 29.5, z + 0.5); scene.add(m); S.steps.push(m); }
  S.stepX = z => { const zi = Math.floor(z); if (zi < 2 || zi > 20) return 0.5; return Math.round(Math.sin(zi * 0.35) * 1.5) + 0.5; };
  S.portal = new Portal([-1, 30, -2]); scene.add(S.portal.group); S.portalLight = new THREE.PointLight(0xb050ff, 0, 12, 1.4); S.portalLight.position.set(0, 31.5, -1); scene.add(S.portalLight);
  S.computer = new Computer([0, 30, 29.5]); scene.add(S.computer.group);
  S.computer.light = new THREE.PointLight(0x55ff99, 20, 22, 1.2); S.computer.light.position.set(0, 34, 26.5); scene.add(S.computer.light);
  S.button = new ResetButton([3.5, 30, 24.5]); scene.add(S.button.group);
  S.buttonLight = new THREE.PointLight(0xff3030, 0, 5, 1.5); S.buttonLight.position.set(3.5, 31.8, 24.3); scene.add(S.buttonLight);
  // floating debris
  S.debris = []; const r = rng(31); const names = ['grass', 'stone', 'dirt', 'planks', 'obsidian', 'leaves', 'cobble'];
  for (let i = 0; i < 46; i++) { const m = blockMesh(names[Math.floor(r() * names.length)]); const d = 25 + r() * 70, a = r() * Math.PI * 2; m.userData = { home: [Math.cos(a) * d, 10 + r() * 45, 15 + Math.sin(a) * d], spin: r() * 0.6, s: 0.6 + r() * 2.2, ph: r() * 6 }; scene.add(m); S.debris.push(m); }
  S.hero = new Stickman(); scene.add(S.hero.root);
  S.heroLight = new THREE.PointLight(0xcfb8ff, 0, 8, 1.5); scene.add(S.heroLight);
  S.reset = () => { S.particles.clear(); S.glowParticles.clear(); for (const m of S.steps) { m.visible = true; m.position.set(m.userData.x + 0.5, 29.5, m.userData.z + 0.5); m.rotation.set(0, 0, 0); m.scale.setScalar(1); } S.hero.root.visible = true; };
  S.light = (preset, t, extra) => S.lights.apply(preset, S.sky, S.cam, { time: t, sun: false, ...extra });
  return S;
}

// =========================================================== FRESH WORLD (after the reset)
export function buildFresh() {
  const S = baseStage(); const { scene } = S;
  const w = new VoxelWorld(-48, 0, -48, 96, 40, 96); S.world = w;
  genTerrain(w, { seed: 21, base: 18, amp: 6, scale: 0.04, flowers: 0.14, flat: (x, z) => { const k = smooth(clamp(1 - Math.hypot(x, z) / 12)); return k > 0 ? [18, k] : null; } });
  S.terrain = w.build(); scene.add(S.terrain);
  S.ground = (x, z) => w.top(Math.floor(x), Math.floor(z)) + 1;
  const r = rng(12);
  for (let i = 0; i < 70; i++) { const x = Math.floor(-44 + r() * 88), z = Math.floor(-44 + r() * 88); if (Math.hypot(x, z) < 9) continue; const t = makeTree(x, S.ground(x, z), z, i * 5 + 1, 4 + Math.floor(r() * 3)); scene.add(t); }
  for (const [x, z] of [[6, -7], [-7, -5]]) scene.add(makeTree(x, S.ground(x, z), z, x * 11 + z, 5));
  S.hero = new Stickman(); scene.add(S.hero.root);
  S.ender = new Enderman(); scene.add(S.ender.root);
  S.birds = [0x3a6ad8, 0xd84a3a, 0xf0d040, 0x3a6ad8, 0xffffff].map(c => { const b = new Bird(c); scene.add(b.root); return b; });
  S.reset = () => { S.particles.clear(); S.glowParticles.clear(); S.ender.root.visible = false; S.hero.root.visible = true; };
  S.light = (preset, t, extra) => S.lights.apply(preset, S.sky, S.cam, { time: t, ...extra });
  return S;
}
export { LIGHT, B, radialTex };
