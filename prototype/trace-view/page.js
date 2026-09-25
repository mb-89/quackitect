const D=__DATA__;const LC=__LCOV__;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ---- the levels of main today, and what each one offers
const LV=[{id:'di',name:'Design inputs'},{id:'do',name:'Design outputs'},{id:'sec',name:'Sections'},{id:'code',name:'Code files',extra:['calls']},{id:'test',name:'Test files'}];
const ORDER=LV.map(l=>l.id);const lvName=id=>LV.find(l=>l.id===id).name;
const N={};
D.notes.forEach(n=>N[n.id]={id:n.id,lv:n.kind==='design_input'?'di':'do',name:n.name});
D.secs.forEach(s=>N[s.id]={id:s.id,lv:'sec',name:s.title,note:s.note});
D.files.forEach(f=>N[f.id]={id:f.id,lv:f.kind,name:f.id.split('/').slice(-2).join('/'),dir:f.id.split('/').slice(0,-1).join('/')});
const multi=()=>new Map();const add=(m,k,v)=>{(m.get(k)||m.set(k,[]).get(k)).push(v)};
const secsOf=multi(),codeOf=multi(),testOf=multi(),testsOfCode=multi(),doOfDi=multi();
D.secs.forEach(s=>add(secsOf,s.note,s.id));
Object.entries(D.f2s).forEach(([f,ss])=>ss.forEach(s=>add(N[f].lv==='code'?codeOf:testOf,s,f)));
Object.entries(D.imports).forEach(([f,qs])=>{if(N[f].lv==='test')qs.forEach(q=>{if(N[q].lv==='code')add(testsOfCode,q,f)})});
Object.entries(D.refines).forEach(([d,is])=>is.forEach(i=>{if(N[i])add(doOfDi,i,d)}));
function children(id){const n=N[id];
 if(n.lv==='di')return (doOfDi.get(id)||[]).map(x=>({id:x,rel:'refines'}));
 if(n.lv==='do')return (secsOf.get(id)||[]).map(x=>({id:x}));
 if(n.lv==='sec')return [...(codeOf.get(id)||[]).map(x=>({id:x,rel:'code'})),...(testOf.get(id)||[]).map(x=>({id:x,rel:'verified by'}))];
 if(n.lv==='code')return (testsOfCode.get(id)||[]).map(x=>({id:x,rel:'tested by'}));
 return []}
function parents(id){const n=N[id];
 if(n.lv==='do')return (D.refines[id]||[]).filter(x=>N[x]).map(x=>({id:x,rel:'refines'}));
 if(n.lv==='sec')return [{id:n.note}];
 if(n.lv==='code')return (D.f2s[id]||[]).map(x=>({id:x,rel:'points at'}));
 if(n.lv==='test')return [...(D.imports[id]||[]).filter(q=>N[q].lv==='code').map(x=>({id:x,rel:'tests'})),...(D.f2s[id]||[]).map(x=>({id:x,rel:'verifies'}))];
 return []}
const groupOf=n=>n.lv==='sec'?n.note.split('/').pop():n.lv==='code'||n.lv==='test'?n.dir:'';
const items=lv=>Object.values(N).filter(n=>n.lv===lv).sort((a,b)=>(groupOf(a)+'\u0000'+a.name).localeCompare(groupOf(b)+'\u0000'+b.name));
const secsUnder=id=>{const n=N[id];if(n.lv==='di')return children(id).flatMap(c=>secsUnder(c.id));if(n.lv==='do')return secsOf.get(id)||[];if(n.lv==='sec')return [id];return []};
const barRow=(label,v,title='')=>`<span title="${esc(title)}">${label}</span><div class="bar"><i style="width:${v}%"></i></div><span>${v}%</span>`;
function bars(id){const n=N[id];
 if(n.lv==='code'){const t=(testsOfCode.get(id)||[]).length;const l=LC?LC[id]:null;return `<div class="bars">${l!=null?barRow('lines',l,'lines the test battery runs, from the coverage report'):''}<span>tests</span><span class="n" style="grid-column:span 2">${t} import it</span></div>`}
 if(n.lv==='test')return '';
 const S=secsUnder(id);if(!S.length)return '';const c=Math.round(100*S.filter(s=>(codeOf.get(s)||[]).length).length/S.length),t=Math.round(100*S.filter(s=>(testOf.get(s)||[]).length).length/S.length);
 return `<div class="bars" title="${S.length} sections below">${barRow('code',c)}${barRow('tests',t)}</div>`}
const pill=r=>r&&r.rel?`<span class="rel">${r.rel}</span>`:'';
// ---- links inside a level, and paths between two levels
function inLevel(lv){const m=new Map();const put=(a,b,k=1)=>{if(N[a]&&N[b]&&N[a].lv===lv&&N[b].lv===lv)m.set(a+'\u0001'+b,(m.get(a+'\u0001'+b)||0)+k)};
 if(lv==='di'||lv==='do')D.dd.forEach(([a,b,k])=>put(a,b,k));if(lv==='sec')D.ss.forEach(([a,b,k])=>put(a,b,k));
 if(lv==='code'||lv==='test')Object.entries(D.imports).forEach(([a,qs])=>qs.forEach(b=>put(a,b)));return m}
function direct(a,b){ // the links running straight from level a to level b, as rows of counts
 const m=new Map();const put=(x,y)=>m.set(x+'\u0001'+y,(m.get(x+'\u0001'+y)||0)+1);
 items(a).forEach(n=>children(n.id).forEach(k=>{if(N[k.id].lv===b)put(n.id,k.id)}));
 if(!m.size)items(b).forEach(n=>children(n.id).forEach(k=>{if(N[k.id].lv===a)put(k.id,n.id)}));return m}
function mapping(a,b){let[A,B]=ORDER.indexOf(a)<=ORDER.indexOf(b)?[a,b]:[b,a];const d=direct(A,B);if(d.size||ORDER.indexOf(B)-ORDER.indexOf(A)===1)return {rows:A,cols:B,m:d,via:''};
 // no straight link: count the paths through each level between
 let m=direct(A,ORDER[ORDER.indexOf(A)+1]);for(let i=ORDER.indexOf(A)+1;i<ORDER.indexOf(B);i++){const step=direct(ORDER[i],ORDER[i+1]);const nx=new Map();
  m.forEach((k,key)=>{const[x,y]=key.split('\u0001');step.forEach((k2,key2)=>{const[y2,z]=key2.split('\u0001');if(y2===y)nx.set(x+'\u0001'+z,(nx.get(x+'\u0001'+z)||0)+k*k2)})});m=nx}
 return {rows:A,cols:B,m,via:ORDER.slice(ORDER.indexOf(A)+1,ORDER.indexOf(B)).map(lvName).join(', ')}}
// ---- the V
const TARGET=[{id:'vision',name:'Vision'},{id:'value_prop',name:'Value props',from:['vision']},{id:'story',name:'User stories',from:['value_prop']},{id:'use_case',name:'Use cases',from:['story']},
 {id:'standard',name:'Standards',source:true},{id:'requirement',name:'Requirements',from:['use_case','standard']},{id:'function',name:'Functions',from:['requirement']},{id:'architecture',name:'Architecture',from:['function']},
 {id:'element',name:'Design elements',from:['architecture']},{id:'impl',name:'Implementations',from:['element']},{id:'test_case',name:'Test cases',verifies:['requirement'],from:['impl']},
 {id:'test_result',name:'Test results',from:['test_case']},{id:'demo',name:'Demonstrations',validates:['story'],from:['test_result']}];
const TODAY=[{id:'di',name:'Design inputs'},{id:'do',name:'Design outputs',from:['di']},{id:'sec',name:'Sections',from:['do']},{id:'code',name:'Code files',from:['sec']},{id:'test',name:'Test files',verifies:['sec'],from:['code']}];
const NI={vision:1,value_prop:6,story:40,use_case:28,standard:12,requirement:140,function:60,architecture:24,element:180,impl:610,test_case:420,test_result:420,demo:36};
const CI={'value_prop<vision':[100,100],'story<value_prop':[95,100],'use_case<story':[93,88],'requirement<use_case':[92,90],'requirement<standard':[31,83],'function<requirement':[92,81],'architecture<function':[88,95],'element<architecture':[90,86],'impl<element':[89,78],'test_case~requirement':[96,74],'test_result<test_case':[100,97],'demo~story':[100,62]};
function todayStats(){const pc=(a,b)=>Math.round(100*a/b);const L=Object.fromEntries(LV.map(l=>[l.id,items(l.id)]));
 const has=(xs,f)=>xs.filter(f).length;
 return {n:Object.fromEntries(LV.map(l=>[l.id,L[l.id].length])),c:{
  'do<di':[pc(has(L.do,d=>(D.refines[d.id]||[]).length),L.do.length),pc(has(L.di,d=>(doOfDi.get(d.id)||[]).length),L.di.length)],
  'sec<do':[100,pc(has(L.do,d=>(secsOf.get(d.id)||[]).length),L.do.length)],
  'code<sec':[pc(has(L.code,f=>(D.f2s[f.id]||[]).length),L.code.length),pc(has(L.sec,s=>(codeOf.get(s.id)||[]).length),L.sec.length)],
  'test~sec':[pc(has(L.test,f=>(D.f2s[f.id]||[]).length),L.test.length),pc(has(L.sec,s=>(testOf.get(s.id)||[]).length),L.sec.length)],
  'test<code':[pc(has(L.test,f=>(D.imports[f.id]||[]).some(q=>N[q].lv==='code')),L.test.length),pc(has(L.code,f=>(testsOfCode.get(f.id)||[]).length),L.code.length)]}}}
const mode=()=>document.querySelector('input[name=m]:checked').value;
__DRAWV__
// ---- a matrix on a canvas: rows and columns in their groups, a cell counts the links
function matrix(rows,cols,m,title,cycles=new Set()){
 const R=rows.map(n=>n.id),C=cols.map(n=>n.id);const s=Math.max(3,Math.min(18,Math.floor(Math.min(900/C.length,560/R.length))));const labels=s>=10;
 const LW=labels?230:120,TH=labels?150:40;const W=LW+C.length*s+2,H=TH+R.length*s+2;
 setTimeout(()=>{const cv=document.getElementById('mx');if(!cv)return;const dpr=devicePixelRatio||1;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';const g=cv.getContext('2d');g.scale(dpr,dpr);
  const css=k=>getComputedStyle(document.body).getPropertyValue(k).trim();const ink=css('--ink'),ink2=css('--ink2'),rule=css('--rule');const ramp=['#cde2fb','#9ec5f4','#6da7ec','#2a78d6','#184f95'];
  let max=1;m.forEach(v=>max=Math.max(max,v));
  g.font='11px system-ui';g.fillStyle=ink2;
  // group bands
  const bands=(ids,horizontal)=>{let start=0;ids.forEach((id,i)=>{const gr=groupOf(N[id]);const nx=ids[i+1];if(!nx||groupOf(N[nx])!==gr){g.strokeStyle=rule;g.beginPath();if(horizontal){g.moveTo(LW+(i+1)*s,TH);g.lineTo(LW+(i+1)*s,H)}else{g.moveTo(LW,TH+(i+1)*s);g.lineTo(W,TH+(i+1)*s)}g.stroke();
    if(!labels&&gr){g.save();g.fillStyle=ink2;if(horizontal){g.translate(LW+((start+i+1)/2)*s,TH-4);g.rotate(-Math.PI/4);g.fillText(gr.split('/').pop().slice(0,16),0,0)}else g.fillText(gr.split('/').pop().slice(0,18),4,TH+((start+i+1)/2)*s+4);g.restore()}start=i+1}})};
  bands(R,false);bands(C,true);
  const ri=new Map(R.map((id,i)=>[id,i])),ci=new Map(C.map((id,i)=>[id,i]));
  m.forEach((v,key)=>{const[a,b]=key.split('\u0001');if(!ri.has(a)||!ci.has(b))return;const t=Math.min(4,Math.floor(4*v/max));g.fillStyle=cycles.has(a)&&cycles.has(b)?'#d03b3b':ramp[t];g.fillRect(LW+ci.get(b)*s+.5,TH+ri.get(a)*s+.5,Math.max(1,s-1),Math.max(1,s-1))});
  if(R===C||rows===cols){g.fillStyle=rule;R.forEach((id,i)=>g.fillRect(LW+i*s,TH+i*s,s,s))}
  if(labels){g.fillStyle=ink;R.forEach((id,i)=>g.fillText(N[id].name.slice(0,34),4,TH+i*s+s-3));C.forEach((id,i)=>{g.save();g.translate(LW+i*s+s-3,TH-4);g.rotate(-Math.PI/2);g.fillText(N[id].name.slice(0,26),0,0);g.restore()})}
  const tip=document.getElementById('tt');const hx=document.getElementById('hx'),hy=document.getElementById('hy');
  cv.onmousemove=e=>{const r=cv.getBoundingClientRect();const x=Math.floor((e.clientX-r.left-LW)/s),y=Math.floor((e.clientY-r.top-TH)/s);if(x<0||y<0||x>=C.length||y>=R.length){tip.style.display='none';hx.style.display=hy.style.display='none';return}
   Object.assign(hx.style,{display:'block',left:'0px',top:(TH+y*s)+'px',width:W+'px',height:s+'px'});Object.assign(hy.style,{display:'block',left:(LW+x*s)+'px',top:'0px',width:s+'px',height:H+'px'});
   const v=m.get(R[y]+'\u0001'+C[x])||0;tip.textContent=`${N[R[y]].name}  to  ${N[C[x]].name}: ${v}`;tip.style.display='block';tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY+12)+'px'};
  cv.onmouseleave=()=>{tip.style.display='none';hx.style.display=hy.style.display='none'};
  cv.onclick=e=>{const r=cv.getBoundingClientRect();const y=Math.floor((e.clientY-r.top-TH)/s);if(y>=0&&y<R.length)jump(R[y])}},0);
 let links=0;m.forEach(v=>links+=v);
 return `<p class="hint">${title} · ${R.length} rows, ${C.length} columns, ${links} links · a darker cell counts more · a click on a row jumps to it</p><div class="mxwrap"><canvas id="mx"></canvas><div class="hx" id="hx"></div><div class="hx" id="hy"></div></div>`}
// ---- the call graph of one code file
function callGraph(){const id=st.at.id;if(!id||N[id].lv!=='code')return allCalls();
 const fns=D.calls[id]||[];const byName=f=>(D.calls[f]||[]);
 const rowOf=(file,fn,depth,seen)=>{const key=file+'#'+fn.name;const openKey=depth+':'+key;const isOpen=callOpen.has(openKey);const kids=fn.calls||[];
  let h=`<tr><td style="padding-left:${8+depth*18}px"><span class="tw" ${kids.length?`data-co="${esc(openKey)}"`:''}>${kids.length?(isOpen?'▾':'▸'):''}</span><code>${esc(fn.name)}</code>${file!==id?` <span class="name" data-j="${esc(file)}">${esc(N[file].name)}</span>`:''}<a class="open" title="open at line ${fn.line}">↗</a></td><td class="num">${kids.length||''}</td><td class="num">${fn.line}</td></tr>`;
  if(isOpen&&!seen.has(key)){const s2=new Set(seen).add(key);kids.forEach(([f,n])=>{const g=byName(f).find(x=>x.name===n);if(g)h+=rowOf(f,g,depth+1,s2)})}return h};
 const calledBy=new Map();Object.entries(D.calls).forEach(([f,fs])=>fs.forEach(fn=>fn.calls.forEach(([g,n])=>{if(g===id)add(calledBy,n,f)})));
 return `<p class="hint">The functions ${esc(N[id].name)} defines. Open one to see what it calls, across files. Found by name, so a call through a variable stays out.</p><table><tr><th>function</th><th class="num">calls</th><th class="num">line</th></tr>${fns.map(fn=>rowOf(id,fn,0,new Set())).join('')}</table>`}
const callOpen=new Set();
// with no file selected, every code file, each opening into its functions, each opening into what it calls
function allCalls(){const fnRow=(file,fn,depth,seen)=>{const key=file+'#'+fn.name;const openKey=depth+':'+key;const isOpen=callOpen.has(openKey);const kids=fn.calls||[];
  let h=`<tr><td style="padding-left:${8+depth*18}px"><span class="tw" ${kids.length?`data-co="${esc(openKey)}"`:''}>${kids.length?(isOpen?'▾':'▸'):''}</span><code>${esc(fn.name)}</code>${depth>1?` <span class="name" data-j="${esc(file)}">${esc(N[file].name)}</span>`:''}<a class="open" title="open at line ${fn.line}">↗</a></td><td class="num">${kids.length||''}</td><td class="num">${fn.line}</td></tr>`;
  if(isOpen&&!seen.has(key)){const s2=new Set(seen).add(key);kids.forEach(([f,n])=>{const g=(D.calls[f]||[]).find(x=>x.name===n);if(g)h+=fnRow(f,g,depth+1,s2)})}return h};
 let h=`<p class="hint">Every code file and the functions it defines. Open a file, then a function, to follow its calls across files. Found by name, so a call through a variable stays out.</p><table><tr><th>file · function</th><th class="num">calls</th><th class="num">line</th></tr>`;
 items('code').forEach(n=>{const fns=D.calls[n.id]||[];const k='file:'+n.id;const isOpen=callOpen.has(k);
  h+=`<tr><td><span class="tw" ${fns.length?`data-co="${esc(k)}"`:''}>${fns.length?(isOpen?'▾':'▸'):''}</span><span class="name" data-j="${esc(n.id)}">${esc(n.name)}</span> <span class="sub">${fns.length} functions</span></td><td></td><td></td></tr>`;
  if(isOpen)fns.forEach(fn=>h+=fnRow(n.id,fn,1,new Set()))});
 return h+'</table>'}
