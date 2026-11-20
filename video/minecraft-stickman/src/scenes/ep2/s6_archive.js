// EP2 SCENE 6 — THE ARCHIVE. Every deleted world. Chest 47. The snow globe. "DON'T OPEN IT."
import { Actor } from '../../engine/CharacterController.js';
import { shot } from '../../engine/CameraController.js';
import { burst, motes } from '../../engine/Particles.js';
import { Ease, prog, shakeEnv, smooth, lerp } from '../../engine/AnimationSystem.js';
import { L2 } from '../../story/ep2/stages.js';
import { talker, head, off } from '../util.js';

const B = { up: 1.4, reveal: 4.0, walk: 14.0, label12: 17.0, label30: 20.0, chest: 26.0, open: 27.4, hold: 29.2, zero: 41.0, sign1: 43.2, sign2: 46.6, boom: 51.9 };
export const SIGNS6 = [[B.sign1, ["DON'T", 'OPEN IT.']], [B.sign2, ["THAT'S HOW", 'HE GOT ME.']]];

export default function s6(W) {
  const A = W.stages.archive;
  const hero = new Actor(A.hero, { ground: A.ground, talk: talker('s6'), blinkSeed: 0.6,
    path: [[0, [-19.0, -18.0]], [B.walk, [-19.0, -18.0]], [B.label12, [-19.2, -6.0], 'linear'], [B.label30 - 0.6, [-19.2, -0.5]], [23.4, [-19.2, -0.5]], [B.chest, [-19.8, 6.5]]],
    yaw: [[0, 0.2], [B.walk, 0], [B.label12, -1.3], [B.label12 + 1.2, 0], [B.label30 - 0.6, -1.4], [23.4, 0], [B.chest - 0.3, -Math.PI / 2], [B.hold + 0.6, -Math.PI / 2], [B.hold + 1.2, 0.9], [B.zero + 0.4, 0.9], [B.zero + 1, Math.PI / 2 - 0.2]],
    acts: [[0, 'sleep'], [B.up, 'sit'], [2.6, 'stand'], [B.reveal, 'lookAround'], [B.walk, 'walk', { stride: 0.95 }], [B.label30 - 0.6, 'idle'], [23.4, 'walk'], [B.chest, 'idle'], [B.open, 'place', { rate: 1.5, sfx: null }], [B.hold, 'read'], [B.zero, 'scared'], [B.zero + 1.5, 'read'], [B.boom, 'cower']],
    tilt: [[0, Math.PI / 2], [B.up, Math.PI / 2], [B.up + 0.5, 0, 'out']], yOff: [[0, -0.71], [B.up, -0.71], [B.up + 0.5, 0, 'out']],
    expr: [[0, 'sleep'], [0.8, 'pain'], [B.reveal, 'shocked'], [B.walk, 'curious'], [B.label30 - 0.4, 'worried'], [B.chest, 'curious'], [B.open, 'shocked'], [B.hold, 'happy'], [33.5, 'relieved'], [37, 'worried'], [B.zero, 'shocked'], [B.sign2, 'scared'], [B.boom, 'terrified']],
    eyes: [[0, [0, 0]], [B.hold, [0, 0.8]], [B.zero, [0.5, 0]], [B.zero + 1, [0, 0]]] });
  const zero = new Actor(A.zero, { ground: A.ground, path: [[0, [-18.4, 5.0]]], yaw: [[0, -0.75]], acts: [[0, 'stand'], [B.zero + 0.5, 'land'], [B.zero + 1.2, 'holdSign']], expr: [[0, 'neutral']], yOff: [[0, 10], [B.zero, 10], [B.zero + 0.5, 0, 'in']] });
  function update(t) {
    A.reset(); A.light(L2.archive, t, { sun: false });
    const st = hero.state(t); if (st.tilt > 0.5) st.shadow = 0; A.hero.apply(st);
    const zs = zero.state(t); zs.visible = t > B.zero; zs.shadow = 0; A.zero.apply(zs); A.zero.root.visible = t > B.zero;
    A.zeroSign.update(t, zs, SIGNS6, t > B.sign1 - 0.1);
    const open = Ease.out(prog(t, B.open, B.open + 0.5)); A.myChest.update(open, open * (1 - prog(t, 31, 33)) * 0.8);
    if (t > B.hold - 0.6) { const h = A.hero.handWorld('r'); const l = A.hero.handWorld('l'); A.globe.visible = true; A.globe.position.set((h.x + l.x) / 2, (h.y + l.y) / 2 + 0.25, (h.z + l.z) / 2); A.globe.rotation.y = t * 0.2; A.globe.scale.setScalar(Ease.outBack(prog(t, B.hold - 0.6, B.hold))); }
    A.heroLight.position.set(st.pos[0] + 0.6, 3.4, st.pos[2] + 0.4); A.heroLight.intensity = 6;
    if (t > B.boom) { const k = prog(t, B.boom, B.boom + 1.6); A.lamps.forEach((L, i) => (L.intensity = 10 * (1 - k) * (Math.sin(t * 50 + i) > 0 ? 1 : 0.3))); }
    A.glowParticles.add(motes({ center: [st.pos[0], 5, st.pos[2]], extent: [20, 9, 30], n: 160, colors: ['#9ac4ff', '#ffffff'], size: 0.05, alpha: 0.55, seed: 3, speed: 0.3 }));
    A.glowParticles.add(burst({ t0: B.hold - 0.6, pos: [-21.0, 2.1, 6.5], n: 40, colors: ['#ffe08a', '#ffffff'], speed: 1.4, up: 1.2, gravity: 0, life: 1.2, size: 0.07, seed: 70 }));
    A.particles.add(burst({ t0: B.zero + 0.5, pos: [-18.4, 1.1, 5.0], n: 30, colors: ['#555555', '#888888'], speed: 2, up: 1, gravity: 8, life: 0.7, size: 0.1, seed: 71 }));
    A.glowParticles.add(burst({ t0: B.boom, pos: [-19, 4, 4], n: 160, colors: ['#ffe08a', '#ffffff', '#b050ff'], speed: 6, up: 2, gravity: 0, life: 1.4, size: 0.12, spread: 20, seed: 72 }));
    const H = head(st), P = st.pos;
    const c = shot(t, [
      { t: [0, B.reveal], pos: [[-18.2, 2.9, -16.4], [-18.3, 2.7, -16.6]], look: [() => off(P, [0, 0.4, 0]), () => off(P, [0, 0.9, 0])], fov: 50 },
      { t: [B.reveal, B.walk], pos: [[-19.0, 2.2, -21.0], [-19.0, 22, -30.0]], look: [[-19.0, 2.0, -12], [-10, 2.0, 25]], fov: [55, 70], ease: 'inOut3' },
      { t: [B.walk, B.label12 + 1.3], pos: [() => off(P, [0.9, 1.7, 2.6]), () => off(P, [0.9, 1.7, 2.6])], look: () => off(P, [0, 1.3, 0]), fov: 52 },
      { t: [B.label12 + 1.3, B.label30 + 3.5], pos: [[-19.3, 3.5, -2.4], [-19.4, 3.45, -2.1]], look: [-21.0, 3.3, -0.0], fov: 45 },
      { t: [B.label30 + 3.5, B.chest + 0.2], pos: [() => off(H, [0.8, 0.1, 1.3]), () => off(H, [0.8, 0.1, 1.3])], look: () => H, fov: 46 },
      { t: [B.chest + 0.2, B.hold], pos: [[-18.6, 2.6, 8.2], [-18.8, 2.4, 7.8]], look: [-21.3, 1.8, 6.5], fov: 48 },
      { t: [B.hold, 34.0], pos: [() => off(A.globe.position.toArray(), [0.5, 0.2, 0.75]), () => off(A.globe.position.toArray(), [0.38, 0.12, 0.55])], look: () => A.globe.position.toArray(), fov: 40, ease: 'linear' },
      { t: [34.0, B.zero], pos: [() => off(H, [1.2, 0.05, 0.5]), () => off(H, [1.05, 0.05, 0.4])], look: () => off(H, [0, -0.3, 0]), fov: 42 },
      { t: [B.zero, B.boom], pos: [[-17.4, 2.7, 8.6], [-17.5, 2.65, 8.4]], look: [() => off(P, [0.4, 1.2, -0.5]), () => off(P, [0.4, 1.2, -0.5])], fov: 50 },
      { t: [B.boom, 56], pos: [[-16.2, 2.6, 7.4], [-15.0, 5.0, 9.0]], look: [-19.5, 3.5, 4.0], fov: [50, 60], shake: () => shakeEnv(t, [[B.boom, 1.2, 1.0]]) },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 0.85, saturation: 1.0, tint: [0.9, 0.95, 1.1], tintAmt: 0.08, fade: t < 0.6 ? 1 - t / 0.6 : 0 };
    if (t > B.boom) { post.flash = Math.max(0, 0.8 - (t - B.boom) * 2); post.fade = smooth(prog(t, B.boom + 1.5, 55.5)) * 0.9; post.glitch = 0.3 * (1 - prog(t, B.boom, B.boom + 1)); }
    return { stage: A, post };
  }
  function cues() {
    return [{ t: 0.4, id: 'bodyFall', gain: 0.6 }, ...hero.events(0, 56, 'stone'), { t: B.reveal + 0.5, id: 'choir', gain: 0.5 }, { t: B.open, id: 'chestOpen', gain: 1 }, { t: B.hold - 0.5, id: 'shine', gain: 0.7 },
      { t: B.zero + 0.5, id: 'land', gain: 1 }, ...SIGNS6.map(([t]) => ({ t, id: 'signFlip', gain: 0.7 })), { t: B.sign2, id: 'stinger', gain: 0.6 }, { t: B.boom, id: 'thunderEcho', gain: 1 }];
  }
  void lerp;
  return { update, cues, hero };
}
