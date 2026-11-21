// EP3 SCENE 4 — FRIENDS. Days 22-45: ask nicely, no more pickaxe, a house around Origin, and the ghost of the world below.
import { Actor } from '../../engine/CharacterController.js';
import { shot, orbit } from '../../engine/CameraController.js';
import { burst, motes } from '../../engine/Particles.js';
import { prog, smooth, Ease } from '../../engine/AnimationSystem.js';
import { L3, OX, OZ, TOP, HOUSE_CELLS } from '../../story/ep3/stages.js';
import { mixLight } from '../../engine/EnvironmentManager.js';
import { talker, head, off } from '../util.js';
import { originTalk, originGlow, blinkEyes, arc, popIn } from './common.js';

const B = { wave: 1.2, gifts: [2.4, 3.1, 3.8], throwA: 5.0, release: 5.45, please: 7.6, build: 11.8, built: 15.0, inside: 15.0, night: 19.0, sit: 19.6, ghost: [22.4, 25.4, 27.6, 28.8], up: 30.0, pat: 31.6 };
const GIFTS = ['planks', 'glass', 'log'];
const STACK = [2.5, 61, 3.0];
const ORDER = HOUSE_CELLS.map((c, i) => ({ c, i, k: c[1] * 100 + Math.atan2(c[2], c[0]) })).sort((a, b) => a.k - b.k);

export default function s4(W) {
  const S = W.stages.sky;
  const hero = new Actor(S.hero, { ground: S.ground, talk: talker('s4'), blinkSeed: 0.9,
    path: [[0, [OX, TOP, 2.6]], [B.build - 0.2, [OX, TOP, 2.6]], [B.build, [3.4, TOP, 3.6]], [B.built, [3.4, TOP, 3.6]], [B.built + 0.01, [1.5, TOP, 1.5]], [B.night, [1.5, TOP, 1.5]], [B.sit, [OX, TOP, 2.6]], [B.up + 0.4, [OX, TOP, 2.6]], [B.pat - 0.2, [OX, TOP, 1.75]]],
    yaw: [[0, Math.PI], [B.throwA, Math.PI], [B.throwA + 0.2, 0.9], [B.release + 0.6, 0.9], [B.please, Math.PI], [B.build, Math.PI * 1.2], [B.built + 0.01, -2.35], [B.night, -2.35], [B.sit, 0], [B.up + 0.4, 0], [B.up + 0.8, Math.PI]],
    acts: [[0, 'idle'], [B.wave, 'wave'], [2.2, 'idle'], [B.throwA, 'swing', { rate: 2.2, sfx: null }], [B.release + 0.2, 'idle'], [B.please, 'idle'], [B.build, 'place', { rate: 6, sfx: null }], [B.built, 'idle'], [17.0, 'shrug'], [18.4, 'idle'],
      [B.sit, 'sit'], [B.up, 'stand'], [B.up + 0.4, 'walk'], [B.pat - 0.2, 'place', { rate: 1.2, sfx: null }], [B.pat + 0.8, 'idle']],
    expr: [[0, 'happy'], [B.throwA, 'determined'], [B.release + 0.3, 'smug'], [B.please, 'happy'], [B.build, 'determined'], [B.built, 'happy'], [17.0, 'confused'], [B.night, 'neutral'], [B.ghost[0], 'curious'], [B.ghost[0] + 1.5, 'shocked'], [B.ghost[2], 'worried'], [B.pat, 'relieved']],
    eyes: [[0, [0, 0.5]], [B.sit, [0, 0.4]], [B.ghost[0], [0, 1]], [B.up, [0, 0]], [B.pat, [0, 0.7]]],
    items: [[0, { r: 'stonePickaxe' }], [B.release, {}]] });
  function update(t) {
    S.reset(); S.furnish('farm', t);
    const nk = smooth(prog(t, B.night, B.night + 1.4)); S.light(nk > 0 ? mixLight(L3.sky, L3.night, nk) : L3.sky, t + 80, { cloudSpeed: 1.5 });
    const st = hero.state(t); S.hero.apply(st);
    const built = t > B.built;
    S.house.visible = built; S.roof.visible = built && !(t > B.inside && t < 18.6);
    if (t > B.build && !built) ORDER.forEach(({ c }, n) => { const a = B.build + (n / ORDER.length) * (B.built - B.build - 0.2); if (t > a) S.pool.put(c[3], [c[0], c[1], c[2]], { scale: popIn(t, a, 0.12) }); });
    // gifts from Origin
    GIFTS.forEach((g, i) => { const a = B.gifts[i]; if (t > a && t < B.build) { const k = Ease.out(prog(t, a, a + 0.6)); S.pool.put(g, arc([OX, 62.2, OZ], [STACK[0], STACK[1] + i * 0.5, STACK[2]], 1.0, k), { centre: true, scale: 0.5, rot: k < 1 ? [t * 6, t * 4, 0] : null }); } });
    // the pickaxe flies away into the void
    if (t > B.release && t < B.please + 1) { const h0 = [0.9, 62.3, 2.9]; const k = prog(t, B.release, B.release + 2.2); const p = arc(h0, [9, 46, 9], 3.2, k); S.thrownPick.visible = true; S.thrownPick.position.set(...p); S.thrownPick.rotation.set(t * 9, t * 3, 0); }
    const eyes = blinkEyes(t, t > B.ghost[3] + 2 ? 0.6 : 1, 0.4) * (t > B.pat + 0.6 ? 1 - 0.7 * prog(t, B.pat + 0.6, B.pat + 2.0) : 1);
    S.origin.apply({ kind: 'grass', eyes, talk: originTalk('s4', t), glow: Math.max(originGlow('s4', t), t > B.pat ? 0.5 * (1 - prog(t, B.pat + 2, 38)) : 0), look: t > B.sit && t < B.up ? [0, 0.6] : [0, 0.2] });
    // ghost of the world below
    const go = smooth(prog(t, B.ghost[0], B.ghost[1])) * (1 - smooth(prog(t, B.ghost[2], B.ghost[3])));
    if (go > 0.01) { S.below.set('ghost', { opacity: 0.32 * go }); S.cloudMat.opacity = 0.75 * (1 - go * 0.7); }
    S.glowParticles.add(burst({ t0: B.please, pos: [OX, 61.8, OZ], n: 30, colors: ['#c8ffb0', '#ffe0f0'], speed: 0.9, up: 1.2, gravity: 0, life: 1.6, size: 0.07, seed: 61 }));
    if (nk > 0.2) S.glowParticles.add(motes({ center: [0, 50, 0], extent: [60, 30, 60], n: 120, colors: ['#9ac4ff', '#ffffff'], size: 0.12, alpha: 0.4 * go + 0.15 * nk, seed: 62, speed: 0.2 }));
    const H = head(st), P = st.pos; const pk = S.thrownPick.position.toArray();
    const c = shot(t, [
      { t: [0, B.throwA], pos: [[3.6, 62.6, 4.8], [3.2, 62.4, 4.4]], look: [OX + 0.6, 61.3, 1.6], fov: 48 },
      { t: [B.throwA, B.please], pos: [[1.6, 62.8, 5.2], [2.2, 62.0, 6.0]], look: () => (t < B.release ? off(H, [0, -0.2, 0]) : pk), fov: 55 },
      { t: [B.please, 10.5], pos: [[OX + 0.6, 61.9, 2.4], [OX + 0.5, 61.85, 2.2]], look: [OX, 61.5, OZ], fov: 42 },
      { t: [10.5, B.build], pos: () => off(H, [0.3, 0, -1.0]), look: () => H, fov: 40 },
      { t: [B.build, B.built], pos: () => orbit([OX, 61, OZ], 9, 0.5 + (t - B.build) * 0.25, 5), look: [OX, 62, OZ], fov: 45 },
      { t: [B.inside, 18.6], pos: [[OX + 2.4, 66.2, OZ + 2.6], [OX + 2.0, 65.8, OZ + 2.2]], look: [OX + 0.4, 61.2, OZ + 0.4], fov: 50 },
      { t: [18.6, B.ghost[0]], pos: [[OX + 1.4, 61.6, 7.4], [OX + 1.2, 61.7, 7.0]], look: [OX, 62.0, 2.6], fov: 45 },
      { t: [B.ghost[0], B.ghost[2] + 0.2], pos: [[13, 69, 21], [17, 71, 25]], look: [[0, 42, 0], [-6, 32, -6]], fov: 55 },
      { t: [B.ghost[2] + 0.2, B.up], pos: () => off(H, [0.4, 0, 1.1]), look: () => H, fov: 40 },
      { t: [B.up, 38], pos: [[OX + 0.3, 62.3, 4.8], [OX + 0.25, 62.2, 4.4]], look: [OX, 61.1, OZ + 0.6], fov: 45 },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 0.5 + nk * 0.4, saturation: 1.08 - nk * 0.15 };
    if (go > 0.01) { post.tint = [0.85, 1.0, 1.2]; post.tintAmt = 0.12 * go; }
    return { stage: S, post };
  }
  function cues() {
    const out = [...hero.events(0, 38, 'grass'), ...B.gifts.map(g => ({ t: g, id: 'pop', gain: 0.7 })), ...B.gifts.map(g => ({ t: g + 0.6, id: 'place', gain: 0.5 })), { t: B.release, id: 'whoosh', gain: 0.8 }, { t: B.please, id: 'originChime', gain: 0.5 }];
    ORDER.forEach((_, n) => { if (n % 4 === 0) out.push({ t: B.build + (n / ORDER.length) * (B.built - B.build - 0.2), id: 'place', gain: 0.45 }); });
    out.push({ t: B.sit, id: 'bedLie', gain: 0.3 }, { t: B.ghost[0], id: 'choir', gain: 0.45 }, { t: B.pat, id: 'originChime', gain: 0.3 });
    return out;
  }
  return { update, cues, hero };
}
