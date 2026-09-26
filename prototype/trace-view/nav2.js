// ---- navigation: overview, a level, an item on its level, or two levels mapped
let st={at:null,view:'v',depth:1,pick:[],mx:{hide:false,size:'all',rp:0,cp:0}},open=new Set(),cols=[];const hist=[];
const remember=()=>hist.push({at:st.at,view:st.view});
function back(){const h=hist.pop();if(!h)return;st.at=h.at;st.view=h.view;open.clear();cols=[];st.scrollTo=!!(h.at&&h.at.id);render()}
document.addEventListener('mouseup',e=>{if(e.button===3){e.preventDefault();back()}});document.addEventListener('keydown',e=>{if(e.altKey&&e.key==='ArrowLeft')back()});
function viewsHere(){if(!st.at)return ['v','columns'];if(st.at.map)return ['matrix'];const l=LV.find(x=>x.id===st.at.lv);return ['tree','columns','structure',...(l.extra||[])]}
function go(at,view){remember();st.at=at;st.scrollTo=!!(at&&at.id);open.clear();cols=[];st.mx={...st.mx,rp:0,cp:0};const vs=viewsHere();if(view&&vs.includes(view))st.view=view;else if(!vs.includes(st.view))st.view=vs[0];render()}
const jump=id=>go({lv:N[id].lv,id});
const select=id=>{remember();st.at={...st.at,id};renderKeep()};
function crumbs(){const el=document.getElementById('crumbs');const a=st.at;
 let parts=[{label:'Overview',act:()=>go(null),menu:()=>LV.map(l=>({label:l.name,sub:items(l.id).length,act:()=>go({lv:l.id})}))}];
 if(a&&a.map)parts.push({label:lvName(a.map[0])+' × '+lvName(a.map[1]),act:()=>{},menu:()=>[]});
 if(a&&a.lv)parts.push({label:lvName(a.lv),act:()=>go({lv:a.lv}),menu:()=>items(a.lv).map(n=>({label:n.name,act:()=>jump(n.id)}))});
 if(a&&a.id)parts.push({label:N[a.id].name,act:()=>jump(a.id),menu:()=>children(a.id).map(k=>({label:N[k.id].name,sub:k.rel||'',act:()=>jump(k.id)}))});
 el.innerHTML=`<button class="back" id="back" title="back, or the mouse's back button" ${hist.length?'':'disabled'}>←</button>`+parts.map((p,i)=>`<span class="crumb ${i===parts.length-1?'last':''}" data-c="${i}">${esc(p.label)}</span><span class="chev" data-m="${i}">›</span>`).join('');
 document.getElementById('back').onclick=back;
 el.querySelectorAll('[data-c]').forEach(x=>x.onclick=()=>parts[+x.dataset.c].act());
 el.querySelectorAll('[data-m]').forEach(x=>x.onclick=e=>{e.stopPropagation();closeMenu();const its=parts[+x.dataset.m].menu();const m=document.createElement('div');m.className='menu';m.style.left=(x.offsetLeft+14)+'px';
  m.innerHTML=its.length?its.map((it,j)=>`<div data-j="${j}">${esc(it.label)} <small>${esc(it.sub??'')}</small></div>`).join(''):'<div><small>nothing below</small></div>';document.querySelector('.top').appendChild(m);m.querySelectorAll('[data-j]').forEach(dd=>dd.onclick=()=>its[+dd.dataset.j].act())})}
function closeMenu(){document.querySelectorAll('.menu').forEach(m=>m.remove())}document.addEventListener('click',closeMenu);
// the tree: the level's items, a row opens one level deep
function row(r,depth,num){const kids=children(r.id);const isOpen=depth===0&&open.has(r.id);const sel=st.at.id===r.id;
 let h=`<tr class="${sel?'selrow':''}" data-s="${esc(r.id)}"><td class="num idx">${num??''}</td><td style="padding-left:${8+depth*20}px"><span class="tw" ${depth===0&&kids.length?`data-t="${esc(r.id)}"`:''}>${depth===0&&kids.length?(isOpen?'▾':'▸'):''}</span><span class="name" data-j="${esc(r.id)}">${esc(N[r.id].name)}</span><a class="open" title="open the note">↗</a>${pill(r)}</td><td class="num">${kids.length||''}</td><td>${bars(r.id)}</td></tr>`;
 if(isOpen)kids.forEach(k=>h+=row(k,1));return h}
function tree(){return `<table><tr><th class="num">#</th><th>name</th><th class="num">below</th><th>coverage</th></tr>${items(st.at.lv).map((n,i)=>row({id:n.id},0,i+1)).join('')}</table>`}
// columns: one column a level, the header is the level, a click adds to the selection
const orphans=()=>items('do').filter(d=>!(D.refines[d.id]||[]).length).map(d=>d.id);
function columns(){const start=st.at?st.at.lv:'di';
 if(!cols.length)cols=[{lv:start,items:items(start).map(n=>n.id),sel:new Set(st.at&&st.at.id?[st.at.id]:[])}];
 for(let i=0;i<cols.length;i++){const c=cols[i];const nx=ORDER[ORDER.indexOf(c.lv)+1];
  if(!c.sel.size||!nx){cols=cols.slice(0,i+1);break}
  const ids=[...new Set([...c.sel].flatMap(id=>id==='gap'?orphans():children(id).filter(k=>N[k.id].lv===nx).map(k=>k.id)))];
  const prev=cols[i+1];cols[i+1]={lv:nx,items:ids,sel:new Set(prev?[...prev.sel].filter(x=>ids.includes(x)):[])}}
 const gap=!st.at?orphans().length:0;
 let h='<div class="cols">';cols.forEach((c,ci)=>{h+=`<div class="col"><h4>${lvName(c.lv)} <span class="n">${c.items.length}</span></h4>`+c.items.map(id=>`<div class="item ${c.sel.has(id)?'sel':''}" data-ci="${ci}" data-id="${esc(id)}"><span>${esc(N[id].name)}</span><span class="n">${children(id).length||''}</span></div>`).join('')+
  (ci===0&&gap?`<div class="item gap ${c.sel.has('gap')?'sel':''}" data-ci="0" data-id="gap"><span>no design input yet</span><span class="n">${gap}</span></div>`:'')+'</div>'});return h+'</div>'}
// the matrix view: every matrix draws through this one, with its switches
function matrixView(rowsLv,colsLv,m,title){let R=items(rowsLv),C=items(colsLv);
 if(st.mx.hide){const rs=new Set(),cs=new Set();m.forEach((v,k)=>{const[a,b]=k.split('\u0001');rs.add(a);cs.add(b)});R=R.filter(n=>rs.has(n.id));C=C.filter(n=>cs.has(n.id))}
 const square=rowsLv===colsLv;const ord=reorder(R,C,m,square,st.mx.order||'groups');R=ord.R;C=ord.C;
 const [pr,pc]=st.mx.size==='all'?[R.length||1,C.length||1]:st.mx.size.split('x').map(Number);
 const rpages=Math.max(1,Math.ceil(R.length/pr)),cpages=Math.max(1,Math.ceil(C.length/pc));st.mx.rp=Math.min(st.mx.rp,rpages-1);st.mx.cp=Math.min(st.mx.cp,cpages-1);
 const Rp=R.slice(st.mx.rp*pr,(st.mx.rp+1)*pr),Cp=C.slice(st.mx.cp*pc,(st.mx.cp+1)*pc);
 const sizes=['all','10x10','10x20','20x20','50x50'];
 const bar=`<div class="mxbar"><label><input type="checkbox" id="mxhide" ${st.mx.hide?'checked':''}> hide empty rows and columns</label>
  <span>page <select id="mxsize">${sizes.map(z=>`<option ${st.mx.size===z?'selected':''}>${z}</option>`).join('')}</select></span>
  <span>rows <button data-p="rp,-1">‹</button> ${st.mx.rp+1} of ${rpages} <button data-p="rp,1">›</button></span>
  <span>columns <button data-p="cp,-1">‹</button> ${st.mx.cp+1} of ${cpages} <button data-p="cp,1">›</button></span>
  <span>order <select id="mxorder">${[['groups','as the tree stands'],['degree','by link count'],...(square?[['layers','layers and cycles']]:[]),['barycenter','barycenter']].map(([k,l])=>`<option value="${k}" ${(st.mx.order||'groups')===k?'selected':''}>${l}</option>`).join('')}</select></span>
  ${ord.cycles.size?`<span class="sub">cells inside a cycle show red</span>`:''}</div>`;
 return bar+matrix(Rp,Cp,m,title,ord.cycles)}
// orderings a reader can try on any matrix
function reorder(R,C,m,square,how){const cycles=new Set();const key=(a,b)=>a.id+'\u0001'+b.id;
 const deg=new Map();m.forEach((v,k)=>{const[a,b]=k.split('\u0001');deg.set('r'+a,(deg.get('r'+a)||0)+v);deg.set('c'+b,(deg.get('c'+b)||0)+v)});
 if(how==='degree'){R=[...R].sort((a,b)=>(deg.get('r'+b.id)||0)-(deg.get('r'+a.id)||0));C=square?R:[...C].sort((a,b)=>(deg.get('c'+b.id)||0)-(deg.get('c'+a.id)||0))}
 if(how==='barycenter'){for(let it=0;it<6;it++){const ci=new Map(C.map((n,i)=>[n.id,i]));const bc=n=>{let s=0,k=0;C.forEach(c=>{const v=m.get(key(n,c));if(v){s+=ci.get(c.id)*v;k+=v}});return k?s/k:1e9};R=[...R].sort((a,b)=>bc(a)-bc(b));
  if(square){C=R;continue}const ri=new Map(R.map((n,i)=>[n.id,i]));const br=c=>{let s=0,k=0;R.forEach(r=>{const v=m.get(key(r,c));if(v){s+=ri.get(r.id)*v;k+=v}});return k?s/k:1e9};C=[...C].sort((a,b)=>br(a)-br(b))}}
 if(how==='layers'&&square){ // Tarjan's strongly connected components, then the components in topological order
  const ids=R.map(n=>n.id);const out=new Map(ids.map(i=>[i,[]]));m.forEach((v,k)=>{const[a,b]=k.split('\u0001');if(out.has(a)&&out.has(b))out.get(a).push(b)});
  let idx=0;const I=new Map(),low=new Map(),on=new Set(),stack=[],comps=[];
  const strong=v=>{I.set(v,idx);low.set(v,idx);idx++;stack.push(v);on.add(v);for(const w of out.get(v)){if(!I.has(w)){strong(w);low.set(v,Math.min(low.get(v),low.get(w)))}else if(on.has(w))low.set(v,Math.min(low.get(v),I.get(w)))}
   if(low.get(v)===I.get(v)){const c=[];let w;do{w=stack.pop();on.delete(w);c.push(w)}while(w!==v);comps.push(c)}};
  ids.forEach(v=>{if(!I.has(v))strong(v)});comps.forEach(c=>{if(c.length>1)c.forEach(x=>cycles.add(x))});
  // Tarjan emits a component after everything it reaches, so the reverse puts the users first and the used last
  const order=comps.reverse().flat();R=order.map(id=>N[id]);C=R}
 return {R,C,cycles}}
function structure(){const lv=st.at.lv;return matrixView(lv,lv,inLevel(lv),`Design structure matrix of ${lvName(lv).toLowerCase()}: a row links to a column`)}
function mapView(){const[a,b]=st.at.map;const mp=mapping(a,b);return matrixView(mp.rows,mp.cols,mp.m,`Domain mapping matrix, ${lvName(mp.rows).toLowerCase()} to ${lvName(mp.cols).toLowerCase()}${mp.via?`, counting the paths through ${mp.via.toLowerCase()}`:''}`)}
// the local trace: the selected item in the middle, what it comes from on the left, what it feeds on the right
function ring(id,dir,depth){const out=[];let front=[id];const seen=new Set([id]);for(let k=0;k<depth;k++){const nx=[];front.forEach(f=>(dir<0?parents(f):children(f)).forEach(r=>{if(!seen.has(r.id)){seen.add(r.id);nx.push({id:r.id,from:f})}else{const e=nx.find(x=>x.id===r.id);if(e)(e.also??=[]).push(f)}}));
  nx.sort((a,b)=>ORDER.indexOf(N[a.id].lv)-ORDER.indexOf(N[b.id].lv));out.push(nx);front=nx.map(x=>x.id)}return out}
function local(){const id=st.at&&st.at.id;if(!id)return '<p class="sub">Select an item above, and its local trace draws here.</p>';
 const up=ring(id,-1,st.depth).filter(c=>c.length).reverse(),down=ring(id,1,st.depth).filter(c=>c.length);const C=[...up,[{id}],...down];const CW=210,CH=30,G=46,GH=20;
 const pos={};const heads=[];let H=CH;
 C.forEach((col,i)=>{let y=0,last=null;col.forEach(n=>{const lv=N[n.id].lv;if(lv!==last&&col.length>1||(i!==up.length&&last===null)){heads.push({x:i*(CW+G),y,label:lvName(lv),n:col.filter(x=>N[x.id].lv===lv).length});y+=GH;last=lv}pos[n.id]={x:i*(CW+G),y};y+=CH});H=Math.max(H,y)});
 pos[id].y=Math.max(0,(H-CH)/2);
 let svg=`<svg width="${C.length*(CW+G)}" height="${H+10}" style="position:absolute;left:0;top:0">`;
 const link=(a,b)=>{if(!pos[a]||!pos[b])return;const L=pos[a].x<pos[b].x?pos[a]:pos[b],R=pos[a].x<pos[b].x?pos[b]:pos[a];const x1=L.x+CW,x2=R.x,y1=L.y+12,y2=R.y+12;svg+=`<path d="M${x1} ${y1} C${x1+G/2} ${y1},${x2-G/2} ${y2},${x2} ${y2}" stroke="var(--refine)" fill="none" stroke-width="1.2"/>`};
 C.forEach(col=>col.forEach(n=>{if(n.from){link(n.from,n.id);(n.also||[]).forEach(f=>link(f,n.id))}}));
 const cards=C.flat().map(n=>{const p=pos[n.id];return `<div class="lt ${n.id===id?'me':''}" data-s="${esc(n.id)}" style="left:${p.x}px;top:${p.y}px;width:${CW}px">${esc(N[n.id].name)}<a class="open" title="open the note">↗</a></div>`}).join('');
 const hs=heads.map(h=>`<div class="lth" style="left:${h.x}px;top:${h.y}px;width:${CW}px">${h.label} <span class="n">${h.n}</span></div>`).join('');
 return `<div class="ltbar"><b>Local trace</b> <span class="sub">levels each way</span> ${[1,2,3].map(d=>`<button class="dep ${st.depth===d?'on':''}" data-d="${d}">${d}</button>`).join('')}</div><div class="ltwrap" style="position:relative;height:${H+10}px">${svg}</svg>${hs}${cards}</div>`}
function overviewBar(){const p=st.pick;if(!p.length)return '<p class="sub">A click picks a level, a second click picks another, and a double click opens one.</p>';
 const b=p.length===1?`<button class="act" data-a="open">open ${lvName(p[0])}</button><button class="act" data-a="structure">structure matrix of ${lvName(p[0])}</button>`:`<button class="act" data-a="map">mapping matrix, ${lvName(p[0])} to ${lvName(p[1])}</button>`;
 return `<div class="mxbar">${b}<button class="act" data-a="clear">clear</button></div>`}
function renderKeep(){const b=document.getElementById('topv');const keep=b?b.scrollTop:0;render();const b2=document.getElementById('topv');if(b2)b2.scrollTop=keep}
function render(){crumbs();const v=document.getElementById('views'),b=document.getElementById('body');
 v.innerHTML=viewsHere().map(k=>`<button class="${st.view===k?'on':''}" data-v="${k}">${k==='v'?'V':k==='calls'?'call graph':k}</button>`).join('');v.querySelectorAll('button').forEach(x=>x.onclick=()=>{st.view=x.dataset.v;cols=[];render()});
 const main=!st.at?(st.view==='v'?overviewBar()+drawV():columns()):st.at.map?mapView():st.view==='columns'?columns():st.view==='structure'?structure():st.view==='calls'?callGraph():tree();
 b.innerHTML=st.at&&!st.at.map?`<div class="split"><div class="topv" id="topv">${main}</div><div class="botv">${local()}</div></div>`:main;
 b.querySelectorAll('.tile[data-lv]').forEach(x=>{x.classList.toggle('picked',st.pick.includes(x.dataset.lv));x.onclick=()=>{const l=x.dataset.lv;st.pick=st.pick.includes(l)?st.pick.filter(y=>y!==l):[...st.pick,l].slice(-2);render()};x.ondblclick=()=>{st.pick=[];go({lv:x.dataset.lv})}});
 b.querySelectorAll('.act').forEach(x=>x.onclick=()=>{const a=x.dataset.a,p=st.pick;st.pick=[];if(a==='open')go({lv:p[0]});else if(a==='structure')go({lv:p[0]},'structure');else if(a==='map')go({map:p});else render()});
 b.querySelectorAll('[data-t]').forEach(x=>x.onclick=e=>{e.stopPropagation();open.has(x.dataset.t)?open.delete(x.dataset.t):open.add(x.dataset.t);renderKeep()});
 b.querySelectorAll('[data-co]').forEach(x=>x.onclick=e=>{e.stopPropagation();callOpen.has(x.dataset.co)?callOpen.delete(x.dataset.co):callOpen.add(x.dataset.co);renderKeep()});
 b.querySelectorAll('.name[data-j]').forEach(x=>x.onclick=e=>{e.stopPropagation();const id=x.dataset.j;st.at&&N[id].lv===st.at.lv?select(id):jump(id)});
 b.querySelectorAll('tr[data-s]').forEach(x=>x.onclick=()=>select(x.dataset.s));
 b.querySelectorAll('.lt[data-s]').forEach(x=>x.onclick=()=>jump(x.dataset.s));
 b.querySelectorAll('.dep').forEach(x=>x.onclick=()=>{st.depth=+x.dataset.d;renderKeep()});
 const hide=document.getElementById('mxhide');if(hide)hide.onchange=()=>{st.mx.hide=hide.checked;st.mx.rp=st.mx.cp=0;render()};
 const ordSel=document.getElementById('mxorder');if(ordSel)ordSel.onchange=()=>{st.mx.order=ordSel.value;st.mx.rp=st.mx.cp=0;render()};
 const size=document.getElementById('mxsize');if(size)size.onchange=()=>{st.mx.size=size.value;st.mx.rp=st.mx.cp=0;render()};
 b.querySelectorAll('[data-p]').forEach(x=>x.onclick=()=>{const[k,d]=x.dataset.p.split(',');st.mx[k]=Math.max(0,st.mx[k]+ +d);render()});
 b.querySelectorAll('[data-ci]').forEach(x=>x.onclick=()=>{const c=cols[+x.dataset.ci];const id=x.dataset.id;c.sel.has(id)?c.sel.delete(id):c.sel.add(id);if(st.at&&id!=='gap')st.at={lv:c.lv,id};renderKeep()});
 if(st.scrollTo){const r=b.querySelector('.selrow');if(r)r.scrollIntoView({block:'center'});st.scrollTo=false}}
document.querySelectorAll('input[name=m]').forEach(i=>i.onchange=render);
render();
