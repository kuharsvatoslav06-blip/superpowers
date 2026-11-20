// Per-episode paths for the tools. Select the episode with the EP environment variable (default 1).
import path from 'node:path';
import { ROOT } from './server.js';
export const EP = process.env.EP || '1';
export const BUILD = path.join(ROOT, EP === '1' ? 'build' : `build/ep${EP}`);
export const VOICE_DIR = path.join(ROOT, EP === '1' ? 'voice' : `voice/ep${EP}`);
export const VOICE_MANIFEST = path.join(ROOT, `src/generated/voice_ep${EP}.js`);
export const QUERY = '?render' + (EP === '1' ? '' : `&ep=${EP}`);
