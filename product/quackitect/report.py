"""quack report - deterministic, self-contained HTML snapshot of the gate ledger.

Pure derivation over spec/**/*.md + .quack/attest.json: no judgment, no network, no
model. The same ledger renders byte-identical HTML (timestamp from git HEAD, not the
wall clock). The aesthetic shell is this file; only ledger-derived data fills it.
"""
import os, json, html, hashlib, subprocess
from quackitect import engine

ASSETS = os.path.join(os.path.dirname(__file__), "assets")


def _git_stamp():
    """Deterministic timestamp: the HEAD commit's ISO date (stable per commit). '' if no git."""
    try:
        r = subprocess.run(["git", "log", "-1", "--format=%cI"],
                           cwd=engine.ROOT, capture_output=True, text=True, timeout=10)
        if r.returncode == 0:
            return r.stdout.strip()
    except Exception:
        pass
    return ""


def _merkle_root(nodes, memo):
    pairs = sorted((nid, engine.full_hash(nid, nodes, memo)) for nid in nodes)
    return hashlib.sha256(";".join(n + ":" + h for n, h in pairs).encode()).hexdigest()


def _iteration_of(path):
    rel = os.path.relpath(path, engine.SPEC).replace("\\", "/").split("/")
    if rel[0] == "iterations" and len(rel) > 1:
        return rel[1]
    if rel[0] == "decisions":
        return "i0000_baseline"
    return rel[0]


def _components(nodes):
    """Weakly-connected components over depends_on (undirected). Each = one graph tab/root."""
    adj = {nid: set() for nid in nodes}
    for nid, n in nodes.items():
        for d in n["depends_on"]:
            if d in nodes:
                adj[nid].add(d); adj[d].add(nid)
    seen, comps = set(), []
    for nid in sorted(nodes):
        if nid in seen:
            continue
        stack, comp = [nid], []
        while stack:
            x = stack.pop()
            if x in seen:
                continue
            seen.add(x); comp.append(x)
            stack.extend(sorted(adj[x] - seen))
        comps.append(sorted(comp))
    return comps


def _trace_coverage(nodes):
    """Fraction of checks whose correctness is eventually exercised by an executed check:
    the check itself, or a transitive DEPENDENT, is class=executed."""
    dependents = {nid: set() for nid in nodes}
    for nid, n in nodes.items():
        for d in n["depends_on"]:
            if d in nodes:
                dependents[d].add(nid)
    memo = {}

    def reaches(nid, stack=()):
        if nid in memo:
            return memo[nid]
        if nodes[nid]["class"] == "executed":
            memo[nid] = True; return True
        if nid in stack:
            return False
        r = any(reaches(x, stack + (nid,)) for x in dependents[nid])
        memo[nid] = r; return r

    return sum(1 for nid in nodes if reaches(nid)), len(nodes)


def _project_desc():
    p = os.path.join(engine.ROOT, "pyproject.toml")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            t = line.strip()
            if t.startswith("description") and '"' in t:
                return t.split('"', 2)[1]
    return ""


def _read_iter_meta(name):
    meta = {"motivation": "", "status": "", "type": "", "rigor": ""}
    if name == "i0000_baseline":
        return meta
    path = os.path.join(engine.SPEC, "iterations", name, "iteration.md")
    if not os.path.exists(path):
        return meta
    txt = open(path, encoding="utf-8").read()
    parts = txt.split("---")
    if len(parts) >= 3:
        for line in parts[1].splitlines():
            if ":" in line:
                k, v = line.split(":", 1); k = k.strip(); v = v.strip()
                if k in ("status", "type", "rigor"):
                    meta[k] = v
        meta["motivation"] = "---".join(parts[2:]).strip()
    return meta


def build_model():
    nodes = engine.load_all()
    cfg = engine.config()
    memo = {}
    smap = engine._status_map(nodes)
    kind, nxt = engine.next_check(nodes)
    iters = {}
    for nid, n in nodes.items():
        iters.setdefault(_iteration_of(n["path"]), []).append(nid)
    itdir = os.path.join(engine.SPEC, "iterations")
    if os.path.isdir(itdir):
        for name in sorted(os.listdir(itdir)):
            if os.path.isdir(os.path.join(itdir, name)):
                iters.setdefault(name, [])
    return {
        "project": os.path.basename(engine.ROOT),
        "cfg": cfg,
        "stamp": _git_stamp(),
        "root": _merkle_root(nodes, memo),
        "nodes": nodes,
        "smap": smap,
        "comps": _components(nodes),
        "iters": {k: sorted(v) for k, v in iters.items()},
        "cov": _trace_coverage(nodes),
        "next": (kind, nxt["id"] if nxt else None),
    }


# ---- rendering (the shell; deterministic given the model) ----

def _badge(state):
    return '<span class="b ' + state.lower() + '">' + state[0] + '</span>'


def _href(node_path, out_dir):
    return os.path.relpath(node_path, out_dir).replace("\\", "/")


def _metric_cards(model):
    nodes, smap = model["nodes"], model["smap"]
    total = len(nodes)
    done = sum(1 for s in smap.values() if s == "DONE")
    suspect = sum(1 for s in smap.values() if s == "SUSPECT")
    killers = [nid for nid, n in nodes.items() if n["killer"]]
    kdone = sum(1 for nid in killers if smap[nid] == "DONE")
    execu = [nid for nid, n in nodes.items() if n["class"] == "executed"]
    cov, ctot = model["cov"]
    cards = [
        ("Gate state", "%d / %d" % (done, total), "DONE ÷ total checks"),
        ("Suspect frontier", str(suspect), "checks currently in SUSPECT"),
        ("Killer coverage", "%d / %d" % (kdone, len(killers)), "killer DONE ÷ killer total"),
        ("Executed ratio", "%d / %d" % (len(execu), total), "class=executed ÷ total"),
        ("Trace coverage", "%d / %d" % (cov, ctot), "checks reaching an executed verify ÷ total"),
        ("Reversal rate", "—", "needs an attest event log (not yet kept)"),
        ("Rework rate", "—", "needs an attest event log (not yet kept)"),
        ("Self-cert ratio", "—", "needs an actor field in attest (not yet kept)"),
    ]
    out = []
    for label, val, formula in cards:
        dim = " dim" if val == "—" else ""
        out.append('<div class="card%s"><div class="cval">%s</div>'
                   '<div class="clabel">%s</div><div class="cform">%s</div></div>'
                   % (dim, html.escape(val), html.escape(label), html.escape(formula)))
    return "\n".join(out)


def _iterations_panel(model, out_dir):
    nodes, smap, iters = model["nodes"], model["smap"], model["iters"]
    current = model["cfg"]["version"]
    out = []
    for it in sorted(iters):
        ids = iters[it]
        done = sum(1 for nid in ids if smap[nid] == "DONE")
        op = " open" if it == current else ""
        cur = " current" if it == current else ""
        frac = "planned" if not ids else ("%d/%d" % (done, len(ids)))
        out.append('<details class="iter%s"%s><summary data-iter="%s">%s <span class="frac">%s</span></summary>'
                   % (cur, op, html.escape(it), html.escape(it), frac))
        for nid in ids:
            out.append('<a class="row" href="#" data-nid="%s">%s<span class="rid">%s</span></a>'
                       % (html.escape(nid), _badge(smap[nid]), html.escape(nid)))
        out.append("</details>")
    return "\n".join(out)


def _graph_data(model, out_dir):
    nodes, smap = model["nodes"], model["smap"]
    tabs = []
    for comp in model["comps"]:
        label = comp[0]  # the lowest-id node names the root/tab
        els = []
        cset = set(comp)
        for nid in comp:
            n = nodes[nid]
            els.append({"data": {
                "id": nid, "label": ("★ " if n["killer"] else "") + nid, "state": smap[nid], "cls": n["class"],
                "killer": "1" if n["killer"] else "0", "stmt": n["statement"],
                "deps": [d for d in n["depends_on"] if d in nodes],
                "verify": n.get("verify", ""),
                "href": _href(n["path"], out_dir)}})
        for nid in comp:
            for d in nodes[nid]["depends_on"]:
                if d in cset:
                    els.append({"data": {"id": d + "__" + nid, "source": d, "target": nid}})
        tabs.append({"label": label, "count": len(comp), "elements": els})
    return {"tabs": tabs}


def _checks_map(model, out_dir):
    nodes, smap = model["nodes"], model["smap"]
    out = {}
    for nid, n in nodes.items():
        out[nid] = {"id": nid, "cls": n["class"], "state": smap[nid],
                    "killer": "1" if n["killer"] else "0", "stmt": n["statement"],
                    "deps": [d for d in n["depends_on"] if d in nodes],
                    "verify": n.get("verify", ""), "href": _href(n["path"], out_dir)}
    return out


def render(model, out_dir):
    cfg = model["cfg"]
    nodes, smap = model["nodes"], model["smap"]
    total = len(nodes)
    done = sum(1 for s in smap.values() if s == "DONE")
    suspect = sum(1 for s in smap.values() if s == "SUSPECT")
    opn = total - done - suspect
    killers = [nid for nid, n in nodes.items() if n["killer"]]
    kdone = sum(1 for nid in killers if smap[nid] == "DONE")
    green = (suspect == 0 and opn == 0)
    pill = '<span class="pill %s">%s</span>' % (
        "green" if green else "amber",
        "ALL GATES GREEN" if green else "IN PROGRESS")
    nkind, nid = model["next"]
    nxt = ("done — all gates green" if nkind == "done"
           else ("blocked" if nkind == "blocked" else html.escape(nid or "")))

    cyto = open(os.path.join(ASSETS, "cytoscape.min.js"), encoding="utf-8").read()
    _data = _graph_data(model, out_dir)
    _data["checks"] = _checks_map(model, out_dir)
    cur = cfg["version"]
    _data["itermeta"] = {}
    for it, ids in model["iters"].items():
        d = sum(1 for x in ids if smap[x] == "DONE")
        m = _read_iter_meta(it)
        typ = m["type"] or (cfg["type"] if it == cur else None)
        rig = m["rigor"] or (cfg["rigor"] if it == cur else None)
        status = m["status"] or ("active" if it == cur else ("done" if ids and d == len(ids) else ""))
        _data["itermeta"][it] = {"name": it, "done": d, "total": len(ids),
                                 "type": typ, "rigor": rig,
                                 "motivation": m["motivation"], "status": status,
                                 "current": it == cur}
    _data["project"] = {"name": model["project"], "desc": _project_desc()}
    gdata = json.dumps(_data, sort_keys=True)

    H = []
    H.append("<!doctype html><html lang=en><head><meta charset=utf-8>")
    H.append("<meta name=viewport content='width=device-width,initial-scale=1'>")
    H.append("<title>" + html.escape(model["project"]) + " — report</title>")
    H.append("<style>" + CSS + "</style></head><body>")
    # header
    H.append("<header><div class=h1 id=ptitle title='click for project info'>%s</div>"
             "<div class=hash title='Integrity fingerprint: a single hash folding every check'"
             "'s state. Two reports with the same value reflect the identical ledger; it changes"
             "' if any check changes. The date says WHEN, this says WHICH state.'>⛓ %s</div>"
             "<div class=stamp>%s</div></header>"
             % (html.escape(model["project"]),
                model["root"][:12], html.escape(model["stamp"] or "(no git stamp)")))
    # grid
    H.append("<main class=grid>")
    H.append("<section class=col><h2>Iterations</h2>" + _iterations_panel(model, out_dir) + "</section>")
    H.append("<section class=col mid><h2>Trace graph</h2><div id=tabbar class=tabbar></div>"
             + LEGEND +
             "<div id=graph></div>"
             "<noscript><p class=ns>Enable scripts for the interactive graph.</p></noscript></section>")
    H.append("<section class=col><h2>Details</h2>"
             "<div id=detail class=detail><div class=dempty>click an element to show detail</div></div>"
             "<h2>Metrics</h2><div class=cards>" + _metric_cards(model) + "</div>"
             "<h2>What's next</h2><div class=next>" + nxt + "</div></section>")
    H.append("</main>")
    # scripts: data, vendored cytoscape, init
    H.append("<script>window.QUACK_DATA=" + gdata + ";</script>")
    H.append("<script>" + cyto + "</script>")
    H.append("<script>" + INIT_JS + "</script>")
    H.append("</body></html>")
    return "".join(H)


def write(out_path):
    model = build_model()
    out_dir = os.path.dirname(os.path.abspath(out_path))
    os.makedirs(out_dir, exist_ok=True)
    htmltext = render(model, out_dir)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(htmltext)
    return out_path, model


LEGEND = ("<div class=legend>"
  "<span class=lg><i class='sw j'></i>judgment</span>"
  "<span class=lg><i class='sw r'></i>review</span>"
  "<span class=lg><i class='sw e'></i>executed · runs</span>"
  "<span class=lg><i class='rg done'></i>done</span>"
  "<span class=lg><i class='rg open'></i>open</span>"
  "<span class=lg><i class='rg sus'></i>suspect</span>"
  "<span class=lg>★ killer gate</span>"
  "<span class=lg>→ leads to</span></div>")

CSS = """
*{box-sizing:border-box} body{margin:0;font:14px/1.45 system-ui,Segoe UI,sans-serif;color:#1e1e1e;background:#fafafa}
header{display:flex;gap:18px;align-items:baseline;padding:14px 20px;background:#fff;border-bottom:1px solid #e3e3e3;flex-wrap:wrap}
.h1{font-size:20px;font-weight:600} .ver{color:#777;font-weight:400;font-size:15px}
.meta{color:#777} .hash{font-family:ui-monospace,Consolas,monospace;color:#999;font-size:12px;margin-left:auto}
.stamp{font-family:ui-monospace,Consolas,monospace;color:#bbb;font-size:12px}
.verdict{display:flex;align-items:center;gap:14px;padding:10px 20px;background:#fff;border-bottom:1px solid #eee}
.counts{color:#777;font-size:13px}
.pill{font-weight:600;font-size:12px;padding:3px 10px;border-radius:20px}
.pill.green{background:#d8f5d8;color:#1c6b1c} .pill.amber{background:#ffe9b0;color:#7a5800}
.grid{display:grid;grid-template-columns:300px 1fr 340px;gap:0;height:calc(100vh - 112px)}
.col{overflow:auto;padding:12px 16px;border-right:1px solid #ececec}
.col.mid{display:flex;flex-direction:column;padding:12px 12px 0}
h2{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#999;margin:6px 0 10px}
.iter{margin-bottom:6px;border:1px solid #eee;border-radius:6px;background:#fff}
.iter>summary{cursor:pointer;padding:7px 10px;font-weight:600;list-style:none}
.iter.current>summary{background:#eef6ff} .frac{float:right;color:#999;font-weight:400}
.row{display:flex;align-items:center;gap:8px;padding:4px 12px;text-decoration:none;color:#333;border-top:1px solid #f3f3f3}
.row:hover{background:#f6f6f6} .rid{font-family:ui-monospace,Consolas,monospace;font-size:12px}
.b{display:inline-block;width:16px;height:16px;line-height:16px;text-align:center;border-radius:4px;font-size:11px;font-weight:700;color:#fff}
.b.done{background:#4caf50} .b.suspect{background:#e6a700} .b.open{background:#bbb}
#tabbar{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px}
.tab{cursor:pointer;font-size:12px;padding:3px 10px;border:1px solid #ddd;border-radius:14px;background:#fff;font-family:ui-monospace,monospace}
.tab.active{background:#1e1e1e;color:#fff;border-color:#1e1e1e}
#graph{flex:1;min-height:420px;background:#fff;border:1px solid #eee;border-radius:6px}
.ns{color:#999;padding:20px}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.card{border:1px solid #eee;border-radius:6px;padding:8px 10px;background:#fff}
.card.dim{opacity:.55} .cval{font-size:19px;font-weight:700} .clabel{font-size:12px;color:#555}
.cform{font-family:ui-monospace,Consolas,monospace;font-size:10px;color:#aaa;margin-top:3px}
.next{font-family:ui-monospace,Consolas,monospace;background:#fff;border:1px solid #eee;border-radius:6px;padding:8px 10px}
.legend{display:flex;flex-wrap:wrap;gap:6px 12px;padding:6px 2px 10px;font-size:11px;color:#666}
.lg{display:inline-flex;align-items:center;gap:4px}
.sw{width:12px;height:12px;border-radius:3px;display:inline-block;border:1px solid rgba(0,0,0,.12)}
.sw.j{background:#e9d5f3}.sw.r{background:#d4e4fb}.sw.e{background:#cdeccd}
.rg{width:12px;height:12px;border-radius:50%;display:inline-block;background:#fff}
.rg.done{border:2px solid #3a9d3a}.rg.open{border:2px dashed #c2c2c2}.rg.sus{border:3px solid #e6a700}
.detail{background:#fff;border:1px solid #e3e3e3;border-radius:6px;margin:0 0 14px;padding:10px 12px}
.dempty{color:#aaa;font-style:italic;font-size:13px;padding:8px 2px}
.dclose{position:absolute;top:4px;right:8px;border:none;background:none;font-size:18px;cursor:pointer;color:#999;line-height:1}
.dhead{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;padding-right:18px}
.did{font-family:ui-monospace,Consolas,monospace;font-weight:700}
.dchip{font-size:10px;padding:2px 7px;border-radius:10px;text-transform:uppercase;letter-spacing:.04em}
.dchip.judgment{background:#e9d5f3}.dchip.review{background:#d4e4fb}.dchip.executed{background:#cdeccd}
.dchip.st-done{background:#d8f5d8;color:#1c6b1c}.dchip.st-open{background:#eee;color:#666}.dchip.st-suspect{background:#ffe9b0;color:#7a5800}
.dk{font-size:10px;color:#b00;font-weight:700}
.dstmt{font-size:13px;line-height:1.5;margin-bottom:8px}
.dmeta,.dv{font-size:12px;color:#555;margin-bottom:6px}
.dv code{font-family:ui-monospace,Consolas,monospace;font-size:11px;background:#f5f5f5;padding:1px 4px;border-radius:3px;word-break:break-all}
.dlink{font-size:12px;font-weight:600;color:#2a6fb0;text-decoration:none}
.dfall{font-size:12px;color:#b00;margin-top:6px}.dfall[hidden]{display:none}
"""

INIT_JS = """
(function(){
  var D = window.QUACK_DATA, tabs = D.tabs, host = document.getElementById('graph'),
      bar = document.getElementById('tabbar'), cy = null;
  var STYLE = [
    {selector:'node',style:{'label':'data(label)','font-size':9,'text-wrap':'wrap','text-max-width':100,
      'width':118,'height':36,'shape':'round-rectangle','background-color':'#eee','border-width':3,
      'border-color':'#bbb','text-valign':'center','text-halign':'center','color':'#1e1e1e'}},
    {selector:'node[cls="judgment"]',style:{'background-color':'#e9d5f3'}},
    {selector:'node[cls="review"]',style:{'background-color':'#d4e4fb'}},
    {selector:'node[cls="executed"]',style:{'background-color':'#cdeccd'}},
    {selector:'node[state="DONE"]',style:{'border-color':'#3a9d3a','border-style':'solid'}},
    {selector:'node[state="OPEN"]',style:{'border-color':'#c2c2c2','border-style':'dashed'}},
    {selector:'node[state="SUSPECT"]',style:{'border-color':'#e6a700','border-style':'solid','border-width':5}},
    {selector:'edge',style:{'width':1.4,'line-color':'#cbcbcb','target-arrow-color':'#cbcbcb',
      'target-arrow-shape':'triangle','curve-style':'bezier','arrow-scale':0.8}}
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
    var killer = (d.killer==='1') ? '<span class=dk>★ killer gate</span>' : '';
    var verify = d.verify ? '<div class=dv><b>verify</b> <code>'+esc(d.verify)+'</code></div>' : '';
    var deps = (d.deps && d.deps.length) ? esc(d.deps.join(', ')) : '—';
    el.innerHTML =
      '<div class=dhead><span class=did>'+esc(d.id)+'</span>'
      + '<span class="dchip '+d.cls+'">'+esc(d.cls)+'</span>'
      + '<span class="dchip st-'+d.state.toLowerCase()+'">'+esc(d.state)+'</span>'+killer+'</div>'
      + '<div class=dstmt>'+esc(d.stmt)+'</div>'
      + '<div class=dmeta><b>depends on</b> '+deps+'</div>'
      + verify
      + '<a class=dlink href="#">details ↗</a>'
      + '<div class=dfall hidden>original source not present on this machine. details unavailable.</div>';
    el.querySelector('.dlink').onclick = function(ev){ ev.preventDefault(); openSource(d.href, el); };
  }
  function showIterDetail(m){
    var el=document.getElementById('detail');
    var tr = m.type ? '<div class=dmeta><b>type</b> '+esc(m.type)+' · <b>rigor</b> '+esc(m.rigor)+'</div>'
                    : '<div class=dmeta>type · rigor: '+(m.status==='planned'?'tbd':'not recorded')+'</div>';
    var mot = m.motivation ? '<div class=dstmt>'+esc(m.motivation)+'</div>' : '<div class=dmeta>no motivation captured</div>';
    var prog = (m.total>0) ? (m.done+'/'+m.total+' done') : 'planned';
    var st = m.status ? '<span class="dchip st-'+(m.status==='done'?'done':(m.status==='suspect'?'suspect':'open'))+'">'+esc(m.status)+'</span>' : '';
    el.innerHTML =
      '<div class=dhead><span class=did>'+esc(m.name)+'</span>'
      +'<span class="dchip st-'+((m.total>0&&m.done===m.total)?'done':'open')+'">'+prog+'</span>'
      + st + (m.current?'<span class=dk>current</span>':'') + '</div>'
      + mot + tr;
  }
  function showProjectDetail(pj){
    var el=document.getElementById('detail');
    el.innerHTML =
      '<div class=dhead><span class=did>'+esc(pj.name)+'</span></div>'
      + (pj.desc ? '<div class=dstmt>'+esc(pj.desc)+'</div>' : '<div class=dmeta>no description</div>');
  }
  function renderEmpty(){ document.getElementById('detail').innerHTML='<div class=dempty>click an element to show detail</div>'; }
  function show(i){
    if(cy){cy.destroy();}
    cy = cytoscape({container:host, elements:tabs[i].elements, style:STYLE,
      layout:{name:'breadthfirst', directed:true, padding:12, spacingFactor:1.05, grid:true},
      wheelSensitivity:0.2});
    cy.fit(undefined,20);
    cy.on('tap','node',function(e){showDetail(D.checks[e.target.id()]);});
    cy.on('tap',function(e){if(e.target===cy){renderEmpty();}});
    for(var j=0;j<bar.children.length;j++){bar.children[j].className=(j===i)?'tab active':'tab';}
  }
  tabs.forEach(function(t,i){
    var b=document.createElement('button'); b.className='tab';
    b.textContent=t.label+' ('+t.count+')'; b.onclick=function(){show(i);}; bar.appendChild(b);
  });
  if(tabs.length){show(0);}
  var rows = document.querySelectorAll('a.row[data-nid]');
  for(var k=0;k<rows.length;k++){
    (function(r){ r.onclick=function(ev){ev.preventDefault(); var c=D.checks[r.getAttribute('data-nid')]; if(c){showDetail(c);} };})(rows[k]);
  }
  var its = document.querySelectorAll('details.iter > summary[data-iter]');
  for(var m2=0;m2<its.length;m2++){
    (function(su){ su.addEventListener('click', function(){ var mm=D.itermeta[su.getAttribute('data-iter')]; if(mm){showIterDetail(mm);} }); })(its[m2]);
  }
  var pt=document.getElementById('ptitle');
  if(pt){ pt.style.cursor='pointer'; pt.onclick=function(){ if(D.project){showProjectDetail(D.project);} }; }
})();
"""
