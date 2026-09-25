// The city of the whole tree, in 3D: a block of ground is a folder, a building a file, and a note's building stacks
// one floor a section. It stands on the overview, and the selected item's details draw below it.
// A left drag turns it, a middle or right drag pans, the wheel zooms, and a click selects a building or a floor.
const CITY_LV=[['di','design inputs','#2a78d6'],['do','design outputs','#eb6834'],['code','code files','#1baf7a'],['test','test files','#eda100']];
const CITY_RAMP=['#cde2fb','#9ec5f4','#6da7ec','#2a78d6','#184f95'],CITY_COV=['#d03b3b','#e0763a','#eda100','#8fbf3f','#0ca30c'];
function cityMeasures(){if(cityMeasures.m)return cityMeasures.m;const secs=new Map(),links=new Map();const add=k=>links.set(k,(links.get(k)||0)+1);
 D.secs.forEach(x=>(secs.get(x.note)||secs.set(x.note,[]).get(x.note)).push(x.id));
 Object.entries(D.refines).forEach(([a,bs])=>bs.forEach(b=>{add(a);add(b)}));
 Object.entries(D.f2s).forEach(([f,ss])=>new Set(ss.map(x=>x.split('#')[0])).forEach(n=>{add(f);add(n)}));
 Object.entries(D.imports).forEach(([a,bs])=>bs.forEach(b=>{add(a);add(b)}));
 return cityMeasures.m={secs,links}}
function cityFns(){const m=cityMeasures();const isNote=f=>N[f]&&(N[f].lv==='di'||N[f].lv==='do');
 return {lines:x=>D.loc[x]||1,size:x=>isNote(x)?(m.secs.get(x)||[]).length:(D.calls[x]||[]).length,changes:x=>(D.changes||{})[x]||0,links:x=>m.links.get(x)||0,
  cov:x=>LC&&LC[x]!=null?LC[x]:null,tests:x=>(testsOfCode.get(x)||[]).length,isNote,secs:x=>m.secs.get(x)||[]}}
// the ground plan changes with the levels shown alone
function cityPlan(s){const ids=s.lv.flatMap(l=>items(l).map(n=>n.id)).filter(x=>D.loc[x]);const key=ids.join('|');if(s._plan&&s._plan.key===key)return s._plan;
 const lines=x=>D.loc[x]||1;const root=cityTree(ids,lines);const plots=[],districts=[];const PAD=6,S=900;
 const lay=(n,x,y,w,h,depth)=>{districts.push({n,x,y,w,h,depth});const kids=[...n.kids.values()].map(k=>({k,v:k.t})).concat(n.files.map(f=>({f,v:lines(f)})));const out=[];
  squarify(kids.sort((a,b)=>b.v-a.v),x+PAD,y+PAD,Math.max(1,w-2*PAD),Math.max(1,h-2*PAD),out);out.forEach(o=>o.k?lay(o.k,o.x,o.y,o.w,o.h,depth+1):plots.push({f:o.f,x:o.x+1.5,y:o.y+1.5,w:Math.max(1,o.w-3),h:Math.max(1,o.h-3),z:depth+1}))};
 lay(root,0,0,S,S,0);return s._plan={key,ids,plots,districts,S}}
function cityKeys(s){return {hk:s.height||(s.lv.length>1?'links':'size'),ck:s.colour||(s.lv.length>1?'level':'changes')}}
// the renderer, the camera and the scene live across redraws, so a click keeps the view where it stands
let C3=null;
function city3(){if(C3)return C3;const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setPixelRatio(devicePixelRatio);r.setClearColor(new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#121212'));
 const cam=new THREE.PerspectiveCamera(38,1,5,20000);const ctl=new THREE.OrbitControls(cam,r.domElement);
 ctl.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.PAN,RIGHT:THREE.MOUSE.PAN};ctl.maxPolarAngle=Math.PI/2-.04;ctl.minDistance=40;ctl.maxDistance=5000;ctl.zoomSpeed=1.2;
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x9a9a90,.8));const sun=new THREE.DirectionalLight(0xffffff,.5);sun.position.set(-500,900,350);scene.add(sun);
 const group=new THREE.Group();scene.add(group);const labels=document.createElement('div');labels.className='citylabels';
 r.domElement.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault()});
 C3={r,cam,ctl,scene,group,labels,key:null,meshes:[],hover:null,host:null};cityHome();ctl.addEventListener('change',cityDraw);return C3}
// the home view looks from the south-west at a fixed slant, and backs off until the whole city fits
function cityHome(){const{cam,ctl,group}=C3;const bx=new THREE.Box3().setFromObject(group);if(bx.isEmpty())bx.set(new THREE.Vector3(-450,0,-450),new THREE.Vector3(450,200,450));
 const sp=bx.getBoundingSphere(new THREE.Sphere());const d=sp.radius/Math.sin(cam.fov*Math.PI/360)*.78;const dir=new THREE.Vector3(-.56,.6,.66).normalize();
 ctl.target.copy(sp.center).setY(sp.center.y*.5);cam.position.copy(ctl.target).addScaledVector(dir,d);ctl.update()}
const shade3=(hex,k)=>{const n=parseInt(hex.slice(1),16);const h=v=>Math.round(v*k).toString(16).padStart(2,'0');return '#'+h((n>>16)&255)+h((n>>8)&255)+h(n&255)};
const cityMat=new Map();const matOf=c=>cityMat.get(c)||cityMat.set(c,new THREE.MeshLambertMaterial({color:c})).get(c);
function cityBuild(s){const c=city3();const{hk,ck}=cityKeys(s);const key=[s.lv.join(','),hk,ck].join('|');if(c.key===key)return;
 // new levels or a new height change the city's bounds, so the view goes home; a new colour keeps it
 const refit=!c.key||c.key.split('|').slice(0,2).join('|')!==key.split('|').slice(0,2).join('|');c.key=key;c.refit=refit;
 const{ids,plots,districts,S}=cityPlan(s);const F=cityFns();const hv=F[hk],hmax=Math.max(1,...ids.map(hv)),ZH=220,DZ=3;
 const cv=ck==='changes'?F.changes:F.tests;const cmax=Math.max(1,...ids.map(cv));const lvCol=new Map(CITY_LV.map(l=>[l[0],l[2]]));
 const colour=f=>{if(ck==='level')return lvCol.get(N[f].lv)||'#bdbcb6';if(ck==='coverage'){const v=F.cov(f);return v==null?'#bdbcb6':CITY_COV[Math.min(4,Math.floor(v/20.01))]}return CITY_RAMP[Math.min(4,Math.floor(4*cv(f)/cmax+.001))]};
 c.group.clear();c.meshes=[];c.hover=null;c.edges=null;const H=S/2;const box=new THREE.BoxGeometry(1,1,1);
 const put=(x,y,w,h,y0,ht,mat,data)=>{const m=new THREE.Mesh(box,mat);m.scale.set(w,ht,h);m.position.set(x+w/2-H,y0+ht/2,y+h/2-H);m.userData=data||{};c.group.add(m);if(data)c.meshes.push(m);return m};
 districts.forEach(d=>{const g=Math.min(120,48+d.depth*14);put(d.x,d.y,d.w,d.h,d.depth*DZ,DZ,matOf(`rgb(${g},${g},${g-4})`))});
 plots.forEach(p=>{const z0=p.z*DZ,ht=Math.max(2,ZH*Math.sqrt(hv(p.f)/hmax));const mat=matOf(colour(p.f));
  // a note's floors are its sections, and a code file's floors its functions; a function floor selects its file
  const floors=F.isNote(p.f)?F.secs(p.f).map(sid=>({id:sid,tip:`${N[sid]?.name||sid} · a section of ${N[p.f].name}`})):(D.calls[p.f]||[]).map(fn=>({id:p.f,tip:`${fn.name}() · line ${fn.line} · a function of ${N[p.f].name}`}));
  const tip=`${p.f} · ${F.lines(p.f)} lines · ${F.size(p.f)} ${F.isNote(p.f)?'sections':'functions'} · ${F.links(p.f)} links · changed ${F.changes(p.f)} times${F.cov(p.f)!=null?` · ${F.cov(p.f)}% lines covered`:''}`;
  // a note stacks its sections as floors, the first section on top, a thin gap between two floors
  // a floor stands at least FLOOR high, so a note grows past its measure where its sections need the room;
  // two floors in a row differ in shade, since a gap between them shimmers when the city stands far off
  if(floors.length>1){const FLOOR=4,fh=Math.max(FLOOR,ht/floors.length),alt=matOf(shade3(colour(p.f),.86));
   floors.forEach((fl,i)=>put(p.x,p.y,p.w,p.h,z0+(floors.length-1-i)*fh,fh,i%2?alt:mat,{id:fl.id,of:p.f,tip:fl.tip}))}
  else put(p.x,p.y,p.w,p.h,z0,ht,mat,{id:p.f,of:p.f,tip})});
 // district names ride above the district's centre, the largest district first
 c.names=districts.filter(d=>d.depth>=1&&d.depth<=2&&d.w*d.h>S*S/50).sort((a,b)=>b.w*b.h-a.w*a.h).map(d=>({text:d.n.name,v:new THREE.Vector3(d.x+d.w/2-H,d.depth*DZ+4,d.y+d.h/2-H)}));
 c.labels.innerHTML=c.names.map(n=>`<span class="cityname">${esc(n.text)}</span>`).join('')}
function citySelect(){const c=C3;if(!c)return;const sel=st.at?st.at.id:st.osel;if(c.edges)c.group.remove(c.edges);c.edges=null;
 const m=c.meshes.filter(x=>x.userData.id===sel||x.userData.of===sel&&!sel.includes('#'));if(!m.length)return;
 const g=new THREE.Group();m.forEach(x=>{const e=new THREE.LineSegments(new THREE.EdgesGeometry(x.geometry),new THREE.LineBasicMaterial({color:0xd03b3b}));e.position.copy(x.position);e.scale.copy(x.scale).multiplyScalar(1.01);g.add(e)});
 // a red pole rises over the selection, so the eye finds it in a dense district
 const topY=Math.max(...m.map(x=>x.position.y+x.scale.y/2)),p=m[0].position;const pole=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,90,8),matOf('#d03b3b'));pole.position.set(p.x,topY+45,p.z);g.add(pole);
 c.group.add(g);c.edges=g}
function cityDraw(){const c=C3;if(!c||!c.host||!c.host.isConnected)return;c.r.render(c.scene,c.cam);
 const W=c.host.clientWidth,Hh=c.host.clientHeight;const shown=[];
 [...c.labels.children].forEach((el,i)=>{const p=c.names[i].v.clone().project(c.cam);if(p.z>1){el.style.display='none';return}const x=(p.x+1)/2*W,y=(1-p.y)/2*Hh;
  el.style.display='';el.style.left=x+'px';el.style.top=y+'px';const r=el.getBoundingClientRect();
  if(shown.some(q=>r.left<q.right&&q.left<r.right&&r.top<q.bottom&&q.top<r.bottom))el.style.display='none';else shown.push(r)})}
function cityPick(id){if(st.at)return select(id);remember();st.osel=id;renderKeep()}
function cityView(){const s=st.city;if(!s.lv)s.lv=CITY_LV.map(l=>l[0]);const{hk,ck}=cityKeys(s);
 const hName={size:'functions, or sections for a note',lines:'lines',changes:'git changes',links:'links'}[hk];const sw=c=>`<i class="sw" style="background:${c}"></i>`;
 const key=ck==='level'?CITY_LV.filter(l=>s.lv.includes(l[0])).map(l=>`${sw(l[2])}${l[1]}`).join(' '):ck==='coverage'?`${CITY_COV.map(sw).join('')} few to many lines covered, ${sw('#bdbcb6')} no report`:`few ${CITY_RAMP.map(sw).join('')} many ${ck==='changes'?'git changes':'tests importing it'}`;
 return `<div class="mxbar"><span>levels ${CITY_LV.map(l=>`<label><input type="checkbox" data-citylv="${l[0]}" ${s.lv.includes(l[0])?'checked':''}> ${l[1]}</label>`).join(' ')}</span>
  <span>height <select id="cityh">${[['size','functions or sections'],['lines','lines'],['changes','git changes'],['links','links']].map(([k,l])=>`<option value="${k}" ${hk===k?'selected':''}>${l}</option>`).join('')}</select></span>
  <span>colour <select id="cityc">${[['level','level'],['changes','git changes'],['coverage','line coverage'],['tests','tests importing it']].map(([k,l])=>`<option value="${k}" ${ck===k?'selected':''}>${l}</option>`).join('')}</select></span>
  <button id="cityreset">reset view</button></div>
  <p class="citykey">A building is a file, a block of ground a folder, and a floor a section of a note or a function of a code file. Ground area: lines. Height: ${hName}. Colour: ${key}. A drag turns the city, a middle or right drag pans, the wheel zooms, and a click selects.</p>
  <div class="city3" id="city3"></div>`}
function cityBind(b){const s=st.city;const on=(id,f)=>{const x=document.getElementById(id);if(x)x.onchange=()=>{f(x);renderKeep()}};
 on('cityh',x=>s.height=x.value);on('cityc',x=>s.colour=x.value);
 b.querySelectorAll('[data-citylv]').forEach(x=>x.onchange=()=>{const l=x.dataset.citylv;s.lv=x.checked?CITY_LV.map(v=>v[0]).filter(v=>v===l||s.lv.includes(v)):s.lv.filter(v=>v!==l);if(!s.lv.length)s.lv=[l];s.height=s.colour=null;renderKeep()});
 const host=document.getElementById('city3');if(!host)return;const c=city3();
 const rs=document.getElementById('cityreset');if(rs)rs.onclick=()=>{cityHome();cityDraw()};
 // the canvas moves into the new pane, and fills what the pane leaves below the bars
 const top=host.closest('.topv')||b;const h=Math.max(160,(top===b?innerHeight:top.getBoundingClientRect().bottom)-host.getBoundingClientRect().top-4);
 host.style.height=h+'px';host.append(c.r.domElement,c.labels);c.host=host;c.r.setSize(host.clientWidth,h);c.cam.aspect=host.clientWidth/h;c.cam.updateProjectionMatrix();
 cityBuild(s);if(c.refit){cityHome();c.refit=false}citySelect();cityDraw();
 const ray=new THREE.Raycaster(),at=new THREE.Vector2();const tt=document.getElementById('tt');
 const hit=e=>{const r=c.r.domElement.getBoundingClientRect();at.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(at,c.cam);return ray.intersectObjects(c.meshes,false)[0]?.object};
 // a hovered building or floor lights up and names itself, so a thin floor is easy to aim at
 const el=c.r.domElement;let down=null;
 el.onpointermove=e=>{if(e.buttons)return;const m=hit(e);if(c.hover!==m){if(c.hover)c.hover.material=c.hover.userData.mat;c.hover=m;if(m){m.userData.mat=m.userData.mat||m.material;m.material=matOf('#f4d35e')}cityDraw()}
  if(tt){if(m){tt.textContent=m.userData.tip||m.userData.id;tt.style.display='block';tt.style.left=e.clientX+14+'px';tt.style.top=e.clientY+12+'px'}else tt.style.display='none'}};
 el.onpointerleave=()=>{if(c.hover){c.hover.material=c.hover.userData.mat;c.hover=null;cityDraw()}if(tt)tt.style.display='none'};
 el.onpointerdown=e=>down=[e.clientX,e.clientY,e.button];
 el.onpointerup=e=>{if(!down||down[2]!==0||Math.abs(e.clientX-down[0])+Math.abs(e.clientY-down[1])>4)return;const m=hit(e);if(m){if(tt)tt.style.display='none';cityPick(m.userData.id)}}}
