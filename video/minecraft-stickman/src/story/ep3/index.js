// Episode 3: "I Survived 100 Days on ONE BLOCK in Minecraft... But It Could Talk"
import { buildSky } from './stages.js';
import cold from '../../scenes/ep3/cold.js';
import s1 from '../../scenes/ep3/s1_oneblock.js';
import s2 from '../../scenes/ep3/s2_days.js';
import s3 from '../../scenes/ep3/s3_speaks.js';
import s4 from '../../scenes/ep3/s4_friends.js';
import s5 from '../../scenes/ep3/s5_nether.js';
import s6 from '../../scenes/ep3/s6_sign.js';
import s7 from '../../scenes/ep3/s7_end.js';
import s8 from '../../scenes/ep3/s8_plant.js';
import s9 from '../../scenes/ep3/s9_day100.js';
export const buildStages = () => ({ sky: buildSky() });
export const scenes = { cold, s1, s2, s3, s4, s5, s6, s7, s8, s9 };
