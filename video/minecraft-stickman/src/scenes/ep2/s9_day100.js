// EP2 SCENE 9 — DAY 100. Achievement get. Player 48 joined the game. He becomes the sign guy.
import { Actor } from '../../engine/CharacterController.js';
import { shot } from '../../engine/CameraController.js';
import { burst, motes } from '../../engine/Particles.js';
import { Ease, prog, smooth } from '../../engine/AnimationSystem.js';
import { LIGHT } from '../../engine/EnvironmentManager.js';
import { talker, head, off } from '../util.js';

const B = { wake: 2.6, sit: 3.4, stand: 6.4, chat: 9.2, spawn: 11.4, punch: 14.0, hands: 17.0, dark0: 18.0, dark1: 26.0, sign: 24.0, face: 27.0, black: 31.9, tele: 32.5 };
const HSIGN = [[B.sign, ['YOU ARE NOT', 'THE FIRST.']]];

export default function s9(W) {
  const S = W.stages.fresh;
  const hero = new Actor(S.hero, { ground: S.ground, talk: talker('s9'), blinkSeed: 2.1, path: [[0, [0.5, 0.5]]], yaw: [[0, 0], [B.chat + 0.6, 0], [B.chat + 1.0, 1.9], [B.hands - 0.5, 1.9], [B.hands, 0]],
    acts: [[0, 'sleep'], [B.sit, 'sit'], [B.stand, 'holdUp'], [8.4, 'idle'], [B.chat + 1, 'idle'], [B.hands, 'checkWatch'], [B.sign - 0.4, 'holdSign']],
    tilt: [[0, Math.PI / 2], [B.sit, Math.PI / 2], [B.sit + 0.5, 0, 'out']], yOff: [[0, -0.71], [B.sit, -0.71], [B.sit + 0.5, 0, 'out']],
    expr: [[0, 'sleep'], [B.wake, 'confused'], [4.0, 'happy'], [5.2, 'excited'], [B.chat, 'curious'], [B.spawn + 1, 'confused'], [B.hands, 'worried'], [21, 'scared'], [B.face, 'deadpan']],
    eyes: [[0, [0, 0]], [B.chat, [-0.6, 0.5]], [B.chat + 1.5, [0, 0]], [B.hands, [0, 0.8]], [B.sign, [0, 0]]],
    extra: (t, p) => { if (t > B.hands && t < B.sign - 0.4) { p.rShP = 1.25; p.rShR = -0.25; p.rEl = 1.85; } return p; } });
  const p48 = new Actor(S.p48, { ground: S.ground, path: [[0, [9.5, -9.5]], [12.6, [9.5, -9.5]], [B.punch, [6.5, -7.6], 'inOut']], yaw: [[0, -0.6], [12.6, -2.0], [B.punch, -1.6]],
    acts: [[0, 'stand'], [B.spawn + 0.3, 'lookAround'], [12.6, 'walk'], [B.punch, 'punch', { rate: 3, sfx: 'punchWood' }]], expr: [[0, 'curious']] });
  function update(t) {
    S.reset(); S.light({ ...LIGHT.day, sunAngle: 0.8 + t * 0.01 }, t, { cloudSpeed: 1.5 });
    const st = hero.state(t); if (st.tilt > 0.5) st.shadow = 0; st.dark = smooth(prog(t, B.dark0, B.dark1)); S.hero.apply(st);
    const ps = p48.state(t); ps.visible = t > B.spawn; ps.scale = Ease.outBack(prog(t, B.spawn, B.spawn + 0.35)) || 0.001; S.p48.apply(ps);
    S.heroSign.update(t, st, HSIGN, t > B.sign - 0.1);
    S.birds.forEach((b, i) => { const a = t * (0.45 + i * 0.07) + i * 1.3; const r = 4 + i * 1.2; b.apply({ pos: [Math.cos(a) * r, 26 + i * 0.6, 3 + Math.sin(a) * r], yaw: -a, bank: 0.3, flap: t * 3 }); });
    S.glowParticles.add(burst({ t0: B.spawn - 0.6, pos: [9.5, S.ground(9.5, -9.5) + 1.2, -9.5], n: 50, colors: ['#ffffff', '#b8f0ff'], speed: 2.2, up: 1, gravity: 0, life: 0.6, size: 0.14, implode: true, seed: 2 }));
    S.glowParticles.add(burst({ t0: B.dark0, pos: off(st.pos, [0, 1.6, 0]), n: 60, colors: ['#000000', '#3a1d63', '#ffffff'], speed: 0.8, up: 0.6, gravity: -0.5, life: 8, size: 0.06, seed: 3 }));
    S.particles.add(motes({ center: [0.5, 22, 1], extent: [16, 5, 16], n: 50, colors: ['#fff6c8'], size: 0.04, alpha: 0.5, seed: 71 }));
    const H = head(st), P = st.pos; const sitH = [P[0], P[1] + 0.85, P[2]];
    const c = shot(t, [
      { t: [0, B.sit], pos: [[0.5, 21.6, -0.2], [0.5, 20.6, -0.25]], look: [[0.5, 18.85, -0.6], [0.5, 18.9, -0.6]], fov: [55, 42], ease: 'out' },
      { t: [B.sit, B.stand], pos: [() => off(sitH, [0.4, 0.1, 1.3]), () => off(sitH, [0.35, 0.1, 1.15])], look: () => sitH, fov: 42 },
      { t: [B.stand, B.spawn], pos: [() => off(H, [0.6, 0.2, 2.6]), () => off(H, [0.5, 0.2, 2.2])], look: () => off(H, [0, 0.2, 0]), fov: 46 },
      { t: [B.spawn, B.hands], pos: [() => off(P, [-1.6, 1.9, 1.6]), () => off(P, [-1.8, 2.0, 1.8])], look: [() => [8.0, 20.4, -8.5], () => [7.0, 20.4, -8.0]], fov: 50 },
      { t: [B.hands, B.sign], pos: [() => off(H, [0.8, -0.2, 0.9]), () => off(H, [0.7, -0.2, 0.8])], look: () => off(H, [-0.1, -0.5, 0.3]), fov: 46 },
      { t: [B.sign, B.face], pos: [() => off(H, [0.3, -0.1, 2.4]), () => off(H, [0.3, -0.1, 2.2])], look: () => off(H, [0, -0.45, 0]), fov: 46 },
      { t: [B.face, 40], pos: [() => off(H, [0, 0, 2.2]), () => off(H, [0, 0, 0.75])], look: () => H, fov: [40, 34], ease: 'in' },
    ]);
    W.cam.apply({ ...c, t, handheld: 0.01 });
    const post = { vignette: 0.45 + st.dark * 0.6, saturation: 1.1 - st.dark * 0.4 };
    if (t > B.black) post.fade = 1;
    return { stage: S, post, noSubs: t > B.black + 0.5 };
  }
  function cues() {
    return [{ t: 0.8, id: 'birds', gain: 0.6, dur: 15 }, { t: B.wake, id: 'gasp', gain: 0.7 }, { t: B.spawn - 0.6, id: 'spawn', gain: 0.8 }, ...p48.events(12, B.hands + 2, 'grass'),
      { t: B.dark0, id: 'enderAmbient', gain: 0.4 }, { t: B.sign, id: 'stinger', gain: 0.9 }, { t: B.tele, id: 'teleport', gain: 1 }, { t: 34.5, id: 'impactDeep', gain: 0.9 }];
  }
  return { update, cues, hero };
}
