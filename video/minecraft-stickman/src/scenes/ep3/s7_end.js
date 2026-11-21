// EP3 SCENE 7 — THE END PHASE. Day 80: black sky, end stone, Origin is smaller. "Every block I give you is a piece of me."
import { Actor } from '../../engine/CharacterController.js';
import { shot, orbit } from '../../engine/CameraController.js';
import { burst, motes, swirl } from '../../engine/Particles.js';
import { prog, smooth, lerp, Ease } from '../../engine/AnimationSystem.js';
import { L3, OX, OZ, TOP } from '../../story/ep3/stages.js';
import { talker, head, off } from '../util.js';
import { originTalk, originGlow, blinkEyes, arc } from './common.js';

const B = { small: 6.2, piece: 10.8, pieceEnd: 11.6, look: 14.2, tree: 14.6, chick: 15.4, back: 16.4, done: 17.4, hand: 18.0, need: 20.2, walk: 24.0 };
export const SCALE7 = 0.6;

export default function s7(W) {
  const S = W.stages.sky;
  const hero = new Actor(S.hero, { ground: S.ground, talk: talker('s7'), blinkSeed: 1.7,
    path: [[0, [1.5, TOP, 1.6]], [B.walk, [1.5, TOP, 1.6]], [B.walk + 1.0, [OX, TOP, 2.6]], [B.walk + 2.2, [OX, TOP, 4.0]], [B.walk + 4.0, [3.5, TOP, 3.4]], [B.walk + 7.0, [3.6, TOP, -2.4]]],
    yaw: [[0, -2.3], [B.look, -2.3], [B.look + 0.4, -0.8], [B.chick, 2.4], [B.back, -2.3], [B.walk, -2.3], [B.walk + 0.3, 0]],
    acts: [[0, 'idle'], [B.small - 0.5, 'idle'], [B.look, 'lookAround'], [B.back, 'scared'], [B.done, 'idle'], [B.hand, 'place', { rate: 0.6, sfx: null }], [B.need - 0.6, 'stand'], [B.walk, 'walk']],
    expr: [[0, 'worried'], [B.small, 'shocked'], [B.piece, 'worried'], [B.look, 'curious'], [B.back, 'shocked'], [B.done, 'determined'], [B.need, 'determined'], [22.4, 'worried'], [B.walk, 'determined']],
    eyes: [[0, [0, 0.4]], [B.small, [0, 0.8]], [B.look, [0, 0]], [B.back, [0, 0.8]], [B.walk, [0, 0]]] });
  function update(t) {
    S.reset(); S.furnish('end', t); S.light(L3.end, t + 140, {});
    const st = hero.state(t); S.hero.apply(st);
    const sc = t < B.piece ? SCALE7 + 0.02 : lerp(SCALE7 + 0.02, SCALE7, prog(t, B.piece, B.piece + 0.3));
    const eyes = blinkEyes(t, t > B.need ? 0.55 : 0.85, 0.5);
    S.origin.apply({ kind: 'end_stone', scale: sc, eyes, talk: originTalk('s7', t), glow: originGlow('s7', t) * 0.6, look: [0, 0.5] });
    if (t > B.piece && t < B.pieceEnd) { const h = S.hero.handWorld('r'); const k = Ease.inOut(prog(t, B.piece, B.pieceEnd)); S.pool.put('end_stone', arc([OX, 61.6, OZ], [h.x, h.y, h.z], 0.6, k), { centre: true, scale: 0.18, rot: [t * 5, t * 7, 0] }); }
    S.glowParticles.add(swirl({ center: [OX, 61.2, OZ], radius: 0.6, height: 1.4, n: 26, colors: ['#c8b0ff', '#ffffff'], size: 0.05, speed: 0.4, seed: 91, intensity: () => 0.8 }));
    S.glowParticles.add(motes({ center: [0, 62, 0], extent: [30, 12, 30], n: 120, colors: ['#b080ff', '#e0d0ff'], size: 0.06, alpha: 0.5, seed: 92, speed: 0.3 }));
    S.glowParticles.add(burst({ t0: B.piece, pos: [OX, 61.6, OZ], n: 30, colors: ['#e0d0ff', '#ffffff'], speed: 1.2, up: 1, gravity: 0, life: 0.9, size: 0.06, seed: 93 }));
    const H = head(st), P = st.pos;
    const c = shot(t, [
      { t: [0, B.small], pos: () => orbit([OX, 61, OZ], 13, 2.2 + t * 0.08, 5), look: [OX, 61.5, OZ], fov: 46 },
      { t: [B.small, 8.2], pos: [[OX + 1.1, 62.5, OZ + 1.6], [OX + 0.9, 62.2, OZ + 1.3]], look: [OX, 61.3, OZ], fov: 44 },
      { t: [8.2, B.piece], pos: [[OX + 0.8, 61.8, OZ + 1.25], [OX + 0.7, 61.75, OZ + 1.1]], look: [OX, 61.3, OZ], fov: 42 },
      { t: [B.piece, B.look], pos: [[1.4, 66.2, 3.0], [1.2, 65.8, 2.8]], look: () => off(P, [-0.5, 0.6, -0.4]), fov: 50 },
      { t: [B.look, B.tree], pos: () => off(H, [0.4, 0, -1.0]), look: () => H, fov: 40 },
      { t: [B.tree, B.chick], pos: [[-1.5, 63.5, 7.5], [-1.8, 64.5, 7.6]], look: [-3.6, 64.5, 4.4], fov: 45 },
      { t: [B.chick, B.back], pos: [[-0.4, 62.2, -6.0], [-0.5, 62.1, -5.7]], look: [-1.6, 61.4, -3.3], fov: 42 },
      { t: [B.back, B.need], pos: () => off(H, [-0.75, 0.05, -0.75]), look: () => H, fov: 40 },
      { t: [B.need, B.walk], pos: [[OX - 0.7, 61.8, OZ + 1.3], [OX - 0.6, 61.75, OZ + 1.15]], look: [OX, 61.3, OZ], fov: 40 },
      { t: [B.walk, 32], pos: [[6.0, 63.0, 7.5], [8.5, 64.0, 2.0]], look: () => off(P, [0, 1.1, 0]), fov: 46 },
    ]);
    W.cam.apply({ ...c, t });
    if (t > B.small && t < B.walk) S.roof.visible = false;
    const post = { vignette: 0.95, saturation: 0.95, tint: [0.95, 0.85, 1.2], tintAmt: 0.08 };
    void smooth;
    return { stage: S, post };
  }
  function cues() {
    return [{ t: 0.2, id: 'enderAmbient', gain: 0.4 }, { t: B.small, id: 'sadSting', gain: 0.6 }, { t: B.piece, id: 'pop', gain: 0.6 }, { t: B.piece + 0.05, id: 'originChime', gain: 0.4 }, { t: B.back, id: 'stinger', gain: 0.35 },
      { t: B.hand, id: 'originChime', gain: 0.3 }, ...hero.events(B.walk, 32, 'stone')];
  }
  return { update, cues, hero };
}
