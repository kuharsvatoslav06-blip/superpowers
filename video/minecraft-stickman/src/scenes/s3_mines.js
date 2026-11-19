// SCENE 3 — THE MINES. Iron, torches disappearing, footsteps that stop when he stops, a silhouette, a new tunnel.
import { Actor } from '../engine/CharacterController.js';
import { shot } from '../engine/CameraController.js';
import { burst, motes, swirl } from '../engine/Particles.js';
import { Ease, clamp, prog, shakeEnv, smooth, noise1 } from '../engine/AnimationSystem.js';
import { LIGHT } from '../engine/EnvironmentManager.js';
import { talker, head, off } from './util.js';

export const BEATS = { enterCave: 8.4, mine: 13.8, ironBreak: 15.5, deeper: 17.6, stopTurn: 25.4, steps: 28.0, stop: 32.0, run: 36.0, spin: 43.4, lower: 46.6,
  turnBack: 47.2, silhouette: 48.5, approach: 52.2, vanish: 60.5, crumble: 61.2, crumbleEnd: 64.4, enter: 68.2 };
const B = BEATS;
const TORCH_OUT = [20.0, 21.3, 22.7, 26.05]; // torches at x = -4, -10, -18, -25 go out
const PHANTOM = [28.35, 28.95, 29.55, 30.15, 30.75, 31.35, 31.95, 32.55, 33.1];
const zp = x => 1.2 * Math.sin(x * 0.09) + 0.5;
function along(t0, t1, x0, x1, ease = 'linear') { // dense path keys through the winding tunnel
  const out = []; const n = Math.max(2, Math.ceil(Math.abs(x1 - x0)));
  for (let i = 0; i <= n; i++) { const k = i / n; const x = x0 + (x1 - x0) * k; out.push([t0 + (t1 - t0) * (ease === 'linear' ? k : k), [x, zp(x)], 'linear']); }
  return out;
}

export default function s3(W) {
  const O = W.stages.over, C = W.stages.cave;
  // --- outside: walk to the cave mouth
  const heroOut = new Actor(O.hero, { ground: O.ground, talk: talker('s3'),
    path: [[0, [-5.5, 0.6]], [8.4, [-19.5, 0.5], 'linear']], acts: [[0, 'walk']],
    expr: [[0, 'determined'], [5, 'worried']], items: [[0, { r: 'woodPickaxe', l: 'torch' }]] });
  // --- inside
  const path = [
    [0, [1.5, zp(1.5)]], [B.enterCave, [1.5, zp(1.5)]], ...along(B.enterCave, 13.4, 1.5, -9.0), [B.mine - 0.2, [-12.5, 0.35], 'inOut'], [B.deeper, [-12.5, 0.35]],
    ...along(B.deeper + 0.2, B.stopTurn, -13.0, -26.0), ...along(B.steps, B.stop, -26.0, -28.5), ...along(B.run, B.spin, -28.5, -45.0),
    [B.approach, [-45.0, zp(-45)]], ...along(B.approach + 0.2, B.vanish, -45.0, -50.4), [B.enter, [-50.4, zp(-50.4)]], ...along(B.enter + 0.1, 71, -50.4, -55.5),
  ];
  const hero = new Actor(C.hero, {
    ground: C.ground, talk: talker('s3'), blinkSeed: 2.3, path,
    yaw: [[0, -Math.PI / 2], [13.4, -Math.PI / 2], [B.mine - 0.2, 0], [B.deeper, 0], [B.deeper + 0.3, -Math.PI / 2], [B.stopTurn, -Math.PI / 2], [B.stopTurn + 0.6, Math.PI / 2],
      [B.steps - 0.4, Math.PI / 2], [B.steps, -Math.PI / 2], [B.stop + 1.6, -Math.PI / 2], [B.stop + 2.0, -Math.PI / 2 + 0.5], [B.stop + 2.6, -Math.PI / 2 - 0.5], [B.run, -Math.PI / 2],
      [B.spin, -Math.PI / 2], [B.spin + 0.25, Math.PI / 2, 'out'], [B.turnBack, Math.PI / 2], [B.turnBack + 0.6, -Math.PI / 2], [B.enter + 1.2, -Math.PI / 2], [B.enter + 1.6, -Math.PI / 2]],
    acts: [[0, 'walk'], [13.4, 'walk'], [B.mine, 'mine', { rate: 2.4, sfx: 'mineStone' }], [B.ironBreak, 'idle'], [B.ironBreak + 0.4, 'holdUp'], [B.deeper, 'walk'], [B.stopTurn, 'idle'],
      [B.stopTurn + 0.6, 'scared'], [B.steps, 'sneak'], [B.stop, 'scared'], [B.run, 'run', { stride: 1.5 }], [B.spin, 'shield'], [B.lower, 'scared'], [B.turnBack, 'idle'],
      [B.silhouette + 0.3, 'scared'], [B.approach, 'sneak'], [B.vanish, 'scared'], [B.crumble + 0.5, 'cower'], [B.crumbleEnd, 'gulp'], [B.enter, 'sneak']],
    expr: [[0, 'neutral'], [B.mine, 'determined'], [B.ironBreak, 'excited'], [B.deeper, 'happy'], [B.stopTurn, 'curious'], [B.stopTurn + 0.7, 'worried'], [B.steps, 'worried'], [B.stop + 0.5, 'scared'],
      [B.run, 'terrified'], [B.spin, 'yell'], [B.spin + 1.2, 'scared'], [B.lower, 'worried'], [B.silhouette, 'shocked'], [B.silhouette + 1.5, 'worried'], [B.vanish, 'terrified'], [B.crumbleEnd, 'worried'], [B.enter - 1.5, 'deadpan'], [B.enter, 'worried']],
    eyes: [[0, [0, 0]], [B.stop + 0.4, [0, 0]], [B.stop + 0.8, [-0.9, 0]], [B.stop + 1.4, [0.9, 0]], [B.stop + 2.0, [-0.9, 0.1]], [B.stop + 2.6, [0.9, 0]], [B.stop + 3.2, [0, 0]], [B.run, [0, 0]]],
    look: [[0, [0, 0]], [B.stop + 2.9, [0, 0]], [B.stop + 3.2, [0.6, 0]], [B.run, [0, 0]], [B.enter - 1.8, [0, 0]], [B.enter - 1.5, [-0.9, 0.05]], [B.enter - 0.2, [-0.9, 0.05]], [B.enter, [0, 0]]],
    items: [[0, { r: 'woodPickaxe', l: 'torch' }], [B.spin, { r: 'torch', l: 'shield' }], [B.turnBack, { r: 'woodPickaxe', l: 'torch' }]],
  });
  const shadowMan = new Actor(C.shadowMan, { ground: C.ground, path: [[0, [-53.6, zp(-53.6)]]], yaw: [[0, -Math.PI / 2]], acts: [[0, 'stand']], expr: [[0, 'neutral']] });

  function update(t) {
    if (t < B.enterCave) return outside(t);
    C.reset();
    const st = hero.state(t); C.hero.apply(st);
    C.light(LIGHT.cave, t);
    // torches: lit until they are snuffed out (with a puff)
    C.torches.forEach((tr, i) => { const out = TORCH_OUT[i]; const on = out ? 1 - smooth(prog(t, out, out + 0.18)) : 1; const run = t > B.run && t < B.spin ? 0.75 + 0.25 * noise1(t * 20 + i) : 1; tr.update(t, on * run); });
    // hero's torch light
    const hand = st.items.l === 'torch' ? 'l' : 'r'; C.hero.handWorld(hand, C.heroLight.position); C.heroLight.position.y += 0.35; C.heroLight.intensity = 5.5 * (0.9 + 0.1 * Math.sin(t * 17));
    // iron ore
    C.crack.visible = t > B.mine && t < B.ironBreak; C.crack.userData.setStage(prog(t, B.mine, B.ironBreak) * 5); C.iron.visible = t < B.ironBreak;
    // the silhouette
    const silOn = t > B.silhouette && t < B.vanish + 0.15;
    const glitchOut = prog(t, B.vanish - 0.2, B.vanish + 0.15);
    const sst = shadowMan.state(t); sst.visible = silOn && (glitchOut < 0.01 || Math.sin(t * 90) > 0); sst.opacity = smooth(prog(t, B.silhouette, B.silhouette + 1.2)); sst.shadow = 0;
    if (glitchOut > 0) sst.pos = [sst.pos[0] + (Math.sin(t * 77) * 0.3), sst.pos[1], sst.pos[2]];
    C.shadowMan.apply(sst);
    C.eerie.position.set(-52.5, 7.5, zp(-53)); C.eerie.position.x += 1.6; C.eerie.intensity = silOn ? 7 * sst.opacity : t > B.crumble ? 4 * smooth(prog(t, B.crumble, B.crumbleEnd)) : 0;
    // the wall crumbles block by block
    C.passageBlocks.forEach((m, i) => {
      const d = B.crumble + (i / C.passageBlocks.length) * (B.crumbleEnd - B.crumble - 0.4) + (i % 3) * 0.05; const k = prog(t, d, d + 0.4);
      m.visible = k < 1; m.scale.setScalar(1 - Ease.in(k) * 0.9); m.position.y = m.userData.y + 0.5 - Ease.in(k) * 1.2;
      if (k > 0 && k < 1) C.particles.add(burst({ t0: d, pos: [m.userData.x + 0.5, m.userData.y + 0.5, m.userData.z + 0.5], n: 10, colors: ['#7d7d7d', '#5a5a5a', '#9a9a9a'], speed: 1.6, up: 1, gravity: 9, life: 0.7, size: 0.1, seed: 70 + i }));
    });
    // particles
    C.particles.add(motes({ center: [st.pos[0], 7, st.pos[2]], extent: [14, 4, 3], n: 90, colors: ['#bfae90', '#ffffff'], size: 0.03, alpha: 0.35, seed: 4, speed: 0.4 }));
    C.particles.add(burst({ t0: B.ironBreak, pos: [-12.5, 6.5, 1.2], n: 30, colors: ['#7d7d7d', '#d8a77e', '#5a5a5a'], speed: 2, up: 2, gravity: 10, life: 0.8, size: 0.1, seed: 33 }));
    TORCH_OUT.forEach((to, i) => { const tr = C.torches[i]; C.particles.add(burst({ t0: to, pos: [tr.group.position.x, tr.group.position.y + 0.3, tr.group.position.z], n: 12, colors: ['#444444', '#777777'], speed: 0.4, up: 1.2, gravity: -0.5, life: 1.2, size: 0.12, seed: 90 + i })); });
    C.glowParticles.add(swirl({ center: [-53.1, 5, zp(-53)], radius: 0.6, height: 2.2, n: 40, colors: ['#9a6cff', '#ffffff'], size: 0.06, intensity: tt => (silOn ? sst.opacity * 0.8 : 0) }));
    C.glowParticles.add(burst({ t0: B.vanish, pos: [-53.1, 6, zp(-53)], n: 60, colors: ['#ffffff', '#9a6cff', '#000000'], speed: 2.5, up: 1, gravity: 0, life: 0.6, size: 0.1, seed: 77 }));

    // ---------- camera
    const H = head(st); const P = st.pos;
    const ahead = (d, h = 1.7, side = 0.3) => [P[0] - d, P[1] + h, zp(P[0] - d) + side];
    const behind = (d, h = 1.8, side = 0) => [P[0] + d, P[1] + h, zp(P[0] + d) + side];
    const c = shot(t, [
      { t: [8.4, 13.6], pos: [() => ahead(3.2, 1.75), () => ahead(3.2, 1.75)], look: () => off(P, [0, 1.35, 0]), fov: 55, handheld: 0.03 },
      { t: [13.6, 16.5], pos: [[-10.6, 6.55, -0.55], [-10.9, 6.5, -0.45]], look: [-12.6, 6.0, 1.2], fov: 52, shake: () => shakeEnv(t, [...[0, 1, 2, 3].map(i => [B.mine + (i + 0.55) / 2.4, 0.1, 0.15]), [B.ironBreak, 0.4, 0.3]]) },
      { t: [16.5, 17.6], pos: () => off(H, [-0.6, -0.05, -1.2]), look: () => H, fov: 40 },
      { t: [17.6, B.stopTurn], pos: [() => ahead(3.6, 1.7, 0.2), () => ahead(3.0, 1.6, 0.2)], look: () => off(P, [1.2, 1.3, 0]), fov: 58, handheld: 0.03 },
      { t: [B.stopTurn, B.steps], pos: [() => off(H, [1.4, -0.1, -0.4]), () => off(H, [1.1, -0.05, -0.35])], look: () => H, fov: [48, 40] },
      { t: [B.steps, B.stop], pos: [() => ahead(2.6, 0.6, 0.4), () => ahead(2.4, 0.5, 0.4)], look: () => off(P, [0.6, 1.0, 0]), fov: 60 },
      { t: [B.stop, B.run], pos: [() => off(H, [-1.2, 0, 0.1]), () => off(H, [-0.75, 0, 0.05])], look: () => H, fov: [42, 34], ease: 'linear' },
      { t: [B.run, 39.0], pos: [() => ahead(3.0, 1.5, 0), () => ahead(2.6, 1.5, 0)], look: () => off(P, [0, 1.3, 0]), fov: 62, shake: 0.15 },
      { t: [39.0, 40.3], pos: [() => off(P, [-1.3, 0.35, -0.5]), () => off(P, [-1.3, 0.35, -0.5])], look: () => off(P, [0, 0.4, 0]), fov: 60, shake: 0.2 },
      { t: [40.3, B.spin], pos: [() => behind(3.0, 1.9), () => behind(2.6, 1.8)], look: () => off(P, [-3, 1.2, 0]), fov: 64, shake: 0.18 },
      { t: [B.spin, 44.7], pos: [() => off(P, [2.2, 1.0, 0.6]), () => off(P, [2.0, 1.0, 0.5])], look: () => off(P, [0, 1.2, 0]), fov: 55, shake: () => shakeEnv(t, [[B.spin + 0.2, 0.8, 0.4]]) },
      { t: [44.7, B.turnBack], pos: [() => off(P, [-0.9, 1.95, 0.45]), () => off(P, [-0.9, 1.95, 0.45])], look: () => off(P, [8, 1.5, 0]), fov: 55 },
      { t: [B.turnBack, B.approach], pos: [() => off(P, [1.3, 2.25, 0.75]), () => off(P, [1.3, 2.25, 0.75])], look: [-53.5, 6.4, zp(-53.5)], fov: [55, 30], ease: 'inOut' },
      { t: [B.approach, B.vanish + 0.4], pos: [() => behind(2.0, 2.3, 0.75), () => behind(1.8, 2.2, 0.75)], look: [-53.5, 6.2, zp(-53.5)], fov: 50, handheld: 0.04 },
      { t: [B.vanish + 0.4, 65.6], pos: [() => behind(2.2, 1.6), () => behind(2.6, 1.7)], look: [-57, 6.5, zp(-56)], fov: 55, shake: () => (t > B.crumble && t < B.crumbleEnd ? 0.12 : 0) + shakeEnv(t, [[B.crumble, 0.4, 0.5]]) },
      { t: [65.6, B.enter], pos: [() => off(H, [-1.5, 0, -0.9]), () => off(H, [-1.3, 0, -0.8])], look: () => H, fov: 42 },
      { t: [B.enter, 70.5], pos: [() => behind(2.6, 1.8), () => behind(2.6, 1.8)], look: () => off(P, [-3, 1.2, 0]), fov: 55 },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 1.1, saturation: 0.85, contrast: 1.1, grain: 0.05 };
    if (t > B.stop && t < B.run) post.vignette = 1.5;
    if (t > B.run && t < B.spin) { post.saturation = 0.7; post.rgb = 0.2; }
    if (t > B.vanish - 0.25 && t < B.vanish + 0.3) { post.glitch = 0.9; post.rgb = 1; }
    if (t > B.silhouette && t < B.vanish) post.letterbox = 1;
    return { stage: C, post };
  }
  function outside(t) {
    const O_ = O; O_.reset(); O_.light(LIGHT.night, t + 60, { cloudSpeed: 0.6 });
    const st = heroOut.state(t); O_.hero.apply(st);
    O_.hero.handWorld('l', O_.handLight.position); O_.handLight.position.y += 0.4; O_.handLight.intensity = 6 * (0.9 + 0.1 * Math.sin(t * 17));
    O_.particles.add(motes({ center: [-12, 23, 0], extent: [20, 6, 14], n: 60, colors: ['#c8e0ff'], size: 0.05, alpha: 0.45, seed: 28 }));
    const P = st.pos;
    const c = shot(t, [
      { t: [0, 4.2], pos: [[-1.5, 24.2, -9.5], [-3.5, 23.6, -8.2]], look: [[-14, 23.2, 0.5], [-15, 23.0, 0.5]], fov: 50 },
      { t: [4.2, 8.4], pos: [() => off(P, [3.2, 1.5, -0.9]), () => off(P, [2.6, 1.4, -0.6])], look: () => off(P, [-4, 1.1, 0.3]), fov: 55 },
    ]);
    W.cam.apply({ ...c, t });
    return { stage: O_, post: { vignette: 1.0, saturation: 0.8, fade: smooth(prog(t, 7.8, 8.4)) * 0.85 } };
  }
  function cues() {
    return [
      ...heroOut.events(0, B.enterCave, 'grass'), ...hero.events(B.enterCave, 70, 'stone'),
      { t: B.enterCave, id: 'caveEnter', gain: 0.6 }, { t: B.ironBreak, id: 'breakStone', gain: 1 }, { t: B.ironBreak + 0.45, id: 'pop', gain: 0.8 },
      ...TORCH_OUT.map(t => ({ t, id: 'torchOut', gain: 0.9 })),
      ...PHANTOM.map((t, i) => ({ t, id: 'stepPhantom', gain: 0.55 + i * 0.03 })),
      ...[36.15, 36.55, 36.9, 37.2, 37.5, 37.75, 38.0, 38.25, 38.5, 38.72, 38.94, 39.16, 39.38, 39.6, 39.8, 40.0, 40.2, 40.4, 40.6, 40.8, 41.0, 41.2, 41.4, 41.6, 41.8, 42.0, 42.2, 42.4, 42.6, 42.8, 43.0, 43.2].map(t => ({ t, id: 'stepPhantom', gain: 0.8 })),
      { t: B.spin + 0.15, id: 'shield', gain: 1 }, { t: B.spin + 0.2, id: 'impact', gain: 0.8 },
      { t: B.silhouette, id: 'stinger', gain: 0.7 }, { t: B.vanish - 0.2, id: 'glitch', gain: 0.9 },
      { t: B.crumble, id: 'rumble', gain: 1 }, ...[0, 1, 2, 3, 4, 5].map(i => ({ t: B.crumble + 0.3 + i * 0.5, id: 'breakStone', gain: 0.5 })),
    ];
  }
  void clamp;
  return { update, cues, hero };
}
