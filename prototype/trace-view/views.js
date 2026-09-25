// ---- the code city (Wettel and Lanza 2007): districts are folders, buildings are files
// The ground plan is a squarified treemap (Bruls, Huizing and van Wijk 2000) with the area by lines; a building's
// height and colour follow the menus. Drawn in isometric projection, back to front.
function squarify(items,x,y,w,h,out){if(!items.length)return;const total=items.reduce((s,i)=>s+i.v,0);if(total<=0)return;
 const area=w*h;const scaled=items.map(i=>({...i,a:i.v/total*area}));let row=[],rest=[...scaled];
 const worst=(r,side)=>{const s=r.reduce((t,i)=>t+i.a,0);const mx=Math.max(...r.map(i=>i.a)),mn=Math.min(...r.map(i=>i.a));return Math.max(side*side*mx/(s*s),s*s/(side*side*mn))};
 let X=x,Y=y,W=w,H=h;
 while(rest.length){const side=Math.min(W,H);const next=rest[0];if(!row.length||worst([...row,next],side)<=worst(row,side)){row.push(next);rest.shift();continue}
  place();}place();
 function place(){if(!row.length)return;const s=row.reduce((t,i)=>t+i.a,0);if(W>=H){const cw=s/H;let yy=Y;row.forEach(i=>{const ih=i.a/cw;out.push({...i,x:X,y:yy,w:cw,h:ih});yy+=ih});X+=cw;W-=cw}
  else{const ch=s/W;let xx=X;row.forEach(i=>{const iw=i.a/ch;out.push({...i,x:xx,y:Y,w:iw,h:ch});xx+=iw});Y+=ch;H-=ch}row=[]}}
function cityTree(ids,size){const root={name:'',kids:new Map(),files:[]};ids.forEach(id=>{const parts=id.split('/');let n=root;parts.slice(0,-1).forEach(p=>{if(!n.kids.has(p))n.kids.set(p,{name:p,kids:new Map(),files:[]});n=n.kids.get(p)});n.files.push(id)});
 const total=n=>n.t??=(n.files.reduce((s,f)=>s+size(f),0)+[...n.kids.values()].reduce((s,k)=>s+total(k),0));total(root);
 // a folder holding one folder and no file folds into it, so the city skips empty streets
 const fold=n=>{n.kids.forEach(k=>fold(k));if(n!==root&&!n.files.length&&n.kids.size===1){const[k]=[...n.kids.values()];n.name=n.name+'/'+k.name;n.kids=k.kids;n.files=k.files}};fold(root);return root}
function cityView(){const s=st.city;const withTests=!!s.tests;const ids=items('code').map(n=>n.id).concat(withTests?items('test').map(n=>n.id):[]);
 const lines=f=>D.loc[f]||1,fns=f=>(D.calls[f]||[]).length,chg=f=>(D.changes||{})[f]||0,cov=f=>LC&&LC[f]!=null?LC[f]:null,tst=f=>(testsOfCode.get(f)||[]).length;
 const hk=s.height||'functions',ck=s.colour||'changes';const hv={functions:fns,lines,changes:chg}[hk];
 const root=cityTree(ids,lines);const plots=[];const districts=[];const PAD=6,S=900;
 const lay=(n,x,y,w,h,depth)=>{districts.push({n,x,y,w,h,depth});const kids=[...n.kids.values()].map(k=>({k,v:k.t})).concat(n.files.map(f=>({f,v:lines(f)})));const out=[];
  squarify(kids.sort((a,b)=>b.v-a.v),x+PAD,y+PAD,Math.max(1,w-2*PAD),Math.max(1,h-2*PAD),out);out.forEach(o=>o.k?lay(o.k,o.x,o.y,o.w,o.h,depth+1):plots.push({f:o.f,x:o.x+1.5,y:o.y+1.5,w:Math.max(1,o.w-3),h:Math.max(1,o.h-3),z:depth+1}))};
 lay(root,0,0,S,S,0);
 const hmax=Math.max(1,...ids.map(hv)),ZH=160;const vals=ids.map(f=>ck==='changes'?chg(f):ck==='coverage'?cov(f):tst(f)).filter(v=>v!=null);const cmax=Math.max(1,...vals);
 const ramp=['#cde2fb','#9ec5f4','#6da7ec','#2a78d6','#184f95'];const red=['#d03b3b','#e0763a','#eda100','#8fbf3f','#0ca30c'];
 const colour=f=>{if(ck==='coverage'){const v=cov(f);return v==null?'#bdbcb6':red[Math.min(4,Math.floor(v/20.01))]}const v=ck==='changes'?chg(f):tst(f);return ramp[Math.min(4,Math.floor(4*v/cmax+.001))]};
 const c30=Math.cos(Math.PI/6),s30=Math.sin(Math.PI/6);const P=(x,y,z)=>[(x-y)*c30,(x+y)*s30-z];const poly=pts=>pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');
 const shade=(hex,k)=>{const n=parseInt(hex.slice(1),16);const r=Math.round(((n>>16)&255)*k),g=Math.round(((n>>8)&255)*k),b=Math.round((n&255)*k);return `rgb(${r},${g},${b})`};
 let svg='';const DZ=3;
 districts.forEach(d=>{const z=d.depth*DZ;const top=[P(d.x,d.y,z),P(d.x+d.w,d.y,z),P(d.x+d.w,d.y+d.h,z),P(d.x,d.y+d.h,z)];const g=Math.max(170,235-d.depth*16);
  svg+=`<polygon points="${poly(top)}" fill="rgb(${g},${g},${g-6})" stroke="#9a998f" stroke-width=".5"><title>${esc(d.n.name||'the tree')}</title></polygon>`});
 plots.sort((a,b)=>(a.x+a.y+a.w+a.h)-(b.x+b.y+b.w+b.h)).forEach(p=>{const z0=p.z*DZ,h=Math.max(2,ZH*Math.sqrt(hv(p.f)/hmax));const z1=z0+h;const col=colour(p.f);const sel=st.at&&st.at.id===p.f;
  const top=[P(p.x,p.y,z1),P(p.x+p.w,p.y,z1),P(p.x+p.w,p.y+p.h,z1),P(p.x,p.y+p.h,z1)];
  const left=[P(p.x,p.y+p.h,z0),P(p.x+p.w,p.y+p.h,z0),P(p.x+p.w,p.y+p.h,z1),P(p.x,p.y+p.h,z1)];
  const right=[P(p.x+p.w,p.y,z0),P(p.x+p.w,p.y+p.h,z0),P(p.x+p.w,p.y+p.h,z1),P(p.x+p.w,p.y,z1)];
  const tip=`${p.f} · ${lines(p.f)} lines · ${fns(p.f)} functions · changed ${chg(p.f)} times · ${cov(p.f)!=null?cov(p.f)+'% lines covered · ':''}${tst(p.f)} tests import it`;
  svg+=`<g class="bld ${sel?'sel':''}" data-city="${esc(p.f)}"><title>${esc(tip)}</title><polygon points="${poly(left)}" fill="${shade(col.startsWith('#')?col:'#bdbcb6',.82)}"/><polygon points="${poly(right)}" fill="${shade(col.startsWith('#')?col:'#bdbcb6',.66)}"/><polygon points="${poly(top)}" fill="${col}"/></g>`});
 // district names on the ground, for the folders big enough to carry one
 districts.filter(d=>d.depth>=1&&d.depth<=2&&d.w*d.h>S*S/50).sort((a,b)=>b.w*b.h-a.w*a.h).forEach(d=>{const[x,y]=P(d.x+d.w/2,d.y+d.h,d.depth*DZ);svg+=`<text x="${x}" y="${y}" dy="1.1em" class="cityname" text-anchor="middle">${esc(d.n.name)}</text>`});
 const minX=P(0,S,0)[0],maxX=P(S,0,0)[0],minY=P(0,0,ZH+40)[1],maxY=P(S,S,0)[1]+30;const z=s.zoom||1;
 const legend=ck==='coverage'?'red for few lines covered, green for many, grey where no report reaches':ck==='changes'?'darker blue for more changes in git':'darker blue for more tests importing it';
 return `<div class="mxbar"><span>height <select id="cityh">${[['functions','functions'],['lines','lines'],['changes','git changes']].map(([k,l])=>`<option value="${k}" ${hk===k?'selected':''}>${l}</option>`).join('')}</select></span>
  <span>colour <select id="cityc">${[['changes','git changes'],['coverage','line coverage'],['tests','tests importing it']].map(([k,l])=>`<option value="${k}" ${ck===k?'selected':''}>${l}</option>`).join('')}</select></span>
  <label><input type="checkbox" id="cityt" ${withTests?'checked':''}> test files too</label>
  <span>zoom <button id="cityzo">−</button> ${Math.round(z*100)}% <button id="cityzi">+</button></span>
  <span class="sub">ground area by lines · ${legend} · a click selects a file for the local trace · a drag pans</span></div>
  <div class="cgdraw pan" data-pan="city"><svg class="city" data-w="${maxX-minX}" data-h="${maxY-minY}" viewBox="${minX} ${minY} ${maxX-minX} ${maxY-minY}">${svg}</svg></div>`}
function cityBind(b){const s=st.city;const on=(id,f)=>{const x=document.getElementById(id);if(x)x.onchange=()=>{f(x);renderKeep()}};
 on('cityh',x=>s.height=x.value);on('cityc',x=>s.colour=x.value);on('cityt',x=>s.tests=x.checked);
 const zb=(id,f)=>{const x=document.getElementById(id);if(x)x.onclick=()=>{s.zoom=Math.max(.5,Math.min(5,(s.zoom||1)*f));renderKeep()}};zb('cityzi',1.25);zb('cityzo',.8);
 b.querySelectorAll('[data-city]').forEach(x=>x.onclick=()=>select(x.dataset.city));
 // at 100% the whole city fits its pane, and the district names keep their size on the screen at every zoom
 const svg=b.querySelector('svg.city');if(!svg)return;const pane=svg.parentElement;const w=+svg.dataset.w,h=+svg.dataset.h;
 const avW=pane.clientWidth-4,avH=(parseFloat(getComputedStyle(pane).maxHeight)||pane.clientHeight)-4;const k=Math.min(avW/w,avH/h)*(s.zoom||1);
 svg.setAttribute('width',Math.round(w*k));svg.setAttribute('height',Math.round(h*k));const shown=[];
 // the labels come largest district first, and a label hitting one already shown stays hidden
 svg.querySelectorAll('.cityname').forEach(t=>{t.style.fontSize=(13/k).toFixed(1)+'px';const r=t.getBoundingClientRect();
  if(shown.some(q=>r.left<q.right&&q.left<r.right&&r.top<q.bottom&&q.top<r.bottom))t.style.display='none';else shown.push(r)})}
// ---- the levelled structure map (Structure101): rows from the top, each row using only the rows below;
// a cycle sits in one tangle box; links show for the clicked box, a use pointing upwards in red
// a drag on the handle between the panes moves the split; the redraw at the end lets a view size itself to its pane
function splitBind(b){const h=b.querySelector('.splitter'),sp=b.querySelector('.split');if(!h||!sp)return;
 h.onmousedown=e=>{e.preventDefault();const top=sp.getBoundingClientRect().top,max=sp.clientHeight-80;h.classList.add('dragging');
  const mv=ev=>{st.splitH=Math.max(80,Math.min(max,ev.clientY-top-3));sp.style.gridTemplateRows=`${st.splitH}px 7px minmax(0,1fr)`};
  const up=()=>{h.classList.remove('dragging');removeEventListener('mousemove',mv);removeEventListener('mouseup',up);renderKeep()};addEventListener('mousemove',mv);addEventListener('mouseup',up)};
 h.ondblclick=()=>{st.splitH=null;renderKeep()}}
// a new window size redraws the page, so every pane, canvas and drawing fills the space it has
let resizeT;addEventListener('resize',()=>{clearTimeout(resizeT);resizeT=setTimeout(()=>renderKeep(),120)});
function levelsBind(){const x=document.getElementById('lvmin');if(x)x.onchange=()=>{st.dg.lmin=+x.value;renderKeep()}}
// the map opens at the lowest threshold where a link crosses between two cycles, so it draws more than one row
function splitMin(m,ids){const ws=[...new Set(m.values())].sort((a,b)=>a-b);
 for(const t of ws){const es=[...m].filter(([,v])=>v>=t).map(([k])=>k.split('\u0001'));const comps=tarjan(ids,new Map(es.map(([a,b])=>[K(a,b),1])));const of=new Map();comps.forEach((c,i)=>c.forEach(x=>of.set(x,i)));
  if(es.some(([a,b])=>of.has(a)&&of.has(b)&&of.get(a)!==of.get(b)))return t}return 1}
function levelsView(){const s=st.dg;const src=s.src||'code';const m=doDeps(src);const ids=items('do').map(n=>n.id);if(s.lminFor!==src){s.lminFor=src;s.lmin=splitMin(m,ids)}const min=s.lmin;
 const edges=[...m].filter(([,v])=>v>=min).map(([k])=>k.split('\u0001'));const wt=(a,b)=>m.get(K(a,b))||1;
 const comps=tarjan(ids,new Map(edges.map(([a,b])=>[K(a,b),1])));const compOf=new Map();comps.forEach((c,i)=>c.forEach(x=>compOf.set(x,i)));
 // levels over the tangles: a tangle counts as one node, and its level is the longest chain of uses below it
 const cu=new Map();edges.forEach(([a,b])=>{const x=compOf.get(a),y=compOf.get(b);if(x!==y)(cu.get(x)||cu.set(x,new Set()).get(x)).add(y)});
 const lvl=new Map();const L=c=>{if(lvl.has(c))return lvl.get(c);lvl.set(c,0);const v=Math.max(0,...[...(cu.get(c)||[])].map(y=>L(y)+1));lvl.set(c,v);return v};comps.forEach((_,i)=>L(i));
 const top=Math.max(...lvl.values());const rows=Array.from({length:top+1},()=>[]);comps.forEach((c,i)=>rows[top-lvl.get(i)].push(c));
 const BW=150,BH=30,GX=12,GY=46,PADT=10;let y=10,svg='',boxes=new Map();const W=1100;
 rows.forEach((row,r)=>{let x=90,rowH=BH;svg+=`<text x="8" y="${y+20}" class="lvl">level ${top-r}</text>`;
  row.forEach(c=>{const tangle=c.length>1;const cols=tangle?Math.min(c.length,4):1;const tw=cols*BW+(cols-1)*6+(tangle?16:0),th=Math.ceil(c.length/cols)*(BH+6)-6+(tangle?16+PADT:0);
   if(x+tw>W){x=90;y+=rowH+14;rowH=BH}
   if(tangle)svg+=`<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="6" class="tangle"/><text x="${x+8}" y="${y+12}" class="tl">tangle of ${c.length}</text>`;
   c.sort().forEach((id,i)=>{const bx=x+(tangle?8:0)+(i%cols)*(BW+6),by=y+(tangle?8+PADT:0)+Math.floor(i/cols)*(BH+6);boxes.set(id,{x:bx,y:by})});
   x+=tw+GX;rowH=Math.max(rowH,th)});y+=rowH+GY});
 let lines='';if(s.hl&&boxes.has(s.hl))edges.forEach(([a,b])=>{if(a!==s.hl&&b!==s.hl)return;const A=boxes.get(a),B=boxes.get(b);const up=lvl.get(compOf.get(b))>lvl.get(compOf.get(a))||compOf.get(a)===compOf.get(b);
  lines+=`<line x1="${A.x+BW/2}" y1="${A.y+BH/2}" x2="${B.x+BW/2}" y2="${B.y+BH/2}" stroke="${up?'#d03b3b':'#52514e'}" stroke-width="2" opacity=".8" marker-end="url(#arrow${up?'r':'g'})"/>`});
 let bx='';boxes.forEach((p,id)=>{const dim=s.hl&&s.hl!==id&&!edges.some(([a,b])=>(a===s.hl&&b===id)||(b===s.hl&&a===id));bx+=`<g data-node="${esc(id)}" transform="translate(${p.x},${p.y})" opacity="${dim?.35:1}"><rect width="${BW}" height="${BH}" rx="3" class="box ${id===s.hl?'root':''}"/><text x="8" y="19" class="bt">${esc(N[id].name)}</text></g>`});
 const tangled=comps.filter(c=>c.length>1).reduce((t,c)=>t+c.length,0);
 return `<div class="mxbar"><span>links from <select id="dgsrc"><option value="code" ${src==='code'?'selected':''}>code imports</option><option value="notes" ${src==='notes'?'selected':''}>links between notes</option></select></span>
  <span>at least <select id="lvmin">${[...new Set([1,2,5,10,20,min])].sort((a,b)=>a-b).map(v=>`<option ${min===v?'selected':''}>${v}</option>`).join('')}</select> imports a link</span>
  <span class="sub">a row uses only the rows below it · ${tangled?`${tangled} design outputs sit in tangles, where every one reaches every other`:'no tangles'} · a click on a box draws its links, a use pointing up in red</span></div>
  <div class="cgdraw pan" data-pan="levels"><svg class="diagram" width="${W+20}" height="${y+10}"><defs><marker id="arrowr" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#d03b3b"/></marker><marker id="arrowg" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#52514e"/></marker></defs>${svg}${lines}${bx}</svg></div>`}
// ---- inside a block: a double-click opens a design output into its code files and their imports, as a Simulink
// subsystem opens; the outputs it touches stand at the edges as ports, callers left and callees right
function blockInside(id){const s=st.dg;const files=items('code').map(n=>n.id).filter(f=>primaryDo(f)===id);const inside=new Set(files);
 const edges=[],inPorts=new Set(),outPorts=new Set();
 files.forEach(f=>(D.imports[f]||[]).forEach(q=>{if(N[q]?.lv!=='code')return;if(inside.has(q))edges.push([f,q]);else{const d=primaryDo(q);if(d&&d!==id){outPorts.add('out:'+d);edges.push([f,'out:'+d])}}}));
 items('code').forEach(n=>{if(inside.has(n.id))return;(D.imports[n.id]||[]).forEach(q=>{if(inside.has(q)){const d=primaryDo(n.id);if(d&&d!==id){inPorts.add('in:'+d);edges.push(['in:'+d,q])}}})});
 const lay=layered(files,edges.filter(([a,b])=>inside.has(a)&&inside.has(b))).layer;const deep=Math.max(0,...[...lay.values()]);
 const fixed=new Map();files.forEach(f=>fixed.set(f,1+lay.get(f)));inPorts.forEach(p=>fixed.set(p,0));outPorts.forEach(p=>fixed.set(p,deep+2));
 const all=[...inPorts,...files,...outPorts];const port=x=>x.startsWith('in:')||x.startsWith('out:');const nm=x=>port(x)?N[x.split(':').slice(1).join(':')].name:N[x].name;
 const svg=drawLayered(all,edges,{label:nm,width:200,height:36,gapX:70,fixedLayer:fixed,hl:s.hlIn,cls:x=>port(x)?'port':'',sub:(x,w)=>`<text x="8" y="29" class="bs">${port(x)?(x.startsWith('in:')?'port in: uses this block':'port out: this block uses it'):`${D.loc[x]||0} lines · ${(D.calls[x]||[]).length} functions`}</text>`});
 return `<div class="mxbar"><span class="sub">inside ${esc(N[id].name)}: its code files and their imports · ports stand at the edges, ${inPorts.size} in and ${outPorts.size} out · a double-click on a port opens that block · the breadcrumbs lead back out</span></div><div class="cgdraw pan" data-pan="inside">${svg}</div>`}
// every panned view zooms with Ctrl and the wheel, around the pointer, and keeps its zoom across a redraw
function zoomBind(b){st.zooms=st.zooms||{};b.querySelectorAll('.pan').forEach(el=>{const key=el.dataset.pan||'';const kid=el.firstElementChild;if(!kid)return;kid.style.zoom=st.zooms[key]||1;
 el.onwheel=e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const z0=st.zooms[key]||1,z1=Math.max(.3,Math.min(5,z0*(e.deltaY<0?1.12:1/1.12)));const r=el.getBoundingClientRect();
  const px=e.clientX-r.left+el.scrollLeft,py=e.clientY-r.top+el.scrollTop;st.zooms[key]=z1;kid.style.zoom=z1;el.scrollLeft=px*z1/z0-(e.clientX-r.left);el.scrollTop=py*z1/z0-(e.clientY-r.top)}})}
// the call graph with no file selected: the top files, which no other file imports, and what they import
function callFiles(){const importers=new Map();items('code').forEach(n=>(D.imports[n.id]||[]).forEach(q=>{if(N[q]?.lv==='code')(importers.get(q)||importers.set(q,[]).get(q)).push(n.id)}));
 const tops=items('code').map(n=>n.id).filter(f=>!(importers.get(f)||[]).length);
 CT.calls={jump:x=>select(x),add:x=>select(x)};
 return `<div class="mxbar"><span>levels each way ${[1,2,3,4].map(d=>`<button class="dep ${(st.cg.depth||1)===d?'on':''}" data-cgd="${d}">${d}</button>`).join('')}</span><span class="sub">no file selected, so the top files stand in the middle: no other code file imports them · what they import to the right · a click opens a file's functions</span></div>`+
  traceColumns('calls',{centers:tops,left:x=>importers.get(x)||[],right:x=>(D.imports[x]||[]).filter(q=>N[q]?.lv==='code'),depth:st.cg.depth||1,label:x=>N[x].name,sub:x=>`${D.loc[x]||0} lines`,group:null,leftName:'imported by',rightName:'imports'})}
