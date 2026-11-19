// SCENE 7 — THE TWIST. A normal world, a moving sun, relief... and the book is still there.
import { Actor } from '../engine/CharacterController.js';
import { shot } from '../engine/CameraController.js';
import { motes, burst } from '../engine/Particles.js';
import { Ease, clamp, prog, smooth, lerp, TAU } from '../engine/AnimationSystem.js';
import { LIGHT } from '../engine/EnvironmentManager.js';
import { talker, head, off } from './util.js';

export const BEATS = { wake: 2.4, sitUp: 3.4, sky: 4.2, stand: 8.2, fall: 9.4, sit: 12.8, inv: 13.6, book: 21.6, back: 29.4, ender: 30.6, sense: 33.0, black: 35.0, tele: 35.6, end: 37.5 };
const B = BEATS;
const LIE = -0.71;

export default function s7(W) {
  const S = W.stages.fresh; const g = S.ground;
  const hero = new Actor(S.hero, {
    ground: g, talk: talker('s7'), blinkSeed: 2.9,
    path: [[0, [0.5, 0.5]]],
    yaw: [[0, 0]],
    acts: [[0, 'sleep'], [B.sitUp, 'sit'], [B.stand - 0.3, 'stand'], [B.fall, 'relief'], [B.sit, 'sit'], [B.inv, 'sit'], [B.back, 'sit']],
    expr: [[0, 'sleep'], [B.wake, 'confused'], [B.sky, 'curious'], [6.0, 'happy'], [B.fall, 'relieved'], [B.sit, 'happy'], [B.inv + 1.5, 'curious'], [15.3, 'worried'], [B.back, 'worried'], [B.sense, 'scared'], [34.0, 'terrified']],
    eyes: [[0, [0, 0]], [B.sky, [0, -0.9]], [B.stand, [0, 0]], [B.back, [0, 0.8]], [B.sense, [0, 0.8]], [B.sense + 0.4, [0.9, 0]], [34.2, [0, 0]]],
    look: [[0, [0, 0]], [B.sky, [0, -0.6]], [B.stand - 0.5, [0, -0.6]], [B.stand, [0, 0]], [B.back, [0, 0.35]], [B.sense, [0, 0.35]], [B.sense + 0.5, [0.25, 0.0]]],
    tilt: [[0, Math.PI / 2], [B.sitUp, Math.PI / 2], [B.sitUp + 0.6, 0, 'out'], [B.fall, 0], [B.fall + 0.7, Math.PI / 2, Ease.outBounce], [B.sit, Math.PI / 2], [B.sit + 0.6, 0, 'out']],
    yOff: [[0, LIE], [B.sitUp, LIE], [B.sitUp + 0.6, 0, 'out'], [B.fall, 0], [B.fall + 0.7, LIE, Ease.outBounce], [B.sit, LIE], [B.sit + 0.6, 0, 'out']],
    items: [[0, {}], [B.back - 0.2, { r: 'book' }]],
    extra: (t, p) => { if (t > B.back) { p.lShP = 0.95; p.rShP = 0.95; p.lEl = 1.5; p.rEl = 1.5; p.lShR = -0.05; p.rShR = -0.05; } return p; },
  });

  function update(t) {
    S.reset();
    const L = { ...LIGHT.day, sunAngle: lerp(0.35, 1.2, Ease.inOut(prog(t, B.sky, B.stand))) + Math.max(0, t - B.stand) * 0.004 };
    S.light(L, t, { cloudSpeed: 1.5 + (t > B.sky && t < B.stand ? 6 : 0) });
    const st = hero.state(t); if (st.tilt > 0.5) st.shadow = 0; S.hero.apply(st);
    // birds circling
    S.birds.forEach((b, i) => { const a = t * (0.45 + i * 0.07) + i * 1.3; const r = 4 + i * 1.2; b.apply({ pos: [Math.cos(a) * r, 26 + i * 0.6 + Math.sin(t + i) * 0.4, 3 + Math.sin(a) * r], yaw: -a, bank: 0.3, flap: t * (3 + i * 0.4) }); });
    // the ender-creature appears behind him. No sound.
    const eon = t > B.ender && t < B.black;
    S.ender.apply({ visible: eon, pos: [0.5, g(0.5, -1.8), -1.8], yaw: 0, opacity: smooth(prog(t, B.ender, B.ender + 0.35)), t, headPitch: 0.45 });
    S.glowParticles.add(burst({ t0: B.ender, pos: [0.5, g(0.5, -1.8) + 1.5, -1.8], n: 30, colors: ['#c040ff', '#e070ff'], speed: 1.2, up: 0.5, gravity: 0, life: 0.8, size: 0.08, seed: 170 }));
    S.particles.add(motes({ center: [0.5, 22, 1], extent: [16, 5, 16], n: 50, colors: ['#fff6c8', '#ffffff'], size: 0.04, alpha: 0.5, seed: 71 }));
    // camera
    const H = head(st); const P = st.pos; const sitH = [P[0], P[1] + 1.0, P[2]];
    const c = shot(t, [
      { t: [0, B.sitUp], pos: [[0.5, 23.5, 0.8], [0.5, 21.9, 1.0]], look: [[0.5, 19.5, 0.5], [0.4, 19.6, 0.2]], fov: [60, 45], ease: 'out' },
      { t: [B.sitUp, B.sky], pos: [() => off(sitH, [0.4, 0.1, 1.4]), () => off(sitH, [0.35, 0.1, 1.2])], look: () => sitH, fov: 42 },
      { t: [B.sky, B.stand], pos: [[1.2, 19.4, 2.6], [1.0, 19.4, 2.4]], look: [[6.0, 25.0, 6.5], [5.0, 28.5, 5.0]], fov: 75, ease: 'linear' },
      { t: [B.stand, B.sit], pos: [[3.5, 20.4, 3.4], [3.2, 22.2, 2.8]], look: [() => off(P, [0, 0.9, 0]), () => off(P, [0, 0.4, 0])], fov: 52 },
      { t: [B.sit, B.back], pos: [() => off(sitH, [0.5, 0.1, 1.6]), () => off(sitH, [0.4, 0.1, 1.4])], look: () => sitH, fov: 42 },
      { t: [B.back, B.black], pos: [() => off(sitH, [0, 0.55, 3.8]), () => off(sitH, [0, 0.12, 0.85])], look: [() => off(sitH, [0, 0.9, -1.4]), () => sitH], fov: [36, 62], ease: 'in' },
    ]);
    W.cam.apply({ ...c, t, handheld: 0.01 });
    const post = { vignette: t > B.inv ? 0.8 : 0.45, saturation: t > B.back ? 0.85 : 1.1 };
    if (t > B.black) post.fade = 1;
    return { stage: S, post, noSubs: t > B.black + 0.5 };
  }
  function cues() {
    return [
      { t: 0.8, id: 'birds', gain: 0.6, dur: 14 }, { t: B.wake, id: 'blink', gain: 0.4 }, { t: B.fall + 0.35, id: 'bodyFall', gain: 0.8 },
      { t: B.tele, id: 'teleport', gain: 1.0 }, { t: B.end, id: 'impactDeep', gain: 0.9 },
    ];
  }
  void clamp; void TAU;
  return { update, cues, hero };
}
