import type {EpisodeDef} from '../types';
import {A, MARC, N, TERRA} from './dsl';

/** СЕРИЯ 3 · «СИГНАЛ ИЗ ПРОШЛОГО» */
export const ep03: EpisodeDef = {
  n: 3,
  id: 'ep03',
  title: 'СИГНАЛ ИЗ ПРОШЛОГО',
  music: 'dark',
  nextTitle: 'ПОД ЗЕМЛЁЙ',
  scenes: [
    /* 1. КРЮЧОК: пыльный монитор. */
    {
      id: 's01',
      loc: {id: 'weather'},
      lead: 0.2,
      cam: {from: {x: 520, y: 1010, zoom: 1.7}, to: {x: 560, y: 1000, zoom: 1.3}},
      fx: {dust: 1, vignette: 0.7, flicker: true, rays: {x: 230, y: 800, opacity: 0.3}},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 520, y: 1360, scale: 1.3, pose: 'reach', expr: 'tired', look: 0.9, backpack: true},
          {t: 3.0, pose: 'idle', expr: 'suspicious'},
        ]),
      ],
      lines: [N('Метеостанция. Внутри всё покрыто *пылью*.', {at: 0.3}), N('Здесь никого не было *годами*.', {gap: 0.2})],
      sfx: [{t: 0, name: 'hum', vol: 0.3}],
    },
    /* 2. Подход снаружи — Марк входит. */
    {
      id: 's02',
      loc: {id: 'weather', variant: 'outside', heat: 0.3},
      cam: {from: {x: 300, y: 1010, zoom: 1.2}, to: {x: 480, y: 1010, zoom: 1.35}},
      fx: {dust: 0.7, embers: 0.3, vignette: 0.5, rays: {x: 220, y: 640, opacity: 0.22}},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: -20, y: 1360, scale: 1.3, pose: 'walk', expr: 'worried', look: 0.9, backpack: true},
          {t: 3.0, x: 400},
          {t: 3.2, pose: 'reach'},
        ]),
      ],
      inserts: [{type: 'thermo', at: 0.4, dur: 3.6, from: 40, to: 12, label: 'У СТАНЦИИ', y: 330}],
      lines: [N('Двенадцать градусов. *Холод* идёт от самой станции.', {at: 0.3})],
      sfx: [{t: 3.2, name: 'door', vol: 0.7}],
      tIn: 'cut',
    },
    /* 3. Резервное питание. */
    {
      id: 's03',
      loc: {id: 'weather'},
      tIn: 'dip',
      cam: {from: {x: 640, y: 1030, zoom: 1.3}, to: {x: 700, y: 1010, zoom: 1.55}},
      fx: {dust: 1, vignette: 0.7, flicker: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 380, y: 1360, scale: 1.3, pose: 'walk', expr: 'suspicious', look: 0.9, backpack: true},
          {t: 1.8, x: 520},
          {t: 2.0, pose: 'reach', expr: 'determined'},
        ]),
      ],
      lines: [MARC('Резервное питание… ну, давай.', {at: 0.5, note: 'вполголоса, сам себе'})],
      sfx: [
        {t: 2.0, name: 'click', vol: 0.8},
        {t: 2.3, name: 'hum', vol: 0.7},
        {t: 2.3, name: 'beep', vol: 0.5},
      ],
    },
    /* Его рабочее место. */
    {
      id: 's03b',
      loc: {id: 'weather'},
      cam: {from: {x: 460, y: 1040, zoom: 1.5}, to: {x: 400, y: 1020, zoom: 1.35}},
      fx: {dust: 0.9, vignette: 0.65, flicker: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 430, y: 1360, scale: 1.3, pose: 'idle', expr: 'sad', look: 0.9, backpack: true},
          {t: 3.6, expr: 'suspicious'},
        ]),
      ],
      lines: [N('Его стол. Его кружка. Будто он ушёл *вчера*.', {at: 0.4}), MARC('Двенадцать градусов… и ни одного *следа*.', {gap: 0.5, note: 'тихо'})],
      sfx: [{t: 0, name: 'hum', vol: 0.3}],
    },
    /* 4. Список файлов. */
    {
      id: 's04',
      loc: {id: 'weather'},
      cam: {from: {x: 700, y: 1000, zoom: 1.4}, to: {x: 700, y: 980, zoom: 1.5}},
      fx: {dust: 0.8, vignette: 0.65, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 520, y: 1360, scale: 1.3, pose: 'reach', expr: 'suspicious', look: 0.9, backpack: true}])],
      inserts: [
        {
          type: 'terminal',
          at: 0.2,
          dur: 4.8,
          theme: 'blue',
          title: 'АРХИВ СТАНЦИИ · ЗАПИСИ',
          y: 560,
          dim: 0.3,
          lines: [
            {t: 0.2, text: '> ФАЙЛЫ: 3', tone: 'dim'},
            {t: 0.8, text: '▪ REC_2038_09_14.avi', tone: 'normal'},
            {t: 1.6, text: '▪ SCHEMA_TERRA.dat', tone: 'normal'},
            {t: 2.4, text: '▪ ВЫХОД: ЗАБЛОКИРОВАН', tone: 'warn'},
          ],
        },
      ],
      lines: [N('В архиве — старые *видеозаписи*.', {at: 0.4})],
      sfx: [{t: 0.2, name: 'beep', vol: 0.5}],
    },
    /* 5. Видео: Марк из прошлого. */
    {
      id: 's05',
      loc: {id: 'weather'},
      cam: {from: {x: 700, y: 1000, zoom: 1.3}, to: {x: 640, y: 1000, zoom: 1.2}},
      fx: {dust: 0.8, vignette: 0.7, scan: true, glitchAt: [0.1]},
      actors: [A('marc', 'marc', [{t: 0, x: 440, y: 1360, scale: 1.3, pose: 'idle', expr: 'shocked', look: 0.9, backpack: true}])],
      inserts: [{type: 'video', at: 0.1, dur: 9.4, char: 'marc', caption: 'ЗАПИСЬ · 14.09.2038', room: 'station', y: 600, scale: 0.88}],
      lines: [
        N('На записи — *он сам*. За несколько месяцев до катастрофы.', {at: 0.3}),
        MARC('Если ты смотришь это видео, значит, температура уже начала расти.', {gap: 0.4, noLip: true, note: 'голос из записи, усталый'}),
        MARC('Не верь официальным данным. *Солнце здесь ни при чём.*', {noLip: true}),
      ],
      sfx: [
        {t: 0.1, name: 'glitch', vol: 0.7},
        {t: 0.1, name: 'static', vol: 0.4},
      ],
    },
    /* 6. Схема под землёй. */
    {
      id: 's06',
      loc: {id: 'weather'},
      tIn: 'glitch',
      cam: {from: {x: 600, y: 1000, zoom: 1.2}, to: {x: 600, y: 990, zoom: 1.3}},
      fx: {dust: 0.6, vignette: 0.7, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 440, y: 1360, scale: 1.3, pose: 'reach', expr: 'worried', look: 0.9, backpack: true}])],
      inserts: [{type: 'globe', at: 0.2, dur: 7.6, mode: 'schema', y: 480, scale: 0.85, dim: 0.4}],
      lines: [
        N('Следующий файл. Схема Земли — и огромные *объекты* под поверхностью.', {at: 0.4}),
        N('Их координаты совпадают с городами, где сейчас *самая высокая* температура.', {gap: 0.3}),
      ],
      sfx: [{t: 0.2, name: 'hum', vol: 0.6}],
    },
    /* 7. Выходы блокируются — поворот. */
    {
      id: 's07',
      loc: {id: 'weather'},
      dur: 7.4,
      cam: {from: {x: 580, y: 1000, zoom: 1.2}, to: {x: 560, y: 960, zoom: 1.6}, shake: 8, shakeAt: [0.1, 1.2]},
      fx: {alarm: true, vignette: 0.8, flicker: true, scan: true, glitchAt: [0.1, 3.0], flashAt: [6.2]},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 440, y: 1360, scale: 1.3, pose: 'shock', expr: 'shocked', look: 0.9, backpack: true},
        ]),
      ],
      inserts: [
        {
          type: 'terminal',
          at: 1.0,
          dur: 5.0,
          theme: 'red',
          title: 'ВЫХОДЫ ЗАБЛОКИРОВАНЫ',
          y: 560,
          dim: 0.5,
          lines: [
            {t: 0.2, text: 'СИСТЕМА ТЕРРА:', tone: 'dim'},
            {t: 0.8, text: 'АКТИВАЦИЯ — 100%', tone: 'big', glitch: true},
          ],
        },
      ],
      lines: [TERRA('Активация… *сто* процентов.', {at: 2.6, hidden: true})],
      sfx: [
        {t: 0.1, name: 'door', vol: 0.9},
        {t: 0.1, name: 'alarm', vol: 0.6},
        {t: 1.0, name: 'glitch', vol: 0.8},
        {t: 6.2, name: 'stinger', vol: 1},
      ],
    },
  ],
};
