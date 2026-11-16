import { Easing, interpolate } from 'remotion';

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = Easing.inOut(Easing.cubic);

/** Пружинка: 0 → 1.15 → 0.96 → 1 за ~0.4 с */
export const popScale = (time: number, start: number) => {
  const d = time - start;
  if (d <= 0) return 0;
  return interpolate(d, [0, 0.16, 0.26, 0.36], [0, 1.15, 0.96, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
};

/** Детерминированный шум */
export const noise = (x: number, seed = 0) => {
  const h = (n: number) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
};

export const ACCENTS: Record<string, string> = {
  red: '#FF3B47',
  green: '#3DE07A',
  blue: '#45B6FF',
  pink: '#FF5FA8',
  yellow: '#FFD23A',
};

export const INK = '#1E1E2A';
