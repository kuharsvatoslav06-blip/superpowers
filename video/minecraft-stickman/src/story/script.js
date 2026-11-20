// Router: re-exports the story data of the current episode (see episode.js).
import { EP } from './episode.js';
const m = await import(`./ep${EP}/script.js`);
export const { FPS, WIDTH, HEIGHT, TITLE, SCENES, DURATION, sceneById, G, LINES, MUSIC, AMBIENCE, OVERLAYS, globalize } = m;
export { EP };
