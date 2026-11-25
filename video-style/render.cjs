// Покадровый экспорт: node render.js [fps] [outDir] [onlyTimes...]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const fps = +(process.argv[2] || 30), out = process.argv[3] || 'frames';
  const only = process.argv.slice(4).map(Number);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await p.goto('file://' + path.resolve(__dirname, 'index.html') + '#export');
  await p.waitForFunction('window.READY === true', null, { timeout: 60000 });
  const dur = await p.evaluate('DURATION');
  const times = only.length ? only : Array.from({ length: Math.ceil(dur * fps) }, (_, i) => i / fps);
  for (let i = 0; i < times.length; i++) {
    const url = await p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, times[i]);
    fs.writeFileSync(path.join(out, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
    if (i % 150 === 0) console.log(`${i}/${times.length}`);
  }
  console.log('duration', dur);
  await b.close();
})();
