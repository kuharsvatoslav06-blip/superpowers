// EP2 SCENE 1 — THE COPY. Same world, same tree... everything is labeled (COPY).
import { Actor } from '../../engine/CharacterController.js';
import { shot } from '../../engine/CameraController.js';
import { burst, motes } from '../../engine/Particles.js';
import { Ease, prog, shakeEnv, smooth, lerp } from '../../engine/AnimationSystem.js';
import { LIGHT } from '../../engine/EnvironmentManager.js';
import { talker, head, off } from '../util.js';

const B = { gasp: 1.6, sit: 2.4, stand: 3.6, walk: 9.6, wave: 12.4, punch: 14.4, logGone: 17.6, copy: 19.6, tag: 23.6, lawsuit: 25.6, stroll: 30.0, lie: 34.0, clouds: 38.6, shock: 40.2 };
const LIE = -0.71;

export default function s1(W) {
  const S = W.stages.over;
  const hero = new Actor(S.hero, {
    ground: S.ground, talk: talker('s1'), blinkSeed: 0.4,
    path: [[0, [0.5, 0.5]], [B.walk, [0.5, 0.5]], [12.2, [3.5, 1.3], 'inOut'], [B.stroll, [3.5, 1.3]], [33.6, [0.8, -2.2], 'inOut'], [46, [0.8, -2.2]]],
    yaw: [[0, 0], [B.sit, 0], [B.stand, 0.6], [B.walk, 0.9], [12.2, 0], [B.copy, 0], [B.lawsuit, -0.6], [B.stroll, -0.6], [30.4, -2.4], [33.6, -2.4], [B.lie, 0.4], [46, 0.4]],
    acts: [[0, 'sleep'], [B.sit, 'sit'], [B.stand, 'stand'], [4.2, 'lookAround'], [B.walk, 'walk'], [B.wave, 'wave'], [B.punch, 'punch', { rate: 3, sfx: 'punchWood' }], [B.logGone, 'idle'],
      [B.copy, 'shrug'], [21.0, 'idle'], [B.lawsuit, 'handsOnHips'], [B.stroll, 'walk'], [33.6, 'idle'], [B.lie, 'sleep'], [B.shock, 'sit']],
    tilt: [[0, Math.PI / 2], [B.sit, Math.PI / 2], [B.sit + 0.5, 0, 'out'], [B.lie - 0.2, 0], [B.lie + 0.6, Math.PI / 2, 'out'], [B.shock, Math.PI / 2], [B.shock + 0.35, 0, 'out']],
    yOff: [[0, LIE], [B.sit, LIE], [B.sit + 0.5, 0, 'out'], [B.lie - 0.2, 0], [B.lie + 0.6, LIE, 'out'], [B.shock, LIE], [B.shock + 0.35, 0, 'out']],
    expr: [[0, 'sleep'], [B.gasp, 'shocked'], [B.stand, 'curious'], [8.0, 'deadpan'], [B.walk, 'neutral'], [B.wave, 'happy'], [B.punch, 'determined'], [B.logGone, 'curious'], [B.copy, 'confused'],
      [B.tag, 'shocked'], [B.lawsuit, 'deadpan'], [B.stroll, 'happy'], [B.lie, 'relieved'], [B.clouds + 0.6, 'curious'], [B.shock, 'shocked'], [42.5, 'scared']],
    eyes: [[0, [0, 0]], [B.copy, [0.3, 0.7]], [B.tag, [0, -0.9]], [B.lawsuit, [0, 0]], [B.shock, [0, -0.8]], [43, [0, 0]]],
    look: [[0, [0, 0]], [B.copy, [0, 0.4]], [B.tag, [0, -0.4]], [B.lawsuit, [0, 0]], [B.lawsuit + 0.4, [-0.7, 0]], [29.5, [-0.7, 0]], [B.stroll, [0, 0]], [B.shock, [0, -0.6]], [43, [0, -0.3]]],
    items: [[0, {}], [B.logGone + 0.6, { r: 'log' }], [B.stroll, {}]],
    jumps: [[B.punch + 0.6, 0.4, 0.6], [B.punch + 1.9, 0.4, 0.6]],
    extra: (t, p) => { if (t > B.punch && t < B.logGone) { p.rShP += 0.9; p.headPitch -= 0.4; } return p; },
  });

  function update(t) {
    S.reset();
    const L = { ...LIGHT.day, sunAngle: 0.75 + t * 0.006 };
    S.light(L, t, { cloudSpeed: 2 });
    const st = hero.state(t); if (st.tilt > 0.5) st.shadow = 0; S.hero.apply(st);
    for (const p of Object.values(S.houseParts)) p.visible = false; S.door.group.visible = false; S.shutter.visible = false; S.bed.group.visible = false; S.houseTorch.update(t, 0);
    S.logBlock.visible = false; S.punchTree.userData.logs.visible = t < B.logGone;
    if (t > B.logGone && t < B.logGone + 0.6) { const q = prog(t, B.logGone, B.logGone + 0.6); const to = off(st.pos, [0, 0.9, 0]);
      S.dropLog.visible = true; S.dropLog.position.set(lerp(3.5, to[0], Ease.in(q)), lerp(23.5, to[1], q), lerp(2.5, to[2], Ease.in(q))); S.dropLog.rotation.y = t * 5; }
    // the name tag
    const tg = Ease.outBack(prog(t, B.tag, B.tag + 0.35)); S.nameTag.visible = t > B.tag; S.nameTag.position.set(st.pos[0], st.pos[1] + 2.35 + st.pose.bob, st.pos[2]); S.nameTag.scale.set(1.7 * tg, 0.32 * tg, 1);
    if (st.tilt > 0.5) S.nameTag.position.y -= 1.5;
    S.particles.add(burst({ t0: B.logGone, pos: [3.5, 23.5, 2.5], n: 40, colors: ['#6b5030', '#b08d59'], speed: 2.2, up: 2, gravity: 10, life: 0.9, size: 0.13, seed: 5 }));
    S.glowParticles.add(burst({ t0: B.tag, pos: [st.pos[0], st.pos[1] + 2.35, st.pos[2]], n: 30, colors: ['#ffffff', '#ff4a4a'], speed: 1.4, up: 0.3, gravity: 0, life: 0.6, size: 0.08, seed: 6 }));
    S.glowParticles.add(motes({ center: [2, 23, 1], extent: [16, 5, 16], n: 40, colors: ['#fff6c8'], size: 0.04, alpha: 0.35, seed: 9 }));

    const H = head(st); const P = st.pos; const sitH = [P[0], P[1] + 0.85, P[2]];
    const c = shot(t, [
      { t: [0, B.sit], pos: [[0.5, 23.0, -0.2], [0.5, 21.9, -0.25]], look: [[0.5, 20.2, -0.55], [0.5, 20.25, -0.6]], fov: [55, 42], ease: 'out' },
      { t: [B.sit, B.stand + 0.3], pos: [() => off(sitH, [0.9, 0.05, 1.2]), () => off(sitH, [0.8, 0.05, 1.05])], look: () => sitH, fov: 42 },
      { t: [B.stand + 0.3, B.walk], pos: [(tt) => [0.5 + Math.sin(-2.6 + (tt - 3.9) * 0.18) * 7, 24 - (tt - 3.9) * 0.15, 0.5 + Math.cos(-2.6 + (tt - 3.9) * 0.18) * 7], (tt) => [0.5 + Math.sin(-2.6 + (tt - 3.9) * 0.18) * 7, 24 - (tt - 3.9) * 0.15, 0.5 + Math.cos(-2.6 + (tt - 3.9) * 0.18) * 7]], look: [2, 22.6, 1.5], fov: 55, ease: 'linear' },
      { t: [B.walk, B.punch], pos: [[5.6, 22.4, -1.6], [5.3, 22.4, -1.2]], look: [() => off(P, [0, 1.4, 0.4]), () => off(P, [0, 1.6, 0.4])], fov: 50 },
      { t: [B.punch, B.copy], pos: [[6.0, 21.6, 0.2], [5.8, 21.6, 0.0]], look: [[3.5, 23.0, 2.3], [3.5, 23.4, 2.3]], fov: 58, shake: () => shakeEnv(t, [[B.logGone, 0.5, 0.3]]) },
      { t: [B.copy, B.tag], pos: [() => off(H, [-0.5, 0, 1.3]), () => off(H, [-0.45, 0, 1.15])], look: () => H, fov: 40 },
      { t: [B.tag, B.lawsuit], pos: [() => off(H, [-1.2, 0.1, 2.6]), () => off(H, [-1.6, 0.5, 3.8])], look: () => off(H, [0, 0.35, 0]), fov: 46, ease: 'out3' },
      { t: [B.lawsuit, B.stroll], pos: [() => off(H, [-1.0, 0, 1.1]), () => off(H, [-0.85, 0, 0.95])], look: () => H, fov: 42 },
      { t: [B.stroll, B.lie + 0.6], pos: [[5.5, 23.4, -4.5], [4.5, 23.0, -5.0]], look: [() => off(P, [0, 1.1, 0]), () => off(P, [0, 0.6, 0])], fov: 50 },
      { t: [B.lie + 0.6, B.clouds], pos: [[0.9, 24.6, -1.2], [0.9, 24.2, -1.6]], look: [() => off(P, [0, 0, 0]), () => off(P, [0, 0, -0.3])], fov: 45 },
      { t: [B.clouds, 43.0], pos: [[1.2, 21.4, -1.4], [1.2, 21.4, -1.6]], look: [[1.2, 40, 8], [1.2, 42, 9]], fov: 70, ease: 'linear' },
      { t: [43.0, 46.0], pos: [() => off(sitH, [0.4, 0.1, 1.2]), () => off(sitH, [0.3, 0.05, 0.9])], look: () => sitH, fov: 40, ease: 'in' },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 0.5, saturation: 1.1, fade: 1 - smooth(prog(t, 0.6, 1.8)) };
    if (t > B.clouds + 1) { post.saturation = 0.85; post.vignette = 1.0; }
    return { stage: S, post };
  }
  function cues() {
    return [{ t: 0.3, id: 'teleport', gain: 0.7 }, { t: B.gasp, id: 'gasp', gain: 0.9 }, ...hero.events(0, 46, 'grass'),
      { t: B.logGone, id: 'breakWood', gain: 1 }, { t: B.logGone + 0.6, id: 'pop', gain: 0.8 }, { t: B.tag, id: 'stamp', gain: 0.9 }, { t: B.shock, id: 'impact', gain: 0.6 }];
  }
  return { update, cues, hero };
}
