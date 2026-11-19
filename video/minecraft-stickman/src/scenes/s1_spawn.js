// SCENE 1 — SPAWN. Day one, punching trees, crafting, the sun that doesn't move, sudden night.
import { Actor } from '../engine/CharacterController.js';
import { shot } from '../engine/CameraController.js';
import { burst, motes } from '../engine/Particles.js';
import { Ease, clamp, prog, shakeEnv, smooth } from '../engine/AnimationSystem.js';
import { talker, head, off, light } from './util.js';

export const BEATS = { spawn: 2.8, walk: 6.0, punch: 7.4, logBreak: 10.4, montage: 13.6, montageEnd: 15.4, craft: 15.5, tablePop: 18.65, nailed: 19.0,
  toTable: 20.0, hammer: 20.5, pickaxe: 21.7, lookSun: 22.3, watch: 25.5, dark: 28.3, groan: 31.0, leave: 34.4 };
const B = BEATS;
const MONTAGE_HITS = [13.75, 14.2, 14.65, 15.1];

export default function s1(W) {
  const S = W.stages.over; const g = S.ground;
  const hero = new Actor(S.hero, {
    ground: g, talk: talker('s1'), blinkSeed: 0.3,
    path: [[0, [0.5, 0.5]], [B.walk, [0.5, 0.5]], [B.punch - 0.05, [3.5, 1.25], 'linear'], [B.craft, [3.5, 1.25]], [B.toTable, [3.5, 1.25]], [B.hammer, [1.5, 1.3], 'linear'],
      [B.pickaxe + 0.25, [1.5, 1.3]], [B.lookSun + 0.2, [-1.6, -2.4], 'linear'], [B.leave, [-1.6, -2.4]], [37.0, [4.5, -0.6], 'in']],
    yaw: [[0, 2.6], [2.9, 2.6], [5.8, 2.6], [6.3, 1.3], [7.1, 0.3], [7.4, 0], [B.craft, 0], [B.craft + 0.4, -2.3], [B.toTable - 0.1, -2.3], [B.toTable + 0.3, -1.6], [B.hammer - 0.15, 0],
      [B.pickaxe + 0.25, 0], [B.pickaxe + 0.45, -2.45], [B.lookSun + 0.2, -2.45], [B.lookSun + 0.7, 0.75], [B.watch, 0.75], [B.watch + 0.3, -0.3], [B.dark + 1.5, -0.3], [B.groan, -0.3], [B.groan + 0.25, 1.4], [B.leave - 0.5, 1.2], [B.leave, 1.25]],
    acts: [[0, 'stand'], [B.spawn + 0.4, 'land'], [B.spawn + 1.0, 'lookAround'], [B.walk, 'walk'], [B.punch, 'punch', { rate: 3.2, sfx: 'punchWood' }], [B.logBreak, 'idle'],
      [B.logBreak + 0.6, 'lookUp'], [12.6, 'shrug'], [B.montage, 'punch', { rate: 6.5, sfx: null }], [B.montageEnd, 'idle'], [B.craft, 'craft'], [B.tablePop - 0.1, 'idle'],
      [B.nailed, 'handsOnHips'], [B.toTable, 'walk'], [B.hammer, 'hammer', { sfx: 'craftHit' }], [B.pickaxe, 'holdUp'], [B.pickaxe + 0.3, 'walk'], [B.lookSun + 0.2, 'lookUp'], [24.0, 'idle'], [B.watch, 'checkWatch'],
      [B.dark, 'scared'], [B.dark + 2.5, 'lookAround'], [B.groan, 'scared'], [32.0, 'gulp'], [B.leave, 'walk']],
    expr: [[0, 'neutral'], [B.spawn + 0.8, 'curious'], [B.walk, 'neutral'], [B.punch, 'determined'], [B.logBreak, 'pain'], [B.logBreak + 0.6, 'confused'], [B.montage, 'determined'],
      [B.craft, 'curious'], [B.tablePop, 'excited'], [B.nailed, 'smug'], [B.toTable, 'neutral'], [B.hammer, 'determined'], [B.pickaxe, 'excited'], [B.lookSun, 'squint'], [23.0, 'confused'],
      [B.watch, 'curious'], [26.2, 'deadpan'], [B.dark, 'shocked'], [B.dark + 1.6, 'scared'], [B.groan, 'terrified'], [32.0, 'worried']],
    eyes: [[0, [0, 0]], [B.lookSun, [0.2, -0.8]], [24.0, [0.25, -0.95]], [B.watch, [0.4, 0.7]], [B.dark, [0, 0]], [B.groan, [0.8, 0]], [B.groan + 1.5, [0, 0]]],
    items: [[0, {}], [B.pickaxe, { r: 'woodPickaxe' }], [B.watch, { r: 'woodPickaxe', lw: true }], [B.dark + 1, { r: 'woodPickaxe' }]],
    jumps: MONTAGE_HITS.map(t => [t - 0.18, 0.38, 0.55]),
    extra: (t, p) => { if (t > B.montage && t < B.montageEnd) { p.rShP += 0.9; p.headPitch -= 0.4; } if (t > B.logBreak && t < B.logBreak + 0.6) { p.rShP = 0.9; p.rEl = 1.9; p.rShR = 0.6; } return p; },
  });
  const spawnPos = [0.5, g(0.5, 0.5), 0.5];

  function update(t) {
    S.reset();
    // lighting: the sun is frozen; at B.dark the sky snaps to night
    const k = smooth(prog(t, B.dark, B.dark + 0.22));
    S.light(light('day', 'night', k), t, { cloudSpeed: 1.6 });
    const st = hero.state(t);
    // spawn: materialize
    const sp = Ease.outBack(prog(t, B.spawn, B.spawn + 0.35));
    st.scale = t < B.spawn ? 0.001 : sp; st.visible = t >= B.spawn;
    S.hero.apply(st);
    // punch log: cracks build up, then breaks; tree floats
    const crack = prog(t, B.punch, B.logBreak);
    S.crack.visible = t > B.punch + 0.2 && t < B.logBreak; S.crack.userData.setStage(crack * 5);
    S.logBlock.visible = t < B.logBreak;
    // dropped log flies to the hero
    if (t > B.logBreak && t < B.logBreak + 0.55) {
      const q = prog(t, B.logBreak, B.logBreak + 0.55); const from = [3.5, 21.5, 2.5], to = off(st.pos, [0, 0.8, 0]);
      S.dropLog.visible = true; S.dropLog.position.set(from[0] + (to[0] - from[0]) * Ease.in(q), from[1] + Math.sin(q * Math.PI) * 0.6 + (to[1] - from[1]) * q, from[2] + (to[2] - from[2]) * Ease.in(q)); S.dropLog.rotation.y = t * 4;
    }
    S.punchTree.userData.logs.visible = t < MONTAGE_HITS[3];
    S.table.visible = t >= B.tablePop; S.table.scale.setScalar(Ease.outBack(prog(t, B.tablePop, B.tablePop + 0.3)) || 0.001);
    S.houseParts && Object.values(S.houseParts).forEach(p => (p.visible = false)); S.door.group.visible = false; S.shutter.visible = false; S.bed.group.visible = false; S.houseTorch.update(t, 0);
    // particles
    S.glowParticles.add(burst({ t0: B.spawn - 0.7, pos: [0.5, 22.2, 0.5], n: 60, colors: ['#ffffff', '#b8f0ff', '#fff6a0'], speed: 2.4, up: 1, gravity: 0, life: 0.7, size: 0.16, implode: true, seed: 2 }));
    S.glowParticles.add(burst({ t0: B.spawn + 0.05, pos: [0.5, 21.3, 0.5], n: 40, colors: ['#ffffff', '#b8f0ff'], speed: 3, up: 1.5, gravity: 2, life: 0.8, size: 0.12, seed: 3 }));
    S.particles.add(burst({ t0: B.logBreak, pos: [3.5, 21.5, 2.5], n: 34, colors: ['#6b5030', '#b08d59', '#4a3520'], speed: 2.2, up: 3, gravity: 12, life: 0.9, size: 0.13, seed: 5 }));
    MONTAGE_HITS.forEach((h, i) => S.particles.add(burst({ t0: h, pos: [3.5, 22.6 + i * 0.9, 2.5], n: 18, colors: ['#6b5030', '#b08d59'], speed: 2, up: 2, gravity: 10, life: 0.7, size: 0.13, seed: 10 + i })));
    S.particles.add(burst({ t0: B.tablePop, pos: [1.5, 21.1, 2.5], n: 26, colors: ['#a88452', '#6e5230', '#ffffff'], speed: 2.5, up: 1.2, gravity: 6, life: 0.6, size: 0.1, seed: 21 }));
    for (let i = 0; i < 4; i++) S.glowParticles.add(burst({ t0: B.hammer + 0.19 + i * 0.31, pos: [1.5, 22.1, 2.1], n: 8, colors: ['#ffe08a', '#ffffff'], speed: 1.6, up: 2, gravity: 6, life: 0.4, size: 0.08, seed: 30 + i }));
    S.glowParticles.add(burst({ t0: B.pickaxe, pos: off(st.pos, [0, 2.4, 0]), n: 24, colors: ['#ffe08a', '#ffffff'], speed: 1.5, up: 0.5, gravity: 0, life: 0.8, size: 0.1, seed: 40 }));
    if (t > B.dark) S.particles.add(motes({ center: [2, 23, 2], extent: [16, 5, 16], n: 60, colors: ['#c8e0ff'], size: 0.05, alpha: 0.5, seed: 8 }));
    else S.glowParticles.add(motes({ center: [2, 23, 2], extent: [16, 5, 16], n: 40, colors: ['#fff6c8'], size: 0.04, alpha: 0.35, seed: 9 }));

    // ---------- camera
    const H = head(st);
    const c = shot(t, [
      { t: [0, 3.0], pos: [[22, 48, -26], [4.2, 24.0, -5.6]], look: [[0.5, 22, 0.5], [0.5, 22.2, 0.5]], fov: [55, 48], ease: 'inOut3' },
      { t: [3.0, 6.0], pos: [() => off(H, [1.0, 0.05, -1.65]), () => off(H, [0.75, 0.0, -1.35])], look: () => H, fov: 42, ease: 'sine' },
      { t: [6.0, 7.4], pos: [() => off(st.pos, [-1.6, 1.7, -2.6]), () => off(st.pos, [-1.6, 1.7, -2.6])], look: [() => off(st.pos, [0.6, 1.2, 0.6]), () => off(st.pos, [0.6, 1.2, 0.6])], fov: 50 },
      { t: [7.4, 10.4], pos: [[5.9, 22.35, 0.2], [5.6, 22.3, 0.45]], look: [[3.3, 21.95, 1.9], [3.3, 21.95, 1.9]], fov: [48, 42], shake: () => shakeEnv(t, [...[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => [B.punch + (i + 0.35) / 3.2, 0.12, 0.15]), [B.logBreak, 0.5, 0.3]]) },
      { t: [10.4, 13.5], pos: [[6.2, 21.3, 0.1], [5.9, 21.25, -0.2]], look: [[3.5, 22.4, 2.5], [3.5, 23.4, 2.5]], fov: [60, 64] },
      { t: [13.5, 15.45], pos: [[-0.9, 22.9, -2.2], [-0.7, 22.9, -2.0]], look: [3.4, 23.6, 2.5], fov: 55, shake: () => shakeEnv(t, MONTAGE_HITS.map(h => [h, 0.25, 0.15])) },
      { t: [15.45, 20.0], pos: [[0.15, 22.75, -1.7], [0.45, 22.65, -1.35]], look: [[3.85, 22.1, 2.0], [3.75, 22.2, 1.95]], fov: 45 },
      { t: [20.0, 22.3], pos: [[-1.6, 22.9, -1.5], [-1.2, 22.8, -1.2]], look: [[1.6, 22.0, 2.0], [1.6, 22.2, 1.8]], fov: 48 },
      { t: [22.3, 24.0], pos: [() => off(st.pos, [-1.1, 0.5, -1.6]), () => off(st.pos, [-1.3, 0.35, -1.9])], look: [() => off(st.pos, [4, 9.5, 3.5]), () => off(st.pos, [4.5, 10.5, 4])], fov: [55, 58] },
      { t: [24.0, 25.5], pos: [() => off(H, [Math.sin(0.75) * 1.35, 0.0, Math.cos(0.75) * 1.35]), () => off(H, [Math.sin(0.75) * 1.15, 0.0, Math.cos(0.75) * 1.15])], look: () => H, fov: 40 },
      { t: [25.5, 28.3], pos: [() => off(st.pos, [-1.2, 1.75, 1.5]), () => off(st.pos, [-1.0, 1.7, 1.25])], look: () => off(st.pos, [0, 1.45, 0]), fov: 45 },
      { t: [28.3, 30.0], pos: [() => off(H, [-0.75, 0.05, 2.0]), () => off(H, [-0.4, 0.02, 1.0])], look: () => H, fov: [50, 38], ease: Ease.out3, shake: () => shakeEnv(t, [[B.dark, 0.8, 0.4]]) },
      { t: [30.0, 34.4], pos: [[2.9, 22.0, -5.3], [2.2, 22.3, -4.4]], look: [() => off(st.pos, [0, 1.3, 0]), () => off(st.pos, [0, 1.4, 0])], fov: 50, shake: () => shakeEnv(t, [[B.groan, 0.2, 0.3]]) },
      { t: [34.4, 36.0], pos: [[-1.5, 23.0, -3.8], [1.0, 23.2, -4.2]], look: [() => off(st.pos, [0, 1.3, 0]), () => off(st.pos, [0, 1.3, 0])], fov: 50 },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: t > B.dark ? 0.9 : 0.5, saturation: t > B.dark ? 0.85 : 1.12, rgb: 0.6 * Math.exp(-Math.max(0, t - B.dark) * 4) * (t > B.dark ? 1 : 0) };
    if (t > B.montage && t < B.montageEnd) { post.saturation = 1.3; post.contrast = 1.15; }
    if (t > B.dark && t < B.dark + 0.12) post.flash = 0.4;
    return { stage: S, post };
  }
  function cues() {
    return [
      { t: B.spawn - 0.7, id: 'spawn', gain: 0.9 }, { t: B.spawn + 0.05, id: 'land', gain: 0.6 },
      ...hero.events(0, 36, 'grass'),
      { t: B.logBreak, id: 'breakWood', gain: 1 }, { t: B.logBreak + 0.55, id: 'pop', gain: 0.8 },
      ...MONTAGE_HITS.flatMap(h => [{ t: h - 0.05, id: 'punchWood', gain: 0.8 }, { t: h, id: 'breakWood', gain: 0.7 }, { t: h + 0.12, id: 'pop', gain: 0.5 }]),
      { t: B.tablePop, id: 'place', gain: 1 }, { t: B.pickaxe, id: 'shine', gain: 0.6 },
      { t: B.dark, id: 'impactDeep', gain: 1 }, { t: B.dark, id: 'whooshDown', gain: 0.6 },
      { t: B.groan, id: 'zombieFar', gain: 0.8 },
    ];
  }
  void clamp; void spawnPos;
  return { update, cues, hero };
}
