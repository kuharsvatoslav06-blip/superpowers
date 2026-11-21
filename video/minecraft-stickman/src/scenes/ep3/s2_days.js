// EP3 SCENE 2 — DAYS 2-20 montage: stone phase + cobble generator (falls off twice), the chest (sapling, ice, lava),
// cave phase (a spider out of the block), day 20: farm, tree, Nugget and Also Nugget.
import { Actor } from '../../engine/CharacterController.js';
import { shot, orbit } from '../../engine/CameraController.js';
import { burst, motes } from '../../engine/Particles.js';
import { Ease, prog, smooth, clamp, lerp } from '../../engine/AnimationSystem.js';
import { L3, OX, OZ, TOP } from '../../story/ep3/stages.js';
import { mixLight } from '../../engine/EnvironmentManager.js';
import { talker, head, off } from '../util.js';
import { popIn } from './common.js';

const B = { mine: 1.2, fall1: 4.4, up1: 5.3, fall2: 6.6, up2: 7.6, chest: 8.6, open: 10.3, lookUp: 16.6, cave: 19.8, crack: 22.4, spider: 22.6, words: [23.7, 24.3, 24.9, 25.5], fight: 26.2, poof: 28.8, farm: 30.0, sit: 35.0, sunset: 36.5 };

export default function s2(W) {
  const S = W.stages.sky;
  const hero = new Actor(S.hero, { ground: S.ground, talk: talker('s2'), blinkSeed: 1.1,
    path: [[0, [2.0, TOP, 0.5]], [B.fall1 - 1.0, [2.0, TOP, 0.5]], [B.fall1, [1.4, TOP, -2.3], 'inOut'], [B.up1 + 0.3, [1.4, TOP, -2.3]], [B.up1 + 0.5, [1.4, TOP, -1.6]], [B.fall2 - 0.6, [1.4, TOP, -1.6]], [B.fall2 - 0.3, [2.4, TOP, -1.0]], [B.fall2, [2.4, TOP, -2.4], 'out'], [B.up2, [2.4, TOP, -2.4]],
      [B.chest - 0.01, [2.4, TOP, -2.4]], [B.chest, [OX, TOP, 2.2]], [B.cave - 0.01, [OX, TOP, 2.2]], [B.cave, [OX, TOP, 2.0]], [B.spider + 0.2, [OX, TOP, 2.0]], [B.spider + 0.6, [OX + 0.3, TOP, 2.8], 'out'], [B.farm - 0.01, [OX + 0.3, TOP, 2.8]],
      [B.farm, [-1.4, TOP, 3.2]], [B.sit - 0.6, [-1.4, TOP, 3.2]], [B.sit, [OX, TOP, 4.78]]],
    yaw: [[0, Math.PI / 2], [B.fall1 - 1.0, Math.PI / 2], [B.fall1 - 0.7, 0.2], [B.up1 + 0.5, 0.2], [B.fall2 - 0.6, Math.PI], [B.up2, Math.PI], [B.chest, Math.PI], [B.lookUp, Math.PI], [B.cave, Math.PI], [B.farm, Math.PI * 0.8], [B.sit - 0.6, 0.6], [B.sit, 0]],
    acts: [[0, 'idle'], [B.mine, 'mine', { rate: 2.2, sfx: 'mineStone' }], [B.fall1 - 1.0, 'backAway'], [B.fall1, 'idle'], [B.up1, 'land'], [B.up1 + 0.4, 'idle'], [B.fall2 - 0.6, 'walk'], [B.fall2, 'idle'], [B.up2 - 0.1, 'land'],
      [B.chest, 'idle'], [B.open - 0.4, 'place', { rate: 1.5, sfx: null }], [B.open + 0.4, 'idle'], [B.lookUp, 'lookUp'], [B.cave, 'mine', { rate: 2.2, sfx: 'mineStone' }], [B.spider, 'scared'], [B.fight, 'swing', { rate: 2.5, sfx: 'whoosh', gain: 0.5 }], [B.poof + 0.2, 'handsOnHips'],
      [B.farm, 'idle'], [B.sit - 0.6, 'walk'], [B.sit, 'sit']],
    expr: [[0, 'determined'], [B.fall1, 'terrified'], [B.up1 + 0.3, 'annoyed'], [B.fall2, 'terrified'], [B.up2 + 0.2, 'deadpan'], [B.chest, 'curious'], [B.open, 'excited'], [B.lookUp, 'curious'], [B.cave, 'determined'], [B.spider, 'shocked'],
      [B.words[0], 'terrified'], [B.fight, 'yell'], [B.poof + 0.2, 'smug'], [B.farm, 'happy'], [B.sit, 'relieved']],
    eyes: [[0, [0, 0.3]], [B.chest, [0, 0.4]], [B.lookUp, [0, -0.8]], [B.cave, [0, 0.3]], [B.farm, [0, 0]]],
    items: [[0, { r: 'woodPickaxe' }], [B.chest, {}], [B.cave, { r: 'stonePickaxe' }], [B.fight - 0.3, { r: 'sword' }], [B.farm, {}]],
    extra: (t, p) => { // hanging from the edge after the falls
      for (const [a, b] of [[B.fall1, B.up1], [B.fall2, B.up2]]) if (t > a && t < b) { p.lShP = 2.9; p.rShP = 2.9; p.lEl = 0.2; p.rEl = 0.2; p.lShR = 0.1; p.rShR = 0.1; p.lHipP = 0.1 + Math.sin(t * 9) * 0.3; p.rHipP = 0.1 - Math.sin(t * 9) * 0.3; p.headPitch = -0.4; }
      return p; } });
  function update(t) {
    S.reset();
    const phase = t < B.farm ? 'gen5' : 'farm'; S.furnish(phase, t);
    const ss = smooth(prog(t, B.sunset, 46)); S.light(ss > 0 ? mixLight(L3.sky, L3.sunset, ss) : L3.sky, t + 40, { cloudSpeed: 2 });
    const st = hero.state(t);
    for (const [a, b] of [[B.fall1, B.up1], [B.fall2, B.up2]]) if (t > a && t < b) { const k = Ease.out(prog(t, a, a + 0.25)) * (1 - Ease.inOut(prog(t, b - 0.35, b))); st.pos[1] -= 1.75 * k; st.shadow = 0; }
    S.hero.apply(st);
    // Origin by phase
    let kind = 'stone'; if (t > B.cave) kind = 'coal_ore'; if (t > B.spider + 0.2) kind = 'stone'; if (t > B.farm) kind = 'grass';
    const isChest = t > B.chest && t < B.cave;
    S.origin.apply({ kind, base: [OX, t < B.farm ? 60 : 61, OZ], visible: !isChest && !(t > B.crack && t < B.spider + 0.35), scale: t > B.spider + 0.2 && t < B.spider + 0.6 ? popIn(t, B.spider + 0.35) || 0.001 : 1,
      crack: (t > B.cave + 0.3 && t < B.crack) ? Math.floor(prog(t, B.cave + 0.3, B.crack) * 4.99) : -1 });
    S.chest.group.visible = isChest; if (isChest) { S.chest.group.scale.setScalar(popIn(t, B.chest, 0.3) || 0.001); const o = Ease.out(prog(t, B.open, B.open + 0.4)); S.chest.update(o, o * 0.8); }
    // cobble being mined at the generator
    if (t < B.chest) { const cyc = (t - B.mine) % 1.6; S.pool.put('cobble', [3, 60, 0], { scale: t > B.mine && cyc < 0.25 ? popIn(cyc, 0.0, 0.25) : 1 }); }
    // spider
    if (t > B.spider && t < B.poof) {
      const k = popIn(t, B.spider, 0.35); const hop = t > B.fight ? Math.abs(Math.sin((t - B.fight) * 5)) * 0.4 : 0; const z = lerp(0.5, 1.2, smooth(prog(t, B.fight, B.poof)));
      S.spider.apply({ pos: [OX, 60.0 + (t < B.spider + 0.35 ? 0 : 1.0) + hop * 0, z + (t < B.spider + 0.35 ? 0 : 0.2)], yaw: 0, scale: k * 1.2, walk: t * 1.5, visible: true, hop });
    }
    S.particles.add(burst({ t0: B.crack, pos: [OX, 60.5, OZ], n: 30, colors: ['#7d7d7d', '#222222', '#5a5a5a'], speed: 2.6, up: 3, gravity: 12, life: 0.8, size: 0.11, seed: 41 }));
    S.particles.add(burst({ t0: B.poof, pos: [OX, 61.4, 1.6], n: 40, colors: ['#ffffff', '#dddddd'], speed: 2, up: 1.5, gravity: 1, life: 0.8, size: 0.16, seed: 42 }));
    S.glowParticles.add(burst({ t0: B.chest, pos: [OX, 60.5, OZ], n: 40, colors: ['#ffe08a', '#ffffff'], speed: 1.8, up: 1.4, gravity: 0, life: 0.9, size: 0.09, seed: 43 }));
    S.glowParticles.add(burst({ t0: B.open + 0.2, pos: [OX, 61.2, OZ], n: 50, colors: ['#ffe08a', '#9cc4f5', '#e8661a'], speed: 1.3, up: 2, gravity: 0, life: 1.6, size: 0.08, seed: 44 }));
    if (t > B.sunset) S.particles.add(motes({ center: [0.5, 63, 0.5], extent: [18, 5, 18], n: 40, colors: ['#ffe0b0'], size: 0.04, alpha: 0.4, seed: 21 }));
    const H = head(st), P = st.pos;
    const zoomCut = B.words.findIndex((w, i) => t >= w && t < (B.words[i + 1] ?? B.fight));
    const c = shot(t, [
      { t: [0, B.fall1 - 1.0], pos: [[5.6, 62.6, 3.6], [5.3, 62.6, 3.3]], look: [2.6, 61.2, 0.2], fov: 50 },
      { t: [B.fall1 - 1.0, B.fall2 - 0.6], pos: [[2.6, 61.2, -5.4], [2.4, 61.3, -5.2]], look: [1.4, 60.9, -1.8], fov: 50, shake: () => (t > B.fall1 && t < B.fall1 + 0.3 ? 0.4 : 0) },
      { t: [B.fall2 - 0.6, B.chest], pos: [[4.4, 59.4, -4.6], [4.6, 59.2, -4.9]], look: [2.4, 60.5, -2.2], fov: 55, shake: () => (t > B.fall2 && t < B.fall2 + 0.3 ? 0.4 : 0) },
      { t: [B.chest, B.open], pos: [[4.0, 63.2, 5.0], [3.4, 62.8, 4.4]], look: [OX, 60.8, OZ], fov: 50 },
      { t: [B.open, B.lookUp], pos: () => off(H, [-0.7, 0.35, 1.2]), look: [OX, 60.8, OZ], fov: 46 },
      { t: [B.lookUp, B.cave], pos: [[1.2, 61.3, 3.4], [1.3, 61.2, 3.6]], look: () => off(H, [0, 0.6, 0]), fov: 50 },
      { t: [B.cave, B.spider], pos: [[2.8, 62.0, 3.2], [2.6, 62.0, 3.0]], look: [OX, 61.0, 1.0], fov: 50 },
      { t: [B.spider, B.words[0]], pos: [[-1.4, 61.6, 2.0], [-1.5, 61.6, 2.1]], look: [OX, 61.2, 1.2], fov: 55, shake: () => (t < B.spider + 0.3 ? 0.4 : 0.05) },
      { t: [B.words[0], B.fight], pos: () => off(H, [0, 0.02, -(0.45 + 0.3 * (3 - Math.max(0, zoomCut)))]), look: () => H, fov: () => 30 + zoomCut * 4 },
      { t: [B.fight, B.farm], pos: [[-2.0, 62.0, 3.8], [-1.6, 62.0, 3.6]], look: [OX, 61.2, 1.6], fov: 52, shake: () => (t > B.poof && t < B.poof + 0.3 ? 0.3 : 0) },
      { t: [B.farm, 33.0], pos: () => orbit([OX, 60, OZ], 13, 0.4 + (t - B.farm) * 0.12, 6), look: [OX, 60.5, OZ], fov: 45 },
      { t: [33.0, B.sit], pos: [[-1.6, 61.8, -1.2], [-1.4, 61.8, -1.0]], look: [-1.6, 61.4, -3.3], fov: 44 },
      { t: [B.sit, 41.0], pos: [[0.6, 59.2, 8.6], [0.6, 59.6, 8.2]], look: () => off(P, [0, 0.7, 0]), fov: 46 },
      { t: [41.0, 48], pos: [[6, 63, 12], [14, 68, 22]], look: [OX, 61, OZ], fov: 45 },
    ]);
    W.cam.apply({ ...c, t, handheld: t > B.words[0] && t < B.fight ? 0 : 0.02 });
    const post = { vignette: 0.5 + ss * 0.2, saturation: 1.1 };
    for (const d of [B.chest, B.cave, B.farm]) if (t > d - 0.05 && t < d + 0.15) post.flash = 0.5;
    if (t > B.spider && t < B.spider + 0.2) post.rgb = 1;
    void clamp;
    return { stage: S, post };
  }
  function cues() {
    const out = [...hero.events(0, 48, 'grass').filter(e => e.id !== 'step' || e.t > B.farm)];
    out.push({ t: B.fall1, id: 'whooshDown', gain: 0.5 }, { t: B.fall1 + 0.25, id: 'land', gain: 0.7 }, { t: B.fall1 + 0.3, id: 'comedyBonk', gain: 0.4 }, { t: B.fall2, id: 'whooshDown', gain: 0.5 }, { t: B.fall2 + 0.25, id: 'land', gain: 0.7 });
    out.push({ t: B.chest, id: 'blockRegen', gain: 0.7 }, { t: B.open, id: 'chestOpen', gain: 1 }, { t: B.open + 0.2, id: 'shine', gain: 0.6 });
    out.push({ t: B.crack, id: 'breakStone', gain: 1 }, { t: B.spider, id: 'spiderHiss', gain: 1 }, ...B.words.map(w => ({ t: w, id: 'impact', gain: 0.35 })), { t: B.poof, id: 'pop', gain: 1 }, { t: B.poof + 0.05, id: 'spiderHiss', gain: 0.5 });
    out.push({ t: B.farm + 1.5, id: 'cluck', gain: 0.7 }, { t: 34.0, id: 'cluck', gain: 0.8 }, { t: B.sit, id: 'bedLie', gain: 0.3 });
    return out;
  }
  return { update, cues, hero };
}
