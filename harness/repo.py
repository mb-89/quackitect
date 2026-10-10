"""The git adapter: what the gates ask of a repository, and a fake for simulation.

Six calls, so a hosted forge is swappable. The forge calls (pull request,
auto-merge, CI status) are stubs in this prototype.
"""

from __future__ import annotations

import hashlib
import os
import shutil
import subprocess
import tempfile
from pathlib import Path


class RepoError(Exception):
    pass


class GitRepo:
    """A real git repository on disk."""

    def __init__(self, path: str | Path):
        self.path = Path(path)
        if not (self.path / ".git").exists() and not (self.path / "HEAD").exists():
            raise RepoError(f"{self.path} is not a git repository")

    def _git(self, *args, cwd: Path | None = None, check: bool = True) -> subprocess.CompletedProcess:
        p = subprocess.run(["git", *args], cwd=str(cwd or self.path), capture_output=True, text=True)
        if check and p.returncode != 0:
            raise RepoError(f"git {' '.join(args)}: {p.stderr.strip()}")
        return p

    def tip(self, branch: str) -> str:
        return self._git("rev-parse", branch).stdout.strip()

    def commit_exists(self, branch: str, sha: str) -> bool:
        if not self._git("cat-file", "-e", f"{sha}^{{commit}}", check=False).returncode == 0:
            return False
        return self._git("merge-base", "--is-ancestor", sha, branch, check=False).returncode == 0

    def run_at(self, sha: str, cmd: str, timeout: int = 600) -> tuple[int, str]:
        """Run cmd in a clean checkout of sha. Returns (exit code, output)."""
        tmp = Path(tempfile.mkdtemp(prefix="gate-"))
        try:
            self._git("worktree", "add", "--detach", "-q", str(tmp), sha)
            try:
                p = subprocess.run(cmd, shell=True, cwd=str(tmp), capture_output=True, text=True, timeout=timeout)
                out = (p.stdout + p.stderr)[-4000:]
                return p.returncode, out
            except subprocess.TimeoutExpired:
                return 124, f"timed out after {timeout}s"
        finally:
            self._git("worktree", "remove", "--force", str(tmp), check=False)
            shutil.rmtree(tmp, ignore_errors=True)

    def changed_files(self, a: str, b: str, paths: list[str]) -> list[tuple[str, str]]:
        """Files under paths that differ between a and b, as (status, path)."""
        p = self._git("diff", "--name-status", a, b, "--", *paths)
        out = []
        for line in p.stdout.splitlines():
            parts = line.split("\t")
            if len(parts) >= 2:
                out.append((parts[0][0], parts[-1]))
        return out

    def diff(self, a: str, b: str, max_chars: int = 12000) -> str:
        text = self._git("diff", "--stat", "-p", a, b).stdout
        if len(text) > max_chars:
            text = text[:max_chars] + f"\n... truncated at {max_chars} chars"
        return text

    def commits_between(self, a: str, b: str) -> list[str]:
        p = self._git("rev-list", f"{a}..{b}", check=False)
        return p.stdout.split()

    # forge stubs
    def open_pr(self, branch: str, title: str, body: str) -> str:
        return f"stub-pr:{branch}"

    def enable_auto_merge(self, pr: str) -> None:
        return None

    def ci_status(self, sha: str) -> str:
        return "unknown"


class FakeRepo:
    """An in-memory repository for simulation and unit tests.

    A commit is a snapshot: {path: content}. tests_exit says what the test
    command returns in a clean checkout of that commit.
    """

    def __init__(self):
        self.commits: dict[str, dict] = {}
        self.branches: dict[str, str] = {}
        self.ci: dict[str, str] = {}
        self.commit("main", {}, tests_exit=5)  # an empty tree has no tests to run

    def commit(self, branch: str, files: dict[str, str], tests_exit: int, parent: str | None = None) -> str:
        parent = parent or self.branches.get(branch)
        raw = repr((branch, sorted(files.items()), tests_exit, parent, len(self.commits)))
        sha = hashlib.sha1(raw.encode()).hexdigest()[:12]
        self.commits[sha] = {"branch": branch, "files": dict(files), "tests_exit": tests_exit, "parent": parent}
        self.branches[branch] = sha
        return sha

    def tip(self, branch: str) -> str:
        return self.branches[branch]

    def _chain(self, sha: str) -> list[str]:
        out = []
        while sha:
            out.append(sha)
            sha = self.commits[sha]["parent"]
        return out

    def commit_exists(self, branch: str, sha: str) -> bool:
        return sha in self.commits and sha in self._chain(self.branches.get(branch, ""))

    def run_at(self, sha: str, cmd: str, timeout: int = 600) -> tuple[int, str]:
        c = self.commits.get(sha)
        if c is None:
            raise RepoError(f"no commit {sha}")
        return c["tests_exit"], f"fake run of {cmd!r} at {sha}: exit {c['tests_exit']}"

    def changed_files(self, a: str, b: str, paths: list[str]) -> list[tuple[str, str]]:
        fa, fb = self.commits[a]["files"], self.commits[b]["files"]
        out = []
        for path in sorted(set(fa) | set(fb)):
            if paths and not any(path == p or path.startswith(p.rstrip("/") + "/") for p in paths):
                continue
            if path in fa and path not in fb:
                out.append(("D", path))
            elif path in fb and path not in fa:
                out.append(("A", path))
            elif fa[path] != fb[path]:
                out.append(("M", path))
        return out

    def diff(self, a: str, b: str, max_chars: int = 12000) -> str:
        lines = [f"{s} {p}" for s, p in self.changed_files(a, b, [])]
        return "\n".join(lines)[:max_chars]

    def commits_between(self, a: str, b: str) -> list[str]:
        chain = self._chain(b)
        return chain[: chain.index(a)] if a in chain else chain

    def open_pr(self, branch: str, title: str, body: str) -> str:
        return f"fake-pr:{branch}"

    def enable_auto_merge(self, pr: str) -> None:
        return None

    def ci_status(self, sha: str) -> str:
        return self.ci.get(sha, "unknown")
