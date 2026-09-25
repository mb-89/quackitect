// ---- drawn diagrams: one layered layout serves the call graph and the block diagram
// Layers run left to right. A cycle collapses first (Tarjan), each node takes the longest path from a source
// as its layer, and a few barycenter sweeps order each layer to cut crossings (Sugiyama et al. 1981).
// Eades, Lin and Smyth (1993): peel sinks to the back and sources to the front, else the node whose out-weight most
// exceeds its in-weight; the links running backwards in that order are the few that break every cycle
function fasOrder(ids,edges,weight){const w=weight||(()=>1);const out=new Map(ids.map(i=>[i,new Map()])),inn=new Map(ids.map(i=>[i,new Map()]));
 edges.forEach(([a,b])=>{if(a===b||!out.has(a)||!out.has(b))return;out.get(a).set(b,(out.get(a).get(b)||0)+w(a,b));inn.get(b).set(a,(inn.get(b).get(a)||0)+w(a,b))});
 const left=new Set(ids),s1=[],s2=[];const drop=v=>{left.delete(v);out.get(v).forEach((_,x)=>inn.get(x).delete(v));inn.get(v).forEach((_,x)=>out.get(x).delete(v))};
 while(left.size){let moved=true;while(moved){moved=false;for(const v of [...left]){if(!out.get(v).size){s2.unshift(v);drop(v);moved=true}else if(!inn.get(v).size){s1.push(v);drop(v);moved=true}}}
  if(!left.size)break;let best=null,bv=-Infinity;for(const v of left){const d=[...out.get(v).values()].reduce((s,x)=>s+x,0)-[...inn.get(v).values()].reduce((s,x)=>s+x,0);if(d>bv){bv=d;best=v}}s1.push(best);drop(best)}
 return [...s1,...s2]}
function layered(ids,edges,fixedLayer,weight){const comps=tarjan(ids,new Map(edges.map(([a,b])=>[K(a,b),1])));const compOf=new Map();comps.forEach((c,i)=>c.forEach(x=>compOf.set(x,i)));
 const layer=new Map();if(fixedLayer)fixedLayer.forEach((v,k)=>layer.set(k,v));else{
  const order=fasOrder(ids,edges,weight);const at=new Map(order.map((x,i)=>[x,i]));const fwd=edges.filter(([a,b])=>at.get(a)<at.get(b));
  order.forEach(v=>layer.set(v,0));order.forEach(v=>fwd.forEach(([a,b])=>{if(a===v)layer.set(b,Math.max(layer.get(b),layer.get(a)+1))}))}
 const L=[];ids.forEach(id=>{const l=layer.get(id);(L[l]||(L[l]=[])).push(id)});for(let i=0;i<L.length;i++)L[i]=L[i]||[];
 const ins=new Map(),outs=new Map();edges.forEach(([a,b])=>{(outs.get(a)||outs.set(a,[]).get(a)).push(b);(ins.get(b)||ins.set(b,[]).get(b)).push(a)});
 for(let sweep=0;sweep<6;sweep++){const down=sweep%2===0;const range=down?[...L.keys()].slice(1):[...L.keys()].reverse().slice(1);
  range.forEach(l=>{const ref=L[down?l-1:l+1]||[];const at=new Map(ref.map((x,i)=>[x,i]));const bc=x=>{const ns=(down?ins.get(x):outs.get(x))||[];const ps=ns.filter(n=>at.has(n)).map(n=>at.get(n));return ps.length?ps.reduce((s,v)=>s+v,0)/ps.length:1e9};
   L[l]=[...L[l]].map((x,i)=>[x,bc(x),i]).sort((a,b)=>a[1]===b[1]?a[2]-b[2]:a[1]-b[1]).map(e=>e[0])})}
 return {L,compOf,layer}}
// boxes and square-cornered links, drawn as SVG; a back link routes below the boxes and shows dashed
function drawLayered(ids,edges,{label,sub,width=190,height=34,gapX=70,gapY=16,cls,fixedLayer,heights,rootId,weight,hl}){const{L,compOf,layer}=layered(ids,edges,fixedLayer,weight);
 const hOf=id=>heights?heights(id):height;const pos=new Map();let W=0,H=0;
 const colH=L.map(col=>col.reduce((s,id)=>s+hOf(id)+gapY,0));const maxH=Math.max(...colH,height);
 L.forEach((col,l)=>{let y=(maxH-colH[l])/2+10;col.forEach(id=>{pos.set(id,{x:20+l*(width+gapX),y});y+=hOf(id)+gapY});W=Math.max(W,20+(l+1)*(width+gapX));H=Math.max(H,y)});
 const css=k=>getComputedStyle(document.body).getPropertyValue(k).trim();const rule=css('--ink2'),fill=css('--fill');
 // each link leaves and arrives at its own port along the box edge, ordered by where its other end sits,
 // and takes its own vertical channel in the gap; a backward link runs in its own lane below every box
 const E=[];const seen=new Set();edges.forEach(([a,b])=>{if(pos.has(a)&&pos.has(b)&&a!==b&&!seen.has(a+'>'+b)){seen.add(a+'>'+b);E.push({a,b,back:layer.get(b)<=layer.get(a)})}});
 const outs=new Map(),ins=new Map();E.forEach(e=>{(outs.get(e.a)||outs.set(e.a,[]).get(e.a)).push(e);(ins.get(e.b)||ins.set(e.b,[]).get(e.b)).push(e)});
 const cy=id=>pos.get(id).y+hOf(id)/2;
 outs.forEach((es,id)=>{es.sort((p,q)=>(q.back-p.back)||cy(p.b)-cy(q.b));es.forEach((e,i)=>e.y1=pos.get(id).y+hOf(id)*(i+1)/(es.length+1))});
 ins.forEach((es,id)=>{es.sort((p,q)=>(p.back-q.back)||cy(p.a)-cy(q.a));es.forEach((e,i)=>e.y2=pos.get(id).y+hOf(id)*(i+1)/(es.length+1))});
 const gaps=new Map();E.filter(e=>!e.back).forEach(e=>{const g=layer.get(e.b)-1;(gaps.get(g)||gaps.set(g,[]).get(g)).push(e)});
 gaps.forEach(es=>{es.sort((p,q)=>p.y1-q.y1);es.forEach((e,i)=>e.slot=(i+1)/(es.length+1))});
 const backs=E.filter(e=>e.back);backs.forEach((e,i)=>e.lane=i);const laneY=H+14;
 const near=new Set(hl?[hl,...E.filter(e=>e.a===hl||e.b===hl).flatMap(e=>[e.a,e.b])]:[]);
 let paths='',boxes='';
 E.forEach(e=>{const A=pos.get(e.a),B=pos.get(e.b);const x1=A.x+width,x2=B.x;let d;
  if(!e.back){const g0=B.x-gapX;const mx=g0+10+e.slot*(gapX-20);d=`M${x1} ${e.y1} H${mx} V${e.y2} H${x2-1}`}
  else{const yl=laneY+e.lane*7,o=6+(e.lane%6)*3;d=`M${x1} ${e.y1} H${x1+o} V${yl} H${x2-o} V${e.y2} H${x2-1}`}
  const on=hl&&(e.a===hl||e.b===hl);const col=on?fill:e.back?'#d03b3b':rule;
  paths+=`<path d="${d}" fill="none" stroke="${col}" stroke-width="${on?2.4:1.2}" ${e.back?'stroke-dasharray="5 3"':''} marker-end="url(#arrow${on?'h':e.back?'r':''})" opacity="${hl&&!on?.15:.85}"/>`});
 H=laneY+backs.length*7;
 ids.forEach(id=>{const p=pos.get(id);const h=hOf(id);const dim=hl&&!near.has(id);boxes+=`<g class="${cls?cls(id):''}" data-node="${esc(id)}" transform="translate(${p.x},${p.y})" opacity="${dim?.3:1}"><rect width="${width}" height="${h}" rx="3" class="box ${id===rootId||id===hl?'root':''}"/><text x="8" y="15" class="bt">${esc(label(id)).slice(0,30)}</text>${sub?sub(id,width,h):''}</g>`});
 return `<svg width="${W+20}" height="${H+30}" class="diagram"><defs><marker id="arrowh" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="${fill}"/></marker><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="${rule}"/></marker><marker id="arrowr" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#d03b3b"/></marker></defs>${paths}${boxes}</svg>`}
// ---- the call graph, as Doxygen draws one: the function on the left, what it calls to the right, in layers
function cgKey(f,n){return f+'#'+n}
function cgCalls(){const out=new Map(),inn=new Map();Object.entries(D.calls).forEach(([f,fs])=>fs.forEach(fn=>fn.calls.forEach(([g,n])=>{const a=cgKey(f,fn.name),b=cgKey(g,n);(out.get(a)||out.set(a,[]).get(a)).push(b);(inn.get(b)||inn.set(b,[]).get(b)).push(a)})));return {out,inn}}
let CG=null;
function callGraph(){CG=CG||cgCalls();const s=st.cg;
 const files=items('code').filter(n=>(D.calls[n.id]||[]).length);
 const fileSel=s.file&&D.calls[s.file]?s.file:(st.at.id&&D.calls[st.at.id]?st.at.id:files[0].id);s.file=fileSel;
 const fns=D.calls[fileSel]||[];const root=s.fn&&s.fn.startsWith(fileSel+'#')?s.fn:cgKey(fileSel,(fns.find(f=>f.calls.length)||fns[0]).name);s.fn=root;
 const dir=s.dir||'callees',depth=s.depth||2;const next=dir==='callees'?CG.out:CG.inn;
 const ids=[root],edges=[],lv=new Map([[root,0]]);let front=[root];let cut=new Set();
 for(let d=1;d<=depth;d++){const nx=[];front.forEach(a=>(next.get(a)||[]).forEach(b=>{edges.push(dir==='callees'?[a,b]:[b,a]);if(!lv.has(b)){lv.set(b,d);ids.push(b);nx.push(b)}}));front=nx}
 front.forEach(a=>{if((next.get(a)||[]).length)cut.add(a)});
 // callers read right to left in Doxygen, so their layers mirror
 const fixed=new Map([...lv].map(([k,v])=>[k,dir==='callees'?v:depth-v]));
 const svg=drawLayered(ids,edges,{label:id=>id.split('#')[1]+'()',sub:(id,w)=>`<text x="8" y="28" class="bs">${esc(N[id.split('#')[0]]?.name||'')}</text>`,fixedLayer:fixed,rootId:root,width:200,height:36,cls:id=>cut.has(id)?'cut':''});
 const list=`<div class="cglist"><select id="cgfile">${files.map(n=>`<option value="${esc(n.id)}" ${n.id===fileSel?'selected':''}>${esc(n.name)}</option>`).join('')}</select>
  <div class="cgfns">${fns.map(fn=>`<div class="cgfn ${cgKey(fileSel,fn.name)===root?'sel':''}" data-fn="${esc(cgKey(fileSel,fn.name))}"><code>${esc(fn.name)}</code> <span class="n">${fn.calls.length||''}</span><a class="open" title="open at line ${fn.line}">↗</a></div>`).join('')}</div></div>`;
 return `<div class="mxbar"><span>show <select id="cgdir"><option value="callees" ${dir==='callees'?'selected':''}>what it calls</option><option value="callers" ${dir==='callers'?'selected':''}>what calls it</option></select></span>
  <span>depth ${[1,2,3,4].map(d=>`<button class="dep ${depth===d?'on':''}" data-cgd="${d}">${d}</button>`).join('')}</span>
  <span class="sub">a click on a box moves the graph to that function · a box with a red edge calls further than the depth shows · found by name, so a call through a variable stays out</span></div>
  <div class="cgsplit">${list}<div class="cgdraw">${svg}</div></div>`}
function cgBind(b){const s=st.cg;const f=document.getElementById('cgfile');if(f)f.onchange=()=>{s.file=f.value;s.fn=null;select(f.value)};
 b.querySelectorAll('[data-fn]').forEach(x=>x.onclick=e=>{if(e.target.classList.contains('open'))return;s.fn=x.dataset.fn;renderKeep()});
 b.querySelectorAll('.cgdraw [data-node]').forEach(x=>x.onclick=()=>{const id=x.dataset.node;s.fn=id;s.file=id.split('#')[0];select(s.file)});
 const d=document.getElementById('cgdir');if(d)d.onchange=()=>{s.dir=d.value;renderKeep()};b.querySelectorAll('[data-cgd]').forEach(x=>x.onclick=()=>{s.depth=+x.dataset.cgd;renderKeep()})}
// ---- design outputs as blocks: a design output uses another where its code imports the other's code
// a code file counts for the one design output it points at most, the first by name on a tie
function primaryDo(f){const c=new Map();(D.f2s[f]||[]).forEach(s=>{const n=N[s]?.note;if(n)c.set(n,(c.get(n)||0)+1)});const top=[...c].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0];return top?top[0]:null}
function doDeps(src){const m=new Map();const put=(a,b)=>{if(a!==b&&N[a]&&N[b])m.set(K(a,b),(m.get(K(a,b))||0)+1)};
 if(src==='notes'){D.dd.forEach(([a,b,k])=>{if(N[a]?.lv==='do'&&N[b]?.lv==='do')for(let i=0;i<k;i++)put(a,b)});return m}
 // a code file counts for the one design output it points at most, so a file citing several notes links one box
 const dosOf=f=>{const d=primaryDo(f);return d?[d]:[]}; Object.entries(D.imports).forEach(([a,qs])=>{if(N[a]?.lv!=='code')return;qs.forEach(b=>{if(N[b]?.lv!=='code')return;dosOf(a).forEach(x=>dosOf(b).forEach(y=>put(x,y)))})});return m}
function blockView(withSections){const s=st.dg;const src=s.src||'code';const m=doDeps(src);const min=s.min||2;
 // hiding drops a box with no import at all, whatever the threshold hides
 const ids=items('do').map(n=>n.id).filter(id=>!s.hideLone||[...m].some(([k])=>k.split('\u0001').includes(id)));
 const edges=[...m].filter(([,v])=>v>=min).map(([k])=>k.split('\u0001'));
 const secsIn=id=>(secsOf.get(id)||[]);
 // a box grows with what it holds: sections and code files, on a square root, from once to three times the smallest
 const bulk=id=>secsIn(id).length+(()=>{const f=new Set();secsIn(id).forEach(x=>(codeOf.get(x)||[]).forEach(c=>f.add(c)));return f.size})();
 const bs=ids.map(bulk).map(Math.sqrt),blo=Math.min(...bs),bhi=Math.max(...bs);const scale=id=>1+2*(bhi>blo?(Math.sqrt(bulk(id))-blo)/(bhi-blo):0);
 const hOf=id=>withSections?30+Math.min(secsIn(id).length,12)*14+(secsIn(id).length>12?14:0):Math.round(40*scale(id));
 const svg=drawLayered(ids,edges,{label:id=>N[id].name,width:withSections?250:190,heights:hOf,gapX:90,weight:(a,b)=>m.get(K(a,b))||1,hl:s.hl,
  sub:(id,w,h)=>withSections?secsIn(id).slice(0,12).map((sid,i)=>`<text x="12" y="${32+i*14}" class="bs">${esc(N[sid].name).slice(0,38)}</text>`).join('')+(secsIn(id).length>12?`<text x="12" y="${32+12*14}" class="bs">and ${secsIn(id).length-12} more</text>`:''):`<text x="8" y="30" class="bs">${secsIn(id).length} sections · ${(()=>{const f=new Set();secsIn(id).forEach(x=>(codeOf.get(x)||[]).forEach(c=>f.add(c)));return f.size})()} code files</text>`});
 return `<div class="mxbar"><span>links from <select id="dgsrc"><option value="code" ${src==='code'?'selected':''}>code imports</option><option value="notes" ${src==='notes'?'selected':''}>links between notes</option></select></span>
  <span>at least <select id="dgmin">${[1,2,5,10,20].map(v=>`<option ${min===v?'selected':''}>${v}</option>`).join('')}</select> imports a link</span>
  <label><input type="checkbox" id="dglone" ${s.hideLone?'checked':''}> hide boxes with no ${src==='code'?'imports':'links'}</label>
  <span class="sub">a box uses the boxes to its right · a red dashed link runs backwards and closes a cycle · a click on a box lights its links and fills the local trace, a second click clears it · a drag pans</span></div><div class="cgdraw pan" data-pan="block">${svg}</div>`}
// ---- the onion: the core is what everything uses, and each ring out uses the rings inside it
function onionView(){const s=st.dg;const src=s.src||'code';const m=doDeps(src);const min=s.min||1;const ids=items('do').map(n=>n.id);
 const edges=[...m].filter(([,v])=>v>=min).map(([k])=>k.split('\u0001'));
 const wt=(a,b)=>m.get(K(a,b))||1;const{compOf}=layered(ids,edges,null,wt);const cyc=new Set(ids.filter(id=>ids.some(o=>o!==id&&compOf.get(o)===compOf.get(id))));
 // the feedback order breaks the cycles; a node's ring is the longest chain of kept uses below it, so what uses nothing sits in the core
 const order=fasOrder(ids,edges,wt);const at=new Map(order.map((x,i)=>[x,i]));const uses=new Map();edges.forEach(([a,b])=>{if(at.get(a)<at.get(b))(uses.get(a)||uses.set(a,[]).get(a)).push(b)});
 const ring=new Map();const r=id=>{if(ring.has(id))return ring.get(id);const v=Math.max(0,...(uses.get(id)||[]).map(x=>r(x)+1));ring.set(id,v);return v};ids.forEach(r);
 // an onion reads with a handful of rings, so the chain depths band into four at most
 const kind=s.onion||'ports';let R,ringNames=[];
 if(kind==='ports'){
  // ports and adapters: a design output whose code reaches files, processes, the network, a database, the terminal or
  // the editor is an adapter and sits outside; one that nothing uses is an entry and sits outside too; pure code that
  // others use is the core; the rest is the application between them
  const IO=/^(node:(fs|fs\/promises|child_process|http|https|net|os|readline|worker_threads|dgram)|vscode|os|os\/exec|os\/signal|net|net\/http|database\/sql|syscall|github\.com\/fsnotify\/fsnotify|github\.com\/charmbracelet\/bubbletea|github\.com\/mattn\/go-sqlite3)$/;
  const mine=new Map();items('code').forEach(f=>{const d=primaryDo(f.id);if(d)(mine.get(d)||mine.set(d,[]).get(d)).push(f.id)});
  const touch=id=>{const fs=mine.get(id)||[];return fs.length?fs.filter(f=>(D.ext[f]||[]).some(x=>IO.test(x))).length/fs.length:0};
  const usedBy=id=>edges.filter(([a,b])=>b===id).length,usesN=id=>edges.filter(([a])=>a===id).length;
  ids.forEach(id=>{const t=touch(id);ring.set(id,t>=.34||(!usedBy(id)&&usesN(id))?2:t===0&&usedBy(id)?0:1)});R=3;ringNames=['core','application','adapters']}
 else{const R0=Math.max(...ring.values())+1;R=Math.min(4,R0);ring.forEach((v,k)=>ring.set(k,Math.floor(v*R/R0)))}
 const rings=Array.from({length:R},(_,i)=>ids.filter(id=>ring.get(id)===i));
 const size=760,c=size/2,step=(c-20)/R;let out='';
 const css=k=>getComputedStyle(document.body).getPropertyValue(k).trim();const ink=css('--ink'),ink2=css('--ink2'),rule=css('--rule');
 const hues=['#cde2fb','#b7d3f6','#9ec5f4','#86b6ef','#6da7ec','#5598e7'];
 const arc=(r0,r1,a0,a1)=>{const p=(r,a)=>[c+r*Math.cos(a),c+r*Math.sin(a)];const big=a1-a0>Math.PI?1:0;const[x0,y0]=p(r1,a0),[x1,y1]=p(r1,a1),[x2,y2]=p(r0,a1),[x3,y3]=p(r0,a0);
  return r0<1?`M${c} ${c} L${x0} ${y0} A${r1} ${r1} 0 ${big} 1 ${x1} ${y1} Z`:`M${x0} ${y0} A${r1} ${r1} 0 ${big} 1 ${x1} ${y1} L${x2} ${y2} A${r0} ${r0} 0 ${big} 0 ${x3} ${y3} Z`};
 const where=new Map();
 rings.forEach((ids2,i)=>{const r0=i*step,r1=(i+1)*step;const n=ids2.length||1;ids2.forEach((id,k)=>{const a0=-Math.PI/2+k*2*Math.PI/n,a1=a0+2*Math.PI/n-(n>1?.02:0);
  out+=`<path d="${n===1&&i===0?`M${c} ${c} m-${r1} 0 a${r1} ${r1} 0 1 0 ${2*r1} 0 a${r1} ${r1} 0 1 0 -${2*r1} 0`:arc(r0,r1,a0,a1)}" fill="${hues[Math.min(i,hues.length-1)]}" stroke="${css('--bg')}" stroke-width="2" data-node="${esc(id)}" class="seg ${cyc.has(id)?'cyc':''}"><title>${esc(N[id].name)}: ring ${i+1}</title></path>`;
  const am=(a0+a1)/2,rm=i===0&&n===1?0:(r0+r1)/2;where.set(id,[c+rm*Math.cos(am),c+rm*Math.sin(am)]);
  out+=`<text x="${c+rm*Math.cos(am)}" y="${c+rm*Math.sin(am)+4}" text-anchor="middle" class="ot">${esc(N[id].name)}</text>`})});
 ringNames.forEach((nm,i)=>{out+=`<text x="${c}" y="${c+(i+1)*step-8}" text-anchor="middle" class="rn">${nm}</text>`});
 // a use that points outward breaks the onion, so it draws red
 // links draw for the clicked segment alone: an outward use in red, an inward one in grey
 let bad=0,lines='';edges.forEach(([a,b])=>{const out=ring.get(b)>ring.get(a);if(out)bad++;if(!s.hl||(a!==s.hl&&b!==s.hl))return;const[x1,y1]=where.get(a),[x2,y2]=where.get(b);
  lines+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${out?'#d03b3b':'#52514e'}" stroke-width="2.5" opacity=".85" marker-end="url(#arrow${out?'r':'g'})"/>`});
 return `<div class="mxbar"><span>links from <select id="dgsrc"><option value="code" ${src==='code'?'selected':''}>code imports</option><option value="notes" ${src==='notes'?'selected':''}>links between notes</option></select></span>
  <span>at least <select id="dgmin">${[1,2,5,10,20].map(v=>`<option ${min===v?'selected':''}>${v}</option>`).join('')}</select> imports a link</span>
  <span>onion <select id="dgonion"><option value="ports" ${kind==='ports'?'selected':''}>ports and adapters</option><option value="depth" ${kind==='depth'?'selected':''}>by depth of use</option></select></span>
  <span class="sub">${kind==='ports'?'adapters outside touch the world through outside modules, the core inside is pure code the others use':'the core uses nothing, each ring uses the rings inside it'} · uses should point inwards, and ${bad} point outwards · a click on a segment draws its links, outward in red ·${cyc.size?`${cyc.size} design outputs sit in a cycle (outlined red)`:'no cycles'}</span></div>
  <svg viewBox="0 0 ${size} ${size}" style="height:min(40vh,${size}px);width:auto" class="diagram onion"><defs><marker id="arrowg" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#52514e"/></marker><marker id="arrowr" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#d03b3b"/></marker></defs>${out}${lines}</svg>`}
function dgBind(b){const s=st.dg;const on=(id,f)=>{const x=document.getElementById(id);if(x)x.onchange=()=>{f(x);renderKeep()}};
 on('dgsrc',x=>s.src=x.value);on('dgonion',x=>s.onion=x.value);on('dgmin',x=>s.min=+x.value);on('dglone',x=>s.hideLone=x.checked);
 const inside=st.view==='block'&&s.path&&s.path.length;
 b.querySelectorAll('.diagram [data-node]').forEach(x=>{const id=x.dataset.node;const port=id.startsWith('in:')||id.startsWith('out:');const target=port?id.split(':').slice(1).join(':'):id;
  x.onclick=()=>{if(inside){s.hlIn=s.hlIn===id?null:id;if(!port)select(id);else renderKeep();return}s.hl=s.hl===id?null:id;select(id)};
  // a double-click opens a block into what it holds, and a port opens the block it stands for
  if(st.view==='block')x.ondblclick=()=>{if(inside&&!port)return;s.path=[...(s.path||[]),target];s.hlIn=null;render()}})}
// ---- trace columns: one renderer for the local trace and the call graph
// The middle column holds the items in focus. Columns to the left and right follow two relations outwards,
// one step a column, as deep as the switch says. A click moves the focus to a card; a shift-click adds it to the middle.
const CT={};
function traceColumns(key,{centers,left,right,depth,label,sub,group,leftName,rightName}){
 const walk=(fn)=>{const cols=[];const seen=new Set(centers);let front=centers;for(let d=0;d<depth;d++){const nx=[];const at=new Map();
   front.forEach(f=>fn(f).forEach(id=>{if(seen.has(id)){const e=at.get(id);if(e)e.from.push(f);return}seen.add(id);const e={id,from:[f]};at.set(id,e);nx.push(e)}));
   if(!nx.length)break;if(group)nx.sort((a,b)=>group(a.id).localeCompare(group(b.id)));cols.push(nx);front=nx.map(e=>e.id)}return cols};
 const L=walk(left).reverse(),R=walk(right);const C=[...L,centers.map(id=>({id,from:[]})),...R];const mid=L.length;
 const CW=220,CH=subH(sub),G=50,GH=20;const pos=new Map();let H=0;const heads=[];
 C.forEach((col,i)=>{let y=GH,last=null;col.forEach(e=>{const g=group?group(e.id):'';if(g&&g!==last){heads.push({x:i*(CW+G),y,label:g});y+=GH;last=g}pos.set(e.id,{x:i*(CW+G),y});y+=CH+6});H=Math.max(H,y)});
 // the middle column centres on the tallest side
 const midX=mid*(CW+G);const midH=Math.max(...C[mid].map(e=>pos.get(e.id).y))+CH;const off=Math.max(0,Math.min((H-midH)/2,120));C[mid].forEach(e=>{pos.get(e.id).y+=off});heads.forEach(h=>{if(h.x===midX)h.y+=off});
 let paths='';const link=(a,b)=>{const A=pos.get(a),B=pos.get(b);if(!A||!B)return;const Lp=A.x<B.x?A:B,Rp=A.x<B.x?B:A;const x1=Lp.x+CW,x2=Rp.x,y1=Lp.y+CH/2,y2=Rp.y+CH/2;paths+=`<path d="M${x1} ${y1} C${x1+G/2} ${y1},${x2-G/2} ${y2},${x2} ${y2}" stroke="var(--refine)" fill="none" stroke-width="1.2"/>`};
 C.forEach(col=>col.forEach(e=>e.from.forEach(f=>link(f,e.id))));
 const W=C.length*(CW+G);const inMid=new Set(centers);
 const cards=C.flat().map(e=>{const p=pos.get(e.id);return `<div class="lt ${inMid.has(e.id)?'me':''}" data-ct="${esc(key)}" data-id="${esc(e.id)}" style="left:${p.x}px;top:${p.y}px;width:${CW}px;height:${CH}px"><div>${esc(label(e.id))}<a class="open" title="open">↗</a></div>${sub?`<div class="ls">${esc(sub(e.id))}</div>`:''}</div>`}).join('');
 const hs=heads.map(h=>`<div class="lth" style="left:${h.x}px;top:${h.y}px;width:${CW}px">${esc(h.label)}</div>`).join('');
 const tops=C.map((col,i)=>`<div class="lth ct" style="left:${i*(CW+G)}px;top:0;width:${CW}px">${i<mid?`${leftName}, ${mid-i}`:i===mid?'in focus':`${rightName}, ${i-mid}`} <span class="n">${col.length}</span></div>`).join('');
 return `<div class="ctwrap pan" data-pan="${esc(key)}"><div style="position:relative;width:${W}px;height:${H+10}px"><svg width="${W}" height="${H+10}" style="position:absolute;left:0;top:0">${paths}</svg>${tops}${hs}${cards}</div></div>`}
function subH(sub){return sub?36:24}
function ctBind(b){b.querySelectorAll('.lt[data-ct]').forEach(x=>x.onclick=e=>{if(e.target.classList.contains('open'))return;const a=CT[x.dataset.ct];if(!a)return;e.shiftKey?a.add(x.dataset.id):a.jump(x.dataset.id)});
 // a drag on empty ground pans the view, as a scroll bar does
 b.querySelectorAll('.pan').forEach(el=>{el.onmousedown=e=>{if(e.button!==0||e.target.closest('.lt,[data-node],button,select,a'))return;const sx=e.clientX,sy=e.clientY,l=el.scrollLeft,t=el.scrollTop;el.classList.add('dragging');
  const mv=ev=>{el.scrollLeft=l-(ev.clientX-sx);el.scrollTop=t-(ev.clientY-sy)};const up=()=>{el.classList.remove('dragging');removeEventListener('mousemove',mv);removeEventListener('mouseup',up)};addEventListener('mousemove',mv);addEventListener('mouseup',up);e.preventDefault()}})}
// the local trace over the trace columns: parents to the left, children to the right, and shift-click adds to the focus
function local(){const id=st.at&&st.at.id;if(!id)return '<p class="sub">Select an item above, and its local trace draws here.</p>';
 st.extra=(st.extra||[]).filter(x=>x!==id&&N[x]);const centers=[id,...st.extra];
 CT.local={jump:x=>{st.extra=[];jump(x)},add:x=>{st.extra.includes(x)?st.extra=st.extra.filter(y=>y!==x):st.extra.push(x);renderKeep()}};
 return `<div class="ltbar"><b>Local trace</b> <span class="sub">levels each way</span> ${[1,2,3].map(d=>`<button class="dep ${st.depth===d?'on':''}" data-d="${d}">${d}</button>`).join('')} <span class="sub">a click moves the focus, a shift-click adds a card to the focus</span></div>`+
  traceColumns('local',{centers,left:x=>parents(x).map(r=>r.id),right:x=>children(x).map(r=>r.id),depth:st.depth,label:x=>N[x].name,group:x=>lvName(N[x].lv),leftName:'comes from',rightName:'feeds'})}
// the call graph over the same columns: the open file's functions in the middle, what they call to the left, what calls them to the right
function callGraph(){CG=CG||cgCalls();const s=st.cg;const files=items('code').filter(n=>(D.calls[n.id]||[]).length);
 const file=st.at.id&&D.calls[st.at.id]?st.at.id:(s.file&&D.calls[s.file]?s.file:files[0].id);
 if(s.file!==file){s.file=file;s.centers=null}const all=(D.calls[file]||[]).map(fn=>cgKey(file,fn.name));const centers=s.centers&&s.centers.length?s.centers:all;
 const depth=s.depth||1;
 CT.calls={jump:x=>{s.centers=[x];renderKeep()},add:x=>{const c=s.centers&&s.centers.length?s.centers:[...all];s.centers=c.includes(x)?c.filter(y=>y!==x):[...c,x];renderKeep()}};
 return `<div class="mxbar"><span>file <select id="cgfile">${files.map(n=>`<option value="${esc(n.id)}" ${n.id===file?'selected':''}>${esc(n.name)}</option>`).join('')}</select></span>
  <span>levels each way ${[1,2,3,4].map(d=>`<button class="dep ${depth===d?'on':''}" data-cgd="${d}">${d}</button>`).join('')}</span>
  ${s.centers&&s.centers.length?`<button class="dep" id="cgall">all functions of the file</button>`:''}
  <span class="sub">what it calls to the left, what calls it to the right · a click moves the focus to a function, a shift-click adds one · found by name, so a call through a variable stays out</span></div>`+
  traceColumns('calls',{centers,left:x=>CG.out.get(x)||[],right:x=>CG.inn.get(x)||[],depth,label:x=>x.split('#')[1]+'()',sub:x=>N[x.split('#')[0]]?.name||'',group:null,leftName:'calls',rightName:'called by'})}
function cgBind(b){const s=st.cg;const f=document.getElementById('cgfile');if(f)f.onchange=()=>{s.file=f.value;s.centers=null;select(f.value)};
 b.querySelectorAll('[data-cgd]').forEach(x=>x.onclick=()=>{s.depth=+x.dataset.cgd;renderKeep()});const all=document.getElementById('cgall');if(all)all.onclick=()=>{s.centers=null;renderKeep()}}
