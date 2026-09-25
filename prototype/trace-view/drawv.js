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
