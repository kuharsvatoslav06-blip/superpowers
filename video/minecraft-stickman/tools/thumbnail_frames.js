// YouTube thumbnails (1280x720) for episodes 2 and 3: a frame rendered by the engine (no subtitles, optional custom camera)
// with a bold text overlay.   EP=2 node tools/thumbnail_frames.js  -> build/ep2/thumbnail_A.jpg, _B.jpg, _C.jpg
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { execFileSync } from 'node:child_process';
import { startServer, ROOT } from './server.js';
import { EP, BUILD, QUERY } from './paths.js';

const ALL = {
  2: [
    // the Watcher's face fills the frame
    { name: 'A', t: 364.5, grade: 'right',
      text: [{ s: 'IT', x: 1560, y: 300, size: 190, fill: '#ffffff' }, { s: 'REMEMBERS', x: 1500, y: 480, size: 120, fill: '#ffffff' }, { s: 'ME', x: 1560, y: 690, size: 210, fill: '#d040ff' }] },
    // Player 47 with the sign "I STOPPED AT 99. FOREVER."
    { name: 'B', t: 395, grade: 'left',
      text: [{ s: 'HE', x: 290, y: 360, size: 150, fill: '#ffffff' }, { s: 'NEVER', x: 290, y: 530, size: 150, fill: '#ffffff' }, { s: 'LEFT', x: 290, y: 700, size: 150, fill: '#ff2b2b' }] },
    // holding the snow globe with his old world inside; Player 47: "DON'T OPEN IT."
    { name: 'C', t: 341, grade: 'bottom',
      text: [{ s: 'MINECRAFT KEPT', x: 960, y: 880, size: 120, fill: '#ffffff' }, { s: 'MY OLD WORLD', x: 960, y: 1010, size: 130, fill: '#ffd23a' }] },
  ],
  3: [
    // Origin's face and the terrified hero
    { name: 'A', t: 120.7, cam: { pos: [2.7, 62.5, -0.6], look: [0.9, 62.0, 2.3], fov: 56 }, grade: 'top',
      text: [{ s: 'MY BLOCK', x: 960, y: 150, size: 130, fill: '#ffffff' }, { s: 'CAN TALK', x: 960, y: 290, size: 140, fill: '#6dff4a' }] },
    // falling off the world under the nether island
    { name: 'B', t: 204.0, grade: 'bottom', post: { brightness: 0.08 },
      text: [{ s: 'I FELL OFF', x: 960, y: 880, size: 130, fill: '#ffffff' }, { s: 'THE WORLD', x: 960, y: 1015, size: 140, fill: '#ffd23a' }] },
    // the lone block in the sky
    { name: 'C', t: 19.6, cam: { pos: [5.2, 62.9, 7.4], look: [0.5, 62.5, 0.5], fov: 38 }, grade: 'top',
      text: [{ s: '100 DAYS', x: 960, y: 170, size: 150, fill: '#ffffff' }, { s: 'ON 1 BLOCK', x: 960, y: 320, size: 130, fill: '#6dff4a' }] },
  ],
};
const SPECS = ALL[EP]; if (!SPECS) { console.error('no thumbnail specs for episode', EP); process.exit(1); }

const { chromium } = createRequire(import.meta.url)('playwright');
const srv = await startServer(0);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`http://127.0.0.1:${srv.address().port}/${QUERY}`);
await page.waitForFunction(() => window.ready || window.bootError, null, { timeout: 600000 });
for (const spec of SPECS) {
  const data = await page.evaluate((sp) => {
    const m = window.mgr; const { s, lt } = m.timeline.locate(sp.t);
    const res = s.impl.update(lt, { t: sp.t, cam: m.cam }) || {}; const st = res.stage;
    if (sp.cam) m.cam.apply({ ...sp.cam, t: lt, handheld: 0, shake: 0 });
    st.particles.update(lt, 1080); st.glowParticles.update(lt, 1080);
    m.post.render(st.scene, m.cam.camera, { ...(res.post || {}), letterbox: 0, fade: 0, flash: 0, zoomBlur: 0, saturation: 1.22, contrast: 1.1, ...(sp.post || {}) }, sp.t);
    const c = m.ctx; c.clearRect(0, 0, 1920, 1080); c.filter = 'brightness(1.06)'; c.drawImage(m.renderer.domElement, 0, 0); c.filter = 'none';
    let g;
    if (sp.grade === 'right' || sp.grade === 'left') { g = c.createLinearGradient(0, 0, 1920, 0); if (sp.grade === 'left') { g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(0.4, 'rgba(0,0,0,0)'); } else { g.addColorStop(0.45, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); } }
    else { g = c.createLinearGradient(0, 0, 0, 1080); const top = sp.grade === 'top'; g.addColorStop(0, `rgba(0,0,0,${top ? 0.6 : 0.2})`); g.addColorStop(0.35, 'rgba(0,0,0,0)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${top ? 0.2 : 0.65})`); }
    c.fillStyle = g; c.fillRect(0, 0, 1920, 1080);
    for (const t of sp.text) {
      c.save(); c.font = `900 ${t.size}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
      c.lineWidth = t.size * 0.2; c.strokeStyle = '#000'; c.shadowColor = 'rgba(0,0,0,0.8)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.strokeText(t.s, t.x, t.y);
      c.shadowColor = 'transparent'; c.fillStyle = t.fill; c.fillText(t.s, t.x, t.y); c.restore();
    }
    return m.output.toDataURL('image/png');
  }, spec);
  const png = path.join(BUILD, `thumb_${spec.name}.png`); fs.writeFileSync(png, Buffer.from(data.split(',')[1], 'base64'));
  const jpg = path.join(BUILD, `thumbnail_${spec.name}.jpg`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-vf', 'scale=1280:720:flags=lanczos', '-q:v', '2', jpg]); fs.unlinkSync(png);
  console.log('wrote', path.relative(ROOT, jpg));
}
await browser.close(); srv.close();
