// SCENE 6 — THE VOID. Floating path, giant computer, PLAYER DETECTED, countdown, RESET WORLD.
import { Actor } from '../engine/CharacterController.js';
import { shot } from '../engine/CameraController.js';
import { burst, motes, swirl } from '../engine/Particles.js';
import { Ease, clamp, prog, shakeEnv, smooth, hash } from '../engine/AnimationSystem.js';
import { LIGHT } from '../engine/EnvironmentManager.js';
import { talker, head, off } from './util.js';

export const BEATS = { out: 0.4, walk: 5.0, platform: 15.6, detected: 24.0, count: 26.0, attack: 27.0, notice: 32.0, sprint: 33.0, dive: 34.7, press: 35.35, flash: 35.6 };
const B = BEATS;
const HITS = [27.25, 27.75, 28.25, 29.6, 30.0, 30.4];

export default function s6(W) {
  const S = W.stages.void; const g = S.ground;
  const stepPath = [];
  for (let z = 2; z <= 21; z += 1) stepPath.push([B.walk + (z - 2) / 19 * (B.platform - B.walk), [S.stepX(z), z + 0.5], 'linear']);
  const hero = new Actor(S.hero, {
    ground: (x, z) => (z > 1.5 && z < 21 ? 30 : g(x, z)), talk: talker('s6'), blinkSeed: 0.2,
    path: [[0, [0.5, -1.4]], [B.out, [0.5, -1.4]], [2.6, [0.5, 1.0], 'out'], [B.walk, [0.5, 1.4]], ...stepPath, [17.0, [0.5, 23.6], 'out'],
      [B.attack - 0.6, [0.5, 23.6]], [B.attack, [0.6, 26.3], 'in'], [30.8, [0.6, 26.3]], [31.4, [0.9, 26.9], 'out'], [B.sprint, [0.9, 26.9]], [B.dive, [3.0, 25.9], 'linear'], [B.press, [3.5, 25.55], 'out']],
    yaw: [[0, 0], [B.out + 2.5, 0], [3.3, -0.7], [4.2, 0.7], [B.walk, 0], [B.platform, 0], [B.attack, 0], [30.8, 0], [31.4, 0.4], [B.notice, 0.4], [B.notice + 0.3, 2.0], [B.sprint + 0.3, 2.2], [B.dive, 2.8], [B.press, Math.PI]],
    acts: [[0, 'walk'], [2.6, 'lookAround'], [B.walk, 'walk', { stride: 0.95 }], [B.platform + 0.2, 'walk'], [17.0, 'lookUp'], [19.0, 'shrug'], [21.0, 'idle'], [B.detected, 'scared'],
      [B.attack - 0.6, 'run', { stride: 1.5 }], [B.attack, 'swing', { rate: 2, sfx: null }], [28.75, 'idle'], [29.4, 'punch', { rate: 2.5, sfx: null }], [30.8, 'scared'], [B.notice, 'idle'],
      [B.sprint, 'run', { stride: 1.4 }], [B.dive, 'press', { k: 0.4 }], [B.press - 0.2, 'press']],
    expr: [[0, 'shocked'], [2.6, 'curious'], [B.walk, 'worried'], [17.0, 'shocked'], [18.8, 'deadpan'], [B.detected, 'terrified'], [B.attack, 'yell'], [28.6, 'yell'], [30.8, 'scared'], [B.notice, 'shocked'], [B.sprint, 'determined'], [B.press, 'yell']],
    eyes: [[0, [0, 0]], [B.walk, [0, 0.6]], [17.0, [0, -0.8]], [18.8, [0, 0]], [B.notice - 0.3, [0, 0]], [B.notice, [0.9, 0]], [B.sprint, [0, 0]]],
    items: [[0, { r: 'diamondPickaxe' }], [29.3, {}], [30.8, { r: 'diamondPickaxe' }], [B.sprint, {}]],
    jumps: [[B.dive - 0.05, 0.5, 0.6]],
  });

  function update(t) {
    S.reset();
    S.light(LIGHT.void, t, { glow: 0 });
    const st = hero.state(t); S.hero.apply(st);
    S.heroLight.position.set(st.pos[0], st.pos[1] + 2.4, st.pos[2] - 0.6); S.heroLight.intensity = 3;
    // steps fall away behind him
    S.steps.forEach(m => { const z = m.userData.z; const tz = B.walk + (z - 2) / 19 * (B.platform - B.walk) + 1.4; const k = Math.max(0, t - tz);
      m.position.y = 29.5 - 4.9 * k * k; m.rotation.set(k * 0.8, k * 0.5, 0); m.visible = m.position.y > 0; });
    S.portal.update(t, 1 - prog(t, 3, 5) * 0.6); S.portalLight.intensity = 6 * (1 - prog(t, 3, 5) * 0.6);
    // debris
    S.debris.forEach((m, i) => { const d = m.userData; m.position.set(d.home[0], d.home[1] + Math.sin(t * 0.4 + d.ph) * 1.5, d.home[2]); m.rotation.set(t * d.spin, t * d.spin * 0.7, d.ph); m.scale.setScalar(d.s); });
    // computer
    const mode = t < B.detected ? 'deleting' : t < B.count ? 'detected' : t < B.flash ? 'count' : 'white';
    const hit = HITS.some(h => t > h && t < h + 0.22);
    const eye = Math.atan2(st.pos[0] - 0, st.pos[2] - 29.4) + Math.PI; void eye;
    S.computer.update({ mode, t, pct: 0.86 + prog(t, 0, B.detected) * 0.11, count: Math.max(1, 10 - Math.floor(t - B.count)), glitch: hit ? 1 : t > B.count ? 0.15 : 0,
      ghost: hit ? 1 : 0, eyeOn: t > B.detected, eyeYaw: t > B.detected ? clamp(-(st.pos[0]) * 0.12, -0.6, 0.6) : Math.sin(t * 0.7) * 0.5, eyePitch: t > B.detected ? 0.35 : 0.1, lightI: t > B.detected ? 30 : 22 });
    const press = prog(t, B.press, B.press + 0.12);
    S.button.update(t, press, t > B.notice - 1 ? 1 : 0.4); S.buttonLight.intensity = t > B.notice - 1 ? 3 : 1;
    // particles
    S.particles.add(motes({ center: [0, 33, 15], extent: [40, 16, 50], n: 200, colors: ['#b8a0ff', '#ffffff', '#6a4cff'], size: 0.06, alpha: 0.6, seed: 61, speed: 0.4 }));
    S.glowParticles.add(swirl({ center: [0.5, 30, -1.3], radius: 1.1, height: 3, n: 50, colors: ['#b050ff'], size: 0.08, intensity: () => 1 - prog(t, 3, 5) * 0.6 }));
    S.glowParticles.add(burst({ t0: 0.3, pos: [0.5, 31.3, -1.0], n: 70, colors: ['#b050ff', '#ffffff'], speed: 2.5, up: 0.5, gravity: 0, life: 1.0, size: 0.1, seed: 140 }));
    HITS.forEach((h, i) => S.glowParticles.add(burst({ t0: h, pos: [0.5 + (i % 2) * 0.4, 31.6, 27.6], n: 26, colors: ['#3dff7a', '#ffffff', '#ff2b3a'], speed: 2, up: 0.8, gravity: 0, life: 0.45, size: 0.09, seed: 150 + i })));
    S.glowParticles.add(burst({ t0: B.press, pos: [3.5, 31.4, 24.5], n: 120, colors: ['#ffffff', '#ffe08a'], speed: 5, up: 2, gravity: 0, life: 0.6, size: 0.14, seed: 160 }));

    // ---------- camera
    const H = head(st); const P = st.pos;
    const c = shot(t, [
      { t: [0, B.walk], pos: [[0.5, 31.7, 4.2], [0.6, 31.6, 3.4]], look: [() => off(P, [0, 1.3, 0]), () => off(P, [0, 1.4, 0])], fov: 52 },
      { t: [B.walk, 10.5], pos: [[-12, 36, 3], [-11, 35, 8]], look: [[0.5, 31, 12], [0.5, 32, 18]], fov: 55, ease: 'linear' },
      { t: [10.5, B.platform + 0.4], pos: [() => off(P, [0.9, 1.9, -2.8]), () => off(P, [0.9, 1.9, -2.8])], look: () => off(P, [0, 1.3, 4]), fov: 55 },
      { t: [B.platform + 0.4, 18.4], pos: [[-2.6, 30.4, 20.4], [-2.3, 30.5, 21.4]], look: [[0, 33.5, 29.5], [0, 35.0, 29.5]], fov: 62, ease: 'sine' },
      { t: [18.4, 21.2], pos: [() => off(H, [0.7, 0.0, 1.2]), () => off(H, [0.6, 0.0, 1.05])], look: () => H, fov: 42 },
      { t: [21.2, B.detected], pos: [[0, 34.4, 22.5], [0, 34.4, 23.8]], look: [0, 34.4, 29.5], fov: 52, ease: 'linear' },
      { t: [B.detected, B.count], pos: [[1.6, 37.3, 24.3], [1.2, 37.4, 25.2]], look: [0, 37.25, 29.4], fov: 40, shake: () => shakeEnv(t, [[B.detected, 0.5, 0.4]]) },
      { t: [B.count, 28.4], pos: [[-4.4, 31.9, 24.0], [-4.0, 31.8, 24.3]], look: () => off(P, [0, 1.2, 1.0]), fov: 55, shake: () => 0.08 + shakeEnv(t, HITS.map(h => [h, 0.35, 0.15])) },
      { t: [28.4, 30.2], pos: [() => off(H, [0.7, 0.1, 1.15]), () => off(H, [0.6, 0.1, 1.0])], look: () => H, fov: 44, shake: () => 0.08 + shakeEnv(t, HITS.map(h => [h, 0.35, 0.15])) },
      { t: [30.2, B.notice], pos: [[-5.0, 33.0, 20.5], [-4.6, 33.0, 21.0]], look: [0.5, 31.5, 26.5], fov: 58, shake: 0.08 },
      { t: [B.notice, B.sprint], pos: [[1.6, 31.9, 23.4], [2.6, 31.6, 23.6]], look: [3.5, 31.1, 24.5], fov: [55, 30], ease: Ease.out3 },
      { t: [B.sprint, B.flash + 1], pos: [[6.4, 31.4, 27.4], [5.0, 31.3, 26.3]], look: [() => off(P, [0, 1.0, 0]), () => [3.5, 31.2, 24.8]], fov: [55, 45], ease: 'in', shake: () => shakeEnv(t, [[B.press, 1.0, 0.4]]) },
    ]);
    W.cam.apply({ ...c, t });
    const post = { vignette: 1.0, saturation: 1.0, contrast: 1.1, grain: 0.05 };
    if (t > B.count && t < B.flash) { post.vignette = 1.3; post.tint = [1, 0.5, 0.5]; post.tintAmt = 0.12 * (1 - ((t - B.count) % 1)); }
    if (t > B.detected && t < B.detected + 0.3) post.glitch = 0.6;
    if (HITS.some(h => t > h && t < h + 0.18)) { post.glitch = 0.5; post.rgb = 1; }
    if (t > B.dive && t < B.flash) { post.zoomBlur = prog(t, B.dive, B.flash) * 2; }
    post.flash = smooth(prog(t, B.press + 0.05, B.flash + 0.1));
    return { stage: S, post, noSubs: t > B.flash + 0.2 };
  }
  function cues() {
    return [
      { t: 0.3, id: 'portalEnter', gain: 0.8 }, ...hero.events(0, 38.5, 'stone'),
      { t: B.walk + 3, id: 'blockFall', gain: 0.4 }, { t: B.walk + 6, id: 'blockFall', gain: 0.35 }, { t: B.walk + 9, id: 'blockFall', gain: 0.35 },
      { t: B.platform + 0.5, id: 'computerHum', gain: 0.6, dur: 8 }, { t: B.detected, id: 'alarm', gain: 0.9 }, { t: B.detected + 0.3, id: 'servo', gain: 0.6 },
      ...HITS.map(h => ({ t: h, id: 'ghostHit', gain: 0.9 })), { t: B.notice, id: 'stinger', gain: 0.6 },
      { t: B.press, id: 'buttonPress', gain: 1 }, { t: B.flash, id: 'flashBoom', gain: 1 }, { t: B.flash + 0.2, id: 'ringing', gain: 0.5, dur: 3 },
    ];
  }
  void hash;
  return { update, cues, hero };
}
