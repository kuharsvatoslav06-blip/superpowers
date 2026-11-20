// EP2 SCENE 5 — THE WAY DOWN. The ORIGINAL pickaxe, digging through bedrock, the floating spiral, Glitchers, "LET GO."
import { Actor } from '../../engine/CharacterController.js';
import { shot } from '../../engine/CameraController.js';
import { burst, motes, fall } from '../../engine/Particles.js';
import { Ease, prog, shakeEnv, smooth, lerp, Keys } from '../../engine/AnimationSystem.js';
import { LIGHT } from '../../engine/EnvironmentManager.js';
import { caveZ } from '../../story/stages.js';
import { L2, helixPos, HELIX } from '../../story/ep2/stages.js';
import { talker, head, off } from '../util.js';

const B = { give: 7.4, layers: [11.0, 14.0, 17.0, 20.0], breakT: [13.6, 16.6, 19.6, 22.9], drop: 24.0, land: 24.8, descend: 28.0, glitch: 38.0, slip: 49.6, letGo: 54.0, fall: 58.3, black: 63.8 };
const SIGNS5 = [[0.8, ['WE DIG TO', 'THE ARCHIVE.']], [5.8, ['']], [B.letGo, ['LET GO.']]];
const DZ = caveZ(-30.5) + 0.5;

export default function s5(W) {
  const C = W.stages.cave, S = W.stages.shaft;
  // ---- cave part
  const hero = new Actor(C.hero, { ground: C.ground, talk: talker('s5'), blinkSeed: 1.9, path: [[0, [-28.6, DZ]]], yaw: [[0, -Math.PI / 2]],
    acts: [[0, 'idle'], [3.0, 'shrug'], [5.4, 'idle'], [B.give + 0.6, 'holdUp'], [B.layers[0], 'mine', { rate: 2.6, sfx: 'mineStone' }]],
    expr: [[0, 'curious'], [3.0, 'deadpan'], [B.give + 0.8, 'excited'], [B.layers[0], 'determined'], [B.layers[3], 'shocked']], items: [[0, {}], [B.give + 0.8, { r: 'originalPickaxe' }]] });
  const zero = new Actor(C.shadowMan, { ground: C.ground, path: [[0, [-27.4, DZ - 0.9]]], yaw: [[0, -2.2]], acts: [[0, 'holdSign'], [5.8, 'stand'], [B.give, 'point', { roll: -0.2 }], [B.give + 1.2, 'stand']], expr: [[0, 'neutral']] });
  // ---- shaft part: position along the helix as a function of time
  const U = new Keys([[B.land, 0], [B.descend, 0], [B.glitch, 26, 'linear'], [B.slip, 54, 'linear']]);
  const hang = (t) => { const p = helixPos(56); return [p[0] * 0.92 + HELIX.cx * 0.08, p[1] - 2.25, p[2] * 0.92 + HELIX.cz * 0.08]; };
  const heroPos = (t) => {
    if (t < B.land) { const p = helixPos(0); return [p[0], lerp(58.5, p[1], Ease.in(prog(t, B.drop, B.land))), p[2]]; }
    if (t < B.slip) return helixPos(U.at(t));
    const h = hang(t); if (t < B.fall) return h; const k = prog(t, B.fall, B.black); return [lerp(h[0], HELIX.cx, k * 0.4), h[1] - 34 * Ease.in(k), lerp(h[2], HELIX.cz, k * 0.4)];
  };
  const zeroPos = (t) => { if (t < B.land) { const p = helixPos(0); return [p[0] + 0.4, lerp(58.5, p[1], Ease.in(prog(t, B.drop + 0.3, B.land + 0.3))), p[2]]; } if (t < B.slip) return helixPos(U.at(t) + 3); return helixPos(56); };
  const yawAt = (u) => { const a = Math.PI / 2 + u * HELIX.step; return Math.atan2(-Math.sin(a), Math.cos(a)); };
  const heroS = new Actor(S.hero, { ground: () => 0, talk: talker('s5'), blinkSeed: 1.9, path: [[0, [0, 0, 0]]],
    acts: [[0, 'idle'], [B.land, 'land'], [B.land + 0.6, 'lookAround'], [B.descend, 'walk', { inPlace: true, rate: 1.4 }], [B.glitch, 'run', { inPlace: true, rate: 2.6 }], [B.slip, 'holdUp'], [B.fall, 'panicRun', { inPlace: true }]],
    expr: [[0, 'scared'], [B.land + 0.6, 'curious'], [B.descend, 'worried'], [B.glitch, 'terrified'], [B.slip, 'scared'], [51.4, 'deadpan'], [B.letGo, 'shocked'], [B.fall, 'terrified']],
    eyes: [[0, [0, 0]], [B.slip + 0.5, [0, -0.9]], [B.fall, [0, 0]]], items: [[0, { r: 'originalPickaxe' }], [B.slip, {}]],
    extra: (t, p) => { if (t > B.slip && t < B.fall) { p.lShP = 2.9; p.rShP = 2.9; p.lShR = 0.1; p.rShR = 0.1; p.lEl = 0.1; p.rEl = 0.1; p.headPitch = -0.5; p.lHipP = 0.2 + Math.sin(t * 3) * 0.1; p.rHipP = -0.1; } return p; } });
  const zeroS = new Actor(S.zero, { ground: () => 0, path: [[0, [0, 0, 0]]], acts: [[0, 'idle'], [B.descend, 'walk', { inPlace: true, rate: 1.4 }], [B.glitch, 'run', { inPlace: true, rate: 2.6 }], [B.slip, 'cower']], expr: [[0, 'neutral']],
    extra: (t, p) => { if (t > B.slip) { p.rShP = 1.4; p.rEl = 0; p.rShR = 0.2; p.lean = 1.0; } return p; } });

  function update(t) {
    if (t < B.drop) return cave(t);
    S.reset(); S.light(L2.shaft, t);
    const hp = heroPos(t); const u = t < B.slip ? U.at(t) : 56;
    const toC = (p) => Math.atan2(HELIX.cx - p[0], HELIX.cz - p[2]);
    const st = heroS.state(t); st.pos = hp; st.groundY = hp[1]; st.yaw = t < B.slip ? yawAt(u) : toC(hp); st.shadow = t < B.slip ? 1 : 0; if (t > B.fall) st.tilt = -0.5 * prog(t, B.fall, B.fall + 1);
    S.hero.apply(st);
    const zp = zeroPos(t); const zs = zeroS.state(t); zs.pos = t > B.slip ? [zp[0], zp[1], zp[2]] : zp; zs.groundY = zp[1]; zs.yaw = t < B.slip ? yawAt(u + 3) : toC(zp); zs.shadow = 0; S.zero.apply(zs); if (t > B.slip) zs.lift = -0.75;
    S.zeroSign.update(t, zs, SIGNS5, t > B.letGo - 0.1 && t < B.fall + 0.5);
    S.heroLight.position.set(hp[0], hp[1] + 2.4, hp[2]); S.heroLight.intensity = 5;
    S.hero.handWorld('r', S.pickLight.position); S.pickLight.intensity = st.items.r ? 3 : 0;
    // glitchers chase from below and delete the stairs behind them
    const gU = new Keys([[B.glitch, 2], [B.slip, 50, 'linear'], [B.fall, 55]]);
    S.glitchers.forEach((gl, i) => { const gu = gU.at(t) - i * 2.4; const p = helixPos(Math.max(0, gu)); gl.apply({ visible: t > B.glitch - 0.5 && t < B.black, pos: [p[0], p[1] + 0.6 + Math.sin(t * 6 + i) * 0.15, p[2]], yaw: yawAt(gu), t, seed: i + 1 }); });
    S.steps.forEach(m => { const i = m.userData.i; const gone = t > B.glitch && i < gU.at(t) - 0.5; const k = gone ? 1 : 0; m.visible = !gone; if (gone) m.scale.setScalar(1 - k); });
    S.glowParticles.add(fall({ center: [HELIX.cx, 30, HELIX.cz], extent: [24, 50, 24], n: 140, colors: ['#9a8cff', '#ffffff'], size: 0.06, speed: 1.2, seed: 21, up: true, intensity: () => 0.5 }));
    S.particles.add(burst({ t0: B.land, pos: helixPos(0), n: 30, colors: ['#7d7d7d', '#5a5a5a'], speed: 2, up: 1, gravity: 8, life: 0.7, size: 0.08, seed: 41 }));
    const H = head(st); const C0 = [HELIX.cx, 0, HELIX.cz];
    const c = shot(t, [
      { t: [B.drop, B.land + 0.4], pos: [[HELIX.cx, 52, HELIX.cz - 2], [HELIX.cx, 51.5, HELIX.cz - 2.5]], look: [() => off(hp, [0, 1, 0]), () => off(hp, [0, 1, 0])], fov: 60 },
      { t: [B.land + 0.4, B.descend], pos: [[HELIX.cx + 0.3, 54, HELIX.cz + 0.3], [HELIX.cx + 0.3, 54.5, HELIX.cz + 0.3]], look: [[HELIX.cx, 10, HELIX.cz + 0.5], [HELIX.cx, 6, HELIX.cz + 0.6]], fov: 75, ease: 'linear' },
      { t: [B.descend, 33], pos: [(tt) => [C0[0] + Math.cos(Math.PI / 2 + (U.at(tt) - 4) * HELIX.step) * 3.6, heroPos(tt)[1] + 3, C0[2] + Math.sin(Math.PI / 2 + (U.at(tt) - 4) * HELIX.step) * 3.6], (tt) => [C0[0] + Math.cos(Math.PI / 2 + (U.at(tt) - 4) * HELIX.step) * 3.6, heroPos(tt)[1] + 3, C0[2] + Math.sin(Math.PI / 2 + (U.at(tt) - 4) * HELIX.step) * 3.6]], look: () => off(hp, [0, 1.2, 0]), fov: 55 },
      { t: [33, B.glitch + 1], pos: [[-10.0, 44, -10.0], [-10.5, 40, -10.5]], look: [[HELIX.cx, 38, HELIX.cz], [HELIX.cx, 34, HELIX.cz]], fov: 60 },
      { t: [B.glitch + 1, B.slip], pos: [(tt) => off(heroPos(tt), [0, 2.6, 0]).map((v, i) => (i === 1 ? v : v * 0.55 + C0[i] * 0.45)), (tt) => off(heroPos(tt), [0, 2.6, 0]).map((v, i) => (i === 1 ? v : v * 0.55 + C0[i] * 0.45))], look: () => off(hp, [0, 0.8, 0]), fov: 62, shake: 0.12 },
      { t: [B.slip, B.letGo], pos: [() => off(hang(t), [0.0, 1.0, 0]).map((v, i) => (i === 1 ? v : v * 0.6 + C0[i] * 0.4)), () => off(hang(t), [0.0, 1.0, 0]).map((v, i) => (i === 1 ? v : v * 0.6 + C0[i] * 0.4))], look: () => off(hang(t), [0, 2.2, 0]), fov: 50, shake: () => shakeEnv(t, [[B.slip, 0.6, 0.4]]) },
      { t: [B.letGo, B.fall], pos: [() => off(zp, [0, 0.55, 0]).map((v, i) => (i === 1 ? v : v * 0.55 + C0[i] * 0.45)), () => off(zp, [0, 0.5, 0]).map((v, i) => (i === 1 ? v : v * 0.6 + C0[i] * 0.4))], look: () => off(zp, [0, 0.45, 0]), fov: 46 },
      { t: [B.fall, 66], pos: [() => off(hp, [1.9, 0.6, 1.9]), () => off(hp, [1.9, 0.6, 1.9])], look: () => off(hp, [0, 0.9, 0]), fov: 62, handheld: 0.05 },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 1.0, saturation: 0.95, grain: 0.02 };
    if (t > B.glitch && t < B.slip) post.glitch = 0.08;
    if (t > B.fall) { post.zoomBlur = 0.8; post.fade = smooth(prog(t, B.black - 1.2, B.black)); }
    if (t > B.black) post.fade = 1;
    return { stage: S, post };
  }
  function cave(t) {
    C.reset(); C.light(LIGHT.cave, t); for (const tr of C.torches) tr.update(t, 0.7);
    const st = hero.state(t); C.hero.apply(st); const zs = zero.state(t); zs.shadow = 0; C.shadowMan.apply(zs);
    C.zeroSign.update(t, zs, SIGNS5, t < 5.8);
    C.hero.handWorld('r', C.heroLight.position); C.heroLight.intensity = st.items.r ? 4 : 1.5; C.heroLight.color.set(0xc070ff);
    const li = B.layers.reduce((a, l, i) => (t >= l ? i : a), -1);
    C.digBlocks.forEach((m, i) => (m.visible = i === li && t < B.breakT[i]));
    if (li >= 0 && t < B.breakT[li]) { C.crack.visible = true; C.crack.position.copy(C.digBlocks[li].position); C.crack.userData.setStage(prog(t, B.layers[li] + 0.2, B.breakT[li]) * 5); }
    B.breakT.forEach((bt, i) => C.particles.add(burst({ t0: bt, pos: [-30.5, 5.5, DZ], n: 40, colors: i === 3 ? ['#ff00ff', '#111111'] : i === 2 ? ['#3a3a3a', '#555555'] : ['#7d7d7d', '#45454e'], speed: 2.4, up: 2, gravity: 9, life: 0.8, size: 0.12, seed: 50 + i })));
    C.glowParticles.add(burst({ t0: B.give + 0.8, pos: off(st.pos, [0, 2.3, 0]), n: 40, colors: ['#d38cff', '#ffffff'], speed: 1.5, up: 0.4, gravity: 0, life: 0.9, size: 0.08, seed: 60 }));
    C.particles.add(motes({ center: [-29, 7, DZ], extent: [8, 3, 3], n: 40, colors: ['#bfae90'], size: 0.03, alpha: 0.35, seed: 4 }));
    const H = head(st);
    const angles = [[-31.6, 6.8, DZ + 1.3], [-28.4, 7.4, DZ - 1.2], [-31.8, 5.8, DZ - 1.1], [-29.0, 6.0, DZ + 1.2]];
    const c = shot(t, [
      { t: [0, B.give], pos: [() => off(H, [-1.3, 0.05, 0.9]), () => off(H, [-1.2, 0.05, 0.8])], look: () => off(H, [0.7, -0.2, -0.4]), fov: 48 },
      { t: [B.give, B.layers[0]], pos: [() => off(H, [-1.2, 0.1, -0.6]), () => off(H, [-1.0, 0.1, -0.5])], look: () => off(H, [0, -0.1, 0]), fov: 44 },
      ...B.layers.map((l, i) => ({ t: [l, i < 3 ? B.layers[i + 1] : B.drop], pos: [angles[i], angles[i].map((v, k) => v + (k === 1 ? -0.1 : 0.15))], look: [-30.3, 5.6, DZ], fov: 52, shake: () => shakeEnv(t, [[B.breakT[i], 0.5, 0.3]]) })),
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 1.0, saturation: 0.95, grain: 0.02 };
    if (t > B.layers[3]) { post.glitch = 0.25; post.rgb = 0.6; }
    if (t > B.breakT[3]) post.flash = 1 - prog(t, B.breakT[3], B.drop);
    return { stage: C, post };
  }
  function cues() {
    return [{ t: 0.8, id: 'signFlip', gain: 0.6 }, { t: B.give + 0.8, id: 'shine', gain: 0.9 }, { t: B.give + 1.0, id: 'choir', gain: 0.5 },
      ...hero.events(B.layers[0], B.drop, 'stone'), ...B.breakT.map((t, i) => ({ t, id: i === 3 ? 'glitch' : 'breakStone', gain: 1 })),
      { t: B.drop, id: 'whooshDown', gain: 0.8 }, { t: B.land, id: 'land', gain: 1 }, { t: B.land, id: 'impact', gain: 0.5 },
      ...[...Array(40).keys()].map(i => ({ t: B.descend + i * 0.36, id: 'step', surface: 'stone', gain: i < 28 ? 0.5 : 0.8 })),
      { t: B.glitch - 0.4, id: 'glitch', gain: 0.9 }, ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({ t: B.glitch + 0.5 + i * 1.1, id: 'blockVanish', gain: 0.5 })),
      { t: B.slip, id: 'impact', gain: 0.8 }, { t: B.letGo, id: 'signFlip', gain: 0.8 }, { t: B.fall, id: 'whooshDown', gain: 1 }, { t: B.fall + 0.1, id: 'riser', gain: 0.6, dur: 5 }, { t: B.black + 0.2, id: 'impactDeep', gain: 1 }];
  }
  return { update, cues, hero };
}
