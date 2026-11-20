// Episode 1: "I Survived 100 Days in Minecraft, But Something Was Wrong"
import { buildOverworld, buildCave, buildVoid, buildFresh } from '../stages.js';
import cold from '../../scenes/cold.js';
import s1 from '../../scenes/s1_spawn.js';
import s2 from '../../scenes/s2_watching.js';
import s3 from '../../scenes/s3_mines.js';
import s4 from '../../scenes/s4_secret_room.js';
import s5 from '../../scenes/s5_collapse.js';
import s6 from '../../scenes/s6_void.js';
import s7 from '../../scenes/s7_twist.js';
export const buildStages = () => ({ over: buildOverworld(), cave: buildCave(), void: buildVoid(), fresh: buildFresh() });
export const scenes = { cold, s1, s2, s3, s4, s5, s6, s7 };
