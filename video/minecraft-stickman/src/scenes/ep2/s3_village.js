// EP2 SCENE 3 — THE FROZEN VILLAGE. Statues that aren't statues. RUN.
import { Actor } from '../../engine/CharacterController.js';
import { shot } from '../../engine/CameraController.js';
import { burst, motes } from '../../engine/Particles.js';
import { Poses, pose, Ease, prog, shakeEnv, smooth, lerp, hash, EXPR } from '../../engine/AnimationSystem.js';
import { talker, head, off } from '../util.js';
import { L2 } from '../../story/ep2/stages.js';

const B = { arrive: 8.0, poke: 21.0, tip: 21.6, shatter: 22.7, quiet: 26.0, eyes: 27.0, heads: 33.4, run: 34.4, jump: 50.4, splash: 52.6 };
// frozen poses: [x, z, yaw, pose]
const V = [
  [-4.2, -2.0, 0.9, Poses.walk(0, { phase: 0.22 })],
  [3.5, -3.2, -0.6, pose({ lean: -0.35, headPitch: -0.45, lShP: 1.2, rShP: 1.2, lEl: 2.2, rEl: 2.2, lShR: -0.2, rShR: -0.2 })],
  [5.0, 2.5, -1.9, pose({ lShP: 1.4, rShP: 1.4, lEl: 0.3, rEl: 0.3, lean: 0.15 })],
  [-6.0, 3.2, 2.2, Poses.wave(0.3)],
  [1.5, 5.8, 2.9, pose({ lean: 0.45, headPitch: 0.5, lShP: 0.5, rShP: 0.5 })],
  [-1.8, 9.5, 3.1, Poses.stand(0)],
];

export default function s3(W) {
  const S = W.stages.village; const g = S.ground;
  const hero = new Actor(S.hero, {
    ground: (x, z) => (z > 22.5 ? 21 : g(x, z)), talk: talker('s3'), blinkSeed: 0.9,
    path: [[0, [0.5, -30]], [B.arrive, [0.3, -7.0], 'linear'], [12.0, [-0.6, -4.5]], [17.0, [1.6, 0.6]], [20.6, [-3.0, -1.2]], [B.run, [-3.0, -1.2]], [36.5, [-1.0, 3.2], 'in'], [42, [3.6, 10.5], 'linear'], [B.jump, [0.6, 22.4], 'linear'], [B.splash, [0.6, 27.5], 'linear']],
    acts: [[0, 'walk'], [B.arrive, 'wave'], [10.2, 'walk', { stride: 0.9 }], [20.6, 'idle'], [B.poke, 'punch', { rate: 1.2, sfx: null }], [B.poke + 0.8, 'idle'], [B.shatter, 'scared'], [B.shatter + 1.2, 'shrug'],
      [B.quiet, 'idle'], [B.heads, 'scared'], [B.run, 'panicRun', { stride: 1.6 }], [B.jump, 'idle']],
    yaw: [[0, 0], [B.arrive, 0], [12, -0.2], [17, 0.9], [20.6, -Math.PI / 2 - 0.3], [B.quiet, -Math.PI / 2 - 0.3], [B.eyes, 0.2], [B.heads, 0.2], [B.run, 0.6], [42, -0.25], [B.jump, -0.25]],
    expr: [[0, 'happy'], [3.2, 'excited'], [10.2, 'curious'], [15, 'confused'], [B.poke, 'curious'], [B.shatter, 'shocked'], [24.4, 'deadpan'], [B.eyes, 'worried'], [B.heads, 'terrified'], [B.jump, 'yell']],
    eyes: [[0, [0, 0]], [B.eyes, [0.4, 0]], [B.heads, [0, 0]]],
    look: [[0, [0, 0]], [13, [0.8, 0]], [15, [-0.8, 0]], [17, [0, 0]], [B.shatter + 0.6, [0, 0]], [24.4, [0.9, 0]], [26, [0, 0]]],
    jumps: [[B.jump, 0.55, 1.2]],
    yOff: [[0, 0], [B.jump + 0.5, 0], [B.splash, -10.5, 'in'], [60, -11]],
    tilt: [[0, 0], [B.jump + 0.5, 0], [B.splash, 0.6, 'in']],
  });
  function villagerPos(i, t) { // frozen... until they start skipping toward him like lag
    const [x, z] = V[i]; if (t < B.run) return [x, z];
    const hp = hero.xyz(Math.max(B.run, t - 1.2)); const k = Math.min(0.85, Math.floor((t - B.run) / 0.55) * 0.07 + (i % 3) * 0.05);
    return [lerp(x, hp[0], k), lerp(z, hp[2] - 1.5, k)];
  }
  function update(t) {
    S.reset(); S.light(L2.village, t, { cloudSpeed: 1 });
    const st = hero.state(t); st.visible = t < B.splash + 0.05; S.hero.apply(st);
    S.villagers.forEach((v, i) => {
      const [x, z] = villagerPos(i, t); const [, , yaw0, p] = V[i];
      const toHero = Math.atan2(st.pos[0] - x, st.pos[2] - z);
      let headYaw = 0; if (t > B.heads) { let d = toHero - yaw0; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; headYaw = d * smooth(prog(t, B.heads + i * 0.05, B.heads + 0.4 + i * 0.05)); }
      let yaw = yaw0; if (t > B.run) { yaw = toHero; headYaw = 0; }
      const face = { ...EXPR.neutral, blink: 1, lookX: 0, lookY: 0, sweatY: 0, eyeOpen: 1.1, pupil: 0.35 };
      if (i === 5 && t > B.eyes) { face.lookX = Math.sin((t - B.eyes) * 1.2) * 0.8; if (t > 30.4 && t < 31.8) { face.mouthOpen = 0.6; face.mouth = -0.3; } }
      if (t > B.heads) { face.pupil = 0.15; face.eyeOpen = 1.4; }
      let tilt = 0, visible = true; if (i === 0) { tilt = -Ease.in(prog(t, B.tip, B.shatter)) * 1.4; visible = t < B.shatter; }
      v.apply({ pos: [x, g(x, z), z], yaw, pose: { ...p, headYaw: p.headYaw + headYaw }, face, tilt, visible, groundY: g(x, z) });
    });
    S.particles.add(burst({ t0: B.shatter, pos: [V[0][0] - 0.6, g(-4, -2) + 0.5, V[0][1] - 0.3], n: 70, colors: ['#ffffff', '#111111', '#cccccc'], speed: 2.5, up: 2.5, gravity: 10, life: 1.2, size: 0.12, seed: 31 }));
    S.particles.add(burst({ t0: B.splash, pos: [st.pos[0], 11.2, st.pos[2]], n: 80, colors: ['#8fc4ff', '#ffffff', '#2f62d8'], speed: 2.5, up: 5, gravity: 12, life: 1.3, size: 0.12, seed: 32 }));
    S.particles.add(motes({ center: [0, 23, 0], extent: [30, 6, 30], n: 50, colors: ['#ffffff'], size: 0.04, alpha: 0.3, seed: 2 }));
    const H = head(st); const P = st.pos;
    const c = shot(t, [
      { t: [0, 4.5], pos: [[6, 26, -10], [5, 25, -12]], look: [0, 22, 0], fov: 55 },
      { t: [4.5, B.arrive + 2], pos: [() => off(H, [1.0, 0.1, 1.6]), () => off(H, [0.9, 0.1, 1.4])], look: () => H, fov: 44 },
      { t: [B.arrive + 2, 15.5], pos: [[-8, 22.8, -6], [-7, 22.6, 0]], look: [[0, 21.8, 0], [0, 21.8, 2]], fov: 50, ease: 'linear' },
      { t: [15.5, 20.0], pos: [[4.8, 22.6, -1.0], [4.6, 22.6, -0.6]], look: [3.5, 22.4, -3.2], fov: 45 },
      { t: [20.0, 24.2], pos: [[-2.6, 22.5, -4.4], [-2.7, 22.5, -4.2]], look: [-3.8, 21.8, -1.6], fov: 48, shake: () => shakeEnv(t, [[B.shatter, 0.3, 0.3]]) },
      { t: [24.2, B.eyes], pos: [() => off(H, [0.8, 0, 1.0]), () => off(H, [0.7, 0, 0.9])], look: () => H, fov: 42 },
      { t: [B.eyes, B.heads - 0.2], pos: [[-1.85, 22.75, 8.4], [-1.85, 22.75, 8.75]], look: [-1.8, 22.75, 9.5], fov: 40, ease: 'linear' },
      { t: [B.heads - 0.2, B.run], pos: [[2.5, 23.5, -6.0], [2.0, 23.6, -6.5]], look: [0, 22, 2], fov: 60, shake: () => shakeEnv(t, [[B.heads, 0.3, 0.6]]) },
      { t: [B.run, 42], pos: [() => off(P, [0.5, 1.4, 3.2]), () => off(P, [0.5, 1.4, 3.2])], look: () => off(P, [0, 1.2, -2]), fov: 60, shake: 0.12 },
      { t: [42, B.jump], pos: [() => off(P, [2.4, 1.2, -2.0]), () => off(P, [2.4, 1.2, -2.0])], look: () => off(P, [0, 1.0, 1]), fov: 62, shake: 0.12 },
      { t: [B.jump, 60], pos: [[4.0, 13.0, 33.0], [4.0, 12.6, 33.5]], look: [() => off(P, [0, 1, 0]), () => [0.6, 12, 25]], fov: 55 },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 0.55, saturation: 1.0 };
    if (t > B.quiet && t < B.run) { post.saturation = 0.6; post.vignette = 1.1; post.letterbox = 1; }
    if (t > B.run && t < B.jump) { const f = (t - B.run) % 0.55; post.glitch = f < 0.06 ? 0.5 : 0.05; }
    return { stage: S, post };
  }
  function cues() {
    const out = [...hero.events(0, B.jump, 'grass'), { t: B.poke + 0.3, id: 'punch', gain: 0.4 }, { t: B.tip + 0.6, id: 'land', gain: 0.6 }, { t: B.shatter, id: 'shatter', gain: 1 }];
    out.push({ t: B.heads, id: 'grind', gain: 1 }); for (let t = B.run; t < B.jump; t += 0.55) out.push({ t, id: 'glitchShort', gain: 0.3 });
    out.push({ t: B.jump + 0.3, id: 'whooshDown', gain: 0.7 }, { t: B.splash, id: 'splash', gain: 1 });
    return out;
  }
  void hash;
  return { update, cues, hero };
}
