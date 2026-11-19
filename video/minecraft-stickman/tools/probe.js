// Render individual frames for inspection: node tools/probe.js <outDir> t1 t2 ...  (times in seconds, or scene:local e.g. s1:12.5)
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
import { startServer } from './server.js';
import { sceneById } from '../src/story/script.js';
const { chromium } = createRequire(import.meta.url)('playwright');
const [outDir, ...times] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const srv = await startServer(0); const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
await page.goto(`http://127.0.0.1:${port}/?render`);
const t0 = Date.now();
await page.waitForFunction(() => window.ready || window.bootError, null, { timeout: 300000 });
const be = await page.evaluate(() => window.bootError); if (be) { console.error('BOOT ERROR', be); }
console.log('boot', ((Date.now() - t0) / 1000).toFixed(1) + 's');
for (const spec of times) {
  const t = spec.includes(':') ? sceneById[spec.split(':')[0]].start + +spec.split(':')[1] : +spec;
  const a = Date.now(); const d = await page.evaluate(t => window.frame(t, 0.85), t);
  const name = spec.replace(':', '_') + '.jpg'; fs.writeFileSync(path.join(outDir, name), Buffer.from(d.split(',')[1], 'base64'));
  console.log(spec, '->', name, (Date.now() - a) + 'ms');
}
if (errs.length) console.log([...new Set(errs)].slice(0, 30).join('\n'));
await browser.close(); srv.close();
