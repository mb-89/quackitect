"""Claude Code hooks: `hx hook <event>` reads the hook JSON on stdin and prints a JSON decision.

  session-start  inject the brief (startup/resume/compact); claim HX_TICKET if the dispatcher set it
  prompt         inject new notices (owner answers, nudges, edits)
  pre-tool       deny: zombie sessions, paused work, frozen-test edits, reviewer edits, force-push,
                 push to main, rebase of the evidence chain, owner-only hx commands
  post-tool      throttled heartbeat (with HEAD), notices, checkpoint nag, context-size warning
  pre-compact    remember that a compaction happened (the brief is re-injected on SessionStart:compact)
  stop           refuse to stop while holding an unfinished step (max twice), then hand over
  session-end    hand over a step that is still held

Hooks fail open: an internal error allows the action and logs to stderr, so a store outage never
kills an agent. Gates, not hooks, are the guarantee; hooks give fast feedback.
"""
import json
import os
import re
import sys

from .engine import OK, Rejected, gate_report

READ_TOOLS = {"Read", "Grep", "Glob", "LS", "TodoWrite", "WebFetch", "WebSearch", "NotebookRead"}
WRITE_TOOLS = {"Edit", "Write", "MultiEdit", "NotebookEdit"}
HX_CMD = re.compile(r"^\s*(hx|python3? -m hx)\b")
READONLY_BASH = re.compile(r"^\s*(ls|cat|head|tail|grep|rg|find|pwd|wc|echo|git\s+(status|log|diff|show|branch"
                           r"|fetch|rev-parse))\b[^>;&]*$")
FORCE_PUSH = re.compile(r"\bgit\s+push\b[^\n;&|]*\s(--force(-with-lease)?|-f)\b")
PUSH_MAIN = re.compile(r"\bgit\s+push\b[^\n;&|]*\s(\S+:)?(refs/heads/)?(main|master)\b")
REBASE = re.compile(r"\bgit\s+(rebase|pull\s+(-r|--rebase))\b")
MUTATE = re.compile(r"(\bsed\s+(-\w*\s+)*-\w*i|\btee\b|\brm\b|\bmv\b|\bcp\b|\bgit\s+(rm|mv)\b|\btruncate\b"
                    r"|\bperl\s+-\w*i)")
REDIRECT = re.compile(r"(?<![0-9&>])>>?\s*([^\s;&|<>()]+)")  # stdout redirect targets; not 2>... or &>...
SEGMENTS = re.compile(r"\|\||&&|;|\||\n")
OWNER_CMDS = re.compile(r"\bhx\s+(answer|approve|changes|override|pause|resume|cancel|revoke|edit|import|ticket)\b")
GIT_WRITE = re.compile(r"\bgit\s+(commit|push|merge|rebase|cherry-pick)\b")


def touches_frozen(cmd, frozen):
    """True if a simple command in `cmd` writes a frozen file: a redirect into it, or a mutating command
    (sed -i, tee, rm, mv, cp, ...) naming it. Reads such as `cat tests/x.py 2>/dev/null` are fine.
    Deliberately conservative: the frozen-blob check in the gate is the guarantee, this is feedback."""
    def hit(text):
        return any(text == f or text.endswith("/" + f) for f in frozen)
    for target in REDIRECT.findall(cmd):
        if hit(target.strip("'\"")):
            return True
    for seg in SEGMENTS.split(cmd):
        if MUTATE.search(seg) and any(f in seg for f in frozen):
            return True
    return False

MAX_STOP_BLOCKS = 2
CP_NAG = int(os.environ.get("HX_CP_NAG", "25"))
CONTEXT_BYTES = int(os.environ.get("HX_CONTEXT_BYTES", "800000"))


def _cli():
    from . import cli
    return cli


def _local_path():
    return os.path.join(_cli().local_dir(), "agent.json")


def load_local():
    try:
        with open(_local_path()) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_local(data):
    try:
        os.makedirs(os.path.dirname(_local_path()), exist_ok=True)
        with open(_local_path(), "w") as f:
            json.dump(data, f)
    except OSError:
        pass


def _sid(d):
    return os.environ.get("HX_SESSION") or d.get("session_id") or _cli().session_id()


def deny(reason):
    return {"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny",
                                   "permissionDecisionReason": reason}}


def context(event, text):
    return {"hookSpecificOutput": {"hookEventName": event, "additionalContext": text}}


def _remember(local, sid, ticket, epoch):
    local.update(session=sid, ticket=ticket, epoch=epoch, calls_since_cp=0)
    save_local(local)


def _forget(local):
    for k in ("ticket", "epoch"):
        local.pop(k, None)
    save_local(local)


def _new_notices(t, run, local):
    seen = local.get("notices_seen", 0)
    base = run.get("claim_seq") or 0
    fresh = [n for n in t["notices"] if n["seq"] > base and n["n"] > seen]
    if fresh:
        local["notices_seen"] = max(n["n"] for n in fresh)
    return ["hx NOTICE: " + n["text"] for n in fresh]


# --------------------------------------------------------------------------- events

def on_session_start(d):
    sid = _sid(d)
    cli = _cli()
    os.makedirs(cli.local_dir(), exist_ok=True)
    with open(os.path.join(cli.local_dir(), "session"), "w") as f:
        f.write(sid)
    hx = cli.make_hx()
    st = hx.state()
    local = load_local()
    lease = st["leases"].get(sid)
    notes = []
    if not lease and os.environ.get("HX_TICKET"):
        try:
            r = hx.claim(sid, os.environ.get("HX_ROLE", "worker"), os.environ["HX_TICKET"])
            lease = {"ticket": r["ticket"], "epoch": r["epoch"]}
        except Rejected as r:
            notes.append(f"hx: could not claim {os.environ['HX_TICKET']}: {r.message}")
    if lease:
        _remember(local, sid, lease["ticket"], lease["epoch"])
        head = ("hx: your context was compacted. This brief is authoritative; re-read it."
                if d.get("source") == "compact" else "hx: you are working under the hx harness. Your brief:")
        return context("SessionStart", "\n".join(notes + [head, hx.brief(sid)]))
    if local.get("ticket") and local.get("session") == sid:
        notes.append(f"hx: your lease on {local['ticket']} is gone (handed over or finished). Do not continue "
                     f"that work; `hx claim` for new work or stop.")
        _forget(local)
    else:
        notes.append("hx: no lease held. If you were asked to work on hx tickets, run `hx claim --role worker` "
                     "(or --role reviewer) and follow the brief.")
    return context("SessionStart", "\n".join(notes))


def on_prompt(d):
    sid = _sid(d)
    hx = _cli().make_hx()
    st = hx.state()
    lease = st["leases"].get(sid)
    if not lease:
        return None
    t = st["tickets"][lease["ticket"]]
    local = load_local()
    msgs = _new_notices(t, t["run"], local)
    save_local(local)
    return context("UserPromptSubmit", "\n".join(msgs)) if msgs else None


def on_pre_tool(d):
    tool = d.get("tool_name", "")
    ti = d.get("tool_input") or {}
    cmd = ti.get("command", "") if tool == "Bash" else ""
    if cmd and OWNER_CMDS.search(cmd):
        return deny("hx: that is an owner-only command. Agents never answer, approve, override, pause or edit; "
                    "use `hx ask` to request a decision.")
    sid = _sid(d)
    hx = _cli().make_hx()
    st = hx.state()
    local = load_local()
    lease = st["leases"].get(sid)
    harmless = tool in READ_TOOLS or bool(cmd and (HX_CMD.match(cmd) or READONLY_BASH.match(cmd)))
    if not lease:
        if local.get("ticket") and local.get("session") == sid and not harmless:
            t = st["tickets"].get(local["ticket"])
            where = f"{t['id']} is now {t['status']}" + (f" at step {t['step']}" if t and t["step"] else "") \
                if t else "unknown"
            return deny(f"hx: LEASE_LOST — you no longer hold {local['ticket']} ({where}). Another session may "
                        f"own it. Do not edit, commit or push. Stop, or run `hx claim` for new work.")
        return None
    t = st["tickets"][lease["ticket"]]
    run = t["run"]
    if (st["paused_all"] or t["status"] == "paused") and not harmless:
        return deny("hx: PAUSED by the owner. Stop working; do not edit, commit or push.")
    step = run["step"]
    if run["role"] == "reviewer":
        if tool in WRITE_TOOLS:
            return deny("hx: reviewers may not edit files. Record what must change with "
                        "`hx submit review --verdict changes --finding '...'`.")
        if cmd and GIT_WRITE.search(cmd):
            return deny("hx: reviewers may not commit, push or merge; report findings with `hx submit review`. "
                        "(Inspecting is fine: checkout of the candidate, running tests, scratch files.)")
    frozen = t["frozen"] if step != "red" else {}
    if tool in WRITE_TOOLS and frozen:
        path = ti.get("file_path") or ti.get("notebook_path") or ""
        root = _cli().repo_root(d.get("cwd"))
        rel = os.path.relpath(path, root) if os.path.isabs(path) else path
        if rel in frozen:
            return deny(f"hx: {rel} is FROZEN since red@{t['heads'].get('red', '')[:7]}. Change the code so the "
                        f"tests pass; if a test is genuinely wrong, `hx ask` the owner.")
    if cmd:
        if FORCE_PUSH.search(cmd):
            return deny("hx: force-push is not allowed; it rewrites the evidence chain.")
        if PUSH_MAIN.search(cmd):
            return deny(f"hx: never push to main; push {t['branch']}. The merge queue lands reviewed commits.")
        if REBASE.search(cmd) and t["heads"].get("red"):
            return deny("hx: do not rebase: it breaks red→green ancestry. Merge origin/main instead.")
        if frozen and touches_frozen(cmd, frozen):
            return deny("hx: that command would modify a FROZEN test file. Change the code instead.")
    return None


def on_post_tool(d):
    sid = _sid(d)
    hx = _cli().make_hx()
    st = hx.state()
    lease = st["leases"].get(sid)
    if not lease:
        return None
    t = st["tickets"][lease["ticket"]]
    run = t["run"]
    local = load_local()
    if local.get("ticket") != t["id"] or local.get("epoch") != lease["epoch"]:
        _remember(local, sid, t["id"], lease["epoch"])
    cmd = (d.get("tool_input") or {}).get("command", "") if d.get("tool_name") == "Bash" else ""
    if re.match(r"\s*hx\s+(checkpoint|submit|done|release|ask)\b", cmd):
        local["calls_since_cp"] = 0
    else:
        local["calls_since_cp"] = local.get("calls_since_cp", 0) + 1
    msgs = []
    now = hx.now()
    if now - local.get("last_hb", 0) >= st["config"]["lease_ttl_s"] // 3:
        try:
            hx.heartbeat(sid, head=_cli().head_sha(d.get("cwd")))
            local["last_hb"] = now
        except Rejected as r:
            msgs.append("hx: " + r.message)
    msgs += _new_notices(t, run, local)
    n = local["calls_since_cp"]
    if n >= CP_NAG and n % CP_NAG == 0:
        msgs.append(f"hx: {n} tool calls since your last checkpoint. Run `hx checkpoint --done '...' --next '...'`.")
    tp = d.get("transcript_path")
    if tp and os.path.exists(tp) and os.path.getsize(tp) > CONTEXT_BYTES and not local.get("ctx_warned"):
        local["ctx_warned"] = True
        msgs.append("hx: your context is large. Commit+push, `hx checkpoint`, then `hx release --note '...'` so a "
                    "fresh session continues from a clean brief (better than auto-compaction).")
    save_local(local)
    return context("PostToolUse", "\n".join(msgs)) if msgs else None


def on_pre_compact(d):
    local = load_local()
    local["compactions"] = local.get("compactions", 0) + 1
    save_local(local)
    return None


def on_stop(d):
    sid = _sid(d)
    hx = _cli().make_hx()
    st = hx.state()
    lease = st["leases"].get(sid)
    local = load_local()
    if not lease:
        if local.get("ticket"):
            _forget(local)
        return None
    t = st["tickets"][lease["ticket"]]
    run = t["run"]
    key = f"{t['id']}#{run['epoch']}"
    blocks = local.setdefault("stop_blocks", {})
    if not isinstance(blocks, dict):
        blocks = local["stop_blocks"] = {}
    n = blocks.get(key, 0)
    if n < MAX_STOP_BLOCKS:
        blocks[key] = n + 1
        save_local(local)
        unmet = [c for c in gate_report(st, t) if c["status"] != OK]
        lines = "\n".join(f"  [ ] {c['check']}: {c['msg']}" for c in unmet) or "  (gate satisfied: run `hx done`)"
        return {"decision": "block", "reason":
                f"hx: you still hold {t['id']}/{run['step']} (epoch {run['epoch']}) and it is not done.\n{lines}\n"
                f"Do exactly one of: (1) finish, then `hx done`; (2) `hx ask '<question>' --options a,b` if you "
                f"need the owner; (3) `hx checkpoint --done '..' --next '..'` then `hx release --note '..'` to hand "
                f"over. Do not stop while holding the lease."}
    try:
        hx.release(sid, note={"text": "agent stopped without finishing or handing over; see the last checkpoint"},
                   involuntary=True, reason="stopped without finishing")
    except Rejected:
        pass
    _forget(local)
    return None


def on_session_end(d):
    sid = _sid(d)
    hx = _cli().make_hx()
    lease = hx.state()["leases"].get(sid)
    if lease:
        try:
            hx.release(sid, note={"text": f"session ended ({d.get('reason', 'unknown')}) while holding the step"},
                       involuntary=True, reason="session ended")
        except Rejected:
            pass
    _forget(load_local())
    return None


HANDLERS = {"session-start": on_session_start, "prompt": on_prompt, "pre-tool": on_pre_tool,
            "post-tool": on_post_tool, "pre-compact": on_pre_compact, "stop": on_stop,
            "session-end": on_session_end}


def run_hook(event, stdin=None):
    raw = (stdin if stdin is not None else (sys.stdin.read() if not sys.stdin.isatty() else "")) or "{}"
    try:
        d = json.loads(raw)
    except ValueError:
        d = {}
    if d.get("cwd") and os.path.isdir(d["cwd"]):
        os.chdir(d["cwd"])
    try:
        out = HANDLERS[event](d)
    except Exception as e:  # fail open
        print(f"hx hook {event}: internal error, allowing: {type(e).__name__}: {e}", file=sys.stderr)
        return 0
    if out:
        print(json.dumps(out))
    return 0
