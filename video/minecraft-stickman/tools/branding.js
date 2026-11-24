// YouTube channel art rendered with the animation engine (episode-3 world) plus 2D layout:
//   node tools/branding.js [--name "STICKMAN SURVIVAL"] [--tag "100 DAYS. ONE STICKMAN. SOMETHING IS ALWAYS WRONG."]
//   -> build/branding/banner.png (2560x1440), avatar.png (800x800), watermark.png (150x150), endscreen.png (1920x1080)
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { startServer, ROOT } from './server.js';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const NAME = arg('--name', 'STICKMAN SURVIVAL');
const TAG = arg('--tag', '100 DAYS. ONE STICKMAN. SOMETHING IS ALWAYS WRONG.');
const OUT = path.join(ROOT, 'build/branding'); fs.mkdirSync(OUT, { recursive: true });

// engine shots (episode 3 global times + custom cameras)
const SHOTS = {
  world: { t: 337.5, cam: { pos: [34, 84, 50], look: [-8, 40, -6], fov: 62 } },              // island over the regrown world
  sky: { t: 20.0, cam: { pos: [7.5, 63.6, 9.5], look: [0.5, 62.0, 0.5], fov: 34 } },          // the lone block, day 1
  duo: { t: 162.7, cam: { pos: [1.05, 62.75, -2.1], look: [0.55, 61.95, 1.2], fov: 44 } },     // hero + Origin ("You are the first player...")
};

const { chromium } = createRequire(import.meta.url)('playwright');
const srv = await startServer(0);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`http://127.0.0.1:${srv.address().port}/?render&ep=3`);
await page.waitForFunction(() => window.ready || window.bootError, null, { timeout: 600000 });
const shots = {};
for (const [k, sp] of Object.entries(SHOTS)) {
  shots[k] = await page.evaluate((sp) => {
    const m = window.mgr; const { s, lt } = m.timeline.locate(sp.t);
    const res = s.impl.update(lt, { t: sp.t, cam: m.cam }) || {}; const st = res.stage;
    m.cam.apply({ ...sp.cam, t: lt, handheld: 0, shake: 0 });
    st.particles.update(lt, 1080); st.glowParticles.update(lt, 1080);
    m.post.render(st.scene, m.cam.camera, { ...(res.post || {}), letterbox: 0, fade: 0, flash: 0, zoomBlur: 0, vignette: 0.2, grain: 0, saturation: 1.2, contrast: 1.08 }, sp.t);
    return m.renderer.domElement.toDataURL('image/png');
  }, sp);
}

if (process.argv.includes('--debug')) for (const [k, v] of Object.entries(shots)) fs.writeFileSync(path.join(OUT, `_shot_${k}.png`), Buffer.from(v.split(',')[1], 'base64'));
const files = await page.evaluate(async ({ shots, NAME, TAG }) => {
  const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  const img = {}; for (const [k, v] of Object.entries(shots)) img[k] = await load(v);
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  const text = (x, s, X, Y, size, fill, { stroke = 0.18, align = 'center', font = 'Montserrat', weight = 900, shadow = true } = {}) => {
    x.save(); x.font = `${weight} ${size}px ${font}`; x.textAlign = align; x.textBaseline = 'middle'; x.lineJoin = 'round';
    if (stroke) { x.lineWidth = size * stroke; x.strokeStyle = '#000'; if (shadow) { x.shadowColor = 'rgba(0,0,0,0.7)'; x.shadowBlur = size * 0.15; x.shadowOffsetY = size * 0.06; } x.strokeText(s, X, Y); }
    x.shadowColor = 'transparent'; x.fillStyle = fill; x.fillText(s, X, Y); x.restore();
  };
  const fit = (x, s, size, maxW, weight = 900) => { x.font = `${weight} ${size}px Montserrat`; const w = x.measureText(s).width; return w > maxW ? Math.floor(size * maxW / w) : size; };
  const pixelBlock = (x, X, Y, S, top = '#62a03f', side = '#7a5434') => { // grass block icon in pixel style
    const p = S / 8; for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const h = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; const r = h - Math.floor(h);
      x.fillStyle = j < 2 || (j === 2 && r < 0.5) ? (r < 0.3 ? '#4b8f2c' : r > 0.8 ? '#79c24c' : top) : (r < 0.25 ? '#5c3d22' : r > 0.85 ? '#94704a' : side); x.fillRect(X + i * p, Y + j * p, Math.ceil(p), Math.ceil(p)); } };
  const out = {};
  // ---------------------------------------------------------------- banner 2560x1440 (safe area 1546x423 in the middle)
  {
    const [c, x] = cv(2560, 1440);
    x.drawImage(img.world, -40, -22, 2640, 1485);
    const v = x.createRadialGradient(1280, 720, 300, 1280, 720, 1500); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); x.fillStyle = v; x.fillRect(0, 0, 2560, 1440);
    const band = x.createLinearGradient(0, 470, 0, 970); band.addColorStop(0, 'rgba(0,0,0,0)'); band.addColorStop(0.25, 'rgba(0,0,0,0.5)'); band.addColorStop(0.75, 'rgba(0,0,0,0.5)'); band.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = band; x.fillRect(0, 470, 2560, 500);
    const size = fit(x, NAME, 150, 1350); text(x, NAME, 1280, 672, size, '#ffffff', { stroke: 0.16 });
    // green underline in block pixels
    x.font = `900 ${size}px Montserrat`; const w = x.measureText(NAME).width; for (let i = 0; i < Math.floor(w / 36); i++) pixelBlock(x, 1280 - w / 2 + i * 36, 672 + size * 0.55, 32);
    text(x, TAG, 1280, 820, fit(x, TAG, 46, 1400, 800), '#ffd23a', { stroke: 0.2, weight: 800 });
    out.banner = c.toDataURL('image/png');
  }
  // ---------------------------------------------------------------- avatar 800x800 (shown as a circle)
  {
    const [c, x] = cv(800, 800);
    const g = x.createRadialGradient(400, 400, 60, 400, 400, 420); g.addColorStop(0, '#9fe27a'); g.addColorStop(1, '#2f7a2a'); x.fillStyle = g; x.fillRect(0, 0, 800, 800);
    x.save(); x.beginPath(); x.arc(400, 400, 370, 0, Math.PI * 2); x.clip();
    x.filter = 'blur(3px)'; x.drawImage(img.world, 260, 0, 1080, 1080, 0, 0, 800, 800); x.filter = 'none';
    x.fillStyle = 'rgba(40,110,40,0.35)'; x.fillRect(0, 0, 800, 800);
    // the stickman: body + big expressive head
    x.strokeStyle = '#111'; x.lineCap = 'round'; x.lineWidth = 34; x.beginPath(); x.moveTo(330, 560); x.lineTo(330, 820); x.moveTo(330, 640); x.lineTo(470, 560); x.stroke();
    x.fillStyle = '#ffffff'; x.lineWidth = 22; x.beginPath(); x.arc(330, 360, 215, 0, Math.PI * 2); x.fill(); x.stroke();
    for (const ex of [255, 405]) { x.fillStyle = '#fff'; x.lineWidth = 12; x.beginPath(); x.ellipse(ex, 330, 46, 60, 0, 0, Math.PI * 2); x.fill(); x.stroke();
      x.fillStyle = '#111'; x.beginPath(); x.arc(ex + 16, 340, 26, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(ex + 8, 330, 9, 0, Math.PI * 2); x.fill(); }
    x.lineWidth = 14; x.beginPath(); x.moveTo(205, 240); x.lineTo(285, 255); x.moveTo(375, 255); x.lineTo(455, 232); x.stroke();
    x.fillStyle = '#2a0d0d'; x.beginPath(); x.moveTo(260, 440); x.quadraticCurveTo(335, 470, 410, 430); x.quadraticCurveTo(335, 540, 260, 440); x.fill(); x.lineWidth = 12; x.stroke();
    x.fillStyle = 'rgba(255,120,140,0.45)'; x.beginPath(); x.ellipse(200, 430, 30, 15, 0, 0, Math.PI * 2); x.ellipse(465, 425, 30, 15, 0, 0, Math.PI * 2); x.fill();
    // Origin: grass block with a pixel face
    const B = 270, bx = 470, by = 470; pixelBlock(x, bx, by, B); x.lineWidth = 10; x.strokeStyle = '#111'; x.strokeRect(bx, by, B, B);
    const q = B / 8; x.fillStyle = '#111'; x.fillRect(bx + 2 * q, by + 3 * q, q, 1.5 * q); x.fillRect(bx + 5 * q, by + 3 * q, q, 1.5 * q); x.fillStyle = '#fff'; x.fillRect(bx + 2.2 * q, by + 3.2 * q, q * 0.4, q * 0.4); x.fillRect(bx + 5.2 * q, by + 3.2 * q, q * 0.4, q * 0.4);
    x.fillStyle = '#111'; x.fillRect(bx + 3 * q, by + 5.6 * q, 2 * q, q * 0.5);
    x.restore();
    x.lineWidth = 26; x.strokeStyle = '#ffffff'; x.beginPath(); x.arc(400, 400, 372, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 10; x.strokeStyle = '#1d4d1a'; x.beginPath(); x.arc(400, 400, 388, 0, Math.PI * 2); x.stroke();
    out.avatar = c.toDataURL('image/png');
  }
  // ---------------------------------------------------------------- watermark 150x150 (subscribe button)
  {
    const [c, x] = cv(150, 150);
    pixelBlock(x, 15, 15, 120);
    x.fillStyle = '#ffffff'; x.strokeStyle = '#000'; x.lineWidth = 5; x.beginPath(); x.arc(75, 70, 34, 0, Math.PI * 2); x.fill(); x.stroke();
    x.fillStyle = '#111'; x.fillRect(60, 58, 8, 12); x.fillRect(82, 58, 8, 12); x.lineWidth = 4; x.beginPath(); x.arc(75, 78, 12, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
    x.fillStyle = '#e62117'; x.fillRect(22, 112, 106, 28); text(x, 'SUBSCRIBE', 75, 127, 17, '#ffffff', { stroke: 0, weight: 900 });
    out.watermark = c.toDataURL('image/png');
  }
  // ---------------------------------------------------------------- end screen template 1920x1080
  {
    const [c, x] = cv(1920, 1080);
    x.filter = 'blur(6px) brightness(0.75)'; x.drawImage(img.world, -20, -20, 1960, 1120); x.filter = 'none';
    text(x, 'WATCH NEXT', 960, 150, 96, '#ffffff', { stroke: 0.16 });
    const box = (X, Y, label) => { x.fillStyle = 'rgba(0,0,0,0.45)'; x.fillRect(X, Y, 720, 405); x.lineWidth = 8; x.strokeStyle = '#6dff4a'; x.strokeRect(X, Y, 720, 405); text(x, label, X + 360, Y + 202, 38, 'rgba(255,255,255,0.75)', { stroke: 0, weight: 800 }); };
    box(150, 330, 'NEXT EPISODE'); box(1050, 330, 'BEST VIDEO');
    x.fillStyle = 'rgba(0,0,0,0.45)'; x.beginPath(); x.arc(960, 900, 120, 0, Math.PI * 2); x.fill(); x.lineWidth = 8; x.strokeStyle = '#ffffff'; x.stroke(); text(x, 'SUBSCRIBE', 960, 900, 30, '#ffffff', { stroke: 0, weight: 900 });
    text(x, NAME, 960, 1030, 40, '#ffd23a', { stroke: 0.2 });
    out.endscreen = c.toDataURL('image/png');
  }
  return out;
}, { shots, NAME, TAG });
for (const [k, v] of Object.entries(files)) { const f = path.join(OUT, `${k}.png`); fs.writeFileSync(f, Buffer.from(v.split(',')[1], 'base64')); console.log('wrote', path.relative(ROOT, f)); }
await browser.close(); srv.close();
