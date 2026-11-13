import type {Actor, ActorKey, CharId, Line, Speaker} from '../types';

/** Персонаж с ключевыми кадрами. */
export const A = (id: string, char: CharId, keys: ActorKey[], front = false): Actor => ({id, char, keys, front});

/** Реплика. */
export const L = (speaker: Speaker, text: string, o: Partial<Line> = {}): Line => ({speaker, text, ...o});

/** Шорткаты для озвучки: рассказчик, Марк, Терра… */
export const N = (text: string, o: Partial<Line> = {}) => L('narrator', text, o);
export const MARC = (text: string, o: Partial<Line> = {}) => L('marc', text, o);
export const LINA = (text: string, o: Partial<Line> = {}) => L('lina', text, o);
export const TERRA = (text: string, o: Partial<Line> = {}) => L('terra', text, o);
export const RADIO = (text: string, o: Partial<Line> = {}) => L('radio', text, o);

/** Скорость обычной ходьбы персонажа в пикселях/сек при scale≈1.3 (чтобы ноги не скользили). */
export const WALK_SPEED = 140;
/** Время, нужное чтобы пройти dx пикселей. */
export const walkTime = (dx: number) => Math.abs(dx) / WALK_SPEED;
