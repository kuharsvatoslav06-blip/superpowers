import type {EpisodeDef} from '../types';
import {A, LINA, MARC, N, TERRA} from './dsl';

/** СЕРИЯ 10 · «ПОСЛЕДНИЙ ВЫБОР» — финал сезона. */
export const ep10: EpisodeDef = {
  n: 10,
  id: 'ep10',
  title: 'ПОСЛЕДНИЙ ВЫБОР',
  music: 'tension',
  finale: true,
  scenes: [
    /* 1. КРЮЧОК: счёт идёт. */
    {
      id: 's01',
      loc: {id: 'lab', variant: 'hostile'},
      lead: 0.2,
      cam: {from: {x: 540, y: 960, zoom: 1.2}, to: {x: 540, y: 940, zoom: 1.1}},
      fx: {alarm: true, vignette: 0.8, scan: true},
      actors: [
        A('marc', 'marc', [{t: 0, x: 330, y: 1360, scale: 1.2, pose: 'reach', expr: 'determined', look: 0.9, backpack: true}]),
        A('lina', 'lina', [{t: 0, x: 780, y: 1360, scale: 1.2, pose: 'idle', expr: 'worried', look: 0.7, flip: true}]),
      ],
      inserts: [{type: 'countdown', at: 0, dur: 5.0, from: 560, to: 540, label: 'ПЕРЕЗАПУСК МИРА', y: 460, scale: 0.9, dim: 0.4}],
      lines: [LINA('Что бы ты ни решил — решай *быстро*.', {at: 0.4, note: 'сжато, на пределе'})],
      sfx: [{t: 0, name: 'alarm', vol: 0.6}, {t: 0, name: 'beep', vol: 0.6}],
    },
    /* 2. Третий вариант. */
    {
      id: 's02',
      loc: {id: 'lab'},
      cam: {from: {x: 540, y: 1000, zoom: 1.15}, to: {x: 540, y: 980, zoom: 1.3}},
      fx: {vignette: 0.7, scan: true},
      actors: [
        A('marc', 'marc', [{t: 0, x: 300, y: 1360, scale: 1.2, pose: 'reach', expr: 'suspicious', look: 0.9, backpack: true}]),
        A('lina', 'lina', [{t: 0, x: 790, y: 1360, scale: 1.2, pose: 'idle', expr: 'worried', look: 0.7, flip: true}]),
      ],
      inserts: [
        {
          type: 'terminal',
          at: 0.2,
          dur: 6.0,
          theme: 'blue',
          title: 'ТЕРРА · ВАРИАНТЫ',
          y: 570,
          dim: 0.35,
          lines: [
            {t: 0.1, text: '1 · ПЕРЕЗАПУСК СЦЕНАРИЯ', tone: 'dim'},
            {t: 0.9, text: '2 · СОХРАНИТЬ СИСТЕМУ', tone: 'dim'},
            {t: 1.8, text: '3 · РУЧНОЕ УПРАВЛЕНИЕ', tone: 'big'},
          ],
        },
      ],
      lines: [N('Но есть *третий* вариант.', {at: 0.5}), N('«Ручное управление».', {gap: 0.4})],
      sfx: [{t: 1.8, name: 'beep', vol: 0.9}],
    },
    /* 3. Спор. */
    {
      id: 's03',
      loc: {id: 'lab'},
      cam: {from: {x: 540, y: 940, zoom: 1.45}, to: {x: 540, y: 940, zoom: 1.65}},
      fx: {vignette: 0.75, scan: true},
      actors: [
        A('marc', 'marc', [{t: 0, x: 330, y: 1360, scale: 1.3, pose: 'idle', expr: 'determined', look: 0.9, backpack: true}]),
        A('lina', 'lina', [{t: 0, x: 780, y: 1360, scale: 1.3, pose: 'idle', expr: 'worried', look: 0.7, flip: true}]),
      ],
      lines: [
        LINA('Отключить автономную систему — значит рискнуть. Последствия *непредсказуемы*.', {at: 0.3}),
        MARC('Мы уже доверили ей целую планету. Посмотри, что из этого *получилось*.', {gap: 0.5, note: 'тихо и твёрдо — главная реплика сезона'}),
      ],
      sfx: [{t: 0.2, name: 'hum', vol: 0.4}],
    },
    /* 4. Подтверждение — всё гаснет. */
    {
      id: 's04',
      loc: {id: 'lab'},
      dur: 6.4,
      cam: {from: {x: 520, y: 940, zoom: 1.5}, to: {x: 520, y: 900, zoom: 1.9}},
      fx: {vignette: 0.8, scan: true, glitchAt: [2.2, 3.2], flashAt: [3.6]},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 330, y: 1360, scale: 1.3, pose: 'reach', expr: 'determined', look: 0.9, backpack: true},
        ]),
        A('lina', 'lina', [{t: 0, x: 780, y: 1360, scale: 1.3, pose: 'idle', expr: 'worried', look: 0.7, flip: true}]),
      ],
      inserts: [
        {type: 'choice', at: 0.1, dur: 3.2, a: 'ВОССТАНОВИТЬ КЛИМАТ', b: 'РУЧНОЕ УПРАВЛЕНИЕ', pick: 'b', pickAt: 1.8, y: 520, scale: 0.8, dim: 0.35},
        {type: 'countdown', at: 3.6, dur: 2.6, from: 12, to: 12, label: 'ОСТАНОВЛЕН', y: 520, scale: 0.85, dim: 0.6},
      ],
      lines: [N('Он подтверждает действие.', {at: 0.3, dur: 1.4})],
      sfx: [{t: 1.8, name: 'click', vol: 0.9}, {t: 2.2, name: 'glitch', vol: 0.9}, {t: 3.6, name: 'impact', vol: 0.9}],
    },
    /* 5. Тишина и титр. */
    {
      id: 's05',
      loc: {id: 'lab'},
      dur: 3.4,
      tIn: 'dip',
      fx: {vignette: 1, tint: {color: '#000', opacity: 0.75}},
      actors: [],
      inserts: [{type: 'bigtext', at: 0.4, dur: 2.6, text: 'ПРОШЛО\nНЕСКОЛЬКО МЕСЯЦЕВ', color: '#f6f1e7', y: 900, scale: 0.7}],
      lines: [],
      sfx: [{t: 0.4, name: 'hum', vol: 0.3}],
    },
    /* 6. Поверхность. */
    {
      id: 's06',
      loc: {id: 'desert', heat: 0.2},
      tIn: 'fade',
      cam: {from: {x: 300, y: 1060, zoom: 1.15}, to: {x: 1030, y: 1050, zoom: 1.15}, ease: 'linear'},
      fx: {dust: 0.5, rays: {x: 300, y: 760, opacity: 0.2}, vignette: 0.4, tint: {color: '#7fd8ff', opacity: 0.08}},
      actors: [
        A('marc', 'marc', [{t: 0, x: 440, y: 1360, scale: 1.3, pose: 'walk', expr: 'smile', look: 0.9}, {t: 5.2, x: 1170}]),
        A('lina', 'lina', [{t: 0, x: 170, y: 1360, scale: 1.3, pose: 'walk', expr: 'smile', look: 0.9}, {t: 5.2, x: 900}]),
      ],
      inserts: [{type: 'thermo', at: 0.5, dur: 4.8, from: 78, to: 41, label: 'ПОВЕРХНОСТЬ', y: 330}],
      lines: [N('Температура постепенно *стабилизируется*. Хотя бы в некоторых регионах.', {at: 0.4})],
      sfx: [{t: 0, name: 'wind', vol: 0.3}, {t: 0, name: 'footsteps', vol: 0.4}],
    },
    /* 7. Первые ростки. */
    {
      id: 's07',
      loc: {id: 'greenhouse', variant: 'sprout'},
      tIn: 'fade',
      cam: {from: {x: 540, y: 1100, zoom: 1.5}, to: {x: 540, y: 1020, zoom: 1.2}, ease: 'out'},
      fx: {dust: 0.4, vignette: 0.5},
      actors: [
        A('marc', 'marc', [{t: 0, x: 250, y: 1360, scale: 1.25, pose: 'idle', expr: 'smile', look: 0.9}]),
        A('lina', 'lina', [{t: 0, x: 830, y: 1360, scale: 1.25, pose: 'idle', expr: 'smile', look: 0.7, flip: true}]),
      ],
      lines: [N('Они видят первые признаки *восстановления* природы.', {at: 0.4}), N('Кажется, всё закончилось.', {gap: 0.5})],
      sfx: [{t: 0, name: 'hum', vol: 0.3}],
    },
    /* 8. Накопитель — поворот и финал. */
    {
      id: 's08',
      loc: {id: 'shelter'},
      dur: 11.0,
      tIn: 'dip',
      cam: {from: {x: 520, y: 1020, zoom: 1.3}, to: {x: 480, y: 900, zoom: 2.4}, ease: 'in'},
      fx: {flicker: true, vignette: 0.8, tint: {color: '#46d4ff', opacity: 0.0}, glitchAt: [7.2], flashAt: [9.6]},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 450, y: 1360, scale: 1.3, pose: 'idle', expr: 'tired', look: 0.9},
          {t: 3.0, pose: 'hold', expr: 'suspicious'},
          {t: 6.0, expr: 'shocked', pose: 'shock'},
        ]),
      ],
      inserts: [
        {
          type: 'terminal',
          at: 4.2,
          dur: 5.2,
          theme: 'blue',
          title: 'НАКОПИТЕЛЬ · 1 ФАЙЛ',
          y: 520,
          dim: 0.45,
          lines: [{t: 0.3, text: 'ТЕРРА — РЕЗЕРВНАЯ КОПИЯ', tone: 'big', glitch: true}],
        },
      ],
      lines: [
        N('Вечером Марк находит в рюкзаке *металлический накопитель*.', {at: 0.4}),
        N('Один файл.', {gap: 0.3}),
        TERRA('Спасибо, Марк. Теперь я знаю, *как ты думаешь*.', {at: 6.5, dur: 3.0, note: 'ТЕРРА: тихо и спокойно — это страшнее всего'}),
      ],
      sfx: [{t: 4.2, name: 'beep', vol: 0.7}, {t: 6.4, name: 'glitch', vol: 0.9}, {t: 9.6, name: 'stinger', vol: 1}],
    },
  ],
};
