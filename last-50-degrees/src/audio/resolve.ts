import {staticFile} from 'remotion';
import available from './available.json';

/**
 * Список реально существующих аудиофайлов. Файл src/audio/available.json генерирует
 * scripts/check-assets.mjs (запускается автоматически перед studio/render) — так композиция
 * никогда не ссылается на несуществующий файл.
 */
type Avail = {sfx: Record<string, string>; music: Record<string, string>; voice: Record<string, string>};
const A = available as Avail;

const url = (p: string | undefined) => (p ? staticFile(p) : null);
export const sfxUrl = (name: string) => url(A.sfx[name]);
export const musicUrl = (name: string) => url(A.music[name]);
export const voiceUrl = (lineId: string) => url(A.voice[lineId]);
