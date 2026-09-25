import { execSync } from 'node:child_process';
const pw = await import(execSync('npm root -g').toString().trim() + '/playwright/index.mjs');
const b = await pw.chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const p = await b.newPage({viewport:{width:1360,height:960}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/trace-view.html'); await p.waitForSelector('.tile');
await p.screenshot({path:'k-1.png'});
await p.click('button[data-v=city]'); await p.waitForTimeout(200);
// the window shrinks, then grows: the city fills each size
await p.setViewportSize({width:900,height:700}); await p.waitForTimeout(400); await p.screenshot({path:'k-2.png'});
console.log('canvas at 900x700', await p.evaluate(()=>[C3.r.domElement.clientWidth,C3.r.domElement.clientHeight]));
await p.setViewportSize({width:1600,height:1000}); await p.waitForTimeout(400); await p.screenshot({path:'k-3.png'});
console.log('canvas at 1600x1000', await p.evaluate(()=>[C3.r.domElement.clientWidth,C3.r.domElement.clientHeight]));
await p.click('button[data-v=v]'); await p.click('.tile[data-lv=code]'); await p.click('button[data-v=structure]'); await p.waitForTimeout(200); await p.screenshot({path:'k-4.png'});
await p.click('.crumb[data-c="0"]'); await p.click('.tile[data-lv=do]'); await p.click('button[data-v=onion]'); await p.screenshot({path:'k-5.png'});
await p.click('button[data-v=tree]'); await p.click('tr[data-s]'); await p.screenshot({path:'k-6.png'});
await b.close();
