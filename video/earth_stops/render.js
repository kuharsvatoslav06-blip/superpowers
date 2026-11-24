// Frame renderer: headless Chromium draws each frame on a canvas; frames are piped into ffmpeg.
//   node render.js probe 1.5 12 40          -> build/probe/p_<t>.jpg (quick stills for review)
//   node render.js video build/video.mp4 [from] [to] [workers]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const ROOT = __dirname, FPS = 30;
const story = JSON.parse(fs.readFileSync(path.join(ROOT, 'story.json'), 'utf8'));
const timingPath = path.join(ROOT, 'build', 'timing.json');
const timing = fs.existsSync(timingPath) ? JSON.parse(fs.readFileSync(timingPath, 'utf8')) : null;

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await page.goto('file://' + path.join(ROOT, 'web', 'index.html'));
  const info = await page.evaluate(([s, tm]) => window.init(s, tm), [story, timing]);
  return { page, errs, info };
}

(async () => {
  const [mode, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-gpu-vsync'] });
  if (mode === 'probe') {
    const out = path.join(ROOT, 'build', 'probe'); fs.mkdirSync(out, { recursive: true });
    const { page, errs } = await openPage(browser);
    for (const t of rest.map(Number)) {
      const d = await page.evaluate(t => window.frame(t, 0.88), t);
      fs.writeFileSync(path.join(out, `p_${t.toFixed(2)}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
    }
    if (errs.length) console.error(errs.slice(0, 10).join('\n'));
    await browser.close(); return;
  }
  if (mode === 'plan') {
    const { page, errs } = await openPage(browser);
    const plan = await page.evaluate(() => window.exportPlan());
    fs.writeFileSync(path.join(ROOT, 'build', 'plan.json'), JSON.stringify(plan, null, 1));
    console.log(plan.map(p => `${p.id} ${p.start}s +${p.dur}s  ${p.cues.length} cues`).join('\n'));
    if (errs.length) console.error(errs.join('\n'));
    await browser.close(); return;
  }
  if (mode === 'video') {
    const outFile = path.resolve(rest[0] || 'build/video.mp4');
    const { page: p0, info } = await openPage(browser); await p0.close();
    const from = rest[1] ? Number(rest[1]) : 0, to = rest[2] ? Number(rest[2]) : info.total, N = Number(rest[3] || 4);
    const f0 = Math.round(from * FPS), f1 = Math.round(to * FPS), per = Math.ceil((f1 - f0) / N);
    const segDir = path.join(ROOT, 'build', 'seg'); fs.mkdirSync(segDir, { recursive: true });
    console.log(`rendering ${from}s..${to}s (${f1 - f0} frames) with ${N} workers`);
    const t0 = Date.now(); let done = 0;
    const segs = await Promise.all([...Array(N).keys()].map(async w => {
      const a = f0 + w * per, b = Math.min(f1, a + per); if (a >= b) return null;
      const seg = path.join(segDir, `seg${w}.mp4`);
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
      const { page, errs } = await openPage(browser);
      for (let f = a; f < b; f++) {
        const d = await page.evaluate(t => window.frame(t, 0.93), f / FPS);
        const buf = Buffer.from(d.split(',')[1], 'base64');
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
        if (++done % 300 === 0) console.log(`${done}/${f1 - f0} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
      ff.stdin.end(); await new Promise(r => ff.on('close', r));
      if (errs.length) console.error(`worker ${w}:`, errs.slice(0, 5).join('\n'));
      await page.close(); return seg;
    }));
    const list = path.join(segDir, 'list.txt'); fs.writeFileSync(list, segs.filter(Boolean).map(s => `file '${s}'`).join('\n'));
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', outFile]);
    console.log('done', outFile, ((Date.now() - t0) / 1000).toFixed(0) + 's');
    await browser.close(); return;
  }
  console.log('usage: node render.js probe <t...> | video <out> [from] [to] [workers]'); await browser.close();
})();
