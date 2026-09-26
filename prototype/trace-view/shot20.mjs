import { execSync } from 'node:child_process';
const pw = await import(execSync('npm root -g').toString().trim() + '/playwright/index.mjs');
const b = await pw.chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const p = await b.newPage({viewport:{width:1360,height:960}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/trace-view.html');
await p.click('button[data-v=city]');
for (const l of ['code','test','di']) await p.click(`[data-citylv=${l}]`);
await p.waitForTimeout(200);
// aim at the middle of the fourth floor of the tallest note, as a person hovering would
const at = await p.evaluate(()=>{const f=C3.meshes.filter(m=>m.userData.id.includes('#'));const of=f[0].userData.of;const fl=f.filter(m=>m.userData.of===of)[3];
 const d=C3.cam.position.clone().sub(fl.position);const v=fl.position.clone();if(Math.abs(d.x)/fl.scale.x>Math.abs(d.z)/fl.scale.z)v.x+=Math.sign(d.x)*fl.scale.x/2*.99;else v.z+=Math.sign(d.z)*fl.scale.z/2*.99;v.project(C3.cam);const r=C3.r.domElement.getBoundingClientRect();return {x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height,id:fl.userData.id}});
await p.mouse.move(at.x,at.y); await p.waitForTimeout(100); await p.screenshot({path:'j-1.png'});
await p.mouse.click(at.x,at.y); await p.waitForTimeout(200);
console.log('aimed', at.id, 'selected', await p.evaluate(()=>st.osel)); await p.screenshot({path:'j-2.png'});
// the handle between the panes moves the split down, and the city fills the taller pane
const hb = await p.locator('.splitter').boundingBox(); await p.mouse.move(hb.x+300,hb.y+3); await p.mouse.down(); await p.mouse.move(hb.x+300,hb.y+150,{steps:6}); await p.mouse.up(); await p.waitForTimeout(200);
console.log('split', await p.evaluate(()=>st.splitH), 'canvas', await p.evaluate(()=>C3.r.domElement.height/devicePixelRatio)); await p.screenshot({path:'j-3.png'});
await b.close();
