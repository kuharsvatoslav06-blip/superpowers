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
  /** Длинное пальто до колен (отец). */
  coat?: boolean;
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
 * Референс-листы лежат в public/characters/reference; сверять рисунок удобно через композицию cast-sheet.
 */
export const ROSTER: Record<CharId, Look> = {
  marc: {
    name: 'Марк',
    skin: '#d6ae92',
    skinShade: '#bf9279',
    hair: 'messy',
    hairColor: '#3b2b24',
    top: 'hoodie',
    topColor: '#2b2b33',
    topShade: '#1e1e25',
    accent: '#8d8a91',
    pants: '#15151b',
    shoes: '#0a0a0e',
  },
  marcOld: {
    name: 'Марк (старше)',
    skin: '#d6ae92',
    skinShade: '#bf9279',
    hair: 'messy',
    hairColor: '#46362e',
    top: 'hoodie',
    topColor: '#2b2b33',
    topShade: '#1e1e25',
    accent: '#8d8a91',
    pants: '#15151b',
    shoes: '#0a0a0e',
    stubble: true,
    wrinkles: true,
    size: 1.03,
  },
  marcKid: {
    name: 'Марк (ребёнок)',
    skin: '#d6ae92',
    skinShade: '#bf9279',
    hair: 'messy',
    hairColor: '#3b2b24',
    top: 'hoodie',
    topColor: '#3a4a64',
    topShade: '#2c3a50',
    accent: '#8d8a91',
    pants: '#22232a',
    shoes: '#0a0a0e',
    kid: true,
  },
  lina: {
    name: 'Лина',
    skin: '#dcb497',
    skinShade: '#c49a80',
    hair: 'ponytail',
    hairColor: '#2a1f1d',
    top: 'jacket',
    topColor: '#353b4a',
    topShade: '#262b37',
    accent: '#d98a4a',
    pants: '#17171d',
    shoes: '#0c0d10',
  },
  jake: {
    name: 'Джейк',
    skin: '#d4aa8c',
    skinShade: '#bb9179',
    hair: 'short',
    hairColor: '#33261f',
    top: 'jacket',
    topColor: '#323645',
    topShade: '#232633',
    accent: '#8bd39a',
    pants: '#18181e',
    shoes: '#0c0c10',
    goggles: true,
    backpack: 'big',
    backpackColor: '#3b3f35',
  },
  mia: {
    name: 'Мия',
    skin: '#e0b99c',
    skinShade: '#c99f84',
    hair: 'beanie',
    hairColor: '#b48a62',
    top: 'jacket',
    topColor: '#2b2b32',
    topShade: '#1e1e24',
    accent: '#c7a6ff',
    pants: '#17171d',
    shoes: '#0b0b0f',
    beanie: '#2a2a30',
    backpack: 'small',
    backpackColor: '#4a3f3a',
    size: 0.94,
  },
  father: {
    name: 'Отец',
    skin: '#d2a081',
    skinShade: '#b98568',
    hair: 'messy',
    hairColor: '#42332c',
    top: 'jacket',
    topColor: '#27272e',
    topShade: '#1b1b21',
    accent: '#8f98a8',
    pants: '#16161c',
    shoes: '#0a0a0d',
    glasses: true,
    stubble: true,
    wrinkles: true,
    size: 1.05,
    coat: true,
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
    pants: '#1d1d24',
    shoes: '#0d0d10',
    size: 0.96,
  },
};
