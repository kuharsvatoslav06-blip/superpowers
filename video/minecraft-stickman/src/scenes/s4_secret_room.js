// SCENE 4 — THE SECRET ROOM. The chest, the book, the ender-creature that just... stares. The red dot.
import { Actor } from '../engine/CharacterController.js';
import { shot } from '../engine/CameraController.js';
import { burst, motes, swirl } from '../engine/Particles.js';
import { Ease, clamp, prog, shakeEnv, smooth } from '../engine/AnimationSystem.js';
import { LIGHT } from '../engine/EnvironmentManager.js';
import { talker, head, off } from './util.js';

export const BEATS = { enter: 0, atChest: 8.6, open: 9.6, pick: 13.6, read: 22.8, ender: 31.0, stare: 36.0, turn: 41.0, gone: 45.5, map: 47.4, run: 53.2 };
const B = BEATS;
const EPOS = [-74.3, 5, -2.6];

export default function s4(W) {
  const C = W.stages.cave;
  const hero = new Actor(C.hero, {
    ground: C.ground, talk: talker('s4'), blinkSeed: 0.7,
    path: [[0, [-57.5, 0.5]], [3.0, [-62.5, 0.5], 'linear'], [6.6, [-67.5, 0.6], 'out'], [B.atChest, [-72.2, 0.5], 'inOut'], [B.read - 0.6, [-72.2, 0.5]], [B.read, [-71.0, 0.5]],
      [B.run, [-71.0, 0.5]], [56.0, [-63.0, 0.5], 'in'], [60.5, [-54.0, 0.6], 'linear']],
    yaw: [[0, -Math.PI / 2], [6.6, -Math.PI / 2], [B.read - 0.6, -Math.PI / 2], [B.read, Math.PI / 2], [B.turn + 1.8, Math.PI / 2], [B.turn + 3.6, 3.95, 'inOut'],
      [B.gone + 2.5, 3.95], [B.gone + 2.9, Math.PI / 2], [B.run, Math.PI / 2]],
    acts: [[0, 'walk', { stride: 0.9 }], [3.0, 'walk', { stride: 0.9 }], [6.6, 'walk'], [B.atChest, 'idle'], [B.open, 'place', { rate: 1.5, sfx: null }], [B.open + 0.6, 'idle'], [B.pick, 'holdUp'],
      [18.4, 'shrug'], [20.4, 'idle'], [B.read, 'read'], [B.turn + 2.0, 'scared'], [B.gone, 'scared'], [B.gone + 0.6, 'lookAround'], [B.map, 'read'], [B.run, 'panicRun']],
    expr: [[0, 'curious'], [B.open, 'shocked'], [B.open + 0.8, 'excited'], [18.4, 'curious'], [19.4, 'worried'], [B.read, 'curious'], [B.read + 4.5, 'worried'], [B.turn + 1.0, 'worried'],
      [B.turn + 3.2, 'terrified'], [B.gone + 0.6, 'scared'], [B.map + 1, 'worried'], [B.map + 4.2, 'terrified']],
    eyes: [[0, [0, 0]], [B.read, [0, 0.8]], [B.stare + 2.5, [0, 0.8]], [B.turn, [0.8, 0]], [B.turn + 2.0, [0, 0]], [B.map, [0, 0.8]]],
    look: [[0, [0, 0]], [2.0, [0.6, -0.2]], [4.0, [-0.7, -0.25]], [6.0, [0, 0]], [B.turn, [0, 0]], [B.turn + 1.6, [1.3, 0]], [B.turn + 3.6, [0, 0]], [B.gone + 0.7, [0, 0]]],
    items: [[0, { l: 'torch' }], [B.pick, { r: 'diamondPickaxe', l: 'torch' }], [B.read - 0.4, { r: 'book' }], [B.map - 0.2, { r: 'map' }], [B.run, { r: 'diamondPickaxe', l: 'torch' }]],
    extra: (t, p) => { if (t > B.gone + 0.6 && t < B.map) { p.headYaw = Math.sin(t * 14) * 0.5; } return p; },
  });

  function update(t) {
    C.reset(); C.light(LIGHT.cave, t);
    for (const m of C.passageBlocks) m.visible = false; C.iron.visible = false;
    for (const tr of C.torches) tr.update(t, 0);
    const st = hero.state(t); C.hero.apply(st);
    const hand = st.items.l === 'torch' ? 'l' : null;
    if (hand) { C.hero.handWorld('l', C.heroLight.position); C.heroLight.position.y += 0.35; C.heroLight.intensity = 5 * (0.9 + 0.1 * Math.sin(t * 17)); }
    else { C.heroLight.position.set(-70.5, 8.0, 1.5); C.heroLight.intensity = 2.5; }
    C.roomLights.forEach((L, i) => { L.intensity = 14 + Math.sin(t * 2 + i) * 0.8; L.color.set(t > B.ender && t < B.gone ? 0x8a7cff : 0x7fd4ff); });
    const open = Ease.out(prog(t, B.open, B.open + 0.6));
    C.chest.update(open, open * (0.6 + 0.2 * Math.sin(t * 5)) * (1 - prog(t, 22, 24)));
    // ender-creature: fades in behind him, stares, vanishes
    const eon = t > B.ender && t < B.gone + 0.15;
    const ek = smooth(prog(t, B.ender, B.ender + 2.5));
    const tele = prog(t, B.gone - 0.05, B.gone + 0.15);
    const eyaw = Math.atan2(st.pos[0] - EPOS[0], st.pos[2] - EPOS[2]);
    C.ender.apply({ visible: eon, pos: EPOS, yaw: eyaw, opacity: ek * (1 - tele), stretch: tele, t, headPitch: 0.25, glow: 0.7 + 0.3 * Math.sin(t * 3) });
    C.eerie.position.set(EPOS[0] + 1.6, 8.0, EPOS[2] + 1.8); C.eerie.intensity = eon ? 9 * ek : 0;
    // particles
    C.particles.add(motes({ center: [-69.5, 7.5, 0], extent: [12, 5, 12], n: 120, colors: ['#bfae90', '#ffffff'], size: 0.035, alpha: 0.4, seed: 14, speed: 0.3 }));
    C.glowParticles.add(burst({ t0: B.open + 0.1, pos: [-73.5, 6.0, 0.5], n: 40, colors: ['#ffe08a', '#ffffff', '#ffd23a'], speed: 1.2, up: 1.5, gravity: -0.3, life: 1.6, size: 0.08, seed: 41 }));
    C.glowParticles.add(burst({ t0: B.pick + 0.2, pos: off(st.pos, [0, 2.7, 0]), n: 36, colors: ['#7ff5ea', '#ffffff'], speed: 1.4, up: 0.4, gravity: 0, life: 1.0, size: 0.08, seed: 42 }));
    C.glowParticles.add(swirl({ center: [EPOS[0], EPOS[1], EPOS[2]], radius: 0.8, height: 3.2, n: 50, colors: ['#c040ff', '#e070ff', '#000000'], size: 0.07, speed: 0.4, intensity: () => (eon ? ek * (1 - tele) : 0) }));
    C.glowParticles.add(burst({ t0: B.gone, pos: [EPOS[0], 6.6, EPOS[2]], n: 90, colors: ['#c040ff', '#e070ff', '#ffffff'], speed: 3.2, up: 1, gravity: 0, life: 0.8, size: 0.1, seed: 43 }));

    // ---------- camera
    const H = head(st); const P = st.pos; const EH = [EPOS[0], EPOS[1] + 2.8, EPOS[2]];
    const c = shot(t, [
      { t: [0, 4.2], pos: [[-74.6, 9.4, 5.6], [-74.2, 9.0, 5.0]], look: [[-62, 6.2, 0.5], [-64, 6.0, 0.5]], fov: 58 },
      { t: [4.2, B.atChest], pos: [[-68.0, 8.2, 5.4], [-69.5, 7.6, 4.6]], look: [() => off(P, [-1, 1.2, 0]), () => off(P, [-1.5, 1.0, 0])], fov: 55 },
      { t: [B.atChest, 12.4], pos: [[-71.2, 6.3, 2.3], [-71.6, 6.15, 1.9]], look: [-73.6, 5.7, 0.3], fov: 50 },
      { t: [12.4, B.read], pos: [[-68.6, 6.9, 2.6], [-68.4, 6.9, 2.3]], look: [[-72.6, 6.4, 0.9], [-72.6, 6.5, 0.8]], fov: 50, shake: () => shakeEnv(t, [[B.pick, 0.2, 0.3]]) },
      { t: [B.read, B.ender], pos: [() => off(H, [1.4, 0.15, 0.6]), () => off(H, [1.2, 0.12, 0.5])], look: () => off(H, [0, -0.3, 0]), fov: 45 },
      { t: [B.ender, B.stare], pos: [[-66.4, 7.0, 0.9], [-67.2, 6.95, 0.8]], look: [[-72, 6.6, -0.3], [-72.2, 6.8, -0.4]], fov: 50, ease: 'linear' },
      { t: [B.stare, 39.0], pos: [[EH[0] + 3.0, EH[1] - 0.2, EH[2] + 2.6], [EH[0] + 2.2, EH[1] - 0.1, EH[2] + 1.9]], look: () => EH, fov: [40, 30], ease: 'linear' },
      { t: [39.0, B.turn], pos: [() => off(H, [1.0, -0.1, 0.25]), () => off(H, [0.85, -0.1, 0.2])], look: () => H, fov: 40 },
      { t: [B.turn, B.gone], pos: [() => off(H, [1.7, 0.35, 1.5]), () => off(H, [1.5, 0.3, 1.3])], look: [() => off(EH, [0, -0.6, 0]), () => off(EH, [0, -0.5, 0])], fov: [50, 42] },
      { t: [B.gone, B.map], pos: [() => off(H, [-1.3, 0, -1.0]), () => off(H, [-1.1, 0, -0.8])], look: () => H, fov: 42, shake: () => shakeEnv(t, [[B.gone, 0.6, 0.4]]) },
      { t: [B.map, B.run], pos: [() => off(H, [1.6, 0.2, -1.2]), () => off(H, [1.4, 0.15, -1.0])], look: () => off(H, [0, -0.3, 0]), fov: 46 },
      { t: [B.run, 60.5], pos: [[-61.4, 6.6, 1.2], [-58.4, 6.6, 0.9]], look: [() => off(P, [0, 1.2, 0]), () => off(P, [0, 1.2, 0])], fov: 62, shake: 0.12 },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 1.0, saturation: 0.9, contrast: 1.08, grain: 0.02 };
    if (t > B.ender && t < B.gone) { post.vignette = 1.2 + prog(t, B.ender, B.gone) * 0.6; post.saturation = 0.7; post.letterbox = smooth(prog(t, B.ender, B.ender + 1)); }
    if (t > B.gone && t < B.gone + 0.12) post.flash = 0.8, post.flashColor = [0.8, 0.5, 1];
    if (t > B.gone && t < B.gone + 0.4) post.glitch = 0.6 * (1 - prog(t, B.gone, B.gone + 0.4));
    return { stage: C, post };
  }
  function cues() {
    return [
      ...hero.events(0, 60, 'stone'),
      { t: B.open, id: 'chestOpen', gain: 1 }, { t: B.open + 0.15, id: 'shine', gain: 0.8 }, { t: B.pick + 0.2, id: 'choir', gain: 0.7 },
      { t: B.ender, id: 'enderAmbient', gain: 0.25 }, ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => ({ t: B.stare + i * 0.72, id: 'heartbeat', gain: 0.5 + i * 0.04 })),
      { t: B.turn + 2.5, id: 'stinger', gain: 0.8 }, { t: B.gone, id: 'teleport', gain: 1 },
    ];
  }
  void clamp;
  return { update, cues, hero };
}
