export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const progress = (t: number, a: number, b: number) => clamp((t - a) / (b - a || 1));

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;
export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export type EaseName = 'linear' | 'inOut' | 'out' | 'in';
export const ease = (name: EaseName | undefined, t: number) => {
  switch (name) {
    case 'linear':
      return t;
    case 'out':
      return easeOut(t);
    case 'in':
      return easeIn(t);
    default:
      return easeInOut(t);
  }
};

/** Значение числового свойства по ключевым кадрам (t в секундах). Свойство берётся только из ключей, где оно задано. */
export function track<K extends {t: number; ease?: EaseName}>(
  keys: K[],
  t: number,
  prop: keyof K,
  fallback: number,
): number {
  const ks = keys.filter((k) => typeof k[prop] === 'number');
  if (ks.length === 0) return fallback;
  if (t <= ks[0].t) return ks[0][prop] as unknown as number;
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i];
    const b = ks[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = ease(b.ease, progress(t, a.t, b.t));
      return lerp(a[prop] as unknown as number, b[prop] as unknown as number, p);
    }
  }
  return ks[ks.length - 1][prop] as unknown as number;
}

/** Дискретное свойство: значение последнего ключа с t ≤ текущего времени. */
export function step<K extends {t: number}, V>(keys: K[], t: number, prop: keyof K, fallback: V): V {
  let out = fallback;
  for (const k of keys) {
    if (k.t <= t && k[prop] !== undefined) out = k[prop] as unknown as V;
  }
  return out;
}
