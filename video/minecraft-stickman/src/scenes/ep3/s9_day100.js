// EP3 SCENE 9 — DAY 100. He puts Origin back in the middle of the island; the world below grows back.
// "Thank you, player. Now... rest." Far away, a new block and a new player. "Don't jump."
import { Actor } from '../../engine/CharacterController.js';
import { shot, orbit } from '../../engine/CameraController.js';
import { burst, motes, swirl } from '../../engine/Particles.js';
import { prog, smooth, lerp, Ease } from '../../engine/AnimationSystem.js';
import { L3, OX, OZ, TOP } from '../../story/ep3/stages.js';
import { mixLight } from '../../engine/EnvironmentManager.js';
import { talker, head, off } from '../util.js';
import { originTalk, originGlow, blinkEyes } from './common.js';

export const B9 = { place: 5.4, grow: 6.0, beam: 7.2, ring0: 7.8, ocean: 12.6, mountain: 14.0, village: 15.4, kneel: 17.4, thank: 22.8, close: 24.8, sunset: 26.0, quiet: 27.2, travel: 33.6, far: 37.4, turn: 39.4, black: 41.0 };
const B = B9;
const NB = [-70.5, 70.5, -95.5];

export default function s9(W) {
  const S = W.stages.sky; const BW = S.below;
  const hero = new Actor(S.hero, { ground: S.ground, talk: talker('s9'), blinkSeed: 1.9,
    path: [[0, [1.7, TOP, 2.9]], [1.0, [1.7, TOP, 2.9]], [B.place - 0.6, [OX, TOP, 1.65], 'inOut'], [B.kneel - 0.6, [OX, TOP, 1.65]], [B.kneel, [OX, TOP, 1.85]]],
    yaw: [[0, -2.3], [B.place - 0.6, Math.PI], [B.beam, Math.PI], [B.beam + 0.6, Math.PI * 0.85], [B.kneel - 0.6, Math.PI], [B.turn, Math.PI], [B.turn + 0.25, Math.PI * 2 - 2.5]],
    acts: [[0, 'holdSign'], [1.0, 'walk'], [B.place - 0.6, 'holdSign'], [B.place, 'place', { rate: 1.4, sfx: null }], [B.place + 0.7, 'stand'], [B.beam, 'lookAround'], [10.0, 'holdUp'], [11.5, 'idle'], [B.kneel, 'sit']],
    expr: [[0, 'determined'], [B.place, 'curious'], [B.beam, 'shocked'], [9.2, 'excited'], [B.kneel, 'happy'], [B.thank, 'curious'], [B.close, 'worried'], [26.2, 'relieved'], [B.turn, 'shocked']],
    eyes: [[0, [0, 0.6]], [B.place + 0.8, [0, 0]], [B.beam, [0, 1]], [10.0, [0, 0]], [B.kneel, [0, 0.6]], [B.turn, [-0.8, 0]]],
    look: [[0, [0, 0]], [B.turn, [0, 0]], [B.turn + 0.2, [0.3, -0.1]]] });
  const stranger = new Actor(S.stranger, { ground: () => NB[1] + 0.5, path: [[0, [NB[0], NB[2]]]], yaw: [[0, 0.9]], acts: [[0, 'idle']], expr: [[0, 'curious']], eyes: [[0, [0, 0.8]]], look: [[0, [0, 0.55]]] });
  function update(t) {
    S.reset(); S.furnish('garden', t);
    const ss = smooth(prog(t, B.sunset, B.quiet + 3)); S.light(mixLight(L3.final, L3.sunset, ss * 0.85), t + 200, { cloudSpeed: 1.2 });
    const st = hero.state(t); S.hero.apply(st);
    // Origin: carried, placed, grows back to full size, glows, falls asleep
    const gk = Ease.outBack(prog(t, B.grow, B.grow + 1.2)); const sc = t < B.grow ? 0.5 : lerp(0.5, 1, gk);
    let base = [OX, 61, OZ];
    if (t < B.place + 0.35) { const l = S.hero.handWorld('l'), r = S.hero.handWorld('r'); const m = [(l.x + r.x) / 2, (l.y + r.y) / 2 - 0.1, (l.z + r.z) / 2]; const k = Ease.inOut(prog(t, B.place, B.place + 0.35)); base = [lerp(m[0], OX, k), lerp(m[1], 61, k), lerp(m[2], OZ, k)]; }
    const eyes = t < B.place ? 0.25 : blinkEyes(t, t > B.close ? 1 - prog(t, B.close, B.close + 0.8) : 1, 0.9);
    const glow = Math.max(originGlow('s9', t), t > B.grow && t < B.close + 1 ? 0.8 * (1 - prog(t, B.close, B.close + 1)) : 0);
    S.origin.apply({ kind: 'grass', base, scale: sc, eyes, talk: originTalk('s9', t), glow, look: [0, 0.3] });
    // beam and the world below growing back in rings
    if (t > B.beam && t < B.quiet) { S.beam.visible = true; const bk = prog(t, B.beam, B.beam + 0.6) * (1 - prog(t, 13, 16)); S.beam.scale.set(0.2 + bk * 1.6, 1, 0.2 + bk * 1.6); S.beam.position.set(OX, 30, OZ); S.beam.material.opacity = 0.55 * bk; }
    if (t > B.ring0) BW.set('real', { grow: i => Ease.out(prog(t, B.ring0 + i * 0.65, B.ring0 + 0.9 + i * 0.65)) });
    S.cloudMat.opacity = 0.75 * (1 - smooth(prog(t, 8, 11)) * 0.75);
    // the far new block + stranger
    if (t > B.travel - 2) { S.newBlock.visible = true; const ss2 = stranger.state(t); S.stranger.apply(ss2); S.stranger.root.visible = true; }
    S.glowParticles.add(burst({ t0: B.grow, pos: [OX, 61.8, OZ], n: 120, colors: ['#c8ffb0', '#ffffff', '#9dff8a'], speed: 3, up: 2, gravity: 0, life: 1.4, size: 0.1, seed: 140 }));
    if (t > B.beam && t < 14) S.glowParticles.add(swirl({ center: [OX, 20, OZ], radius: 3, height: 40, n: 120, colors: ['#e0ffd8', '#ffffff'], size: 0.25, speed: 0.6, seed: 141, inward: true, intensity: () => 1 - prog(t, 12, 14) }));
    S.particles.add(motes({ center: [0.5, 62.5, 0.5], extent: [14, 4, 14], n: 50, colors: ['#fff6c8'], size: 0.04, alpha: 0.5, seed: 142 }));
    const H = head(st), P = st.pos; const SH = head(st, t > B.kneel ? 0.95 : 1.72); const VX = BW.VX, VZ = BW.VZ; const [ox, oz] = BW.ocean; const [px, pz] = BW.peak;
    const c = shot(t, [
      { t: [0, B.place - 0.6], pos: [[-1.3, 62.7, -0.7], [-1.1, 62.6, -0.5]], look: () => off(P, [0, 1.0, 0]), fov: 50 },
      { t: [B.place - 0.6, B.beam], pos: [[OX + 1.2, 61.5, OZ + 1.6], [OX + 1.0, 61.4, OZ + 1.4]], look: [OX, 61.5, OZ], fov: 46 },
      { t: [B.beam, 9.4], pos: [[6, 64, 9], [10, 70, 15]], look: [[OX, 55, OZ], [OX, 35, OZ]], fov: 55 },
      { t: [9.4, B.ocean], pos: [[18, 78, 30], [28, 84, 44]], look: [[0, 30, 0], [0, 22, 0]], fov: 60, ease: 'linear' },
      { t: [B.ocean, B.mountain], pos: [[ox - 14, 21, oz + 12], [ox + 4, 19, oz - 2]], look: [[ox + 6, 13, oz - 8], [ox + 24, 15, oz - 20]], fov: 55, ease: 'linear' },
      { t: [B.mountain, B.village], pos: [[px + 26, BW.peakH + 6, pz + 22], [px + 18, BW.peakH + 8, pz + 16]], look: [px, BW.peakH - 4, pz], fov: 50, ease: 'linear' },
      { t: [B.village, B.kneel], pos: [[VX + 18, 28, VZ + 20], [VX + 14, 25, VZ + 16]], look: [VX, 16, VZ], fov: 50, ease: 'linear' },
      { t: [B.kneel, B.thank], pos: [[OX + 2.6, 62.4, 3.8], [OX + 2.3, 62.3, 3.5]], look: () => off(P, [0, 0.6, -0.8]), fov: 45 },
      { t: [B.thank, B.quiet], pos: [[OX + 1.7, 62.0, OZ + 0.9], [OX + 1.5, 61.95, OZ + 0.8]], look: [OX, 61.5, OZ], fov: 44 },
      { t: [B.quiet, B.travel], pos: [[-1.4, 62.4, 1.0], [18, 74, 26]], look: [[OX, 61.6, OZ + 1.2], [OX, 58, OZ]], fov: 46, ease: 'inOut' },
      { t: [B.travel, B.far], pos: [[18, 74, 26], [NB[0] + 8, NB[1] + 2.5, NB[2] + 9]], look: [[OX, 58, OZ], [NB[0], NB[1] + 1, NB[2]]], fov: [46, 40], ease: 'inOut' },
      { t: [B.far, B.turn], pos: [[NB[0] + 4.6, NB[1] + 1.9, NB[2] + 5.0], [NB[0] + 4.2, NB[1] + 1.8, NB[2] + 4.6]], look: [NB[0], NB[1] + 1.3, NB[2]], fov: 40 },
      { t: [B.turn, 50], pos: () => off(SH, [-0.5, 0.1, -0.75]), look: () => SH, fov: 40 },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 0.5 + ss * 0.2, saturation: 1.12 };
    if (t > B.grow && t < B.grow + 0.3) post.flash = 0.5 * (1 - prog(t, B.grow, B.grow + 0.3));
    if (t > B.black) post.fade = smooth(prog(t, B.black, B.black + 0.25));
    return { stage: S, post, noSubs: t > B.black + 0.3 };
  }
  function cues() {
    return [...hero.events(0, B.place, 'grass'), { t: B.place + 0.3, id: 'place', gain: 0.8 }, { t: B.grow, id: 'shine', gain: 0.9 }, { t: B.grow, id: 'originChime', gain: 0.7 }, { t: B.beam, id: 'portalIgnite', gain: 0.7 },
      { t: B.ring0, id: 'worldRegrow', gain: 1, dur: 5.5 }, { t: B.ring0 + 0.3, id: 'choir', gain: 0.6 }, { t: B.ocean, id: 'birds', gain: 0.6, dur: 14 }, { t: B.kneel, id: 'bedLie', gain: 0.3 }, { t: B.close + 0.4, id: 'sadSting', gain: 0.4 },
      { t: B.far - 0.1, id: 'windGust', gain: 0.5 }, { t: B.turn, id: 'whoosh', gain: 0.5 }, { t: B.turn + 0.1, id: 'stinger', gain: 0.6 }];
  }
  return { update, cues, hero };
}
