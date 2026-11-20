// YouTube thumbnails (1280x720) rendered with the animation engine: custom camera + bold text overlay.
//   node tools/thumbnail.js   -> build/thumbnail_A.jpg, _B.jpg, _C.jpg
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module'; import { execFileSync } from 'node:child_process';
import { startServer, ROOT } from './server.js';

const SPECS = [
  { name: 'A', scene: 's7', t: 34.6, cam: { pos: [1.55, 20.0, 2.45], look: [0.6, 20.55, -0.6], fov: 52 },
    post: { saturation: 1.25, contrast: 1.12, vignette: 0.9 },
    text: [{ s: "DON'T", x: 1580, y: 270, size: 170, fill: '#ffffff' }, { s: 'TURN', x: 1580, y: 450, size: 170, fill: '#ffffff' }, { s: 'AROUND', x: 1555, y: 630, size: 136, fill: '#ff2b2b' }],
    arrow: { from: [1420, 700], to: [1130, 470] }, circle: { x: 0, y: 0, r: 130, track: [0.5, 21.7, -1.8] } },
  { name: 'B', scene: 's6', t: 24.9, cam: { pos: [2.3, 31.55, 21.5], look: [-0.4, 32.6, 27.0], fov: 58 },
    post: { saturation: 1.2, contrast: 1.15, vignette: 0.7, brightness: 0.06 },
    text: [{ s: 'MINECRAFT IS', x: 960, y: 880, size: 120, fill: '#ffffff' }, { s: 'DELETING ME', x: 960, y: 1010, size: 130, fill: '#ff2b2b' }] },
  { name: 'C', scene: 's5', t: 44.2, cam: { pos: [9.6, 22.1, -3.6], look: [8.0, 25.2, 5.0], fov: 64 },
    post: { saturation: 1.3, contrast: 1.15, vignette: 0.8, glitch: 0.15, rgb: 0.6 },
    text: [{ s: '100 DAYS...', x: 960, y: 180, size: 150, fill: '#ffffff' }, { s: 'SOMETHING WAS WRONG', x: 960, y: 1000, size: 108, fill: '#ffd23a' }] },
];

const { chromium } = createRequire(import.meta.url)('playwright');
const srv = await startServer(0);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`http://127.0.0.1:${srv.address().port}/?render`);
await page.waitForFunction(() => window.ready || window.bootError, null, { timeout: 300000 });
for (const spec of SPECS) {
  const data = await page.evaluate((sp) => {
    const m = window.mgr; const sc = m.scenes[sp.scene];
    const res = sc.update(sp.t, {}); const st = res.stage;
    m.cam.apply({ ...sp.cam, t: sp.t, handheld: 0, shake: 0 });
    st.particles.update(sp.t, 1080); st.glowParticles.update(sp.t, 1080);
    m.post.render(st.scene, m.cam.camera, { ...(res.post || {}), letterbox: 0, fade: 0, flash: 0, zoomBlur: 0, ...sp.post }, sp.t);
    const c = m.ctx; c.clearRect(0, 0, 1920, 1080); c.drawImage(m.renderer.domElement, 0, 0);
    // dark gradient behind text for readability
    const g = c.createLinearGradient(0, 0, 1920, 0);
    if (sp.name === 'A') { g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); c.fillStyle = g; c.fillRect(0, 0, 1920, 1080); }
    else { const v = c.createLinearGradient(0, 0, 0, 1080); v.addColorStop(0, 'rgba(0,0,0,0.45)'); v.addColorStop(0.3, 'rgba(0,0,0,0)'); v.addColorStop(0.7, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); c.fillStyle = v; c.fillRect(0, 0, 1920, 1080); }
    if (sp.circle && sp.circle.track) { const v = new m.cam.camera.position.constructor(...sp.circle.track).project(m.cam.camera); sp.circle.x = (v.x + 1) / 2 * 1920; sp.circle.y = (1 - v.y) / 2 * 1080; }
    if (sp.circle) { c.save(); c.strokeStyle = '#ff2020'; c.lineWidth = 16; c.shadowColor = '#000'; c.shadowBlur = 10; c.beginPath(); c.arc(sp.circle.x, sp.circle.y, sp.circle.r, 0, Math.PI * 2); c.stroke(); c.restore(); }
    if (sp.arrow) { const [x0, y0] = sp.arrow.from, [x1, y1] = sp.arrow.to; const a = Math.atan2(y1 - y0, x1 - x0);
      c.save(); c.strokeStyle = '#ff2020'; c.fillStyle = '#ff2020'; c.lineWidth = 26; c.lineCap = 'round'; c.shadowColor = '#000'; c.shadowBlur = 12;
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * 60, y1 - Math.sin(a) * 60); c.stroke();
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - Math.cos(a - 0.5) * 100, y1 - Math.sin(a - 0.5) * 100); c.lineTo(x1 - Math.cos(a + 0.5) * 100, y1 - Math.sin(a + 0.5) * 100); c.closePath(); c.fill(); c.restore(); }
    for (const t of sp.text) {
      c.save(); c.font = `900 ${t.size}px Montserrat`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
      c.lineWidth = t.size * 0.2; c.strokeStyle = '#000'; c.shadowColor = 'rgba(0,0,0,0.8)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.strokeText(t.s, t.x, t.y);
      c.shadowColor = 'transparent'; c.fillStyle = t.fill; c.fillText(t.s, t.x, t.y); c.restore();
    }
    return m.output.toDataURL('image/png');
  }, spec);
  const png = path.join(ROOT, `build/thumb_${spec.name}.png`); fs.writeFileSync(png, Buffer.from(data.split(',')[1], 'base64'));
  const jpg = path.join(ROOT, `build/thumbnail_${spec.name}.jpg`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-vf', 'scale=1280:720:flags=lanczos', '-q:v', '2', jpg]); fs.unlinkSync(png);
  console.log('wrote', path.relative(ROOT, jpg));
}
await browser.close(); srv.close();
