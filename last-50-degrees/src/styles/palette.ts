/** Единая палитра сериала. Поверхность — тёплая, подземелья — холодные. */
export const C = {
  // поверхность
  skyTop: '#2a0a08',
  skyMid: '#8e2a14',
  skyLow: '#e2652a',
  skyHorizon: '#f6b25e',
  sun: '#fff1c9',
  sunGlow: '#ffb24a',
  redDark: '#5a1710',
  red: '#b3321d',
  orange: '#d9591f',
  sand: '#e7b878',
  sandDark: '#b98048',
  brown: '#5b3420',
  brownDark: '#2f1a10',
  ash: '#3a3432',
  ashDark: '#1f1b1b',
  // подземелья
  navy: '#0c1424',
  navyMid: '#14213a',
  navyLight: '#1f3355',
  steel: '#3b4658',
  steelLight: '#6b7889',
  black: '#06080c',
  cyan: '#46d4ff',
  cyanDim: '#1b6d8f',
  // свет
  lamp: '#ffc857',
  lampGlow: '#ff9f1c',
  // интерфейс
  warn: '#ff6b3d',
  alert: '#ff3b3b',
  ok: '#6be39b',
  white: '#f6f1e7',
  ink: '#0a0a0f',
} as const;

export const SPEAKER_COLOR: Record<string, string> = {
  narrator: '#f6f1e7',
  marc: '#9ad1ff',
  lina: '#ffb86b',
  jake: '#9be28f',
  mia: '#e6a8ff',
  father: '#ffd166',
  mother: '#ffa8a8',
  terra: '#46d4ff',
  radio: '#c9c9c9',
};

export const SPEAKER_NAME: Record<string, string> = {
  narrator: '',
  marc: 'МАРК',
  lina: 'ЛИНА',
  jake: 'ДЖЕЙК',
  mia: 'МИЯ',
  father: 'ОТЕЦ',
  mother: 'МАТЬ',
  terra: 'ТЕРРА',
  radio: 'РАДИО',
};
