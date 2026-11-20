// Entry point: builds stages + scenes, exposes window.frame(t) for the offline renderer and runs the preview player.
import { SceneManager } from './engine/SceneManager.js';
import { AudioManager } from './engine/AudioManager.js';
import { SCENES, DURATION, EP } from './story/script.js';
const episode = await import(`./story/ep${EP}/index.js`);

const params = new URLSearchParams(location.search);
const renderMode = params.has('render');
if (renderMode) document.body.classList.add('render');

async function boot() {
  await Promise.all(['800 20px Montserrat', '900 20px Montserrat', 'italic 700 20px Montserrat', '400 20px Silkscreen', '700 20px Silkscreen', '400 20px VT323'].map(f => document.fonts.load(f)));
  const stages = episode.buildStages();
  const mgr = new SceneManager({ canvas: document.getElementById('gl'), output: document.getElementById('out'), stages, sceneFactories: episode.scenes });
  window.mgr = mgr;
  window.DURATION = DURATION;
  window.frame = (t, quality = 0.92) => { mgr.frame(t); return mgr.output.toDataURL('image/jpeg', quality); };
  window.renderOnly = t => mgr.frame(t);
  window.collectCues = () => mgr.cues();
  // warm up shaders for every stage so the first real frames are not slow
  for (const s of SCENES) mgr.frame(s.start + 0.5);
  mgr.frame(0);
  if (!renderMode) player(mgr);
  window.ready = true;
}

function player(mgr) {
  const audio = new AudioManager(EP === '1' ? '/build/soundtrack.wav' : `/build/ep${EP}/soundtrack.wav`);
  const $ = id => document.getElementById(id);
  const fmt = t => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
  for (const s of SCENES) { const o = document.createElement('option'); o.value = s.start; o.textContent = `${fmt(s.start)}  ${s.name}`; $('jump').appendChild(o); }
  let playing = false, t = 0, t0 = 0, wall = 0;
  const show = () => { mgr.frame(t); $('seek').value = t / DURATION; $('time').textContent = `${fmt(t)} / ${fmt(DURATION)}`; };
  const loop = () => {
    if (!playing) return;
    t = audio.ok ? audio.time : t0 + (performance.now() - wall) / 1000;
    if (t >= DURATION) { playing = false; $('play').textContent = '▶ Play'; t = DURATION - 0.01; }
    show(); requestAnimationFrame(loop);
  };
  $('play').onclick = () => { playing = !playing; $('play').textContent = playing ? '❚❚ Pause' : '▶ Play'; if (playing) { t0 = t; wall = performance.now(); audio.play(t); loop(); } else audio.pause(); };
  $('seek').oninput = e => { t = +e.target.value * DURATION; t0 = t; wall = performance.now(); audio.seek(t); if (!playing) show(); };
  $('jump').onchange = e => { t = +e.target.value + 0.01; t0 = t; wall = performance.now(); audio.seek(t); show(); };
  $('subs').onchange = e => { mgr.showSubtitles = e.target.checked; show(); };
  $('status').textContent = 'ready' + (audio.ok ? '' : ' (run "npm run audio" for sound)');
  setTimeout(() => { if (audio.ok) $('status').textContent = 'ready — audio loaded'; }, 1500);
  show();
}

boot().catch(e => { console.error(e); document.getElementById('status').textContent = 'ERROR: ' + e.message; window.bootError = e.message + '\n' + e.stack; });
