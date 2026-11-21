// EP3 SCENE 6 — THE SIGN. Day 68: bridging to the edge of the world, another island, "DON'T TRUST THE FIRST BLOCK."
// Origin remembers the last player (sepia flashback). "...He jumped."
import { Actor } from '../../engine/CharacterController.js';
import { shot } from '../../engine/CameraController.js';
import { burst, motes } from '../../engine/Particles.js';
import { prog, smooth, lerp } from '../../engine/AnimationSystem.js';
import { L3, OX, OZ, TOP, FAR } from '../../story/ep3/stages.js';
import { talker, head, off } from '../util.js';
import { originTalk, originGlow, blinkEyes } from './common.js';

const B = { bridge0: 1.0, bridge1: 8.0, arrive: 9.6, sign: 11.4, look: 14.0, home: 17.6, flash0: 20.6, frenzy: 24.4, flash1: 28.8, where: 29.2, jumped: 31.0, gulp: 33.6 };
const BX0 = 7, BX1 = 47;
const SIGN_LINES = ["DON'T TRUST", 'THE FIRST', 'BLOCK.'];
const endX = t => BX0 + (BX1 - BX0) * prog(t, B.bridge0, B.bridge1);

export default function s6(W) {
  const S = W.stages.sky;
  const hero = new Actor(S.hero, { ground: S.ground, talk: talker('s6'), blinkSeed: 0.7,
    path: [[0, [BX0 - 0.2, TOP, 0.5]], ...Array.from({ length: 15 }, (_, i) => { const tt = B.bridge0 + (B.bridge1 - B.bridge0) * i / 14; return [tt, [endX(tt) - 0.4, TOP, 0.5], 'linear']; }), [B.arrive, [49.2, TOP, 0.4]],
      [B.home - 0.01, [49.2, TOP, 0.4]], [B.home, [OX, TOP, 1.85]]],
    yaw: [[0, -Math.PI / 2], [B.bridge1, -Math.PI / 2], [B.bridge1 + 0.4, Math.PI / 2], [B.look, Math.PI / 2], [B.look + 0.6, -Math.PI / 2 + 0.15], [B.home - 0.01, -Math.PI / 2], [B.home, Math.PI]],
    acts: [[0, 'idle'], [B.bridge0, 'backAway', { stride: 1.6 }], [B.bridge1, 'walk'], [B.arrive, 'idle'], [B.sign, 'scared'], [B.look, 'idle'], [B.home, 'holdSign'], [B.where - 0.4, 'idle'], [B.gulp, 'gulp']],
    expr: [[0, 'determined'], [B.bridge1, 'happy'], [B.arrive, 'curious'], [B.sign, 'shocked'], [B.look, 'worried'], [B.home, 'worried'], [B.where, 'scared'], [B.gulp, 'terrified']],
    eyes: [[0, [0, 0.4]], [B.bridge1, [0, 0]], [B.home, [0, 0.4]], [B.where, [0, 0.5]]],
    extra: (t, p) => { if (t > B.bridge0 && t < B.bridge1) { const ph = (t * 6) % 1; p.rShP = 0.6 + Math.sin(ph * Math.PI) * 0.9; p.rEl = 0.4; p.lean += 0.25; p.headPitch += 0.45; } return p; } });
  const other = new Actor(S.other, { ground: S.ground, path: [[0, [OX, TOP, 2.0]], [B.frenzy, [OX, TOP, 2.0]], [27.0, [-3.6, TOP, 4.2], 'inOut']], yaw: [[0, Math.PI], [B.frenzy, Math.PI], [B.frenzy + 0.5, -0.6]],
    acts: [[0, 'mine', { rate: 4.5, sfx: 'mineStone', gain: 0.6 }], [B.frenzy, 'walk'], [27.0, 'lookUp']], items: [[0, { r: 'diamondPickaxe' }]], expr: [[0, 'neutral']] });
  function update(t) {
    S.reset();
    const flash = t > B.flash0 && t < B.flash1;
    if (!flash) S.furnish('house', t); else { S.greed.visible = true; }
    S.light(flash ? L3.noon : L3.sky, t + 120, { cloudSpeed: 1.5 });
    const st = hero.state(t); st.visible = !flash; S.hero.apply(st);
    if (t > B.home && t < B.where - 0.4) S.heroSign.update(t, st, [[B.home, SIGN_LINES]]);
    // bridge
    if (!flash) { const e = t < B.home ? endX(t) : BX1; for (let x = BX0; x <= BX1; x++) if (x <= e) S.pool.put('cobble', [x, 60, 0], { scale: Math.min(1, (e - x) * 3 + 0.2) }); }
    S.far.visible = !flash; S.farSign.group.visible = !flash && t < B.home;
    // the last player (flashback)
    if (flash) { const os = other.state(t); S.other.apply(os); S.other.root.visible = true; }
    const eyes = blinkEyes(t, 1, 0.2);
    S.origin.apply({ kind: 'grass', eyes: flash ? 0 : eyes, talk: flash ? 0 : originTalk('s6', t), glow: flash ? 0 : originGlow('s6', t), look: [0, 0.4], crack: flash && t < B.frenzy ? Math.floor((t * 4.5) % 5) : -1 });
    if (flash) for (let i = 0; i < 6; i++) S.particles.add(burst({ t0: B.flash0 + 0.3 + i * 0.6, pos: [OX, 61.9, 1.0], n: 14, colors: ['#62a03f', '#7a5434'], speed: 1.8, up: 2.5, gravity: 10, life: 0.6, size: 0.08, seed: 80 + i }));
    S.particles.add(motes({ center: [25, 60, 0], extent: [60, 14, 20], n: 80, colors: ['#ffffff'], size: 0.04, alpha: 0.35, seed: 81, speed: 0.6 }));
    const H = head(st), P = st.pos; const OH = head(other.state(t));
    const c = shot(t, [
      { t: [0, 3.6], pos: () => [P[0] + 0.6, 62.0, 6.4], look: () => [P[0] + 0.4, 61.2, 0.5], fov: 50 },
      { t: [3.6, 6.6], pos: [[-6, 72, 20], [-4, 73, 22]], look: [[24, 58, 0], [28, 58, 0]], fov: 55 },
      { t: [6.6, B.arrive], pos: () => [P[0] - 3.8, 62.6, 4.2], look: () => [P[0] + 4, 61.4, 0.5], fov: 52 },
      { t: [B.arrive, B.sign], pos: [[46.0, 62.8, 4.6], [46.4, 62.6, 4.2]], look: [50.0, 61.8, 1.0], fov: 48 },
      { t: [B.sign, B.look], pos: [[48.7, 62.1, 2.3], [49.0, 62.08, 2.1]], look: [50.5, 62.05, 1.5], fov: 42 },
      { t: [B.look, B.home], pos: [[51.0, 63.5, 1.4], [50.8, 63.5, 1.3]], look: [OX, 61.5, OZ], fov: [40, 20], ease: 'inOut' },
      { t: [B.home, B.flash0], pos: [[OX - 0.4, 63.4, -1.1], [OX - 0.3, 63.3, -1.0]], look: () => off(H, [0, -0.6, 0]), fov: 48 },
      { t: [B.flash0, B.frenzy], pos: [[2.6, 62.4, 3.4], [2.4, 62.3, 3.2]], look: () => off(OH, [-0.4, -1.0, -1.0]), fov: 46, shake: 0.05 },
      { t: [B.frenzy, B.flash1], pos: [[-1.0, 61.6, 9.0], [-2.0, 62.0, 9.5]], look: [[-3, 64, 2], [-4, 74, -2]], fov: 60, ease: 'inOut' },
      { t: [B.flash1, B.jumped], pos: () => off(H, [0.5, 0.05, -1.0]), look: () => H, fov: 40 },
      { t: [B.jumped, B.gulp], pos: [[60.5, 62.4, 7.0], [60.8, 62.6, 7.4]], look: [55.0, 59.5, -0.5], fov: 48 },
      { t: [B.gulp, 36], pos: () => off(H, [0.45, 0.05, -1.0]), look: () => H, fov: 38 },
    ]);
    W.cam.apply({ ...c, t });
    if (t > B.home && t < B.flash0) S.roof.visible = false; if (t > B.flash1 && t < B.jumped) S.roof.visible = false; if (t > B.gulp) S.roof.visible = false;
    const post = { vignette: 0.55, saturation: 1.08 };
    if (flash) { post.saturation = 0.12; post.tint = [1.25, 1.0, 0.72]; post.tintAmt = 0.35; post.vignette = 1.3; post.grain = 0.05; }
    for (const e of [B.flash0, B.flash1]) if (t > e - 0.15 && t < e + 0.3) post.flash = 0.8 * (1 - Math.abs(t - e - 0.05) / 0.3);
    if (t > B.sign && t < B.sign + 0.25) post.zoomBlur = 1;
    void lerp; void smooth; void FAR;
    return { stage: S, post };
  }
  function cues() {
    const out = [];
    for (let x = BX0; x <= BX1; x += 1) { const tt = B.bridge0 + (B.bridge1 - B.bridge0) * (x - BX0) / (BX1 - BX0); if (tt > B.bridge0) out.push({ t: tt, id: 'place', gain: 0.45 }); }
    out.push(...hero.events(B.bridge1, B.arrive, 'grass'), { t: B.sign, id: 'stinger', gain: 0.9 }, { t: B.look, id: 'windGust', gain: 0.6 }, { t: B.home, id: 'signFlip', gain: 0.5 });
    out.push({ t: B.flash0, id: 'flashback', gain: 0.8 }, ...other.events(B.flash0, B.flash1, 'stone'), { t: B.flash1, id: 'flashback', gain: 0.6 }, { t: B.jumped + 0.6, id: 'windGust', gain: 0.8 }, { t: B.gulp + 0.3, id: 'gulp', gain: 0.5 });
    return out;
  }
  return { update, cues, hero };
}
