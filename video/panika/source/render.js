const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [,, outDir, mode, ...rest] = process.argv;
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const web = 'file://' + path.resolve(__dirname, '../web/index.html');
  fs.mkdirSync(outDir, { recursive: true });
  let times;
  if (mode === 'probe') times = rest.map(Number);
  else { const n = 93 * 30; times = [...Array(n).keys()].map(i => i / 30); }
  const N = mode === 'probe' ? 1 : 4;
  let done = 0; const t0 = Date.now();
  await Promise.all([...Array(N).keys()].map(async w => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(web); await page.evaluate(() => window.ready);
    for (let i = w; i < times.length; i += N) {
      const t = times[i];
      let d;
      try { d = await page.evaluate(t => window.frame(t), t); } catch (e) { console.error('t=' + t, e.message); process.exit(1); }
      const name = mode === 'probe' ? `p_${t.toFixed(2)}.jpg` : `f${String(i).padStart(5, '0')}.jpg`;
      fs.writeFileSync(path.join(outDir, name), Buffer.from(d.split(',')[1], 'base64'));
      if (++done % 300 === 0) console.log(done, ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
    if (errs.length) console.error(errs.join('\n'));
  }));
  await browser.close();
})();
