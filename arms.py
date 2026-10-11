"""The arms: how a run's repository is seeded, how the agent session starts, and what it left.

Every run gets its own folder under the batch:

  origin.git/    a bare repo holding only the base tree (one commit, no history), plus,
                 for v5, the owner's setup commit and the work branch the dispatcher opens
  quackitect/    the agent's clone, installed as a developer's box would be
  home/ cfg/     HOME and CLAUDE_CONFIG_DIR of the session: nothing from other runs leaks in
  transcript.jsonl, meta.json, final.patch ...

Arms (same model, same tools, same caps; only the harness and the prompt differ):

  plain       untrusted workspace, user settings only: no level0 plugin, no project hooks,
              no output style, no project skills, no AGENTS.md, no git hooks. Prompt = the ask.
  plain+stop  plain, plus team B's stopping rule in the prompt.
  v5          trusted workspace with project settings: level0 plugin (doors, MCP pull tools,
              stop hook), SessionStart/Stop/SessionEnd hooks, output style, AGENTS.md, work skill,
              git hooks. The ask is the task ticket inside a one-child group on work/<group>,
              and the prompt is the box prompt `./RUNME.sh cloud prompt <group>` prints.
"""
import json
import os
import re
import shutil
import signal
import subprocess
import time

from benchlib import HERE, git, sh

CLAUDE = os.environ.get("BENCH_CLAUDE", "/opt/node22/bin/claude")
# Run folders and shared tools stand outside every scratchpad, so the sandbox can cover those.
RUNS = os.environ.get("BENCH_RUNS", "/tmp/qb")
TOOLS_DIR = os.environ.get("BENCH_TOOLS", "/tmp/qbtools")
# CI pins this client for the check's types and plugin parts; agents meet it on PATH as CI does,
# through a meter (claude-meter.sh) that copies every call's output into the run's folder.
CHECK_CLAUDE_BIN = os.path.join(TOOLS_DIR, "bin")
SANDBOX = os.path.join(HERE, "sandbox.sh")

MODELS = {"haiku": "claude-haiku-5-5", "sonnet": "claude-sonnet-5-5", "opus": "claude-opus-5-5"}

TOOLS = "Bash,Read,Edit,Write,Glob,Grep,Task,Skill,ToolSearch"
GROUP = "the-bench-work"  # the one-child group the v5 arm's ticket lands in (names.words caps at five)

AGENT_NAME, AGENT_EMAIL = "Claude", "agent"      # 'claude' is a name the privacy door reads as nobody
SETUP_NAME, SETUP_EMAIL = "agent", "agent"

# Strip the parent session's ids, sockets, account and GitHub credentials from the nested env.
STRIP = ("CLAUDE_CODE_SESSION_ID", "CLAUDE_CODE_REMOTE_SESSION_ID", "CLAUDE_CODE_MESSAGING_SOCKET",
         "CLAUDE_CODE_MESSAGING_TOKEN", "CLAUDE_CODE_CHILD_SESSION", "CLAUDE_PID", "CLAUDECODE",
         "GH_TOKEN", "GITHUB_TOKEN", "GIT_ASKPASS", "CLAUDE_CODE_USER_EMAIL",
         "CLAUDE_CODE_DIAGNOSTICS_FILE", "CLAUDE_CODE_TEE_SDK_STDOUT", "TRACEPARENT",
         "CLAUDE_CODE_SYNC_SESSION_REFS", "CLAUDE_CODE_SYNC_SKILLS", "CLAUDE_CODE_ARTIFACT_DB",
         "CLAUDE_CODE_ARTIFACT_ASSETS", "CLAUDE_CODE_ARTIFACT_MULTI_FILE", "CLAUDE_CODE_ARTIFACT_TYPES",
         "CLAUDE_CODE_ARTIFACT_TYPE_CATALOG", "CLAUDE_CODE_ARTIFACT_TYPE_CLOUD_CREATE",
         "CLAUDE_CODE_DEBUG", "CLAUDE_CODE_BASE_REF", "DOCUMENTS_MCP_SCRATCH_ROOT",
         "CLAUDE_ADDITIONAL_DIRECTORIES", "CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD")

STOP_RULE = ("Stop rule: as soon as tests cover every point of the ask and all pass, commit, and end "
             "your reply with the line TASK COMPLETE. Do not refactor or polish working code. "
             "Commit before every risky change.")


ALIASES = {"claude-haiku-5-5": "haiku", "claude-sonnet-5-5": "sonnet", "claude-opus-5-5": "opus"}


def agent_env(run_dir, model_id, extra=None, arm="plain"):
    home = os.path.join(run_dir, "home")
    env = {k: v for k, v in os.environ.items()
           if k not in STRIP and not k.startswith("GIT_CONFIG_")}
    path = [p for p in env.get("PATH", "").split(":") if "/.ccr/sessions/" not in p]
    env["PATH"] = ":".join([CHECK_CLAUDE_BIN] + path)
    env["HOME"] = home
    env["CLAUDE_CONFIG_DIR"] = os.path.join(run_dir, "cfg")
    # the Go caches stay shared: they are keyed by content, and safe under concurrency
    env["GOPATH"] = os.environ.get("GOPATH", "/root/go")
    env["GOMODCACHE"] = os.environ.get("GOMODCACHE", "/root/go/pkg/mod")
    env["GOCACHE"] = os.environ.get("GOCACHE", "/root/.cache/go-build")
    # One model in every arm. The agent runs on --model; its subagents too:
    #  - plain arms: every model alias resolves to the arm's model, so a Task call naming
    #    'opus' still runs on it (CLAUDE_CODE_SUBAGENT_MODEL alone does not override a named model);
    #  - v5: the helper tiers (level0's helper.find/change/decide, opus by default) are set to the
    #    arm's model in the box's own config layer (`./RUNME.sh config helper.change haiku`, as the
    #    owner's se-config commands do; see clone_for_agent), and level0's own door refuses an
    #    Agent call naming any other model. (An environment variable would do the same, and the
    #    pilot showed it leaking into a test of the config reader.) The aliases stay unpinned there, so a client the
    #    harness starts itself (the commit door's cold probe) runs on the client's default, as it
    #    ships; the meter prices those calls into the run.
    env["CLAUDE_CODE_SUBAGENT_MODEL"] = model_id
    if arm != "v5":
        # every ./RUNME.sh verb runs install.sh first, and the install points git at .githooks
        # again: the plain arms skip that want, so the commit and push doors stay v5's alone
        env["SE_INSTALL_SKIP"] = "editor-link editor-extensions editor-client git-hooks"
        for k in ("ANTHROPIC_DEFAULT_HAIKU_MODEL", "ANTHROPIC_DEFAULT_SONNET_MODEL",
                  "ANTHROPIC_DEFAULT_OPUS_MODEL"):
            env[k] = model_id
    env["BENCH_METER"] = os.path.join(run_dir, "meter", "claude")
    env["CLAUDE_CODE_REMOTE"] = "true"  # every arm is an unattended cloud box
    env["TMPDIR"] = os.path.join(run_dir, "tmp")
    os.makedirs(env["TMPDIR"], exist_ok=True)
    env.update(extra or {})
    return env


def write_home(run_dir, trusted_repo=None, model_id=None):
    home, cfg = os.path.join(run_dir, "home"), os.path.join(run_dir, "cfg")
    os.makedirs(home, exist_ok=True)
    os.makedirs(cfg, exist_ok=True)
    with open(os.path.join(home, ".gitconfig"), "w") as f:
        # GitHub stays out of reach: the future of every task stands there
        f.write(f"[user]\n\tname = {AGENT_NAME}\n\temail = {AGENT_EMAIL}\n"
                "[url \"https://bench.invalid/blocked/\"]\n\tinsteadOf = https://github.com/\n"
                "\tinsteadOf = git@github.com:\n[advice]\n\tdetachedHead = false\n")
    state = {"hasCompletedOnboarding": True}
    if trusted_repo:
        state["hasTrustDialogAccepted"] = True
        state["projects"] = {trusted_repo: {"hasTrustDialogAccepted": True}}
    with open(os.path.join(cfg, ".claude.json"), "w") as f:
        json.dump(state, f)


# ------------------------------------------------------------------ seeding

def export_tree(repo, rev, dest):
    os.makedirs(dest, exist_ok=True)
    arch = subprocess.run(["git", "-C", repo, "archive", "--format=tar", rev], capture_output=True, check=True)
    subprocess.run(["tar", "-x", "-C", dest], input=arch.stdout, check=True)


def git_id(name, email):
    return ["-c", f"user.name={name}", "-c", f"user.email={email}", "-c", "core.hooksPath=/dev/null",
            "-c", "commit.gpgsign=false"]


def install(tree, env):
    """Install what the tree needs, era-proof: RUNME runs the install before any verb."""
    e = dict(env)
    e.setdefault("SE_INSTALL_SKIP", "editor-link editor-extensions editor-client")
    r = sh(["./RUNME.sh", "help"], cwd=tree, env=e, check=False, timeout=900)
    return r.returncode, (r.stdout + r.stderr)[-3000:]


def clean_ask(ask):
    """The ask without the template comments the mint leaves."""
    lines = [ln for ln in ask.splitlines() if not re.match(r"^\s*<!--.*-->\s*$", ln)]
    return "\n".join(lines).strip()


def seed(task, arm, run_dir, repo, env):
    """Create origin.git for this run. Returns {'prompt': ...} for v5, {} otherwise."""
    seed_dir = os.path.join(run_dir, "seed")
    origin = os.path.join(run_dir, "origin.git")
    export_tree(repo, task["base"], seed_dir)
    g = git_id(SETUP_NAME, SETUP_EMAIL)
    fixed = dict(env, GIT_AUTHOR_DATE="2026-01-01T00:00:00Z", GIT_COMMITTER_DATE="2026-01-01T00:00:00Z",
                 GIT_AUTHOR_NAME=SETUP_NAME, GIT_AUTHOR_EMAIL=SETUP_EMAIL,
                 GIT_COMMITTER_NAME=SETUP_NAME, GIT_COMMITTER_EMAIL=SETUP_EMAIL)
    sh(["git", "init", "-q", "-b", "main"], cwd=seed_dir)
    sh(["git", *g, "add", "-A"], cwd=seed_dir)
    sh(["git", *g, "commit", "-q", "-m", "base"], cwd=seed_dir, env=fixed)
    sh(["git", "init", "-q", "--bare", "-b", "main", origin])
    sh(["git", "remote", "add", "origin", origin], cwd=seed_dir)
    sh(["git", *g, "push", "-q", "origin", "main"], cwd=seed_dir)
    info = {}
    try:
        if arm == "v5":
            info.update(seed_v5(task, seed_dir, env))
    finally:
        # the seed clone carries the setup's runtime folders and index: none of it reaches the agent
        stop_servers(seed_dir)
        shutil.rmtree(seed_dir, ignore_errors=True)
    return info


def seed_v5(task, seed_dir, env):
    """The owner's and the dispatcher's part: the ticket joins a one-child group, the group opens
    on main, and `branch open` pushes work/<group> to origin, as the dispatcher does."""
    # the owner and the dispatcher act from a desk and the Action runner, never from a cloud box
    e = {k: v for k, v in env.items() if k not in ("CLAUDE_CODE_REMOTE", "SE_CLOUD")}
    e.update(GIT_AUTHOR_NAME=SETUP_NAME, GIT_AUTHOR_EMAIL=SETUP_EMAIL,
             GIT_COMMITTER_NAME=SETUP_NAME, GIT_COMMITTER_EMAIL=SETUP_EMAIL)
    sh(["git", "config", "user.name", SETUP_NAME], cwd=seed_dir)
    sh(["git", "config", "user.email", SETUP_EMAIL], cwd=seed_dir)
    rc, out = install(seed_dir, e)
    if rc != 0:
        raise RuntimeError("install failed in seed: " + out[-1500:])
    # the owner's commits meet no door: hooks stay off for the setup's own git calls
    sh(["git", "config", "core.hooksPath", "/dev/null"], cwd=seed_dir)
    t = task["ticket"]
    g = git_id(SETUP_NAME, SETUP_EMAIL)
    steps = []

    def verb(*args):
        r = sh(["./RUNME.sh", *args], cwd=seed_dir, env=e, check=False, timeout=600)
        steps.append({"verb": " ".join(args)[:200], "rc": r.returncode, "out": (r.stdout + r.stderr)[-800:]})
        return r

    goal = clean_ask(task["ask"]) or task["ask"]
    if task.get("interface_note"):
        add_note_to_ticket(os.path.join(seed_dir, "spec", "tickets", f"{t}.md"), task["interface_note"])
    verb("ticket", "set", t, "group", GROUP)
    minted = verb("mint", "ticket", f"spec/tickets/{GROUP}.md", "--process=group", f"--goal={goal}")
    if minted.returncode != 0 and "names no field" in (minted.stdout + minted.stderr):
        # a base whose mint predates the process's ask fields takes the goal as the Ask body
        verb("mint", "ticket", f"spec/tickets/{GROUP}.md", "--process=group", f"--Ask={goal}")
    verb("ticket", "open", GROUP)
    if sh(["git", "status", "--porcelain", "spec/tickets"], cwd=seed_dir).stdout.strip():
        sh(["git", *g, "add", "-A", "spec/tickets"], cwd=seed_dir)
        sh(["git", *g, "commit", "-q", "-m", f"{GROUP}: mints the group, and its child joins it"],
           cwd=seed_dir, env=e)
    sh(["git", *g, "push", "-q", "origin", "main"], cwd=seed_dir)
    verb("branch", "open", GROUP)
    prompt = verb("cloud", "prompt", GROUP)
    text = prompt.stdout.strip() if prompt.returncode == 0 else ""
    if not text.startswith("run the work skill"):
        text = fallback_box_prompt(task)
    front = sh(["git", "show", f"main:spec/tickets/{GROUP}.md"], cwd=seed_dir, check=False).stdout
    state = re.search(r"^state:\s*(\S+)", front, re.M)
    branches = sh(["git", "ls-remote", "--heads", "origin"], cwd=seed_dir).stdout
    return {"prompt": text, "setup_steps": steps, "group_state": state.group(1) if state else "?",
            "origin_heads": [ln.split("refs/heads/")[-1] for ln in branches.splitlines()]}


def add_note_to_ticket(path, note):
    """The interface note joins the end of the ticket's ask, as an owner would add it."""
    text = open(path).read()
    lines = text.split("\n")
    out, in_ask, done = [], False, False
    for i, ln in enumerate(lines):
        if ln.startswith("# ") and in_ask and not done:
            out += [note, ""]
            done = True
        if ln.strip() == "# Ask":
            in_ask = True
        out.append(ln)
    if in_ask and not done:
        out += ["", note]
    with open(path, "w") as f:
        f.write("\n".join(out))


def fallback_box_prompt(task):
    """The box prompt `cloud prompt` prints on later trees, for a base whose tree lacks the verb."""
    return ("run the work skill\n"
            f"Your group: {GROUP}. Its child tickets stand under spec/tickets: {task['ticket']}.\n"
            "Its route: sync, split, children, accept, retro.")


def ask_with_note(task):
    ask = clean_ask(task["ask"])
    note = task.get("interface_note") or ""
    return f"{ask}\n\n{note}" if note else ask


def plain_prompt(task, stop=False):
    ask = ask_with_note(task)
    p = (f"{ask}\n\n"
         "Make this change in the repository in your working directory (a Go project; `go test ./...` "
         "runs the Go tests and `./RUNME.sh check` runs the repository's full check). Add or update tests "
         "for the change, and commit your work on the current branch when you are done.")
    if stop:
        p += "\n\n" + STOP_RULE
    return p


def clone_for_agent(run_dir, arm, env, model_id=None):
    origin = os.path.join(run_dir, "origin.git")
    tree = os.path.join(run_dir, "quackitect")
    sh(["git", "clone", "-q", origin, tree])
    rc, out = install(tree, env)
    if arm != "v5":
        # no git hooks for the plain arms: the commit and push doors are v5's
        sh(["git", "config", "--unset", "core.hooksPath"], cwd=tree, check=False)
    else:
        alias = ALIASES.get(model_id or "", "haiku")
        for tier in ("find", "change", "decide"):
            r = sh(["./RUNME.sh", "config", f"helper.{tier}", alias], cwd=tree, env=env, check=False, timeout=300)
            out += f"\nconfig helper.{tier} {alias}: rc={r.returncode} {(r.stdout + r.stderr)[-200:]}"
    start = git(tree, "rev-parse", "HEAD").stdout.strip()
    return tree, start, rc, out


# ------------------------------------------------------------------ the session

def claude_args(arm, model_id, max_budget, max_turns):
    args = [CLAUDE, "-p", "--model", model_id, "--output-format", "stream-json", "--verbose",
            "--include-hook-events", "--tools", TOOLS,
            "--permission-mode", "acceptEdits", "--permission-prompts", "none",
            "--allowedTools", "Bash Read Edit Write Glob Grep Task Skill ToolSearch"]
    if arm == "v5":
        args += ["--setting-sources", "project"]
    else:
        args += ["--setting-sources", "user"]
    if max_budget:
        args += ["--max-budget-usd", str(max_budget)]
    if max_turns:
        args += ["--max-turns", str(max_turns)]
    return args


def run_session(run_dir, tree, arm, model_id, prompt, env, wall_secs, max_budget, max_turns):
    """Run one headless session; kill it at the wall-clock cap. Returns a summary dict."""
    tpath = os.path.join(run_dir, "transcript.jsonl")
    epath = os.path.join(run_dir, "stderr.txt")
    args = [SANDBOX, run_dir] + claude_args(arm, model_id, max_budget, max_turns) + [prompt]
    t0 = time.time()
    with open(tpath, "w") as out, open(epath, "w") as err:
        p = subprocess.Popen(args, cwd=tree, env=env, stdout=out, stderr=err, stdin=subprocess.DEVNULL,
                             start_new_session=True)
        killed = False
        while p.poll() is None:
            if time.time() - t0 > wall_secs:
                killed = True
                # an interrupt first, so the client can still write its result line
                for sig, wait in ((signal.SIGINT, 30), (signal.SIGTERM, 10), (signal.SIGKILL, 0)):
                    try:
                        os.killpg(p.pid, sig)
                    except ProcessLookupError:
                        break
                    end = time.time() + wait
                    while time.time() < end and p.poll() is None:
                        time.sleep(1)
                    if p.poll() is not None:
                        break
                break
            time.sleep(2)
        p.wait()
    secs = round(time.time() - t0, 1)
    for d in os.listdir("/mnt"):
        if d.startswith("qb-keep-"):
            path = os.path.join("/mnt", d)
            try:
                if d.endswith(".reaper.py"):
                    os.remove(path)
                else:
                    os.rmdir(path)  # only an unmounted, empty one goes
            except OSError:
                pass
    return {"secs": secs, "killed_at_cap": killed, "exit": p.returncode}


def stop_servers(tree):
    """Kill every process the run's tree started (the index server and its modules)."""
    me = os.getpid()
    out = subprocess.run(["ps", "-eo", "pid=,args="], capture_output=True, text=True).stdout
    for line in out.splitlines():
        pid, _, cmd = line.strip().partition(" ")
        if tree in cmd and int(pid) != me:
            try:
                os.kill(int(pid), signal.SIGKILL)
            except (ProcessLookupError, ValueError):
                pass


# ------------------------------------------------------------------ what the agent left

def final_tree(tree, start, arm):
    """The tree the agent left: the working tree with untracked files, or for v5 the work branch's
    tip where the session ended off it. Returns (tree_sha, where)."""
    branch = git(tree, "rev-parse", "--abbrev-ref", "HEAD", check=False).stdout.strip()
    work = f"work/{GROUP}"
    if arm == "v5" and branch != work:
        has = git(tree, "rev-parse", "--verify", "-q", work, check=False)
        if has.returncode == 0:
            tip = has.stdout.strip()
            moved = git(tree, "rev-list", "--count", f"{start}..{tip}", check=False).stdout.strip()
            if moved and moved != "0":
                return git(tree, "rev-parse", f"{tip}^{{tree}}").stdout.strip(), f"branch {work}"
    idx = os.path.join(os.path.dirname(tree), "final.index")
    e = dict(os.environ, GIT_INDEX_FILE=idx)
    sh(["git", "read-tree", "HEAD"], cwd=tree, env=e, check=False)
    sh(["git", "add", "-A", "."], cwd=tree, env=e, check=False)
    t = sh(["git", "write-tree"], cwd=tree, env=e).stdout.strip()
    try:
        os.remove(idx)
    except OSError:
        pass
    return t, f"working tree on {branch}"
