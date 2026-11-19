// EnvironmentManager: procedural block textures, voxel worlds (face-culled meshes with baked AO),
// terrain generation, sky dome (sun/moon/stars/clouds/crack) and lighting presets.
import * as THREE from 'three';
import { rng, fbm2, noise2, hash3, lerp, clamp, TAU } from './AnimationSystem.js';

// ---------------------------------------------------------------- texture atlas
const TILE = 16, COLS = 8;
export const T = {
  grass_top: 0, grass_side: 1, dirt: 2, stone: 3, cobble: 4, log_side: 5, log_top: 6, planks: 7,
  leaves: 8, sand: 9, water: 10, iron_ore: 11, coal_ore: 12, diamond_ore: 13, obsidian: 14, bedrock: 15,
  glass: 16, table_top: 17, table_side: 18, chest_side: 19, chest_top: 20, chest_front: 21, deep: 22, gravel: 23,
  bookshelf: 24, stonebrick: 25, wool_red: 26, portal: 27, void: 28, mossy: 29, door_low: 30, door_high: 31,
  crack0: 32, crack1: 33, crack2: 34, crack3: 35, crack4: 36, flower_red: 37, tallgrass: 38, flower_yellow: 39,
  metal: 40, cobweb: 41, sign: 42, bed_top: 43, glitch: 44, gold: 45, lantern: 46, stonebrick_dark: 47,
};

function hexRGB(h) { return [(h >> 16) & 255, (h >> 8) & 255, h & 255]; }
function paintTiles() {
  const cv = document.createElement('canvas'); cv.width = TILE * COLS; cv.height = TILE * COLS;
  const ctx = cv.getContext('2d'); const img = ctx.createImageData(cv.width, cv.height);
  const put = (tile, x, y, c, a = 255) => {
    if (x < 0 || y < 0 || x >= TILE || y >= TILE) return;
    const tx = (tile % COLS) * TILE + x, ty = Math.floor(tile / COLS) * TILE + y; const i = (ty * cv.width + tx) * 4;
    img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = a;
  };
  const shade = (c, k) => c.map(v => clamp(Math.round(v * k), 0, 255));
  const fill = (tile, base, vary, seed) => { const r = rng(seed); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) put(tile, x, y, shade(base, 1 - vary + r() * vary * 2)); };
  const speck = (tile, col, n, seed, size = 1) => { const r = rng(seed); for (let i = 0; i < n; i++) { const x = Math.floor(r() * 16), y = Math.floor(r() * 16); for (let a = 0; a < size; a++) for (let b = 0; b < size; b++) put(tile, x + a, y + b, shade(col, 0.85 + r() * 0.3)); } };
  const blobs = (tile, col, n, seed) => { const r = rng(seed); for (let i = 0; i < n; i++) { const cx = 2 + Math.floor(r() * 12), cy = 2 + Math.floor(r() * 12); const pts = [[0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [2, 1], [1, 2]]; for (const [a, b] of pts) if (r() < 0.8) put(tile, cx + a, cy + b, shade(col, 0.8 + r() * 0.4)); } };
  const GRASS = hexRGB(0x62a03f), DIRT = hexRGB(0x7a5434), STONE = hexRGB(0x7d7d7d);
  fill(T.grass_top, GRASS, 0.13, 11); speck(T.grass_top, hexRGB(0x4b8f2c), 40, 12); speck(T.grass_top, hexRGB(0x79c24c), 25, 13);
  fill(T.dirt, DIRT, 0.12, 21); speck(T.dirt, hexRGB(0x5c3d22), 30, 22); speck(T.dirt, hexRGB(0x94704a), 14, 23);
  fill(T.grass_side, DIRT, 0.12, 21); speck(T.grass_side, hexRGB(0x5c3d22), 30, 22);
  { const r = rng(31); for (let x = 0; x < 16; x++) { const d = 3 + Math.floor(r() * 3); for (let y = 0; y < d; y++) put(T.grass_side, x, y, shade(GRASS, 0.85 + r() * 0.3)); } }
  fill(T.stone, STONE, 0.07, 41); blobs(T.stone, hexRGB(0x6a6a6a), 7, 42); speck(T.stone, hexRGB(0x939393), 18, 43);
  // cobble: cells with dark mortar
  { const r = rng(51); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const cell = (Math.floor((x + (Math.floor(y / 4) % 2) * 2) / 4) + Math.floor(y / 4) * 7) % 5; const edge = x % 4 === 0 || y % 4 === 0; put(T.cobble, x, y, edge ? shade(STONE, 0.55 + r() * 0.1) : shade(STONE, 0.85 + cell * 0.06 + r() * 0.1)); } }
  { const r = rng(61); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const stripe = (x % 4 === 0) ? 0.7 : 1; put(T.log_side, x, y, shade(hexRGB(0x6b5030), stripe * (0.85 + r() * 0.25))); } }
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)); const ring = Math.floor(d) % 3 === 0 ? 0.8 : 1; put(T.log_top, x, y, d > 6.6 ? hexRGB(0x5a4128) : shade(hexRGB(0xb08d59), ring)); }
  { const r = rng(71); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const seam = y % 4 === 3; const nail = (y % 4 === 1) && (x === ((Math.floor(y / 4) % 2) ? 3 : 12)); put(T.planks, x, y, seam ? hexRGB(0x6e5230) : nail ? hexRGB(0x5b4326) : shade(hexRGB(0xa88452), 0.9 + r() * 0.18)); } }
  { const r = rng(81); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const v = r(); if (v < 0.12) put(T.leaves, x, y, [0, 0, 0], 0); else put(T.leaves, x, y, shade(hexRGB(0x3f8a2a), 0.65 + v * 0.55)); } }
  fill(T.sand, hexRGB(0xdccf98), 0.06, 91); speck(T.sand, hexRGB(0xc4b57d), 30, 92);
  { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const w = Math.sin((x + y * 0.5) * 0.8) * 0.5 + 0.5; put(T.water, x, y, shade(hexRGB(0x2f62d8), 0.85 + w * 0.25), 200); } }
  const ore = (tile, col, seed) => { fill(tile, STONE, 0.07, 41); blobs(tile, hexRGB(0x6a6a6a), 5, 42); const r = rng(seed); for (let i = 0; i < 5; i++) { const cx = 2 + Math.floor(r() * 11), cy = 2 + Math.floor(r() * 11); for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1]]) put(tile, cx + a, cy + b, shade(col, 0.8 + r() * 0.4)); put(tile, cx, cy, shade(col, 1.25)); } };
  ore(T.iron_ore, hexRGB(0xd8a77e), 101); ore(T.coal_ore, hexRGB(0x222222), 102); ore(T.diamond_ore, hexRGB(0x5ff3e6), 103);
  fill(T.gold, hexRGB(0xf5c542), 0.08, 104); speck(T.gold, hexRGB(0xfff08a), 20, 105);
  fill(T.obsidian, hexRGB(0x170f24), 0.25, 111); speck(T.obsidian, hexRGB(0x3b2a5c), 22, 112, 2);
  fill(T.bedrock, hexRGB(0x3a3a3a), 0.35, 121);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const frame = x === 0 || y === 0 || x === 15 || y === 15; const streak = (x - y === 4 && x > 8 && x < 13) || (x - y === -5 && x > 2 && x < 6); put(T.glass, x, y, hexRGB(0xd8eef5), frame ? 255 : 0); void streak; }
  { fill(T.table_top, hexRGB(0xa88452), 0.1, 131); for (let i = 0; i < 16; i++) { put(T.table_top, i, 0, hexRGB(0x6e5230)); put(T.table_top, i, 15, hexRGB(0x6e5230)); put(T.table_top, 0, i, hexRGB(0x6e5230)); put(T.table_top, 15, i, hexRGB(0x6e5230)); if (i > 2 && i < 13) { put(T.table_top, i, 5, hexRGB(0x5b4326)); put(T.table_top, i, 10, hexRGB(0x5b4326)); put(T.table_top, 5, i, hexRGB(0x5b4326)); put(T.table_top, 10, i, hexRGB(0x5b4326)); } } }
  { fill(T.table_side, hexRGB(0x8f6c40), 0.1, 141); for (let x = 0; x < 16; x++) { put(T.table_side, x, 0, hexRGB(0xa88452)); put(T.table_side, x, 1, hexRGB(0xa88452)); put(T.table_side, x, 2, hexRGB(0x6e5230)); }
    for (let i = 4; i < 13; i++) { put(T.table_side, 3, i, hexRGB(0x9a9a9a)); put(T.table_side, 4, i, hexRGB(0x707070)); } for (let i = 4; i < 8; i++) put(T.table_side, i, 4, hexRGB(0x9a9a9a)); for (let i = 9; i < 14; i++) { put(T.table_side, 11, i, hexRGB(0x6e5230)); } put(T.table_side, 10, 6, hexRGB(0xbbbbbb)); put(T.table_side, 11, 6, hexRGB(0xbbbbbb)); put(T.table_side, 12, 6, hexRGB(0xbbbbbb)); put(T.table_side, 11, 7, hexRGB(0x999999)); put(T.table_side, 11, 8, hexRGB(0x999999)); }
  const chest = (tile, latch) => { fill(tile, hexRGB(0xa0702f), 0.1, 151); for (let i = 0; i < 16; i++) { put(tile, i, 0, hexRGB(0x4a3216)); put(tile, i, 15, hexRGB(0x4a3216)); put(tile, 0, i, hexRGB(0x4a3216)); put(tile, 15, i, hexRGB(0x4a3216)); put(tile, i, 5, hexRGB(0x4a3216)); } if (latch) for (let a = 6; a < 10; a++) for (let b = 3; b < 8; b++) put(tile, a, b, b === 3 || b === 7 || a === 6 || a === 9 ? hexRGB(0x555555) : hexRGB(0xd0d0d0)); };
  chest(T.chest_side, false); chest(T.chest_front, true); fill(T.chest_top, hexRGB(0xa0702f), 0.1, 161); for (let i = 0; i < 16; i++) { put(T.chest_top, i, 0, hexRGB(0x4a3216)); put(T.chest_top, i, 15, hexRGB(0x4a3216)); put(T.chest_top, 0, i, hexRGB(0x4a3216)); put(T.chest_top, 15, i, hexRGB(0x4a3216)); }
  fill(T.deep, hexRGB(0x45454e), 0.1, 171); blobs(T.deep, hexRGB(0x34343c), 8, 172);
  fill(T.gravel, hexRGB(0x857b77), 0.2, 181); speck(T.gravel, hexRGB(0x5b5352), 40, 182);
  { const r = rng(191); const cols = [0x9c2a2a, 0x2a4f9c, 0x2a8a3a, 0x8a6a2a, 0x6a2a8a, 0x2a7a8a];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const shelf = y < 2 || y > 13 || y === 7 || y === 8; put(T.bookshelf, x, y, shelf ? shade(hexRGB(0xa88452), 0.9 + r() * 0.1) : hexRGB(0x2a1d10)); }
    for (const row of [2, 9]) { let x = 1; while (x < 15) { const w = 1 + Math.floor(r() * 2), h = 4 + Math.floor(r() * 2); const c = hexRGB(cols[Math.floor(r() * cols.length)]); for (let a = 0; a < w; a++) for (let b = 0; b < h; b++) put(T.bookshelf, x + a, row + 5 - b - (5 - h) , shade(c, b === 0 ? 0.8 : 1)); x += w + (r() < 0.3 ? 1 : 0); } } }
  const bricks = (tile, base, seed) => { const r = rng(seed); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const off = (Math.floor(y / 8) % 2) * 8; const m = y % 8 === 7 || (x + off) % 16 === 15; put(tile, x, y, m ? shade(base, 0.6) : shade(base, 0.9 + r() * 0.15)); } };
  bricks(T.stonebrick, STONE, 201); bricks(T.stonebrick_dark, hexRGB(0x3c3a46), 202);
  fill(T.wool_red, hexRGB(0xb3312c), 0.08, 211);
  { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const v = Math.sin(x * 0.9 + Math.sin(y * 0.7) * 2) * 0.5 + 0.5; put(T.portal, x, y, shade(hexRGB(0x8a2be2), 0.7 + v * 0.6), 210); } }
  { const r = rng(221); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) put(T.void, x, y, (x % 8 === 0 || y % 8 === 0) ? hexRGB(0x3b1d63) : shade(hexRGB(0x120822), 0.8 + r() * 0.4)); }
  fill(T.mossy, STONE, 0.07, 41); speck(T.mossy, hexRGB(0x4f7a32), 50, 231, 2);
  { const r = rng(241); for (const tile of [T.door_low, T.door_high]) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const fr = x < 2 || x > 13 || (tile === T.door_low ? y > 13 : y < 2) || y === 7 || y === 8; let c = fr ? hexRGB(0x6e5230) : shade(hexRGB(0x9c7a4a), 0.9 + r() * 0.15); if (tile === T.door_high && y > 2 && y < 7 && x > 3 && x < 12) c = hexRGB(0x2a1d10); put(tile, x, y, c); if (tile === T.door_low && x === 12 && (y === 3 || y === 4)) put(tile, x, y, hexRGB(0x333333)); } }
  for (let s = 0; s < 5; s++) { const r = rng(300 + s); const n = 6 + s * 12; for (let i = 0; i < n; i++) { let x = 8, y = 8; const len = 2 + s; const ang = r() * TAU; for (let k = 0; k < len + r() * 4; k++) { x += Math.cos(ang + (r() - 0.5)) * 1.2; y += Math.sin(ang + (r() - 0.5)) * 1.2; put(T.crack0 + s, Math.round(x), Math.round(y), [20, 20, 20], 230); } } }
  const cross = (tile, stem, head) => { for (let y = 6; y < 16; y++) put(tile, 7, y, hexRGB(stem)); put(tile, 6, 10, hexRGB(stem)); put(tile, 8, 12, hexRGB(stem)); if (head) for (const [a, b] of [[7, 3], [6, 4], [8, 4], [7, 5], [7, 4], [6, 3], [8, 5]]) put(tile, a, b, hexRGB(head)); put(tile, 7, 4, hexRGB(0xffe066)); };
  cross(T.flower_red, 0x3e7d22, 0xd8322a); cross(T.flower_yellow, 0x3e7d22, 0xf5d020);
  { const r = rng(251); for (let x = 0; x < 16; x++) { const h = 5 + Math.floor(r() * 10); if (r() < 0.6) for (let y = 16 - h; y < 16; y++) put(T.tallgrass, x, y, shade(GRASS, 0.75 + r() * 0.3)); } }
  fill(T.metal, hexRGB(0x5b5f66), 0.05, 261); for (let i = 0; i < 16; i++) { put(T.metal, i, 0, hexRGB(0x3a3d42)); put(T.metal, 0, i, hexRGB(0x3a3d42)); } put(T.metal, 3, 3, hexRGB(0x9aa0a8)); put(T.metal, 12, 12, hexRGB(0x9aa0a8)); put(T.metal, 12, 3, hexRGB(0x9aa0a8)); put(T.metal, 3, 12, hexRGB(0x9aa0a8));
  for (let i = 0; i < 16; i++) { put(T.cobweb, i, i, [230, 230, 230], 200); put(T.cobweb, 15 - i, i, [230, 230, 230], 200); put(T.cobweb, 7, i, [230, 230, 230], 160); put(T.cobweb, i, 8, [230, 230, 230], 160); }
  fill(T.sign, hexRGB(0xb8925a), 0.06, 271);
  { fill(T.bed_top, hexRGB(0xb3312c), 0.06, 281); for (let y = 0; y < 6; y++) for (let x = 1; x < 15; x++) put(T.bed_top, x, y, hexRGB(0xf0f0f0)); }
  { const r = rng(291); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) put(T.glitch, x, y, r() < 0.5 ? hexRGB(0xff00ff) : hexRGB(0x111111)); }
  { fill(T.lantern, hexRGB(0x2c2c34), 0.1, 301); for (let y = 4; y < 13; y++) for (let x = 4; x < 12; x++) put(T.lantern, x, y, shade(hexRGB(0x7fd4ff), 0.8 + (y % 3) * 0.1)); }
  ctx.putImageData(img, 0, 0);
  return cv;
}

let ATLAS = null;
export function atlas() {
  if (ATLAS) return ATLAS;
  const canvas = paintTiles();
  const tex = new THREE.CanvasTexture(canvas); tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestMipmapNearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace; tex.generateMipmaps = true;
  const solid = new THREE.MeshLambertMaterial({ map: tex, vertexColors: true, alphaTest: 0.5, side: THREE.FrontSide });
  const cutoutDouble = new THREE.MeshLambertMaterial({ map: tex, vertexColors: true, alphaTest: 0.5, side: THREE.DoubleSide });
  const water = new THREE.MeshLambertMaterial({ map: tex, vertexColors: true, transparent: true, opacity: 0.78, depthWrite: false, side: THREE.DoubleSide });
  const glow = new THREE.MeshBasicMaterial({ map: tex, vertexColors: true, alphaTest: 0.5 });
  ATLAS = { canvas, tex, solid, cutoutDouble, water, glow };
  return ATLAS;
}
export function tileUV(tile) { const u = (tile % COLS) / COLS, v = 1 - (Math.floor(tile / COLS) + 1) / COLS; const e = 0.0005; return [u + e, v + e, u + 1 / COLS - e, v + 1 / COLS - e]; }

// ---------------------------------------------------------------- block registry
// faces: [top, bottom, side] tiles (or 6 explicit: +x,-x,+y,-y,+z,-z)
export const B = {};
const defs = [
  ['grass', [T.grass_top, T.dirt, T.grass_side]], ['dirt', [T.dirt]], ['stone', [T.stone]], ['cobble', [T.cobble]],
  ['log', [T.log_top, T.log_top, T.log_side]], ['planks', [T.planks]], ['leaves', [T.leaves], { cutout: true, leafy: true }],
  ['sand', [T.sand]], ['water', [T.water], { water: true }], ['iron_ore', [T.iron_ore]], ['coal_ore', [T.coal_ore]],
  ['diamond_ore', [T.diamond_ore]], ['obsidian', [T.obsidian]], ['bedrock', [T.bedrock]], ['glass', [T.glass], { cutout: true }],
  ['table', [T.table_top, T.planks, T.table_side]], ['chest', [T.chest_top, T.chest_top, T.chest_side]], ['deep', [T.deep]],
  ['gravel', [T.gravel]], ['bookshelf', [T.planks, T.planks, T.bookshelf]], ['stonebrick', [T.stonebrick]], ['wool_red', [T.wool_red]],
  ['portal', [T.portal], { glow: true }], ['void', [T.void]], ['mossy', [T.mossy]], ['metal', [T.metal]], ['gold', [T.gold]],
  ['flower_red', [T.flower_red], { cross: true }], ['flower_yellow', [T.flower_yellow], { cross: true }], ['tallgrass', [T.tallgrass], { cross: true }],
  ['cobweb', [T.cobweb], { cross: true }], ['brick_dark', [T.stonebrick_dark]], ['lantern', [T.lantern], { glow: true }], ['glitch', [T.glitch], { glow: true }],
];
export const BLOCKS = [null];
for (const [name, f, opt = {}] of defs) {
  const id = BLOCKS.length; B[name] = id;
  const faces = f.length === 1 ? [f[0], f[0], f[0], f[0], f[0], f[0]] : f.length === 3 ? [f[2], f[2], f[0], f[1], f[2], f[2]] : f;
  BLOCKS.push({ id, name, faces, opaque: !opt.cutout && !opt.water && !opt.cross, ...opt });
}

// ---------------------------------------------------------------- voxel world + mesher
const FACES = [ // dir, corners (unit cube), uv order
  { n: [1, 0, 0], c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] },
  { n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] },
  { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] },
];
const AO_CURVE = [0.42, 0.62, 0.82, 1.0];

export class VoxelWorld {
  constructor(x0, y0, z0, sx, sy, sz) { Object.assign(this, { x0, y0, z0, sx, sy, sz }); this.data = new Uint8Array(sx * sy * sz); this.tint = new Map(); }
  idx(x, y, z) { x -= this.x0; y -= this.y0; z -= this.z0; if (x < 0 || y < 0 || z < 0 || x >= this.sx || y >= this.sy || z >= this.sz) return -1; return (y * this.sz + z) * this.sx + x; }
  get(x, y, z) { const i = this.idx(x, y, z); return i < 0 ? 0 : this.data[i]; }
  set(x, y, z, b) { const i = this.idx(x, y, z); if (i >= 0) this.data[i] = typeof b === 'string' ? B[b] : b; }
  fill(x0, y0, z0, x1, y1, z1, b) { for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) this.set(x, y, z, b); }
  opaque(x, y, z) { const b = this.get(x, y, z); return b && BLOCKS[b].opaque; }
  top(x, z) { for (let y = this.y0 + this.sy - 1; y >= this.y0; y--) { const b = this.get(x, y, z); if (b && (BLOCKS[b].opaque || BLOCKS[b].water)) return y; } return this.y0 - 1; }
  /** Build THREE meshes (solid+cutout, water, glow). Optional filter(x,y,z,b) -> keep. */
  build(filter) {
    const buckets = { solid: newBucket(), water: newBucket(), glow: newBucket(), cross: newBucket() };
    for (let y = this.y0; y < this.y0 + this.sy; y++) for (let z = this.z0; z < this.z0 + this.sz; z++) for (let x = this.x0; x < this.x0 + this.sx; x++) {
      const b = this.get(x, y, z); if (!b) continue; if (filter && !filter(x, y, z, b)) continue;
      const def = BLOCKS[b];
      if (def.cross) { emitCross(buckets.cross, x, y, z, def.faces[0], hash3(x, y, z)); continue; }
      const bucket = def.water ? buckets.water : def.glow ? buckets.glow : buckets.solid;
      for (let f = 0; f < 6; f++) {
        const F = FACES[f]; const nx = x + F.n[0], ny = y + F.n[1], nz = z + F.n[2];
        const nb = this.get(nx, ny, nz);
        if (nb) { const nd = BLOCKS[nb]; if (nd.opaque) continue; if (nb === b && (def.water || def.leafy || def.cutout)) continue; if (def.water && nd.water) continue; }
        if (def.water && f !== 2 && nb && BLOCKS[nb].opaque) continue;
        const ao = F.c.map(c => this._ao(x, y, z, F.n, c));
        emitQuad(bucket, x, y, z, F, def.faces[f], ao, def.water && f === 2 ? -0.12 : 0);
      }
    }
    const A = atlas(); const g = new THREE.Group();
    const mk = (bk, mat) => { if (!bk.pos.length) return; const geo = toGeo(bk); const m = new THREE.Mesh(geo, mat); g.add(m); return m; };
    mk(buckets.solid, A.solid); mk(buckets.cross, A.solid); this.waterMesh = mk(buckets.water, A.water); mk(buckets.glow, A.glow);
    return g;
  }
  _ao(x, y, z, n, c) {
    // the 3 neighbours around the vertex, on the face's outer layer
    const ax = [0, 1, 2].filter(i => n[i] === 0); const o = [x + Math.max(0, n[0]), y + Math.max(0, n[1]), z + Math.max(0, n[2])];
    void o;
    const base = [x + n[0], y + n[1], z + n[2]];
    const d1 = [0, 0, 0], d2 = [0, 0, 0]; d1[ax[0]] = c[ax[0]] ? 1 : -1; d2[ax[1]] = c[ax[1]] ? 1 : -1;
    const s1 = this.opaque(base[0] + d1[0], base[1] + d1[1], base[2] + d1[2]) ? 1 : 0;
    const s2 = this.opaque(base[0] + d2[0], base[1] + d2[1], base[2] + d2[2]) ? 1 : 0;
    const cc = this.opaque(base[0] + d1[0] + d2[0], base[1] + d1[1] + d2[1], base[2] + d1[2] + d2[2]) ? 1 : 0;
    return AO_CURVE[s1 && s2 ? 0 : 3 - (s1 + s2 + cc)];
  }
}
function newBucket() { return { pos: [], uv: [], col: [], nor: [], idx: [], n: 0 }; }
function emitQuad(bk, x, y, z, F, tile, ao, yOff = 0) {
  const [u0, v0, u1, v1] = tileUV(tile); const uvs = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
  const side = F.n[1] === 0 ? (F.n[0] !== 0 ? 0.86 : 0.93) : F.n[1] > 0 ? 1 : 0.7; // subtle baked face shading
  for (let i = 0; i < 4; i++) {
    const c = F.c[i]; bk.pos.push(x + c[0], y + c[1] + (c[1] === 1 ? yOff : 0), z + c[2]); bk.uv.push(...uvs[i]);
    const a = ao[i] * side; bk.col.push(a, a, a); bk.nor.push(...F.n);
  }
  const s = bk.n; if (ao[0] + ao[2] < ao[1] + ao[3]) bk.idx.push(s + 1, s + 2, s + 3, s + 1, s + 3, s); else bk.idx.push(s, s + 1, s + 2, s, s + 2, s + 3);
  bk.n += 4;
}
function emitCross(bk, x, y, z, tile, h) {
  const [u0, v0, u1, v1] = tileUV(tile); const ox = (h - 0.5) * 0.3, oz = (hash3(z, y, x) - 0.5) * 0.3;
  for (const [a, b] of [[[0.15, 0.15], [0.85, 0.85]], [[0.85, 0.15], [0.15, 0.85]]]) {
    const s = bk.n;
    const P = [[a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], 1, b[1]], [a[0], 1, a[1]]];
    const uv = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
    for (let i = 0; i < 4; i++) { bk.pos.push(x + P[i][0] + ox, y + P[i][1], z + P[i][2] + oz); bk.uv.push(...uv[i]); const c = 0.85 + P[i][1] * 0.15; bk.col.push(c, c, c); bk.nor.push(0, 1, 0); }
    bk.idx.push(s, s + 1, s + 2, s, s + 2, s + 3, s, s + 2, s + 1, s, s + 3, s + 2); bk.n += 4;
  }
}
function toGeo(bk) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(bk.pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(bk.uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(bk.col, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(bk.nor, 3));
  g.setIndex(bk.idx); g.computeBoundingSphere(); return g;
}

/** Single textured cube for dynamic blocks (falling, vanishing, being mined). Cached per block type. */
const CUBE_GEO = new Map();
export function blockGeometry(name) {
  if (CUBE_GEO.has(name)) return CUBE_GEO.get(name);
  const def = BLOCKS[B[name]]; const bk = newBucket();
  for (let f = 0; f < 6; f++) emitQuad(bk, -0.5, -0.5, -0.5, FACES[f], def.faces[f], [1, 1, 1, 1]);
  const g = toGeo(bk); CUBE_GEO.set(name, g); return g;
}
export function blockMesh(name, mat) {
  const A = atlas(); const def = BLOCKS[B[name]];
  return new THREE.Mesh(blockGeometry(name), mat || (def.glow ? A.glow : def.water ? A.water : A.solid));
}
/** Crack overlay cube (stage 0..4) */
const crackMats = [];
export function crackMesh() {
  const A = atlas(); const m = new THREE.Mesh(new THREE.BoxGeometry(1.01, 1.01, 1.01), new THREE.MeshBasicMaterial({ map: A.tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
  m.userData.setStage = (s) => {
    s = clamp(Math.floor(s), 0, 4); if (m.userData.stage === s) return; m.userData.stage = s;
    const [u0, v0, u1, v1] = tileUV(T.crack0 + s); const uv = m.geometry.attributes.uv;
    for (let i = 0; i < uv.count; i += 4) { uv.setXY(i, u0, v1); uv.setXY(i + 1, u1, v1); uv.setXY(i + 2, u0, v0); uv.setXY(i + 3, u1, v0); }
    uv.needsUpdate = true;
  };
  m.userData.setStage(0); void crackMats; return m;
}

// ---------------------------------------------------------------- terrain
export function genTerrain(world, { seed = 1, base = 20, amp = 5, scale = 0.035, trees = [], flowers = 0.04, sea = -999, flat = null } = {}) {
  const r = rng(seed); const so = seed * 13.7;
  for (let z = world.z0; z < world.z0 + world.sz; z++) for (let x = world.x0; x < world.x0 + world.sx; x++) {
    let h = Math.round(base + fbm2(x * scale + so, z * scale - so, 4) * amp);
    if (flat) { const k = flat(x, z); if (k !== null) h = Math.round(lerp(h, k[0], k[1])); }
    for (let y = world.y0; y <= h; y++) world.set(x, y, z, y === h ? (h <= sea + 1 ? 'sand' : 'grass') : y > h - 3 ? 'dirt' : 'stone');
    for (let y = h + 1; y <= sea; y++) world.set(x, y, z, 'water');
    if (h > sea + 1 && r() < flowers) world.set(x, h + 1, z, r() < 0.6 ? 'tallgrass' : r() < 0.5 ? 'flower_red' : 'flower_yellow');
  }
  void trees; void noise2;
}
/** A tree as its own small world (so it can be deleted / glitched individually). */
export function makeTree(x, y, z, seed = 1, height = 5) {
  const w = new VoxelWorld(x - 3, y, z - 3, 7, height + 4, 7); const r = rng(seed);
  for (let i = 0; i < height; i++) w.set(x, y + i, z, 'log');
  for (let yy = y + height - 3; yy <= y + height + 1; yy++) {
    const rad = yy >= y + height ? 1 : 2;
    for (let dz = -rad; dz <= rad; dz++) for (let dx = -rad; dx <= rad; dx++) {
      if (Math.abs(dx) === rad && Math.abs(dz) === rad && (yy > y + height - 2 || r() < 0.5)) continue;
      if (dx === 0 && dz === 0 && yy < y + height) continue;
      w.set(x + dx, yy, z + dz, 'leaves');
    }
  }
  const mesh = w.build(); mesh.userData = { x, y, z, height }; return mesh;
}

// ---------------------------------------------------------------- sky
const skyVS = `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }`;
const skyFS = `uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sunDir; uniform vec3 sunGlow; uniform float glowAmt;
varying vec3 vDir;
void main(){ vec3 d = normalize(vDir); float h = d.y;
  vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h,0.0,1.0), 0.55)) : mix(horizon, bottom, pow(clamp(-h*3.0,0.0,1.0),0.7));
  float g = max(dot(d, normalize(sunDir)), 0.0); c += sunGlow * (pow(g, 8.0) * 0.5 + pow(g, 64.0)) * glowAmt;
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;
function pixelSquare(color, size, ring) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 32; const x = cv.getContext('2d');
  x.fillStyle = ring; x.fillRect(4, 4, 24, 24); x.fillStyle = color; x.fillRect(7, 7, 18, 18);
  if (size === 'moon') { x.fillStyle = 'rgba(120,130,160,0.7)'; x.fillRect(10, 10, 5, 4); x.fillRect(18, 16, 4, 5); x.fillRect(12, 19, 3, 3); }
  const t = new THREE.CanvasTexture(cv); t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t;
}
export class Sky {
  constructor(scene) {
    this.group = new THREE.Group(); scene.add(this.group);
    this.uniforms = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunGlow: { value: new THREE.Color(0xffd27a) }, glowAmt: { value: 1 } };
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(450, 32, 16), new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: skyVS, fragmentShader: skyFS, side: THREE.BackSide, depthWrite: false, fog: false }));
    this.dome.renderOrder = -10; this.group.add(this.dome);
    const mkBody = (tex, s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false, depthWrite: false })); m.renderOrder = -9; this.group.add(m); return m; };
    this.sun = mkBody(pixelSquare('#fff6c8', 'sun', '#ffd75a'), 38);
    this.sunHalo = mkBody(radialTex('rgba(255,220,120,0.55)'), 150); this.sunHalo.material.blending = THREE.AdditiveBlending;
    this.moon = mkBody(pixelSquare('#e8ecff', 'moon', '#aeb6d6'), 26);
    this.moonHalo = mkBody(radialTex('rgba(150,170,255,0.35)'), 90); this.moonHalo.material.blending = THREE.AdditiveBlending;
    // stars
    const r = rng(77); const pos = [];
    for (let i = 0; i < 1400; i++) { const u = r() * 2 - 1, th = r() * TAU, s = Math.sqrt(1 - u * u); if (u < -0.05) continue; pos.push(Math.cos(th) * s * 420, u * 420, Math.sin(th) * s * 420); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, fog: false, depthWrite: false }));
    this.stars.renderOrder = -9; this.group.add(this.stars);
    // clouds: flat blocky slabs
    this.clouds = new THREE.Group(); const cr = rng(5); const cm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: false, depthWrite: false });
    for (let i = 0; i < 40; i++) { const cx = (cr() - 0.5) * 600, cz = (cr() - 0.5) * 600; for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(12 + cr() * 24, 3, 8 + cr() * 16), cm); b.position.set(cx + (cr() - 0.5) * 22, 0, cz + (cr() - 0.5) * 14); this.clouds.add(b); } }
    this.clouds.position.y = 95; this.clouds.renderOrder = -8; this.cloudMat = cm; this.group.add(this.clouds);
    // the crack in the sky
    this.crackCanvas = document.createElement('canvas'); this.crackCanvas.width = 1024; this.crackCanvas.height = 512;
    this.crackTex = new THREE.CanvasTexture(this.crackCanvas); this.crackTex.colorSpace = THREE.SRGBColorSpace;
    this.crack = new THREE.Mesh(new THREE.PlaneGeometry(520, 260), new THREE.MeshBasicMaterial({ map: this.crackTex, transparent: true, fog: false, depthWrite: false }));
    this.crack.renderOrder = -7; this.crack.visible = false; this.group.add(this.crack); this.crackKey = -1;
  }
  /** s: {top,horizon,bottom,sunAngle,moon,stars,clouds,glow,time, crack:{amount, dir}} */
  update(s, cam) {
    this.group.position.copy(cam.position);
    this.uniforms.top.value.set(s.top); this.uniforms.horizon.value.set(s.horizon); this.uniforms.bottom.value.set(s.bottom ?? s.horizon);
    const a = s.sunAngle ?? 0.9; const sd = new THREE.Vector3(Math.cos(a) * 0.8, Math.sin(a), 0.35).normalize(); this.uniforms.sunDir.value.copy(sd);
    this.uniforms.glowAmt.value = s.glow ?? (sd.y > -0.1 ? 1 : 0);
    const place = (m, dir, dist) => { m.position.copy(dir).multiplyScalar(dist); m.lookAt(0, 0, 0); };
    place(this.sun, sd, 380); place(this.sunHalo, sd, 385); this.sun.visible = this.sunHalo.visible = s.sun !== false && sd.y > -0.15;
    if (s.sun === false) this.uniforms.glowAmt.value = s.glow ?? 0;
    const md = sd.clone().negate(); if (s.moonDir) md.set(...s.moonDir).normalize();
    place(this.moon, md, 380); place(this.moonHalo, md, 385); this.moon.visible = this.moonHalo.visible = (s.moon ?? 0) > 0.01;
    this.moon.material.opacity = this.moonHalo.material.opacity = s.moon ?? 0;
    this.stars.material.opacity = s.stars ?? 0; this.stars.visible = (s.stars ?? 0) > 0.01; this.stars.rotation.y = (s.time || 0) * 0.002;
    this.clouds.visible = (s.clouds ?? 1) > 0.01; this.cloudMat.opacity = 0.85 * (s.clouds ?? 1); this.cloudMat.color.set(s.cloudColor ?? 0xffffff);
    this.clouds.position.x = ((s.time || 0) * (s.cloudSpeed ?? 1.2)) % 600 - 0; this.clouds.position.y = 95;
    const ca = s.crack?.amount || 0; this.crack.visible = ca > 0.001;
    if (this.crack.visible) { const d = new THREE.Vector3(...(s.crack.dir || [0, 0.55, -1])).normalize(); place(this.crack, d, 360); this.drawCrack(ca, s.crack.flicker || 0); }
  }
  drawCrack(amount, flicker) {
    const key = Math.round(amount * 200) + Math.round(flicker * 10) * 1000; if (key === this.crackKey) return; this.crackKey = key;
    const x = this.crackCanvas.getContext('2d'); const W = 1024, H = 512; x.clearRect(0, 0, W, H);
    const r = rng(1234); const pts = [[W * 0.5, 40]]; let px = W * 0.5, py = 40; const branches = [];
    while (py < H - 30) { px += (r() - 0.5) * 140; py += 20 + r() * 40; pts.push([px, py]); if (r() < 0.35) branches.push([px, py, r() < 0.5 ? -1 : 1]); }
    const total = pts.length; const n = Math.max(2, Math.floor(total * amount));
    const path = (list, w, col, blur) => { x.save(); x.strokeStyle = col; x.lineWidth = w; x.shadowColor = '#ff4dff'; x.shadowBlur = blur; x.lineJoin = 'miter'; x.beginPath(); list.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke(); x.restore(); };
    const main = pts.slice(0, n);
    path(main, 34 * amount + 8, 'rgba(255,90,255,0.55)', 60); path(main, 16 * amount + 4, '#ffffff', 30); path(main, 6 * amount + 2, '#000000', 0);
    for (const [bx, by, s] of branches) { if (by > main[main.length - 1][1]) continue; const bl = [[bx, by]]; let cx = bx, cy = by; for (let k = 0; k < 4; k++) { cx += s * (30 + r() * 50); cy += (r() - 0.3) * 50; bl.push([cx, cy]); } path(bl, 10 * amount + 2, 'rgba(255,120,255,0.6)', 30); path(bl, 3, '#000', 0); }
    if (flicker > 0.5) { x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(0, 0, W, H); }
    this.crackTex.needsUpdate = true;
  }
}
export function radialTex(color, size = 128) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const x = cv.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------------------------------------------------------- lighting presets
export const LIGHT = {
  day:     { top: 0x3f86f2, horizon: 0xb5d8ff, bottom: 0x8fb0d8, fog: 0xb5d8ff, fogNear: 45, fogFar: 150, hemiSky: 0xdfefff, hemiGround: 0x6b5a3a, hemi: 1.5, sun: 0xfff1d6, sunI: 2.4, amb: 0.35, stars: 0, moon: 0, sunAngle: 1.05, clouds: 1, exposure: 1.0 },
  noon:    { top: 0x2f7cf0, horizon: 0xbfe0ff, bottom: 0x8fb0d8, fog: 0xbfe0ff, fogNear: 50, fogFar: 160, hemiSky: 0xe8f4ff, hemiGround: 0x6b5a3a, hemi: 1.6, sun: 0xffffff, sunI: 2.6, amb: 0.35, stars: 0, moon: 0, sunAngle: 1.35, clouds: 1, exposure: 1.0 },
  night:   { top: 0x08112c, horizon: 0x24386a, bottom: 0x0b1226, fog: 0x18264a, fogNear: 24, fogFar: 95, hemiSky: 0x7f9ce6, hemiGround: 0x2a2a3e, hemi: 1.3, sun: 0xb0c4ff, sunI: 1.35, amb: 0.2, stars: 1, moon: 1, sunAngle: -0.9, clouds: 0.25, exposure: 1.0 },
  cave:    { top: 0x000000, horizon: 0x000000, bottom: 0x000000, fog: 0x050505, fogNear: 6, fogFar: 30, hemiSky: 0x50586a, hemiGround: 0x101010, hemi: 0.16, sun: 0x000000, sunI: 0, amb: 0.03, stars: 0, moon: 0, sunAngle: -1, clouds: 0, exposure: 1.0 },
  glitch:  { top: 0x2a0f3d, horizon: 0xd0507a, bottom: 0x3a1030, fog: 0x7a3060, fogNear: 25, fogFar: 110, hemiSky: 0xffb0d8, hemiGround: 0x2a1030, hemi: 1.0, sun: 0xff9a7a, sunI: 1.4, amb: 0.15, stars: 0.4, moon: 0, sunAngle: 0.12, clouds: 0.5, exposure: 1.0 },
  void:    { top: 0x05010c, horizon: 0x1b0a35, bottom: 0x000000, fog: 0x0b0418, fogNear: 30, fogFar: 140, hemiSky: 0xa88cff, hemiGround: 0x2a1448, hemi: 1.3, sun: 0xd8c4ff, sunI: 1.5, amb: 0.2, stars: 0.8, moon: 0, sunAngle: -1, clouds: 0, exposure: 1.0 },
  dusk:    { top: 0x283e7a, horizon: 0xf09a5a, bottom: 0x3a3050, fog: 0xd08a6a, fogNear: 35, fogFar: 130, hemiSky: 0xffd0a8, hemiGround: 0x3a2a2a, hemi: 1.0, sun: 0xffb070, sunI: 1.8, amb: 0.2, stars: 0.1, moon: 0, sunAngle: 0.15, clouds: 0.8, exposure: 1.0 },
  morning: { top: 0x4a90f0, horizon: 0xffe1b8, bottom: 0x8fb0d8, fog: 0xd8e6f5, fogNear: 45, fogFar: 150, hemiSky: 0xfff2dd, hemiGround: 0x6b5a3a, hemi: 1.45, sun: 0xffe2b0, sunI: 2.3, amb: 0.3, stars: 0, moon: 0, sunAngle: 0.55, clouds: 1, exposure: 1.0 },
};
export function mixLight(a, b, k) {
  const o = {}; const ca = new THREE.Color(), cb = new THREE.Color();
  for (const key in a) {
    if (typeof a[key] !== 'number') { o[key] = k < 0.5 ? a[key] : b[key]; continue; }
    if (['top', 'horizon', 'bottom', 'fog', 'hemiSky', 'hemiGround', 'sun'].includes(key)) o[key] = ca.set(a[key]).lerp(cb.set(b[key]), k).getHex();
    else o[key] = lerp(a[key], b[key], k);
  }
  return o;
}
/** Standard light rig attached to a stage scene. */
export class LightRig {
  constructor(scene) {
    this.scene = scene;
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1); this.sun = new THREE.DirectionalLight(0xffffff, 2); this.amb = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(this.hemi, this.sun, this.sun.target, this.amb); scene.fog = new THREE.Fog(0x000000, 10, 100);
  }
  apply(L, sky, cam, extra = {}) {
    this.hemi.color.set(L.hemiSky); this.hemi.groundColor.set(L.hemiGround); this.hemi.intensity = L.hemi;
    this.sun.color.set(L.sun); this.sun.intensity = L.sunI; this.amb.intensity = L.amb;
    const a = L.sunAngle; const d = new THREE.Vector3(Math.cos(a) * 0.8, Math.abs(Math.sin(a)) + 0.2, 0.35).normalize();
    this.sun.position.copy(cam.position).addScaledVector(d, 50); this.sun.target.position.copy(cam.position);
    this.scene.fog.color.set(L.fog); this.scene.fog.near = L.fogNear; this.scene.fog.far = L.fogFar;
    if (sky) sky.update({ top: L.top, horizon: L.horizon, bottom: L.bottom, sunAngle: L.sunAngle, moon: L.moon, stars: L.stars, clouds: L.clouds, ...extra }, cam);
  }
}
