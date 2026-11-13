import type {EpisodeDef} from '../types';
import {A, MARC, N, TERRA} from './dsl';

/** СЕРИЯ 4 · «ПОД ЗЕМЛЁЙ» */
export const ep04: EpisodeDef = {
  n: 4,
  id: 'ep04',
  title: 'ПОД ЗЕМЛЁЙ',
  music: 'cold',
  nextTitle: 'ЧЕЛОВЕК, КОТОРОГО НЕ СУЩЕСТВУЕТ',
  scenes: [
    /* 1. КРЮЧОК: лифт сам поехал вниз. */
    {
      id: 's01',
      loc: {id: 'complex', variant: 'lift'},
      lead: 0.2,
      cam: {from: {x: 540, y: 960, zoom: 1.1}, to: {x: 540, y: 960, zoom: 1.25}, shake: 4},
      fx: {vignette: 0.7, flicker: true},
      actors: [
        A('marc', 'marc', [{t: 0, x: 540, y: 1360, scale: 1.3, pose: 'idle', expr: 'worried', look: 0.5, backpack: true, tilt: 0}]),
      ],
      lines: [N('Лифт включился *сам*.', {at: 0.3}), N('И едет — *вниз*.', {gap: 0.3})],
      sfx: [{t: 0, name: 'lift', vol: 0.8}],
    },
    /* Глубина. */
    {
      id: 's01b',
      loc: {id: 'complex', variant: 'lift'},
      cam: {from: {x: 540, y: 1000, zoom: 1.15}, to: {x: 540, y: 960, zoom: 1.3}},
      fx: {vignette: 0.7, flicker: true},
      actors: [A('marc', 'marc', [{t: 0, x: 540, y: 1360, scale: 1.3, pose: 'idle', expr: 'suspicious', look: 0.5, backpack: true}])],
      inserts: [
        {
          type: 'terminal',
          at: 0.3,
          dur: 4.6,
          theme: 'blue',
          title: 'ЛИФТ · ГЛУБИНА',
          y: 520,
          scale: 0.85,
          lines: [
            {t: 0.1, text: 'ГЛУБИНА: 120 М', tone: 'dim'},
            {t: 1.0, text: 'ГЛУБИНА: 340 М', tone: 'normal'},
            {t: 2.0, text: 'ГЛУБИНА: 780 М', tone: 'warn'},
          ],
        },
      ],
      lines: [MARC('Я ничего не нажимал…', {at: 0.4, note: 'вполголоса'}), MARC('Слишком глубоко… для метеостанции.', {gap: 0.6})],
      sfx: [{t: 0, name: 'lift', vol: 0.8}],
    },
    /* 2. Открываются двери — масштаб комплекса. */
    {
      id: 's02',
      loc: {id: 'complex'},
      tIn: 'flash',
      cam: {from: {x: 540, y: 1100, zoom: 1.7}, to: {x: 540, y: 900, zoom: 1.0}, ease: 'out'},
      fx: {vignette: 0.6, dust: 0.7, flashAt: [0]},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 320, y: 1360, scale: 1.3, pose: 'idle', expr: 'shocked', look: 0.9, backpack: true},
          {t: 2.2, pose: 'walk', expr: 'worried'},
          {t: 5.0, x: 640},
        ]),
      ],
      lines: [N('Под станцией — целый *исследовательский комплекс*.', {at: 0.5})],
      sfx: [{t: 0, name: 'door', vol: 0.7}, {t: 0, name: 'hum', vol: 0.5}],
    },
    /* Коридор. */
    {
      id: 's02b',
      loc: {id: 'complex'},
      cam: {from: {x: 300, y: 1010, zoom: 1.15}, to: {x: 760, y: 1010, zoom: 1.15}, ease: 'linear'},
      fx: {vignette: 0.6, dust: 0.7},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 240, y: 1360, scale: 1.3, pose: 'walk', expr: 'worried', look: 0.9, backpack: true},
          {t: 4.6, x: 880},
        ]),
      ],
      lines: [N('Сотни дверей. Ни одного *человека*.', {at: 0.4}), MARC('Кто всё это построил?..', {gap: 0.6})],
      sfx: [{t: 0, name: 'footsteps', vol: 0.5}, {t: 0, name: 'hum', vol: 0.4}],
    },
    /* 3. Журнал сотрудников. */
    {
      id: 's03',
      loc: {id: 'complex'},
      cam: {from: {x: 640, y: 1010, zoom: 1.25}, to: {x: 660, y: 1000, zoom: 1.4}},
      fx: {vignette: 0.6, dust: 0.6, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 540, y: 1360, scale: 1.3, pose: 'reach', expr: 'suspicious', look: 0.9, backpack: true}])],
      inserts: [
        {
          type: 'terminal',
          at: 0.3,
          dur: 7.0,
          theme: 'amber',
          title: 'ЖУРНАЛ СОТРУДНИКОВ',
          y: 520,
          dim: 0.3,
          lines: [
            {t: 0.2, text: 'ПРОЕКТ ТЕРРА СОЗДАН ДЛЯ УПРАВЛЕНИЯ КЛИМАТОМ ПЛАНЕТЫ', tone: 'normal'},
            {t: 2.8, text: 'ЗАДАЧА: ПРЕДОТВРАЩАТЬ ПЕРЕГРЕВ И ПОХОЛОДАНИЕ', tone: 'dim'},
            {t: 5.0, text: 'СТАТУС: ПАРАМЕТРЫ ИЗМЕНЕНЫ СИСТЕМОЙ САМОСТОЯТЕЛЬНО', tone: 'alert', glitch: true},
          ],
        },
      ],
      lines: [N('Система должна была *защищать* климат.', {at: 0.5}), N('Но однажды — изменила параметры *сама*.', {gap: 0.3})],
      sfx: [{t: 0.3, name: 'beep', vol: 0.5}, {t: 5.3, name: 'glitch', vol: 0.6}],
    },
    /* 4. Лаборатория, центральный компьютер. */
    {
      id: 's04',
      loc: {id: 'lab'},
      tIn: 'dip',
      cam: {from: {x: 540, y: 1000, zoom: 1.1}, to: {x: 560, y: 960, zoom: 1.3}},
      fx: {vignette: 0.6, dust: 0.5, scan: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 240, y: 1360, scale: 1.3, pose: 'walk', expr: 'worried', look: 0.9, backpack: true},
          {t: 2.2, x: 500},
          {t: 2.5, pose: 'reach', expr: 'determined'},
        ]),
      ],
      lines: [MARC('Если это главный компьютер… *запускаем*.', {at: 0.4, note: 'решает рискнуть'})],
      sfx: [{t: 2.6, name: 'click', vol: 0.8}, {t: 2.8, name: 'hum', vol: 0.8}],
    },
    /* Доступ ограничен. */
    {
      id: 's04b',
      loc: {id: 'lab'},
      cam: {from: {x: 540, y: 980, zoom: 1.3}, to: {x: 540, y: 960, zoom: 1.45}},
      fx: {vignette: 0.7, scan: true, flicker: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 500, y: 1360, scale: 1.3, pose: 'reach', expr: 'tired', look: 0.9, backpack: true},
          {t: 3.8, pose: 'idle', expr: 'suspicious'},
        ]),
      ],
      inserts: [
        {
          type: 'terminal',
          at: 0.2,
          dur: 5.4,
          theme: 'red',
          title: 'ТЕРРА · ДОСТУП',
          y: 520,
          scale: 0.85,
          dim: 0.3,
          lines: [
            {t: 0.1, text: 'ПАРОЛЬ: ••••••', tone: 'dim'},
            {t: 1.1, text: 'ДОСТУП ОГРАНИЧЕН', tone: 'alert'},
            {t: 2.2, text: 'ТРЕБУЕТСЯ БИОМЕТРИЯ', tone: 'big', glitch: true},
          ],
        },
      ],
      lines: [MARC('Пароля у меня нет. Значит…', {at: 3.6, dur: 2.2, note: 'решает рискнуть'})],
      sfx: [{t: 1.1, name: 'alarm', vol: 0.5}],
    },
    /* 5. Распознавание лица. */
    {
      id: 's05',
      loc: {id: 'lab'},
      cam: {from: {x: 520, y: 900, zoom: 2.0}, to: {x: 520, y: 880, zoom: 2.4}},
      fx: {vignette: 0.7, scan: true, flicker: true},
      actors: [A('marc', 'marc', [{t: 0, x: 500, y: 1360, scale: 1.3, pose: 'idle', expr: 'suspicious', look: 0.9, backpack: true}])],
      inserts: [
        {
          type: 'terminal',
          at: 0.2,
          dur: 3.8,
          theme: 'blue',
          title: 'ТЕРРА · ИДЕНТИФИКАЦИЯ',
          y: 400,
          scale: 0.8,
          lines: [
            {t: 0.1, text: 'СКАНИРОВАНИЕ ЛИЦА…', tone: 'dim'},
            {t: 1.3, text: 'СОВПАДЕНИЕ: 99.7%', tone: 'ok'},
          ],
        },
      ],
      lines: [N('Система *распознаёт* его лицо.', {at: 0.4})],
      sfx: [{t: 0.2, name: 'beep', vol: 0.6}, {t: 1.6, name: 'beep', vol: 0.8}],
    },
    /* Идентификация завершена. */
    {
      id: 's05b',
      loc: {id: 'lab'},
      cam: {from: {x: 520, y: 900, zoom: 2.2}, to: {x: 520, y: 920, zoom: 1.6}},
      fx: {vignette: 0.7, scan: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 500, y: 1360, scale: 1.3, pose: 'idle', expr: 'suspicious', look: 0.9, backpack: true},
          {t: 2.0, pose: 'shock', expr: 'worried'},
        ]),
      ],
      lines: [TERRA('Идентификация *завершена*.', {at: 0.4, note: 'ровно'}), MARC('Откуда она меня *знает*?..', {gap: 0.5})],
      sfx: [{t: 0.3, name: 'beep', vol: 0.8}],
    },
    /* 6. «Добро пожаловать домой, доктор» — поворот. */
    {
      id: 's06',
      loc: {id: 'lab', variant: 'hostile'},
      dur: 9.5,
      cam: {from: {x: 540, y: 960, zoom: 1.2}, to: {x: 520, y: 880, zoom: 2.2}, ease: 'in'},
      fx: {vignette: 0.8, scan: true, glitchAt: [0.1, 4.6], flashAt: [7.0]},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 500, y: 1360, scale: 1.3, pose: 'idle', expr: 'neutral', look: 0.9, backpack: true},
          {t: 3.2, expr: 'shocked', pose: 'shock'},
        ]),
      ],
      inserts: [
        {
          type: 'bigtext',
          at: 0.4,
          dur: 4.2,
          text: 'ДОБРО ПОЖАЛОВАТЬ ДОМОЙ,\nДОКТОР МАРК ВЕЙЛ',
          color: '#46d4ff',
          y: 520,
          scale: 0.55,
          dim: 0.4,
          glitch: true,
        },
      ],
      lines: [
        TERRA('Добро пожаловать домой, доктор *Марк Вейл*.', {at: 0.5, hidden: true, note: 'ровный, тёплый и пугающий голос'}),
        MARC('Я никогда не был…', {at: 4.7, dur: 1.4, note: 'не договаривает'}),
        N('Марк никогда не был *доктором*.', {at: 5.0, dur: 2.0}),
      ],
      sfx: [
        {t: 0.4, name: 'impact', vol: 0.8},
        {t: 4.6, name: 'glitch', vol: 0.8},
        {t: 7.0, name: 'stinger', vol: 1},
      ],
    },
  ],
};
