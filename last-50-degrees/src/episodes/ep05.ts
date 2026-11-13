import type {EpisodeDef} from '../types';
import {A, MARC, N} from './dsl';

/** СЕРИЯ 5 · «ЧЕЛОВЕК, КОТОРОГО НЕ СУЩЕСТВУЕТ» */
export const ep05: EpisodeDef = {
  n: 5,
  id: 'ep05',
  title: 'ЧЕЛОВЕК, КОТОРОГО НЕ СУЩЕСТВУЕТ',
  music: 'dark',
  nextTitle: 'ПОСЛЕДНЯЯ ВЕРСИЯ',
  scenes: [
    /* 1. КРЮЧОК: личное дело с его лицом. */
    {
      id: 's01',
      loc: {id: 'lab'},
      lead: 0.2,
      cam: {from: {x: 540, y: 980, zoom: 1.25}, to: {x: 540, y: 960, zoom: 1.15}},
      fx: {vignette: 0.7, scan: true, flicker: true, glitchAt: [0.05]},
      actors: [A('marc', 'marc', [{t: 0, x: 220, y: 1360, scale: 1.2, pose: 'idle', expr: 'shocked', look: 0.9, backpack: true}])],
      inserts: [
        {
          type: 'dossier',
          at: 0.05,
          dur: 8.6,
          face: 'marc',
          theme: 'blue',
          title: 'ЛИЧНОЕ ДЕЛО',
          y: 600,
          scale: 0.95,
          stamp: 'ПРОПАЛ',
          fields: [
            ['ИМЯ', 'МАРК ВЕЙЛ'],
            ['ВОЗРАСТ', '20 ЛЕТ'],
            ['ДОЛЖНОСТЬ', 'РУКОВОДИТЕЛЬ ПРОЕКТА ТЕРРА'],
            ['ПРОПАЛ БЕЗ ВЕСТИ', '3 МАРТА 2039'],
          ],
        },
      ],
      lines: [N('Личное дело. Имя — *Марк Вейл*. Возраст — двадцать.', {at: 0.4}), N('Руководитель проекта. Пропал без вести.', {gap: 0.3})],
      sfx: [{t: 0.05, name: 'glitch', vol: 0.7}, {t: 5.8, name: 'impact', vol: 0.8}],
    },
    /* Дата исчезновения. */
    {
      id: 's01b',
      loc: {id: 'lab'},
      tIn: 'glitch',
      cam: {from: {x: 540, y: 1000, zoom: 1.2}, to: {x: 540, y: 980, zoom: 1.35}},
      fx: {vignette: 0.7, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 240, y: 1360, scale: 1.2, pose: 'idle', expr: 'worried', look: 0.9, backpack: true}])],
      inserts: [{type: 'bigtext', at: 0.3, dur: 4.6, text: '3 МАРТА\n2039', sub: 'ДАТА ИСЧЕЗНОВЕНИЯ', color: '#ffc857', y: 540, scale: 0.7, dim: 0.4, glitch: true}],
      lines: [N('Дата исчезновения — *третье марта*.', {at: 0.4}), MARC('Меня *не существует*… а я стою здесь.', {gap: 0.6, note: 'почти шёпотом'})],
      sfx: [{t: 0.3, name: 'impact', vol: 0.7}],
    },
    /* 2. Реакция. */
    {
      id: 's02',
      loc: {id: 'lab'},
      cam: {from: {x: 500, y: 900, zoom: 1.9}, to: {x: 500, y: 890, zoom: 2.3}},
      fx: {vignette: 0.7, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 500, y: 1360, scale: 1.3, pose: 'shock', expr: 'worried', look: 0.9, backpack: true}])],
      lines: [MARC('Это не просто *совпадение*…', {at: 0.4, note: 'пытается рассуждать'}), MARC('Но я *ничего* из этого не помню.', {gap: 0.35}), MARC('Если это правда… то кто *я*?', {gap: 0.5, note: 'тише, к самому себе'})],
      sfx: [{t: 0.2, name: 'heartbeat', vol: 0.6}],
    },
    /* 3. Видеообращение «старшего» Марка. */
    {
      id: 's03',
      loc: {id: 'lab'},
      tIn: 'glitch',
      cam: {from: {x: 540, y: 1000, zoom: 1.2}, to: {x: 560, y: 990, zoom: 1.3}},
      fx: {vignette: 0.7, scan: true, glitchAt: [0.1]},
      actors: [A('marc', 'marc', [{t: 0, x: 220, y: 1360, scale: 1.2, pose: 'idle', expr: 'shocked', look: 0.9, backpack: true}])],
      inserts: [{type: 'video', at: 0.1, dur: 10.8, char: 'marcOld', caption: 'ЗАПИСЬ · ДОКТОР ВЕЙЛ', room: 'lab', tint: '#7fb8ff', y: 620, scale: 0.9}],
      lines: [
        N('На экране появляется мужчина. Очень похожий на него. Только *старше*.', {at: 0.3}),
        MARC('Если ты добрался сюда, значит, я не смог остановить систему.', {gap: 0.4, noLip: true, note: 'голос взрослого Марка, глухой и усталый'}),
        MARC('Но есть кое-что, чего ты *ещё не знаешь*.', {noLip: true}),
      ],
      sfx: [{t: 0.1, name: 'glitch', vol: 0.7}, {t: 0.1, name: 'static', vol: 0.4}],
    },
    /* Реакция на видео. */
    {
      id: 's03b',
      loc: {id: 'lab'},
      cam: {from: {x: 500, y: 900, zoom: 1.9}, to: {x: 500, y: 890, zoom: 2.4}},
      fx: {vignette: 0.75, scan: true},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 500, y: 1360, scale: 1.3, pose: 'idle', expr: 'worried', look: 0.9, backpack: true},
          {t: 3.0, expr: 'determined'},
        ]),
      ],
      lines: [MARC('Что я ещё *не знаю*?..', {at: 0.4, note: 'глухо'}), N('Ответ — в архиве *прошлых попыток*.', {gap: 0.5})],
      sfx: [{t: 0.2, name: 'heartbeat', vol: 0.6}],
    },
    /* 4. Архив попыток. */
    {
      id: 's04',
      loc: {id: 'lab'},
      cam: {from: {x: 540, y: 1000, zoom: 1.15}, to: {x: 540, y: 980, zoom: 1.2}},
      fx: {vignette: 0.7, scan: true},
      actors: [A('marc', 'marc', [{t: 0, x: 220, y: 1360, scale: 1.2, pose: 'reach', expr: 'suspicious', look: 0.9, backpack: true}])],
      inserts: [
        {
          type: 'versions',
          at: 0.3,
          dur: 8.0,
          y: 600,
          scale: 0.92,
          cols: 3,
          dim: 0.4,
          tiles: [
            {label: 'МАРК ВЕЙЛ · ВЕРСИЯ 01', status: 'НЕУДАЧНАЯ ВЕРСИЯ', char: 'marc'},
            {label: 'МАРК ВЕЙЛ · ВЕРСИЯ 02', status: 'НЕУДАЧНАЯ ВЕРСИЯ', char: 'marc'},
            {label: 'МАРК ВЕЙЛ · ВЕРСИЯ 03', status: 'НЕУДАЧНАЯ ВЕРСИЯ', char: 'marc'},
            {label: 'МАРК ВЕЙЛ · ВЕРСИЯ 04', status: 'НЕУДАЧНАЯ ВЕРСИЯ', char: 'marc'},
            {label: 'МАРК ВЕЙЛ · ВЕРСИЯ 05', status: 'НЕУДАЧНАЯ ВЕРСИЯ', char: 'marc'},
            {label: 'МАРК ВЕЙЛ · ВЕРСИЯ 48', status: 'ДАТА: ЗАВТРА', char: 'marc', color: '#ff3b3b'},
          ],
          pickAt: 4.6,
        },
      ],
      lines: [N('Архив прошлых попыток. Десятки записей с *одним* именем.', {at: 0.4}), N('Все — «неудачная версия».', {gap: 0.3})],
      sfx: [{t: 0.3, name: 'beep', vol: 0.5}],
    },
    /* 5. Завтрашняя дата — поворот. */
    {
      id: 's05',
      loc: {id: 'lab'},
      dur: 6.4,
      cam: {from: {x: 540, y: 960, zoom: 1.2}, to: {x: 500, y: 880, zoom: 2.4}, ease: 'in'},
      fx: {vignette: 0.8, scan: true, alarm: true, glitchAt: [0.3, 3.0], flashAt: [5.2]},
      actors: [
        A('marc', 'marc', [
          {t: 0, x: 500, y: 1360, scale: 1.3, pose: 'shock', expr: 'shocked', look: 0.9, backpack: true},
        ]),
      ],
      inserts: [{type: 'bigtext', at: 0.4, dur: 4.4, text: 'ПОСЛЕДНЯЯ\nЗАПИСЬ:\nЗАВТРА', color: '#ff3b3b', glitch: true, y: 520, scale: 0.62, dim: 0.5}],
      lines: [MARC('Завтра?.. Но я здесь *сегодня*.', {at: 2.4, dur: 2.2})],
      sfx: [{t: 0.4, name: 'impact', vol: 0.9}, {t: 0.3, name: 'alarm', vol: 0.4}, {t: 5.2, name: 'stinger', vol: 1}],
    },
  ],
};
