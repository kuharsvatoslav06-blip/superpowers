// EP2 SCENE 7 — THE WATCHER SPEAKS. "I keep them."
import { Actor } from '../../engine/CharacterController.js';
import { shot } from '../../engine/CameraController.js';
import { burst, motes, swirl } from '../../engine/Particles.js';
import { prog, shakeEnv, smooth } from '../../engine/AnimationSystem.js';
import { L2 } from '../../story/ep2/stages.js';
import { talker, head, off } from '../util.js';

export const B7 = { dim: 1.0, arrive: 6.0, pan: 23.2, look: 31.0, nod: 38.6, sign: 39.6, count: 47.6 };
const B = B7;
export const WPOS = [5.0, 1, -5.0];
export const SIGNS7 = [[B.look, ['...']], [B.sign, ['I STOPPED', 'AT 99.', 'FOREVER.']]];

export default function s7(W) {
  const A = W.stages.archive;
  const hero = new Actor(A.hero, { ground: A.ground, talk: talker('s7'), blinkSeed: 1.4, path: [[0, [-3.6, 5.0]]], yaw: [[0, 2.5], [B.look, 2.5], [B.look + 0.4, -1.5], [B.count - 0.5, -1.5], [B.count, 2.5]],
    acts: [[0, 'idle'], [B.arrive, 'scared'], [18.4, 'gulp'], [21.4, 'scared'], [B.look, 'idle'], [33.4, 'shrug'], [37.5, 'idle'], [B.count, 'scared'], [51.4, 'panicRun', { inPlace: true, rate: 2.4 }]],
    expr: [[0, 'worried'], [B.arrive, 'terrified'], [18.4, 'scared'], [21.8, 'terrified'], [B.look, 'worried'], [33.4, 'curious'], [37.4, 'worried'], [43.4, 'scared'], [B.count, 'terrified'], [51.6, 'yell']],
    eyes: [[0, [0, 0]], [B.arrive, [0.3, -0.6]], [B.look, [0, 0]]], look: [[0, [0, 0]], [B.arrive, [0, -0.45]], [B.look, [0, 0]]] });
  const zero = new Actor(A.zero, { ground: A.ground, path: [[0, [-5.2, 4.2]]], yaw: [[0, 2.3], [B.look, 2.3], [B.look + 0.4, 1.4]], acts: [[0, 'holdSign']], expr: [[0, 'neutral']],
    extra: (t, p) => { if (t > B.look && t < B.sign) { p.lShP = 0.3; p.rShP = 0.3; p.headPitch = 0.35; } if (t > B.nod && t < B.nod + 0.8) p.headPitch += Math.sin((t - B.nod) * Math.PI * 2.5) * 0.35; return p; } });
  function update(t) {
    A.reset(); A.light(L2.archive, t, { sun: false });
    const dim = smooth(prog(t, B.dim, B.arrive)); A.lamps.forEach((L, i) => (L.intensity = 10 - dim * 7 + (t > B.arrive && t < B.arrive + 0.3 ? 20 : 0)));
    A.eerie.position.set(WPOS[0] - 2, 9, WPOS[2] + 3); A.eerie.intensity = 18 * dim;
    const st = hero.state(t); A.hero.apply(st); const zs = zero.state(t); zs.shadow = 0; A.zero.apply(zs); A.zero.root.visible = true;
    A.zeroSign.update(t, zs, SIGNS7, true);
    if (t > B.look && t < B.sign) { A.zeroSign.sign.group.position.y -= 0.5; A.zeroSign.sign.group.rotation.x = 0.8; }
    const tp = prog(t, B.arrive - 0.1, B.arrive + 0.15);
    A.watcher.apply({ visible: t > B.arrive - 0.1, pos: WPOS, yaw: Math.atan2(st.pos[0] - WPOS[0], st.pos[2] - WPOS[2]), scale: 3.2, rim: 0x2a1040, stretch: 1 - tp, opacity: smooth(tp), t, headPitch: 0.35, glow: 1.4 });
    A.bigTable.visible = true; A.heroLight.position.set(st.pos[0] + 1, 3.2, st.pos[2] - 1); A.heroLight.intensity = 5;
    A.glowParticles.add(swirl({ center: WPOS, radius: 3, height: 9, n: 120, colors: ['#c040ff', '#e070ff', '#ffffff'], size: 0.12, speed: 0.3, intensity: () => dim }));
    A.glowParticles.add(burst({ t0: B.arrive, pos: [WPOS[0], 5, WPOS[2]], n: 160, colors: ['#c040ff', '#e070ff', '#ffffff'], speed: 6, up: 1, gravity: 0, life: 1.0, size: 0.16, spread: 3, seed: 81 }));
    A.glowParticles.add(motes({ center: [0, 5, 0], extent: [24, 9, 24], n: 120, colors: ['#9ac4ff', '#b080ff'], size: 0.05, alpha: 0.5, seed: 8, speed: 0.3 }));
    const H = head(st), ZH = head(zs); const WH = [WPOS[0], 1 + 8.4, WPOS[2]];
    const c = shot(t, [
      { t: [0, B.arrive], pos: [[-1.0, 2.6, 9.5], [-1.5, 2.5, 9.0]], look: [() => off(st.pos, [1.5, 1.3, -2]), () => off(st.pos, [2.5, 1.8, -3])], fov: 55 },
      { t: [B.arrive, 9.2], pos: [[-2.2, 1.4, 6.6], [-2.4, 1.3, 7.0]], look: [[WPOS[0], 6, WPOS[2]], [WPOS[0], 8, WPOS[2]]], fov: [70, 64], shake: () => shakeEnv(t, [[B.arrive, 1.2, 0.8]]) },
      { t: [9.2, 15.5], pos: [[WPOS[0] - 6.5, 7.6, WPOS[2] + 6.5], [WPOS[0] - 4.6, 8.4, WPOS[2] + 4.6]], look: () => WH, fov: 45, ease: 'linear' },
      { t: [15.5, 18.4], pos: [() => off(H, [-1.0, 0.05, -1.0]), () => off(H, [-0.9, 0.05, -0.9])], look: () => H, fov: 40 },
      { t: [18.4, 21.5], pos: [() => off(st.pos, [-2.0, 1.0, 2.2]), () => off(st.pos, [-2.1, 1.0, 2.3])], look: [() => off(WH, [0, -3, 0]), () => off(WH, [0, -2, 0])], fov: 62 },
      { t: [21.5, B.pan], pos: [[WPOS[0] - 3.5, 8.6, WPOS[2] + 3.5], [WPOS[0] - 3.2, 8.7, WPOS[2] + 3.2]], look: () => WH, fov: 38 },
      { t: [B.pan, B.look], pos: [[-6.6, 8.7, -26], [-6.6, 8.7, 18]], look: [[-9.5, 8.3, -24], [-9.5, 8.3, 20]], fov: 40, ease: 'linear' },
      { t: [B.look, B.sign + 0.2], pos: [() => off(H, [0.6, 0.1, 1.4]), () => off(H, [0.5, 0.1, 1.2])], look: () => off(H, [-0.8, -0.2, -0.3]), fov: 48 },
      { t: [B.sign + 0.2, 43.4], pos: [() => off(ZH, [1.4, -0.1, 1.0]), () => off(ZH, [1.2, -0.1, 0.9])], look: () => off(ZH, [0, -0.45, 0]), fov: 44 },
      { t: [43.4, B.count], pos: [[WPOS[0] - 5.5, 6.0, WPOS[2] + 5.5], [WPOS[0] - 5.0, 6.6, WPOS[2] + 5.0]], look: () => WH, fov: 46 },
      { t: [B.count, 56], pos: [() => off(H, [1.2, 0.0, -1.0]), () => off(H, [0.9, 0.0, -0.8])], look: () => H, fov: 44, shake: () => 0.05 + shakeEnv(t, [[48.9, 0.2, 0.2], [51.0, 0.2, 0.2], [53.1, 0.2, 0.2]]) },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 1.0 + dim * 0.3, saturation: 1.0, tint: [1.0, 0.85, 1.15], tintAmt: 0.1 * dim };
    if (t > B.arrive && t < B.arrive + 0.15) post.flash = 0.7, post.flashColor = [0.8, 0.5, 1];
    if (t > 9.2 && t < 22.5) post.letterbox = 1;
    return { stage: A, post };
  }
  function cues() {
    return [{ t: B.dim, id: 'enderAmbient', gain: 0.5 }, { t: B.arrive, id: 'bigTeleport', gain: 1 }, { t: B.arrive + 0.1, id: 'impactDeep', gain: 0.8 }, { t: 31.4, id: 'signFlip', gain: 0.4 }, { t: B.sign, id: 'signFlip', gain: 0.7 }];
  }
  return { update, cues, hero };
}
