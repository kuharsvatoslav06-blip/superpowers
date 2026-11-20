// Episode 2 YouTube thumbnails (1280x720): a rendered frame from build/ep2/frames + bold text overlay.
//   EP=2 node tools/render.js   (frames must exist)   then   node tools/thumbnail_ep2.js
//   -> build/ep2/thumbnail_A.jpg, _B.jpg, _C.jpg
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { execFileSync } from 'node:child_process';
import { startServer, ROOT } from './server.js';

const SPECS = [
  // the Watcher's face fills the frame
  { name: 'A', t: 364.5, grade: 'right',
    text: [{ s: 'IT', x: 1560, y: 300, size: 190, fill: '#ffffff' }, { s: 'REMEMBERS', x: 1500, y: 480, size: 120, fill: '#ffffff' }, { s: 'ME', x: 1560, y: 690, size: 210, fill: '#d040ff' }] },
  // Player 47 with the sign "I STOPPED AT 99. FOREVER."
  { name: 'B', t: 395, grade: 'left',
    text: [{ s: 'HE', x: 290, y: 360, size: 150, fill: '#ffffff' }, { s: 'NEVER', x: 290, y: 530, size: 150, fill: '#ffffff' }, { s: 'LEFT', x: 290, y: 700, size: 150, fill: '#ff2b2b' }] },
  // holding the snow globe with his old world inside; Player 47: "DON'T OPEN IT."
  { name: 'C', t: 341, grade: 'bottom',
    text: [{ s: 'MINECRAFT KEPT', x: 960, y: 880, size: 120, fill: '#ffffff' }, { s: 'MY OLD WORLD', x: 960, y: 1010, size: 130, fill: '#ffd23a' }] },
];

const { chromium } = createRequire(import.meta.url)('playwright');
const srv = await startServer(0); const base = `http://127.0.0.1:${srv.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`${base}/src/fonts/`).catch(() => {});
await page.setContent(`<style>@font-face { font-family: 'Montserrat'; font-weight: 900; src: url('${base}/src/fonts/montserrat-latin-900-normal.woff2') format('woff2'); }</style><canvas id=c width=1920 height=1080></canvas>`);
await page.evaluate(async () => { await document.fonts.load('900 100px Montserrat'); });
for (const spec of SPECS) {
  const frame = path.join(ROOT, 'build/ep2/frames', `f${String(Math.round(spec.t * 30)).padStart(5, '0')}.jpg`);
  const src = 'data:image/jpeg;base64,' + fs.readFileSync(frame).toString('base64');
  const data = await page.evaluate(async ({ sp, src }) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.getElementById('c').getContext('2d'); c.clearRect(0, 0, 1920, 1080);
    c.filter = 'saturate(1.25) contrast(1.12) brightness(1.08)'; c.drawImage(img, 0, 0, 1920, 1080); c.filter = 'none';
    let g;
    if (sp.grade === 'right' || sp.grade === 'left') { g = c.createLinearGradient(0, 0, 1920, 0); if (sp.grade === 'left') { g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(0.4, 'rgba(0,0,0,0)'); } else { g.addColorStop(0.45, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); } }
    else { g = c.createLinearGradient(0, 0, 0, 1080); const top = sp.grade === 'top'; g.addColorStop(0, `rgba(0,0,0,${top ? 0.6 : 0.2})`); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(0.7, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${top ? 0.2 : 0.65})`); }
    c.fillStyle = g; c.fillRect(0, 0, 1920, 1080);
    if (sp.circle) { c.save(); c.strokeStyle = '#ff2020'; c.lineWidth = 16; c.shadowColor = '#000'; c.shadowBlur = 10; c.beginPath(); c.arc(sp.circle.x, sp.circle.y, sp.circle.r, 0, Math.PI * 2); c.stroke(); c.restore(); }
    for (const t of sp.text) {
      c.save(); c.font = `900 ${t.size}px Montserrat`; c.textAlign = 'center'; c.lineJoin = 'round';
      c.lineWidth = t.size * 0.2; c.strokeStyle = '#000'; c.shadowColor = 'rgba(0,0,0,0.8)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.strokeText(t.s, t.x, t.y);
      c.shadowColor = 'transparent'; c.fillStyle = t.fill; c.fillText(t.s, t.x, t.y); c.restore();
    }
    return document.getElementById('c').toDataURL('image/png');
  }, { sp: spec, src });
  const png = path.join(ROOT, `build/ep2/thumb_${spec.name}.png`); fs.writeFileSync(png, Buffer.from(data.split(',')[1], 'base64'));
  const jpg = path.join(ROOT, `build/ep2/thumbnail_${spec.name}.jpg`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-vf', 'scale=1280:720:flags=lanczos', '-q:v', '2', jpg]); fs.unlinkSync(png);
  console.log('wrote', path.relative(ROOT, jpg));
}
await browser.close(); srv.close();
