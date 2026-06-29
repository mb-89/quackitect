"""quack - the determinizer lane (deterministic; no judgment). Run via uv:
    uv run quack status [id] | next | start <id> [--plan] | why <id> | bless [--all|<id>] | note "..." | gather <ver> | report | ship
status prints the text board to stdout (an agent tool). report renders the HTML snapshot AND opens it.
start activates a version (--plan registers a future one).
The high-level intent surface (note / engage / review) is slash-commands - see AGENTS.md.
"""
import os, sys, zipfile, subprocess
from quackitect import engine

MARK = {"DONE": "[x]", "SUSPECT": "[~]", "OPEN": "[ ]"}

def cmd_status(a):
    "The text board to stdout — an agent/terminal tool. Shows GATES; the trace is content. report is the human view."
    nodes = engine.load_all(); rows = engine.status(nodes)
    if a and not a[0].startswith("-"):
        for r in engine.why(nodes, a[0]):
            print(" -", r)
        return
    gates = [(nid, st, cls) for nid, st, cls in rows if st != "CONTENT"]
    for nid, st, cls in sorted(gates, key=lambda r: (r[1] != "SUSPECT", r[0])):
        print(MARK[st] + " " + st.ljust(8) + " " + nid + "  (" + cls + ")")
    n = sum(1 for _, s, _ in gates if s == "SUSPECT")
    print("\n%d gates | %d suspect | %d trace-content" % (len(gates), n, len(rows) - len(gates)))

def cmd_why(a):
    for r in engine.why(engine.load_all(), a[0]):
        print(" -", r)

def cmd_bless(a):
    t = a[0] if a else "--all"
    engine.bless(engine.load_all(), t); print("blessed", t)

def cmd_note(a):
    text = a[0] if a and not a[0].startswith("--") else input("note: ")
    origin = a[a.index("--origin") + 1] if "--origin" in a else None
    print("captured", os.path.basename(engine.add_note(text, origin)))

# design: tooling-fixes  implements: req-tooling
# Two determinizer fixes: `quack ship` names the artifact by the active iteration version (not a hardcoded
# v0); `quack verify <id>` runs one executed check (shell or coverage rule) on demand and reports pass/fail.
def cmd_ship(a):
    out = os.path.join(engine.QUACK, "out"); os.makedirs(out, exist_ok=True)
    ver = engine.config()["version"]
    z = os.path.join(out, "quackitect-" + ver + ".zip")
    with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
        for dp, _, fs in os.walk(os.path.join(engine.ROOT, "product")):
            if "__pycache__" in dp:
                continue
            for f in fs:
                fp = os.path.join(dp, f)
                zf.write(fp, os.path.relpath(fp, engine.ROOT))
    print("shipped", os.path.relpath(z, engine.ROOT), "- ephemeral output (not committed)")

def cmd_verify(a):
    nodes = engine.load_all()
    nid = a[0] if a else ""
    n = nodes.get(nid)
    if not n or n["class"] != "executed":
        print("verify: " + nid + " is not an executed check"); return
    v = n.get("verify", "")
    if v.startswith("coverage:"):
        ok = engine.coverage_rule(nodes, v.split(":", 1)[1].strip(), engine._iter_of(n["path"]))
        print(nid, "->", "pass" if ok else "fail", "(derived: " + v + ")")
    else:
        print(nid, "->", engine.run_executed(n, engine.full_hash(nid, nodes, {})))
# enddesign

def cmd_next(a):
    nodes = engine.load_all()
    prefer = a[0] if a and not a[0].startswith("-") else None
    v = engine.pick_version(nodes, prefer)
    print("version:", v)
    kind, node = engine.next_check(nodes, v)
    if kind == "done":
        print("done - all gates green for " + str(v) + "; /engage refine or /engage ship."); return
    if kind == "blocked":
        print("blocked - no ready gate in " + str(v) + " (inspect the graph)."); return
    gate = ", GATE (human-adjudicated)" if node["killer"] else ""
    print("NEXT: " + node["id"] + "  (" + node["class"] + gate + ")")
    print("  " + node["statement"])
    if node["class"] == "executed":
        print("  verify: " + node["verify"])
    print("  -> fill it; gate -> ask the human to `uv run quack bless " + node["id"] + "`")

# design: version-ops  implements: req-version-mgmt
# Deterministic version ops (replaces hand-written iteration.md). `quack start <id>` ACTIVATES a version:
# creates it active, points config at it; a planned version flips to active. `quack start --plan <id>
# "motivation"` registers a FUTURE version as planned (a roadmap entry), without activating it.
def _set_config_version(vid):
    p = os.path.join(engine.QUACK, "config.toml")
    lines = open(p, encoding="utf-8").read().splitlines() if os.path.exists(p) else []
    out, seen = [], False
    for ln in lines:
        if ln.strip().startswith("version"):
            out.append('version = "' + vid + '"'); seen = True
        else:
            out.append(ln)
    if not seen:
        out.append('version = "' + vid + '"')
    open(p, "w", encoding="utf-8", newline="\n").write("\n".join(out) + "\n")

def cmd_start(a):
    plan = "--plan" in a
    rest = [x for x in a if x != "--plan"]
    if not rest:
        print('usage: quack start <id> [--plan] [motivation...]'); return
    vid = rest[0]; motivation = " ".join(rest[1:])
    d = os.path.join(engine.SPEC, "iterations", vid); os.makedirs(d, exist_ok=True)
    p = os.path.join(d, "iteration.md")
    if os.path.exists(p) and not motivation:                 # preserve an existing motivation
        parts = open(p, encoding="utf-8").read().split("---")
        motivation = ("---".join(parts[2:]).strip() if len(parts) >= 3 else "")
    cfg = engine.config()
    fm = ["---", "iteration: " + vid, "status: " + ("planned" if plan else "active")]
    if not plan:
        fm += ["type: " + cfg["type"], "rigor: " + cfg["rigor"]]
    fm += ["---", "", motivation or "(motivation: TBD)", ""]
    open(p, "w", encoding="utf-8", newline="\n").write("\n".join(fm))
    if plan:
        print("planned " + vid + " - a future version (roadmap). `quack start " + vid + "` activates it later.")
    else:
        _set_config_version(vid)
        print("started " + vid + " - active. Now compose its checklist (/engage start), then bless.")
# enddesign

# design: gather  implements: composition
# `quack gather` assembles the rigor floors + guides for the active version into one place, so the
# agent can COMPOSE the iteration checklist from the full gathered content (the agent does the composing).
def cmd_gather(a):
    ver = a[0] if a else engine.config()["version"]
    path, n = engine.gather(ver)
    print("gathered " + str(n) + " source folder(s) -> " + os.path.relpath(path, engine.ROOT))
    print("  read it, open any flagged files / follow links, then COMPOSE the checklist")
    print("  as check nodes in spec/iterations/" + ver + "/ tailored to the idea, then bless.")
# enddesign

def _open(path):
    "Open a file in the OS default app. Best-effort; never fails the command."
    try:
        if sys.platform.startswith("win"):
            os.startfile(path)  # noqa: only exists on Windows
        else:
            subprocess.run(["open" if sys.platform == "darwin" else "xdg-open", path], check=False)
    except Exception:
        print("  (open it manually: " + path + ")")

def cmd_report(a):
    explicit = "--out" in a   # an explicit output path means scripting/CI -> render only, do not open
    out = a[a.index("--out") + 1] if explicit else os.path.join(engine.QUACK, "out", "report.html")
    from quackitect import report
    path, model = report.write(out)
    done = sum(1 for s in model["smap"].values() if s == "DONE")
    print("report -> " + os.path.relpath(path, engine.ROOT)
          + "  (" + str(done) + "/" + str(len(model["nodes"])) + " done, root " + model["root"][:12] + ")")
    if not explicit and "--no-open" not in a:   # bare `quack report` SHOWS it
        _open(path)


def cmd_lint(a):
    holes = engine.coverage(engine.load_all())
    if not holes:
        print("coverage: clean (no holes)")
    else:
        print("coverage: " + str(len(holes)) + " hole(s):")
        for h in holes:
            print("  - " + h)


# design: command-surface-impl  implements: command-surface
# The CLI dispatches the default-closed intents: note (capture), engage (status/next/ship/bless),
# review (report/lint), gather. Each verb maps to one handler; unknown verbs fall through to status.
CMDS = {"status": cmd_status, "why": cmd_why, "bless": cmd_bless, "note": cmd_note,
        "ship": cmd_ship, "next": cmd_next, "gather": cmd_gather, "report": cmd_report,
        "lint": cmd_lint, "verify": cmd_verify, "start": cmd_start}
# enddesign

def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    fn = CMDS.get(cmd)
    if not fn:
        print('determinizer: status [id] | next | start <id> [--plan] | why <id> | bless [--all|<id>] | note "..." | gather <ver> | report [--out F] | ship')
        print("methods (slash-commands): /note | /engage [start|next|refine|ship] | /review [readout|retro]")
        return
    fn(sys.argv[2:])

if __name__ == "__main__":
    main()
