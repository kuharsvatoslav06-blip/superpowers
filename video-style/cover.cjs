// Обложки: HTML=uran/index.html node cover.cjs <outDir>
const { chromium } = require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const out=process.argv[2]||'covers';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.error('PAGE ERROR',e.message));
await p.goto('file://'+path.resolve(process.env.HTML)+'#export');await p.waitForFunction('window.READY===true');
const n=await p.evaluate('COVERS.length');
for(let i=0;i<n;i++){const u=await p.evaluate(i=>{cover(i);return document.getElementById('c').toDataURL('image/png')},i);
 const f=path.join(out,`cover_${'ABC'[i]}.png`);fs.writeFileSync(f,Buffer.from(u.split(',')[1],'base64'));console.log(f)}
await b.close()})();
