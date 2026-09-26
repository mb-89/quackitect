import os
S=os.path.dirname(os.path.abspath(__file__))
data=open(S+'/tree.json').read()
html=r'''<!doctype html><html><head><meta charset="utf-8"><title>Trace view</title>
<style>
:root{--bg:#fcfcfb;--ink:#0b0b0b;--ink2:#52514e;--rule:#e4e3df;--head:#f3f2ef;--hi:#e8f0fb;--fill:#2a78d6;--off:#ecebe7;--refine:#8a8984;--ver:#2a78d6;--val:#eb6834;--src:#1baf7a}
@media (prefers-color-scheme:dark){:root{--bg:#1a1a19;--ink:#fff;--ink2:#c3c2b7;--rule:#383835;--head:#242423;--hi:#1c2b40;--fill:#3987e5;--off:#2c2c2a;--ver:#3987e5;--val:#d95926;--src:#199e70}}
*{box-sizing:border-box}body{background:var(--bg);color:var(--ink);font:13px/1.4 system-ui,sans-serif;margin:0;display:grid;grid-template-columns:210px 1fr;height:100vh}
nav{border-right:1px solid var(--rule);padding:14px;background:var(--head);overflow:auto}nav h1{font-size:14px;margin:0 0 8px}nav p{color:var(--ink2);font-size:12px}nav label{display:block;margin:3px 0}
.page{display:flex;flex-direction:column;min-width:0}
.top{display:flex;align-items:center;border-bottom:1px solid var(--rule);padding:6px 14px;gap:12px;position:relative}
.crumbs{display:flex;align-items:center;gap:2px;flex-wrap:wrap;flex:1}
.crumb{padding:2px 6px;border-radius:4px;cursor:pointer}.crumb:hover{background:var(--hi)}.crumb.last{font-weight:600}
.chev{padding:2px 5px;border-radius:4px;cursor:pointer;color:var(--ink2)}.chev:hover{background:var(--hi);color:var(--ink)}
.menu{position:absolute;top:34px;background:var(--bg);border:1px solid var(--rule);border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,.15);max-height:360px;overflow:auto;min-width:240px;z-index:5;padding:4px}
.menu div{padding:3px 8px;border-radius:4px;cursor:pointer;white-space:nowrap}.menu div:hover{background:var(--hi)}.menu small{color:var(--ink2)}
.views{display:flex}.views button{border:1px solid var(--rule);background:var(--bg);color:var(--ink);padding:3px 10px;cursor:pointer;margin-left:-1px}.views button:first-child{border-radius:4px 0 0 4px}.views button:last-child{border-radius:0 4px 4px 0}.views button.on{background:var(--hi);border-color:var(--fill);position:relative}
.body{padding:10px 14px 20px;overflow:auto;flex:1}
table{border-collapse:collapse;width:100%;max-width:900px}th,td{text-align:left;padding:4px 8px;border-bottom:1px solid var(--rule)}th{font-weight:600;background:var(--head)}
.tw{cursor:pointer;display:inline-block;width:14px;color:var(--ink2)}
.name{cursor:pointer}.name:hover{text-decoration:underline}.open{color:var(--ink2);margin-left:4px;font-size:11px;cursor:pointer}
.rel{font-size:11px;padding:0 5px;border-radius:8px;border:1px solid var(--rule);color:var(--ink2);margin-left:6px}.rel.refines{border-color:var(--fill);color:var(--fill)}
.bars{display:grid;grid-template-columns:40px 80px 34px;gap:1px 6px;align-items:center;font-size:12px;color:var(--ink2)}
.bar{height:7px;background:var(--off);border-radius:4px;overflow:hidden}.bar i{display:block;height:100%;background:var(--fill)}
.num{text-align:right;font-variant-numeric:tabular-nums}
.cols{display:flex;border:1px solid var(--rule);border-radius:6px;overflow-x:auto;height:calc(100vh - 80px)}
.col{min-width:230px;max-width:260px;border-right:1px solid var(--rule);overflow:auto}.col h4{margin:0;padding:6px 10px;background:var(--head);position:sticky;top:0;font-size:12px}
.item{padding:5px 10px;cursor:pointer;border-bottom:1px solid var(--rule);display:flex;justify-content:space-between;gap:6px}.item:hover{background:var(--hi)}.item.sel{background:var(--hi);box-shadow:inset 3px 0 0 var(--fill)}
.item .n{color:var(--ink2);font-size:12px}.item.gap{color:var(--ink2);font-style:italic}
#stage{position:relative}
.tile{position:absolute;border:1px solid var(--rule);border-radius:5px;padding:3px 8px;background:var(--bg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;height:26px;font-size:12.5px}
.tile.live{cursor:pointer}.tile.live:hover{border-color:var(--fill)}.tile small{color:var(--ink2);margin-left:5px}.tile.src{border-style:dashed}
.lab{position:absolute;font-size:10.5px;background:var(--bg);padding:0 2px;border-radius:3px;white-space:nowrap;transform:translate(-50%,-50%);font-variant-numeric:tabular-nums}
.legend{font-size:12px;color:var(--ink2)}.legend span{display:inline-block;width:18px;border-top:2px solid;vertical-align:3px;margin:0 4px 0 10px}
.split{display:grid;grid-template-rows:minmax(0,1fr) minmax(0,1fr);height:calc(100vh - 70px);gap:10px}.topv{overflow:auto;min-height:0}.botv{overflow:auto;border-top:1px solid var(--rule);padding-top:8px;min-height:0}
.split .cols{height:100%}.selrow td{background:var(--hi)}tr[data-s]{cursor:pointer}
.ltbar{margin-bottom:6px}.dep{border:1px solid var(--rule);background:var(--bg);color:var(--ink);padding:1px 8px;border-radius:4px;cursor:pointer}.dep.on{border-color:var(--fill);background:var(--hi)}
.ltwrap{position:relative}.lt{position:absolute;height:24px;border:1px solid var(--rule);border-radius:5px;padding:2px 8px;background:var(--bg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;font-size:12.5px}.lt:hover{border-color:var(--fill)}.lt.me{border:2px solid var(--fill);font-weight:600}
.lth{position:absolute;font-size:11px;color:var(--ink2)}.lth .n{margin-left:4px}.more{position:absolute;font-size:11px;color:var(--ink2)}.sub{color:var(--ink2);font-size:12px}.col h4 .n{color:var(--ink2);font-weight:400}
.back{border:1px solid var(--rule);background:var(--bg);color:var(--ink);border-radius:4px;padding:1px 8px;margin-right:6px;cursor:pointer}.back:disabled{opacity:.4;cursor:default}a.open{color:var(--ink2);margin-left:5px;font-size:11px;cursor:pointer;text-decoration:none}
</style></head><body>
<nav><h1>Trace view</h1>
<p>The overview opens as the V or as columns through every level. A level page opens as a tree or as columns. The tree is the default.</p>
<p><label><input type="radio" name="m" value="today" checked> main today</label><label><input type="radio" name="m" value="imagined"> imagined values</label></p>
<p>A click on a row selects it, and the local trace below draws it. A name on another level jumps to that level. In columns a click adds to the selection. ↗ opens the note, which the real view does on a click.</p>
<p>Line coverage on code files is imagined until a coverage tool runs.</p><p>Only declared links stand here. A related link stays out of the trace.</p></nav>
<div class="page"><div class="top"><div class="crumbs" id="crumbs"></div><div class="views" id="views"></div></div><div class="body" id="body"></div></div>
<script>
const D=__DATA__;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ---- rows of main today
const LV=[{id:'di',name:'Design inputs',views:['tree','columns']},{id:'do',name:'Design outputs',views:['tree','columns']},{id:'sec',name:'Sections',views:['tree','columns']},{id:'file',name:'Code and test files'}];
const N={};D.notes.forEach(n=>N[n.id]={id:n.id,lv:n.kind==='design_input'?'di':'do',name:n.name});
D.secs.forEach(s=>N[s.id]={id:s.id,lv:'sec',name:s.title,note:s.note,parent:s.parent,code:s.code,test:s.test});
D.secs.forEach(s=>[...s.code.map(f=>[f,'code']),...s.test.map(f=>[f,'test'])].forEach(([f,k])=>{(N[f]??={id:f,lv:'file',name:f.split('/').slice(-2).join('/'),kind:k,secs:[]}).secs.push(s.id)}));
function children(id){const n=N[id];const out=[];
 if(n.lv==='di')D.notes.filter(x=>x.kind==='design_output'&&(D.refines[x.id]||[]).includes(id)).forEach(x=>out.push({id:x.id,rel:'refines'}));
 if(n.lv==='do')D.secs.filter(s=>s.note===id).forEach(s=>out.push({id:s.id}));
 if(n.lv==='sec'){n.code.forEach(f=>out.push({id:f,rel:'code'}));n.test.forEach(f=>out.push({id:f,rel:'test'}))}
 return out}
function parents(id){const n=N[id];if(n.lv==='do')return (D.refines[id]||[]).map(p=>({id:p,rel:'refines'}));if(n.lv==='sec')return [{id:n.note}];if(n.lv==='file')return n.secs.map(s=>({id:s,rel:n.kind}));return []}
const items=lv=>Object.values(N).filter(n=>n.lv===lv).sort((a,b)=>a.name.localeCompare(b.name));
function secsUnder(id){const n=N[id];if(n.lv==='di')return children(id).flatMap(c=>secsUnder(c.id));if(n.lv==='do')return D.secs.filter(s=>s.note===id);if(n.lv==='sec')return [D.secs.find(s=>s.id===id)];return []}
function bars(id){if(N[id].lv==='file'){if(N[id].kind!=='code')return '';const v=lineCov(id);return `<div class="bars" title="imagined until a coverage tool runs"><span>lines</span><div class="bar"><i style="width:${v}%"></i></div><span>${v}%</span></div>`}const S=secsUnder(id);if(!S.length)return '';const c=Math.round(100*S.filter(s=>s.code.length).length/S.length),t=Math.round(100*S.filter(s=>s.test.length).length/S.length);
 return `<div class="bars" title="${S.length} sections below"><span>code</span><div class="bar"><i style="width:${c}%"></i></div><span>${c}%</span><span>tests</span><div class="bar"><i style="width:${t}%"></i></div><span>${t}%</span></div>`}
const pill=r=>r&&r.rel?`<span class="rel ${r.rel}">${r.rel}</span>`:'';
// ---- the V
const TARGET=[{id:'vision',name:'Vision'},{id:'value_prop',name:'Value props',from:['vision']},{id:'story',name:'User stories',from:['value_prop']},{id:'use_case',name:'Use cases',from:['story']},
 {id:'standard',name:'Standards',source:true},{id:'requirement',name:'Requirements',from:['use_case','standard']},{id:'function',name:'Functions',from:['requirement']},{id:'architecture',name:'Architecture',from:['function']},
 {id:'element',name:'Design elements',from:['architecture']},{id:'impl',name:'Implementations',from:['element']},{id:'test_case',name:'Test cases',verifies:['requirement'],from:['impl']},
 {id:'test_result',name:'Test results',from:['test_case']},{id:'demo',name:'Demonstrations',validates:['story'],from:['test_result']}];
const TODAY=[{id:'di',name:'Design inputs'},{id:'do',name:'Design outputs',from:['di']},{id:'sec',name:'Sections',from:['do']},{id:'code',name:'Code files',from:['sec']},{id:'test',name:'Test files',verifies:['sec'],from:['code']}];
const NI={vision:1,value_prop:6,story:40,use_case:28,standard:12,requirement:140,function:60,architecture:24,element:180,impl:610,test_case:420,test_result:420,demo:36};
const CI={'value_prop<vision':[100,100],'story<value_prop':[95,100],'use_case<story':[93,88],'requirement<use_case':[92,90],'requirement<standard':[31,83],'function<requirement':[92,81],'architecture<function':[88,95],'element<architecture':[90,86],'impl<element':[89,78],'test_case~requirement':[96,74],'test_result<test_case':[100,97],'demo~story':[100,62]};
function todayStats(){const fs=Object.values(N).filter(n=>n.lv==='file');const code=fs.filter(f=>f.kind==='code'),test=fs.filter(f=>f.kind==='test');
 const dos=items('do'),dis=items('di');const sec=D.secs;const pc=a=>Math.round(100*a);
 return {n:{di:dis.length,do:dos.length,sec:sec.length,code:code.length,test:test.length},
 c:{'do<di':[pc(dos.filter(d=>(D.refines[d.id]||[]).length).length/dos.length),pc(dis.filter(d=>children(d.id).length).length/dis.length)],'sec<do':[100,100],
   'code<sec':[100,pc(sec.filter(s=>s.code.length).length/sec.length)],'test~sec':[100,pc(sec.filter(s=>s.test.length).length/sec.length)],'test<code':[100,LINES_ALL]}}}
const lineCov=f=>{let h=0;for(const ch of f)h=(h*31+ch.charCodeAt(0))>>>0;return 35+h%63};
const LINES_ALL=(()=>{const fs=Object.values(N).filter(n=>n.lv==='file'&&n.kind==='code');return Math.round(fs.reduce((a,f)=>a+lineCov(f.id),0)/fs.length)})();
const mode=()=>document.querySelector('input[name=m]:checked').value;
// the V: the main levels sit on two straight arms, a check level at the height of the level it checks
function drawV(){const today=mode()==='today';const L=today?TODAY:TARGET;const T=today?todayStats():null;
 const L2=L.map(l=>({...l,from:l.from||[],verifies:l.verifies||[],validates:l.validates||[]}));const byId=Object.fromEntries(L2.map(l=>[l.id,l]));
 const check=l=>l.verifies.length||l.validates.length;const right=new Set(L2.filter(check).map(l=>l.id));let g=1;while(g){g=0;L2.forEach(l=>{if(!right.has(l.id)&&l.from.some(f=>right.has(f))){right.add(l.id);g=1}})}
 const left=L2.filter(l=>!right.has(l.id)&&!l.source);const d={};left.forEach(l=>{const f=l.from.filter(x=>!byId[x].source);d[l.id]=f.length?1+Math.max(...f.map(x=>d[x])):0});
 const B=Math.max(...Object.values(d));
 // a right level sits at the height of what it checks, or one step above the level it comes from
 const rd={};const rdepth=l=>rd[l.id]??=(check(l)?d[(l.verifies[0]||l.validates[0])]:rdepth(byId[l.from.find(f=>right.has(f))])-1);
 L2.filter(l=>right.has(l.id)).forEach(rdepth);
 const TW=172,DY=42,DXL=38,MARGIN=200;const pos={};const cx=MARGIN+B*DXL;const rl=L2.filter(l=>right.has(l.id)&&rd[l.id]<B);const DXR=Math.max(54,...rl.map(l=>(TW+170+MARGIN+rd[l.id]*DXL-cx)/(B-rd[l.id])));
 left.forEach(l=>{const k=d[l.id];pos[l.id]={x:MARGIN+k*DXL,y:k*DY}});
 L2.filter(l=>right.has(l.id)).forEach(l=>{const k=rd[l.id];pos[l.id]={x:cx+(B-k)*DXR,y:k*DY}});
 L2.filter(l=>l.source).forEach(l=>{const k=L2.find(x=>x.from.includes(l.id));pos[l.id]={x:pos[k.id].x-TW-60,y:pos[k.id].y}});
 const X0=Math.max(0,10-Math.min(...Object.values(pos).map(p=>p.x)));Object.values(pos).forEach(p=>p.x+=X0);
 const W=Math.max(...Object.values(pos).map(p=>p.x))+TW+20;const H=(B+1)*DY+6;
 const cov=k=>today?T.c[k]:CI[k];
 // the colour runs from red at the weakest link in view to green at the strongest
 const keys=[];L2.forEach(l=>{l.from.forEach(f=>keys.push(l.id+'<'+f));l.verifies.forEach(v=>keys.push(l.id+'~'+v));l.validates.forEach(v=>keys.push(l.id+'~'+v))});
 const weak=k=>{const v=cov(k);return v?Math.min(v[0],v[1]):null};const vals=keys.map(weak).filter(v=>v!=null);const lo=Math.min(...vals),hi=Math.max(...vals);
 const colour=k=>{const v=weak(k);if(v==null)return 'var(--refine)';const t=hi>lo?(v-lo)/(hi-lo):1;const a=[208,59,59],m=[214,160,20],z=[12,163,12];const mix=(p,q,s)=>p.map((x,i)=>Math.round(x+(q[i]-x)*s));const c=t<.5?mix(a,m,t*2):mix(m,z,(t-.5)*2);return `rgb(${c})`};
 let svg=`<svg width="${W}" height="${H}" style="position:absolute;left:0;top:0">`,labs='';
 const anchor=p=>({x:p.x+TW/2,y:p.y+13});
 const line=(a,b,k,dash,word)=>{const A=anchor(pos[a]),B2=anchor(pos[b]);const c=colour(k);const v=cov(k);svg+=`<line x1="${A.x}" y1="${A.y}" x2="${B2.x}" y2="${B2.y}" stroke="${c}" stroke-width="2.2" ${dash?'stroke-dasharray="5 4"':''}/>`;
  if(v||word)labs+=`<div class="lab" style="left:${(A.x+B2.x)/2}px;top:${(A.y+B2.y)/2}px;color:${c}">${word?word+' ':''}${v?`▲${v[0]} ▼${v[1]}`:''}</div>`};
 L2.forEach(l=>{l.from.forEach(f=>line(f,l.id,l.id+'<'+f,byId[f].source,today&&l.id==='test'?'covers lines':''));l.verifies.forEach(v=>line(l.id,v,l.id+'~'+v,0,'verifies'));l.validates.forEach(v=>line(l.id,v,l.id+'~'+v,0,'validates'))});
 const lvOf={di:'di',do:'do',sec:'sec',code:'file',test:'file'};
 const tiles=L2.map(l=>`<div class="tile ${l.source?'src':''} ${today?'live':''}" ${today?`data-lv="${lvOf[l.id]}"`:''} style="left:${pos[l.id].x}px;top:${pos[l.id].y}px;width:${TW}px"><b>${l.name}</b><small>${today?T.n[l.id]:NI[l.id]}</small></div>`).join('');
 return `<p class="legend">A link runs from red at the weakest in view to green at the strongest, by the lower of its two shares. <span style="border-color:var(--refine);border-top-style:dashed"></span>second source · ▲ share of the lower level reaching up · ▼ share of the upper level reached${today?' · a click on a tile opens its level':''}</p><div id="stage" style="width:${W}px;height:${H}px">${svg}</svg>${tiles}${labs}</div>`}

// ---- navigation: overview, a level, an item selected on its level
const ORDER=['di','do','sec','file'];
let st={at:null,view:'v',depth:1},open=new Set(),cols=[];const hist=[];const remember=()=>hist.push({at:st.at,view:st.view});
function back(){const h=hist.pop();if(!h)return;st.at=h.at;st.view=h.view;open.clear();cols=[];st.scrollTo=!!(h.at&&h.at.id);render()}
document.addEventListener('mouseup',e=>{if(e.button===3){e.preventDefault();back()}});document.addEventListener('keydown',e=>{if(e.altKey&&e.key==='ArrowLeft')back()});
const lvName=id=>LV.find(l=>l.id===id).name;
function go(at){remember();st.at=at;st.scrollTo=!!(at&&at.id);open.clear();cols=[];const vs=viewsHere();if(!vs.includes(st.view))st.view=vs[0];render()}
const viewsHere=()=>!st.at?['v','columns']:(LV.find(l=>l.id===st.at.lv).views||['tree']);
const jump=id=>go({lv:N[id].lv,id});
const select=id=>{remember();st.at={...st.at,id};renderKeep()};
function crumbs(){const el=document.getElementById('crumbs');const a=st.at;let parts=[{label:'Overview',act:()=>go(null),menu:()=>LV.map(l=>({label:l.name,sub:items(l.id).length,act:()=>go({lv:l.id})}))}];
 if(a)parts.push({label:lvName(a.lv),act:()=>go({lv:a.lv}),menu:()=>items(a.lv).map(n=>({label:n.name,act:()=>jump(n.id)}))});
 if(a&&a.id)parts.push({label:N[a.id].name,act:()=>jump(a.id),menu:()=>children(a.id).map(k=>({label:N[k.id].name,sub:k.rel||'',act:()=>jump(k.id)}))});
 el.innerHTML=`<button class="back" id="back" title="back, or the mouse's back button" ${hist.length?'':'disabled'}>←</button>`+parts.map((p,i)=>`<span class="crumb ${i===parts.length-1?'last':''}" data-c="${i}">${esc(p.label)}</span><span class="chev" data-m="${i}">›</span>`).join('');
 document.getElementById('back').onclick=back;el.querySelectorAll('[data-c]').forEach(x=>x.onclick=()=>parts[+x.dataset.c].act());
 el.querySelectorAll('[data-m]').forEach(x=>x.onclick=e=>{e.stopPropagation();closeMenu();const its=parts[+x.dataset.m].menu();const m=document.createElement('div');m.className='menu';m.style.left=(x.offsetLeft+14)+'px';
  m.innerHTML=its.length?its.map((it,j)=>`<div data-j="${j}">${esc(it.label)} <small>${esc(it.sub??'')}</small></div>`).join(''):'<div><small>nothing below</small></div>';document.querySelector('.top').appendChild(m);m.querySelectorAll('[data-j]').forEach(dd=>dd.onclick=()=>its[+dd.dataset.j].act())})}
function closeMenu(){document.querySelectorAll('.menu').forEach(m=>m.remove())}document.addEventListener('click',closeMenu);
// the tree: the level's items, a row opens one level deep
function row(r,depth){const kids=children(r.id);const isOpen=depth===0&&open.has(r.id);const sel=st.at.id===r.id;
 let h=`<tr class="${sel?'selrow':''}" data-s="${esc(r.id)}"><td style="padding-left:${8+depth*20}px"><span class="tw" ${depth===0&&kids.length?`data-t="${esc(r.id)}"`:''}>${depth===0&&kids.length?(isOpen?'▾':'▸'):''}</span><span class="name" data-j="${esc(r.id)}">${esc(N[r.id].name)}</span><a class="open" title="open the note">↗</a>${pill(r)}</td><td class="num">${kids.length||''}</td><td>${bars(r.id)}</td></tr>`;
 if(isOpen)kids.forEach(k=>h+=row(k,1));return h}
function tree(){return `<table><tr><th>name</th><th class="num">below</th><th>coverage</th></tr>${items(st.at.lv).map(n=>row({id:n.id},0)).join('')}</table>`}
// columns: one column a level, the header is the level, a click adds to the selection
const orphans=()=>items('do').filter(d=>!(D.refines[d.id]||[]).length).map(d=>d.id);
function columns(){const start=st.at?st.at.lv:'di';
 if(!cols.length)cols=[{lv:start,items:items(start).map(n=>n.id),sel:new Set(st.at&&st.at.id?[st.at.id]:[])}];
 for(let i=0;i<cols.length;i++){const c=cols[i];const nx=ORDER[ORDER.indexOf(c.lv)+1];
  if(!c.sel.size||!nx){cols=cols.slice(0,i+1);break}
  const ids=[...new Set([...c.sel].flatMap(id=>id==='gap'?orphans():children(id).map(k=>k.id)))];
  const prev=cols[i+1];cols[i+1]={lv:nx,items:ids,sel:new Set(prev?[...prev.sel].filter(x=>ids.includes(x)):[])}}
 const gap=!st.at?orphans().length:0;
 let h='<div class="cols">';cols.forEach((c,ci)=>{h+=`<div class="col"><h4>${lvName(c.lv)} <span class="n">${c.items.length}</span></h4>`+c.items.map(id=>`<div class="item ${c.sel.has(id)?'sel':''}" data-ci="${ci}" data-id="${esc(id)}"><span>${esc(N[id].name)}</span><span class="n">${children(id).length||''}</span></div>`).join('')+
  (ci===0&&gap?`<div class="item gap ${c.sel.has('gap')?'sel':''}" data-ci="0" data-id="gap"><span>no design input yet</span><span class="n">${gap}</span></div>`:'')+'</div>'});return h+'</div>'}
// the local trace: the selected item in the middle, what it comes from on the left, what it feeds on the right
function ring(id,dir,depth){const out=[];let front=[id];const seen=new Set([id]);for(let k=0;k<depth;k++){const nx=[];front.forEach(f=>(dir<0?parents(f):children(f)).forEach(r=>{if(!seen.has(r.id)){seen.add(r.id);nx.push({id:r.id,from:f})}else{const e=nx.find(x=>x.id===r.id);if(e)(e.also??=[]).push(f)}}));out.push(nx);front=nx.map(x=>x.id)}return out}
function local(){const id=st.at&&st.at.id;if(!id)return '<p class="sub">Select an item above, and its local trace draws here.</p>';
 const up=ring(id,-1,st.depth).filter(c=>c.length).reverse(),down=ring(id,1,st.depth).filter(c=>c.length);const C=[...up,[{id}],...down];const CAP=1e9,CW=210,CH=30,G=46;
 const pos={};let H=CH;C.forEach((col,i)=>{col.slice(0,CAP).forEach((n,j)=>{pos[n.id]={x:i*(CW+G),y:j*CH}});H=Math.max(H,Math.min(col.length,CAP+1)*CH)});
 const tallest=Math.min(C.reduce((m,c)=>Math.max(m,c.length),1),CAP);pos[id].y=((tallest-1)*CH)/2;
 const ci=up.length;let svg=`<svg width="${C.length*(CW+G)}" height="${H+10}" style="position:absolute;left:0;top:0">`;
 const link=(a,b)=>{if(!pos[a]||!pos[b])return;const L=pos[a].x<pos[b].x?pos[a]:pos[b],R=pos[a].x<pos[b].x?pos[b]:pos[a];const x1=L.x+CW,x2=R.x,y1=L.y+12,y2=R.y+12;svg+=`<path d="M${x1} ${y1} C${x1+G/2} ${y1},${x2-G/2} ${y2},${x2} ${y2}" stroke="var(--refine)" fill="none" stroke-width="1.2"/>`};
 C.forEach(col=>col.slice(0,CAP).forEach(n=>{if(n.from){link(n.from,n.id);(n.also||[]).forEach(f=>link(f,n.id))}}));
 let cards='';C.forEach((col,i)=>{col.slice(0,CAP).forEach(n=>{const p=pos[n.id];cards+=`<div class="lt ${n.id===id?'me':''}" data-s="${esc(n.id)}" style="left:${p.x}px;top:${p.y}px;width:${CW}px">${esc(N[n.id].name)}<a class="open" title="open the note">↗</a></div>`});
  if(col.length>CAP)cards+=`<div class="more" style="left:${i*(CW+G)}px;top:${CAP*CH}px">and ${col.length-CAP} more</div>`});
 const heads=C.map((col,i)=>`<div class="lth" style="left:${i*(CW+G)}px;width:${CW}px">${col.length?lvName(N[col[0].id].lv):'nothing'} ${i===ci?'':`<span class="n">${col.length}</span>`}</div>`).join('');
 return `<div class="ltbar"><b>Local trace</b> <span class="sub">levels each way</span> ${[1,2,3].map(d=>`<button class="dep ${st.depth===d?'on':''}" data-d="${d}">${d}</button>`).join('')}</div><div class="ltwrap"><div style="position:relative;height:18px">${heads}</div><div style="position:relative;height:${H+10}px">${svg}</svg>${cards}</div></div>`}
function renderKeep(){const b=document.getElementById('topv');const keep=b?b.scrollTop:0;render();const b2=document.getElementById('topv');if(b2)b2.scrollTop=keep}
function render(){crumbs();const v=document.getElementById('views'),b=document.getElementById('body');
 v.innerHTML=viewsHere().map(k=>`<button class="${st.view===k?'on':''}" data-v="${k}">${k==='v'?'V':k}</button>`).join('');v.querySelectorAll('button').forEach(x=>x.onclick=()=>{st.view=x.dataset.v;cols=[];render()});
 const main=st.view==='v'?drawV():st.view==='columns'?columns():tree();
 b.innerHTML=st.at?`<div class="split"><div class="topv" id="topv">${main}</div><div class="botv">${local()}</div></div>`:main;
 b.querySelectorAll('[data-lv]').forEach(x=>x.onclick=()=>go({lv:x.dataset.lv}));
 b.querySelectorAll('[data-t]').forEach(x=>x.onclick=e=>{e.stopPropagation();open.has(x.dataset.t)?open.delete(x.dataset.t):open.add(x.dataset.t);renderKeep()});
 b.querySelectorAll('.name[data-j]').forEach(x=>x.onclick=e=>{e.stopPropagation();const id=x.dataset.j;N[id].lv===st.at.lv?select(id):jump(id)});
 b.querySelectorAll('tr[data-s]').forEach(x=>x.onclick=()=>select(x.dataset.s));
 b.querySelectorAll('.lt[data-s]').forEach(x=>x.onclick=()=>jump(x.dataset.s));
 b.querySelectorAll('.dep').forEach(x=>x.onclick=()=>{st.depth=+x.dataset.d;renderKeep()});
 b.querySelectorAll('[data-ci]').forEach(x=>x.onclick=()=>{const c=cols[+x.dataset.ci];const id=x.dataset.id;c.sel.has(id)?c.sel.delete(id):c.sel.add(id);if(st.at&&id!=='gap')st.at={lv:c.lv,id};renderKeep()});
 if(st.scrollTo){const r=b.querySelector('.selrow');if(r)r.scrollIntoView({block:'center'});st.scrollTo=false}}

document.querySelectorAll('input[name=m]').forEach(i=>i.onchange=render);
go(null);
</script></body></html>'''
open(S+'/trace-view.html','w').write(html.replace('__DATA__',data))
print('ok')
