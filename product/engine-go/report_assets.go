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
.frac.ok{color:#2e8b2e;font-weight:600}
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
.mscount.empty{color:#cbcbcb}
.mshint{font-size:11px;color:#b5b5b5;font-style:italic;padding:2px 6px 3px}
.auto{font-size:9px;color:#5a7a5a;background:#eef4ec;border:1px solid #d8e6d4;border-radius:8px;padding:0 5px;margin-left:auto;text-transform:uppercase;letter-spacing:.04em}
.legendrow{display:flex;align-items:center;gap:10px;margin-bottom:4px}
#trace-filter{width:180px;flex:none;padding:3px 7px;border:1px solid #ccd;border-radius:5px;font:11px ui-monospace,Consolas,monospace}
#filter-clear{flex:none;margin-left:2px;padding:3px 8px;border:1px solid #ccd;border-radius:5px;background:#fff;cursor:pointer;font-size:11px;color:#666}
#filter-clear:hover{background:#f2f2f2}
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
.detail{background:#fff;border:1px solid #e3e3e3;border-radius:6px;margin:0 0 14px;padding:10px 12px}
.dempty{color:#aaa;font-style:italic;font-size:13px;padding:8px 2px}
.dhead{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;padding-right:18px}
.did{font-family:ui-monospace,Consolas,monospace;font-weight:700}
.dchip{font-size:10px;padding:2px 7px;border-radius:10px;text-transform:uppercase;letter-spacing:.04em}
.dchip.st-done{background:#d8f5d8;color:#1c6b1c}.dchip.st-open{background:#eee;color:#666}.dchip.st-suspect{background:#ffe9b0;color:#7a5800}
.dk{font-size:10px;color:#b00;font-weight:700}
.dstmt{font-size:13px;line-height:1.5;margin-bottom:8px}
.dmeta,.dv{font-size:12px;color:#555;margin-bottom:6px}
.dv code{font-family:ui-monospace,Consolas,monospace;font-size:11px;background:#f5f5f5;padding:1px 4px;border-radius:3px;word-break:break-all}
.dlink{font-size:12px;font-weight:600;color:#2a6fb0;text-decoration:none}
.dfall{font-size:12px;color:#b00;margin-top:6px}.dfall[hidden]{display:none}
.ping{position:absolute;inset:-2px;border:2px solid #555;border-radius:inherit;pointer-events:none;z-index:3;animation:qping .32s ease-out forwards}
@keyframes qping{0%{inset:-2px;opacity:.95}100%{inset:calc(-2px - 3vmax);opacity:0}}
` + qtlSharedCSS

// design: go-timeline-shared-css  implements: req-project-timeline
// ONE stylesheet for the shared timeline component: every surface (report, hand-off,
// book) embeds this constant verbatim and carries no local variant, so the surfaces
// cannot drift apart visually.
const qtlSharedCSS = `.qtl-anchor{display:flex;flex-direction:column;gap:4px}
.qtl-anchor .uarrow{font:inherit;font-size:10px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;padding:1px 0}
.qtl-scroll{overflow-y:auto;max-height:calc(100vh - 160px)}
.qtl .hrow{margin:2px 0;border-top:1px solid #eee}
.qtl .hrow>summary{cursor:pointer;display:flex;gap:8px;align-items:center;padding:7px 6px;border-radius:4px;list-style:none;min-width:0}
.qtl .hrow>summary::-webkit-details-marker{display:none}
.qtl .hrow>summary:hover{background:#f4f4f4}
.qtl .hid{font-family:ui-monospace,Consolas,monospace;font-size:10px;font-weight:700;color:#52628a;background:#eef2f9;border:1px solid #dce4f2;border-radius:10px;padding:1px 8px;flex:none}
.qtl .hstmt{font-size:11px;color:#888;margin-left:7px;flex:1 1 0;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qtl .hrow[open]>summary{flex-wrap:wrap}
.qtl .hrow[open]>summary .hstmt{white-space:normal;overflow:visible;flex:1 1 100%}
.qtl .ttree{font-size:12px;padding:2px 0 8px 11px;margin-left:5px;border-left:1px solid #ececec}
.qtl a.task{display:flex;gap:6px;align-items:center;text-decoration:none;color:#333;padding:2px 4px}
.qtl .ttree .task{padding:3px 0;color:inherit;text-decoration:none}
.qtl .ttree details.task{padding:0}
.qtl .ttree details.task>summary{cursor:pointer;list-style:none;padding:3px 0}
.qtl .ttree details.task>summary::-webkit-details-marker{display:none}
.qtl .ttree .kids{padding-left:14px;border-left:1px solid #eee}
.qtl .ttree .rid{font-family:ui-monospace,Consolas,monospace;font-size:11px}
.qtl .ttree .auto{font-size:10px;color:#999}
.qtl .mk{display:inline-block;width:16px;font-weight:700}
.qtl .mk.done{color:#2f9e44}
.qtl .mk.fail{color:#d6336c}
.qtl .mk.sus{color:#e0a800}
.qtl-project details.iter{margin:.3rem 0;border:1px solid #e3e3e3;border-radius:8px;padding:2px 10px}
.qtl-project details.iter>summary{cursor:pointer;font-weight:600}
.qtl-project .frac{color:#999;font-weight:400;margin-left:8px}
.qtl .task.deciding,.qtl details.deciding>summary{background:#fff3bf;border-radius:4px}
.qtl .tdrill{margin:2px 0 6px 18px;font-size:12px}
.qtl .tdrill .upills{display:flex;flex-wrap:wrap;gap:4px;margin:3px 0}
.qtl .tdrill .upill{font:inherit;font-size:11px;padding:1px 8px;border:1px solid #d5d5d5;border-radius:12px;background:#fff;cursor:pointer}
.qtl .tdrill .upill.on{background:#1e1e1e;color:#fff;border-color:#1e1e1e}
.qtl .tgroup{margin:2px 0}
.qtl .tgroup>summary{cursor:pointer;font-size:12px;color:#444}
.qtl .tel{font:inherit;font-size:11px;font-family:ui-monospace,Consolas,monospace;border:1px solid #dce4f2;border-radius:6px;background:#f6f9ff;cursor:pointer;margin:2px 3px 2px 0;padding:1px 6px}
`

// enddesign

// design: go-report-filter-ux  implements: req-report-filter-gestures.1, req-report-filter-gestures.3, req-report-filter-gestures.2, req-report-filter-gestures.4
// The filter gains four things. A clear control returns to the full graph in one click. A descendants:<id> predicate selects the node plus everything tracing into it, successors over the parent->child edges, the same cone the suspect ripple walks. A double-click gesture applies that predicate for the tapped node. On-focus help documents every form, including these. JS only filters and toggles. Content stays server-baked; the report remains a pure display.
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
    /* the per-type node colors come from the ONE palette source (go-type-colors):
       QUACK_DATA.typecolors is the resolved list — no literal lives here */
    {selector:'edge',style:{'width':1.5,'line-color':'#c8ccd0','target-arrow-color':'#c8ccd0',
      'target-arrow-shape':'triangle','curve-style':'bezier','arrow-scale':0.9}},
    {selector:'edge[etype="implements"]',style:{'line-color':'#2f9e44','target-arrow-color':'#2f9e44'}},
    {selector:'edge[etype="verifies"]',style:{'line-color':'#9c36b5','target-arrow-color':'#9c36b5'}},
    {selector:'edge[etype="addresses"]',style:{'line-color':'#8d6e63','target-arrow-color':'#8d6e63','line-style':'dotted'}},
    // go-render-folds: a boundary edge with a label names the folded member it stands for
    {selector:'edge[label]',style:{'label':'data(label)','font-size':7,'color':'#777',
      'text-rotation':'autorotate','text-background-color':'#fff','text-background-opacity':0.85}},
    // go-trace-collapsible: a typed cluster wears the double border; its join is the
    // parallel edge pair (bezier separates them into the double line)
    {selector:'node[cluster]',style:{'border-style':'double','border-width':6,'shape':'round-rectangle','font-weight':'bold','padding':'6px'}},
    {selector:'edge[etype="cluster"]',style:{'width':1.5,'target-arrow-shape':'none'}}
  ];
  Object.keys(D.typecolors||{}).forEach(function(t){
    STYLE.push({selector:'node[type="'+t+'"]',style:{'background-color':D.typecolors[t]}});
  });
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
    var cause = d.cause ? '<div class=dv><b>why not green</b> '+esc(d.cause)+'</div>' : '';
    var edges = (d.edges && d.edges.length) ? esc(d.edges.join(', ')) : '—';
    var vdoc = d.verdict_href ? ' <a class=dlink data-vh="'+esc(d.verdict_href)+'" href="#">↗</a>' : '';
    var vlink = d.verdict ? ' · <span class=verdict>'+esc(d.verdict)+'</span>'+vdoc : (d.verdict_href ? ' · <a class=dlink data-vh="'+esc(d.verdict_href)+'" href="#">verdict ↗</a>' : '');
    el.innerHTML =
      '<div class=dhead><span class=did>'+esc(d.id)+'</span>'
      + (d.type ? '<span class="dchip ty-'+d.type+'">'+esc(d.type)+'</span>' : '') + '</div>'
      + '<div class=dstmt>'+esc(d.stmt)+'</div>'
      + '<div class=dmeta><b>traces</b> '+edges+'</div>'
      + verify + cause
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
      +'<div class=dmeta><b>Combine</b> — <code>AND</code> / <code>OR</code> · e.g. <code>&gt;=0002 AND auth</code></div>'
      +'<div class=dmeta><b>Descendants</b> — <code>descendants:&lt;id&gt;</code> shows only that node and everything that traces into it (refines / implements / verifies / addresses, transitively). Double-click a node to apply it for that node.</div>'
      +'<div class=dmeta><b>Clear</b> — the &#215; button (or emptying the box) restores the full graph.</div>';
  }
  function iterNum(s){var m=(s||'').match(/i0*(\d+)/);return m?parseInt(m[1],10):0;}
  var dsets={};
  function descSet(id){
    var set={}; if(!cy){return set;}
    var root=cy.getElementById(id); if(!root||root.empty()){return set;}
    set[id]=true;
    root.successors('node').forEach(function(n){set[n.id()]=true;});
    return set;
  }
  function ftTerm(d,t){
    if(!t)return true;
    if(t.toLowerCase().indexOf('descendants:')===0){
      var did=t.slice(12).trim();
      if(!dsets[did]){dsets[did]=descSet(did);}
      return !!dsets[did][d.id];
    }
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
    dsets={};
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
    // the node tap is the ONE behaviour a host overrides (the book transports to the item's
    // table row instead of opening the report's detail panel); unset, the report is unchanged.
    window.__quackGraphRefit=function(){ if(cy){ cy.resize(); relayout(); } };
    cy.on('tap','node',function(e){
      // go-trace-collapsible: a cluster OPENS with its busbar interior - the book's
      // details pane, else the report's detail panel (both are chrome surfaces)
      if(e.target.data('cluster')){var ih=e.target.data('interior')||'';
        if(window.bookDetail){window.bookDetail(e.target.data('label'),ih);}
        else{var dp=document.getElementById('detail');if(dp){dp.innerHTML=ih;dp.hidden=false;}}
        return;}
      if(window.QUACK_NODE_TAP){ window.QUACK_NODE_TAP(e.target.id()); return; } showDetail(D.checks[e.target.id()]);});
    cy.on('dbltap','node',function(e){ // dblclick on a node applies the descendants filter for it
      // book AND report alike: the filter relayout re-fits the view, so the
      // double-click IS the zoom-in on that node's cone (post-ship restore - the
      // reverted book keeps single-click-to-details AND this gesture).
      var f=document.getElementById('trace-filter');
      if(f){f.value='descendants:'+e.target.id(); applyFilter();}
    });
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
  var fc=document.getElementById('filter-clear');
  if(fc){ fc.onclick=function(){ if(fi){fi.value='';} applyFilter(); }; }
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
/* the timeline anchor (req-timeline-anchor): the CURRENT iteration sits three quarters
   down the scroll viewport, earlier iterations stacked above; the arrows nudge the
   stack, the wheel scrolls natively — never pagination. */
(function(){
  var qs=document.getElementById('qtl-scroll');
  if(!qs)return;
  var arrows=document.querySelectorAll('.qtl-anchor .uarrow');
  for(var i=0;i<arrows.length;i++){(function(a){a.addEventListener('click',function(){
    qs.scrollTop+=a.getAttribute('data-uscroll')==='up'?-160:160;});})(arrows[i]);}
  var cur=qs.querySelector('details.iter.current');
  if(cur)qs.scrollTop=Math.max(0,cur.offsetTop-qs.clientHeight*0.75);
})();
/* the drill-down's type pills (req-timeline-drilldown): first draft, one selection */
document.addEventListener('click',function(e){
  var p=e.target.closest?e.target.closest('.tdrill .upill'):null;if(!p)return;
  e.preventDefault();var dr=p.closest('.tdrill'),v=p.getAttribute('data-fv');
  Array.prototype.forEach.call(dr.querySelectorAll('.upill'),function(x){x.classList.toggle('on',x===p);});
  Array.prototype.forEach.call(dr.querySelectorAll('.tgroup'),function(g){
    g.style.display=(v==='*'||g.getAttribute('data-ttype')===v)?'':'none';});});
/* the attention ping (req-details-full-entry): three border echoes announce a pane
   change — the pane never moves; each echo expands outward while fading. Riding onto
   neighboring content is fine; leaving the screen is accepted (owner, 2026-07-19). */
function __panePing(el){if(!el)return;
  if(getComputedStyle(el).position==='static')el.style.position='relative';
  [0,150,300].forEach(function(d){setTimeout(function(){
    var r=document.createElement('div');r.className='ping';el.appendChild(r);
    setTimeout(function(){if(r.parentNode)r.parentNode.removeChild(r);},400);},d);});}
(function(){
  var det=document.getElementById('detail');if(!det||!window.MutationObserver)return;
  new MutationObserver(function(ms){
    for(var i=0;i<ms.length;i++){var ad=ms[i].addedNodes;
      for(var j=0;j<ad.length;j++){var n=ad[j];
        if(!(n.classList&&n.classList.contains('ping'))){__panePing(det);return;}}}
  }).observe(det,{childList:true});
})();
`

// enddesign
