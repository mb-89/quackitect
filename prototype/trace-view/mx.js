// ---- the matrix editor: every matrix draws through this one
// A matrix runs its longer level down the rows, groups its items, opens a group
// into its members on a click, orders by a menu, and draws a graph below it.
const K=(a,b)=>a+'\u0001'+b;
function seeded(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// IGTA-plus (Börjesson and Hölttä-Otto 2012) over Thebeau's cost and bid (2001): one cluster an item, a pass tries every item once,
// the highest bid wins with a rare second-best, and a worse move passes rarely. A fixed seed repeats the result.
function thebeau(ids,m,seed=7){const n=ids.length;const at=new Map(ids.map((id,i)=>[id,i]));const W=ids.map(()=>new Map());
 m.forEach((v,k)=>{const[a,b]=k.split('\u0001');if(!at.has(a)||!at.has(b)||a===b)return;const i=at.get(a),j=at.get(b);W[i].set(j,(W[i].get(j)||0)+v);W[j].set(i,(W[j].get(i)||0)+v)});
 const cl=ids.map((_,i)=>i);const size=new Map(ids.map((_,i)=>[i,1]));
 const cost=()=>{let c=0;W.forEach((row,i)=>row.forEach((w,j)=>{if(j>i)c+=cl[i]===cl[j]?w*size.get(cl[i]):w*n}));return c};
 let best=cost();const rand=seeded(seed);
 const RAND_BID=122,RAND_ACCEPT=122;let calm=0;
 for(let pass=0;pass<40&&calm<2;pass++){let moved=false;const perm=ids.map((_,i)=>i).sort(()=>rand()-.5);
  for(const i of perm){if(!W[i].size)continue;const bids=new Map();W[i].forEach((w,j)=>bids.set(cl[j],(bids.get(cl[j])||0)+w));
   const ranked=[...bids.entries()].filter(([k])=>k!==cl[i]).map(([k,w])=>[k,w**4/(size.get(k)||1)]).sort((a,b)=>b[1]-a[1]);if(!ranked.length)continue;
   const top=(ranked.length>1&&rand()<1/RAND_BID?ranked[1]:ranked[0])[0];
   const old=cl[i];cl[i]=top;size.set(old,size.get(old)-1);size.set(top,(size.get(top)||0)+1);const c=cost();
   if(c<best||rand()<1/RAND_ACCEPT){if(c<best)moved=true;best=Math.min(best,c)}else{cl[i]=old;size.set(top,size.get(top)-1);size.set(old,size.get(old)+1)}}
  calm=moved?0:calm+1}
 const named=new Map();ids.forEach((id,i)=>{const k=cl[i];(named.get(k)||named.set(k,[]).get(k)).push(id)});
 const label=members=>{const c=new Map();members.forEach(id=>{const g=groupOf(N[id])||N[id].name;c.set(g,(c.get(g)||0)+1)});return [...c.entries()].sort((a,b)=>b[1]-a[1])[0][0].split('/').pop()};
 const g=new Map();[...named.values()].sort((a,b)=>b.length-a.length).forEach((mem,i)=>{const nm=mem.length>1?`${label(mem)} · cluster ${i+1}`:'alone';mem.forEach(id=>g.set(id,nm))});return g}
// Louvain modularity (Blondel et al. 2008): move each node to the neighbouring community that gains most, then merge and repeat; a fixed visiting order keeps it repeatable
function louvain(ids,m){let nodes=ids.map(id=>[id]);let W=new Map();const add2=(a,b,v)=>{if(a===b)return;const k=a<b?a+'|'+b:b+'|'+a;W.set(k,(W.get(k)||0)+v)};
 const at=new Map(ids.map((id,i)=>[id,i]));m.forEach((v,k)=>{const[a,b]=k.split('\u0001');if(at.has(a)&&at.has(b))add2(at.get(a),at.get(b),v)});
 for(let level=0;level<8;level++){const n=nodes.length;const adj=Array.from({length:n},()=>new Map());let two=0;W.forEach((v,k)=>{const[a,b]=k.split('|').map(Number);adj[a].set(b,(adj[a].get(b)||0)+v);adj[b].set(a,(adj[b].get(a)||0)+v);two+=2*v});
  if(!two)break;const deg=adj.map(r=>[...r.values()].reduce((s,v)=>s+v,0));const com=nodes.map((_,i)=>i);const tot=[...deg];let moved=true,any=false,guard=0;
  while(moved&&guard++<20){moved=false;for(let i=0;i<n;i++){const ci=com[i];tot[ci]-=deg[i];const kin=new Map();adj[i].forEach((w,j)=>kin.set(com[j],(kin.get(com[j])||0)+w));
   let best=ci,gain=(kin.get(ci)||0)-tot[ci]*deg[i]/two;kin.forEach((w,c)=>{const g=w-tot[c]*deg[i]/two;if(g>gain+1e-12){gain=g;best=c}});com[i]=best;tot[best]+=deg[i];if(best!==ci){moved=true;any=true}}}
  if(!any)break;const idx=new Map();com.forEach(c=>{if(!idx.has(c))idx.set(c,idx.size)});const nn=Array.from({length:idx.size},()=>[]);nodes.forEach((mem,i)=>nn[idx.get(com[i])].push(...mem));
  const W2=new Map();W.forEach((v,k)=>{const[a,b]=k.split('|').map(Number);const x=idx.get(com[a]),y=idx.get(com[b]);if(x!==y){const kk=x<y?x+'|'+y:y+'|'+x;W2.set(kk,(W2.get(kk)||0)+v)}});nodes=nn;W=W2}
 const label=members=>{const c=new Map();members.forEach(id=>{const g=groupOf(N[id])||N[id].name;c.set(g,(c.get(g)||0)+1)});return [...c.entries()].sort((a,b)=>b[1]-a[1])[0][0].split('/').pop()};
 const g=new Map();[...nodes].sort((a,b)=>b.length-a.length).forEach((mem,i)=>{const nm=mem.length>1?`${label(mem)} · community ${i+1}`:'alone';mem.forEach(id=>g.set(id,nm))});return g}
// Leiden (Traag, Waltman and van Eck 2019): fast local moving, then a refinement that grows well-linked sub-communities
// inside each community, then the graph folds by the refined parts and starts from the unrefined ones. The refinement
// here takes the best merge where the paper draws one at random, so the result repeats.
function leiden(ids,m){const at=new Map(ids.map((id,i)=>[id,i]));let nodes=ids.map(id=>[id]);let W=new Map();
 const put=(M,a,b,v)=>{if(a===b)return;const k=a<b?a+'|'+b:b+'|'+a;M.set(k,(M.get(k)||0)+v)};
 m.forEach((v,k)=>{const[a,b]=k.split('\u0001');if(at.has(a)&&at.has(b))put(W,at.get(a),at.get(b),v)});
 let init=nodes.map((_,i)=>i);
 for(let level=0;level<10;level++){const n=nodes.length;const adj=Array.from({length:n},()=>new Map());let two=0;
  W.forEach((v,k)=>{const[a,b]=k.split('|').map(Number);adj[a].set(b,(adj[a].get(b)||0)+v);adj[b].set(a,(adj[b].get(a)||0)+v);two+=2*v});if(!two)break;
  const deg=adj.map(r=>[...r.values()].reduce((s,v)=>s+v,0));const com=[...init];const tot=new Map();com.forEach((c,i)=>tot.set(c,(tot.get(c)||0)+deg[i]));
  // fast local moving: a queue of nodes whose neighbourhood changed
  const q=nodes.map((_,i)=>i),inq=new Set(q);while(q.length){const i=q.shift();inq.delete(i);const ci=com[i];tot.set(ci,tot.get(ci)-deg[i]);const kin=new Map();adj[i].forEach((w,j)=>kin.set(com[j],(kin.get(com[j])||0)+w));
   let best=ci,gain=(kin.get(ci)||0)-(tot.get(ci)||0)*deg[i]/two;kin.forEach((w,c)=>{const g=w-(tot.get(c)||0)*deg[i]/two;if(g>gain+1e-12){gain=g;best=c}});com[i]=best;tot.set(best,(tot.get(best)||0)+deg[i]);
   if(best!==ci)adj[i].forEach((w,j)=>{if(com[j]!==best&&!inq.has(j)){q.push(j);inq.add(j)}})}
  // refinement: inside each community, a singleton joins the sub-community it gains most with
  const sub=nodes.map((_,i)=>i),sTot=[...deg],sSize=nodes.map(()=>1);
  for(let v=0;v<n;v++){if(sSize[sub[v]]!==1)continue;const kin=new Map();adj[v].forEach((w,j)=>{if(com[j]===com[v]&&j!==v)kin.set(sub[j],(kin.get(sub[j])||0)+w)});
   let best=null,gain=0;kin.forEach((w,s)=>{const g=w-sTot[s]*deg[v]/two;if(g>gain+1e-12){gain=g;best=s}});if(best!=null){sTot[sub[v]]-=deg[v];sSize[sub[v]]--;sub[v]=best;sTot[best]+=deg[v];sSize[best]++}}
  const idx=new Map();sub.forEach(s=>{if(!idx.has(s))idx.set(s,idx.size)});
  const cidx=new Map();com.forEach(c=>{if(!cidx.has(c))cidx.set(c,cidx.size)});
  if(idx.size===n&&cidx.size===n)break;
  if(idx.size===n){ // no refinement merged anything: fold by the communities themselves and stop
   const nn=Array.from({length:cidx.size},()=>[]);nodes.forEach((mem,i)=>nn[cidx.get(com[i])].push(...mem));nodes=nn;init=nn.map((_,i)=>i);break}
  const nn=Array.from({length:idx.size},()=>[]);const ninit=new Array(idx.size);nodes.forEach((mem,i)=>{const k=idx.get(sub[i]);nn[k].push(...mem);ninit[k]=cidx.get(com[i])});
  const W2=new Map();W.forEach((v,k)=>{const[a,b]=k.split('|').map(Number);put(W2,idx.get(sub[a]),idx.get(sub[b]),v)});
  // the last level's communities decide the answer, so keep them if the next level changes nothing
  nodes=nn;W=W2;init=ninit}
 // nodes whose start community still joins them collapse into one
 const final=new Map();nodes.forEach((mem,i)=>{(final.get(init[i])||final.set(init[i],[]).get(init[i])).push(...mem)});
 const label=members=>{const c=new Map();members.forEach(id=>{const g=groupOf(N[id])||N[id].name;c.set(g,(c.get(g)||0)+1)});return [...c.entries()].sort((a,b)=>b[1]-a[1])[0][0].split('/').pop()};
 const g=new Map();[...final.values()].sort((a,b)=>b.length-a.length).forEach((mem,i)=>{const nm=mem.length>1?`${label(mem)} · community ${i+1}`:'alone';mem.forEach(id=>g.set(id,nm))});return g}
function tarjan(ids,m){const out=new Map(ids.map(i=>[i,[]]));m.forEach((v,k)=>{const[a,b]=k.split('\u0001');if(out.has(a)&&out.has(b)&&a!==b)out.get(a).push(b)});
 let idx=0;const I=new Map(),low=new Map(),on=new Set(),stack=[],comps=[];
 const strong=v=>{I.set(v,idx);low.set(v,idx);idx++;stack.push(v);on.add(v);for(const w of out.get(v)){if(!I.has(w)){strong(w);low.set(v,Math.min(low.get(v),low.get(w)))}else if(on.has(w))low.set(v,Math.min(low.get(v),I.get(w)))}
  if(low.get(v)===I.get(v)){const c=[];let w;do{w=stack.pop();on.delete(w);c.push(w)}while(w!==v);comps.push(c)}};
 ids.forEach(v=>{if(!I.has(v))strong(v)});return comps.reverse()}
function ordered(R,C,m,square,how){let cycles=new Set();
 const deg=new Map();m.forEach((v,k)=>{const[a,b]=k.split('\u0001');deg.set('r'+a,(deg.get('r'+a)||0)+v);deg.set('c'+b,(deg.get('c'+b)||0)+v)});
 if(how==='degree'){R=[...R].sort((a,b)=>(deg.get('r'+b)||0)-(deg.get('r'+a)||0));C=square?R:[...C].sort((a,b)=>(deg.get('c'+b)||0)-(deg.get('c'+a)||0))}
 if(how==='barycenter')for(let it=0;it<6;it++){const ci=new Map(C.map((n,i)=>[n,i]));const bc=n=>{let s=0,k=0;C.forEach(c=>{const v=m.get(K(n,c));if(v){s+=ci.get(c)*v;k+=v}});return k?s/k:1e9};R=[...R].sort((a,b)=>bc(a)-bc(b));
  if(square){C=R;continue}const ri=new Map(R.map((n,i)=>[n,i]));const br=c=>{let s=0,k=0;R.forEach(r=>{const v=m.get(K(r,c));if(v){s+=ri.get(r)*v;k+=v}});return k?s/k:1e9};C=[...C].sort((a,b)=>br(a)-br(b))}
 if(square){const comps=tarjan(R,m);comps.forEach(c=>{if(c.length>1)c.forEach(x=>cycles.add(x))});if(how==='layers'){R=comps.flat();C=R}}
 return {R,C,cycles}}
// the groups a matrix folds into
const myGroups=lv=>{try{return JSON.parse(localStorage.getItem('trace-groups:'+lv)||'{}')}catch{return {}}};
const saveGroups=(lv,g)=>localStorage.setItem('trace-groups:'+lv,JSON.stringify(g));
function grouper(lv,ids,m,square,how){if(how==='clusters'&&square){const g=thebeau(ids,m);return id=>g.get(id)}
 if(how==='leiden'&&square){const g=leiden(ids,m);return id=>g.get(id)||'alone'}
 if(how==='mine'){const g=myGroups(lv);const at=new Map();Object.entries(g).forEach(([name,mem])=>mem.forEach(id=>at.set(id,name)));return id=>at.get(id)||'the rest'}
 if(how==='none')return ()=>'';return id=>groupOf(N[id])||lvName(lv)}
// fold the ordered items into groups, keeping the order of first sight; an open group lists its members
function fold(ids,gf,openSet,zoom){if(!zoom)return ids.map(id=>({id,members:[id]}));const groups=new Map();ids.forEach(id=>{const g=gf(id);(groups.get(g)||groups.set(g,[]).get(g)).push(id)});
 if(groups.size<2)return ids.map(id=>({id,members:[id]}));
 const out=[];groups.forEach((mem,g)=>{if(mem.length===1)out.push({id:mem[0],members:mem,group:g});else if(openSet.has(g)){out.push({id:'head:'+g,group:g,members:[],size:mem.length});mem.forEach(id=>out.push({id,members:[id],group:g}))}else out.push({group:g,members:mem,id:'group:'+g})});return out}
let MX=null; // what the last matrix drew, for the canvas and the graph
function matrixView(rowsLv,colsLv,m,title){const s=st.mx;const square=rowsLv===colsLv;
 let R=items(rowsLv).map(n=>n.id),C=items(colsLv).map(n=>n.id),rl=rowsLv,cl=colsLv;
 if(!square&&R.length<C.length){const t=new Map();m.forEach((v,k)=>{const[a,b]=k.split('\u0001');t.set(K(b,a),v)});m=t;[R,C]=[C,R];[rl,cl]=[cl,rl]}
 if(s.hide){const rs=new Set(),cs=new Set();m.forEach((v,k)=>{const[a,b]=k.split('\u0001');rs.add(a);cs.add(b)});R=R.filter(x=>rs.has(x));C=C.filter(x=>cs.has(x))}
 const o=ordered(R,C,m,square,s.order||'groups');R=o.R;C=o.C;
 const how=s.grouping||(square?'tree':'tree');const gr=grouper(rl,R,m,square,how),gc=square?gr:grouper(cl,C,m,square,how==='clusters'||how==='leiden'?'tree':how);
 const zoom=s.zoom!==false&&how!=='none';
 // with a grouping, items of one group sit together, in the order the menu set
 if(zoom||how!=='tree'){const byG=(ids,f)=>{const seen=[];const g=new Map();ids.forEach(id=>{const k=f(id);if(!g.has(k)){g.set(k,[]);seen.push(k)}g.get(k).push(id)});return seen.flatMap(k=>g.get(k))};R=byG(R,gr);C=square?R:byG(C,gc)}
 let RR=fold(R,gr,s.openRows,zoom),CC=square?null:fold(C,gc,s.openCols,zoom);if(square)CC=fold(C,gc,s.openRows,zoom);
 const [pr,pc]=s.size==='all'?[RR.length||1,CC.length||1]:s.size.split('x').map(Number);
 const rpages=Math.max(1,Math.ceil(RR.length/pr)),cpages=Math.max(1,Math.ceil(CC.length/pc));s.rp=Math.min(s.rp,rpages-1);s.cp=Math.min(s.cp,cpages-1);
 const Rp=RR.slice(s.rp*pr,(s.rp+1)*pr),Cp=CC.slice(s.cp*pc,(s.cp+1)*pc);
 const cell=(r,c)=>{let v=0;r.members.forEach(a=>c.members.forEach(b=>{v+=m.get(K(a,b))||0}));return v};
 MX={Rp,Cp,cell,cycles:o.cycles,square,rl,cl,title,r0:s.rp*pr,c0:s.cp*pc};
 const orders=[['groups','as the tree stands'],['degree','by link count'],['barycenter','barycenter'],...(square?[['layers','layers and cycles (Tarjan)']]:[])];
 const groupings=[['tree','the tree'],...(square?[['clusters','clusters by IGTA-plus'],['leiden','communities by Leiden']]:[]),['mine','my groups'],['none','no groups']];
 const picks=s.pickRows.size+s.pickCols.size;
 let links=0;m.forEach(v=>links+=v);
 return `<div class="mxbar"><span>groups <select id="mxgroup">${groupings.map(([k,l])=>`<option value="${k}" ${how===k?'selected':''}>${l}</option>`).join('')}</select></span>
  <label><input type="checkbox" id="mxzoom" ${zoom?'checked':''} ${how==='none'?'disabled':''}> fold groups</label>
  <span>order <select id="mxorder">${orders.map(([k,l])=>`<option value="${k}" ${(s.order||'groups')===k?'selected':''}>${l}</option>`).join('')}</select></span>
  <label><input type="checkbox" id="mxhide" ${s.hide?'checked':''}> hide empty rows and columns</label>
  <span>page <select id="mxsize">${['all','10x10','10x20','20x20','50x50'].map(z=>`<option ${s.size===z?'selected':''}>${z}</option>`).join('')}</select></span>
  ${rpages>1?`<span>rows <button data-p="rp,-1">‹</button> ${s.rp+1} of ${rpages} <button data-p="rp,1">›</button></span>`:''}
  ${cpages>1?`<span>columns <button data-p="cp,-1">‹</button> ${s.cp+1} of ${cpages} <button data-p="cp,1">›</button></span>`:''}
  ${picks?`<span class="pick">${picks} picked <button id="mkgroup">make a group</button> <button id="unpick">drop the picks</button></span>`:''}
  ${o.cycles.size?`<span class="sub">cells inside a cycle show red</span>`:''}
  ${how==='clusters'||how==='leiden'?`<span class="sub">a cluster's name comes from code, no language model: the folder or note most of its members share, then its rank by size</span>`:''}</div>
  <p class="hint">${esc(title)} · rows ${esc(lvName(rl).toLowerCase())}, columns ${esc(lvName(cl).toLowerCase())} · ${links} links · a click on a folded group opens it, a click on an item jumps to it, a shift-click picks it</p>
  <div class="mxsplit"><div class="mxtop"><div class="mxwrap"><canvas id="mx"></canvas><div class="hx" id="hx"></div><div class="hx" id="hy"></div></div></div>
  <div class="mxbot"><b>Graph</b> <span class="sub">${square?'an arc a link, in the order of the rows':'the rows on the left, the columns on the right, a band a link'} · it follows the pointer on the matrix</span><div class="gwrap"><canvas id="gv"></canvas></div></div></div>`}
function mxDraw(){const cv=document.getElementById('mx');if(!cv||!MX)return;const{Rp,Cp,cell,cycles,square,r0,c0}=MX;
 const css=k=>getComputedStyle(document.body).getPropertyValue(k).trim();const ink=css('--ink'),ink2=css('--ink2'),rule=css('--rule'),hi=css('--hi');
 const z=st.mx.scale||1;const cw=Math.max(2,Math.round(z*(Cp.length<=70?Math.max(12,Math.min(22,Math.floor(900/Cp.length))):Math.max(3,Math.floor(900/Cp.length))))),rh=Math.max(2,Math.round(z*(Rp.length<=600?16:Math.max(3,Math.floor(9000/Rp.length)))));
 const clabel=cw>=12,rlabel=rh>=12;const lab=x=>x.id.startsWith('head:')?`▾ ${x.group} (${x.size})`:x.id.startsWith('group:')?`▸ ${x.group} (${x.members.length})`:(x.group&&!x.id.startsWith('group:')&&Rp.some(r=>r.id==='head:'+x.group)||Cp.some(c=>c.id==='head:'+x.group)?'   ':'')+N[x.id].name;
 const LW=rlabel?280:44,TH=clabel?150:30;const W=LW+Cp.length*cw+140,H=TH+Rp.length*rh+2;
 const dpr=devicePixelRatio||1;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';const g=cv.getContext('2d');g.scale(dpr,dpr);g.font='11.5px system-ui';
 const vals=[];const V=Rp.map(r=>Cp.map(c=>{const v=cell(r,c);if(v)vals.push(v);return v}));const max=Math.max(1,...vals);const ramp=['#cde2fb','#9ec5f4','#6da7ec','#2a78d6','#184f95'];
 // the group lines draw over the cells, so a filled cell never hides one
 const groupLines=()=>{g.strokeStyle=css('--ink2');g.globalAlpha=.35;g.lineWidth=1;Rp.forEach((r,i)=>{if(i&&(r.group||r.id)!==(Rp[i-1].group||Rp[i-1].id)&&(r.group||Rp[i-1].group)){g.beginPath();g.moveTo(0,TH+i*rh+.5);g.lineTo(LW+Cp.length*cw,TH+i*rh+.5);g.stroke()}});
  Cp.forEach((c,j)=>{if(j&&(c.group||c.id)!==(Cp[j-1].group||Cp[j-1].id)&&(c.group||Cp[j-1].group)){g.beginPath();g.moveTo(LW+j*cw+.5,TH);g.lineTo(LW+j*cw+.5,TH+Rp.length*rh);g.stroke()}});g.globalAlpha=1};
 const picked=x=>st.mx.pickRows.has(x.id)||st.mx.pickCols.has(x.id);
 V.forEach((row,i)=>row.forEach((v,j)=>{if(!v)return;const r=Rp[i],c=Cp[j];const cyc=r.members.length===1&&c.members.length===1&&cycles.has(r.id)&&cycles.has(c.id);g.fillStyle=cyc?'#d03b3b':ramp[Math.min(4,Math.floor(4*v/max))];g.fillRect(LW+j*cw+.5,TH+i*rh+.5,Math.max(1,cw-1),Math.max(1,rh-1));
  if(cw>=18&&rh>=14&&(r.members.length>1||c.members.length>1)){g.fillStyle=v/max>.5?'#fff':'#121212';g.fillText(String(v),LW+j*cw+3,TH+i*rh+rh-4)}}));
 if(square){g.fillStyle=rule;Rp.forEach((r,i)=>{const j=Cp.findIndex(c=>c.id===r.id);if(j>=0&&r.members.length===1)g.fillRect(LW+j*cw,TH+i*rh,cw,rh)})}
 groupLines();g.strokeStyle=rule;g.strokeRect(LW,TH,Cp.length*cw,Rp.length*rh);
 if(!clabel){g.fillStyle=ink2;g.font='italic 11.5px system-ui';g.fillText('the columns are too narrow for their names, so zoom in to read them',LW,14)}
 if(rlabel)Rp.forEach((r,i)=>{g.fillStyle=picked(r)?css('--fill'):r.id.startsWith('group:')?ink:ink;g.font=(r.id.startsWith('group:')?'600 ':'')+'11.5px system-ui';g.fillText(lab(r).slice(0,40),38,TH+i*rh+rh-4);g.fillStyle=ink2;g.font='10.5px system-ui';g.textAlign='right';g.fillText(String(r0+i+1),32,TH+i*rh+rh-4);g.textAlign='left'});
 if(!rlabel&&rh>=9){g.fillStyle=ink2;g.font='9px system-ui';g.textAlign='right';Rp.forEach((r,i)=>g.fillText(String(r0+i+1),40,TH+i*rh+rh-2));g.textAlign='left'}
 if(cw>=12){g.fillStyle=ink2;g.font='10px system-ui';g.textAlign='center';Cp.forEach((c,j)=>g.fillText(String(c0+j+1),LW+j*cw+cw/2,TH-4));g.textAlign='left'}
 if(clabel)Cp.forEach((c,j)=>{g.save();g.translate(LW+j*cw+cw/2,TH-18);g.rotate(-Math.PI/4);g.fillStyle=picked(c)?css('--fill'):ink;g.font=(c.id.startsWith('group:')?'600 ':'')+'11.5px system-ui';g.fillText(lab(c).slice(0,30),0,0);g.restore()});
 const tip=document.getElementById('tt'),hx=document.getElementById('hx'),hy=document.getElementById('hy');
 const at=e=>{const b=cv.getBoundingClientRect();return {x:e.clientX-b.left,y:e.clientY-b.top}};
 // a name leans up and to the right at 45 degrees from its column's middle, so the column under a point on it sits left by the height above the numbers
 const colAt=p=>Math.floor((p.x-LW-Math.max(0,TH-18-p.y))/cw);
 const hit=p=>({i:p.y>=TH?Math.floor((p.y-TH)/rh):-1,j:p.x>=LW?Math.floor((p.x-LW)/cw):-1,inRowLabel:p.x<LW&&p.y>=TH,inColLabel:p.y<TH&&p.x>=LW-40});
 cv.onmousemove=e=>{const p=at(e);const h=hit(p);let i=h.i,j=h.j;if(h.inColLabel){j=colAt(p);i=-1}
  if(i>=Rp.length||j>=Cp.length){i=i>=Rp.length?-1:i;j=j>=Cp.length?-1:j}
  hx.style.display=i>=0?'block':'none';hy.style.display=j>=0?'block':'none';if(i>=0)Object.assign(hx.style,{left:'0px',top:(TH+i*rh)+'px',width:(LW+Cp.length*cw)+'px',height:rh+'px'});if(j>=0)Object.assign(hy.style,{left:(LW+j*cw)+'px',top:'0px',width:cw+'px',height:H+'px'});
  if(i>=0&&j>=0){tip.textContent=`${r0+i+1} ${lab(Rp[i])}  to  ${c0+j+1} ${lab(Cp[j])}: ${V[i][j]}`;tip.style.display='block';tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY+12)+'px'}else tip.style.display='none';
  graph(i,j)};
 cv.onmouseleave=()=>{tip.style.display='none';hx.style.display=hy.style.display='none';graph(-1,-1)};
 cv.onclick=e=>{const p=at(e);const h=hit(p);let x=null,axis=null;if(h.inRowLabel&&h.i>=0&&h.i<Rp.length){x=Rp[h.i];axis='r'}else if(h.inColLabel){const j=colAt(p);if(j>=0&&j<Cp.length){x=Cp[j];axis='c'}}else if(h.i>=0&&h.i<Rp.length&&h.j>=0&&h.j<Cp.length){x=Rp[h.i];axis='r'}
  if(!x)return;if(e.shiftKey){const set=axis==='r'||square?st.mx.pickRows:st.mx.pickCols;x.members.forEach(id=>set.has(id)?set.delete(id):set.add(id));render();return}
  if(x.id.startsWith('group:')){(axis==='r'||square?st.mx.openRows:st.mx.openCols).add(x.group);render();return}
  if(x.id.startsWith('head:')){(axis==='r'||square?st.mx.openRows:st.mx.openCols).delete(x.group);render();return}
  if(x.group&&!x.id.startsWith('group:')&&e.altKey){(axis==='r'||square?st.mx.openRows:st.mx.openCols).delete(x.group);render();return}
  jump(x.id)};
 cv.oncontextmenu=e=>{e.preventDefault();const h=hit(at(e));const x=h.i>=0&&h.i<Rp.length?Rp[h.i]:null;if(x&&x.group){st.mx.openRows.delete(x.group);st.mx.openCols.delete(x.group);render()}};
 graph(-1,-1)}
// the graph under the matrix, drawn from the same rows and columns
function graph(hi,hj){const cv=document.getElementById('gv');if(!cv||!MX)return;const{Rp,Cp,cell,square}=MX;const css=k=>getComputedStyle(document.body).getPropertyValue(k).trim();
 const ink=css('--ink'),ink2=css('--ink2'),rule=css('--rule'),fill=css('--fill');const dpr=devicePixelRatio||1;
 const lab=x=>x.id.startsWith('head:')?`${x.group} (${x.size}), open`:x.id.startsWith('group:')?`${x.group} (${x.members.length})`:N[x.id].name;
 if(square){const n=Rp.length;const W=Math.max(600,Math.min(1600,n*22+80)),H=250;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';const g=cv.getContext('2d');g.scale(dpr,dpr);
  const x=i=>40+i*((W-80)/Math.max(1,n-1)),base=H-70;
  Rp.forEach((r,i)=>Cp.forEach((c,j)=>{if(i===j)return;const v=cell(r,c);if(!v)return;const on=i===hi||j===hj||i===hj||j===hi;const x1=x(i),x2=x(Cp.indexOf(c)>=0?j:j);const cx=(x1+x2)/2,rr=Math.abs(x2-x1)/2;
   g.beginPath();g.strokeStyle=on?fill:rule;g.lineWidth=on?2:1;if(x2>x1)g.arc(cx,base,rr,Math.PI,0);else g.arc(cx,base,rr,0,Math.PI);g.stroke()}));
  g.font='10.5px system-ui';Rp.forEach((r,i)=>{g.fillStyle=i===hi||i===hj?fill:ink2;g.beginPath();g.arc(x(i),base,3,0,7);g.fill();if(n<=60){g.save();g.translate(x(i)+3,base+8);g.rotate(Math.PI/4);g.fillStyle=i===hi||i===hj?fill:ink;g.fillText(lab(r).slice(0,22),0,0);g.restore()}})}
 else{const W=900,H=Math.max(200,Math.max(Rp.length,Cp.length)*16+20);cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';const g=cv.getContext('2d');g.scale(dpr,dpr);g.font='11px system-ui';
  const yr=i=>10+i*((H-20)/Math.max(1,Rp.length-1)),yc=j=>10+j*((H-20)/Math.max(1,Cp.length-1));let max=1;Rp.forEach(r=>Cp.forEach(c=>max=Math.max(max,cell(r,c))));
  Rp.forEach((r,i)=>Cp.forEach((c,j)=>{const v=cell(r,c);if(!v)return;const on=i===hi||j===hj;g.beginPath();g.strokeStyle=on?fill:rule;g.globalAlpha=on?1:.7;g.lineWidth=1+4*v/max;g.moveTo(260,yr(i));g.bezierCurveTo(450,yr(i),450,yc(j),640,yc(j));g.stroke();g.globalAlpha=1}));
  Rp.forEach((r,i)=>{g.fillStyle=i===hi?fill:ink;g.textAlign='right';g.fillText(lab(r).slice(0,38),252,yr(i)+4)});Cp.forEach((c,j)=>{g.fillStyle=j===hj?fill:ink;g.textAlign='left';g.fillText(lab(c).slice(0,38),648,yc(j)+4)});g.textAlign='left'}}
function mxBind(b){const s=st.mx;const on=(id,ev,f)=>{const x=document.getElementById(id);if(x)x[ev]=f};
 on('mxhide','onchange',e=>{s.hide=e.target.checked;s.rp=s.cp=0;render()});on('mxzoom','onchange',e=>{s.zoom=e.target.checked;render()});
 on('mxorder','onchange',e=>{s.order=e.target.value;s.rp=s.cp=0;render()});on('mxgroup','onchange',e=>{s.grouping=e.target.value;s.openRows.clear();s.openCols.clear();s.rp=s.cp=0;render()});
 on('mxsize','onchange',e=>{s.size=e.target.value;s.rp=s.cp=0;render()});
 const zoomBy=f=>{s.scale=Math.max(.25,Math.min(6,(s.scale||1)*f));render()};
 const top=b.querySelector('.mxtop');if(top)top.onwheel=e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const sx=top.scrollLeft,sy=top.scrollTop;zoomBy(e.deltaY<0?1.15:1/1.15);const t2=b.querySelector('.mxtop')||document.querySelector('.mxtop');if(t2){const f=e.deltaY<0?1.15:1/1.15;t2.scrollLeft=sx*f;t2.scrollTop=sy*f}};
 on('unpick','onclick',()=>{s.pickRows.clear();s.pickCols.clear();render()});
 on('mkgroup','onclick',()=>{const name=prompt('Name the group');if(!name)return;[[s.pickRows,MX.rl],[s.pickCols,MX.cl]].forEach(([set,lv])=>{if(!set.size)return;const g=myGroups(lv);Object.keys(g).forEach(k=>g[k]=g[k].filter(id=>!set.has(id)));g[name]=[...(g[name]||[]),...set];saveGroups(lv,g)});s.pickRows.clear();s.pickCols.clear();s.grouping='mine';render()});
 b.querySelectorAll('[data-p]').forEach(x=>x.onclick=()=>{const[k,d]=x.dataset.p.split(',');s[k]=Math.max(0,s[k]+ +d);render()});
 setTimeout(mxDraw,0)}
function structure(){const lv=st.at.lv;return matrixView(lv,lv,inLevel(lv),`Design structure matrix of ${lvName(lv).toLowerCase()}, a row links to a column`)}
function mapView(){const[a,b]=st.at.map;const mp=mapping(a,b);return matrixView(mp.rows,mp.cols,mp.m,`Domain mapping matrix${mp.via?`, counting the paths through ${mp.via.toLowerCase()}`:''}`)}
