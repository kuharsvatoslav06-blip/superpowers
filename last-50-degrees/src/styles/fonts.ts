import {continueRender, delayRender} from 'remotion';
import inter600c from '@fontsource/inter/files/inter-cyrillic-600-normal.woff2';
import inter600l from '@fontsource/inter/files/inter-latin-600-normal.woff2';
import inter800c from '@fontsource/inter/files/inter-cyrillic-800-normal.woff2';
import inter800l from '@fontsource/inter/files/inter-latin-800-normal.woff2';
import mono700c from '@fontsource/jetbrains-mono/files/jetbrains-mono-cyrillic-700-normal.woff2';
import mono700l from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2';

const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const LAT =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

/** Шрифты лежат в node_modules (@fontsource) — рендер не зависит от системных шрифтов. */
export const SANS = '"Sans", "Inter", "Helvetica Neue", Arial, sans-serif';
export const MONO = '"Mono", "JetBrains Mono", "DejaVu Sans Mono", monospace';

const defs: [string, string, string, string][] = [
  ['Sans', inter600c, '600', CYR],
  ['Sans', inter600l, '600', LAT],
  ['Sans', inter800c, '800', CYR],
  ['Sans', inter800l, '800', LAT],
  ['Mono', mono700c, '700', CYR],
  ['Mono', mono700l, '700', LAT],
];

let started = false;
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('fonts');
  Promise.all(
    defs.map(async ([family, src, weight, range]) => {
      const face = new FontFace(family, `url(${src})`, {weight, unicodeRange: range});
      await face.load();
      (document.fonts as unknown as {add(f: FontFace): void}).add(face);
    }),
  )
    .catch((e) => console.warn('Не удалось загрузить шрифты, используется запасной:', e))
    .finally(() => continueRender(handle));
};
