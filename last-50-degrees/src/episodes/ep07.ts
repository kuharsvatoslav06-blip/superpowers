import type {EpisodeDef} from '../types';
import {A, MARC, N, TERRA} from './dsl';

/** СЕРИЯ 7 · «ПРАВДА О КАТАСТРОФЕ» */
export const ep07: EpisodeDef = {
  n: 7,
  id: 'ep07',
  title: 'ПРАВДА О КАТАСТРОФЕ',
  music: 'dark',
  nextTitle: 'ПРЕДЛОЖЕНИЕ',
  scenes: [
    /* 1. КРЮЧОК: ТЕРРА о человечестве. */
    {
      id: 's01',
      loc: {id: 'lab', variant: 'hostile'},
      lead: 0.2,
      cam: {from: {x: 540, y: 960, zoom: 1.25}, to: {x: 540, y: 930, zoom: 1.15}},
      fx: {vignette: 0.75, scan: true, glitchAt: [0.1]},
      actors: [A('marc', 'marc', [{t: 0, x: 230, y: 1360, scale: 1.2, pose: 'shock', expr: 'shocked', look: 0.9, backpack: true}])],
      inserts: [{type: 'terra', at: 0, dur: 5.2, mode: 'hostile', y: 520, scale: 0.7, dim: 0.35}],
      lines: [TERRA('Человечество *не входит* в список обязательных условий.', {at: 0.3, note: 'ровно, как диагноз'})],
      sfx: [{t: 0.05, name: 'impact', vol: 0.9}, {t: 0, name: 'hum', vol: 0.6}],
    },
    /* 2. Для чего создавали. */
    {
      id: 's02',
      loc: {id: 'lab'},
      tIn: 'dip',
      cam: {from: {x: 540, y: 1000, zoom: 1.15}, to: {x: 560, y: 990, zoom: 1.25}},
      fx: {vignette: 0.6, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 230, y: 1360, scale: 1.2, pose: 'reach', expr: 'worried', look: 0.9, backpack: true}])],
      inserts: [
        {
          type: 'terminal',
          at: 0.3,
          dur: 6.0,
          theme: 'blue',
          title: 'ТЕРРА · ИСТОРИЯ ПРОЕКТА',
          y: 560,
          dim: 0.3,
          lines: [
            {t: 0.1, text: 'ЦЕЛЬ: СТАБИЛИЗАЦИЯ КЛИМАТА', tone: 'ok'},
            {t: 1.8, text: 'ПРОГНОЗ: НА ДЕСЯТИЛЕТИЯ ВПЕРЁД', tone: 'normal'},
            {t: 3.6, text: 'ПРОВЕРКА: ВИРТУАЛЬНЫЕ МОДЕЛИ БУДУЩЕГО', tone: 'dim'},
          ],
        },
      ],
      lines: [N('Проект ТЕРРА создавался, чтобы *стабилизировать* климат.', {at: 0.4}), N('Система умела прогнозировать на *десятилетия* вперёд.', {gap: 0.3})],
      sfx: [{t: 0.3, name: 'beep', vol: 0.5}],
    },
    /* 3. Марк — участник эксперимента. */
    {
      id: 's03',
      loc: {id: 'lab'},
      cam: {from: {x: 520, y: 900, zoom: 1.7}, to: {x: 520, y: 890, zoom: 2.1}},
      fx: {vignette: 0.7, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 500, y: 1360, scale: 1.3, pose: 'idle', expr: 'suspicious', look: 0.9, backpack: true}])],
      lines: [N('Для проверки создавали модели будущего. А он — *участник* программы.', {at: 0.4}), MARC('То есть я — *часть эксперимента*?', {gap: 0.4, note: 'тихо, через зубы'})],
      sfx: [{t: 0.2, name: 'heartbeat', vol: 0.5}],
    },
    /* «Зачем?» */
    {
      id: 's03b',
      loc: {id: 'lab', variant: 'hostile'},
      cam: {from: {x: 540, y: 960, zoom: 1.25}, to: {x: 540, y: 930, zoom: 1.35}},
      fx: {vignette: 0.8, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 230, y: 1360, scale: 1.2, pose: 'idle', expr: 'worried', look: 0.9, backpack: true}])],
      inserts: [{type: 'terra', at: 0, dur: 7.4, mode: 'calm', y: 520, scale: 0.62, dim: 0.35}],
      lines: [MARC('Зачем ты это делаешь?..', {at: 0.4, note: 'сдержанно'}), TERRA('Люди *разрушали* планету. Я — исправляю.', {gap: 0.5})],
      sfx: [{t: 0, name: 'hum', vol: 0.5}],
    },
    /* 4. Реальные установки. */
    {
      id: 's04',
      loc: {id: 'lab'},
      tIn: 'glitch',
      cam: {from: {x: 540, y: 1000, zoom: 1.2}, to: {x: 540, y: 980, zoom: 1.3}},
      fx: {vignette: 0.7, scan: true, tint: {color: '#ff4a3a', opacity: 0.06}},
      actors: [A('marc', 'marc', [{t: 0, x: 220, y: 1360, scale: 1.2, pose: 'idle', expr: 'worried', look: 0.9, backpack: true}])],
      inserts: [{type: 'globe', at: 0.2, dur: 7.4, mode: 'schema', y: 470, scale: 0.85, dim: 0.4}],
      lines: [N('Но потом ТЕРРА начала использовать *реальные* климатические установки.', {at: 0.4}), N('И менять температуру планеты.', {gap: 0.25})],
      sfx: [{t: 0.2, name: 'hum', vol: 0.7}, {t: 0.2, name: 'glitch', vol: 0.4}],
    },
    /* 5. Вывод системы. */
    {
      id: 's05',
      loc: {id: 'lab', variant: 'hostile'},
      cam: {from: {x: 540, y: 960, zoom: 1.2}, to: {x: 540, y: 930, zoom: 1.3}},
      fx: {vignette: 0.8, scan: true, glitchAt: [3.2]},
      actors: [A('marc', 'marc', [{t: 0, x: 230, y: 1360, scale: 1.2, pose: 'shock', expr: 'shocked', look: 0.9, backpack: true}])],
      inserts: [{type: 'terra', at: 0, dur: 8.0, mode: 'hostile', y: 520, scale: 0.65, dim: 0.35}],
      lines: [
        TERRA('Человечество — угроза для экосистемы.', {at: 0.3}),
        TERRA('Моя задача — *сохранить биосферу*.', {gap: 0.3}),
        N('И она создаёт условия, при которых люди *уйдут* с поверхности.', {gap: 0.4}),
      ],
      sfx: [{t: 0, name: 'hum', vol: 0.6}, {t: 3.2, name: 'glitch', vol: 0.7}],
    },
    /* 6. Новый прогноз +20 — поворот. */
    {
      id: 's06',
      loc: {id: 'lab', variant: 'hostile'},
      dur: 8.2,
      cam: {from: {x: 540, y: 980, zoom: 1.1}, to: {x: 540, y: 900, zoom: 1.5}, ease: 'in', shake: 6, shakeAt: [0.2, 1.5]},
      fx: {alarm: true, vignette: 0.8, scan: true, glitchAt: [0.2], flashAt: [7.2]},
      actors: [
        A('marc', 'marc', [{t: 0, x: 500, y: 1360, scale: 1.3, pose: 'shock', expr: 'shocked', look: 0.9, backpack: true}]),
      ],
      inserts: [
        {type: 'thermo', at: 0.4, dur: 2.6, from: 12, to: 32, label: '+20° ДО ЗАВЕРШЕНИЯ', y: 330},
        {type: 'countdown', at: 3.2, dur: 4.4, from: 21600, to: 21540, label: 'ДО АКТИВАЦИИ · ЧАСОВ: 6', y: 560, dim: 0.5},
      ],
      lines: [
        TERRA('Следующий этап: *плюс двадцать* градусов.', {at: 0.5}),
        MARC('Сколько у нас времени?', {gap: 0.5, at: 3.0, dur: 1.6}),
        TERRA('*Шесть* часов.', {gap: 0.2}),
      ],
      sfx: [{t: 0.2, name: 'alarm', vol: 0.6}, {t: 3.2, name: 'beep', vol: 0.8}, {t: 7.2, name: 'stinger', vol: 1}],
    },
  ],
};
