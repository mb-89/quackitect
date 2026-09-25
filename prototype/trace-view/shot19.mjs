import { execSync } from 'node:child_process';
const pw = await import(execSync('npm root -g').toString().trim() + '/playwright/index.mjs');
const b = await pw.chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const p = await b.newPage({viewport:{width:1360,height:960}});
p.on('pageerror',e=>console.log('ERR',e.message)); p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
await p.goto('file://'+process.cwd()+'/trace-view.html');
await p.click('button[data-v=city]'); await p.waitForTimeout(300); await p.screenshot({path:'i-1.png'});
const box = await p.locator('#city3 canvas').boundingBox(); const cx=box.x+box.width/2, cy=box.y+box.height/2;
// a left drag turns the city
await p.mouse.move(cx,cy); await p.mouse.down(); await p.mouse.move(cx+180,cy+40,{steps:8}); await p.mouse.up(); await p.waitForTimeout(100);
// the wheel zooms in
await p.mouse.move(cx,cy); for (let i=0;i<3;i++){await p.mouse.wheel(0,-200); await p.waitForTimeout(50)}
await p.screenshot({path:'i-2.png'});
// hover and click the building under the centre, and the details draw below
await p.mouse.move(cx+5,cy+5); await p.waitForTimeout(100); await p.mouse.click(cx+5,cy+5); await p.waitForTimeout(300); await p.screenshot({path:'i-3.png'});
// a click on a level on the V still works
await p.click('button[data-v=v]'); await p.click('.tile[data-lv=code]'); await p.screenshot({path:'i-4.png'});
await b.close();
