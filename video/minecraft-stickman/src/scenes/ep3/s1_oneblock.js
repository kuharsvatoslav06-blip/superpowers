// EP3 SCENE 1 — ONE BLOCK. Spawn on a single grass block in the sky, look down, punch it (it comes back), dirt, logs, a house of four planks.
import { Actor } from '../../engine/CharacterController.js';
import { shot, orbit } from '../../engine/CameraController.js';
import { burst, motes } from '../../engine/Particles.js';
import { prog, smooth } from '../../engine/AnimationSystem.js';
import { L3, OX, OZ, TOP } from '../../story/ep3/stages.js';
import { mixLight } from '../../engine/EnvironmentManager.js';
import { talker, head, off } from '../util.js';
import { popIn } from './common.js';

export const B1 = { spawn: 0.8, edge: 8.6, look: 12.4, punch: 14.4, dirtPlace: 22.4, wood: 26.4, craft: 31.4, planks: 32.4, smug: 33.9, night: 36.8, sit: 38.0 };
const B = B1;
const BREAKS = [16.6, 18.6, 20.6, 22.6, 24.6, 28.4, 30.4];
export const DIRT8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
export const PLANK4 = [[1, 0], [0, 1], [-1, 0], [0, -1]];

export default function s1(W) {
  const S = W.stages.sky;
  const hero = new Actor(S.hero, { ground: S.ground, talk: talker('s1'), blinkSeed: 0.4,
    path: [[0, [OX, TOP, OZ]]],
    yaw: [[0, 0.6], [3.0, 0.6], [B.edge, 0.7], [B.look, 0.7], [B.punch, 0.4], [B.wood, 0.4], [B.wood + 0.3, -2.4], [B.craft, -2.4], [B.smug, 0.8], [B.sit, 0.8]],
    acts: [[0, 'idle'], [3.0, 'lookAround'], [B.edge, 'idle'], [B.look, 'scared'], [B.punch, 'punch', { rate: 3, sfx: 'punchWood' }], [25.8, 'handsOnHips'], [B.wood + 0.4, 'punch', { rate: 3, sfx: 'punchWood' }],
      [B.craft, 'craft'], [B.planks, 'place', { rate: 3, sfx: null }], [B.smug, 'handsOnHips'], [B.night, 'idle'], [B.sit, 'sit']],
    expr: [[0, 'neutral'], [1.0, 'curious'], [6.0, 'worried'], [10.4, 'determined'], [B.look, 'terrified'], [B.punch, 'determined'], [16.6, 'shocked'], [17.2, 'excited'], [19.5, 'determined'], [24.4, 'excited'],
      [B.wood, 'curious'], [27.0, 'determined'], [B.smug, 'smug'], [B.night, 'happy'], [40, 'relieved']],
    eyes: [[0, [0, 0]], [B.edge, [0, 0.6]], [10.4, [0, 0]], [B.look, [0, 1]], [B.punch, [0, 0.5]], [B.craft, [0, 0]]],
    look: [[0, [0, 0]], [B.look - 0.2, [0, 0]], [B.look + 0.3, [0, 0.75]], [B.punch - 0.3, [0, 0.75]], [B.punch, [0, 0]]],
    extra: (t, p) => { if ((t > B.punch && t < 25.8) || (t > B.wood + 0.4 && t < B.craft)) { p.lean += 0.45; p.headPitch += 0.4; p.bob -= 0.15; } return p; } });
  function update(t) {
    S.reset();
    const nk = smooth(prog(t, B.night, B.night + 1.2));
    S.light(nk > 0 ? mixLight(L3.sky, L3.night, nk) : L3.sky, t + 10, { cloudSpeed: 1.2 });
    const st = hero.state(t);
    const br = BREAKS.find(b => t > b && t < b + 0.25); if (br !== undefined) st.pos[1] -= 0.35 * Math.sin(Math.PI * (t - br) / 0.25);
    st.visible = t > B.spawn; st.scale = t < B.spawn + 0.3 ? Math.max(0.001, popIn(t, B.spawn, 0.3)) : 1; S.hero.apply(st);
    const kind = t > B.wood ? 'log' : 'grass';
    const punching = (t > B.punch && t < 25.8) || (t > B.wood + 0.4 && t < B.craft);
    const cyc = ((t - 14.6) % 2 + 2) % 2;
    S.origin.apply({ kind, base: [OX, 60, OZ], visible: br === undefined || t > br + 0.12, scale: br !== undefined ? popIn(t, br + 0.12, 0.13) || 1 : 1, crack: punching ? Math.min(4, Math.floor(cyc / 2 * 5)) : -1 });
    if (t > B.wood && t < B.wood + 0.4) S.origin.apply({ kind, base: [OX, 60, OZ], glow: 1 - prog(t, B.wood, B.wood + 0.4) });
    // dirt ring and the four-plank house
    DIRT8.forEach(([x, z], i) => { const a = B.dirtPlace + i * 0.4; if (t > a) S.pool.put('dirt', [x, 60, z], { scale: popIn(t, a) }); });
    PLANK4.forEach(([x, z], i) => { const a = B.planks + i * 0.35; if (t > a) S.pool.put('planks', [x, 61, z], { scale: popIn(t, a) }); });
    // particles
    S.glowParticles.add(burst({ t0: B.spawn - 0.5, pos: [OX, TOP + 1.0, OZ], n: 50, colors: ['#ffffff', '#c8f0ff'], speed: 2.2, up: 1, gravity: 0, life: 0.5, size: 0.14, implode: true, seed: 2 }));
    BREAKS.forEach((b, i) => S.particles.add(burst({ t0: b, pos: [OX, 60.6, OZ], n: 26, colors: b > B.wood ? ['#7d5a2e', '#b48a55'] : ['#7a5434', '#62a03f', '#5c3d22'], speed: 2.4, up: 3, gravity: 12, life: 0.8, size: 0.11, seed: 10 + i })));
    S.glowParticles.add(burst({ t0: B.wood, pos: [OX, 60.5, OZ], n: 40, colors: ['#fff6c8', '#ffffff'], speed: 1.6, up: 1.5, gravity: 0, life: 1.0, size: 0.09, seed: 31 }));
    if (nk > 0.2) S.particles.add(motes({ center: [0.5, 63, 0.5], extent: [16, 6, 16], n: 50, colors: ['#c8e0ff'], size: 0.05, alpha: 0.45 * nk, seed: 18 }));
    const H = head(st), P = st.pos;
    const c = shot(t, [
      { t: [0, 4.8], pos: [[2.2, 62.4, 3.0], [20, 69, 28]], look: [OX, 61.6, OZ], fov: [50, 45], ease: 'inOut' },
      { t: [4.8, B.edge], pos: () => orbit([OX, TOP, OZ], 5.5, 0.6 + (t - 4.8) * 0.25, 1.6), look: () => off(P, [0, 1.2, 0]), fov: 46 },
      { t: [B.edge, 10.4], pos: [[2.0, 61.4, 2.2], [2.15, 61.25, 2.35]], look: [[0.1, 44, -0.7], [0.1, 43, -0.7]], fov: 75 },
      { t: [10.4, B.look], pos: () => off(H, [1.2, 0.1, 1.5]), look: () => H, fov: 40 },
      { t: [B.look, B.punch], pos: () => off(H, [0.5, 0.0, 0.62]), look: [2.0, 20, 3.0], fov: [55, 88], shake: 0.12, ease: 'out' },
      { t: [B.punch, 20.4], pos: [[3.0, 61.7, 2.4], [2.7, 61.6, 2.2]], look: [OX, 61.5, OZ], fov: 52 },
      { t: [20.4, 23.0], pos: [[-2.4, 63.0, 3.2], [-2.2, 63.0, 3.0]], look: [OX, 61.4, OZ], fov: 48 },
      { t: [23.0, B.wood], pos: [[0.5, 66.5, 4.2], [0.5, 67.5, 4.8]], look: [OX, 60.6, OZ], fov: 50 },
      { t: [B.wood, B.craft], pos: [[3.4, 62.2, -2.2], [3.1, 62.2, -1.8]], look: [OX, 61.5, OZ], fov: 48 },
      { t: [B.craft, B.smug], pos: [[4.2, 65.2, 4.2], [3.5, 64.3, 3.5]], look: [OX, 61.2, OZ], fov: 50 },
      { t: [B.smug, B.night], pos: () => off(H, [0.9, 0, 1.2]), look: () => H, fov: 40 },
      { t: [B.night, 46], pos: [[5, 62.8, 7], [12, 65.5, 16]], look: [OX, 61.4, OZ], fov: 45 },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 0.5 + nk * 0.4, saturation: 1.08 - nk * 0.2 };
    if (t > B.spawn - 0.1 && t < B.spawn + 0.2) post.flash = 0.6 * (1 - prog(t, B.spawn - 0.1, B.spawn + 0.2));
    if (t > B.look && t < B.look + 0.4) post.zoomBlur = 1 - prog(t, B.look, B.look + 0.4);
    return { stage: S, post };
  }
  function cues() {
    const out = [{ t: B.spawn - 0.5, id: 'spawn', gain: 0.8 }, ...hero.events(B.punch, B.craft, 'grass'), { t: B.look, id: 'whooshDown', gain: 0.8 }, { t: B.look + 0.1, id: 'gasp', gain: 0.6 }];
    BREAKS.forEach(b => out.push({ t: b, id: b > B.wood ? 'breakWood' : 'breakDirt', gain: 0.9 }, { t: b + 0.12, id: 'blockRegen', gain: 0.6 }));
    DIRT8.forEach((_, i) => out.push({ t: B.dirtPlace + i * 0.4, id: 'place', gain: 0.6 }));
    PLANK4.forEach((_, i) => out.push({ t: B.planks + i * 0.35, id: 'place', gain: 0.7 }));
    out.push({ t: B.wood, id: 'shine', gain: 0.6 }, { t: B.craft + 0.6, id: 'craftDone', gain: 0.7 }, { t: B.sit, id: 'bedLie', gain: 0.4 });
    return out;
  }
  return { update, cues, hero };
}
