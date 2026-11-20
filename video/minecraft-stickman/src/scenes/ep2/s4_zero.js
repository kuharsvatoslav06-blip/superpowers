// EP2 SCENE 4 — PLAYER ZERO. A campfire, a sign guy, and something standing at the end of the tunnel.
import { Actor } from '../../engine/CharacterController.js';
import { shot } from '../../engine/CameraController.js';
import { motes, swirl } from '../../engine/Particles.js';
import { prog, smooth } from '../../engine/AnimationSystem.js';
import { LIGHT } from '../../engine/EnvironmentManager.js';
import { caveZ } from '../../story/stages.js';
import { talker, head, off } from '../util.js';

const B = { zero: 7.4, hi: 9.0, turn: 10.0, welcome: 17.4, qa: 20.6, collects: 44.0, watcher: 47.0 };
export const SIGNS4 = [[B.hi, ['HI.']], [B.welcome, ["YOU'RE", 'WELCOME.']], [22.6, ["THE ARCHIVE'S", 'WAITING ROOM.']], [27.6, ['BECAUSE', 'YOU ARE.']], [32.6, ['PLAYER 1.']], [37.6, ['YOU ARE 47.']], [B.collects, ['HE COLLECTS', 'US.']]];
const ZC = caveZ(-20) + 0.5;

export default function s4(W) {
  const C = W.stages.cave;
  const hero = new Actor(C.hero, {
    ground: C.ground, talk: talker('s4'), blinkSeed: 2.2,
    path: [[0, [-18.3, ZC]]], yaw: [[0, -Math.PI / 2], [B.turn, -Math.PI / 2], [B.turn + 0.5, Math.PI / 2 - 0.2]],
    acts: [[0, 'sit'], [B.turn + 0.6, 'stand'], [11.4, 'point'], [16.6, 'idle'], [18.4, 'facepalm'], [20.0, 'shrug'], [24.0, 'idle'], [25.4, 'shrug'], [29, 'idle'], [30.4, 'point'], [32, 'idle'], [35.4, 'shrug'], [38, 'scared'], [B.collects, 'gulp']],
    expr: [[0, 'neutral'], [B.hi, 'shocked'], [11.4, 'yell'], [B.welcome, 'annoyed'], [B.qa, 'curious'], [24, 'confused'], [29, 'worried'], [34, 'curious'], [38.4, 'shocked'], [B.collects, 'scared']],
    items: [[0, { r: 'book' }], [B.turn, {}]],
    extra: (t, p) => { if (t < B.turn) { p.lShP = 0.95; p.rShP = 0.95; p.lEl = 1.5; p.rEl = 1.5; } return p; },
  });
  const zero = new Actor(C.shadowMan, { ground: C.ground, path: [[0, [-13.5, ZC]], [B.zero, [-13.5, ZC]], [B.hi - 0.3, [-16.3, ZC + 0.3], 'out']], yaw: [[0, -Math.PI / 2]],
    acts: [[0, 'walk'], [B.hi - 0.3, 'holdSign'], [40, 'holdSign']], expr: [[0, 'neutral']], opacity: [[B.zero, 0], [B.zero + 1.0, 1]] });
  function update(t) {
    C.reset(); C.light(LIGHT.cave, t);
    for (const tr of C.torches) tr.update(t, 0.6);
    for (const m of C.passageBlocks) m.visible = true;
    C.camp.visible = true; C.fireLight.intensity = 9 * (0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 7)); C.fireGlow.scale.setScalar(1.4 + 0.2 * Math.sin(t * 9));
    const st = hero.state(t); C.hero.apply(st);
    const zs = zero.state(t); zs.visible = t > B.zero; zs.shadow = 0; C.shadowMan.apply(zs);
    C.zeroSign.update(t, zs, SIGNS4, t > B.hi - 0.2);
    C.ender.apply({ visible: t > B.watcher - 0.5 && t < 53, pos: [-7.5, 5, caveZ(-7.5) + 0.5], yaw: -Math.PI / 2, opacity: smooth(prog(t, B.watcher - 0.5, B.watcher + 0.5)), t, headPitch: 0.1 });
    C.glowParticles.add(swirl({ center: [-19.5, 5.2, ZC], radius: 0.25, height: 1.6, n: 30, colors: ['#ffb040', '#ff7020', '#fff0a0'], size: 0.06, speed: 0.9, intensity: () => 1 }));
    C.particles.add(motes({ center: [-18, 7, ZC], extent: [10, 3, 3], n: 50, colors: ['#bfae90'], size: 0.03, alpha: 0.35, seed: 4 }));
    const H = head(st), ZH = head(zs);
    const c = shot(t, [
      { t: [0, B.zero], pos: [[-21.8, 6.4, ZC + 1.1], [-21.6, 6.3, ZC + 0.9]], look: [() => off(st.pos, [0, 0.6, 0]), () => off(st.pos, [0, 0.6, 0])], fov: 50 },
      { t: [B.zero, B.turn], pos: [[-20.9, 5.9, ZC - 0.9], [-20.9, 5.9, ZC - 0.9]], look: [-16.5, 6.3, ZC], fov: 48 },
      { t: [B.turn, B.welcome], pos: [() => off(H, [1.0, 0.1, -1.1]), () => off(H, [0.9, 0.1, -1.0])], look: () => off(H, [0.6, -0.1, 0]), fov: 48 },
      { t: [B.welcome, B.qa], pos: [() => off(ZH, [-1.7, -0.1, -0.5]), () => off(ZH, [-1.6, -0.1, -0.5])], look: () => off(ZH, [0, -0.45, 0]), fov: 46 },
      { t: [B.qa, 40], pos: [(tt) => ((tt - B.qa) % 5 < 2 ? off(H, [1.0, 0.05, 0.9]) : off(ZH, [-1.6, -0.2, 0.6])), (tt) => ((tt - B.qa) % 5 < 2 ? off(H, [1.0, 0.05, 0.9]) : off(ZH, [-1.6, -0.2, 0.6]))],
        look: [(tt) => ((tt - B.qa) % 5 < 2 ? H : off(ZH, [0, -0.45, 0])), (tt) => ((tt - B.qa) % 5 < 2 ? H : off(ZH, [0, -0.45, 0]))], fov: 44 },
      { t: [40, B.watcher], pos: [() => off(ZH, [-2.4, -0.2, 0.2]), () => off(ZH, [-1.3, -0.25, 0.1])], look: () => off(ZH, [0, -0.4, 0]), fov: 42, ease: 'linear' },
      { t: [B.watcher, 58], pos: [[-23.5, 7.6, caveZ(-23) + 1.1], [-23.7, 7.6, caveZ(-23) + 1.1]], look: [-8, 7.6, caveZ(-8) + 0.5], fov: 42 },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 1.0, saturation: 0.95, grain: 0.02 };
    if (t > 40) post.vignette = 1.3;
    if (t > B.watcher) post.letterbox = 1;
    return { stage: C, post };
  }
  function cues() {
    return [{ t: 0, id: 'campfire', gain: 0.7, dur: 58 }, { t: B.zero, id: 'enderAmbient', gain: 0.3 }, ...SIGNS4.map(([t]) => ({ t, id: 'signFlip', gain: 0.7 })), { t: B.hi, id: 'stinger', gain: 0.5 }, { t: B.watcher, id: 'heartbeat', gain: 0.6 }, { t: B.watcher + 0.8, id: 'heartbeat', gain: 0.7 }, { t: B.watcher + 1.6, id: 'heartbeat', gain: 0.8 }];
  }
  return { update, cues, hero };
}
