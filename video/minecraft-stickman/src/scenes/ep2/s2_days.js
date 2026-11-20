// EP2 SCENE 2 — NORMAL DAYS. House, chicken, bed, fishing... then the stars type "I SEE YOU", the knocks, the sign.
import { Actor } from '../../engine/CharacterController.js';
import { shot } from '../../engine/CameraController.js';
import { burst, motes } from '../../engine/Particles.js';
import { Ease, clamp, prog, shakeEnv, smooth, lerp } from '../../engine/AnimationSystem.js';
import { LIGHT } from '../../engine/EnvironmentManager.js';
import { talker, head, off } from '../util.js';

const B = { build: 0.2, buildEnd: 3.6, chicken: 5.0, turnChicken: 7.0, bed: 9.0, fish: 13.0, bite: 15.2, night: 19.8, stars: 23.4, cool: 31.2, inside: 33.8, shut: 35.2, knocks: [37.0, 37.9, 38.8], nope: 40.4, sign: 44.6 };
const LIE = -0.27;

export default function s2(W) {
  const S = W.stages.over; const N = S.houseBlocks.length;
  const order = S.houseBlocks.map((b, i) => ({ i, k: b.y * 100 + Math.atan2(b.z - 6, b.x - 8) })).sort((a, b) => a.k - b.k).map(o => o.i);
  const appear = new Float32Array(N); order.forEach((bi, n) => { appear[bi] = B.build + (n / N) * (B.buildEnd - B.build); });
  const hero = new Actor(S.hero, {
    ground: S.ground, talk: talker('s2'), blinkSeed: 1.3,
    path: [[0, [8.5, 2.2]], [4.8, [8.5, 2.2]], [B.chicken, [12.5, -0.6]], [B.bed, [12.5, -0.6]], [B.bed + 0.01, [8.0, 7.5]], [B.fish, [8.0, 7.5]], [B.fish + 0.01, [-3.5, -7.3]],
      [B.night, [-3.5, -7.3]], [B.night + 0.01, [2.5, -1.5]], [B.inside, [2.5, -1.5]], [B.inside + 0.01, [8.5, 6.0]], [B.shut - 0.6, [9.4, 6.2]], [B.knocks[0] + 0.6, [9.4, 6.2]], [B.nope - 0.4, [8.3, 5.8]], [52, [8.3, 5.8]]],
    yaw: [[0, Math.PI], [3.7, Math.PI], [3.9, 0], [4.8, 0], [B.chicken, -Math.PI / 2], [B.bed, -Math.PI / 2], [B.bed + 0.01, -Math.PI / 2], [B.fish, -Math.PI / 2], [B.fish + 0.01, Math.PI], [B.night, Math.PI],
      [B.night + 0.01, 0.6], [B.inside, 0.6], [B.inside + 0.01, Math.PI / 2], [B.knocks[0], Math.PI / 2], [B.knocks[0] + 0.4, Math.PI + 0.3], [B.nope - 0.4, -0.8], [B.sign - 0.3, -0.8], [B.sign + 0.4, -Math.PI / 2 - 0.1]],
    acts: [[0, 'place', { rate: 6, sfx: null }], [3.7, 'handsOnHips'], [B.chicken, 'idle'], [B.turnChicken - 0.3, 'place', { rate: 1.5, sfx: null }], [B.turnChicken + 0.5, 'shrug'], [B.bed, 'sleep'],
      [B.fish, 'idle'], [B.bite, 'holdUp'], [B.bite + 0.8, 'idle'], [B.night, 'lookUp'], [B.cool - 0.4, 'idle'], [B.inside, 'walk'], [B.shut - 0.6, 'place', { rate: 1.5, sfx: null }], [B.shut + 0.4, 'idle'],
      [B.knocks[0], 'scared'], [B.nope - 0.6, 'handsOnHips'], [B.sign, 'scared'], [B.sign + 1.5, 'cower']],
    tilt: [[0, 0], [B.bed, Math.PI / 2], [B.fish, Math.PI / 2], [B.fish + 0.01, 0]], yOff: [[0, 0], [B.bed, LIE], [B.fish, LIE], [B.fish + 0.01, 0]],
    expr: [[0, 'determined'], [3.7, 'smug'], [B.chicken, 'deadpan'], [B.turnChicken + 0.4, 'smug'], [B.bed, 'sleep'], [10.2, 'excited'], [B.fish, 'neutral'], [B.bite, 'excited'], [B.bite + 1.6, 'annoyed'],
      [B.night, 'curious'], [B.stars + 1.5, 'shocked'], [B.cool, 'deadpan'], [B.inside, 'worried'], [B.knocks[0], 'scared'], [B.nope - 0.6, 'smug'], [B.sign, 'terrified']],
    eyes: [[0, [0, 0]], [B.chicken, [-0.5, 0.3]], [B.night, [0, -0.9]], [B.cool, [0, 0]], [B.sign, [-0.9, 0]], [B.sign + 1.2, [0, 0]]],
    look: [[0, [0, 0]], [B.chicken, [0, 0.35]], [B.turnChicken + 0.4, [0, 0]], [B.nope - 0.4, [0.6, 0]], [B.sign - 0.2, [0.6, 0]], [B.sign, [0, 0]]],
    items: [[0, {}], [B.fish, { r: 'rod' }], [B.night, {}]],
  });
  function update(t) {
    S.reset();
    const nk = smooth(prog(t, B.night, B.night + 0.3));
    S.light(nk > 0.5 ? LIGHT.night : { ...LIGHT.day, sunAngle: 0.9 + t * 0.2 }, t + 30, t > B.stars - 1 && t < B.cool ? { cloudSpeed: 3, clouds: 0 } : { cloudSpeed: 3 });
    const st = hero.state(t); if (st.tilt > 0.5) st.shadow = 0; S.hero.apply(st);
    S.logBlock.visible = false; S.punchTree.userData.logs.visible = false;
    const built = t > B.buildEnd + 0.1;
    for (const p of Object.values(S.houseParts)) p.visible = built;
    if (!built) S.buildMeshes.forEach((m, i) => { const a = t - appear[i]; m.visible = a > 0; if (a > 0) m.scale.setScalar(Math.max(0.01, Ease.outBack(clamp(a / 0.12)))); });
    S.door.group.visible = built; S.bed.group.visible = true; S.shutter.visible = built; S.shutter.rotation.y = -1.5 * (1 - Ease.in3(prog(t, B.shut - 0.15, B.shut)));
    const shake = B.knocks.reduce((a, k) => a + (t > k && t < k + 0.25 ? Math.sin((t - k) * 90) * 0.03 : 0), 0); S.door.update(0, shake);
    S.houseTorch.update(t, built ? 1 : 0);
    const inside = (t > B.bed && t < B.fish) || t > B.inside;
    const knockShot = t > B.knocks[0] - 0.3 && t < B.nope - 0.4;
    if (inside && !knockShot) { S.houseParts.S.visible = false; S.houseParts.roof.visible = false; S.door.group.visible = false; }
    S.farm.visible = true;
    // chicken: stares at him, then gets turned to face the wall
    const ck = Ease.inOut(prog(t, B.turnChicken, B.turnChicken + 0.5));
    S.chicken.apply({ pos: [11.2, 21.25 + Math.sin(ck * Math.PI) * 0.5, -0.6], yaw: lerp(Math.PI / 2, -Math.PI / 2, ck), flap: ck > 0 && ck < 1 ? t * 8 : 0, visible: t > 4.6 && t < B.bed });
    // fishing line
    const fishing = t > B.fish && t < B.night;
    S.line.visible = S.bobber.visible = fishing && t < B.bite + 0.4;
    if (fishing) { const tip = S.hero.handWorld('r').clone(); tip.y += 0.5; tip.z -= 0.5; const bob = [-3.5, 20.92 - (t > B.bite ? 0.25 : 0) + Math.sin(t * 3) * 0.03, -10.6];
      S.bobber.position.set(...bob); const mid = tip.clone().add(S.bobber.position).multiplyScalar(0.5); S.line.position.copy(mid); S.line.scale.y = tip.distanceTo(S.bobber.position); S.line.lookAt(S.bobber.position); S.line.rotateX(Math.PI / 2); }
    S.sign3.group.visible = t > B.sign; S.sign3.group.position.set(7.4, 21, 6.5); S.sign3.group.rotation.y = Math.PI / 2;
    if (fishing) S.particles.add(burst({ t0: B.bite, pos: [-3.5, 21, -10.6], n: 24, colors: ['#9fc4ff', '#ffffff'], speed: 1.2, up: 2.5, gravity: 9, life: 0.7, size: 0.07, seed: 11 }));
    if (nk > 0.5) S.particles.add(motes({ center: [4, 23, 2], extent: [20, 6, 20], n: 60, colors: ['#c8e0ff'], size: 0.05, alpha: 0.45, seed: 18 }));
    const H = head(st); const P = st.pos;
    const c = shot(t, [
      { t: [0, B.chicken - 0.2], pos: [[3.0, 24.6, -3.6], [3.6, 24.2, -3.0]], look: [8.5, 22.6, 5.0], fov: 55 },
      { t: [B.chicken - 0.2, B.bed], pos: [[12.6, 22.4, 2.8], [12.4, 22.3, 2.5]], look: [11.9, 21.8, -0.6], fov: 48 },
      { t: [B.bed, B.fish], pos: [[8.0, 24.6, 3.4], [8.0, 24.3, 3.9]], look: [8.0, 21.5, 7.3], fov: 50 },
      { t: [B.fish, B.night], pos: [[-1.0, 22.4, -5.2], [-1.2, 22.3, -5.4]], look: [-3.8, 21.4, -9.0], fov: 52, shake: () => shakeEnv(t, [[B.bite, 0.2, 0.2]]) },
      { t: [B.night, B.stars], pos: [[5.0, 22.6, 2.4], [4.6, 22.6, 2.0]], look: () => off(P, [0, 1.5, 0]), fov: 50 },
      { t: [B.stars, B.cool - 0.3], pos: [[3.3, 22.0, -0.6], [3.3, 22.0, -0.7]], look: [-1.0, 42, -14], fov: 72, ease: 'linear' },
      { t: [B.cool - 0.3, B.inside], pos: [() => off(H, [0.9, 0, 0.9]), () => off(H, [0.8, 0, 0.8])], look: () => H, fov: 40 },
      { t: [B.inside, B.knocks[0] - 0.3], pos: [[7.0, 23.4, 3.4], [7.2, 23.2, 3.8]], look: [9.6, 22.6, 6.2], fov: 52 },
      { t: [B.knocks[0] - 0.3, B.nope - 0.4], pos: [[8.5, 22.4, 7.3], [8.5, 22.3, 6.8]], look: [8.5, 22.0, 4.4], fov: 52, shake: () => shakeEnv(t, B.knocks.map(k => [k, 0.35, 0.2])) },
      { t: [B.nope - 0.4, B.sign], pos: [() => off(H, [1.0, 0, -0.9]), () => off(H, [0.9, 0, -0.8])], look: () => H, fov: 42 },
      { t: [B.sign, 52], pos: [[9.7, 22.9, 7.7], [9.35, 22.65, 7.5]], look: [[7.35, 22.05, 6.5], [7.3, 22.05, 6.5]], fov: [55, 42], ease: 'out3', shake: () => shakeEnv(t, [[B.sign, 0.5, 0.4]]) },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: nk > 0.5 ? 0.9 : 0.5, saturation: nk > 0.5 ? 0.82 : 1.1 };
    if (t > B.knocks[0] - 0.3 && t < B.nope - 0.4) post.letterbox = 1;
    if (t > B.sign && t < B.sign + 0.3) post.rgb = 1;
    if (t < 19.6) { const ds = [0, 4.8, 9.0, 13.0, 19.6]; for (const d of ds) if (t > d - 0.08 && t < d + 0.12 && d > 0) post.flash = 0.5; }
    return { stage: S, post };
  }
  function cues() {
    const out = [...hero.events(4, 52, 'grass')];
    order.forEach((bi, n) => { if (n % 4 === 0) out.push({ t: appear[bi], id: 'place', gain: 0.5 }); });
    out.push({ t: B.turnChicken, id: 'cluck', gain: 0.8 }, { t: B.chicken + 0.5, id: 'cluck', gain: 0.5 }, { t: B.bed + 0.2, id: 'bedLie', gain: 0.6 }, { t: B.fish + 0.4, id: 'whoosh', gain: 0.4 }, { t: B.bite, id: 'splash', gain: 0.7 });
    out.push({ t: B.shut, id: 'woodSlam', gain: 1 }, ...B.knocks.map(k => ({ t: k, id: 'knock', gain: 1 })), { t: B.sign, id: 'stinger', gain: 1 });
    return out;
  }
  return { update, cues, hero };
}
