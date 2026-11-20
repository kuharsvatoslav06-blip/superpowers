// Episode 2: "I Survived 100 Days in a Minecraft World That Remembered Me"
import { buildOverCopy, buildCaveCamp, buildVillage, buildShaft, buildArchive, buildFresh100 } from './stages.js';
import cold from '../../scenes/ep2/cold.js';
import s1 from '../../scenes/ep2/s1_copy.js';
import s2 from '../../scenes/ep2/s2_days.js';
import s3 from '../../scenes/ep2/s3_village.js';
import s4 from '../../scenes/ep2/s4_zero.js';
import s5 from '../../scenes/ep2/s5_down.js';
import s6 from '../../scenes/ep2/s6_archive.js';
import s7 from '../../scenes/ep2/s7_watcher.js';
import s8 from '../../scenes/ep2/s8_choice.js';
import s9 from '../../scenes/ep2/s9_day100.js';
export const buildStages = () => ({ over: buildOverCopy(), cave: buildCaveCamp(), village: buildVillage(), shaft: buildShaft(), archive: buildArchive(), fresh: buildFresh100() });
export const scenes = { cold, s1, s2, s3, s4, s5, s6, s7, s8, s9 };
