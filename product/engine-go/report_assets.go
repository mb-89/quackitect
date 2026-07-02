package main

// reportLegend, reportCSS and reportJS are ported verbatim from the Python report.py
// (LEGEND / CSS / INIT_JS), with a single filter box added on top of the graph column.

const reportLegend = `<div class=legend>` +
	`<label class=lg><input type=checkbox class=tytog data-type=need checked><i class='sw need'></i>need</label>` +
	`<label class=lg><input type=checkbox class=tytog data-type=usecase checked><i class='sw usecase'></i>use-case</label>` +
	`<label class=lg><input type=checkbox class=tytog data-type=requirement checked><i class='sw requirement'></i>requirement</label>` +
	`<label class=lg><input type=checkbox class=tytog data-type=design><i class='sw design'></i>design</label>` +
	`<label class=lg><input type=checkbox class=tytog data-type=test checked><i class='sw test'></i>test</label>` +
	`<label class=lg><input type=checkbox class=tytog data-type=adr><i class='sw adr'></i>ADR</label>` +
	`</div>`

const reportCSS = `
*{box-sizing:border-box} body{margin:0;font:14px/1.45 system-ui,Segoe UI,sans-serif;color:#1e1e1e;background:#fafafa}
header{display:flex;gap:13px;align-items:center;height:50px;padding:0 20px;background:#fff;border-bottom:1px solid #e3e3e3}
.brandlogo{height:80%;display:flex;align-items:center} .brandlogo svg{height:100%;width:auto;display:block}
.h1{font-size:20px;font-weight:600;cursor:pointer} .ver{color:#777;font-weight:400;font-size:15px}
.meta{color:#777} .hash{font-family:ui-monospace,Consolas,monospace;color:#999;font-size:12px;margin-left:auto}
.stamp{font-family:ui-monospace,Consolas,monospace;color:#bbb;font-size:12px}
.pill{font-weight:600;font-size:12px;padding:3px 10px;border-radius:20px}
.pill.green{background:#d8f5d8;color:#1c6b1c} .pill.amber{background:#ffe9b0;color:#7a5800}
.grid{display:grid;grid-template-columns:330px 1fr 330px;gap:0;height:calc(100vh - 52px)}
.col{overflow:auto;padding:12px 16px;border-right:1px solid #ececec}
.col.mid{display:flex;flex-direction:column;padding:12px 12px 0;min-height:0;overflow:hidden}
.col.right{display:flex;flex-direction:column}
.push{margin-top:auto}
h2{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#999;margin:6px 0 10px}
.iter{margin-bottom:6px;border:1px solid #eee;border-radius:6px;background:#fff}
.iter>summary{cursor:pointer;padding:7px 10px;font-weight:600;list-style:none}
.iter.current>summary{background:#eef6ff} .frac{float:right;color:#999;font-weight:400}
.rid{font-family:ui-monospace,Consolas,monospace;font-size:12px}
.tg{position:relative;margin:4px 0 8px;padding-left:12px}
.tg:before{content:"";position:absolute;left:5px;top:12px;bottom:12px;width:2px;background:#e8e8e8}
.bracket{position:relative;font-size:10px;font-weight:700;letter-spacing:.09em;color:#9a9a9a;padding:5px 0 5px 6px;cursor:pointer}
.bracket:hover{color:#666}
.bracket .bdot{position:absolute;left:-11px;top:50%;transform:translateY(-50%);width:9px;height:9px;border-radius:50%;background:#bbb;border:2px solid #fafafa}
.bracket.end.ok .bdot{background:#3a9d3a}
.ms{margin:2px 0}
.ms>summary,.task.par>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:7px;padding:4px 6px;border-radius:4px}
.ms>summary::-webkit-details-marker,.task.par>summary::-webkit-details-marker{display:none}
.ms>summary:hover,.task.par>summary:hover,a.task:hover{background:#f4f4f4}
.ms>summary:before,.task.par>summary:before{content:"▸";display:inline-block;width:10px;font-size:10px;color:#bcc6d6}
.ms[open]>summary:before,.task.par[open]>summary:before{content:"▾"}
.mstag{font-family:ui-monospace,Consolas,monospace;font-size:10px;font-weight:700;color:#52628a;background:#eef2f9;border:1px solid #dce4f2;border-radius:10px;padding:1px 8px}
.mscount{font-family:ui-monospace,Consolas,monospace;font-size:10px;color:#aaa}
.kids{padding-left:11px;margin-left:5px;border-left:1px solid #ececec}
.nolane{border-left:none;padding-left:0;margin-left:0}
a.task{display:flex;align-items:center;gap:8px;padding:3px 6px;text-decoration:none;color:#333;border-radius:4px}
a.task.leaf{padding-left:23px}
.task.par>summary .rid{font-weight:600;color:#222}
.mk{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;font-size:12px;font-weight:700;line-height:1;flex:none}
.mk.done{color:#2e8b2e}.mk.sus{color:#e0a400}.mk.fail{color:#d23b3b}
.mscount.empty{color:#cbcbcb}
.mshint{font-size:11px;color:#b5b5b5;font-style:italic;padding:2px 6px 3px}
.auto{font-size:9px;color:#5a7a5a;background:#eef4ec;border:1px solid #d8e6d4;border-radius:8px;padding:0 5px;margin-left:auto;text-transform:uppercase;letter-spacing:.04em}
.legendrow{display:flex;align-items:center;gap:10px;margin-bottom:4px}
#trace-filter{width:180px;flex:none;padding:3px 7px;border:1px solid #ccd;border-radius:5px;font:11px ui-monospace,Consolas,monospace}
#tabbar{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px}
.tab{cursor:pointer;font-size:12px;padding:3px 10px;border:1px solid #ddd;border-radius:14px;background:#fff;font-family:ui-monospace,monospace}
.tab.active{background:#1e1e1e;color:#fff;border-color:#1e1e1e}
#graph{height:calc(100vh - 168px);background:#fff;border:1px solid #eee;border-radius:6px}
.ns{color:#999;padding:20px}
.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.card{border:1px solid #eee;border-radius:6px;padding:6px 8px;background:#fff;min-width:0;cursor:pointer}
.card:hover{background:#fafafa;border-color:#ddd}
.cval{font-size:16px;font-weight:700;line-height:1.1} .clabel{font-size:10px;color:#666;margin-top:1px}
.legend{display:flex;flex-wrap:wrap;gap:4px 12px;padding:6px 2px 6px;font-size:11px;color:#666;flex:1}
.legend label.lg{cursor:pointer} .legend .tytog{margin:0 2px 0 0;width:12px;height:12px}
.lg{display:inline-flex;align-items:center;gap:4px}
.sw{width:12px;height:12px;border-radius:3px;display:inline-block;border:1px solid rgba(0,0,0,.12)}
.sw.need{background:#ffe0b2}.sw.usecase{background:#fff3b0}.sw.requirement{background:#cfe3fb}.sw.design{background:#cdeccd}.sw.test{background:#e9d5f3}.sw.adr{background:#d7ccc8}
.detail{background:#fff;border:1px solid #e3e3e3;border-radius:6px;margin:0 0 14px;padding:10px 12px}
.dempty{color:#aaa;font-style:italic;font-size:13px;padding:8px 2px}
.dhead{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;padding-right:18px}
.did{font-family:ui-monospace,Consolas,monospace;font-weight:700}
.dchip{font-size:10px;padding:2px 7px;border-radius:10px;text-transform:uppercase;letter-spacing:.04em}
.dchip.ty-need{background:#ffe0b2}.dchip.ty-usecase{background:#fff3b0}.dchip.ty-requirement{background:#cfe3fb}.dchip.ty-design{background:#cdeccd}.dchip.ty-test{background:#e9d5f3}.dchip.ty-adr{background:#d7ccc8}
.dchip.st-done{background:#d8f5d8;color:#1c6b1c}.dchip.st-open{background:#eee;color:#666}.dchip.st-suspect{background:#ffe9b0;color:#7a5800}
.dk{font-size:10px;color:#b00;font-weight:700}
.dstmt{font-size:13px;line-height:1.5;margin-bottom:8px}
.dmeta,.dv{font-size:12px;color:#555;margin-bottom:6px}
.dv code{font-family:ui-monospace,Consolas,monospace;font-size:11px;background:#f5f5f5;padding:1px 4px;border-radius:3px;word-break:break-all}
.dlink{font-size:12px;font-weight:600;color:#2a6fb0;text-decoration:none}
.dfall{font-size:12px;color:#b00;margin-top:6px}.dfall[hidden]{display:none}
`

const reportJS = `
(function(){
  var D = window.QUACK_DATA, tabs = D.tabs, host = document.getElementById('graph'),
      bar = document.getElementById('tabbar'), cy = null;
  if(window.cytoscape && window.cytoscapeDagre){ try{ cytoscape.use(cytoscapeDagre); }catch(e){} }
  var TYPEROW={need:0,usecase:1,requirement:2,design:3,test:4,adr:5};
  // one layout everywhere: dagre minimises edge crossings (x), then we snap Y to explicit type
  // rows (need->use-case->requirement->design->test->adr) for the depth split, in the browser.
  function relayout(){
    if(!cy){return;}
    var vis=cy.elements(':visible'), l;
    try{ l=vis.layout({name:'dagre',rankDir:'TB',nodeSep:26,rankSep:80,edgeSep:10,animate:false,fit:false}); }
    catch(e){ l=vis.layout({name:'breadthfirst',directed:true,animate:false,fit:false}); }   // fallback if dagre missing
    l.one('layoutstop',function(){
      var vn=cy.nodes(':visible');
      var xs=vn.map(function(n){return n.position('x');});
      var gmid=(Math.min.apply(null,xs)+Math.max.apply(null,xs))/2;
      var rows={};
      vn.forEach(function(n){var r=TYPEROW[n.data('type')]||0;(rows[r]=rows[r]||[]).push(n);});
      Object.keys(rows).forEach(function(key){
        var arr=rows[key], r=+key;
        arr.sort(function(a,b){return a.position('x')-b.position('x');});   // keep dagre left-to-right order
        arr.forEach(function(n,i){ n.position({x: gmid+(n.position('x')-gmid)*0.55, y: r*185 + (i%3)*42}); });  // compress x + 3-level stagger y
      });
      cy.fit(undefined,24);
    });
    l.run();
  }
  var STYLE = [
    {selector:'node',style:{'label':'data(label)','font-size':9,'text-wrap':'wrap','text-max-width':100,
      'width':118,'height':36,'shape':'round-rectangle','background-color':'#eee','border-width':3,
      'border-color':'#bbb','text-valign':'center','text-halign':'center','color':'#1e1e1e'}},
    {selector:'node[type="need"]',style:{'background-color':'#ffe0b2'}},
    {selector:'node[type="usecase"]',style:{'background-color':'#fff3b0'}},
    {selector:'node[type="requirement"]',style:{'background-color':'#cfe3fb'}},
    {selector:'node[type="design"]',style:{'background-color':'#cdeccd'}},
    {selector:'node[type="test"]',style:{'background-color':'#e9d5f3'}},
    {selector:'node[type="adr"]',style:{'background-color':'#d7ccc8'}},
    {selector:'edge',style:{'width':1.5,'line-color':'#c8ccd0','target-arrow-color':'#c8ccd0',
      'target-arrow-shape':'triangle','curve-style':'bezier','arrow-scale':0.9}},
    {selector:'edge[etype="implements"]',style:{'line-color':'#2f9e44','target-arrow-color':'#2f9e44'}},
    {selector:'edge[etype="verifies"]',style:{'line-color':'#9c36b5','target-arrow-color':'#9c36b5'}},
    {selector:'edge[etype="addresses"]',style:{'line-color':'#8d6e63','target-arrow-color':'#8d6e63','line-style':'dotted'}}
  ];
  function esc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function openSource(href, el){
    if(!href){return;}
    if(location.protocol==='file:'){ window.open(href,'_blank'); return; }
    fetch(href,{method:'GET'}).then(function(r){
      if(r.ok){ window.open(href,'_blank'); } else { el.querySelector('.dfall').hidden=false; }
    }).catch(function(){ window.open(href,'_blank'); });
  }
  function showDetail(d){
    var el = document.getElementById('detail');
    var verify = d.verify ? '<div class=dv><b>verify</b> <code>'+esc(d.verify)+'</code></div>' : '';
    var edges = (d.edges && d.edges.length) ? esc(d.edges.join(', ')) : '—';
    var vdoc = d.verdict_href ? ' <a class=dlink data-vh="'+esc(d.verdict_href)+'" href="#">↗</a>' : '';
    var vlink = d.verdict ? ' · <span class=verdict>'+esc(d.verdict)+'</span>'+vdoc : (d.verdict_href ? ' · <a class=dlink data-vh="'+esc(d.verdict_href)+'" href="#">verdict ↗</a>' : '');
    el.innerHTML =
      '<div class=dhead><span class=did>'+esc(d.id)+'</span>'
      + (d.type ? '<span class="dchip ty-'+d.type+'">'+esc(d.type)+'</span>' : '') + '</div>'
      + '<div class=dstmt>'+esc(d.stmt)+'</div>'
      + '<div class=dmeta><b>traces</b> '+edges+'</div>'
      + verify
      + '<a class=dlink data-h="src" href="#">details ↗</a>' + vlink
      + '<div class=dfall hidden>original source not present on this machine. details unavailable.</div>';
    el.querySelector('[data-h=src]').onclick = function(ev){ ev.preventDefault(); openSource(d.href, el); };
    var vl=el.querySelector('[data-vh]'); if(vl){ vl.onclick=function(ev){ ev.preventDefault(); openSource(vl.getAttribute('data-vh'), el); }; }
  }
  function showIterDetail(m){
    var el=document.getElementById('detail');
    var tr = m.type ? '<div class=dmeta><b>type</b> '+esc(m.type)+' · <b>rigor</b> '+esc(m.rigor)+'</div>'
                    : '<div class=dmeta>type · rigor: '+(m.status==='planned'?'tbd':'not recorded')+'</div>';
    var mot = m.motivation ? '<div class=dstmt>'+esc(m.motivation)+'</div>' : '<div class=dmeta>no motivation captured</div>';
    el.innerHTML =
      '<div class=dhead><span class=did>'+esc(m.name)+'</span>'
      + (m.current?'<span class=dk>current</span>':'') + '</div>'
      + mot + tr;
  }
  function showMetric(c){
    var el=document.getElementById('detail');
    el.innerHTML=
      '<div class=dhead><span class=did>'+esc(c.getAttribute('data-mlabel'))+'</span>'
      +'<span class="dchip">'+esc(c.getAttribute('data-mval'))+'</span></div>'
      +'<div class=dmeta><b>formula.</b> '+esc(c.getAttribute('data-mform'))+'</div>';
  }
  function showBracket(key){
    var el=document.getElementById('detail'), start=/::start$/.test(key);
    el.innerHTML=
      '<div class=dhead><span class=did>'+(start?'START':'END')+'</span></div>'
      +'<div class=dstmt>'+(start
        ?'Plan the iteration. Run retro, triage, then compose the milestone checklist.'
        :'Ship the deliverable once every gate is green.')+'</div>';
  }
  function showProjectDetail(pj){
    var el=document.getElementById('detail');
    el.innerHTML =
      '<div class=dhead><span class=did>'+esc(pj.name)+'</span></div>'
      + (pj.desc ? '<div class=dstmt>'+esc(pj.desc)+'</div>' : '<div class=dmeta>no description</div>');
  }
  function renderEmpty(){ document.getElementById('detail').innerHTML='<div class=dempty>click an element to show detail</div>'; }
  function showFilterHelp(){
    document.getElementById('detail').innerHTML=
      '<div class=dhead><span class=did>filter</span></div>'
      +'<div class=dstmt>Filter the trace graph as you type.</div>'
      +'<div class=dmeta><b>Iteration</b> — <code>0001</code> (only that one), <code>&lt;=0002</code>, <code>&gt;=0001</code>, <code>&lt;</code>, <code>&gt;</code></div>'
      +'<div class=dmeta><b>Text</b> — any word matches id + statement; or <code>/regex/</code> (RegExp)</div>'
      +'<div class=dmeta><b>Combine</b> — <code>AND</code> / <code>OR</code> · e.g. <code>&gt;=0002 AND auth</code></div>';
  }
  function iterNum(s){var m=(s||'').match(/i0*(\d+)/);return m?parseInt(m[1],10):0;}
  function ftTerm(d,t){
    if(!t)return true;
    var m=t.match(/^(<=|>=|<|>)?\s*(\d{3,4})$/);
    if(m){var op=m[1]||'==',w=parseInt(m[2],10),h=iterNum(d.iter);
      if(op=='==')return h==w;if(op=='<=')return h<=w;if(op=='>=')return h>=w;if(op=='<')return h<w;return h>w;}
    var hay=((d.id||'')+' '+(d.stmt||'')).toLowerCase();
    if(t.length>1&&t.charAt(0)=='/'&&t.charAt(t.length-1)=='/'){try{return new RegExp(t.slice(1,-1),'i').test(hay);}catch(e){return false;}}
    return hay.indexOf(t.toLowerCase())>=0;
  }
  function ftMatch(d,q){
    if(!q)return true;
    var ors=q.split(/\s+OR\s+/i);
    for(var i=0;i<ors.length;i++){var ands=ors[i].split(/\s+AND\s+/i),all=true;
      for(var j=0;j<ands.length;j++){if(!ftTerm(d,ands[j].trim())){all=false;break;}}
      if(all)return true;}
    return false;
  }
  function applyFilter(){
    if(!cy){return;}
    var q=(document.getElementById('trace-filter').value||'').trim();
    var typeOn={}; var bs=document.querySelectorAll('.tytog');
    for(var i=0;i<bs.length;i++){typeOn[bs[i].getAttribute('data-type')]=bs[i].checked;}
    cy.batch(function(){cy.nodes().forEach(function(n){
      var d=D.checks[n.id()]||{};
      var on=(typeOn[n.data('type')]!==false) && ftMatch({id:n.id(),stmt:d.stmt,iter:n.data('iter')}, q);
      n.style('display', on?'element':'none');
    });});
    relayout();
  }
  function show(i){
    if(cy){cy.destroy();}
    cy = cytoscape({container:host, elements:tabs[i].elements, style:STYLE,
      layout:{name:'preset'}, wheelSensitivity:0.2});
    cy.on('tap','node',function(e){showDetail(D.checks[e.target.id()]);});
    cy.on('tap',function(e){if(e.target===cy){renderEmpty();}});
    applyFilter();
    for(var j=0;j<bar.children.length;j++){bar.children[j].className=(j===i)?'tab active':'tab';}
  }
  tabs.forEach(function(t,i){
    var b=document.createElement('button'); b.className='tab';
    b.textContent=t.label+' ('+t.count+')'; b.onclick=function(){show(i);}; bar.appendChild(b);
  });
  var tboxes=document.querySelectorAll('.tytog'); for(var ti=0;ti<tboxes.length;ti++){tboxes[ti].onchange=applyFilter;}
  var fi=document.getElementById('trace-filter');
  if(fi){ fi.addEventListener('input',applyFilter); fi.addEventListener('focus',showFilterHelp); }
  if(tabs.length){show(0);}
  function wireTask(r, prevent){
    r.addEventListener('click', function(ev){ if(prevent){ev.preventDefault();}
      var c=D.checks[r.getAttribute('data-nid')]; if(c){showDetail(c);} });
  }
  var leaves=document.querySelectorAll('a.task[data-nid]');
  for(var k=0;k<leaves.length;k++){ wireTask(leaves[k], true); }
  var par=document.querySelectorAll('details.ms > summary[data-nid]');
  for(var p2=0;p2<par.length;p2++){ wireTask(par[p2], false); }
  var tpar=document.querySelectorAll('details.task.par > summary[data-nid]');
  for(var p3=0;p3<tpar.length;p3++){ wireTask(tpar[p3], false); }
  var brs=document.querySelectorAll('[data-bracket]');
  for(var b2=0;b2<brs.length;b2++){ (function(bd){ bd.addEventListener('click', function(){
    showBracket(bd.getAttribute('data-bracket')); }); })(brs[b2]); }
  var mcards=document.querySelectorAll('.card[data-mlabel]');
  for(var mc=0;mc<mcards.length;mc++){ (function(c){ c.addEventListener('click', function(){ showMetric(c); }); })(mcards[mc]); }
  var its = document.querySelectorAll('details.iter > summary[data-iter]');
  for(var m2=0;m2<its.length;m2++){
    (function(su){ su.addEventListener('click', function(){ var mm=D.itermeta[su.getAttribute('data-iter')]; if(mm){showIterDetail(mm);} }); })(its[m2]);
  }
  var pt=document.getElementById('ptitle');
  if(pt){ pt.style.cursor='pointer'; pt.onclick=function(){ if(D.project){showProjectDetail(D.project);} }; }
})();
`
