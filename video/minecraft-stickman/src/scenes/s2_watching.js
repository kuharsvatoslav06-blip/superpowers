// SCENE 2 — SOMETHING IS WATCHING. Speed-build, "you may not rest now", three zombies, three knocks, the sign.
import { Actor } from '../engine/CharacterController.js';
import { shot, orbit } from '../engine/CameraController.js';
import { burst, motes } from '../engine/Particles.js';
import { Ease, clamp, prog, shakeEnv, smooth, lerp } from '../engine/AnimationSystem.js';
import { LIGHT } from '../engine/EnvironmentManager.js';
import { talker, head, off } from './util.js';

export const BEATS = { buildStart: 0.4, buildEnd: 8.0, toBed: 9.2, lie: 12.0, msg: 13.8, sitUp: 15.0, getUp: 16.6, window: 17.5, turn: 21.4, slam: 26.0,
  knocks: [28.5, 29.4, 30.3], tiptoe: 31.6, open: 35.0, out: 36.6, sign: 38.8, face: 42.0, line: 44.0, leave: 47.0 };
const B = BEATS;
const ZPOS = [[16.5, 4.8], [17.8, 6.6], [16.8, 8.4]];

export default function s2(W) {
  const S = W.stages.over; const g = S.ground;
  const blocks = S.houseBlocks; const N = blocks.length;
  const order = blocks.map((b, i) => ({ i, k: b.y * 100 + Math.atan2(b.z - 6, b.x - 8) })).sort((a, b) => a.k - b.k).map(o => o.i);
  const appear = new Float32Array(N); order.forEach((bi, n) => { appear[bi] = B.buildStart + (n / N) * (B.buildEnd - B.buildStart); });
  const hero = new Actor(S.hero, {
    ground: g, talk: talker('s2'), blinkSeed: 1.1,
    path: [[0, [4.5, -0.6]], [0.9, [8.5, 6.2], 'out'], [B.toBed, [8.5, 6.2]], [11.8, [8.4, 6.6], 'linear'], [B.lie, [8.0, 7.5]], [B.getUp, [8.0, 7.5]], [B.window - 0.1, [9.4, 6.2]],
      [B.slam + 0.4, [9.4, 6.2]], [B.slam + 1.8, [8.1, 6.9], 'out'], [B.tiptoe, [8.1, 6.9]], [B.open - 0.5, [8.5, 5.1], 'linear'], [B.out, [8.5, 5.1]], [B.out + 1.0, [8.5, 3.45], 'inOut'],
      [B.leave, [8.5, 3.45]], [53.5, [-2.0, 0.2], 'in']],
    yaw: [[0, 0.6], [0.9, 0.6], [B.buildEnd, 0.6 + Math.PI * 6], [B.buildEnd + 0.4, Math.PI * 6 + Math.PI], [B.toBed, Math.PI * 7], [11.8, Math.PI * 6 + 0.3], [B.lie, Math.PI * 6 - Math.PI / 2],
      [B.getUp, Math.PI * 6 - Math.PI / 2], [B.getUp + 0.3, Math.PI * 6 + Math.PI / 2], [B.slam + 0.5, Math.PI * 6 + Math.PI / 2], [B.tiptoe, Math.PI * 6 + Math.PI / 2], [B.tiptoe + 0.4, Math.PI * 7],
      [B.leave, Math.PI * 7], [B.leave + 0.6, Math.PI * 6 + 4.6]],
    acts: [[0, 'walk'], [0.9, 'place', { rate: 5, sfx: null }], [B.buildEnd, 'idle'], [B.toBed, 'walk', { stride: 0.8 }], [11.8, 'stand'], [B.lie, 'sleep'], [B.sitUp, 'sitUp'], [B.getUp, 'walk'], [B.window, 'idle'],
      [B.turn + 3.2, 'scared'], [B.slam - 0.3, 'place', { rate: 3, sfx: null }], [B.slam + 0.3, 'backAway'], [B.slam + 1.8, 'scared'], [B.tiptoe, 'tiptoe', { stride: 0.55 }], [B.open - 0.5, 'idle'],
      [B.open - 0.2, 'place', { rate: 2, sfx: null }], [B.open + 0.3, 'scared'], [B.out, 'sneak'], [B.out + 1.0, 'lookAround'], [B.sign - 0.4, 'idle'], [B.face + 2.2, 'stand'], [B.leave, 'walk']],
    expr: [[0, 'determined'], [B.buildEnd, 'smug'], [B.toBed, 'happy'], [B.lie, 'sleep'], [B.msg, 'shocked'], [B.sitUp, 'annoyed'], [B.window, 'curious'], [B.turn, 'worried'], [B.turn + 2.2, 'scared'],
      [B.turn + 3.4, 'terrified'], [B.slam + 0.6, 'scared'], [B.knocks[0], 'terrified'], [B.tiptoe, 'worried'], [B.open + 0.3, 'scared'], [B.out + 1.0, 'curious'], [B.sign, 'shocked'], [B.face + 1.0, 'deadpan'],
      [B.line + 0.2, 'smug'], [B.leave, 'determined']],
    eyes: [[0, [0, 0]], [B.window, [0.5, 0]], [B.turn + 2, [0.9, 0]], [B.slam, [0, 0]], [B.knocks[0], [0, -0.2]], [B.sign, [0, 0.9]], [B.face + 1.4, [0, 0.9]], [B.face + 1.6, [0.5, 0]], [B.leave, [0, 0]]],
    look: [[0, [0, 0]], [B.sign - 0.2, [0, 0]], [B.sign + 0.2, [0, 0.55]], [B.face + 1.3, [0, 0.45]], [B.face + 1.7, [0.75, 0.05]], [B.leave - 0.2, [0.75, 0.05]], [B.leave, [0, 0]]],
    tilt: [[0, 0], [11.8, 0], [B.lie, Math.PI / 2, 'out'], [B.sitUp, Math.PI / 2], [B.sitUp + 0.4, Math.PI / 2 - 1.2, 'out'], [B.getUp, Math.PI / 2 - 1.2], [B.getUp + 0.4, 0]],
    yOff: [[0, 0], [11.8, 0], [B.lie, -0.27, 'out'], [B.getUp, -0.27], [B.getUp + 0.4, 0]],
    items: [[0, { r: 'woodPickaxe' }], [0.9, { r: 'torch' }], [B.buildEnd, {}], [B.leave, { r: 'woodPickaxe' }]],
  });

  function update(t) {
    S.reset();
    S.light(LIGHT.night, t + 40, { cloudSpeed: 0.6 });
    const st = hero.state(t); if (t > B.lie - 0.3 && t < B.getUp + 0.3) st.shadow = 0;
    S.hero.apply(st);
    S.table.visible = true;
    // the house: built block by block, then static meshes
    const built = t >= B.buildEnd + 0.15;
    for (const p of Object.values(S.houseParts)) p.visible = built;
    if (!built) S.buildMeshes.forEach((m, i) => { const a = t - appear[i]; m.visible = a > 0; if (a > 0) m.scale.setScalar(Math.max(0.01, Ease.outBack(clamp(a / 0.14)))); });
    S.door.group.visible = t > B.buildEnd - 0.2; S.bed.group.visible = t > B.buildEnd - 0.4; S.shutter.visible = t > B.buildEnd - 0.2;
    const doorOpen = Ease.out(prog(t, B.open, B.open + 0.45));
    const knockShake = B.knocks.reduce((a, k) => a + (t > k && t < k + 0.25 ? Math.sin((t - k) * 90) * 0.03 * (1 - (t - k) / 0.25) : 0), 0);
    S.door.update(doorOpen * -1, knockShake);
    S.shutter.rotation.y = -1.5 * (1 - Ease.in3(prog(t, B.slam - 0.15, B.slam)));
    S.houseTorch.update(t, t > B.buildEnd ? 1 : 0);
    if (t > 0.9 && t < B.buildEnd) { S.hero.handWorld('r', S.handLight.position); S.handLight.position.y += 0.4; S.handLight.intensity = 7; }
    // zombies: perfectly still, then the heads turn 180 degrees, one by one
    const zOn = t > B.window - 1 && t < B.open;
    S.zombies.forEach((z, i) => {
      const [x, zz] = ZPOS[i]; const k = Ease.inOut(prog(t, B.turn + i * 1.0, B.turn + i * 1.0 + 1.5));
      z.apply({ visible: zOn, pos: [x + 0.5, g(x, zz), zz + 0.5], yaw: Math.PI / 2, headYaw: k * Math.PI, headPitch: k * 0.12, arms: 1, eyes: k * 0.9, walkAmt: 0 });
    });
    // sign outside appears when the door opens
    S.sign1.group.visible = t > B.open;
    // cutaway: hide walls between camera and the action
    const inside = t > B.toBed && t < B.out + 0.6;
    if (inside && built) { S.houseParts.S.visible = !(t < B.window || (t > B.slam + 0.4 && t < B.knocks[0] - 0.3)); S.houseParts.roof.visible = !(t < B.window); S.door.group.visible = S.houseParts.S.visible; }
    if (t > B.window && t < B.slam + 0.4) { S.houseParts.S.visible = true; S.houseParts.roof.visible = true; }
    // particles
    S.particles.add(motes({ center: [9, 23, 6], extent: [26, 6, 20], n: 70, colors: ['#c8e0ff'], size: 0.05, alpha: 0.45, seed: 18 }));
    S.particles.add(burst({ t0: B.slam, pos: [9.8, 22.5, 6.5], n: 16, colors: ['#a88452', '#d8c8a0'], speed: 1.5, up: 1, gravity: 8, life: 0.6, size: 0.06, seed: 50 }));
    B.knocks.forEach((k, i) => S.particles.add(burst({ t0: k, pos: [8.5, 22.2, 4.6], n: 10, colors: ['#a88452', '#c9c0a8'], speed: 0.8, up: 0.5, gravity: 4, life: 0.5, size: 0.05, seed: 60 + i })));

    // ---------- camera
    const H = head(st);
    const c = shot(t, [
      { t: [0, 8.4], pos: [(tt) => orbit([8.5, 22, 6.2], 8.0, 0.6 + tt * 0.32, 3.0 + tt * 0.38), (tt) => orbit([8.5, 22, 6.2], 8.0, 0.6 + tt * 0.32, 3.0 + tt * 0.38)], look: [8.5, 22.6, 6.2], fov: 54, ease: 'linear' },
      { t: [8.4, B.toBed], pos: [[8.5, 27.5, -4.0], [8.5, 26.5, -3.0]], look: [8.5, 22.5, 6.5], fov: 45 },
      { t: [B.toBed, B.window], pos: [[8.5, 24.9, 2.4], [8.4, 24.4, 3.4]], look: [() => off(st.pos, [0, 0.6, 0.6]), () => off(st.pos, [0, 0.6, 0.6])], fov: 48 },
      { t: [B.window, B.turn], pos: [[8.85, 22.78, 6.86], [9.05, 22.74, 6.85]], look: [[17, 22.3, 6.6], [17, 22.4, 6.6]], fov: [50, 40] },
      { t: [B.turn, B.turn + 3.3], pos: [[13.6, 22.6, 6.6], [14.6, 22.6, 6.6]], look: [[17.1, 22.6, 6.6], [17.1, 22.65, 6.6]], fov: [46, 38], ease: 'sine' },
      { t: [B.turn + 3.3, B.slam - 0.35], pos: [[11.9, 22.85, 6.55], [11.3, 22.8, 6.55]], look: () => H, fov: 34 },
      { t: [B.slam - 0.35, B.knocks[0] - 0.3], pos: [[7.6, 22.7, 5.4], [7.4, 22.6, 5.3]], look: [9.8, 22.4, 6.6], fov: 55, shake: () => shakeEnv(t, [[B.slam, 0.6, 0.3]]) },
      { t: [B.knocks[0] - 0.3, B.tiptoe], pos: [[8.5, 22.5, 7.2], [8.5, 22.4, 6.6]], look: [8.5, 22.0, 4.4], fov: 50, ease: 'linear', shake: () => shakeEnv(t, B.knocks.map(k => [k, 0.35, 0.2])) },
      { t: [B.tiptoe, B.open], pos: [[6.6, 23.2, 7.6], [6.9, 23.1, 7.2]], look: [() => off(st.pos, [0, 1.1, -0.4]), () => off(st.pos, [0, 1.1, -0.4])], fov: 50 },
      { t: [B.open, B.sign], pos: [[8.95, 23.4, 6.95], [8.85, 23.3, 6.6]], look: [[8.5, 22.3, 0.5], [8.5, 22.1, 1.0]], fov: 52 },
      { t: [B.sign, B.face], pos: [[10.2, 23.0, 4.7], [9.55, 22.55, 3.85]], look: [[8.9, 22.1, 2.6], [8.85, 22.1, 2.6]], fov: [50, 40], ease: 'out3' },
      { t: [B.face, B.leave], pos: [() => off(H, [-1.0, 0.0, -1.35]), () => off(H, [-0.85, 0.0, -1.15])], look: () => H, fov: 40 },
      { t: [B.leave, 53], pos: [[10.5, 23.5, 0.5], [12.5, 30.0, 3.0]], look: [[6, 22, 1], [-12, 23, 0]], fov: [50, 55], ease: 'inOut3' },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 0.9, saturation: 0.8, contrast: 1.08 };
    if (t > B.turn && t < B.slam) { post.vignette = 1.2 + (t - B.turn) * 0.1; post.saturation = 0.6; post.letterbox = smooth(prog(t, B.turn, B.turn + 0.6)); }
    if (t > B.knocks[0] - 0.3 && t < B.open + 1) post.letterbox = 1;
    if (t > B.sign && t < B.face) post.rgb = 0.6 * Math.exp(-(t - B.sign) * 3);
    if (t < 8.4) post.saturation = 1.0;
    return { stage: S, post };
  }
  function cues() {
    const out = [...hero.events(0, 53, 'grass').filter(e => e.t < 0.9 || e.t > 9)];
    order.forEach((bi, n) => { if (n % 3 === 0) out.push({ t: appear[bi], id: 'place', gain: 0.55 }); });
    out.push({ t: B.buildEnd + 0.1, id: 'craftDone', gain: 0.7 }, { t: 12.2, id: 'bedLie', gain: 0.6 });
    for (let i = 0; i < 3; i++) out.push({ t: B.turn + i + 0.1, id: 'creak', gain: 0.5 }, { t: B.turn + i + 0.9, id: 'zombieGroan', gain: 0.55 });
    out.push({ t: B.slam, id: 'woodSlam', gain: 1 }, ...B.knocks.map(k => ({ t: k, id: 'knock', gain: 1 })));
    out.push({ t: B.open, id: 'doorOpen', gain: 0.9 }, { t: B.open + 0.3, id: 'windGust', gain: 0.7 }, { t: B.sign, id: 'stinger', gain: 0.9 }, { t: B.line + 2.5, id: 'comedyBonk', gain: 0.6 });
    return out;
  }
  void lerp;
  return { update, cues, hero };
}
