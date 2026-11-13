import type {CharId} from '../types';

export type HairStyle = 'messy' | 'ponytail' | 'short' | 'beanie' | 'long';
export type TopStyle = 'hoodie' | 'jacket' | 'cardigan';

export interface Look {
  name: string;
  skin: string;
  skinShade: string;
  hair: HairStyle;
  hairColor: string;
  top: TopStyle;
  topColor: string;
  topShade: string;
  accent: string;
  pants: string;
  shoes: string;
  beanie?: string;
  glasses?: boolean;
  goggles?: boolean;
  backpack?: 'big' | 'small';
  backpackColor?: string;
  stubble?: boolean;
  wrinkles?: boolean;
  kid?: boolean;
  /** Общий масштаб фигуры. */
  size?: number;
}

/**
 * Реестр внешности. Менять цвета/причёски нужно только здесь — все серии подхватят изменения.
 * Если у вас есть референс-изображения (public/characters/*.png) — сверяйте с ними эти значения.
 */
export const ROSTER: Record<CharId, Look> = {
  marc: {
    name: 'Марк',
    skin: '#d9a584',
    skinShade: '#c08a6c',
    hair: 'messy',
    hairColor: '#17110e',
    top: 'hoodie',
    topColor: '#2a2e38',
    topShade: '#1d2028',
    accent: '#9aa3b2',
    pants: '#1c1f27',
    shoes: '#090a0d',
  },
  marcOld: {
    name: 'Марк (старше)',
    skin: '#d2a081',
    skinShade: '#b98568',
    hair: 'messy',
    hairColor: '#2a2320',
    top: 'hoodie',
    topColor: '#2a2e38',
    topShade: '#1d2028',
    accent: '#9aa3b2',
    pants: '#1c1f27',
    shoes: '#090a0d',
    stubble: true,
    wrinkles: true,
    size: 1.03,
  },
  marcKid: {
    name: 'Марк (ребёнок)',
    skin: '#e0ad8d',
    skinShade: '#c8947a',
    hair: 'messy',
    hairColor: '#17110e',
    top: 'hoodie',
    topColor: '#3a4a64',
    topShade: '#2c3a50',
    accent: '#c9d2e0',
    pants: '#25272e',
    shoes: '#0b0c0f',
    kid: true,
  },
  lina: {
    name: 'Лина',
    skin: '#e0b08f',
    skinShade: '#c8957a',
    hair: 'ponytail',
    hairColor: '#1b1412',
    top: 'jacket',
    topColor: '#262a33',
    topShade: '#1a1d24',
    accent: '#d97b3a',
    pants: '#20232b',
    shoes: '#0c0d10',
  },
  jake: {
    name: 'Джейк',
    skin: '#d7a07e',
    skinShade: '#bd8667',
    hair: 'short',
    hairColor: '#1c1511',
    top: 'jacket',
    topColor: '#2c3140',
    topShade: '#1f2330',
    accent: '#7bd389',
    pants: '#23252d',
    shoes: '#0c0c10',
    goggles: true,
    backpack: 'big',
    backpackColor: '#3b3f35',
  },
  mia: {
    name: 'Мия',
    skin: '#e3b799',
    skinShade: '#cc9d80',
    hair: 'beanie',
    hairColor: '#b88a62',
    top: 'jacket',
    topColor: '#2b2d36',
    topShade: '#1d1f27',
    accent: '#c7a6ff',
    pants: '#1f2229',
    shoes: '#0b0b0f',
    beanie: '#2d3039',
    backpack: 'small',
    backpackColor: '#4a3f3a',
    size: 0.94,
  },
  father: {
    name: 'Отец',
    skin: '#d2a081',
    skinShade: '#b98568',
    hair: 'messy',
    hairColor: '#3a322d',
    top: 'jacket',
    topColor: '#272b33',
    topShade: '#1b1e25',
    accent: '#8f98a8',
    pants: '#1d2027',
    shoes: '#0a0a0d',
    glasses: true,
    stubble: true,
    wrinkles: true,
    size: 1.05,
  },
  mother: {
    name: 'Мать',
    skin: '#e0b090',
    skinShade: '#c8957a',
    hair: 'long',
    hairColor: '#4a3226',
    top: 'cardigan',
    topColor: '#4a5568',
    topShade: '#394253',
    accent: '#d8c9b0',
    pants: '#262932',
    shoes: '#0d0d10',
    size: 0.96,
  },
};
