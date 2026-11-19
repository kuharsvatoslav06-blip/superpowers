// SCENE 5 — WORLD COLLAPSE. Trees vanish, water floats, animals fly, the ground disappears, the sky cracks.
import { Actor } from '../engine/CharacterController.js';
import { shot } from '../engine/CameraController.js';
import { burst, motes, swirl, fall } from '../engine/Particles.js';
import { Ease, clamp, prog, shakeEnv, smooth, hash, noise1, lerp } from '../engine/AnimationSystem.js';
import { LIGHT } from '../engine/EnvironmentManager.js';
import { talker, head, off } from './util.js';

export const BEATS = { out: 0, trees: 6.5, water: 14.0, animals: 21.0, pig: 22.4, runEast: 26.0, floor: 28.4, crack: 36.0, house: 42.0, reveal: 50.6, point: 58.0, portalOn: 58.6, gone: 63.8, go: 66.4 };
const B = BEATS;
const TREE_T = [7.0, 8.2, 9.4, 10.6, 11.8];
const JUMPS = [[29.9, 0.55, 1.0], [31.5, 0.55, 1.0], [33.1, 0.6, 1.1]];
const ANIM = [[0.5, -5.5, 21.2], [3.5, -4.5, 21.9], [-3.6, -4.2, B.pig], [5.0, -6.0, 23.2], [-1.0, -6.5, 23.8]];

export default function s5(W) {
  const S = W.stages.over; const g = S.ground;
  const hero = new Actor(S.hero, {
    ground: g, talk: talker('s5'), blinkSeed: 1.7,
    path: [[0, [-19.5, 0.5]], [4.0, [-12.0, 0.5], 'linear'], [5.0, [-10.5, 0.4], 'out'], [B.trees, [-10.5, 0.4]], [13.5, [-5.5, -1.8]], [B.water + 1, [-5.5, -2.4]],
      [B.animals, [-5.5, -2.4]], [B.pig - 0.4, [-3.0, -1.6]], [B.runEast, [-3.0, -1.6]], [B.floor, [-0.6, 0.5], 'in'], [35.2, [7.6, 0.6], 'linear'], [36.2, [8.5, 1.9], 'out'],
      [B.go, [8.5, 1.9]], [68.6, [13.0, 8.6], 'linear'], [70.4, [14.9, 12.6], 'linear']],
    acts: [[0, 'run', { stride: 1.6 }], [4.0, 'walk'], [5.0, 'lookAround'], [B.trees, 'walk', { stride: 0.8 }], [13.5, 'idle'], [B.water + 1, 'scared'], [B.water + 1.6, 'idle'], [B.animals, 'walk'],
      [B.pig - 0.4, 'scared'], [B.pig + 1.2, 'idle'], [B.runEast, 'run', { stride: 1.5 }], [35.2, 'run', { stride: 1.5 }], [36.2, 'idle'], [B.crack, 'lookUp'], [B.house - 0.6, 'scared'],
      [B.house + 1.2, 'shrug'], [B.house + 3.5, 'facepalm'], [B.reveal - 1, 'idle'], [B.reveal, 'scared'], [B.point, 'idle'], [B.go, 'walk']],
    yaw: [[0, Math.PI / 2], [5.0, Math.PI / 2], [6.0, 0.4], [7.0, -0.3], [8.2, 2.5], [9.4, 0.5], [10.6, 3.0], [11.8, 1.0], [13.5, 2.6], [B.water + 1, 3.2], [B.animals, 3.2], [B.pig - 0.4, 3.4], [B.pig + 0.3, Math.PI + 0.25],
      [B.runEast, Math.PI + 0.25], [B.runEast + 0.3, Math.PI / 2 + 2 * Math.PI], [35.2, Math.PI / 2 + 2 * Math.PI], [36.2, 2 * Math.PI], [B.point + 1.0, 2 * Math.PI], [B.point + 2.0, 2 * Math.PI + 0.75], [B.go, 2 * Math.PI + 0.75], [B.go + 0.4, 2 * Math.PI + 0.6]],
    expr: [[0, 'scared'], [5.0, 'worried'], [7.0, 'shocked'], [8.5, 'worried'], [B.water + 1, 'confused'], [B.water + 2, 'deadpan'], [B.pig, 'shocked'], [B.pig + 1.2, 'deadpan'], [B.runEast, 'terrified'],
      [36.2, 'worried'], [B.crack + 0.3, 'terrified'], [B.house, 'shocked'], [B.house + 1.4, 'yell'], [B.house + 3.6, 'pain'], [B.reveal, 'scared'], [B.point + 1, 'worried'], [B.go - 1.4, 'deadpan'], [B.go, 'determined']],
    eyes: [[0, [0, 0]], [B.water + 1, [0, -0.3]], [B.pig, [0.6, 0]], [B.runEast, [0, 0]], [B.reveal, [0, 0]], [B.point + 1.2, [0.9, 0]], [B.go, [0, 0]]],
    look: [[0, [0, 0]], [B.pig - 0.3, [0, 0]], [B.pig + 0.4, [0.5, -0.1]], [B.pig + 1.5, [0.5, -0.1]], [B.runEast, [0, 0]], [B.reveal, [0, -0.05]], [B.point + 0.8, [0, 0]], [B.point + 1.4, [0.6, 0]], [B.point + 2.0, [0, 0]]],
    items: [[0, { r: 'diamondPickaxe' }]],
    jumps: JUMPS,
  });
  const shadow = new Actor(S.shadowMan, { ground: g, path: [[0, [8.5, 6.4]]], yaw: [[0, Math.PI], [B.point, Math.PI], [B.point + 0.8, 0.87 + 0.15]],
    acts: [[0, 'holdSign'], [B.point - 0.2, 'stand'], [B.point + 0.8, 'point', { roll: 0.05 }]], expr: [[0, 'neutral']], look: [[0, [0, 0]], [B.point + 0.4, [0, 0]], [B.point + 0.8, [0, -0.05]]] });

  function update(t) {
    S.reset();
    const crack = smooth(prog(t, B.crack, B.crack + 2.6));
    S.light(LIGHT.glitch, t, { sun: false, glow: 0.35, crack: { amount: crack, dir: [0.05, 0.62, 1], flicker: hash(Math.floor(t * 12)) < 0.2 ? 1 : 0 }, cloudSpeed: 4 });
    const st = hero.state(t); S.hero.apply(st);
    // trees glitch out and disappear
    S.trees.forEach(tr => { if (tr.userData.tag !== 'g') return; const i = S.trees.filter(x => x.userData.tag === 'g').indexOf(tr); const tt = TREE_T[i];
      const flick = t > tt - 0.7 && t < tt && hash(Math.floor(t * 18) + i) < 0.45; tr.visible = t < tt && !flick;
      if (tt) S.glowParticles.add(burst({ t0: tt, pos: [tr.userData.base[0], tr.userData.base[1] + 3, tr.userData.base[2]], n: 70, colors: ['#ff4dff', '#3dff7a', '#111111', '#ffffff'], speed: 2.2, up: 1, gravity: 0, life: 1.0, size: 0.18, spread: 2.5, seed: 100 + i })); });
    // floating water
    S.floatWater.forEach((m, i) => { const d = m.userData; const k = prog(t, B.water + d.s * 2.0, B.water + 3 + d.s * 2.0); m.visible = k > 0;
      m.position.set(d.x + Math.sin(t * 0.9 + i) * 0.3 * k, 20.5 + Ease.out(k) * (2.5 + d.s * 4) + Math.sin(t * 1.7 + i * 1.3) * 0.25 * k, d.z + Math.cos(t * 0.8 + i) * 0.3 * k);
      m.rotation.set(t * 0.3 * d.s, t * 0.2, 0); m.scale.setScalar(0.4 + d.s * 0.6); });
    // animals fly
    S.animals.forEach((a, i) => { const [x, z, t0] = ANIM[i]; const k = Math.max(0, t - t0);
      let pos = [x + 0.5, g(x, z) + k * (0.55 + i * 0.12) + (k > 0 ? 0.2 : 0), z + 0.5]; let yaw = i * 1.3 + k * 0.3, pitch = Math.sin(k * 0.8 + i) * 0.4 * Math.min(1, k), roll = Math.sin(k * 0.6) * 0.5 * Math.min(1, k);
      if (i === 2) { const q = prog(t, B.pig, B.pig + 1.4); const face = off(st.pos, [0.0, 1.3, -1.45]);
        pos = [lerp(x + 0.5, face[0], Ease.out(q)), lerp(g(x, z), face[1], Ease.out(q)) + Math.max(0, t - B.pig - 2.4) * 1.4, lerp(z + 0.5, face[2], Ease.out(q))];
        yaw = lerp(1.0, 0.0, q); pitch = 0; roll = Math.sin(t * 2) * 0.15; }
      a.apply({ visible: t > B.water - 3, pos, yaw, pitch, roll, paddle: t * (k > 0 ? 2.5 : 0), headYaw: i === 2 && t > B.pig + 1.0 && t < B.pig + 2.4 ? 0.3 : 0 }); });
    // ground vanishing wave
    S.stripBlocks.forEach(m => { const d = m.userData; const tv = B.floor + 0.3 + (d.x) * 0.82 + (d.z + 1) * 0.07 + (20 - d.y) * 0.18; const k = prog(t, tv, tv + 0.35);
      const flick = t > tv - 0.4 && t < tv && hash(Math.floor(t * 20) + d.x * 3 + d.z) < 0.4;
      m.visible = k < 1; m.scale.setScalar(1 - k); if (flick) m.scale.setScalar(0.92); });
    // the house: partially deleted
    for (const p of Object.values(S.houseParts)) p.visible = false; S.houseDeleted.visible = true; S.door.group.visible = false; S.shutter.visible = false;
    S.houseGhost.forEach((m, i) => { const h = m.userData.home; m.visible = true; m.position.set(h[0], h[1] + Math.sin(t * 0.8 + i) * 0.4, h[2]); m.rotation.set(t * 0.3 + i, t * 0.2, 0); m.scale.setScalar(hash(Math.floor(t * 6) + i * 7) < 0.1 ? 0.0001 : 0.8); });
    S.houseTorch.update(t, 0);
    // the other stickman with the sign
    const sOn = t > B.reveal - 1.5 && t < B.gone;
    const sst = shadow.state(t); sst.visible = sOn && !(t > B.gone - 0.5 && Math.sin(t * 80) > 0); sst.shadow = 0; S.shadowMan.apply(sst);
    S.sign2.group.visible = sOn && t < B.point - 0.1; S.sign2.group.scale.setScalar(1.35);
    S.sign2.group.position.set(8.5, 22.15, 6.4 - 0.42); S.sign2.group.rotation.set(0.05, Math.PI, 0);
    // portal ignites
    const pk = smooth(prog(t, B.portalOn, B.portalOn + 0.8)); S.portal.group.visible = true; S.portal.update(t, pk); S.portalLight.intensity = 9 * pk;
    // particles
    S.glowParticles.add(fall({ center: [st.pos[0], 26, st.pos[2]], extent: [36, 14, 36], n: 140, colors: ['#ff4dff', '#3dff7a', '#ffffff', '#4de1ff'], size: 0.14, speed: 2.2, seed: 7, intensity: () => 0.8 }));
    S.particles.add(motes({ center: [st.pos[0], 23, st.pos[2]], extent: [24, 6, 24], n: 60, colors: ['#ffd0f0'], size: 0.05, alpha: 0.4, seed: 51 }));
    S.glowParticles.add(swirl({ center: S.portal.center, radius: 1.2, height: 3.2, n: 70, colors: ['#b050ff', '#e9a0ff'], size: 0.09, intensity: () => pk }));
    S.glowParticles.add(burst({ t0: B.gone, pos: [8.5, 22.5, 6.4], n: 60, colors: ['#ffffff', '#9a6cff', '#000000'], speed: 2.5, up: 1, gravity: 0, life: 0.6, size: 0.1, seed: 120 }));
    S.glowParticles.add(burst({ t0: B.portalOn, pos: S.portal.center, n: 80, colors: ['#b050ff', '#ffffff'], speed: 3, up: 1, gravity: 0, life: 0.9, size: 0.12, seed: 121 }));

    // ---------- camera
    const H = head(st); const P = st.pos;
    const c = shot(t, [
      { t: [0, 4.0], pos: [[-8.0, 22.3, -1.4], [-9.0, 22.4, -1.2]], look: [() => off(P, [0, 1.2, 0]), () => off(P, [0, 1.2, 0])], fov: 55, shake: 0.08 },
      { t: [4.0, B.trees], pos: [() => off(H, [1.4, 0.0, -0.9]), () => off(H, [1.2, 0.0, -0.8])], look: () => H, fov: 44 },
      { t: [B.trees, B.water], pos: [[-3.5, 24.8, -7.5], [-4.5, 25.5, -6.8]], look: [[-9.0, 22.5, 2.0], [-8.0, 23.0, 2.0]], fov: 58, shake: () => shakeEnv(t, TREE_T.map(x => [x, 0.25, 0.3])) },
      { t: [B.water, 17.6], pos: [[-5.0, 22.0, 0.5], [-5.0, 22.3, 0.0]], look: [[-4.6, 23.6, -10.5], [-4.6, 24.4, -10.5]], fov: 55 },
      { t: [17.6, B.animals], pos: [() => off(H, [0.5, -0.05, -1.3]), () => off(H, [0.45, -0.05, -1.15])], look: () => H, fov: 40 },
      { t: [B.animals, B.pig], pos: [[1.5, 21.6, 1.8], [1.2, 21.7, 1.6]], look: [[2.0, 24.0, -5.5], [2.0, 25.0, -5.5]], fov: 58 },
      { t: [B.pig, B.runEast], pos: [() => off(P, [3.6, 1.8, -0.7]), () => off(P, [3.3, 1.8, -0.7])], look: () => off(P, [0, 1.5, -0.7]), fov: 48 },
      { t: [B.runEast, 29.5], pos: [() => off(P, [0.5, 1.4, -4.2]), () => off(P, [0.5, 1.4, -4.2])], look: () => off(P, [0.8, 1.0, 0]), fov: 55, shake: 0.12 },
      { t: [29.5, 35.4], pos: [() => [P[0] + 1.5, 23.4, -4.6], () => [P[0] + 1.5, 23.4, -4.6]], look: () => [P[0] + 0.8, 21.6, 0.5], fov: 55, shake: () => 0.15 + shakeEnv(t, JUMPS.map(j => [j[0] + j[1], 0.3, 0.2])) },
      { t: [35.4, B.crack], pos: [[2.6, 21.6, -1.2], [3.2, 21.6, -1.5]], look: [() => off(P, [0, 1.0, 0]), () => off(P, [0, 1.0, 0])], fov: 55 },
      { t: [B.crack, B.house], pos: [[8.6, 22.0, -2.0], [8.6, 21.6, -3.5]], look: [[8.6, 23.0, 3.0], [8.4, 38.0, 20.0]], fov: [55, 70], ease: 'inOut3', shake: () => shakeEnv(t, [[B.crack, 0.9, 1.0], [B.crack + 1.2, 0.5, 0.6]]) },
      { t: [B.house, 46.5], pos: [[8.9, 23.3, -0.6], [8.8, 23.2, -0.2]], look: [8.5, 22.6, 6.0], fov: 52 },
      { t: [46.5, B.reveal], pos: [() => off(H, [-0.7, 0.0, 1.25]), () => off(H, [-0.6, 0.0, 1.1])], look: () => H, fov: 42 },
      { t: [B.reveal, 55.5], pos: [[8.5, 22.7, 0.4], [8.5, 22.45, 3.2]], look: [8.5, 22.2, 6.0], fov: [50, 38], ease: 'inOut' },
      { t: [55.5, B.point + 0.6], pos: [() => off(H, [0.0, 0.0, 1.2]), () => off(H, [0.0, 0.0, 1.05])], look: () => H, fov: 40 },
      { t: [B.point + 0.6, 60.4], pos: [[7.0, 23.0, 3.5], [7.3, 23.2, 3.3]], look: [[8.8, 22.6, 6.6], [10.5, 23.0, 8.2]], fov: 50, ease: 'in' },
      { t: [60.4, 62.6], pos: [[11.2, 22.9, 7.6], [11.9, 23.0, 8.4]], look: [15.0, 23.5, 12.4], fov: [60, 48], ease: 'out3' },
      { t: [62.6, B.go], pos: [() => off(H, [-1.0, 0.1, -1.1]), () => off(H, [-0.9, 0.1, -1.0])], look: () => H, fov: 42 },
      { t: [B.go, 70.5], pos: [[9.0, 23.0, 1.0], [12.2, 23.2, 6.6]], look: [[15.0, 23.4, 12.2], [15.0, 23.5, 12.5]], fov: 55 },
    ]);
    W.cam.apply({ ...c, t });
    const spike = hash(Math.floor(t * 8)) < 0.12 ? 0.25 : 0;
    const post = { vignette: 0.9, saturation: 1.05, contrast: 1.1, glitch: 0.05 + spike * (t < B.reveal ? 1 : 0.4), rgb: 0.25, scan: 0.15 };
    if (TREE_T.some(x => t > x - 0.15 && t < x + 0.2)) post.glitch = 0.5;
    if (t > B.crack && t < B.crack + 1.2) { post.glitch = 0.7 * (1 - prog(t, B.crack, B.crack + 1.2)); post.flash = 0.25 * (1 - prog(t, B.crack, B.crack + 0.4)); post.flashColor = [1, 0.6, 1]; }
    if (t > B.reveal && t < B.gone) post.letterbox = 1;
    if (t > B.gone - 0.4 && t < B.gone + 0.2) post.glitch = 0.8;
    return { stage: S, post };
  }
  function cues() {
    const out = [...hero.events(0, 70, 'grass')];
    TREE_T.forEach(t => out.push({ t: t - 0.6, id: 'glitchShort', gain: 0.5 }, { t, id: 'glitch', gain: 0.8 }));
    out.push({ t: B.water + 0.2, id: 'waterRise', gain: 0.8 }, { t: B.pig + 0.9, id: 'oink', gain: 0.9 }, { t: B.pig + 2.0, id: 'oink', gain: 0.6, pitch: 1.3 });
    ANIM.forEach(([, , t0], i) => { if (i !== 2) out.push({ t: t0, id: i % 2 ? 'moo' : 'oink', gain: 0.35, pitch: 0.9 + i * 0.1 }); });
    for (let x = 0; x <= 7; x++) out.push({ t: B.floor + 0.3 + x * 0.82, id: 'blockVanish', gain: 0.7 });
    out.push({ t: B.crack, id: 'skyCrack', gain: 1 }, { t: B.house, id: 'sadSting', gain: 0.6 }, { t: B.reveal, id: 'stinger', gain: 1 });
    out.push({ t: B.portalOn, id: 'portalIgnite', gain: 1 }, { t: B.portalOn + 0.5, id: 'portalHum', gain: 0.6, dur: 11 }, { t: B.gone - 0.4, id: 'glitch', gain: 0.8 });
    out.push({ t: 69.4, id: 'portalEnter', gain: 1 });
    return out;
  }
  void clamp; void noise1;
  return { update, cues, hero };
}
