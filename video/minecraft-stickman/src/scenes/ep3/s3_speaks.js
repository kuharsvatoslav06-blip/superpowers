// EP3 SCENE 3 — THE BLOCK SPEAKS. Day 21: "Ow." The block opens its eyes. Origin. Four thousand hits. "Can I still have dirt?"
import { Actor } from '../../engine/CharacterController.js';
import { shot, orbit } from '../../engine/CameraController.js';
import { burst } from '../../engine/Particles.js';
import { Poses, prog, smooth, Ease } from '../../engine/AnimationSystem.js';
import { L3, OX, OZ, TOP } from '../../story/ep3/stages.js';
import { talker, head, off } from '../util.js';
import { originTalk, originGlow, blinkEyes, arc } from './common.js';

const B = { mine: 1.2, hit: 6.0, look: 8.4, eyes: 10.2, back: 10.5, words: [10.5, 11.2, 11.9, 12.7], crazy: 14.4, listen: 20.4, hits: 28.0, sorry: 31.0, ask: 33.0, gift: 35.4, catch: 35.9 };
const AWAY = Math.atan2(OX - -1.2, OZ - 3.0);

export default function s3(W) {
  const S = W.stages.sky;
  const hero = new Actor(S.hero, { ground: S.ground, talk: talker('s3'), blinkSeed: 2.2,
    path: [[0, [OX, TOP, 2.0]], [B.back, [OX, TOP, 2.0]], [B.back + 0.45, [OX + 0.2, TOP, 3.2], 'out'], [B.crazy, [OX + 0.2, TOP, 3.2]], [B.crazy + 1.0, [-1.2, TOP, 3.0]], [B.listen, [-1.2, TOP, 3.0]], [B.listen + 1.2, [-0.2, TOP, 2.6]]],
    yaw: [[0, Math.PI], [B.crazy, Math.PI], [B.crazy + 0.3, 0.3], [B.crazy + 1.0, AWAY], [B.listen + 0.6, AWAY], [B.listen + 1.2, Math.PI + 0.3]],
    acts: [[0, 'idle'], [B.mine, 'mine', { rate: 2.2, sfx: 'mineStone' }], [B.hit, 'stand'], [B.look, 'lookAround'], [B.eyes, 'scared'], [B.crazy, 'backAway'], [B.crazy + 1.0, 'point'], [17.6, 'shrug'], [18.8, 'point'],
      [B.listen, 'walk'], [B.listen + 1.2, 'idle'], [B.hits, 'scared'], [B.sorry, 'idle'], [B.ask, 'shrug'], [B.gift - 0.2, 'idle'], [B.catch, 'holdUp'], [B.catch + 0.8, 'idle']],
    expr: [[0, 'determined'], [B.hit + 0.3, 'shocked'], [B.look, 'confused'], [B.eyes, 'terrified'], [B.crazy, 'scared'], [16.4, 'worried'], [B.listen, 'curious'], [24, 'shocked'], [26, 'curious'], [B.hits, 'shocked'], [B.sorry, 'worried'], [B.ask, 'curious'], [B.catch, 'excited']],
    eyes: [[0, [0, 0.5]], [B.hit, [0, 0.5]], [B.look, [0, 0]], [B.eyes, [0, 0.6]], [B.crazy, [0, 0]]],
    items: [[0, { r: 'stonePickaxe' }], [B.crazy, {}], [B.catch, { r: 'log' }], [B.catch + 2.5, {}]],
    jumps: [[B.back, 0.45, 0.4]],
    extra: (t, p) => {
      if (t > B.hit && t < B.look) { const f = Poses.mine(B.hit - 0.005 - B.mine, { rate: 2.2 }); Object.assign(p, f); }
      if (t > B.sorry && t < B.ask - 0.2) { p.lean += 0.55 * Math.sin(Math.PI * prog(t, B.sorry, B.ask - 0.2)); p.headPitch += 0.4; }
      return p; } });
  function update(t) {
    S.reset(); S.furnish('farm', t); S.light(L3.sky, t + 60, { cloudSpeed: 1.5 });
    const st = hero.state(t); S.hero.apply(st);
    const talk = originTalk('s3', t); const word = B.words.find(w => t > w && t < w + 0.3);
    const eyes = t < B.eyes ? 0 : blinkEyes(t, Ease.out(prog(t, B.eyes, B.eyes + 0.35)), 1.3);
    const lookAt = st.pos[0] < OX - 0.5 ? [-0.7, 0.2] : [0, 0.3];
    S.origin.apply({ kind: 'grass', eyes, talk, glow: originGlow('s3', t), look: t > 37 ? [0.9, -0.6] : lookAt, hop: word !== undefined ? Math.sin(Math.PI * (t - word) / 0.3) * 0.12 : 0,
      crack: t > B.mine && t < B.hit + 0.1 ? Math.min(4, Math.floor(prog(t, B.mine, B.hit) * 5)) : -1 });
    // the gift: one dirt block arcs from Origin into his hands
    if (t > B.gift && t < B.catch) { const h = S.hero.handWorld('r'); const k = prog(t, B.gift, B.catch); S.pool.put('dirt', arc([OX, 62.2, OZ], [h.x, h.y, h.z], 0.9, k), { centre: true, scale: 0.3, rot: [t * 8, t * 6, 0] }); }
    S.particles.add(burst({ t0: B.hit, pos: [OX, 61.9, 1.0], n: 16, colors: ['#62a03f', '#7a5434'], speed: 1.6, up: 2, gravity: 10, life: 0.6, size: 0.08, seed: 51 }));
    S.glowParticles.add(burst({ t0: B.eyes, pos: [OX, 61.5, OZ], n: 40, colors: ['#c8ffb0', '#ffffff'], speed: 1.2, up: 0.8, gravity: 0, life: 1.0, size: 0.07, seed: 52 }));
    S.glowParticles.add(burst({ t0: B.gift, pos: [OX, 62.1, OZ], n: 24, colors: ['#c8ffb0', '#ffffff'], speed: 1, up: 1, gravity: 0, life: 0.8, size: 0.06, seed: 53 }));
    const H = head(st), P = st.pos;
    const c = shot(t, [
      { t: [0, B.hit], pos: [[3.0, 62.4, 4.4], [2.6, 62.2, 4.0]], look: [OX, 61.7, 1.2], fov: 48 },
      { t: [B.hit, B.look], pos: () => off(H, [0.35, 0.05, -1.05]), look: () => H, fov: 38 },
      { t: [B.look, B.eyes], pos: [[4.4, 62.3, 1.6], [4.2, 62.3, 1.6]], look: [OX, 61.3, 1.3], fov: 45 },
      { t: [B.eyes, B.crazy], pos: [[OX + 0.45, 61.95, 3.1], [OX + 0.3, 61.85, 2.7]], look: [OX, 61.5, OZ], fov: 38 },
      { t: [B.crazy, B.listen], pos: [[-3.4, 62.5, 6.0], [-3.1, 62.5, 5.6]], look: () => off(P, [0.4, 1.2, -0.6]), fov: 44 },
      { t: [B.listen, B.hits], pos: () => orbit([OX, 61.5, OZ], 2.9, 0.15 + (t - B.listen) * 0.11, 0.5), look: [OX, 61.6, OZ], fov: 50 },
      { t: [B.hits, B.sorry], pos: () => off(H, [-0.5, 0.05, -1.0]), look: () => H, fov: 38 },
      { t: [B.sorry, B.gift], pos: [[3.8, 62.0, 2.0], [3.6, 62.0, 2.0]], look: [-0.1, 61.4, 1.6], fov: 46 },
      { t: [B.gift, 37.6], pos: [[2.6, 62.2, 4.4], [2.4, 62.2, 4.2]], look: () => off(P, [0.3, 1.2, -1.0]), fov: 48 },
      { t: [37.6, 42], pos: [[4, 63, 7], [9, 66, 13]], look: [OX, 61, 1], fov: 45 },
    ]);
    W.cam.apply({ ...c, t, handheld: t > B.hit && t < B.look ? 0.004 : 0.02 });
    const post = { vignette: 0.55, saturation: 1.08 };
    if (t > B.hit && t < B.look) { post.saturation = 0.75; post.vignette = 0.9; }
    if (t > B.eyes && t < B.eyes + 0.15) post.flash = 0.3;
    void smooth;
    return { stage: S, post };
  }
  function cues() {
    return [...hero.events(0, 42, 'grass'), { t: B.hit, id: 'mineStone', gain: 1 }, { t: B.hit + 0.02, id: 'recordStop', gain: 0.7 }, { t: B.eyes, id: 'originChime', gain: 0.8 },
      ...B.words.map(w => ({ t: w, id: 'place', gain: 0.4 })), { t: B.back + 0.45, id: 'land', gain: 0.6 }, { t: 17.0, id: 'cluck', gain: 0.6 }, { t: B.hits, id: 'stinger', gain: 0.35 },
      { t: B.gift, id: 'pop', gain: 0.8 }, { t: B.catch, id: 'blockRegen', gain: 0.5 }];
  }
  return { update, cues, hero };
}
