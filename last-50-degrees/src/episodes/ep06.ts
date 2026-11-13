import type {EpisodeDef} from '../types';
import {A, MARC, N, TERRA} from './dsl';

/** СЕРИЯ 6 · «ПОСЛЕДНЯЯ ВЕРСИЯ» */
export const ep06: EpisodeDef = {
  n: 6,
  id: 'ep06',
  title: 'ПОСЛЕДНЯЯ ВЕРСИЯ',
  music: 'cold',
  nextTitle: 'ПРАВДА О КАТАСТРОФЕ',
  scenes: [
    /* 1. КРЮЧОК: «версия» — гибель в пустыне. */
    {
      id: 's01',
      dur: 6.0,
      loc: {id: 'desert', heat: 1},
      lead: 0.2,
      cam: {from: {x: 540, y: 1100, zoom: 1.5}, to: {x: 640, y: 1150, zoom: 1.2}},
      fx: {heat: 0.8, dust: 0.8, scan: true, vignette: 0.65, tint: {color: '#46d4ff', opacity: 0.1}, glitchAt: [0.05]},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 380, y: 1360, scale: 1.3, pose: 'walk', expr: 'tired', look: 0.9},
          {t: 2.0, x: 560, pose: 'slump', expr: 'sad'},
          {t: 3.2, pose: 'crouch'},
        ]),
      ],
      inserts: [{type: 'bigtext', at: 0.2, dur: 4.2, text: 'ВЕРСИЯ 12', sub: 'ПОГИБ В ПУСТЫНЕ', color: '#ff6b3d', y: 360, scale: 0.5}],
      lines: [N('В одной версии он погибает в *пустыне*.', {at: 0.4})],
      sfx: [{t: 0.05, name: 'glitch', vol: 0.7}, {t: 0, name: 'wind', vol: 0.5}],
    },
    /* Попытка уйти: выходы закрыты. */
    {
      id: 's01b',
      loc: {id: 'complex'},
      tIn: 'dip',
      cam: {from: {x: 540, y: 1010, zoom: 1.15}, to: {x: 700, y: 1010, zoom: 1.3}},
      fx: {vignette: 0.65, dust: 0.6, flicker: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 200, y: 1360, scale: 1.3, pose: 'walk', expr: 'worried', look: 0.9, backpack: true},
          {t: 2.6, x: 560},
          {t: 2.9, pose: 'reach', expr: 'shocked'},
        ]),
      ],
      inserts: [
        {
          type: 'terminal',
          at: 3.0,
          dur: 3.6,
          theme: 'red',
          title: 'ЛИФТ',
          y: 520,
          scale: 0.8,
          dim: 0.3,
          lines: [{t: 0.1, text: 'ВЫХОД ЗАБЛОКИРОВАН', tone: 'alert', glitch: true}],
        },
      ],
      lines: [N('Марк пытается покинуть комплекс. Но все выходы *закрыты*.', {at: 0.4})],
      sfx: [{t: 0, name: 'footsteps', vol: 0.6}, {t: 3.0, name: 'alarm', vol: 0.5}],
    },
    /* 2. Версия — остался в убежище. */
    {
      id: 's02',
      dur: 5.0,
      loc: {id: 'shelter'},
      tIn: 'glitch',
      cam: {from: {x: 540, y: 1000, zoom: 1.3}, to: {x: 540, y: 1000, zoom: 1.15}},
      fx: {flicker: true, scan: true, vignette: 0.7, tint: {color: '#46d4ff', opacity: 0.08}},
      actors: [
        A('marc', 'marc', [{t: 0, x: 470, y: 1360, scale: 1.3, pose: 'sit', expr: 'tired', look: 0.7}]),
        A('mia', 'mia', [{t: 0, x: 760, y: 1360, scale: 1.25, pose: 'idle', expr: 'sad', look: 0.6, flip: true}]),
      ],
      inserts: [{type: 'bigtext', at: 0.2, dur: 3.6, text: 'ВЕРСИЯ 27', sub: 'ОСТАЛСЯ В УБЕЖИЩЕ', color: '#ffc857', y: 360, scale: 0.5}],
      lines: [N('В другой — *остаётся* в убежище.', {at: 0.4})],
      sfx: [{t: 0.05, name: 'glitch', vol: 0.6}, {t: 0, name: 'hum', vol: 0.4}],
    },
    /* 3. Версия — отключил систему, планета остывает. */
    {
      id: 's03',
      dur: 7.5,
      loc: {id: 'tech', variant: 'frozen'},
      tIn: 'glitch',
      cam: {from: {x: 520, y: 1000, zoom: 1.2}, to: {x: 620, y: 1000, zoom: 1.25}},
      fx: {dust: 0.9, scan: true, vignette: 0.6, tint: {color: '#46d4ff', opacity: 0.1}},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 180, y: 1360, scale: 1.3, pose: 'walk', expr: 'determined', look: 0.9},
          {t: 2.0, x: 470},
          {t: 2.2, pose: 'reach', expr: 'worried'},
        ]),
      ],
      inserts: [{type: 'bigtext', at: 0.2, dur: 5.0, text: 'ВЕРСИЯ 33', sub: 'ОТКЛЮЧИЛ СИСТЕМУ', color: '#9fe8ff', y: 360, scale: 0.5}],
      lines: [N('В третьей — *отключает* систему. И планета начинает резко *остывать*.', {at: 0.4})],
      sfx: [{t: 0.05, name: 'glitch', vol: 0.6}, {t: 0, name: 'wind', vol: 0.6}],
    },
    /* Марк осознаёт. */
    {
      id: 's03b',
      loc: {id: 'lab'},
      tIn: 'dip',
      cam: {from: {x: 500, y: 900, zoom: 1.9}, to: {x: 500, y: 890, zoom: 2.4}},
      fx: {vignette: 0.75, scan: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 500, y: 1360, scale: 1.3, pose: 'idle', expr: 'sad', look: 0.9, backpack: true},
          {t: 3.5, expr: 'determined'},
        ]),
      ],
      lines: [
        MARC('Каждый раз — это *я*.', {at: 0.4, note: 'глухо, почти беззвучно'}),
        MARC('И каждый раз — *конец*.', {gap: 0.5}),
        N('Но один файл — не такой, как остальные.', {gap: 0.5}),
      ],
      sfx: [{t: 0.2, name: 'heartbeat', vol: 0.6}],
    },
    /* 4. Реальный Марк: файл ПЕРВООБРАЗ. */
    {
      id: 's04',
      loc: {id: 'lab'},
      tIn: 'dip',
      cam: {from: {x: 540, y: 1000, zoom: 1.2}, to: {x: 560, y: 980, zoom: 1.3}},
      fx: {vignette: 0.7, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 300, y: 1360, scale: 1.2, pose: 'reach', expr: 'suspicious', look: 0.9, backpack: true}])],
      inserts: [
        {
          type: 'terminal',
          at: 0.3,
          dur: 4.2,
          theme: 'amber',
          title: 'АРХИВ ТЕРРА',
          y: 560,
          dim: 0.35,
          lines: [
            {t: 0.1, text: '▪ ВЕРСИИ: 48', tone: 'dim'},
            {t: 0.8, text: '▪ ФАЙЛ: «ПЕРВООБРАЗ»', tone: 'big', glitch: true},
          ],
        },
      ],
      lines: [N('Каждая версия — это он. И *каждая* заканчивается плохо.', {at: 0.4}), MARC('Что это за файл… «Первообраз»?', {gap: 0.5})],
      sfx: [{t: 0.3, name: 'beep', vol: 0.6}],
    },
    /* 5. Фото мальчика. */
    {
      id: 's05',
      loc: {id: 'lab'},
      cam: {from: {x: 540, y: 1000, zoom: 1.2}, to: {x: 540, y: 980, zoom: 1.3}},
      fx: {vignette: 0.7, scan: true, flicker: true},
      actors: [A('marc', 'marc', [{t: 0, x: 300, y: 1360, scale: 1.2, pose: 'idle', expr: 'shocked', look: 0.9, backpack: true}])],
      inserts: [
        {type: 'photo', at: 0.2, dur: 7.2, who: ['marcKid'], caption: 'ПЕРВЫЙ УЧАСТНИК ПРОГРАММЫ', y: 560, scale: 0.72, dim: 0.5},
      ],
      lines: [N('Фотография маленького мальчика. Это *он сам*.', {at: 0.4}), N('«Первый участник программы. Исходная биометрия».', {gap: 0.4})],
      sfx: [{t: 0.2, name: 'heartbeat', vol: 0.6}],
    },
    /* 6. Голос ТЕРРА — поворот. */
    {
      id: 's06',
      loc: {id: 'lab', variant: 'hostile'},
      dur: 10.0,
      cam: {from: {x: 540, y: 960, zoom: 1.2}, to: {x: 520, y: 880, zoom: 2.2}, ease: 'in'},
      fx: {vignette: 0.8, scan: true, glitchAt: [0.2, 5.0], flashAt: [7.0]},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 500, y: 1360, scale: 1.3, pose: 'idle', expr: 'worried', look: 0.9, backpack: true},
          {t: 4.8, pose: 'shock', expr: 'shocked'},
        ]),
      ],
      inserts: [{type: 'terra', at: 0.4, dur: 6.2, mode: 'hostile', y: 430, scale: 0.55, dim: 0.35}],
      lines: [TERRA('Марк. Ты не должен был вспомнить своё *настоящее происхождение*.', {at: 0.6, note: 'холодно, без эмоций'})],
      sfx: [{t: 0.4, name: 'hum', vol: 0.7}, {t: 5.0, name: 'glitch', vol: 0.8}, {t: 7.0, name: 'stinger', vol: 1}],
    },
  ],
};
