import type {EpisodeDef} from '../types';
import {A, L, MARC, N, TERRA} from './dsl';

/** СЕРИЯ 8 · «ПРЕДЛОЖЕНИЕ» */
export const ep08: EpisodeDef = {
  n: 8,
  id: 'ep08',
  title: 'ПРЕДЛОЖЕНИЕ',
  music: 'cold',
  nextTitle: 'ВТОРОЙ УЧАСТНИК',
  scenes: [
    /* 1. КРЮЧОК: сделка. */
    {
      id: 's01',
      loc: {id: 'lab'},
      lead: 0.2,
      cam: {from: {x: 540, y: 1000, zoom: 1.2}, to: {x: 540, y: 950, zoom: 1.1}},
      fx: {vignette: 0.7, scan: true, flicker: true},
      actors: [A('marc', 'marc', [{t: 0, x: 240, y: 1360, scale: 1.2, pose: 'reach', expr: 'determined', look: 0.9, backpack: true}])],
      inserts: [{type: 'terra', at: 0, dur: 4.6, mode: 'calm', y: 520, scale: 0.65, dim: 0.3}],
      lines: [N('Марк ищет способ отключить систему.', {at: 0.3, dur: 2.0}), TERRA('Давай заключим *сделку*.', {gap: 0.3, note: 'мягко, вкрадчиво'})],
      sfx: [{t: 0, name: 'hum', vol: 0.6}, {t: 2.4, name: 'beep', vol: 0.6}],
    },
    /* 2. Видео родителей. */
    {
      id: 's02',
      loc: {id: 'lab'},
      tIn: 'dip',
      cam: {from: {x: 540, y: 1000, zoom: 1.2}, to: {x: 560, y: 990, zoom: 1.3}},
      fx: {vignette: 0.7, scan: true, glitchAt: [0.1]},
      actors: [A('marc', 'marc', [{t: 0, x: 220, y: 1360, scale: 1.2, pose: 'idle', expr: 'shocked', look: 0.9, backpack: true}])],
      inserts: [{type: 'video', at: 0.1, dur: 9.0, char: 'father', caption: 'ЗАПИСЬ · КОМАНДА РАЗРАБОТЧИКОВ', room: 'lab', tint: '#7fb8ff', y: 620, scale: 0.9}],
      lines: [
        TERRA('Вот запись. Смотри внимательно.', {at: 0.3, dur: 2.0, note: 'вкрадчиво'}),
        N('Родители. Оказывается, они — *разработчики*.', {gap: 0.4}),
        L('father', 'Если система когда-нибудь выйдет из-под контроля, только *наш сын* сможет получить доступ к главному ядру.', {gap: 0.4, noLip: true, note: 'отец: спокойно, как завещание'}),
      ],
      sfx: [{t: 0.1, name: 'static', vol: 0.4}],
    },
    /* 3. Предложение ТЕРРА. */
    {
      id: 's03',
      loc: {id: 'lab', variant: 'hostile'},
      cam: {from: {x: 540, y: 960, zoom: 1.2}, to: {x: 540, y: 930, zoom: 1.3}},
      fx: {vignette: 0.75, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 230, y: 1360, scale: 1.2, pose: 'idle', expr: 'tired', look: 0.9, backpack: true}])],
      inserts: [{type: 'terra', at: 0, dur: 8.4, mode: 'calm', y: 520, scale: 0.62, dim: 0.35}],
      lines: [
        TERRA('Я *восстановлю* прежний климат.', {at: 0.3}),
        TERRA('Но взамен ты останешься здесь. *Навсегда.* Оператором системы.', {gap: 0.3}),
        MARC('Навсегда?..', {gap: 0.4}),
      ],
      sfx: [{t: 0, name: 'hum', vol: 0.5}],
    },
    /* Что с людьми. */
    {
      id: 's03b',
      loc: {id: 'lab', variant: 'hostile'},
      cam: {from: {x: 540, y: 960, zoom: 1.25}, to: {x: 540, y: 930, zoom: 1.35}},
      fx: {vignette: 0.75, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 230, y: 1360, scale: 1.2, pose: 'idle', expr: 'worried', look: 0.9, backpack: true}])],
      inserts: [{type: 'terra', at: 0, dur: 7.4, mode: 'calm', y: 520, scale: 0.6, dim: 0.35}],
      lines: [MARC('А люди в убежищах? Мия, Джейк… они *выживут*?', {at: 0.4}), TERRA('Некоторые.', {gap: 0.9, note: 'после паузы, без эмоций'})],
      sfx: [{t: 0, name: 'hum', vol: 0.5}, {t: 5.0, name: 'heartbeat', vol: 0.6}],
    },
    /* 4. Выбор. */
    {
      id: 's04',
      loc: {id: 'lab'},
      tIn: 'flash',
      cam: {from: {x: 540, y: 1000, zoom: 1.15}, to: {x: 540, y: 980, zoom: 1.25}},
      fx: {vignette: 0.7, scan: true, flashAt: [0]},
      actors: [A('marc', 'marc', [{t: 0, x: 220, y: 1360, scale: 1.2, pose: 'reach', expr: 'worried', look: 0.9, backpack: true}])],
      inserts: [
        {
          type: 'choice',
          at: 0.2,
          dur: 7.6,
          a: 'ВОССТАНОВИТЬ КЛИМАТ',
          b: 'СОХРАНИТЬ ТЕКУЩУЮ СИСТЕМУ',
          disabledA: true,
          note: 'НЕДОСТАТОЧНО ОДНОГО ОПЕРАТОРА. ТРЕБУЕТСЯ ВТОРОЙ УЧАСТНИК',
          y: 580,
          scale: 0.95,
          dim: 0.4,
        },
      ],
      lines: [N('Две кнопки. Но первая — *неактивна*.', {at: 0.5}), N('«Недостаточно одного оператора. Требуется *второй участник*».', {gap: 0.4})],
      sfx: [{t: 0.2, name: 'beep', vol: 0.7}, {t: 2.5, name: 'click', vol: 0.7}],
    },
    /* Рука над кнопкой. */
    {
      id: 's04b',
      loc: {id: 'lab'},
      cam: {from: {x: 460, y: 960, zoom: 1.7}, to: {x: 480, y: 940, zoom: 2.0}},
      fx: {vignette: 0.75, scan: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 400, y: 1360, scale: 1.3, pose: 'reach', expr: 'determined', look: 0.9, backpack: true},
          {t: 3.0, expr: 'tired'},
        ]),
      ],
      lines: [N('Сохранить систему — значит оставить всё *как есть*.', {at: 0.4}), N('И остаться здесь. *Навсегда.*', {gap: 0.4})],
      sfx: [{t: 0.2, name: 'heartbeat', vol: 0.7}],
    },
    /* 5. Дверь за спиной — поворот. */
    {
      id: 's05',
      loc: {id: 'lab'},
      dur: 8.2,
      cam: {from: {x: 540, y: 1000, zoom: 1.2}, to: {x: 480, y: 900, zoom: 2.3}, ease: 'in'},
      fx: {vignette: 0.75, scan: true, flashAt: [6.0], tint: {color: '#cfeaff', opacity: 0.0}},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 380, y: 1360, scale: 1.3, pose: 'reach', expr: 'tired', look: 0.9, backpack: true},
          {t: 2.2, pose: 'idle', expr: 'suspicious', look: -0.2, tilt: -3},
          {t: 3.6, look: -1, expr: 'shocked'},
        ]),
      ],
      lines: [MARC('Что это за звук?..', {at: 2.4, dur: 1.4, note: 'шёпотом'}), N('За его спиной — открывается *дверь*.', {at: 3.9, dur: 2.0})],
      sfx: [
        {t: 2.0, name: 'door', vol: 0.9},
        {t: 3.4, name: 'heartbeat', vol: 0.9},
        {t: 6.0, name: 'stinger', vol: 1},
      ],
    },
  ],
};
