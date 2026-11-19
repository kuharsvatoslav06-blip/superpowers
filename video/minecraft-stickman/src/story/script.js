// StoryTimeline data: the whole video as plain data (no rendering imports), shared by the
// browser renderer and the Node audio/TTS tools. Times inside a scene are LOCAL seconds.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TITLE = 'I Survived 100 Days in Minecraft, But Something Was Wrong';

// transition: how this scene is entered.  type: cut | fade | flash | blocks | glitch | warp
export const SCENES = [
  { id: 'cold', name: 'Cold open (hook)', dur: 7.0, transition: { type: 'cut' } },
  { id: 's1', name: 'Spawn', dur: 36.0, transition: { type: 'flash', dur: 0.9 } },
  { id: 's2', name: 'Something Is Watching', dur: 53.0, transition: { type: 'blocks', dur: 1.0 } },
  { id: 's3', name: 'The Mines', dur: 70.0, transition: { type: 'fade', dur: 1.2 } },
  { id: 's4', name: 'The Secret Room', dur: 60.0, transition: { type: 'blocks', dur: 1.0 } },
  { id: 's5', name: 'World Collapse', dur: 70.0, transition: { type: 'glitch', dur: 0.8 } },
  { id: 's6', name: 'The Void', dur: 38.5, transition: { type: 'warp', dur: 1.6 } },
  { id: 's7', name: 'The Twist', dur: 45.0, transition: { type: 'flash', dur: 2.4 } },
];
let acc = 0; for (const s of SCENES) { s.start = acc; acc += s.dur; }
export const DURATION = acc;
export const sceneById = Object.fromEntries(SCENES.map(s => [s.id, s]));
export const G = (scene, t) => sceneById[scene].start + t;

// who: hero (the stickman) | entity (distorted voice). kind: nar (narration), dia (dialogue), read, whisper
// *word* = highlighted in the subtitle.
export const LINES = [
  { id: 'c1', scene: 'cold', t: 0.25, who: 'hero', kind: 'nar', text: 'Everyone says Minecraft is *relaxing*.' },
  { id: 'c2', scene: 'cold', t: 2.55, who: 'hero', kind: 'nar', text: 'Nobody warned me about *this*.' },

  { id: 's1a', scene: 's1', t: 0.9, who: 'hero', kind: 'nar', text: '*Day one.* A brand-new Minecraft world.' },
  { id: 's1b', scene: 's1', t: 4.1, who: 'hero', kind: 'nar', text: 'No tools, no shelter, and absolutely *no idea* what I\'m doing.' },
  { id: 's1c', scene: 's1', t: 11.0, who: 'hero', kind: 'dia', text: 'Ow. Also... why is the tree *floating?*' },
  { id: 's1d', scene: 's1', t: 19.2, who: 'hero', kind: 'dia', text: 'Nailed it.' },
  { id: 's1e', scene: 's1', t: 23.0, who: 'hero', kind: 'dia', text: 'Huh. The sun\'s... *not moving.*' },
  { id: 's1f', scene: 's1', t: 26.3, who: 'hero', kind: 'dia', text: 'That can\'t be right.' },
  { id: 's1g', scene: 's1', t: 32.2, who: 'hero', kind: 'dia', text: 'Okay. *Shelter.* Shelter would be good.' },

  { id: 's2a', scene: 's2', t: 0.5, who: 'hero', kind: 'nar', text: 'Rule number one: *never* stay outside at night.' },
  { id: 's2b', scene: 's2', t: 9.6, who: 'hero', kind: 'dia', text: 'Okay. Bed. Skip the night. *Easy.*' },
  { id: 's2c', scene: 's2', t: 15.7, who: 'hero', kind: 'dia', text: 'Oh, come *on.*' },
  { id: 's2d', scene: 's2', t: 26.6, who: 'hero', kind: 'dia', text: '*Nope.*' },
  { id: 's2e', scene: 's2', t: 31.9, who: 'hero', kind: 'whisper', text: 'Who *knocks* in Minecraft?' },
  { id: 's2f', scene: 's2', t: 44.0, who: 'hero', kind: 'dia', text: 'Well... that\'s *exactly* where I\'m going.' },
  { id: 's2g', scene: 's2', t: 48.6, who: 'hero', kind: 'nar', text: 'Because apparently, I have *zero* survival instincts.' },

  { id: 's3a', scene: 's3', t: 0.6, who: 'hero', kind: 'nar', text: '*Day two.* Probably. The sun never came back.' },
  { id: 's3b', scene: 's3', t: 4.3, who: 'hero', kind: 'nar', text: 'I needed *iron*. Iron means armor. Armor means fewer embarrassing deaths.' },
  { id: 's3c', scene: 's3', t: 16.9, who: 'hero', kind: 'dia', text: '*Iron!* Finally!' },
  { id: 's3d', scene: 's3', t: 26.3, who: 'hero', kind: 'dia', text: 'I *definitely* placed those torches.' },
  { id: 's3e', scene: 's3', t: 45.7, who: 'hero', kind: 'whisper', text: 'Hello?' },
  { id: 's3f', scene: 's3', t: 50.6, who: 'hero', kind: 'whisper', text: 'Hey... buddy? You *lost?*' },
  { id: 's3g', scene: 's3', t: 66.0, who: 'hero', kind: 'dia', text: 'Sure. Secret tunnel. *Totally* fine.' },

  { id: 's4a', scene: 's4', t: 1.0, who: 'hero', kind: 'nar', text: 'Someone *built* this room. Someone who knew I\'d come.' },
  { id: 's4b', scene: 's4', t: 15.6, who: 'hero', kind: 'dia', text: 'A *diamond* pickaxe? On day *two?!*' },
  { id: 's4c', scene: 's4', t: 19.2, who: 'hero', kind: 'dia', text: 'Okay. This is either a gift... or a *trap*.' },
  { id: 's4d', scene: 's4', t: 24.6, who: 'hero', kind: 'read', text: '"If you\'re reading this... the world has already *noticed you*."' },
  { id: 's4e', scene: 's4', t: 46.3, who: 'hero', kind: 'dia', text: 'Nope. Nope, nope, *nope.*' },
  { id: 's4f', scene: 's4', t: 49.6, who: 'hero', kind: 'dia', text: 'Why is there a *red dot*... and why is it *moving?*' },

  { id: 's5a', scene: 's5', t: 1.0, who: 'hero', kind: 'nar', text: 'I made it out. But the world... the world was *breaking*.' },
  { id: 's5b', scene: 's5', t: 15.9, who: 'hero', kind: 'dia', text: 'Water does *not* do that.' },
  { id: 's5c', scene: 's5', t: 24.6, who: 'hero', kind: 'dia', text: 'Nope. Not dealing with *flying pigs* today.' },
  { id: 's5d', scene: 's5', t: 43.6, who: 'hero', kind: 'dia', text: 'My *house!* I built that! ...Badly, but still!' },
  { id: 's5e', scene: 's5', t: 53.2, who: 'hero', kind: 'whisper', text: 'Not the first... *what?*' },
  { id: 's5f', scene: 's5', t: 65.2, who: 'hero', kind: 'dia', text: 'A portal. Of course. *Why not.*' },

  { id: 's6a', scene: 's6', t: 1.8, who: 'hero', kind: 'nar', text: 'That wasn\'t the Nether. That wasn\'t... *anything.*' },
  { id: 's6b', scene: 's6', t: 18.6, who: 'hero', kind: 'dia', text: 'Okay. Giant computer in the void. *Totally* normal.' },
  { id: 's6c', scene: 's6', t: 28.6, who: 'hero', kind: 'dia', text: 'Why can\'t I *hit* it?!' },
  { id: 's6d', scene: 's6', t: 32.0, who: 'hero', kind: 'dia', text: '*Reset world?!*' },

  { id: 's7a', scene: 's7', t: 10.2, who: 'hero', kind: 'dia', text: 'Finally. A *normal* Minecraft world.' },
  { id: 's7b', scene: 's7', t: 15.4, who: 'hero', kind: 'whisper', text: 'Wait.' },
  { id: 's7c', scene: 's7', t: 24.6, who: 'entity', kind: 'entity', text: 'You reset the world. You didn\'t reset *me.*' },
];

// Music: mood segments (local times). Gaps are deliberate silence.
export const MUSIC = [
  { scene: 'cold', t: 0, end: 4.3, mood: 'glitch', gain: 0.55, fin: 0.01, fout: 0.15 },
  { scene: 'cold', t: 4.4, end: 7.0, mood: 'drone', gain: 0.6, fin: 0.01, fout: 0.4 },
  { scene: 's1', t: 0.3, end: 28.3, mood: 'calm', gain: 0.5, fin: 1.5, fout: 0.05 },
  { scene: 's1', t: 29.2, end: 36.0, mood: 'night', gain: 0.4, fin: 2.0, fout: 0.8 },
  { scene: 's2', t: 0.0, end: 8.8, mood: 'build', gain: 0.5, fin: 0.3, fout: 0.8 },
  { scene: 's2', t: 8.8, end: 17.5, mood: 'night', gain: 0.38, fin: 1.0, fout: 1.0 },
  { scene: 's2', t: 17.5, end: 26.1, mood: 'tense', gain: 0.5, fin: 2.0, fout: 0.05 },
  { scene: 's2', t: 46.5, end: 53.0, mood: 'night', gain: 0.38, fin: 1.5, fout: 1.0 },
  { scene: 's3', t: 0.0, end: 27.5, mood: 'cave', gain: 0.45, fin: 1.5, fout: 1.5 },
  { scene: 's3', t: 36.0, end: 44.25, mood: 'chase', gain: 0.6, fin: 0.05, fout: 0.03 },
  { scene: 's3', t: 48.5, end: 61.0, mood: 'drone', gain: 0.5, fin: 2.0, fout: 0.3 },
  { scene: 's3', t: 61.0, end: 70.0, mood: 'cave', gain: 0.4, fin: 2.0, fout: 1.0 },
  { scene: 's4', t: 0.0, end: 30.5, mood: 'mystery', gain: 0.45, fin: 1.0, fout: 2.0 },
  { scene: 's4', t: 31.0, end: 45.4, mood: 'drone', gain: 0.5, fin: 3.0, fout: 0.05 },
  { scene: 's4', t: 47.4, end: 53.0, mood: 'tense', gain: 0.45, fin: 0.5, fout: 0.2 },
  { scene: 's4', t: 53.0, end: 60.0, mood: 'chase', gain: 0.6, fin: 0.05, fout: 0.3 },
  { scene: 's5', t: 0.0, end: 42.0, mood: 'glitchAction', gain: 0.55, fin: 0.1, fout: 1.5 },
  { scene: 's5', t: 42.0, end: 50.5, mood: 'sad', gain: 0.45, fin: 1.0, fout: 0.3 },
  { scene: 's5', t: 51.0, end: 70.0, mood: 'drone', gain: 0.5, fin: 0.5, fout: 0.6 },
  { scene: 's6', t: 0.0, end: 24.0, mood: 'void', gain: 0.5, fin: 1.0, fout: 0.3 },
  { scene: 's6', t: 24.0, end: 35.55, mood: 'countdown', gain: 0.55, fin: 0.05, fout: 0.02 },
  { scene: 's7', t: 2.0, end: 14.8, mood: 'calm', gain: 0.45, fin: 3.0, fout: 0.4 },
  { scene: 's7', t: 17.0, end: 34.9, mood: 'drone', gain: 0.5, fin: 3.0, fout: 0.02 },
  { scene: 's7', t: 37.5, end: 45.0, mood: 'end', gain: 0.6, fin: 0.01, fout: 2.5 },
];

// Ambience beds (local times)
export const AMBIENCE = [
  { scene: 's1', t: 0, end: 28.3, kind: 'day', gain: 0.35 },
  { scene: 's1', t: 28.3, end: 36, kind: 'night', gain: 0.4 },
  { scene: 's2', t: 0, end: 53, kind: 'night', gain: 0.4 },
  { scene: 's3', t: 0, end: 8.4, kind: 'night', gain: 0.35 },
  { scene: 's3', t: 8.4, end: 70, kind: 'cave', gain: 0.5 },
  { scene: 's4', t: 0, end: 60, kind: 'cave', gain: 0.45 },
  { scene: 's5', t: 0, end: 70, kind: 'wind', gain: 0.4 },
  { scene: 's6', t: 0, end: 35.6, kind: 'void', gain: 0.45 },
  { scene: 's7', t: 0.5, end: 15, kind: 'day', gain: 0.45 },
  { scene: 's7', t: 15, end: 34.9, kind: 'day', gain: 0.18 },
];

// Screen overlays (UI). Drawn by SubtitleSystem.
export const OVERLAYS = [
  { scene: 'cold', t: 4.4, end: 7.0, type: 'title' },
  { scene: 's1', t: 0.9, end: 4.0, type: 'chapter', text: 'DAY 1', sub: 'SPAWN' },
  { scene: 's1', t: 10.7, end: 12.4, type: 'pickup', text: '+1 OAK LOG', icon: 'log' },
  { scene: 's1', t: 13.6, end: 15.4, type: 'montage', text: 'x4' },
  { scene: 's1', t: 15.5, end: 18.9, type: 'craft' },
  { scene: 's1', t: 21.8, end: 23.0, type: 'pickup', text: '+1 WOODEN PICKAXE', icon: 'woodPickaxe' },
  { scene: 's1', t: 25.7, end: 28.25, type: 'watch' },
  { scene: 's1', t: 28.9, end: 32.4, type: 'dayStamp', text: 'DAY 1 — 11:59 PM' },
  { scene: 's2', t: 0.4, end: 8.6, type: 'tag', text: 'SPEED BUILD', sub: 'x8' },
  { scene: 's2', t: 13.8, end: 17.2, type: 'actionBar', text: 'You may not rest now. There are monsters nearby.' },
  { scene: 's3', t: 0.6, end: 3.8, type: 'chapter', text: 'DAY 2', sub: 'THE MINES' },
  { scene: 's3', t: 15.6, end: 17.4, type: 'pickup', text: '+1 RAW IRON', icon: 'iron' },
  { scene: 's4', t: 0.8, end: 3.8, type: 'chapter', text: 'DAY 2', sub: 'THE SECRET ROOM' },
  { scene: 's4', t: 12.6, end: 22.6, type: 'chest' },
  { scene: 's4', t: 23.0, end: 31.0, type: 'book', page: 'first' },
  { scene: 's4', t: 47.4, end: 53.4, type: 'map' },
  { scene: 's5', t: 0.4, end: 3.6, type: 'chapter', text: 'DAY ???', sub: 'SOMETHING IS WRONG', glitch: true },
  { scene: 's6', t: 0.6, end: 3.6, type: 'chapter', text: 'DAY ∞', sub: 'THE VOID', glitch: true },
  { scene: 's6', t: 26.0, end: 35.55, type: 'countdown', from: 10 },
  { scene: 's7', t: 13.6, end: 21.6, type: 'inventory' },
  { scene: 's7', t: 21.6, end: 29.4, type: 'book', page: 'last' },
  { scene: 's7', t: 37.5, end: 45.0, type: 'theEnd' },
];

export const globalize = arr => arr.map(o => ({ ...o, gt: G(o.scene, o.t), gend: o.end !== undefined ? G(o.scene, o.end) : undefined }));
