"""quack report - deterministic, self-contained HTML snapshot of the gate ledger.

Pure derivation over spec/**/*.md + .quack/attest.json: no judgment, no network, no
model. The same ledger renders byte-identical HTML (timestamp from git HEAD, not the
wall clock). The aesthetic shell is this file; only ledger-derived data fills it.
"""
import os, json, html, hashlib, subprocess, re
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
    # decisions/, trace/ (the founding needs+use-cases) and any other spec/ root = the baseline
    return "i0000_baseline"


def _iteration_of_node(n, nodes, _seen=None):
    "Which iteration owns a check. Code-design nodes live in product/ (path starts '..'); they belong"
    " to the iteration of the requirement they implement, not a phantom '..' group."
    rel = os.path.relpath(n["path"], engine.SPEC).replace("\\", "/")
    if not rel.startswith(".."):
        return _iteration_of(n["path"])
    _seen = _seen or set()
    for q in n.get("implements", []) + n.get("refines", []):
        if q in nodes and q not in _seen:
            return _iteration_of_node(nodes[q], nodes, _seen | {n["id"]})
    return "i0000_baseline"


def _milestone_of(n):
    "Milestone for a task. Read the frontmatter 'milestone:' field. Fall back to a leading 'M<n>' in the body."
    p = n.get("path", "")
    if not p.endswith(".md") or not os.path.exists(p):
        return None
    parts = open(p, encoding="utf-8").read().split("---")
    fm = parts[1] if len(parts) >= 3 else ""
    m = re.search(r"(?mi)^\s*milestone:\s*M?(\d+)", fm)
    if m:
        return int(m.group(1))
    body = "---".join(parts[2:]) if len(parts) >= 3 else parts[-1]
    for line in body.splitlines():
        mm = re.match(r"\s*M(\d+)\b", line)
        if mm:
            return int(mm.group(1))
    return None


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


TRACE_TYPES = {"need", "usecase", "requirement", "design", "test", "adr"}


def _rigor_of(it, cfg):
    "The rigor policy for an iteration. The current iteration uses the config. Others use their own"
    " iteration.md. An iteration with no declared rigor (the baseline) has no policy, so returns None."
    if it == cfg["version"]:
        return cfg["rigor"]
    return _read_iter_meta(it).get("rigor")


def _policy_milestones(rigor):
    "Parse a rigor checklist template into {num: {title, gate, method, checks[]}} — the policy content."
    out = {}
    if not rigor:
        return out
    p = os.path.join(engine.ROOT, "product/quackitect/method/rigor", rigor, "checklist.md")
    if not os.path.exists(p):
        return out
    cur = None
    for line in open(p, encoding="utf-8"):
        m = re.match(r"\s*-\s*\*\*M(\d+)\s*[—-]\s*(.+?)\*\*(.*)", line)
        if m:
            gate = re.search(r"gate:\s*([^*·]+)", m.group(3))
            cur = {"num": int(m.group(1)), "title": m.group(2).strip(),
                   "gate": gate.group(1).strip() if gate else "", "method": "", "checks": []}
            out[cur["num"]] = cur
            continue
        if cur is None:
            continue
        mm = re.match(r"\s*-\s*method:\s*(.+)", line)
        if mm:
            cur["method"] = mm.group(1).strip(); continue
        cm = re.match(r"\s*-\s*\[ \]\s*(.+)", line)
        if cm:
            txt = cm.group(1).strip()
            killer = "killer" in txt.lower()
            executed = "executed" in txt.lower()
            txt = re.sub(r"\s*\*\([^)]*\)\*", "", txt).strip()
            cur["checks"].append({"text": txt, "killer": killer, "executed": executed}); continue
        if cur["method"] and re.match(r"\s{3,}\S", line) and "- [" not in line:  # wrapped method line
            cur["method"] += " " + line.strip()
    return out


def _task_forest(task_ids, nodes):
    "Parent->children forest among tasks via the first in-set depends_on parent (a leaf has no parent)."
    cset = set(task_ids)
    children = {t: [] for t in task_ids}
    roots = []
    for t in sorted(task_ids):
        ps = [d for d in nodes[t]["depends_on"] if d in cset and d != t]
        if ps:
            children[ps[0]].append(t)
        else:
            roots.append(t)
    return roots, children


# design: report-model  implements: report-requirements
# A pure deterministic ReportModel derived from spec + attest (merkle root, status, iterations, coverage);
# rendered into a frozen shell with no model or network call at report time -> byte-identical HTML.
def build_model():
    nodes = engine.load_all()
    cfg = engine.config()
    memo = {}
    smap = engine._status_map(nodes)
    kind, nxt = engine.next_check(nodes)
    iters = {}
    for nid, n in nodes.items():
        iters.setdefault(_iteration_of_node(n, nodes), []).append(nid)
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
# enddesign


# ---- rendering (the shell; deterministic given the model) ----

def _mark(state):
    "Task mark: green check (done), yellow question (suspect — input changed, needs re-bless), red cross (open/fail)."
    cls, glyph = {"DONE": ("done", "✓"), "SUSPECT": ("sus", "?")}.get(state, ("fail", "✗"))
    return '<span class="mk %s">%s</span>' % (cls, glyph)


def _href(node_path, out_dir):
    return os.path.relpath(node_path, out_dir).replace("\\", "/")


def _metric_cards(model):
    nodes, smap = model["nodes"], model["smap"]
    gates = [nid for nid in nodes if smap[nid] != "CONTENT"]          # trace = content; gates carry state
    total = len(gates)
    content = len(nodes) - total
    done = sum(1 for nid in gates if smap[nid] == "DONE")
    suspect = sum(1 for nid in gates if smap[nid] == "SUSPECT")
    killers = [nid for nid in gates if nodes[nid]["killer"]]
    kdone = sum(1 for nid in killers if smap[nid] == "DONE")
    derived = [nid for nid in gates if nodes[nid].get("verify", "").startswith("coverage:")]
    ddone = sum(1 for nid in derived if smap[nid] == "DONE")
    mx = engine.metrics(nodes)
    holes = engine.coverage(nodes, model["cfg"]["version"])  # cumulative through the active version (no grandfathering)
    cards = [
        ("Gate state", "%d / %d" % (done, total), "DONE ÷ total GATES (trace excluded)"),
        ("Suspect frontier", str(suspect), "gates currently in SUSPECT"),
        ("Killer coverage", "%d / %d" % (kdone, len(killers)), "killer DONE ÷ killer total"),
        ("Derived gates", "%d / %d" % (ddone, len(derived)), "coverage-derived subtasks passing ÷ total"),
        ("Trace content", str(content), "work-product nodes (need/uc/req/design/test/adr)"),
        ("V-model coverage", ("clean" if not holes else "%d holes" % len(holes)),
         "n>=1 over the full trace through this iteration (cumulative, no grandfathering)"),
        ("Reversal rate", "%d / %d" % mx["reversal"], "re-attestations after a change ÷ blesses"),
        ("Rework rate", "%d / %d" % mx["rework"], "checks re-blessed ÷ blessed checks"),
        ("Self-cert ratio", "%d / %d" % mx["selfcert"], "agent-blessed killers ÷ killer checks"),
    ]
    out = []
    for label, val, formula in cards:   # compact: value + label only; the formula shows on click
        out.append('<div class="card" data-mlabel="%s" data-mval="%s" data-mform="%s">'
                   '<div class="cval">%s</div><div class="clabel">%s</div></div>'
                   % (html.escape(label), html.escape(val), html.escape(formula),
                      html.escape(val), html.escape(label)))
    return "\n".join(out)


# design: iteration-tasklist  implements: req-split
# The per-iteration task graph: START..END, milestone GATES top-to-bottom, each gate's subtasks beneath.
# Trace nodes are content and never appear here; only gates do (smap != CONTENT). A subtask tagged 'auto'
# is derived from the trace (an executed coverage rule); the rest are human-judged. The milestone header
# IS the gate node — its mark is the gate's review state, clicking it opens the gate's detail.
def _render_subs(ids, nodes, smap):
    "Render a milestone's subtasks as a flat list; tag the derived (coverage-computed) ones 'auto'."
    out = []
    for nid in sorted(ids):
        auto = (' <span class="auto" title="derived from the trace">auto</span>'
                if nodes[nid].get("verify", "").startswith("coverage:") else "")
        out.append('<a class="task leaf" href="#" data-nid="%s">%s<span class="rid">%s</span>%s</a>'
                   % (html.escape(nid), _mark(smap[nid]), html.escape(nid), auto))
    return "".join(out)


def _iterations_panel(model, out_dir):
    nodes, smap, iters, cfg = model["nodes"], model["smap"], model["iters"], model["cfg"]
    current = cfg["version"]
    out = []
    for it in sorted(iters):
        gates = [nid for nid in iters[it] if smap[nid] != "CONTENT"]   # gates only; the trace is content
        done = sum(1 for nid in gates if smap[nid] == "DONE")
        op = " open" if it == current else ""
        cur = " current" if it == current else ""
        frac = "planned" if not gates else ("%d/%d" % (done, len(gates)))
        out.append('<details class="iter%s"%s><summary data-iter="%s">%s <span class="frac">%s</span></summary>'
                   % (cur, op, html.escape(it), html.escape(it), frac))
        lanes, loose = {}, []
        for nid in gates:
            ms = _milestone_of(nodes[nid])
            (lanes.setdefault(ms, []).append(nid) if ms is not None else loose.append(nid))
        out.append('<div class="tg">')
        out.append('<div class="bracket start" data-bracket="%s::start"><span class="bdot"></span>START</div>'
                   % html.escape(it))
        for ms in sorted(set(_policy_milestones(_rigor_of(it, cfg))) | set(lanes)):
            members = lanes.get(ms, [])
            gate = next((m for m in members if m == "m%d-gate" % ms), None)
            subs = [m for m in members if m != gate]
            d = sum(1 for x in subs if smap[x] == "DONE")
            attr = (' data-nid="%s"' % html.escape(gate)) if gate else ''
            body = (_render_subs(subs, nodes, smap) if subs else '<div class="mshint">no subtasks</div>')
            out.append('<details class="ms%s"><summary%s>%s<span class="mstag">M%d</span>'
                       '<span class="mscount">%d/%d</span></summary><div class="kids">%s</div></details>'
                       % (" open" if subs else "", attr, _mark(smap[gate]) if gate else _mark("OPEN"),
                          ms, d, len(subs), body))
        if loose:   # gates with no milestone (e.g. lean: no skeleton) sit between the brackets
            out.append('<div class="kids nolane">%s</div>' % _render_subs(loose, nodes, smap))
        out.append('<div class="bracket end%s" data-bracket="%s::end"><span class="bdot"></span>END</div>'
                   % (" ok" if (gates and done == len(gates)) else "", html.escape(it)))
        out.append('</div></details>')
    return "\n".join(out)
# enddesign


# design: typed-trace  implements: req-split
# The fixed 5-layer V-model: TYPE_RANK orders need->uc->requirement->design->test (+adr); trace edges are
# refines/implements/verifies/addresses only (no same-type, no depends_on). Tasks are excluded by prefix.
TYPE_RANK = {"need": 0, "usecase": 1, "requirement": 2, "design": 3, "test": 4, "adr": 5}

def _edges_of(n):
    "(parent_id, kind) for each trace edge into n."
    e = []
    for q in n.get("refines", []):    e.append((q, "refines"))
    for q in n.get("implements", []): e.append((q, "implements"))
    for q in n.get("verifies", []):   e.append((q, "verifies"))
    for q in n.get("addresses", []):  e.append((q, "addresses"))
    for q in n["depends_on"]:          e.append((q, "depends_on"))
    return e


def _trace_edges(n):
    "the V-model edges only (no depends_on): refines / implements / verifies / addresses."
    e = []
    for q in n.get("refines", []):    e.append((q, "refines"))
    for q in n.get("implements", []): e.append((q, "implements"))
    for q in n.get("verifies", []):   e.append((q, "verifies"))
    for q in n.get("addresses", []):  e.append((q, "addresses"))
    return e
# enddesign

def _graph_data(model, out_dir):
    nodes, smap = model["nodes"], model["smap"]
    nodes = {nid: n for nid, n in nodes.items() if n.get("type") in ("need", "usecase", "requirement", "design", "test", "adr")}
    children = {nid: [] for nid in nodes}
    for nid, n in nodes.items():
        for q, _k in _trace_edges(n):          # subtree follows the V-model only, not depends_on
            if q in nodes:
                children[q].append(nid)
    def subtree(root):
        seen, stack = set(), [root]
        while stack:
            x = stack.pop()
            if x in seen:
                continue
            seen.add(x)
            stack.extend(children.get(x, []))
        return seen
    def build_tab(label, ids):
        ids = sorted(ids); cset = set(ids)
        parent_of = {}
        for nid in ids:
            ps = [q for q, _k in _trace_edges(nodes[nid]) if q in cset]
            parent_of[nid] = ps[0] if ps else None        # cluster key = the node's trace parent
        by_rank = {}
        for nid in ids:
            by_rank.setdefault(TYPE_RANK.get(nodes[nid].get("type", ""), 9), []).append(nid)
        SPX, SUBROW, BANDGAP, MAXC = 165, 95, 55, 6
        posx, posy = {}, {}
        ycur = 0
        for r in sorted(by_rank):
            clusters = {}                                  # group this layer by parent (cluster)
            for nid in by_rank[r]:
                clusters.setdefault(parent_of[nid], []).append(nid)
            cx = lambda par: posx[par] if par in posx else 0.0
            ordered = [(par, sorted(clusters[par])) for par in sorted(clusters, key=lambda par: (cx(par), str(par)))]
            subrows, cur, curw = [], [], 0                 # pack WHOLE clusters into <=6-wide sub-rows
            for par, members in ordered:
                if cur and curw + len(members) > MAXC:
                    subrows.append(cur); cur, curw = [], 0
                cur.append((par, members)); curw += len(members)
            if cur:
                subrows.append(cur)
            for si, sub in enumerate(subrows):             # each cluster centered under its parent; push to avoid overlap
                cursor = None
                for par, members in sub:
                    k = len(members); cw = (k - 1) * SPX
                    left = cx(par) - cw / 2.0
                    if cursor is not None and left < cursor + SPX:
                        left = cursor + SPX
                    for i, nid in enumerate(members):
                        posx[nid] = left + i * SPX; posy[nid] = ycur + si * SUBROW
                    cursor = left + cw
            ycur += len(subrows) * SUBROW + BANDGAP
        if posx:                                           # recenter the whole graph horizontally
            xs = list(posx.values()); mid = (min(xs) + max(xs)) / 2.0
            for nid in posx:
                posx[nid] -= mid
        els = []
        for nid in ids:
            n = nodes[nid]
            els.append({"data": {"id": nid, "label": nid,
                "type": n.get("type", ""), "state": smap[nid], "killer": "1" if n["killer"] else "0"},
                "position": {"x": posx[nid], "y": posy[nid]}})
        for nid in ids:
            for q, kind in _trace_edges(nodes[nid]):
                if q in cset:
                    els.append({"data": {"id": q + "__" + nid, "source": q, "target": nid, "etype": kind}})
        return {"label": label, "count": len(ids), "elements": els}
    needs = sorted(nid for nid, n in nodes.items() if n.get("type") == "need")
    tabs, rooted = [], set()
    for need in needs:
        st = subtree(need); rooted |= st
        tabs.append(build_tab(need, st))
    unrooted = [nid for nid in nodes if nid not in rooted]
    if unrooted:
        tabs.append(build_tab("(unrooted)", unrooted))
    return {"tabs": tabs}


def _checks_map(model, out_dir):
    nodes, smap = model["nodes"], model["smap"]
    out = {}
    for nid, n in nodes.items():
        edges = [kind + " " + q for q, kind in _edges_of(n) if q in nodes]
        href = _href(n["path"], out_dir) + (("#L%d" % n["line"]) if n.get("line") else "")
        out[nid] = {"id": nid, "type": n.get("type", ""), "state": smap[nid],
                    "killer": "1" if n["killer"] else "0", "stmt": n["statement"],
                    "edges": edges, "verify": n.get("verify", ""), "href": href}
    return out


def render(model, out_dir):
    cfg = model["cfg"]
    nodes, smap = model["nodes"], model["smap"]
    gates = [nid for nid in nodes if smap[nid] != "CONTENT"]          # trace = content, not a gate
    total = len(gates)
    done = sum(1 for nid in gates if smap[nid] == "DONE")
    suspect = sum(1 for nid in gates if smap[nid] == "SUSPECT")
    opn = total - done - suspect
    killers = [nid for nid in gates if nodes[nid]["killer"]]
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
    H.append("<section class='col right'><h2>Metrics</h2><div class=cards>" + _metric_cards(model) + "</div>"
             "<h2 class=push>Details</h2>"
             "<div id=detail class=detail><div class=dempty>click an element to show detail</div></div></section>")
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
  "<label class=lg><input type=checkbox class=tytog data-type=need checked><i class='sw need'></i>need</label>"
  "<label class=lg><input type=checkbox class=tytog data-type=usecase checked><i class='sw usecase'></i>use-case</label>"
  "<label class=lg><input type=checkbox class=tytog data-type=requirement checked><i class='sw requirement'></i>requirement</label>"
  "<label class=lg><input type=checkbox class=tytog data-type=design><i class='sw design'></i>design</label>"
  "<label class=lg><input type=checkbox class=tytog data-type=test checked><i class='sw test'></i>test</label>"
  "<label class=lg><input type=checkbox class=tytog data-type=adr><i class='sw adr'></i>ADR</label>"
  "</div>")

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
.mk{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;font-size:12px;font-weight:700;line-height:1;flex:none}
.mk.done{color:#2e8b2e}.mk.sus{color:#e0a400}.mk.fail{color:#d23b3b}
.mscount.empty{color:#cbcbcb}
.mshint{font-size:11px;color:#b5b5b5;font-style:italic;padding:2px 6px 3px}
.auto{font-size:9px;color:#5a7a5a;background:#eef4ec;border:1px solid #d8e6d4;border-radius:8px;padding:0 5px;margin-left:auto;text-transform:uppercase;letter-spacing:.04em}
.dchecks{margin:4px 0 6px;padding-left:18px;font-size:12px;color:#555}.dchecks li{margin:2px 0}
#tabbar{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px}
.tab{cursor:pointer;font-size:12px;padding:3px 10px;border:1px solid #ddd;border-radius:14px;background:#fff;font-family:ui-monospace,monospace}
.tab.active{background:#1e1e1e;color:#fff;border-color:#1e1e1e}
#graph{height:calc(100vh - 168px);background:#fff;border:1px solid #eee;border-radius:6px}
.ns{color:#999;padding:20px}
.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.card{border:1px solid #eee;border-radius:6px;padding:6px 8px;background:#fff;min-width:0;cursor:pointer}
.card:hover{background:#fafafa;border-color:#ddd}
.cval{font-size:16px;font-weight:700;line-height:1.1} .clabel{font-size:10px;color:#666;margin-top:1px}
.next{font-family:ui-monospace,Consolas,monospace;background:#fff;border:1px solid #eee;border-radius:6px;padding:8px 10px}
.legend{display:flex;flex-wrap:wrap;gap:4px 12px;padding:6px 2px 6px;font-size:11px;color:#666}
.legend label.lg{cursor:pointer} .legend .tytog{margin:0 2px 0 0;width:12px;height:12px}
.legtog{display:flex;gap:16px;font-size:11px;color:#555;padding:0 2px 8px}
.legtog label{display:inline-flex;align-items:center;gap:4px;cursor:pointer}
.lg{display:inline-flex;align-items:center;gap:4px}
.sw{width:12px;height:12px;border-radius:3px;display:inline-block;border:1px solid rgba(0,0,0,.12)}
.sw.need{background:#ffe0b2}.sw.usecase{background:#fff3b0}.sw.requirement{background:#cfe3fb}.sw.design{background:#cdeccd}.sw.test{background:#e9d5f3}.sw.adr{background:#d7ccc8}
.rg{width:12px;height:12px;border-radius:50%;display:inline-block;background:#fff}
.rg.done{border:2px solid #3a9d3a}.rg.open{border:2px dashed #c2c2c2}.rg.sus{border:3px solid #e6a700}
.detail{background:#fff;border:1px solid #e3e3e3;border-radius:6px;margin:0 0 14px;padding:10px 12px}
.dempty{color:#aaa;font-style:italic;font-size:13px;padding:8px 2px}
.dclose{position:absolute;top:4px;right:8px;border:none;background:none;font-size:18px;cursor:pointer;color:#999;line-height:1}
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
"""

INIT_JS = """
(function(){
  var D = window.QUACK_DATA, tabs = D.tabs, host = document.getElementById('graph'),
      bar = document.getElementById('tabbar'), cy = null;
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
    {selector:'edge[etype="addresses"]',style:{'line-color':'#8d6e63','target-arrow-color':'#8d6e63','line-style':'dotted'}},
    {selector:'edge[etype="depends_on"]',style:{'line-style':'dashed','line-color':'#dddde2','target-arrow-color':'#dddde2'}}
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
    var edges = (d.edges && d.edges.length) ? esc(d.edges.join(', ')) : '—';
    el.innerHTML =
      '<div class=dhead><span class=did>'+esc(d.id)+'</span>'
      + (d.type ? '<span class="dchip ty-'+d.type+'">'+esc(d.type)+'</span>' : '') + '</div>'
      + '<div class=dstmt>'+esc(d.stmt)+'</div>'
      + '<div class=dmeta><b>traces</b> '+edges+'</div>'
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
  function applyToggles(){
    if(!cy){return;}
    var bs=document.querySelectorAll('.tytog');
    for(var i=0;i<bs.length;i++){
      cy.nodes('[type="'+bs[i].getAttribute('data-type')+'"]').style('display', bs[i].checked?'element':'none');
    }
    cy.fit(undefined,20);
  }
  function show(i){
    if(cy){cy.destroy();}
    cy = cytoscape({container:host, elements:tabs[i].elements, style:STYLE,
      layout:{name:'preset', padding:24, fit:true},
      wheelSensitivity:0.2});
    cy.fit(undefined,20);
    cy.on('tap','node',function(e){showDetail(D.checks[e.target.id()]);});
    cy.on('tap',function(e){if(e.target===cy){renderEmpty();}});
    applyToggles();
    for(var j=0;j<bar.children.length;j++){bar.children[j].className=(j===i)?'tab active':'tab';}
  }
  tabs.forEach(function(t,i){
    var b=document.createElement('button'); b.className='tab';
    b.textContent=t.label+' ('+t.count+')'; b.onclick=function(){show(i);}; bar.appendChild(b);
  });
  var tboxes=document.querySelectorAll('.tytog'); for(var ti=0;ti<tboxes.length;ti++){tboxes[ti].onchange=applyToggles;}
  if(tabs.length){show(0);}
  function wireTask(r, prevent){
    r.addEventListener('click', function(ev){ if(prevent){ev.preventDefault();}
      var c=D.checks[r.getAttribute('data-nid')]; if(c){showDetail(c);} });
  }
  var leaves=document.querySelectorAll('a.task[data-nid]');
  for(var k=0;k<leaves.length;k++){ wireTask(leaves[k], true); }            // subtask leaf: block nav, show detail
  var par=document.querySelectorAll('details.ms > summary[data-nid]');
  for(var p2=0;p2<par.length;p2++){ wireTask(par[p2], false); }             // milestone gate header: toggle + detail
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
"""
