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
         "class": "judgment", "verify": "", "killer": False, "path": path}
    for line in fm.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1); k = k.strip(); v = v.strip()
        if k == "statement": d["statement"] = v
        elif k == "depends_on": d["depends_on"] = [x.strip() for x in v.strip("[]").split(",") if x.strip()]
        elif k == "class": d["class"] = v
        elif k == "verify": d["verify"] = v
        elif k == "killer": d["killer"] = (v.lower() == "true")
        elif k == "id" and v: d["id"] = v
    return d

def load_all():
    nodes = {}
    for dp, _, files in os.walk(SPEC):
        for f in sorted(files):
            if f.endswith(".md"):
                d = parse(os.path.join(dp, f))
                if d["statement"]:
                    nodes[d["id"]] = d
    return nodes

def stmt_hash(node):
    return hashlib.sha256(norm(node["statement"]).encode()).hexdigest()[:12]

def full_hash(nid, nodes, memo, stack=()):
    if nid in memo:
        return memo[nid]
    if nid in stack:
        raise SystemExit("cycle through " + nid)
    n = nodes[nid]
    deps = sorted(d for d in n["depends_on"] if d in nodes)
    dh = ",".join(full_hash(d, nodes, memo, stack + (nid,)) for d in deps)
    seed = norm(n["statement"]) + "|" + n.get("verify", "") + "|" + dh
    h = hashlib.sha256(seed.encode()).hexdigest()[:12]
    memo[nid] = h
    return h

def attest_load():
    return json.load(open(ATTEST)) if os.path.exists(ATTEST) else {}

def attest_save(a):
    os.makedirs(QUACK, exist_ok=True)
    json.dump(a, open(ATTEST, "w"), indent=2)

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

def status(nodes):
    memo = {}; a = attest_load(); rows = []
    for nid, n in nodes.items():
        h = full_hash(nid, nodes, memo)
        if n["class"] == "executed":
            st = "DONE" if run_executed(n, h) == "pass" else "OPEN"
        else:
            st = "OPEN" if nid not in a else ("DONE" if a[nid]["hash"] == h else "SUSPECT")
        rows.append((nid, st, n["class"]))
    return rows

def bless(nodes, target):
    memo = {}; a = attest_load()
    ids = list(nodes) if target == "--all" else [target]
    for nid in ids:
        if nodes[nid]["class"] == "executed":
            continue
        a[nid] = {"hash": full_hash(nid, nodes, memo), "statement_hash": stmt_hash(nodes[nid]),
                  "deps": {d: full_hash(d, nodes, memo) for d in nodes[nid]["depends_on"] if d in nodes}}
    attest_save(a)

def why(nodes, nid):
    memo = {}; a = attest_load()
    if nodes[nid]["class"] == "executed":
        return ["executed check - its run decides; see .quack/evidence/" + nid]
    if nid not in a:
        return ["OPEN - never blessed"]
    reasons = []
    if stmt_hash(nodes[nid]) != a[nid]["statement_hash"]:
        reasons.append("own statement changed")
    for d in nodes[nid]["depends_on"]:
        if d in nodes and a[nid]["deps"].get(d) != full_hash(d, nodes, memo):
            reasons.append("upstream '" + d + "' changed")
    return reasons or ["fresh - nothing changed"]

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
    a, memo, m = attest_load(), {}, {}
    for nid, n in nodes.items():
        h = full_hash(nid, nodes, memo)
        if n["class"] == "executed":
            m[nid] = "DONE" if run_executed(n, h) == "pass" else "OPEN"
        else:
            m[nid] = "OPEN" if nid not in a else ("DONE" if a[nid]["hash"] == h else "SUSPECT")
    return m

def next_check(nodes):
    st = _status_map(nodes)
    ready = [nid for nid, n in nodes.items()
             if st[nid] in ("OPEN", "SUSPECT")
             and all(st.get(d) == "DONE" for d in n["depends_on"] if d in nodes)]
    if not ready:
        return ("done", None) if all(s == "DONE" for s in st.values()) else ("blocked", None)
    return ("check", nodes[sorted(ready)[0]])
