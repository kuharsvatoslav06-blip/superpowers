import type {EpisodeDef} from '../types';
import {A, L, MARC, N} from './dsl';

/** СЕРИЯ 2 · «ГОРОД, КОТОРОГО НЕТ НА КАРТЕ» */
export const ep02: EpisodeDef = {
  n: 2,
  id: 'ep02',
  title: 'ГОРОД, КОТОРОГО НЕТ НА КАРТЕ',
  music: 'tension',
  nextTitle: 'СИГНАЛ ИЗ ПРОШЛОГО',
  scenes: [
    /* 1. КРЮЧОК: убежище, Мия не пускает. */
    {
      id: 's01',
      loc: {id: 'shelter', variant: 'door'},
      lead: 0.2,
      cam: {from: {x: 540, y: 990, zoom: 1.12}, to: {x: 560, y: 960, zoom: 1.3}},
      fx: {flicker: true, dust: 0.5, vignette: 0.65},
      actors: [
        A('marc', 'marc', [{t: 0, x: 300, y: 1360, scale: 1.3, pose: 'idle', expr: 'determined', look: 0.9, backpack: true}]),
        A('mia', 'mia', [{t: 0, x: 690, y: 1360, scale: 1.25, pose: 'idle', expr: 'suspicious', look: 0.7, flip: true}]),
        A('jake', 'jake', [{t: 0, x: 900, y: 1360, scale: 1.3, pose: 'idle', expr: 'smile', look: 0.7, flip: true}]),
      ],
      lines: [
        L('mia', 'Станция? Оттуда никто не *возвращался*.', {at: 0.2, note: 'жёстко, без приветствий'}),
        L('jake', 'Зато там *двенадцать* градусов! Звучит как рай.', {note: 'бодро, почти шутя'}),
        L('mia', 'Звучит как *ловушка*.'),
        MARC('Поэтому я должен увидеть сам.', {note: 'ровно, спокойно'}),
      ],
      sfx: [
        {t: 0, name: 'hum', vol: 0.4},
        {t: 8.2, name: 'door', vol: 0.5},
      ],
    },
    /* 2. Решение уйти. */
    {
      id: 's02',
      loc: {id: 'shelter', variant: 'door'},
      cam: {from: {x: 300, y: 960, zoom: 1.5}, to: {x: 340, y: 960, zoom: 1.7}},
      fx: {flicker: true, dust: 0.5, vignette: 0.7},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 300, y: 1360, scale: 1.3, pose: 'idle', expr: 'determined', look: 0.9, backpack: true},
          {t: 2.2, flip: true, look: -0.2},
        ]),
      ],
      lines: [N('Марк уходит. Все *уговоры* — потом.', {at: 0.4})],
      sfx: [{t: 0, name: 'footsteps', vol: 0.4}],
    },
    /* 3. Магистраль. */
    {
      id: 's03',
      tIn: 'whip',
      loc: {id: 'highway', heat: 0.7},
      cam: {from: {x: 160, y: 1010, zoom: 1.12}, to: {x: 700, y: 1010, zoom: 1.12}, ease: 'linear'},
      fx: {heat: 0.6, dust: 0.9, embers: 0.6, vignette: 0.5, rays: {x: 780, y: 800, opacity: 0.22}},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: -140, y: 1450, scale: 1.3, pose: 'walk', expr: 'tired', look: 0.9, backpack: true},
          {t: 5.4, x: 620},
        ]),
      ],
      lines: [N('До станции — двадцать километров по заброшенной *магистрали*.', {at: 0.3})],
      sfx: [
        {t: 0, name: 'wind', vol: 0.5},
        {t: 0, name: 'footsteps', vol: 0.5},
      ],
    },
    /* 4. Холод из щели. */
    {
      id: 's04',
      loc: {id: 'city', heat: 0.9},
      cam: {from: {x: 360, y: 1010, zoom: 1.12}, to: {x: 560, y: 1000, zoom: 1.35}},
      fx: {heat: 0.7, dust: 0.8, embers: 0.4, vignette: 0.5},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 120, y: 1360, scale: 1.3, pose: 'walk', expr: 'suspicious', look: 0.9, backpack: true},
          {t: 2.3, x: 440},
          {t: 2.6, pose: 'reach', expr: 'worried'},
        ]),
      ],
      inserts: [{type: 'thermo', at: 0.5, dur: 5.0, from: 96, to: 18, label: 'ИЗ-ПОД ДВЕРИ', y: 330}],
      lines: [N('Здание. Единственное, где из щели *тянет холодом*.', {at: 0.3}), MARC('Восемнадцать?.. Здесь?', {gap: 0.4})],
      sfx: [
        {t: 2.6, name: 'beep', vol: 0.6},
        {t: 0, name: 'wind', vol: 0.4},
      ],
    },
    /* 5. Вход в «невозможную» квартиру. */
    {
      id: 's05',
      tIn: 'flash',
      loc: {id: 'apartment', variant: 'cool'},
      cam: {from: {x: 380, y: 1000, zoom: 1.18}, to: {x: 520, y: 1000, zoom: 1.24}},
      fx: {dust: 0.3, vignette: 0.55, flashAt: [0]},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: -40, y: 1360, scale: 1.3, pose: 'walk', expr: 'suspicious', look: 0.9, backpack: true},
          {t: 3.0, x: 380},
          {t: 3.3, pose: 'idle', expr: 'worried', look: 0.5},
        ]),
      ],
      lines: [N('Кондиционеры *работают*. Горит свет. На столе — горячий кофе.', {at: 0.4}), N('Людей — нет.', {gap: 0.2})],
      sfx: [
        {t: 0, name: 'hum', vol: 0.6},
        {t: 0, name: 'whoosh', vol: 0.5},
      ],
    },
    /* 6. Чашка. */
    {
      id: 's06',
      loc: {id: 'apartment', variant: 'cool'},
      cam: {from: {x: 700, y: 1100, zoom: 1.7}, to: {x: 760, y: 1120, zoom: 2.0}},
      fx: {dust: 0.3, vignette: 0.6},
      actors: [
        A('marc', 'marc', [{t: 0, x: 560, y: 1360, scale: 1.3, pose: 'idle', expr: 'suspicious', look: 0.9, backpack: true}]),
      ],
      lines: [MARC('Здесь кто-то был. *Минуту* назад.', {at: 0.3, note: 'тихо, оглядываясь'})],
      sfx: [{t: 0.2, name: 'hum', vol: 0.4}],
    },
    /* 7. Календарь. */
    {
      id: 's07',
      loc: {id: 'apartment', variant: 'cool'},
      cam: {from: {x: 300, y: 900, zoom: 1.5}, to: {x: 280, y: 880, zoom: 1.65}},
      fx: {vignette: 0.7, dust: 0.3},
      actors: [A('marc', 'marc', [{t: 0, x: 560, y: 1360, scale: 1.3, pose: 'point', expr: 'shocked', look: -0.3, flip: true, backpack: true}])],
      inserts: [{type: 'calendar', at: 0.3, dur: 5.2, day: '12', month: 'НОЯБРЯ', year: '2038', note: 'ПОЧТИ ГОД НАЗАД', y: 560, scale: 0.85, dim: 0.5}],
      lines: [N('Календарь. *Двенадцатое ноября* две тысячи тридцать восьмого.', {at: 0.4}), MARC('Почти год… а кофе *горячий*.', {gap: 0.3})],
      sfx: [{t: 0.3, name: 'impact', vol: 0.5}],
    },
    /* 8. Фото. */
    {
      id: 's08',
      loc: {id: 'apartment', variant: 'cool'},
      cam: {from: {x: 420, y: 880, zoom: 1.5}, to: {x: 400, y: 860, zoom: 1.7}},
      fx: {vignette: 0.7, dust: 0.3},
      actors: [A('marc', 'marc', [{t: 0, x: 560, y: 1360, scale: 1.3, pose: 'shock', expr: 'shocked', look: -0.3, flip: true, backpack: true}])],
      inserts: [{type: 'photo', at: 0.2, dur: 5.6, who: ['father', 'mother', 'marcOld'], caption: 'СЕМЬЯ · 2038', y: 540, scale: 0.7, dim: 0.5}],
      lines: [N('Фотография. Родители… и *он сам*.'), MARC('Но я здесь… *старше*.', {gap: 0.35, note: 'почти шёпотом'})],
      sfx: [{t: 0.2, name: 'heartbeat', vol: 0.6}],
    },
    /* 9. Надпись на обороте — поворот. */
    {
      id: 's09',
      loc: {id: 'apartment', variant: 'cool'},
      dur: 7.2,
      cam: {from: {x: 420, y: 860, zoom: 1.7}, to: {x: 440, y: 860, zoom: 2.1}, ease: 'in'},
      fx: {vignette: 0.8, dust: 0.3, glitchAt: [2.4], flashAt: [6.0]},
      actors: [A('marc', 'marc', [{t: 0, x: 560, y: 1360, scale: 1.3, pose: 'shock', expr: 'shocked', look: -0.3, flip: true, backpack: true}])],
      inserts: [
        {
          type: 'photo',
          at: 0,
          dur: 6.2,
          who: ['father', 'mother', 'marcOld'],
          caption: 'СЕМЬЯ · 2038',
          flipAt: 0.8,
          back: 'Марк. Не позволяй себе дойти до 2040 года.',
          y: 560,
          scale: 0.78,
          dim: 0.55,
        },
      ],
      lines: [],
      sfx: [
        {t: 0.8, name: 'whoosh', vol: 0.5},
        {t: 2.4, name: 'glitch', vol: 0.8},
        {t: 6.0, name: 'stinger', vol: 1},
      ],
    },
  ],
};
