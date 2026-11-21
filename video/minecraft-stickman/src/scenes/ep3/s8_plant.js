// EP3 SCENE 8 — THE CHOICE. Day 90: no mining. Plant everything. Grass spreads, saplings grow, days pass.
import { Actor } from '../../engine/CharacterController.js';
import { shot, orbit } from '../../engine/CameraController.js';
import { burst, motes } from '../../engine/Particles.js';
import { prog, smooth, clamp, lerp, Ease } from '../../engine/AnimationSystem.js';
import { L3, OX, OZ, TOP, GARDEN } from '../../story/ep3/stages.js';
import { mixLight } from '../../engine/EnvironmentManager.js';
import { talker, head, off } from '../util.js';
import { popIn } from './common.js';

const B = { plant0: 1.2, plant1: 11.0, spread: 5.8, sit: 12.4, lapse: 15.6, lapseEnd: 30.6 };
const SPOTS = GARDEN.map(([x, z]) => ({ x, z, a: ((Math.atan2(z, x) - 0.75) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) })).sort((a, b) => a.a - b.a);
const plantT = i => B.plant0 + (B.plant1 - B.plant0) * (i + 0.6) / SPOTS.length;
const outward = (P, d, h) => { const dx = P[0] - 0.5, dz = P[2] - 0.5; const l = Math.hypot(dx, dz) || 1; return [P[0] + dx / l * d, P[1] + h, P[2] + dz / l * d]; };
const stand = s => { const d = Math.hypot(s.x + 0.5, s.z + 0.5); return [s.x + 0.5 - (s.x + 0.5) / d * 0.9, s.z + 0.5 - (s.z + 0.5) / d * 0.9]; };

export default function s8(W) {
  const S = W.stages.sky;
  const path = [[0, [3.2, TOP, 3.4]]]; SPOTS.forEach((s, i) => { const [x, z] = stand(s); path.push([plantT(i) - 0.35, [x, TOP, z]], [plantT(i) + 0.15, [x, TOP, z]]); }); path.push([B.sit - 0.5, [OX, TOP, 3.6]], [B.sit, [OX, TOP, 2.6]]);
  const yaw = [[0, 0]]; SPOTS.forEach((s, i) => { const [x, z] = stand(s); yaw.push([plantT(i) - 0.15, Math.atan2(s.x + 0.5 - x, s.z + 0.5 - z)]); }); yaw.push([B.sit - 0.3, Math.PI], [B.sit, 0]);
  const hero = new Actor(S.hero, { ground: S.ground, talk: talker('s8'), blinkSeed: 0.5, path, yaw,
    acts: [[0, 'walk'], ...SPOTS.map((_, i) => [plantT(i) - 0.1, 'place', { rate: 3, sfx: null }]), ...SPOTS.map((_, i) => [plantT(i) + 0.25, 'walk']).slice(0, -1), [B.plant1 + 0.3, 'walk'], [B.sit, 'sit']].sort((a, b) => a[0] - b[0]),
    expr: [[0, 'determined'], [B.spread + 0.3, 'excited'], [B.plant1, 'happy'], [B.sit, 'relieved'], [B.lapse, 'neutral'], [22, 'relieved']],
    eyes: [[0, [0, 0.6]], [B.sit, [0, 0]]] });
  function update(t) {
    S.reset();
    const grass = t > B.spread; S.furnish(grass ? 'house' : 'end', t); if (grass) { S.island.grass.visible = true; S.island.end.visible = false; S.tree.visible = true; S.placeChickens(t); }
    // sky: end -> dawn -> fast days
    let L;
    if (t < B.lapse) { const k = smooth(prog(t, B.spread - 0.5, 12)); L = mixLight(L3.end, L3.dawn, k); }
    else { const ph = (t - B.lapse) / 1.6 * Math.PI * 2; const night = smooth(clamp(-Math.sin(ph) * 2.2)); L = { ...mixLight(L3.sky, L3.night, night), sunAngle: 0.2 + ((ph / (Math.PI * 2)) % 1) * 2.8 }; if (t > B.lapseEnd) L = L3.sky; }
    S.light(L, t * (t > B.lapse ? 20 : 1) + 160, { cloudSpeed: t > B.lapse ? 30 : 2 });
    const st = hero.state(t); S.hero.apply(st);
    S.flowers.visible = t > 8.6; if (S.flowers.visible) { const sy = Math.max(0.01, Ease.outBack(prog(t, 8.6, 9.6))); S.flowers.scale.set(1, sy, 1); S.flowers.position.y = 61 * (1 - sy); }
    SPOTS.forEach((s, i) => { const a = plantT(i); const gi = GARDEN.findIndex(([x, z]) => x === s.x && z === s.z); const g = S.gardenTrees[gi];
      const grow = prog(t, B.lapse + i * 0.5, B.lapse + 6 + i * 0.6);
      if (t > a && grow < 0.12) S.pool.put('sapling', [s.x, 61, s.z], { scale: popIn(t, a, 0.2) });
      if (grow >= 0.12) { g.visible = true; g.scale.setScalar(lerp(0.15, 1, Ease.out(grow))); }
      S.glowParticles.add(burst({ t0: a + 0.1, pos: [s.x + 0.5, 61.4, s.z + 0.5], n: 18, colors: ['#9dff8a', '#ffffff', '#4fd04a'], speed: 1, up: 1.4, gravity: 0, life: 0.9, size: 0.07, seed: 100 + i })); });
    S.origin.apply({ kind: grass ? 'grass' : 'end_stone', scale: 0.6, eyes: 0, glow: grass ? 0.25 : 0 });
    S.glowParticles.add(burst({ t0: B.spread, pos: [0.5, 61.2, 0.5], n: 200, colors: ['#9dff8a', '#4fd04a', '#ffffff'], speed: 6, up: 0.6, gravity: 0, life: 1.4, size: 0.1, spread: 2, seed: 120 }));
    if (t < B.spread) S.glowParticles.add(motes({ center: [0, 62, 0], extent: [30, 12, 30], n: 90, colors: ['#b080ff', '#e0d0ff'], size: 0.06, alpha: 0.5 * (1 - prog(t, 4, B.spread)), seed: 92, speed: 0.3 }));
    else S.particles.add(motes({ center: [0, 62.5, 0], extent: [14, 4, 14], n: 50, colors: ['#fff6c8', '#ffffff'], size: 0.04, alpha: 0.5, seed: 121 }));
    const H = head(st), P = st.pos;
    const c = shot(t, [
      { t: [0, B.spread], pos: () => outward(P, 3.0, 2.0), look: () => off(P, [0, 0.8, 0]), fov: 50 },
      { t: [B.spread, 8.6], pos: [[8, 68, 10], [8.5, 69, 10.5]], look: [0.5, 60.8, 0.5], fov: 48 },
      { t: [8.6, B.sit], pos: () => outward(P, 3.0, 2.0), look: () => off(P, [0, 0.8, 0]), fov: 50 },
      { t: [B.sit, B.lapse], pos: [[OX + 1.3, 62.1, 5.8], [OX + 1.2, 62.0, 5.5]], look: () => off(H, [0, -0.2, 0]), fov: 42 },
      { t: [B.lapse, 32], pos: [[14, 67.5, 17], [12.5, 67, 15.5]], look: [0.3, 62.4, 0.3], fov: 46, ease: 'linear' },
    ]);
    W.cam.apply({ ...c, t, handheld: t > B.lapse ? 0 : 0.02 });
    const post = { vignette: 0.55, saturation: 1.1 };
    if (t > B.spread - 0.05 && t < B.spread + 0.35) { post.flash = 0.6 * (1 - prog(t, B.spread - 0.05, B.spread + 0.35)); post.flashColor = [0.8, 1, 0.7]; }
    return { stage: S, post };
  }
  function cues() {
    const out = [...hero.events(0, B.sit, 'grass').filter(e => e.id === 'step')];
    SPOTS.forEach((_, i) => out.push({ t: plantT(i), id: 'place', gain: 0.45 }, { t: plantT(i) + 0.1, id: 'boneMeal', gain: 0.5 }));
    out.push({ t: B.spread, id: 'grow', gain: 1 }, { t: B.spread, id: 'choir', gain: 0.4 }, { t: 8.6, id: 'shine', gain: 0.5 }, { t: B.sit, id: 'bedLie', gain: 0.3 });
    SPOTS.forEach((_, i) => out.push({ t: B.lapse + i * 0.5 + 0.8, id: 'grow', gain: 0.25 }));
    return out;
  }
  return { update, cues, hero };
}
