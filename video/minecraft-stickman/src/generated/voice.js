// Router: voice line durations of the current episode (written by tools/tts.js).
import { EP } from '../story/episode.js';
let m; try { m = await import(`./voice_ep${EP}.js`); } catch { m = { default: {} }; }
export default m.default;
