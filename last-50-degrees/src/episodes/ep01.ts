import type {EpisodeDef} from '../types';
import {A, MARC, N, RADIO} from './dsl';

/**
 * СЕРИЯ 1 · «ТЕМПЕРАТУРА 96°C»
 * Заголовок отсылает к температуре поверхности на улице (в квартире — 54°C): в сцене выхода счётчик доходит до 96.
 */
export const ep01: EpisodeDef = {
  n: 1,
  id: 'ep01',
  title: 'ТЕМПЕРАТУРА 96°C',
  music: 'tension',
  nextTitle: 'ГОРОД, КОТОРОГО НЕТ НА КАРТЕ',
  scenes: [
    /* 1. КРЮЧОК: сирена и градусник. */
    {
      id: 's01',
      note: 'Крупно градусник, красная тревога, Марк вскакивает.',
      loc: {id: 'apartment', heat: 0.9},
      lead: 0.5,
      cam: {from: {x: 470, y: 650, zoom: 2.7}, to: {x: 400, y: 1000, zoom: 1.22}, ease: 'out', shake: 7, shakeAt: [0, 2.2]},
      fx: {alarm: true, flicker: true, dust: 0.6, vignette: 0.7, rays: {x: 780, y: 640, opacity: 0.16}},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 215, y: 1360, scale: 1.3, pose: 'slump', expr: 'tired', look: 0.7},
          {t: 1.6, pose: 'sit', expr: 'shocked'},
          {t: 3.8, expr: 'worried'},
        ]),
      ],
      inserts: [{type: 'thermo', at: 0, dur: 4.2, from: 38, to: 54, style: 'big', label: 'В КОМНАТЕ', y: 420}],
      lines: [N('2039 год. *Температура* растёт с каждым днём.', {at: 0.5}), N('Марк просыпается от *сирены*.')],
      sfx: [
        {t: 0, name: 'siren', vol: 0.9},
        {t: 0, name: 'impact', vol: 0.7},
      ],
    },
    /* 2. Радио. */
    {
      id: 's02',
      loc: {id: 'apartment', heat: 0.9},
      tIn: 'dip',
      cam: {from: {x: 540, y: 1000, zoom: 1.05}, to: {x: 740, y: 1040, zoom: 1.6}},
      fx: {alarm: true, flicker: true, dust: 0.5, vignette: 0.65},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 330, y: 1360, scale: 1.3, pose: 'walk', expr: 'tired', look: 0.7},
          {t: 1.7, x: 580, pose: 'reach', expr: 'worried'},
          {t: 5.0, expr: 'determined'},
        ]),
      ],
      inserts: [{type: 'radio', at: 0.35, dur: 7.4, from: 88.0, to: 101.5, banner: 'ТЕПЛОВАЯ ВОЛНА', y: 430, scale: 0.8}],
      lines: [
        RADIO('Внимание! Новая *тепловая волна*. Всем оставаться в укрытиях.', {at: 1.7, note: 'сквозь помехи, плоский голос диктора'}),
        MARC('Значит… *пора*.', {gap: 0.5, note: 'тихо, сам себе'}),
      ],
      sfx: [
        {t: 1.6, name: 'radio', vol: 0.7},
        {t: 1.6, name: 'static', vol: 0.5},
      ],
    },
    /* 3. Сборы. */
    {
      id: 's03',
      loc: {id: 'apartment', heat: 0.8},
      cam: {from: {x: 300, y: 1130, zoom: 1.7}, to: {x: 330, y: 1060, zoom: 1.45}},
      fx: {dust: 0.6, vignette: 0.6, flicker: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 300, y: 1360, scale: 1.3, pose: 'crouch', expr: 'tired', look: 0.7},
          {t: 3.7, pose: 'idle', expr: 'determined', backpack: true},
        ]),
      ],
      inserts: [
        {
          type: 'items',
          at: 0.25,
          dur: 5.2,
          y: 380,
          scale: 0.72,
          title: 'ПОСЛЕДНИЕ ЗАПАСЫ',
          items: [
            {icon: 'water', label: 'ВОДА', sub: '2 ДНЯ'},
            {icon: 'food', label: 'ЕДА', sub: '3 ДНЯ'},
            {icon: 'light', label: 'ФОНАРЬ'},
            {icon: 'map', label: 'КАРТА'},
          ],
        },
      ],
      lines: [N('Воды — на *двое суток*.', {at: 0.3}), N('Еды — на три. Если *повезёт*.')],
      sfx: [
        {t: 0.5, name: 'click', vol: 0.6},
        {t: 1.5, name: 'click', vol: 0.6},
        {t: 3.6, name: 'click', vol: 0.7},
      ],
    },
    /* 4. Выход на улицу: ослепляющий свет, градусник доходит до 96. */
    {
      id: 's04',
      tIn: 'flash',
      loc: {id: 'city', heat: 0.8},
      cam: {from: {x: 300, y: 1000, zoom: 1.18}, to: {x: 480, y: 1000, zoom: 1.1}},
      fx: {papers: 0.6, heat: 0.8, dust: 0.9, embers: 0.5, vignette: 0.45, rays: {x: 720, y: 620, opacity: 0.34}, tint: {color: '#ff7a2a', opacity: 0.08}, flashAt: [0]},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: -140, y: 1360, scale: 1.3, pose: 'walk', expr: 'worried', look: 0.8, backpack: true},
          {t: 4.6, x: 500},
        ]),
      ],
      inserts: [{type: 'thermo', at: 0.4, dur: 4.4, from: 54, to: 96, label: 'НА УЛИЦЕ', y: 330}],
      lines: [N('Единственное место, где ещё можно *дышать* — подземное убежище.', {at: 0.5})],
      sfx: [
        {t: 0, name: 'wind', vol: 0.6},
        {t: 0, name: 'whoosh', vol: 0.7},
      ],
    },
    /* Панорама: Марк крошечный на фоне руин (без реплик — только атмосфера). */
    {
      id: 's04b',
      loc: {id: 'city', heat: 0.85},
      dur: 3.6,
      cam: {from: {x: 520, y: 1010, zoom: 1.0}, to: {x: 640, y: 990, zoom: 1.1}},
      fx: {papers: 1, heat: 0.85, dust: 1, embers: 0.8, vignette: 0.3, rays: {x: 720, y: 620, opacity: 0.3}},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 140, y: 1360, scale: 0.7, pose: 'walk', expr: 'worried', look: 0.9, backpack: true},
          {t: 3.6, x: 420},
        ]),
      ],
      sfx: [{t: 0, name: 'wind', vol: 0.6}],
    },
    /* 5. Дорога по мёртвому городу. */
    {
      id: 's05',
      loc: {id: 'city', heat: 0.8},
      cam: {from: {x: 140, y: 1010, zoom: 1.12}, to: {x: 540, y: 1010, zoom: 1.12}, ease: 'linear'},
      fx: {papers: 0.6, heat: 0.8, dust: 1, embers: 0.7, vignette: 0.5, rays: {x: 720, y: 620, opacity: 0.28}},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: -60, y: 1360, scale: 1.3, pose: 'walk', expr: 'worried', look: 0.9, backpack: true},
          {t: 3.9, x: 480},
          {t: 4.3, pose: 'idle', look: 0.4},
        ]),
      ],
      lines: [N('Три квартала. Ни души.', {at: 0.3}), N('Асфальт *плавится* под ботинками.', {gap: 0.15})],
      sfx: [
        {t: 0, name: 'footsteps', vol: 0.5},
        {t: 0, name: 'wind', vol: 0.5},
      ],
    },
    /* 6. Терминал. */
    {
      id: 's06',
      loc: {id: 'city', variant: 'terminal', heat: 0.8},
      cam: {from: {x: 540, y: 1010, zoom: 1.12}, to: {x: 660, y: 1000, zoom: 1.5}},
      fx: {papers: 0.6, heat: 0.7, dust: 0.8, embers: 0.4, vignette: 0.55},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 480, y: 1360, scale: 1.3, pose: 'idle', expr: 'suspicious', look: 0.9, backpack: true},
          {t: 1.8, pose: 'reach', expr: 'worried'},
        ]),
      ],
      lines: [MARC('Терминал?.. Он ещё *работает*.', {at: 0.5, note: 'удивлённо, вполголоса'})],
      sfx: [
        {t: 0.2, name: 'hum', vol: 0.5},
        {t: 1.8, name: 'beep', vol: 0.7},
      ],
    },
    /* 7. Карта планеты. */
    {
      id: 's07',
      loc: {id: 'city', variant: 'terminal', heat: 0.8},
      cam: {from: {x: 660, y: 1000, zoom: 1.5}, to: {x: 670, y: 1010, zoom: 1.58}},
      fx: {papers: 0.6, heat: 0.5, dust: 0.6, vignette: 0.6, scan: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 480, y: 1360, scale: 1.3, pose: 'reach', expr: 'worried', look: 0.9, backpack: true},
          {t: 5.2, expr: 'shocked'},
        ]),
      ],
      inserts: [{type: 'globe', at: 0.2, dur: 8.3, spot: {label: '12°C', angle: -50}, spotAt: 3.4, y: 410, scale: 0.78, dim: 0.35}],
      lines: [
        N('Почти вся планета — *красная*.', {at: 0.5}),
        N('Но один участок — *синий*. Двенадцать градусов.', {gap: 0.5}),
        MARC('Это же… моя *станция*.', {gap: 0.35, note: 'шёпотом, не веря'}),
      ],
      sfx: [
        {t: 3.4, name: 'beep', vol: 0.8},
        {t: 0.2, name: 'hum', vol: 0.4},
      ],
    },
    /* 8. Решение. */
    {
      id: 's08',
      loc: {id: 'city', variant: 'terminal', heat: 0.8},
      tIn: 'dip',
      cam: {from: {x: 520, y: 900, zoom: 2.3}, to: {x: 520, y: 890, zoom: 2.7}},
      fx: {papers: 0.6, heat: 0.4, dust: 0.9, vignette: 0.65},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 480, y: 1360, scale: 1.3, pose: 'idle', expr: 'tired', look: 0.9, backpack: true},
          {t: 2.6, expr: 'determined'},
        ]),
      ],
      lines: [MARC('Там я работал. Там могут быть *ответы*.', {at: 0.4, note: 'решительно, но без пафоса'})],
      sfx: [{t: 0.1, name: 'wind', vol: 0.4}],
    },
    /* 9. Первое сообщение. */
    {
      id: 's09',
      loc: {id: 'city', variant: 'terminal', heat: 0.9},
      tIn: 'glitch',
      cam: {from: {x: 640, y: 1000, zoom: 1.3}, to: {x: 640, y: 1000, zoom: 1.4}, shake: 5, shakeAt: [0, 0.6]},
      fx: {heat: 0.3, vignette: 0.7, scan: true, glitchAt: [0, 1.2], alarm: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 480, y: 1360, scale: 1.3, pose: 'shock', expr: 'shocked', look: 0.9, backpack: true},
        ]),
      ],
      inserts: [
        {
          type: 'terminal',
          at: 0.1,
          dur: 5.9,
          theme: 'red',
          title: 'ТЕРМИНАЛ № 07 · НОВОЕ СООБЩЕНИЕ',
          y: 560,
          dim: 0.45,
          lines: [
            {t: 0.2, text: 'ОТПРАВИТЕЛЬ: —', tone: 'dim'},
            {t: 0.9, text: 'МАРК, ЕСЛИ ТЫ ЭТО ЧИТАЕШЬ — НЕ ИДИ НА СТАНЦИЮ', tone: 'big', glitch: true},
          ],
        },
      ],
      lines: [MARC('Что?..', {at: 3.6, dur: 1.0, note: 'выдох'})],
      sfx: [
        {t: 0.1, name: 'glitch', vol: 0.8},
        {t: 0.1, name: 'impact', vol: 0.8},
      ],
    },
    /* 10. Второе сообщение — поворот. */
    {
      id: 's10',
      loc: {id: 'city', variant: 'terminal', heat: 0.9},
      dur: 7.0,
      cam: {from: {x: 640, y: 1000, zoom: 1.4}, to: {x: 520, y: 900, zoom: 2.6}, ease: 'in'},
      fx: {heat: 0.3, vignette: 0.8, scan: true, glitchAt: [0.05, 3.9], flashAt: [5.6]},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 480, y: 1360, scale: 1.3, pose: 'shock', expr: 'shocked', look: 0.9, backpack: true},
          {t: 3.9, pose: 'idle', look: -0.9, expr: 'shocked', tilt: -4},
        ]),
      ],
      inserts: [
        {
          type: 'terminal',
          at: 0.1,
          dur: 3.7,
          theme: 'red',
          title: 'ТЕРМИНАЛ № 07 · НОВОЕ СООБЩЕНИЕ',
          y: 560,
          dim: 0.5,
          lines: [
            {t: 0.2, text: 'ОТПРАВИТЕЛЬ: НЕИЗВЕСТЕН', tone: 'dim'},
            {t: 0.8, text: 'МЫ ЗНАЕМ, ЧТО ТЫ УЖЕ ВЫШЕЛ ИЗ ДОМА', tone: 'big', glitch: true},
          ],
        },
      ],
      lines: [],
      sfx: [
        {t: 0.1, name: 'glitch', vol: 0.9},
        {t: 0.9, name: 'heartbeat', vol: 0.9},
        {t: 3.9, name: 'heartbeat', vol: 1},
        {t: 5.6, name: 'stinger', vol: 1},
      ],
    },
  ],
};
