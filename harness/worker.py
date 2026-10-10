"""Workers: what the supervisor launches for one attempt.

ClaudeWorker runs Claude Code headless with the hooks and the MCP server
wired in. Any worker implements run(claim) -> dict and kill(attempt_id).
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import threading
from pathlib import Path

PROMPT = (
    "You are one attempt on one step of a ticket. The harness briefing arrived through the SessionStart hook; "
    "if you do not see it, call harness_status first. Do the step the briefing describes, file evidence with "
    "harness_evidence as you go, and end with exactly one of harness_done, harness_handover or harness_ask. "
    "Work in the current directory, which is a checkout of the ticket's branch. Commit on that branch. "
    "Do not push."
)


def hook_settings() -> dict:
    py = sys.executable or "python3"
    cmd = lambda ev: {"type": "command", "command": f"{py} -m harness.hooks {ev}", "timeout": 30}
    return {"hooks": {
        "SessionStart": [{"hooks": [cmd("session-start")]}],
        "Stop": [{"hooks": [cmd("stop")]}],
        "PreToolUse": [{"matcher": "Bash", "hooks": [cmd("pre-tool")]}],
        "PostToolUse": [{"matcher": ".*", "hooks": [cmd("post-tool")]}],
    }}


def mcp_config(env: dict) -> dict:
    return {"mcpServers": {"harness": {"command": sys.executable or "python3", "args": ["-m", "harness.mcp_server"], "env": env}}}


class ClaudeWorker:
    name = "claude"

    def __init__(self, url: str, repo_path: str | Path, workdir: str | Path, model: str | None = None,
                 max_turns: int = 40, timeout: int = 1800, claude_bin: str = "claude", log=None):
        self.url = url
        self.repo_path = Path(repo_path)
        self.workdir = Path(workdir)
        self.model = model
        self.max_turns = max_turns
        self.timeout = timeout
        self.claude_bin = claude_bin
        self.log = log or (lambda *a: None)
        self.procs: dict[int, subprocess.Popen] = {}
        self.lock = threading.Lock()

    def checkout(self, ticket: str, branch: str) -> Path:
        """One worktree per ticket, on the ticket's branch."""
        path = self.workdir / ticket
        if not path.exists():
            self.workdir.mkdir(parents=True, exist_ok=True)
            subprocess.run(["git", "worktree", "add", "-q", str(path), branch], cwd=str(self.repo_path), check=True, capture_output=True)
        return path

    def run(self, claim: dict) -> dict:
        aid = claim["attempt"]
        cwd = self.checkout(claim["ticket"], claim.get("branch") or f"ticket/{claim['ticket']}")
        root = str(Path(__file__).resolve().parent.parent)
        env = dict(os.environ)
        harness_env = {"HARNESS_URL": self.url, "HARNESS_ATTEMPT": str(aid), "HARNESS_TOKEN": claim["token"],
                       "PYTHONPATH": root + (os.pathsep + env["PYTHONPATH"] if env.get("PYTHONPATH") else "")}
        env.update(harness_env)
        env.pop("CLAUDECODE", None)
        conf = self.workdir / f".attempt-{aid}"
        conf.mkdir(parents=True, exist_ok=True)
        settings = conf / "settings.json"
        mcp = conf / "mcp.json"
        settings.write_text(json.dumps(hook_settings(), indent=1))
        mcp.write_text(json.dumps(mcp_config(harness_env), indent=1))
        cmd = [self.claude_bin, "-p", PROMPT, "--settings", str(settings), "--mcp-config", str(mcp),
               "--strict-mcp-config", "--dangerously-skip-permissions", "--max-turns", str(self.max_turns),
               "--output-format", "json"]
        if self.model:
            cmd += ["--model", self.model]
        self.log(f"attempt {aid}: launching {self.claude_bin} in {cwd}")
        p = subprocess.Popen(cmd, cwd=str(cwd), env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        with self.lock:
            self.procs[aid] = p
        try:
            out, err = p.communicate(timeout=self.timeout)
        except subprocess.TimeoutExpired:
            p.kill()
            out, err = p.communicate()
        finally:
            with self.lock:
                self.procs.pop(aid, None)
        (conf / "stdout.json").write_text(out or "")
        (conf / "stderr.txt").write_text(err or "")
        result = {"attempt": aid, "exit": p.returncode}
        try:
            j = json.loads(out)
            result.update({k: j.get(k) for k in ("num_turns", "total_cost_usd", "duration_ms", "is_error", "subtype")})
            result["result"] = (j.get("result") or "")[:2000]
        except Exception:
            result["result"] = (out or "")[-2000:]
        self.log(f"attempt {aid}: exit {p.returncode}, turns {result.get('num_turns')}, cost {result.get('total_cost_usd')}")
        return result

    def kill(self, attempt_id: int):
        with self.lock:
            p = self.procs.get(attempt_id)
        if p:
            p.kill()
