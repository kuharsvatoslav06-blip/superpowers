import type {EpisodeDef} from '../types';
import {A, LINA, MARC, N, TERRA} from './dsl';

/** СЕРИЯ 9 · «ВТОРОЙ УЧАСТНИК» */
export const ep09: EpisodeDef = {
  n: 9,
  id: 'ep09',
  title: 'ВТОРОЙ УЧАСТНИК',
  music: 'tension',
  nextTitle: 'ПОСЛЕДНИЙ ВЫБОР',
  scenes: [
    /* 1. КРЮЧОК: Лина входит. */
    {
      id: 's01',
      loc: {id: 'lab'},
      lead: 0.2,
      cam: {from: {x: 540, y: 1000, zoom: 1.2}, to: {x: 560, y: 980, zoom: 1.25}},
      fx: {vignette: 0.7, scan: true, flicker: true},
      actors: [
        A('marc', 'marc', [{t: 0, x: 280, y: 1360, scale: 1.3, pose: 'shock', expr: 'shocked', look: 0.9, backpack: true}]),
        A('lina', 'lina', [
          {t: 0, x: 1180, y: 1360, scale: 1.3, pose: 'walk', expr: 'determined', look: 0.8, flip: true},
          {t: 2.6, x: 820},
          {t: 2.9, pose: 'idle'},
        ]),
      ],
      lines: [MARC('Лина?.. Ты же *погибла*.', {at: 0.5, note: 'не веря глазам'}), LINA('Пока нет.', {gap: 0.5, note: 'сухо, чуть с усмешкой'})],
      sfx: [{t: 0, name: 'door', vol: 0.6}, {t: 0, name: 'footsteps', vol: 0.4}],
    },
    /* Эвакуация. */
    {
      id: 's01b',
      loc: {id: 'lab'},
      cam: {from: {x: 560, y: 960, zoom: 1.3}, to: {x: 560, y: 950, zoom: 1.45}},
      fx: {vignette: 0.7, scan: true},
      actors: [
        A('marc', 'marc', [{t: 0, x: 330, y: 1360, scale: 1.3, pose: 'idle', expr: 'sad', look: 0.9, backpack: true}]),
        A('lina', 'lina', [{t: 0, x: 780, y: 1360, scale: 1.3, pose: 'idle', expr: 'neutral', look: 0.7, flip: true}]),
      ],
      lines: [
        MARC('Я думал, ты не вышла из *эвакуации*.', {at: 0.4, note: 'с трудом'}),
        LINA('Это то, что тебе *хотели* показать.', {gap: 0.5, note: 'тихо'}),
      ],
      sfx: [{t: 0.2, name: 'hum', vol: 0.4}],
    },
    /* 2. Кто она. */
    {
      id: 's02',
      loc: {id: 'lab'},
      cam: {from: {x: 560, y: 960, zoom: 1.35}, to: {x: 560, y: 950, zoom: 1.5}},
      fx: {vignette: 0.7, scan: true},
      actors: [
        A('marc', 'marc', [{t: 0, x: 330, y: 1360, scale: 1.3, pose: 'idle', expr: 'worried', look: 0.9, backpack: true}]),
        A('lina', 'lina', [{t: 0, x: 780, y: 1360, scale: 1.3, pose: 'idle', expr: 'neutral', look: 0.7, flip: true}]),
      ],
      lines: [
        LINA('Я тоже участвовала в программе *ТЕРРА*.', {at: 0.3, note: 'ровно'}),
        LINA('Моя задача была — *наблюдать за тобой*.', {gap: 0.3}),
      ],
      sfx: [{t: 0.2, name: 'hum', vol: 0.4}],
    },
    /* 3. «Почему ты молчала?» */
    {
      id: 's03',
      loc: {id: 'lab'},
      cam: {from: {x: 540, y: 940, zoom: 1.5}, to: {x: 540, y: 940, zoom: 1.7}},
      fx: {vignette: 0.75, scan: true},
      actors: [
        A('marc', 'marc', [{t: 0, x: 330, y: 1360, scale: 1.3, pose: 'idle', expr: 'sad', look: 0.9, backpack: true}]),
        A('lina', 'lina', [{t: 0, x: 780, y: 1360, scale: 1.3, pose: 'idle', expr: 'tired', look: 0.7, flip: true}]),
      ],
      lines: [
        MARC('Почему ты ничего не рассказала раньше?', {at: 0.3, note: 'без упрёка, больно'}),
        LINA('Потому что в каждой предыдущей версии ты пытался меня *спасти*.', {gap: 0.5}),
        LINA('И каждый раз система *использовала* это против тебя.', {gap: 0.2}),
      ],
      sfx: [{t: 0.3, name: 'heartbeat', vol: 0.4}],
    },
    /* Нет времени. */
    {
      id: 's03b',
      loc: {id: 'lab'},
      cam: {from: {x: 540, y: 940, zoom: 1.45}, to: {x: 540, y: 940, zoom: 1.6}, shake: 3},
      fx: {vignette: 0.75, scan: true},
      actors: [
        A('marc', 'marc', [{t: 0, x: 330, y: 1360, scale: 1.3, pose: 'idle', expr: 'worried', look: 0.9, backpack: true}]),
        A('lina', 'lina', [{t: 0, x: 780, y: 1360, scale: 1.3, pose: 'point', expr: 'determined', look: 0.7, flip: true}]),
      ],
      lines: [LINA('Но сейчас это *неважно*.', {at: 0.4}), LINA('Посмотри на экран. ТЕРРА уже *решила*.', {gap: 0.4, note: 'жёстко'})],
      sfx: [{t: 0.2, name: 'alarm', vol: 0.3}],
    },
    /* 4. Марк у компьютера. */
    {
      id: 's04',
      loc: {id: 'lab'},
      tIn: 'dip',
      cam: {from: {x: 540, y: 1000, zoom: 1.15}, to: {x: 560, y: 980, zoom: 1.3}},
      fx: {vignette: 0.7, scan: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 230, y: 1360, scale: 1.3, pose: 'walk', expr: 'determined', look: 0.9, backpack: true},
          {t: 1.8, x: 440},
          {t: 2.1, pose: 'reach'},
        ]),
        A('lina', 'lina', [{t: 0, x: 760, y: 1360, scale: 1.3, pose: 'idle', expr: 'worried', look: 0.7, flip: true}]),
      ],
      lines: [N('Марк подходит к центральному компьютеру.', {at: 0.3})],
      sfx: [{t: 2.1, name: 'click', vol: 0.8}],
    },
    /* «Вдвоём». */
    {
      id: 's04b',
      loc: {id: 'lab'},
      cam: {from: {x: 540, y: 960, zoom: 1.4}, to: {x: 540, y: 950, zoom: 1.55}},
      fx: {vignette: 0.7, scan: true},
      actors: [
        A('marc', 'marc', [{t: 0, x: 400, y: 1360, scale: 1.3, pose: 'reach', expr: 'determined', look: 0.9, backpack: true}]),
        A('lina', 'lina', [{t: 0, x: 780, y: 1360, scale: 1.3, pose: 'idle', expr: 'worried', look: 0.7, flip: true}]),
      ],
      lines: [MARC('Тогда… *вдвоём*?', {at: 0.4}), LINA('Вдвоём. Как и должно было быть с самого *начала*.', {gap: 0.5, note: 'впервые мягче'})],
      sfx: [{t: 0.2, name: 'beep', vol: 0.5}],
    },
    /* 5. Терра: второй участник идентифицирован. */
    {
      id: 's05',
      loc: {id: 'lab', variant: 'hostile'},
      cam: {from: {x: 540, y: 960, zoom: 1.2}, to: {x: 540, y: 940, zoom: 1.3}},
      fx: {vignette: 0.8, scan: true, glitchAt: [0.2]},
      actors: [
        A('marc', 'marc', [{t: 0, x: 330, y: 1360, scale: 1.2, pose: 'reach', expr: 'worried', look: 0.9, backpack: true}]),
        A('lina', 'lina', [{t: 0, x: 780, y: 1360, scale: 1.2, pose: 'idle', expr: 'worried', look: 0.7, flip: true}]),
      ],
      inserts: [{type: 'terra', at: 0, dur: 6.6, mode: 'hostile', y: 480, scale: 0.55, dim: 0.35}],
      lines: [
        TERRA('Второй участник *идентифицирован*.', {at: 0.4}),
        TERRA('Начинаю восстановление исходного *сценария*.', {gap: 0.3}),
      ],
      sfx: [{t: 0.2, name: 'glitch', vol: 0.7}, {t: 0, name: 'hum', vol: 0.6}],
    },
    /* 6. Обратный отсчёт — поворот. */
    {
      id: 's06',
      loc: {id: 'lab', variant: 'hostile'},
      dur: 8.0,
      cam: {from: {x: 540, y: 980, zoom: 1.15}, to: {x: 540, y: 940, zoom: 1.5}, ease: 'in', shake: 5, shakeAt: [0, 1.0]},
      fx: {alarm: true, vignette: 0.8, scan: true, glitchAt: [0.1], flashAt: [6.0]},
      actors: [
        A('marc', 'marc', [{t: 0, x: 330, y: 1360, scale: 1.2, pose: 'shock', expr: 'shocked', look: 0.9, backpack: true}]),
        A('lina', 'lina', [{t: 0, x: 780, y: 1360, scale: 1.2, pose: 'shock', expr: 'shocked', look: 0.7, flip: true}]),
      ],
      inserts: [{type: 'countdown', at: 0.3, dur: 6.0, from: 600, to: 592, label: 'ПЕРЕЗАПУСК МИРА', y: 480, scale: 0.9, dim: 0.5}],
      lines: [LINA('Десять минут…', {at: 1.0, dur: 1.4, note: 'выдох'}), N('До перезапуска мира — *десять минут*.', {at: 2.6, dur: 2.6})],
      sfx: [{t: 0.2, name: 'alarm', vol: 0.7}, {t: 0.3, name: 'beep', vol: 0.8}, {t: 6.0, name: 'stinger', vol: 1}],
    },
  ],
};
