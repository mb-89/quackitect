"""Quackitect engine. Source of truth: spec/**/*.md + .quack/attest.json."""
import hashlib, json, os, subprocess, datetime, re

def find_root(start=None):
    d = os.path.abspath(start or os.getcwd())
    while True:
        if os.path.isdir(os.path.join(d, ".quack")) or os.path.isfile(os.path.join(d, "pyproject.toml")):
            return d
        p = os.path.dirname(d)
        if p == d:
            return os.getcwd()
        d = p

ROOT   = find_root()
SPEC   = os.path.join(ROOT, "spec")
QUACK  = os.path.join(ROOT, ".quack")
ATTEST = os.path.join(QUACK, "attest.json")
EVID   = os.path.join(QUACK, "evidence")
NOTES  = os.path.join(QUACK, "notes")

def norm(s):
    return " ".join(s.split()).lower()

def parse(path):
    txt = open(path, encoding="utf-8").read()
    parts = txt.split("---")
    fm = parts[1] if len(parts) >= 3 else ""
    d = {"id": os.path.splitext(os.path.basename(path))[0], "statement": "", "depends_on": [],
         "class": "judgment", "verify": "", "killer": False, "type": "",
         "refines": [], "implements": [], "verifies": [], "addresses": [], "path": path}
    def _ids(v): return [x.strip() for x in v.strip("[]").split(",") if x.strip()]
    for line in fm.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1); k = k.strip(); v = v.strip()
        if k == "statement": d["statement"] = v
        elif k == "depends_on": d["depends_on"] = _ids(v)
        elif k == "class": d["class"] = v
        elif k == "verify": d["verify"] = v
        elif k == "killer": d["killer"] = (v.lower() == "true")
        elif k == "type": d["type"] = v
        elif k == "refines": d["refines"] = _ids(v)
        elif k == "implements": d["implements"] = _ids(v)
        elif k == "verifies": d["verifies"] = _ids(v)
        elif k == "addresses": d["addresses"] = _ids(v)
        elif k == "id" and v: d["id"] = v
    return d


def _parents(n):
    "all trace edges into a node: depends_on + refines + implements + verifies."
    return n["depends_on"] + n.get("refines", []) + n.get("implements", []) + n.get("verifies", []) + n.get("addresses", [])

def load_all():
    nodes = {}
    for dp, _, files in os.walk(SPEC):
        for f in sorted(files):
            if f.endswith(".md"):
                d = parse(os.path.join(dp, f))
                if d["statement"] and not d["id"].startswith(("TASK-", "MARK-")):
                    nodes[d["id"]] = d
    nodes.update(scan_code_designs())
    return nodes

# design: input-hashing  implements: suspect-bless
# Inputs are hashed at the level of normalized load-bearing fields (the statement), never whole prose files.
def stmt_hash(node):
    return hashlib.sha256(norm(node["statement"]).encode()).hexdigest()[:12]
# enddesign

CODE_DIRS = [os.path.join(ROOT, "product")]

def scan_code_designs():
    "Design nodes that live in code. Python: '# design: <id>  implements: <req,..>' ... '# enddesign'."
    " AI control files (prompts/guides .md) count as code too: '<!-- design: <id> implements: <req> -->' ... '<!-- enddesign -->'."
    out = {}
    for base in CODE_DIRS:
        for dp, _, files in os.walk(base):
            for f in sorted(files):
                if not (f.endswith(".py") or f.endswith(".md")):
                    continue
                fp = os.path.join(dp, f)
                lines = open(fp, encoding="utf-8").read().splitlines()
                i = 0
                while i < len(lines):
                    m = re.search(r"design:\s*(\S+)\s+implements:\s*([^>]+)", lines[i])
                    if not m or "enddesign" in lines[i] or "<" in m.group(1):  # skip the doc EXAMPLE (<id>)
                        i += 1; continue
                    did = m.group(1)
                    impl = m.group(2).replace("-->", "").rstrip("- ")
                    impl, _, inline = impl.partition("::")       # optional inline statement: 'implements: r :: text'
                    reqs = [x.strip() for x in impl.split(",") if x.strip()]
                    j = i + 1; desc = [inline.strip()] if inline.strip() else []
                    while j < len(lines) and lines[j].lstrip().startswith("#") and "enddesign" not in lines[j]:
                        desc.append(lines[j].lstrip("# ").rstrip()); j += 1
                    end = j
                    while end < len(lines) and "enddesign" not in lines[end]:
                        end += 1
                    out[did] = {"id": did, "statement": " ".join(desc) or did, "type": "design",
                                "implements": reqs, "depends_on": [], "refines": [], "verifies": [],
                                "addresses": [], "killer": False, "class": "review", "verify": "",
                                "path": fp, "line": i + 1, "region_body": "\n".join(lines[i + 1:end])}
                    i = end + 1
    return out


# design: merkle-dag  implements: suspect-bless
# A check's full_hash folds its upstream checks' hashes, so any change ripples to every downstream check (a Merkle DAG; no consensus).
def full_hash(nid, nodes, memo, stack=()):
    if nid in memo:
        return memo[nid]
    if nid in stack:
        raise SystemExit("cycle through " + nid)
    n = nodes[nid]
    deps = sorted(d for d in _parents(n) if d in nodes)
    dh = ",".join(full_hash(d, nodes, memo, stack + (nid,)) for d in deps)
    seed = norm(n["statement"]) + "|" + n.get("verify", "") + "|" + dh + "|" + hashlib.sha256(n.get("region_body", "").encode()).hexdigest()[:12]
    h = hashlib.sha256(seed.encode()).hexdigest()[:12]
    memo[nid] = h
    return h
# enddesign

# design: evidence-model  implements: state-model
# Executed checks store re-runnable cached results (disposable); judgment/review checks store signed, dated attestations (append-only).
def attest_events():
    "append-only event log; migrates the old dict-format attest.json on first read (lossless)."
    if not os.path.exists(ATTEST):
        return []
    data = json.load(open(ATTEST, encoding="utf-8"))
    if isinstance(data, dict):
        ev = [{"check": nid, "action": "bless", "actor": "migrated", "ts": 0,
               "hash": a["hash"], "statement_hash": a["statement_hash"], "deps": a["deps"], "prev_hash": None}
              for nid, a in sorted(data.items())]
        _save_events(ev)
        return ev
    return data

def _save_events(events):
    os.makedirs(QUACK, exist_ok=True)
    json.dump(events, open(ATTEST, "w", encoding="utf-8"), indent=2)

def attest_load():
    "current attestation per check = the latest bless event (suspect/bless derive from this, unchanged)."
    state = {}
    for e in attest_events():
        if e["action"] == "bless":
            state[e["check"]] = {"hash": e["hash"], "statement_hash": e["statement_hash"], "deps": e["deps"]}
    return state

def run_executed(node, h):
    cdir = os.path.join(EVID, node["id"]); cf = os.path.join(cdir, h + ".json")
    if os.path.exists(cf):
        return json.load(open(cf))["result"]
    os.makedirs(cdir, exist_ok=True)
    try:
        r = subprocess.run(node["verify"], shell=True, cwd=ROOT, capture_output=True, text=True, timeout=120)
        result = "pass" if r.returncode == 0 else "fail"
        json.dump({"result": result, "exit": r.returncode, "cmd": node["verify"],
                   "ran": datetime.datetime.now().isoformat()}, open(cf, "w"), indent=2)
    except Exception as e:
        result = "fail"; json.dump({"result": "fail", "error": str(e)}, open(cf, "w"))
    return result
# enddesign

def status(nodes):
    m = _status_map(nodes)
    return [(nid, m[nid], nodes[nid]["class"]) for nid in nodes]

# design: fill-adjudicate-impl  implements: fill-adjudicate
# A bless records adjudicated_by (actor) AND filled_by separately. Only gates are blessable; a gate's
# adjudicator is the human, and killer gates are never self-certified. Content (the trace) is never blessed.
def bless(nodes, target):
    memo = {}; events = attest_events(); cur = attest_load()
    actor = os.environ.get("QUACK_ACTOR", "human")          # adjudicated_by
    filler = os.environ.get("QUACK_FILLER", "agent")        # filled_by (recorded separately)
    ids = list(nodes) if target == "--all" else [target]
    for nid in ids:
        if nodes[nid]["class"] == "executed" or not is_gate(nodes[nid]):
            continue
        prev = cur.get(nid)
        events.append({"check": nid, "action": "bless", "actor": actor, "filled_by": filler,
                       "ts": datetime.datetime.now().isoformat(),
                       "hash": full_hash(nid, nodes, memo), "statement_hash": stmt_hash(nodes[nid]),
                       "deps": {d: full_hash(d, nodes, memo) for d in _parents(nodes[nid]) if d in nodes},
                       "prev_hash": prev["hash"] if prev else None})
    _save_events(events)
# enddesign

def why(nodes, nid):
    memo = {}; a = attest_load()
    if not is_gate(nodes[nid]):
        return ["content (trace work-product) - not a gate; it ripples change but is never blessed"]
    if nodes[nid]["class"] == "executed":
        v = nodes[nid].get("verify", "")
        if v.startswith("coverage:"):
            return ["derived gate - computed live from the trace (" + v + ")"]
        return ["executed check - its run decides; see .quack/evidence/" + nid]
    if nid not in a:
        return ["OPEN - never blessed"]
    reasons = []
    if stmt_hash(nodes[nid]) != a[nid]["statement_hash"]:
        reasons.append("own statement changed")
    for d in _parents(nodes[nid]):
        if d in nodes and a[nid]["deps"].get(d) != full_hash(d, nodes, memo):
            reasons.append("upstream '" + d + "' changed")
    if not reasons and full_hash(nid, nodes, memo) != a[nid]["hash"]:
        reasons.append("implementation region changed" if nodes[nid].get("region_body")
                       else "definition changed - re-bless")
    return reasons or ["fresh - nothing changed"]

# design: notes-capture  implements: notes-pipeline
# One-file-per-note capture under .quack/notes/inbox, recording provenance (origin, timestamp, status).
def add_note(text, origin=None):
    os.makedirs(os.path.join(NOTES, "inbox"), exist_ok=True)
    ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower())[:32].strip("-")
    nid = "NOTE-" + ts + "-" + slug
    p = os.path.join(NOTES, "inbox", nid + ".md")
    open(p, "w", encoding="utf-8").write(
        "---\nid: " + nid + "\ncreated: " + datetime.datetime.now().isoformat() +
        "\norigin: " + (origin or "commandline") + "\nstatus: inbox\n---\n\n" + text + "\n")
    return p
# enddesign


# enddesign

# ---- iteration / engage support ----

def config():
    c = {"type": "default", "rigor": "systematic", "version": "v0"}
    p = os.path.join(QUACK, "config.toml")
    if os.path.exists(p):
        for line in open(p):
            for k in ("type", "rigor", "version"):
                m = re.match(r'\s*' + k + r'\s*=\s*"([^"]+)"', line)
                if m:
                    c[k] = m.group(1)
    return c

def _is_text(p):
    return p.lower().endswith((".md", ".txt", ".csv", ".json", ".yaml", ".yml", ".toml"))

def gather(version):
    """Collect ALL rigor + type source (any format) into one bundle the agent composes the
    iteration checklist from. Text is inlined; spreadsheets / PDFs / images and URLs are
    flagged for the agent to open or follow. The whole folder content matters."""
    cfg = config()
    chains = []
    ladder = ["vibe", "lean", "systematic"]
    if cfg["rigor"] in ladder:
        for r in ladder[:ladder.index(cfg["rigor"]) + 1]:
            chains.append(os.path.join(ROOT, "product/quackitect/method/rigor", r))
    cur = os.path.join(ROOT, "product/quackitect/project_types")
    for part in cfg["type"].split("/"):
        cur = os.path.join(cur, part)
        chains.append(cur)
    out = ["# Source bundle for iteration " + version,
           "_type=" + cfg["type"] + " | rigor=" + cfg["rigor"] + " - compose the checklist from ALL of this._", ""]
    flagged, follow = [], []
    for base in chains:
        if not os.path.isdir(base):
            continue
        for dp, _, files in os.walk(base):
            for f in sorted(files):
                p = os.path.join(dp, f)
                rel = os.path.relpath(p, ROOT)
                if _is_text(p):
                    txt = open(p, encoding="utf-8", errors="replace").read()
                    out.append("\n## " + rel + "\n\n" + txt)
                    for m in re.findall(r"\]\(([^)]+)\)", txt):
                        if m.startswith("http"):
                            follow.append((rel, m))
                        else:
                            lp = os.path.normpath(os.path.join(dp, m))
                            if os.path.isfile(lp) and _is_text(lp):
                                out.append("\n### linked: " + os.path.relpath(lp, ROOT) + "\n\n" +
                                           open(lp, encoding="utf-8", errors="replace").read())
                            elif os.path.exists(lp):
                                flagged.append(os.path.relpath(lp, ROOT))
                else:
                    flagged.append(rel)
    if flagged:
        out.append("\n## AGENT: open these (non-text - spreadsheets, PDFs, images, etc.)")
        out += ["- " + x for x in flagged]
    if follow:
        out.append("\n## AGENT: follow these links")
        out += ["- " + u + "  (from " + src + ")" for src, u in follow]
    dest = os.path.join(QUACK, "gather", version)
    os.makedirs(dest, exist_ok=True)
    path = os.path.join(dest, "source.md")
    open(path, "w", encoding="utf-8").write("\n".join(out))
    return path, sum(1 for c in chains if os.path.isdir(c))

def _status_map(nodes):
    a, memo = attest_load(), {}
    raw = {nid: gate_state(nid, nodes, a, memo) for nid in nodes}
    eff = {}
    def resolve(nid, stack=()):       # a gate is only truly DONE if its dependency gates are DONE too
        if nid in eff:
            return eff[nid]
        s = raw[nid]
        if s == "DONE" and nid not in stack:
            for d in _parents(nodes[nid]):
                if d in nodes and raw[d] != "CONTENT" and resolve(d, stack + (nid,)) != "DONE":
                    s = "SUSPECT"; break
        eff[nid] = s
        return s
    return {nid: resolve(nid) for nid in nodes}

# design: version-mgmt  implements: req-version-mgmt
# Version-aware walking. pick_version chooses the iteration to walk: a named one, else the latest not-done,
# else the earliest planned. next_check scopes the next ready gate to that version. A single active version
# behaves as before. Cross-version gate-deps still must be DONE; content deps never block.
def versions():
    "Every iteration id, sorted (e.g. i0001_reporting, i0002_disentangle_trace)."
    d = os.path.join(SPEC, "iterations")
    return sorted(n for n in os.listdir(d) if os.path.isdir(os.path.join(d, n))) if os.path.isdir(d) else []

def pick_version(nodes, prefer=None):
    "The version to walk: a named one, else the latest not-done, else the earliest planned (no gates yet)."
    st = _status_map(nodes); vers = versions()
    if prefer in vers:
        return prefer
    gof = lambda v: [nid for nid in nodes if st[nid] != "CONTENT" and _iter_of(nodes[nid]["path"]) == v]
    notdone = [v for v in vers if gof(v) and any(st[nid] != "DONE" for nid in gof(v))]
    if notdone:
        return notdone[-1]
    planned = [v for v in vers if not gof(v)]
    return planned[0] if planned else (vers[-1] if vers else None)

def next_check(nodes, version=None):
    st = _status_map(nodes)
    gates = {nid for nid in nodes if st[nid] != "CONTENT"}
    v = version or pick_version(nodes)
    inver = {nid for nid in gates if _iter_of(nodes[nid]["path"]) == v}
    ready = [nid for nid in inver
             if st[nid] in ("OPEN", "SUSPECT")
             and all(st[d] == "DONE" for d in _parents(nodes[nid]) if d in gates)]  # content deps never block
    if not ready:
        return ("done", None) if all(st[nid] == "DONE" for nid in inver) else ("blocked", None)
    return ("check", nodes[sorted(ready)[0]])
# enddesign


# design: metrics  implements: req-metrics
# reversal / rework / self-cert computed from the append-only attest event log (never stored).
def metrics(nodes):
    "health metrics from the append-only attest log: rework, reversal, self-cert. GATES only; the trace is content."
    gates = {nid for nid in nodes if is_gate(nodes[nid])}
    blesses = [e for e in attest_events() if e["action"] == "bless" and e["check"] in gates]
    counts, latest = {}, {}
    for e in blesses:
        counts[e["check"]] = counts.get(e["check"], 0) + 1
        latest[e["check"]] = e
    reworked = sum(1 for n in counts.values() if n > 1)
    reversals = sum(1 for e in blesses if e.get("prev_hash") and e["prev_hash"] != e["hash"])
    killers = [nid for nid in gates if nodes[nid]["killer"]]
    selfcert = sum(1 for nid in killers if latest.get(nid, {}).get("actor") == "agent")
    return {"rework": (reworked, len(counts)),
            "reversal": (reversals, len(blesses)),
            "selfcert": (selfcert, len(killers))}
# enddesign


# design: coverage-lint  implements: req-coverage
# Milestones are DERIVED reachability gates: n>=1 over each V-model edge, recomputed from the trace, never stored.
def coverage(nodes, scope=None):
    "n>=1 coverage over the typed trace; returns holes (missing children + orphans). Empty = clean."
    " scope = iteration id; the trace must be complete CUMULATIVELY through it (this version AND all earlier)."
    " No grandfathering: a later version cannot be clean while an earlier one has holes. Children matched globally."
    ins = lambda n: scope is None or _iter_of(n["path"]) <= scope
    byt = {}
    for n in nodes.values():
        if ins(n):
            byt.setdefault(n.get("type", ""), []).append(n)
    refiners, impl, veri = {}, {}, {}
    for n in nodes.values():          # children may live in any iteration (code designs sit in product/)
        for p in n.get("refines", []):    refiners.setdefault(p, []).append(n["id"])
        for p in n.get("implements", []):  impl.setdefault(p, []).append(n["id"])
        for p in n.get("verifies", []):    veri.setdefault(p, []).append(n["id"])
    holes = []
    for n in byt.get("need", []):
        if not refiners.get(n["id"]): holes.append("need '%s' has no use-case" % n["id"])
    for n in byt.get("usecase", []):
        if not refiners.get(n["id"]): holes.append("use-case '%s' has no requirement" % n["id"])
    for n in byt.get("requirement", []):
        if not impl.get(n["id"]): holes.append("requirement '%s' has no design" % n["id"])
        if not veri.get(n["id"]): holes.append("requirement '%s' has no test" % n["id"])
    def ptype_ok(n, field, ptype):
        ps = n.get(field, [])
        return bool(ps) and all(nodes.get(p, {}).get("type") == ptype for p in ps)
    for n in byt.get("usecase", []):
        if not ptype_ok(n, "refines", "need"): holes.append("use-case '%s' orphan (no need)" % n["id"])
    for n in byt.get("requirement", []):
        if not ptype_ok(n, "refines", "usecase"): holes.append("requirement '%s' orphan (no use-case)" % n["id"])
    for n in byt.get("design", []):
        if not ptype_ok(n, "implements", "requirement"): holes.append("design '%s' orphan (implements no requirement)" % n["id"])
    for n in byt.get("test", []):
        if not ptype_ok(n, "verifies", "requirement"): holes.append("test '%s' orphan (verifies no requirement)" % n["id"])
    for n in byt.get("adr", []):
        if not ptype_ok(n, "addresses", "requirement"): holes.append("adr '%s' orphan (addresses no requirement)" % n["id"])
    return sorted(holes)
# enddesign


# design: gate-vs-content  implements: req-split, req-review
# The trace (need/usecase/requirement/design/adr/test) is CONTENT, not a gate: it is hashed so changes
# ripple, but it carries no DONE/SUSPECT/OPEN and is never blessed. Gates are the milestones, their
# subtasks, and executed checks. A milestone's trace-checking subtask is `executed` with a verify of the
# form `coverage:<rule>`, which the engine evaluates live from the trace (scoped to the subtask's iteration).
TRACE_CONTENT = {"need", "usecase", "requirement", "design", "adr", "test"}

def is_gate(node):
    "Gates carry adjudication state (blessed or derived). Trace work-products are content."
    if node.get("class") == "executed":
        return True
    return node.get("type", "") not in TRACE_CONTENT

def _iter_of(path):
    rel = os.path.relpath(path, SPEC).replace("\\", "/").split("/")
    return rel[1] if rel[0] == "iterations" and len(rel) > 1 else "i0000_baseline"

def coverage_rule(nodes, rule, scope=None):
    "Evaluate one derived trace-coverage rule -> bool. scope = iteration id; checked CUMULATIVELY (this"
    " version AND all earlier). A version's trace gate requires the whole trace through it to be complete."
    inscope = lambda n: scope is None or _iter_of(n["path"]) <= scope
    impl, veri = {}, {}
    for n in nodes.values():
        for p in n.get("implements", []): impl.setdefault(p, []).append(n)
        for p in n.get("verifies", []):   veri.setdefault(p, []).append(n)
    reqs = [n for n in nodes.values() if n.get("type") == "requirement" and inscope(n)]
    adrs = [n for n in nodes.values() if n.get("type") == "adr" and inscope(n)]
    ucs = [n for n in nodes.values() if n.get("type") == "usecase" and inscope(n)]
    up = lambda n, want: any(nodes.get(p, {}).get("type") == want for p in n.get("refines", []))
    if rule == "req-traced":
        return all(up(r, "usecase") for r in reqs) and all(up(u, "need") for u in ucs)
    if rule == "req-has-test":
        return all(veri.get(r["id"]) for r in reqs)
    if rule == "req-has-design":
        return all(impl.get(r["id"]) for r in reqs)
    if rule == "adr-traced":
        return all(a.get("addresses") and all(
            nodes.get(p, {}).get("type") == "requirement" for p in a["addresses"]) for a in adrs)
    if rule == "designs-realized":
        return all(impl.get(r["id"]) and all(d.get("region_body") for d in impl[r["id"]]) for r in reqs)
    if rule == "tests-pass":
        ts = [n for n in nodes.values() if n.get("class") == "executed"
              and not n.get("verify", "").startswith("coverage:") and inscope(n)]
        memo = {}
        return bool(ts) and all(run_executed(t, full_hash(t["id"], nodes, memo)) == "pass" for t in ts)
    return False
# enddesign

# design: guidance-resolver  implements: guidance
# Guides load lazily from a description catalog: read each guide file's frontmatter (id, scope, statement)
# so a body is fetched on demand by its trigger (always / by-type / by-rigor / browse) off a type/rigor breadcrumb.
def guides():
    "The guide catalog: {id: {scope, statement, path}} from project_types/**/guides/*.md frontmatter."
    out = {}
    base = os.path.join(ROOT, "product/quackitect/project_types")
    for dp, _, files in os.walk(base):
        if os.path.basename(dp) != "guides":
            continue
        for f in sorted(files):
            if not f.endswith(".md"):
                continue
            fm = open(os.path.join(dp, f), encoding="utf-8").read().split("---")
            meta = {}
            for line in (fm[1] if len(fm) >= 3 else "").splitlines():
                if ":" in line:
                    k, v = line.split(":", 1); meta[k.strip()] = v.strip()
            out[meta.get("id", f[:-3])] = {"scope": meta.get("scope", ""),
                                           "statement": meta.get("statement", ""),
                                           "path": os.path.join(dp, f)}
    return out
# enddesign

def gate_state(nid, nodes, a, memo):
    "The adjudication state of one node: CONTENT for trace work-products, else DONE/SUSPECT/OPEN."
    n = nodes[nid]
    if not is_gate(n):
        return "CONTENT"
    h = full_hash(nid, nodes, memo)
    if n["class"] == "executed":
        v = n.get("verify", "")
        if v.startswith("coverage:"):
            return "DONE" if coverage_rule(nodes, v.split(":", 1)[1].strip(), _iter_of(n["path"])) else "OPEN"
        return "DONE" if run_executed(n, h) == "pass" else "OPEN"
    return "OPEN" if nid not in a else ("DONE" if a[nid]["hash"] == h else "SUSPECT")
