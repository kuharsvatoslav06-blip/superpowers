// EP3 SCENE 5 — THE NETHER PHASE. Day 50: the block turns red, lava, a ghast. The bridge explodes, he falls... "I've got you."
import { Actor } from '../../engine/CharacterController.js';
import { shot, orbit } from '../../engine/CameraController.js';
import { burst, motes, fall, swirl } from '../../engine/Particles.js';
import { prog, smooth, lerp, shakeEnv, Ease } from '../../engine/AnimationSystem.js';
import { L3, OX, OZ, TOP } from '../../story/ep3/stages.js';
import { mixLight } from '../../engine/EnvironmentManager.js';
import { talker, head, off } from '../util.js';
import { originTalk, originGlow, blinkEyes, popIn } from './common.js';

export const B5 = { flip: 3.4, rise: 6.6, fb1: 8.4, hit1: 9.4, run: 9.2, fb2: 11.0, hit2: 12.2, fallEnd: 18.35, lift: 19.6, top: 23.4, off: 23.6, home: 27.4, leave: 24.0, back: 28.0, kneel: 29.6 };
const B = B5;
const BX = [7, 22]; const GAP = [11, 16]; const FX = 13.5; const FALL = 40;
const GH0 = [12, 45, -14], GH1 = [12, 62.5, -14];

export default function s5(W) {
  const S = W.stages.sky;
  const hero = new Actor(S.hero, { ground: S.ground, talk: talker('s5'), blinkSeed: 0.2,
    path: [[0, [3.6, TOP, 1.4]], [B.run, [3.6, TOP, 1.4]], [B.run + 0.5, [6.5, TOP, 0.5]], [B.hit2, [FX, TOP, 0.5], 'linear'], [B.top + 0.2, [FX, TOP, 0.5]], [B.off + 0.6, [10.6, TOP, 0.5]], [B.home - 0.6, [3.2, TOP, 0.5], 'linear'], [B.home + 0.4, [OX, TOP, 3.2]], [B.kneel, [OX, TOP, 1.8]]],
    yaw: [[0, -2.4], [B.flip, -2.4], [B.rise, -2.6], [B.run, -2.6], [B.run + 0.3, Math.PI / 2], [B.hit2, Math.PI / 2], [B.hit2 + 0.6, 2.2], [B.top, 2.2], [B.off, -Math.PI / 2], [B.home - 0.6, -Math.PI / 2], [B.home, -0.4], [B.home + 0.6, Math.PI]],
    acts: [[0, 'idle'], [B.flip, 'lookAround'], [B.rise, 'scared'], [B.run, 'panicRun', {}], [B.hit2, 'idle'], [B.hit2 + 0.05, 'panicRun', { inPlace: true, rate: 2.6 }], [B.fallEnd, 'land'], [B.fallEnd + 0.5, 'cower'], [B.lift + 0.6, 'stand'],
      [B.top, 'idle'], [B.off, 'walk'], [B.home + 0.4, 'walk'], [B.kneel, 'sit']],
    expr: [[0, 'neutral'], [B.flip, 'shocked'], [B.rise, 'terrified'], [B.hit2, 'terrified'], [B.fallEnd, 'pain'], [B.fallEnd + 1.0, 'shocked'], [20.6, 'curious'], [B.top - 1.0, 'happy'], [B.home, 'relieved']],
    eyes: [[0, [0, 0]], [B.rise, [0, -0.6]], [B.run, [0, 0]], [B.hit2, [0, -0.8]], [B.fallEnd, [0, 0.8]], [B.lift, [0, 0]]],
    look: [[0, [0, 0]], [B.rise, [0.4, -0.4]], [B.run, [0, 0]]],
    jumps: [[B.off - 0.1, 0.4, 0.5]] });
  function update(t) {
    S.reset();
    const nether = t > B.flip && t < B.back; S.furnish(nether ? 'nether' : 'house', t);
    const nk = smooth(prog(t, B.flip - 0.2, B.flip + 0.4)) * (1 - smooth(prog(t, B.back - 0.2, B.back + 1.2)));
    S.light(mixLight(L3.sky, L3.nether, nk), t + 100, { cloudSpeed: 1.5 }); S.cloudMat.color.setRGB(1, 1 - 0.55 * nk, 1 - 0.7 * nk); S.cloudMat.opacity = 0.75 * (1 - 0.5 * nk);
    // hero state + fall/lift
    const st = hero.state(t); let liftY = null;
    if (t > B.hit2) {
      const k = prog(t, B.hit2 + 0.05, B.fallEnd); let dy = -FALL * (0.6 * k * k + 0.4 * k);
      if (t > B.lift) { const u = Ease.inOut(prog(t, B.lift, B.top)); dy = -FALL * (1 - u); liftY = TOP - 1 + dy; }
      if (t > B.top) dy = 0;
      if (t < B.off) { st.pos[1] = TOP + dy; st.shadow = t > B.fallEnd ? 1 : 0; st.groundY = TOP + dy; st.tilt = t < B.fallEnd ? Math.sin(t * 3) * 0.25 : 0; st.roll = t < B.fallEnd ? Math.sin(t * 2.3) * 0.3 : 0; }
    }
    S.hero.apply(st);
    // bridge: pool blocks; the gap explodes at hit2
    for (let x = BX[0]; x <= BX[1]; x++) {
      const inGap = x >= GAP[0] && x <= GAP[1];
      if (!inGap || t < B.hit2) { S.pool.put('cobble', [x, 60, 0]); continue; }
      const k = t - B.hit2; if (k > 2.5) continue; const dir = (x - FX) * 1.4 + (x === FX ? 0.5 : 0);
      S.pool.put('cobble', [x + 0.5 + dir * k, 60.5 + 3 * k - 4.9 * k * k, 0.5 + Math.sin(x * 7) * 2.5 * k], { centre: true, rot: [k * (3 + x % 3), k * 2, k * (x % 2 ? 2 : -2)] });
    }
    // the catching block + lift
    if (t > B.fallEnd - 0.05 && t < B.off + 0.5) { const y = liftY !== null ? liftY : TOP - 1 - FALL; const sc = popIn(t, B.fallEnd - 0.05, 0.12); S.pool.put('grass', [FX - 0.5 + 0.0, y, 0], { scale: sc || 0.001 }); }
    if (t > B.top) S.pool.put('grass', [Math.floor(FX), 60, 0]);
    // ghast
    const gv = t > B.rise - 0.2 && t < B.back + 1.5;
    if (gv) { const r = Ease.out(prog(t, B.rise, B.rise + 2.0)); const lv = Ease.in(prog(t, B.leave, B.back + 1.5));
      const gp = [lerp(lerp(GH0[0], GH1[0], r), 40, lv), lerp(lerp(GH0[1], GH1[1], r), 84, lv), lerp(lerp(GH0[2], GH1[2], r), -60, lv)];
      const target = t < B.hit2 ? st.pos : [FX, 40, 0.5]; S.ghast.apply({ pos: gp, yaw: Math.atan2(target[0] - gp[0], target[2] - gp[2]), t, angry: (t > B.fb1 - 0.5 && t < B.fb1 + 0.3) || (t > B.fb2 - 0.5 && t < B.fb2 + 0.3), visible: true, scale: 1 - lv * 0.5 });
      S.ghastPos = gp; }
    // fireballs
    for (const [a, b, tgt] of [[B.fb1, B.hit1, [6.2, 60.8, -2.4]], [B.fb2, B.hit2, [FX, 60.6, 0.5]]]) if (t > a && t < b) { const g = S.ghastPos; const k = prog(t, a, b); const st0 = [g[0], g[1] + 1.6, g[2] + 2]; S.fireball.visible = true; S.fireball.position.set(lerp(st0[0], tgt[0], k), lerp(st0[1], tgt[1], k), lerp(st0[2], tgt[2], k)); S.fireball.userData.core.rotation.set(t * 5, t * 7, 0);
      S.glowParticles.add(fall({ center: S.fireball.position.toArray(), extent: [0.6, 0.6, 0.6], n: 20, colors: ['#ffb030', '#ff5010'], size: 0.2, speed: 1, seed: a * 10 })); }
    for (const [h, p, sd] of [[B.hit1, [6.2, 60.8, -2.4], 71], [B.hit2, [FX, 60.6, 0.5], 72]]) {
      S.glowParticles.add(burst({ t0: h, pos: p, n: 120, colors: ['#ffd040', '#ff7010', '#ffffff'], speed: 6, up: 3, gravity: 2, life: 0.9, size: 0.3, seed: sd }));
      S.particles.add(burst({ t0: h + 0.1, pos: p, n: 60, colors: ['#333333', '#666666'], speed: 2, up: 2, gravity: -1, life: 2.2, size: 0.5, seed: sd + 5 })); }
    if (nether) { S.particles.add(fall({ center: [0, 66, 0], extent: [40, 20, 40], n: 140, colors: ['#ff7a30', '#ffcc60', '#aa2a10'], size: 0.07, speed: -1.2, seed: 73, up: true }));
      for (const [x, z] of [[-3, -3], [-4, -2], [3, 3], [-3, 3]]) S.glowParticles.add(swirl({ center: [x + 0.5, 60.9, z + 0.5], radius: 0.4, height: 1.2, n: 6, colors: ['#ffb030'], size: 0.08, speed: 0.8, seed: x * 3 + z })); }
    S.glowParticles.add(burst({ t0: B.fallEnd - 0.05, pos: [FX, TOP - FALL + 0.2, 0.5], n: 60, colors: ['#c8ffb0', '#ffffff'], speed: 2.5, up: 1, gravity: 0, life: 0.8, size: 0.12, seed: 74 }));
    if (t > B.lift && t < B.top + 0.5) S.glowParticles.add(swirl({ center: [FX, (liftY ?? TOP - 1) - 0.5, 0.5], radius: 0.9, height: 1.5, n: 30, colors: ['#c8ffb0', '#ffffff'], size: 0.08, speed: 1.2, seed: 75 }));
    S.glowParticles.add(burst({ t0: B.back, pos: [0.5, 62, 0.5], n: 120, colors: ['#ffffff', '#c8ffb0'], speed: 7, up: 2, gravity: 0, life: 1.2, size: 0.15, spread: 6, seed: 76 }));
    const eyes = blinkEyes(t, 1, 0.8);
    S.origin.apply({ kind: nether ? 'netherrack' : 'grass', eyes: t > B.kneel - 1 ? eyes : 0.9, talk: originTalk('s5', t), glow: Math.max(originGlow('s5', t), t > B.kneel ? 0.6 : 0), look: [0, 0.3] });
    const H = head(st), P = st.pos; const gp = S.ghastPos || GH1; const fb = S.fireball.position.toArray();
    const c = shot(t, [
      { t: [0, B.flip], pos: [[7.6, 63.0, 5.6], [7.2, 62.8, 5.3]], look: [1.2, 61.6, 0.8], fov: 50 },
      { t: [B.flip, B.rise], pos: () => orbit([0.5, 61, 0.5], 12, 1.0 + (t - B.flip) * 0.15, 4), look: [1, 61.2, 0.5], fov: 50 },
      { t: [B.rise, B.fb1], pos: [[5.8, 62.0, 4.6], [5.6, 61.9, 4.8]], look: () => [gp[0], gp[1] + 2, gp[2]], fov: 58 },
      { t: [B.fb1, B.run + 0.4], pos: [[9.4, 63.2, 5.4], [9.2, 63.0, 5.6]], look: () => (t < B.hit1 ? fb : [6, 61, -2]), fov: 55, shake: () => shakeEnv(t, [[B.hit1, 0.6, 0.4]]) },
      { t: [B.run + 0.4, B.hit2 + 0.1], pos: () => [P[0] + 0.6, 62.4, 6.2], look: () => [P[0] + 1.0, 61.8, -1.0], fov: 52, shake: () => shakeEnv(t, [[B.hit2, 1.0, 0.5]]) },
      { t: [B.hit2 + 0.1, 15.0], pos: () => off(P, [2.4, -4.2, 2.6]), look: () => off(P, [0, 2.0, 0]), fov: 62, shake: 0.08 },
      { t: [15.0, B.fallEnd], pos: () => off(P, [0.7, 3.4, 0.9]), look: () => off(P, [0, -8, 0]), fov: 70, shake: 0.08 },
      { t: [B.fallEnd, B.lift], pos: () => off(P, [2.3, 0.7, 2.4]), look: () => off(P, [0, 0.8, 0]), fov: 50, shake: () => shakeEnv(t, [[B.fallEnd, 0.5, 0.3]]) },
      { t: [B.lift, B.off], pos: [[19, 40, 9], [19, 64, 9]], look: () => off(P, [0, 1, 0]), fov: 50 },
      { t: [B.off, B.home - 0.8], pos: () => off(P, [2.8, 1.8, 3.2]), look: () => off(P, [-1.5, 0.9, -0.5]), fov: 50 },
      { t: [B.home - 0.8, B.kneel], pos: [[11, 66, 15], [10, 66.5, 14]], look: [[3, 61, 0], [4, 64, -6]], fov: 52 },
      { t: [B.kneel, 34], pos: [[OX + 0.3, 62.4, 4.9], [OX + 0.25, 62.3, 4.6]], look: [OX, 61.6, OZ + 0.7], fov: 45 },
    ]);
    W.cam.apply({ ...c, t });
    S.roof.visible = S.roof.visible && !(t > B.kneel);
    const post = { vignette: 0.55 + nk * 0.4, saturation: 1.08 + nk * 0.15, tint: [1.2, 0.8, 0.6], tintAmt: 0.1 * nk };
    if (t > B.flip && t < B.flip + 0.25) { post.flash = 0.7; post.flashColor = [1, 0.3, 0.1]; }
    if (t > B.back && t < B.back + 0.6) post.flash = 0.8 * (1 - prog(t, B.back, B.back + 0.6));
    if (t > B.hit2 && t < B.hit2 + 0.12) post.flash = 0.7, post.flashColor = [1, 0.8, 0.5];
    if (t > B.hit2 && t < B.fallEnd) post.zoomBlur = 0.4;
    return { stage: S, post };
  }
  function cues() {
    return [{ t: B.flip, id: 'netherFlip', gain: 1 }, { t: B.rise, id: 'ghastCry', gain: 1 }, { t: B.fb1 - 0.4, id: 'ghastCry', gain: 0.6 }, { t: B.fb1, id: 'fireball', gain: 1 }, { t: B.hit1, id: 'explosion', gain: 1 },
      ...hero.events(B.run, B.hit2, 'stone'), { t: B.fb2 - 0.4, id: 'ghastCry', gain: 0.7 }, { t: B.fb2, id: 'fireball', gain: 1 }, { t: B.hit2, id: 'explosion', gain: 1.2 }, { t: B.hit2 + 0.3, id: 'fallWind', gain: 0.9, dur: 6 },
      { t: B.fallEnd - 0.05, id: 'blockRegen', gain: 0.9 }, { t: B.fallEnd, id: 'land', gain: 1.2 }, { t: B.lift, id: 'elevator', gain: 0.7, dur: 3.8 }, ...hero.events(B.off, B.kneel, 'stone'),
      { t: B.leave, id: 'ghastCry', gain: 0.4 }, { t: B.back, id: 'shine', gain: 0.8 }, { t: B.back, id: 'whoosh', gain: 0.6 }];
  }
  return { update, cues, hero };
}
