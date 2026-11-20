// EP2 SCENE 8 — THE CHOICE. One item, one player. "WORTH IT."
import { Actor } from '../../engine/CharacterController.js';
import { shot } from '../../engine/CameraController.js';
import { burst, motes, swirl } from '../../engine/Particles.js';
import { Ease, prog, shakeEnv, smooth, lerp } from '../../engine/AnimationSystem.js';
import { L2 } from '../../story/ep2/stages.js';
import { WPOS } from './s7_watcher.js';
import { talker, head, off } from '../util.js';

const B = { run: 0.4, place: 4.8, one: 10.6, grab: 13.6, shake: 18.6, copy: 19.8, close: 25.0, shove: 28.8, flash: 29.9, worth: 30.3 };
const SIGNS8 = [[0, ['']], [B.one, ['ONLY ONE ITEM.', 'ONLY ONE PLAYER.']], [B.copy, ["I'M A COPY TOO.", "YOU'RE THE ONLY", 'ORIGINAL LEFT.']], [B.worth, ['WORTH IT.']]];

export default function s8(W) {
  const A = W.stages.archive;
  const hero = new Actor(A.hero, { ground: A.ground, talk: talker('s8'), blinkSeed: 0.3,
    path: [[0, [-3.6, 5.0]], [B.run, [-3.6, 5.0]], [4.2, [-2.6, 3.0], 'inOut'], [B.grab - 0.5, [-2.6, 3.0]], [B.grab, [-2.9, 2.1]], [B.shove, [-2.9, 2.1]], [B.flash, [-1.4, 1.2], 'out']],
    yaw: [[0, 2.5], [B.run, 2.5], [1.0, 2.6], [B.grab - 0.5, 2.6], [B.grab, 1.0], [B.close, 1.0], [B.close + 0.5, 2.3], [B.shove, 1.0]],
    acts: [[0, 'scared'], [B.run, 'run', { stride: 1.4 }], [4.2, 'idle'], [B.grab, 'place', { rate: 1, sfx: null }], [14.4, 'point'], [17.6, 'idle'], [B.copy + 2, 'scared'], [B.close, 'shield'], [B.shove, 'cower']],
    expr: [[0, 'scared'], [B.place, 'curious'], [B.one, 'worried'], [B.grab, 'determined'], [14.6, 'yell'], [B.copy + 1.5, 'shocked'], [B.copy + 3, 'pain'], [B.close, 'terrified']],
    jumps: [[B.shove + 0.1, 0.9, 0.9]] });
  const zero = new Actor(A.zero, { ground: A.ground, path: [[0, [-5.2, 4.2]], [B.run, [-5.2, 4.2]], [3.8, [-1.9, 1.7], 'inOut'], [40, [-1.9, 1.7]]],
    yaw: [[0, 2.3], [B.run, 2.3], [3.8, 2.4], [B.grab, 2.4], [B.grab + 0.5, -1.0], [B.close, -1.0], [B.shove - 0.3, -1.3], [B.worth - 0.2, -1.3], [B.worth, -0.86]],
    acts: [[0, 'holdSign'], [B.run, 'run', { stride: 1.4 }], [3.8, 'idle'], [B.place, 'place', { rate: 1, sfx: null }], [B.place + 1, 'holdSign'], [B.shove, 'punch', { rate: 1.5, sfx: null }], [B.shove + 0.6, 'holdSign']],
    expr: [[0, 'neutral']], extra: (t, p) => { if (t > B.shake && t < B.shake + 1) p.headYaw += Math.sin((t - B.shake) * Math.PI * 4) * 0.4; return p; } });
  function update(t) {
    A.reset(); A.light(L2.archive, t, { sun: false });
    A.lamps.forEach((L, i) => (L.intensity = 3 + (i === 3 && t > B.place ? 10 : 0))); A.eerie.position.set(WPOS[0] - 2, 9, WPOS[2] + 3); A.eerie.intensity = 18;
    const st = hero.state(t); A.hero.apply(st); const zs = zero.state(t); zs.shadow = 0; A.zero.apply(zs); A.zero.root.visible = true;
    A.zeroSign.update(t, zs, SIGNS8, (t > B.one - 0.1 && t < B.shove) || t > B.worth - 0.1);
    A.bigTable.visible = true; A.tableGlow.visible = t > B.place && t < B.flash + 0.2; A.tableGlow.material.opacity = 0.5 + 0.3 * Math.sin(t * 6); A.tableGlow.scale.setScalar(5 + prog(t, B.shove, B.flash) * 30);
    const wk = Ease.inOut(prog(t, B.close, B.shove)); const wp = [lerp(WPOS[0], 2.4, wk), 1, lerp(WPOS[2], -2.6, wk)];
    A.watcher.apply({ visible: true, pos: wp, yaw: Math.atan2(st.pos[0] - wp[0], st.pos[2] - wp[2]), scale: 3.2, rim: 0x2a1040, t, headPitch: 0.4 + wk * 0.2, glow: 1.4 });
    A.heroLight.position.set(st.pos[0] + 1, 3.2, st.pos[2] - 1); A.heroLight.intensity = 5;
    A.glowParticles.add(swirl({ center: [0, 4, 0], radius: 1.6, height: 4, n: 80, colors: ['#ffffff', '#d38cff'], size: 0.1, speed: 0.7, intensity: () => (t > B.place ? 1 : 0) }));
    A.glowParticles.add(swirl({ center: wp, radius: 3, height: 9, n: 100, colors: ['#c040ff', '#e070ff'], size: 0.12, speed: 0.3, intensity: () => 1 }));
    A.glowParticles.add(burst({ t0: B.place + 0.3, pos: [0, 4.6, 0], n: 60, colors: ['#d38cff', '#ffffff'], speed: 2, up: 1.5, gravity: 0, life: 1.0, size: 0.1, seed: 91 }));
    A.glowParticles.add(motes({ center: [0, 5, 0], extent: [24, 9, 24], n: 100, colors: ['#9ac4ff', '#b080ff'], size: 0.05, alpha: 0.5, seed: 8, speed: 0.3 }));
    const H = head(st), ZH = head(zs);
    const c = shot(t, [
      { t: [0, B.place + 0.5], pos: [[-7.5, 3.6, 7.5], [-6.0, 4.4, 6.0]], look: [[-1.5, 2.6, 1.5], [-0.8, 3.0, 0.8]], fov: 55, shake: 0.05 },
      { t: [B.place + 0.5, B.one], pos: [[-3.2, 5.6, 2.6], [-3.0, 5.8, 2.4]], look: [0, 4.2, 0], fov: 48 },
      { t: [B.one, B.grab], pos: [() => off(ZH, [1.25, -0.15, -1.35]), () => off(ZH, [1.15, -0.15, -1.25])], look: () => off(ZH, [0, -0.45, 0]), fov: 46 },
      { t: [B.grab, B.copy], pos: [() => off(H, [-1.2, 0.05, 1.1]), () => off(H, [-1.0, 0.05, 1.0])], look: () => off(H, [0.4, -0.1, -0.2]), fov: 46 },
      { t: [B.copy, B.close], pos: [() => off(ZH, [-0.75, -0.15, 1.7]), () => off(ZH, [-0.65, -0.15, 1.5])], look: () => off(ZH, [0, -0.45, 0]), fov: 44, ease: 'linear' },
      { t: [B.close, B.shove], pos: [[-6.5, 2.0, 6.5], [-6.0, 2.0, 6.0]], look: [[2.0, 7.0, -2.0], [1.0, 6.0, -1.0]], fov: 62, shake: () => 0.05 + shakeEnv(t, [[26.5, 0.4, 0.4], [27.6, 0.4, 0.4]]) },
      { t: [B.shove, B.flash], pos: [[-4.5, 3.0, 3.5], [-4.6, 3.0, 3.6]], look: [() => off(st.pos, [0, 1, 0]), () => [0, 4, 0]], fov: 55, shake: 0.2 },
      { t: [B.flash, 36], pos: [() => off(ZH, [-1.5, -0.25, 1.3]), () => off(ZH, [-1.65, -0.15, 1.45])], look: [() => off(ZH, [1.2, -0.1, -1.2]), () => off(ZH, [1.2, 0.2, -1.2])], fov: 56 },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 1.2, saturation: 1.0, tint: [1.0, 0.85, 1.15], tintAmt: 0.1 };
    if (t > B.shove) post.flash = smooth(prog(t, B.shove + 0.6, B.flash));
    if (t > B.flash) { post.flash = 1 - smooth(prog(t, B.flash + 0.3, B.flash + 1.4)) * 0.93; post.saturation = 0.6; }
    return { stage: A, post, noSubs: t > B.flash };
  }
  function cues() {
    return [...hero.events(0, B.flash, 'stone'), { t: B.place, id: 'place', gain: 1 }, { t: B.place + 0.3, id: 'portalIgnite', gain: 0.7 }, ...SIGNS8.slice(1).map(([t]) => ({ t, id: 'signFlip', gain: 0.7 })),
      { t: 26.5, id: 'land', gain: 0.9 }, { t: 27.6, id: 'land', gain: 1 }, { t: B.shove + 0.2, id: 'whoosh', gain: 0.8 }, { t: B.flash, id: 'flashBoom', gain: 1 }, { t: B.flash + 0.2, id: 'ringing', gain: 0.4, dur: 5 }];
  }
  return { update, cues, hero };
}
