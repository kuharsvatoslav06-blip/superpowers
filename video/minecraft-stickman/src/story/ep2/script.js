// Episode 2 — "I Survived 100 Days in a Minecraft World That Remembered Me". Times inside a scene are LOCAL seconds.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TITLE = 'I Survived 100 Days in a Minecraft World That Remembered Me';

export const SCENES = [
  { id: 'cold', name: 'Cold open (hook)', dur: 14.5, transition: { type: 'cut' } },
  { id: 's1', name: 'The Copy', dur: 46.0, transition: { type: 'flash', dur: 1.2 } },
  { id: 's2', name: 'Normal Days', dur: 52.0, transition: { type: 'blocks', dur: 1.0 } },
  { id: 's3', name: 'The Frozen Village', dur: 60.0, transition: { type: 'blocks', dur: 1.0 } },
  { id: 's4', name: 'Player Zero', dur: 58.0, transition: { type: 'fade', dur: 1.4 } },
  { id: 's5', name: 'The Way Down', dur: 66.0, transition: { type: 'blocks', dur: 1.0 } },
  { id: 's6', name: 'The Archive', dur: 56.0, transition: { type: 'fade', dur: 1.6 } },
  { id: 's7', name: 'The Watcher Speaks', dur: 56.0, transition: { type: 'glitch', dur: 0.8 } },
  { id: 's8', name: 'The Choice', dur: 36.0, transition: { type: 'cut' } },
  { id: 's9', name: 'Day 100', dur: 44.0, transition: { type: 'flash', dur: 2.6 } },
];
let acc = 0; for (const s of SCENES) { s.start = acc; acc += s.dur; }
export const DURATION = acc;
export const sceneById = Object.fromEntries(SCENES.map(s => [s.id, s]));
export const G = (scene, t) => sceneById[scene].start + t;

export const LINES = [
  { id: 'h0', scene: 'cold', t: 0.3, who: 'hero', kind: 'nar', text: 'Last time, I reset the world. This time... the world reset *me.*' },
  { id: 'h1a', scene: 's1', t: 3.4, who: 'hero', kind: 'nar', text: '*Day one.* Again. Same world. Same tree. Same terrible decisions.' },
  { id: 'h1b', scene: 's1', t: 12.6, who: 'hero', kind: 'dia', text: 'Hey, buddy. Missed you.' },
  { id: 'h1c', scene: 's1', t: 19.6, who: 'hero', kind: 'dia', text: '...*Copy?*' },
  { id: 'h1d', scene: 's1', t: 25.6, who: 'hero', kind: 'dia', text: 'Okay. That\'s not a normal Minecraft thing. That\'s a *lawsuit* thing.' },
  { id: 'h2a', scene: 's2', t: 1.6, who: 'hero', kind: 'nar', text: 'For eleven days, *nothing* happened. And honestly? That was the scariest part.' },
  { id: 'h2b', scene: 's2', t: 31.2, who: 'hero', kind: 'dia', text: 'Cool. Cool cool cool. Stars can *type* now.' },
  { id: 'h2c', scene: 's2', t: 40.4, who: 'hero', kind: 'dia', text: '*Nope.* I learned that one.' },
  { id: 'h3a', scene: 's3', t: 3.2, who: 'hero', kind: 'dia', text: 'People! Finally! Hello! I come in peace and with very *low-quality bread!*' },
  { id: 'h3b', scene: 's3', t: 24.6, who: 'hero', kind: 'dia', text: '...I\'m not *paying* for that.' },
  { id: 'h4a', scene: 's4', t: 2.2, who: 'hero', kind: 'nar', text: '*Day forty-one.* I\'ve started talking to my campfire. It\'s a good listener.' },
  { id: 'h4b', scene: 's4', t: 11.4, who: 'hero', kind: 'dia', text: 'You! You\'re the guy! The *sign guy!* You pointed me at a portal and ruined my life!' },
  { id: 'h5a', scene: 's5', t: 3.0, who: 'hero', kind: 'dia', text: 'Bedrock is *unbreakable.* That\'s like... the one rule.' },
  { id: 'h5b', scene: 's5', t: 51.4, who: 'hero', kind: 'dia', text: 'This is the part where you say something *heroic.*' },
  { id: 'h5c', scene: 's5', t: 56.6, who: 'hero', kind: 'dia', text: '*What?!*' },
  { id: 'h6a', scene: 's6', t: 8.0, who: 'hero', kind: 'nar', text: 'Every world anyone ever deleted... ended up *here.*' },
  { id: 'h6b', scene: 's6', t: 21.4, who: 'hero', kind: 'dia', text: '*Ninety-nine.* So close, buddy.' },
  { id: 'h6c', scene: 's6', t: 34.4, who: 'hero', kind: 'whisper', text: 'My house. I built that. ...Still *badly.*' },
  { id: 'w1', scene: 's7', t: 9.2, who: 'entity', kind: 'entity', text: 'Forty-seven players. Forty-seven worlds. Every one of them tried to reach *a hundred days.*' },
  { id: 'h7a', scene: 's7', t: 18.7, who: 'hero', kind: 'dia', text: 'And... what happens at *a hundred?*' },
  { id: 'w2', scene: 's7', t: 21.7, who: 'entity', kind: 'entity', text: 'I *keep* them.' },
  { id: 'h7b', scene: 's7', t: 33.6, who: 'hero', kind: 'dia', text: 'You were the first. You didn\'t make it to a hundred... *on purpose.*' },
  { id: 'w3', scene: 's7', t: 43.4, who: 'entity', kind: 'entity', text: 'And you, Forty-Seven... are at *ninety-two.*' },
  { id: 'h7c', scene: 's7', t: 51.6, who: 'hero', kind: 'dia', text: 'No, no, no, I\'m not even *doing* anything!' },
  { id: 'h8a', scene: 's8', t: 14.6, who: 'hero', kind: 'dia', text: 'Then *you* go! You\'ve been here forever!' },
  { id: 'h9a', scene: 's9', t: 5.4, who: 'hero', kind: 'dia', text: 'I... did it. I *actually* did it!' },
  { id: 'h9b', scene: 's9', t: 28.6, who: 'hero', kind: 'whisper', text: '...Oh no. I\'m the *sign guy.*' },
];

export const MUSIC = [
  { scene: 'cold', t: 0, end: 8.9, mood: 'glitch', gain: 0.5, fin: 0.01, fout: 0.15 },
  { scene: 'cold', t: 9.0, end: 14.5, mood: 'drone', gain: 0.6, fin: 0.01, fout: 0.5 },
  { scene: 's1', t: 2.5, end: 39.5, mood: 'calm', gain: 0.45, fin: 3.0, fout: 0.6 },
  { scene: 's1', t: 39.6, end: 46.0, mood: 'drone', gain: 0.4, fin: 0.3, fout: 1.0 },
  { scene: 's2', t: 0, end: 19.5, mood: 'build', gain: 0.5, fin: 0.3, fout: 0.6 },
  { scene: 's2', t: 20.0, end: 30.0, mood: 'night', gain: 0.4, fin: 1.5, fout: 0.5 },
  { scene: 's2', t: 44.6, end: 52.0, mood: 'tense', gain: 0.5, fin: 0.05, fout: 1.0 },
  { scene: 's3', t: 0, end: 25.5, mood: 'mystery', gain: 0.4, fin: 1.0, fout: 1.5 },
  { scene: 's3', t: 33.8, end: 54.0, mood: 'chase', gain: 0.6, fin: 0.05, fout: 0.3 },
  { scene: 's4', t: 0, end: 20.0, mood: 'cave', gain: 0.4, fin: 1.5, fout: 1.5 },
  { scene: 's4', t: 20.0, end: 42.0, mood: 'mystery', gain: 0.35, fin: 1.0, fout: 1.0 },
  { scene: 's4', t: 42.0, end: 58.0, mood: 'drone', gain: 0.55, fin: 1.5, fout: 0.8 },
  { scene: 's5', t: 8.0, end: 24.0, mood: 'build', gain: 0.4, fin: 0.5, fout: 0.8 },
  { scene: 's5', t: 24.0, end: 38.0, mood: 'void', gain: 0.45, fin: 1.0, fout: 1.0 },
  { scene: 's5', t: 38.0, end: 50.5, mood: 'glitchAction', gain: 0.55, fin: 0.1, fout: 0.5 },
  { scene: 's5', t: 50.5, end: 58.3, mood: 'tense', gain: 0.45, fin: 0.3, fout: 0.1 },
  { scene: 's6', t: 2.0, end: 26.0, mood: 'void', gain: 0.5, fin: 2.0, fout: 1.5 },
  { scene: 's6', t: 26.0, end: 41.0, mood: 'sad', gain: 0.5, fin: 1.0, fout: 1.0 },
  { scene: 's6', t: 41.0, end: 51.9, mood: 'drone', gain: 0.5, fin: 1.0, fout: 0.05 },
  { scene: 's7', t: 2.0, end: 47.0, mood: 'drone', gain: 0.5, fin: 2.0, fout: 1.0 },
  { scene: 's7', t: 47.0, end: 56.0, mood: 'countdown', gain: 0.5, fin: 0.3, fout: 0.2 },
  { scene: 's8', t: 0, end: 29.9, mood: 'countdown', gain: 0.55, fin: 0.1, fout: 0.05 },
  { scene: 's8', t: 30.4, end: 36.0, mood: 'sad', gain: 0.5, fin: 0.5, fout: 1.0 },
  { scene: 's9', t: 2.0, end: 16.0, mood: 'calm', gain: 0.45, fin: 2.0, fout: 1.5 },
  { scene: 's9', t: 16.0, end: 31.9, mood: 'drone', gain: 0.5, fin: 2.0, fout: 0.05 },
  { scene: 's9', t: 34.5, end: 44.0, mood: 'end', gain: 0.6, fin: 0.01, fout: 2.5 },
];

export const AMBIENCE = [
  { scene: 's1', t: 0.5, end: 46, kind: 'day', gain: 0.4 },
  { scene: 's2', t: 0, end: 20, kind: 'day', gain: 0.35 },
  { scene: 's2', t: 20, end: 52, kind: 'night', gain: 0.4 },
  { scene: 's3', t: 0, end: 26, kind: 'day', gain: 0.35 },
  { scene: 's3', t: 26, end: 60, kind: 'wind', gain: 0.35 },
  { scene: 's4', t: 0, end: 58, kind: 'cave', gain: 0.45 },
  { scene: 's5', t: 0, end: 66, kind: 'cave', gain: 0.45 },
  { scene: 's6', t: 0, end: 56, kind: 'void', gain: 0.4 },
  { scene: 's7', t: 0, end: 56, kind: 'void', gain: 0.4 },
  { scene: 's8', t: 0, end: 36, kind: 'void', gain: 0.35 },
  { scene: 's9', t: 0.5, end: 31.9, kind: 'day', gain: 0.4 },
];

const COUNTER = (scene, t, end, from, to) => ({ scene, t, end, type: 'dayCounter', from, to });
export const OVERLAYS = [
  { scene: 'cold', t: 9.0, end: 14.5, type: 'title', lines: ['I SURVIVED 100 DAYS', 'IN A WORLD THAT', '...REMEMBERED ME'] },
  { scene: 's1', t: 3.2, end: 7.2, type: 'chapter', text: 'DAY 1', sub: 'AGAIN.' },
  { scene: 's1', t: 17.8, end: 19.6, type: 'pickup', text: '+1 OAK LOG (COPY)', icon: 'log' },
  { scene: 's1', t: 20.6, end: 23.5, type: 'inventoryCopy' },
  { scene: 's1', t: 38.6, end: 44.0, type: 'cloudText', text: '47' },
  COUNTER('s2', 0.3, 19.6, 3, 12),
  { scene: 's2', t: 9.8, end: 12.6, type: 'actionBar', text: 'You may rest now. Sweet dreams.' },
  { scene: 's2', t: 15.6, end: 17.4, type: 'pickup', text: '+1 RAW FISH (COPY)', icon: 'fish' },
  { scene: 's2', t: 20.2, end: 23.6, type: 'chapter', text: 'DAY 14', sub: 'NIGHT' },
  { scene: 's2', t: 23.4, end: 31.0, type: 'starText', text: 'I SEE YOU' },
  { scene: 's3', t: 0.6, end: 3.6, type: 'chapter', text: 'DAY 23', sub: 'THE VILLAGE' },
  { scene: 's3', t: 30.6, end: 33.2, type: 'caption', text: 'RUN.', red: true },
  { scene: 's4', t: 0.6, end: 3.6, type: 'chapter', text: 'DAY 41', sub: 'THE CAMPFIRE' },
  { scene: 's4', t: 20.6, end: 22.6, type: 'caption', text: '"WHERE AM I?"' },
  { scene: 's4', t: 25.6, end: 27.6, type: 'caption', text: '"WHY IS EVERYTHING A COPY?"' },
  { scene: 's4', t: 30.6, end: 32.6, type: 'caption', text: '"WHO ARE YOU?"' },
  { scene: 's4', t: 35.6, end: 37.6, type: 'caption', text: '"HOW MANY PLAYERS?"' },
  { scene: 's5', t: 0.4, end: 3.0, type: 'chapter', text: 'DAY 58', sub: 'THE WAY DOWN' },
  { scene: 's5', t: 8.6, end: 10.6, type: 'pickup', text: 'ORIGINAL PICKAXE', icon: 'originalPickaxe' },
  { scene: 's5', t: 11.0, end: 14.0, type: 'layer', text: 'STONE' },
  { scene: 's5', t: 14.0, end: 17.0, type: 'layer', text: 'DEEPSLATE' },
  { scene: 's5', t: 17.0, end: 20.0, type: 'layer', text: 'BEDROCK' },
  { scene: 's5', t: 20.0, end: 23.6, type: 'layer', text: '???', glitch: true },
  { scene: 's6', t: 0.6, end: 3.6, type: 'chapter', text: 'DAY 77', sub: 'THE ARCHIVE' },
  { scene: 's7', t: 0.6, end: 3.6, type: 'chapter', text: 'DAY 92', sub: 'THE WATCHER', glitch: true },
  COUNTER('s7', 47.6, 56.0, 92, 95),
  COUNTER('s8', 0, 29.9, 96, 99),
  { scene: 's8', t: 5.6, end: 10.4, type: 'craftExit' },
  { scene: 's9', t: 3.8, end: 8.6, type: 'achievement', text: 'Survived 100 Days' },
  { scene: 's9', t: 9.2, end: 16.0, type: 'chat', text: 'Player 48 joined the game' },
  { scene: 's9', t: 34.5, end: 44.0, type: 'theEnd', text: 'PLAYER 48 — DAY 1', sub: 'THE END?' },
];

export const globalize = arr => arr.map(o => ({ ...o, gt: G(o.scene, o.t), gend: o.end !== undefined ? G(o.scene, o.end) : undefined }));
