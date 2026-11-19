// AnimationSystem: easing, keyframe tracks, deterministic noise, pose library and pose blending.
// Everything here is a pure function of time so any frame can be rendered in any order.

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = k => k * k * (3 - 2 * k);
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export const Ease = {
  linear: k => k,
  in: k => k * k,
  out: k => 1 - (1 - k) * (1 - k),
  inOut: k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
  in3: k => k * k * k,
  out3: k => 1 - Math.pow(1 - k, 3),
  inOut3: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  sine: k => -(Math.cos(Math.PI * k) - 1) / 2,
  outBack: k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  inBack: k => { const c1 = 1.70158; return (c1 + 1) * k * k * k - c1 * k * k; },
  outElastic: k => (k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (TAU / 3)) + 1),
  outBounce: k => {
    const n1 = 7.5625, d1 = 2.75;
    if (k < 1 / d1) return n1 * k * k;
    if (k < 2 / d1) return n1 * (k -= 1.5 / d1) * k + 0.75;
    if (k < 2.5 / d1) return n1 * (k -= 2.25 / d1) * k + 0.9375;
    return n1 * (k -= 2.625 / d1) * k + 0.984375;
  },
  step: k => (k < 1 ? 0 : 1),
  expo: k => (k === 1 ? 1 : 1 - Math.pow(2, -10 * k)),
};
const easeFn = e => (typeof e === 'function' ? e : Ease[e || 'inOut']);

const lerpV = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k));

/** Keyframe track: new Keys([[t, value, ease], ...]). Ease belongs to the segment arriving at that key. */
export class Keys {
  constructor(keys) { this.k = keys.slice().sort((a, b) => a[0] - b[0]); }
  at(t) {
    const k = this.k;
    if (t <= k[0][0]) return k[0][1];
    if (t >= k[k.length - 1][0]) return k[k.length - 1][1];
    let i = 1; while (k[i][0] < t) i++;
    const a = k[i - 1], b = k[i];
    return lerpV(a[1], b[1], easeFn(b[2])((t - a[0]) / (b[0] - a[0])));
  }
  get end() { return this.k[this.k.length - 1][0]; }
}
export const keys = arr => new Keys(arr);

/** Discrete step track: value of the last key with time <= t. */
export function stepAt(arr, t, def) { let v = def; for (const [kt, kv] of arr) if (t >= kt) v = kv; return v; }

// ---------- deterministic noise ----------
export function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return s - Math.floor(s); }
export function hash2(x, y) { return hash(x * 157.31 + y * 113.97); }
export function hash3(x, y, z) { return hash(x * 157.31 + y * 113.97 + z * 271.9); }
export function noise1(x) { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
export function noise2(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}
export function fbm2(x, y, oct = 4) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { s += a * noise2(x * f, y * f); f *= 2; a *= 0.5; } return s; }
export function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e9) / 1e9; }; }

/** Sum of decaying shake impulses: [[time, amplitude, decaySeconds], ...] plus optional constant. */
export function shakeEnv(t, impulses, base = 0) {
  let a = base;
  for (const [t0, amp, dec = 0.5] of impulses) if (t >= t0) a += amp * Math.exp(-(t - t0) / dec * 3) * (t - t0 < dec * 2 ? 1 : 0);
  return a;
}

// ---------- Pose library ----------
// Angles in radians. Pitch > 0 = forward. Roll > 0 = outward. Knee > 0 = bend. Lean > 0 = torso forward.
export const POSE_KEYS = ['bob', 'lean', 'side', 'twist', 'headYaw', 'headPitch', 'headRoll',
  'lShP', 'lShR', 'lEl', 'rShP', 'rShR', 'rEl', 'lHipP', 'lHipR', 'lKn', 'rHipP', 'rHipR', 'rKn', 'lift'];

export function pose(o = {}) {
  const p = { bob: 0, lean: 0, side: 0, twist: 0, headYaw: 0, headPitch: 0, headRoll: 0,
    lShP: 0, lShR: 0.12, lEl: 0.15, rShP: 0, rShR: 0.12, rEl: 0.15,
    lHipP: 0, lHipR: 0.04, lKn: 0, rHipP: 0, rHipR: 0.04, rKn: 0, lift: 0 };
  return Object.assign(p, o);
}
export function blendPose(a, b, w) { const o = {}; for (const k of POSE_KEYS) o[k] = lerp(a[k], b[k], w); return o; }
export function addPose(a, d) { const o = { ...a }; for (const k in d) if (k in o) o[k] += d[k]; return o; }

const S = Math.sin, C = Math.cos;
/** Procedural pose generators. Each takes (t = seconds since the action started, opts). */
export const Poses = {
  idle: (t) => pose({ bob: S(t * 2.2) * 0.012, lean: 0.03 + S(t * 2.2) * 0.01, lShP: S(t * 1.1) * 0.04, rShP: -S(t * 1.1) * 0.04,
    lShR: 0.14 + S(t * 2.2) * 0.02, rShR: 0.14 + S(t * 2.2) * 0.02, headPitch: S(t * 0.7) * 0.03 }),
  walk: (t, o = {}) => {
    const ph = (o.phase ?? t * 1.8) * TAU; const s = S(ph);
    return pose({ bob: Math.abs(C(ph)) * 0.05 - 0.02, lean: 0.08, twist: s * 0.08,
      lHipP: s * 0.5, rHipP: -s * 0.5, lKn: Math.max(0, -C(ph)) * 0.75 + 0.1, rKn: Math.max(0, C(ph)) * 0.75 + 0.1,
      lShP: -s * 0.55, rShP: s * 0.55, lEl: 0.35, rEl: 0.35, headPitch: -0.03 });
  },
  sneak: (t, o = {}) => {
    const ph = (o.phase ?? t * 1.2) * TAU; const s = S(ph);
    return pose({ bob: -0.16 + Math.abs(C(ph)) * 0.025, lean: 0.38, lHipP: 0.45 + s * 0.35, rHipP: 0.45 - s * 0.35,
      lKn: 0.9 + Math.max(0, -C(ph)) * 0.4, rKn: 0.9 + Math.max(0, C(ph)) * 0.4,
      lShP: 0.6, rShP: 0.6, lShR: 0.35, rShR: 0.35, lEl: 1.4, rEl: 1.4, headPitch: -0.3 });
  },
  run: (t, o = {}) => {
    const ph = (o.phase ?? t * 2.8) * TAU; const s = S(ph);
    return pose({ bob: Math.abs(C(ph)) * 0.1 - 0.05, lean: 0.32, twist: s * 0.15,
      lHipP: s * 0.95 + 0.15, rHipP: -s * 0.95 + 0.15, lKn: Math.max(0, -C(ph)) * 1.5 + 0.25, rKn: Math.max(0, C(ph)) * 1.5 + 0.25,
      lShP: -s * 1.1, rShP: s * 1.1, lEl: 1.5, rEl: 1.5, headPitch: -0.2 });
  },
  panicRun: (t, o = {}) => { // arms flailing over head - comedic fear run
    const p = Poses.run(t, o); const ph = t * 9;
    return Object.assign(p, { lShP: 2.6 + S(ph) * 0.4, rShP: 2.6 + C(ph) * 0.4, lShR: 0.4, rShR: 0.4, lEl: 0.3, rEl: 0.3, lean: 0.2, headPitch: -0.35 });
  },
  punch: (t, o = {}) => { // right hand jabs, rate punches per second
    const r = o.rate ?? 3; const ph = (t * r) % 1; const k = ph < 0.35 ? Ease.out(ph / 0.35) : 1 - Ease.inOut((ph - 0.35) / 0.65);
    return pose({ lean: 0.12 + k * 0.08, twist: -0.25 * k + 0.1, lShP: 0.9, lEl: 1.8, lShR: 0.2,
      rShP: 0.6 + k * 0.95, rEl: 1.9 - k * 1.7, rShR: 0.1, lHipP: 0.25, rHipP: -0.2, lKn: 0.2, rKn: 0.1, headPitch: 0.05 });
  },
  mine: (t, o = {}) => { // overhead pickaxe swings
    const r = o.rate ?? 2.2; const ph = (t * r) % 1; const k = ph < 0.55 ? Ease.inOut(ph / 0.55) : 1 - Ease.in3((ph - 0.55) / 0.45);
    return pose({ lean: 0.1 + (1 - k) * 0.12, rShP: 0.5 + k * 2.1, rEl: 0.4 + k * 0.9, rShR: 0.1, lShP: 0.7, lEl: 1.1, lShR: 0.15,
      lHipP: 0.2, rHipP: -0.15, lKn: 0.15, rKn: 0.1, headPitch: 0.05 - k * 0.15, bob: -k * 0.02 });
  },
  craft: (t) => { const a = S(t * 14), b = S(t * 14 + 2); // frantic hands-busy motion
    return pose({ lean: 0.25, headPitch: 0.45, lShP: 0.9 + a * 0.25, rShP: 0.9 + b * 0.25, lEl: 1.4 + b * 0.3, rEl: 1.4 + a * 0.3, lShR: 0.25, rShR: 0.25, bob: -0.02 }); },
  hammer: (t) => { const ph = (t * 3.2) % 1; const k = ph < 0.6 ? Ease.out(ph / 0.6) : 1 - Ease.in((ph - 0.6) / 0.4);
    return pose({ lean: 0.3, headPitch: 0.5, rShP: 0.6 + k * 1.6, rEl: 1.0, lShP: 0.7, lEl: 1.2, lShR: 0.25, rShR: 0.1 }); },
  place: (t, o = {}) => { const r = o.rate ?? 5; const ph = (t * r) % 1; const k = S(ph * Math.PI);
    return pose({ lean: 0.1, rShP: 0.7 + k * 0.7, rEl: 0.6 - k * 0.4, lShP: 0.1, lShR: 0.2, headPitch: 0.1 + k * 0.1 }); },
  lookAround: (t) => pose({ headYaw: S(t * 1.6) * 0.9, headPitch: -0.1 + S(t * 0.8) * 0.05, lean: 0.02, twist: S(t * 1.6) * 0.15,
    lShR: 0.15, rShR: 0.15, lEl: 0.2, rEl: 0.2 }),
  lookUp: (t) => pose({ headPitch: -0.75, lean: -0.12, lShR: 0.2, rShR: 0.2, bob: S(t * 2) * 0.005 }),
  checkWatch: () => pose({ lShP: 1.25, lShR: -0.25, lEl: 1.85, headPitch: 0.55, headYaw: 0.25, lean: 0.1 }),
  handsOnHips: (t) => pose({ lShR: 0.75, rShR: 0.75, lShP: -0.2, rShP: -0.2, lEl: 2.0, rEl: 2.0, lean: -0.1, headPitch: -0.12, bob: S(t * 2) * 0.008, lHipR: 0.12, rHipR: 0.12 }),
  shrug: () => pose({ lShR: 0.55, rShR: 0.55, lShP: 0.3, rShP: 0.3, lEl: 1.9, rEl: 1.9, headRoll: 0.18, bob: 0.02 }),
  scared: (t) => pose({ bob: -0.06 + S(t * 38) * 0.006, lean: -0.15, lShP: 0.9, rShP: 0.9, lEl: 1.9, rEl: 1.9, lShR: -0.1, rShR: -0.1,
    lHipP: 0.15, rHipP: -0.1, lKn: 0.35, rKn: 0.35, headPitch: 0.1 + S(t * 31) * 0.02, headYaw: S(t * 27) * 0.02 }),
  cower: (t) => pose({ bob: -0.35 + S(t * 30) * 0.008, lean: 0.55, lShP: 2.2, rShP: 2.2, lShR: -0.3, rShR: -0.3, lEl: 2.3, rEl: 2.3,
    lHipP: 1.1, rHipP: 1.1, lKn: 1.9, rKn: 1.9, headPitch: 0.45 }),
  backAway: (t, o = {}) => { const p = Poses.walk(t, { phase: -(o.phase ?? t * 1.6) }); return Object.assign(p, { lean: -0.2, lShP: 0.9, rShP: 0.9, lEl: 1.5, rEl: 1.5, lShR: 0, rShR: 0 }); },
  shield: (t) => pose({ bob: -0.15, lean: 0.15, lShP: 1.35, lShR: -0.1, lEl: 1.25, rShP: 0.6, rEl: 1.2, rShR: 0.2,
    lHipP: 0.6, rHipP: -0.3, lKn: 0.8, rKn: 0.4, headPitch: -0.05 + S(t * 20) * 0.01 }),
  sleep: () => pose({ lShP: 0.05, rShP: 0.05, lShR: 0.1, rShR: 0.1, lEl: 0.1, rEl: 0.1, headPitch: -0.1 }),
  sitUp: () => pose({ lHipP: 1.5, rHipP: 1.5, lKn: 0.1, rKn: 0.1, lean: 0.2, lShP: 0.3, rShP: 0.3, lShR: 0.3, rShR: 0.3, lEl: 0.2, rEl: 0.2 }),
  sit: (t) => pose({ bob: -0.82, lHipP: 1.5, rHipP: 1.5, lKn: 1.2, rKn: 1.2, lHipR: 0.25, rHipR: 0.25, lean: 0.1 + S(t) * 0.02,
    lShP: 0.9, rShP: 0.9, lEl: 1.2, rEl: 1.2, lShR: 0.1, rShR: 0.1, headPitch: 0.35 }),
  read: (t) => pose({ lShP: 0.95, rShP: 0.95, lEl: 1.5, rEl: 1.5, lShR: -0.05, rShR: -0.05, headPitch: 0.5 + S(t * 0.6) * 0.03, lean: 0.12 }),
  holdUp: (t) => pose({ rShP: 2.9, rShR: 0.2, rEl: 0.1, lShR: 0.4, lShP: 0.2, lean: -0.15, headPitch: -0.5, bob: 0.02 + S(t * 6) * 0.01 }),
  point: (t, o = {}) => pose({ rShP: 1.55, rShR: o.roll ?? 0.0, rEl: 0.05, lShR: 0.12, lean: 0, headYaw: o.headYaw ?? 0, headPitch: 0.05 }),
  holdSign: (t) => pose({ lShP: 1.1, rShP: 1.1, lEl: 1.1, rEl: 1.1, lShR: 0.25, rShR: 0.25, headPitch: -0.05, bob: S(t * 1.5) * 0.004 }),
  stand: (t) => pose({ lShR: 0.08, rShR: 0.08, lEl: 0.05, rEl: 0.05, bob: S(t * 1.5) * 0.004 }),
  jump: (t, o = {}) => { // o.k : 0..1 progress through jump
    const k = o.k ?? clamp(t / 0.6); const air = S(k * Math.PI);
    return pose({ lean: 0.2, lHipP: 0.9 * air, rHipP: -0.3 * air, lKn: 1.2 * air, rKn: 0.5 * air, lShP: -0.7 * air + 0.2, rShP: 1.6 * air, lEl: 0.6, rEl: 0.6, lShR: 0.5 * air, rShR: 0.3 * air, headPitch: -0.1 });
  },
  land: (t) => { const k = Math.exp(-t * 6); return pose({ bob: -0.25 * k, lean: 0.3 * k, lKn: 0.9 * k, rKn: 0.9 * k, lHipP: 0.5 * k, rHipP: 0.5 * k, lShR: 0.2 + 0.6 * k, rShR: 0.2 + 0.6 * k }); },
  swing: (t, o = {}) => { // horizontal weapon swing
    const r = o.rate ?? 2.5; const ph = (t * r) % 1; const k = ph < 0.4 ? Ease.out(ph / 0.4) : 1 - Ease.inOut((ph - 0.4) / 0.6);
    return pose({ twist: 0.6 - k * 1.2, lean: 0.25, rShP: 1.3, rShR: 0.9 - k * 1.3, rEl: 0.3, lShP: 0.5, lEl: 1, lHipP: 0.45, rHipP: -0.3, lKn: 0.4, rKn: 0.2 });
  },
  facepalm: () => pose({ rShP: 1.4, rShR: -0.35, rEl: 2.45, headPitch: 0.35, lShR: 0.1, lean: 0.12 }),
  relief: (t) => pose({ lShP: 0.0, rShP: 0.0, lShR: 1.3, rShR: 1.3, lEl: 0.1, rEl: 0.1, lHipR: 0.35, rHipR: 0.35, headPitch: -0.05 }),
  press: (t, o = {}) => { const k = o.k ?? 1; return pose({ lean: 0.5 * k + 0.1, rShP: 1.0 + k * 0.35, rEl: 0.2, lShP: -0.6, lShR: 0.5, lHipP: 0.6 * k, lKn: 0.7 * k, rHipP: -0.4 * k, rKn: 0.2, bob: -0.12 * k, headPitch: 0.25 }); },
  wave: (t) => pose({ rShP: 0.2, rShR: 2.3 + S(t * 9) * 0.3, rEl: 0.5, lShR: 0.12 }),
  breathe: (t) => pose({ bob: -0.05 + S(t * 9) * 0.02, lean: 0.35 + S(t * 9) * 0.05, lShP: 0.6, rShP: 0.6, lEl: 0.3, rEl: 0.3, lHipP: 0.25, rHipP: 0.25, lKn: 0.35, rKn: 0.35, headPitch: 0.25 }),
  gulp: (t) => pose({ bob: S(t * 4) * 0.02, lShR: 0.05, rShR: 0.05, lShP: 0.25, rShP: 0.25, lEl: 1.7, rEl: 1.7, headPitch: 0.15 - S(t * 4) * 0.08 }),
  tiptoe: (t, o = {}) => { const ph = (o.phase ?? t) * TAU; const s = S(ph);
    return pose({ bob: 0.04 + Math.abs(C(ph)) * 0.03, lean: 0.1, lHipP: s * 0.35 + 0.1, rHipP: -s * 0.35 + 0.1, lKn: 0.5 + Math.max(0, -C(ph)) * 0.5, rKn: 0.5 + Math.max(0, C(ph)) * 0.5,
      lShP: 0.3, rShP: 0.3, lShR: 0.6, rShR: 0.6, lEl: 1.9, rEl: 1.9, headPitch: 0.05, headYaw: S(t * 2) * 0.2 }); },
};

/** Expressions as continuous face parameters (blended). */
export const EXPR = {
  neutral:   { eyeOpen: 1, eyeSize: 1, pupil: 0.55, brow: 0, browTilt: 0, mouth: 0.15, mouthOpen: 0, mouthW: 0.8, smirk: 0, wobble: 0, sweat: 0, blush: 0 },
  happy:     { eyeOpen: 0.85, eyeSize: 1, pupil: 0.6, brow: 0.15, browTilt: 0, mouth: 0.8, mouthOpen: 0.25, mouthW: 1.0, smirk: 0, wobble: 0, sweat: 0, blush: 0.4 },
  excited:   { eyeOpen: 1.15, eyeSize: 1.15, pupil: 0.7, brow: 0.35, browTilt: 0, mouth: 1, mouthOpen: 0.7, mouthW: 1.1, smirk: 0, wobble: 0, sweat: 0, blush: 0.6 },
  curious:   { eyeOpen: 1.05, eyeSize: 1.05, pupil: 0.6, brow: 0.2, browTilt: 0.35, mouth: 0.1, mouthOpen: 0.1, mouthW: 0.5, smirk: 0.2, wobble: 0, sweat: 0, blush: 0 },
  confused:  { eyeOpen: 1, eyeSize: 1, pupil: 0.5, brow: 0.1, browTilt: 0.8, mouth: -0.15, mouthOpen: 0.05, mouthW: 0.6, smirk: 0.5, wobble: 0.3, sweat: 0, blush: 0 },
  annoyed:   { eyeOpen: 0.55, eyeSize: 1, pupil: 0.5, brow: -0.25, browTilt: -0.2, mouth: -0.2, mouthOpen: 0, mouthW: 0.7, smirk: 0.3, wobble: 0, sweat: 0, blush: 0 },
  deadpan:   { eyeOpen: 0.5, eyeSize: 1, pupil: 0.55, brow: -0.05, browTilt: 0, mouth: 0, mouthOpen: 0, mouthW: 0.8, smirk: 0, wobble: 0, sweat: 0, blush: 0 },
  worried:   { eyeOpen: 1.05, eyeSize: 1.05, pupil: 0.45, brow: 0.3, browTilt: -0.6, mouth: -0.4, mouthOpen: 0.1, mouthW: 0.7, smirk: 0, wobble: 0.5, sweat: 0.5, blush: 0 },
  scared:    { eyeOpen: 1.3, eyeSize: 1.25, pupil: 0.3, brow: 0.5, browTilt: -0.7, mouth: -0.6, mouthOpen: 0.45, mouthW: 0.8, smirk: 0, wobble: 1, sweat: 1, blush: 0 },
  terrified: { eyeOpen: 1.45, eyeSize: 1.4, pupil: 0.18, brow: 0.7, browTilt: -0.8, mouth: -0.7, mouthOpen: 1, mouthW: 0.9, smirk: 0, wobble: 1.4, sweat: 1, blush: 0 },
  shocked:   { eyeOpen: 1.4, eyeSize: 1.35, pupil: 0.25, brow: 0.8, browTilt: 0, mouth: -0.1, mouthOpen: 0.9, mouthW: 0.45, smirk: 0, wobble: 0, sweat: 0.3, blush: 0 },
  determined:{ eyeOpen: 0.8, eyeSize: 1, pupil: 0.6, brow: -0.3, browTilt: 0.4, mouth: 0.05, mouthOpen: 0, mouthW: 0.9, smirk: 0.15, wobble: 0, sweat: 0, blush: 0 },
  smug:      { eyeOpen: 0.6, eyeSize: 1, pupil: 0.55, brow: 0.05, browTilt: 0.5, mouth: 0.55, mouthOpen: 0, mouthW: 0.8, smirk: 0.8, wobble: 0, sweat: 0, blush: 0.2 },
  relieved:  { eyeOpen: 0.15, eyeSize: 1, pupil: 0.5, brow: 0.25, browTilt: -0.3, mouth: 0.7, mouthOpen: 0.15, mouthW: 1.0, smirk: 0, wobble: 0, sweat: 0, blush: 0.3 },
  squint:    { eyeOpen: 0.3, eyeSize: 1, pupil: 0.5, brow: -0.3, browTilt: 0, mouth: -0.1, mouthOpen: 0, mouthW: 0.6, smirk: 0.2, wobble: 0, sweat: 0, blush: 0 },
  sleep:     { eyeOpen: 0, eyeSize: 1, pupil: 0.5, brow: 0, browTilt: 0, mouth: 0.1, mouthOpen: 0.1, mouthW: 0.5, smirk: 0, wobble: 0, sweat: 0, blush: 0 },
  yell:      { eyeOpen: 0.9, eyeSize: 1.1, pupil: 0.4, brow: -0.4, browTilt: -0.3, mouth: -0.2, mouthOpen: 1, mouthW: 1.1, smirk: 0, wobble: 0, sweat: 0.6, blush: 0 },
  pain:      { eyeOpen: 0.1, eyeSize: 1, pupil: 0.5, brow: 0.2, browTilt: -0.8, mouth: -0.5, mouthOpen: 0.4, mouthW: 1, smirk: 0, wobble: 0.5, sweat: 0.4, blush: 0 },
};
export function blendExpr(a, b, w) { const o = {}; for (const k in a) o[k] = lerp(a[k], b[k], w); return o; }
