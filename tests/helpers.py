"""Shared test helpers: a fake clock, routes, an engine over the fake repo."""

from __future__ import annotations

from pathlib import Path

from harness.engine import Engine
from harness.repo import FakeRepo
from harness.routes import load_dir

ROUTES = load_dir(Path(__file__).resolve().parent.parent / "routes")


class Clock:
    def __init__(self, t: float = 1_000_000.0):
        self.t = t

    def __call__(self) -> float:
        return self.t

    def advance(self, seconds: float):
        self.t += seconds


def make(route: str = "mvp", ticket: str = "t1", group: str | None = None):
    clock = Clock()
    repo = FakeRepo()
    repo.commit("ticket/" + ticket, {"README": "x"}, tests_exit=5, parent=repo.tip("main"))
    eng = Engine(ROUTES, repo=repo, clock=clock)
    eng.mint(ticket, goal="fizzbuzz as a function fizz(n)", route=route, group=group)
    return eng, repo, clock


def commit(repo: FakeRepo, branch: str, files: dict, tests_exit: int) -> str:
    base = dict(repo.commits[repo.tip(branch)]["files"])
    base.update(files)
    return repo.commit(branch, base, tests_exit=tests_exit)


def run_test_step(eng: Engine, repo: FakeRepo, ticket: str = "t1") -> dict:
    """A worker writes a failing test and passes the red gate."""
    c = eng.claim(ticket, worker="w-test")
    sha = commit(repo, "ticket/" + ticket, {"tests/test_fizz.py": "assert fizz(3) == 'Fizz'"}, tests_exit=1)
    eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
    return eng.done(c["attempt"], c["token"])


def run_implement_step(eng: Engine, repo: FakeRepo, ticket: str = "t1", tests_exit: int = 0) -> dict:
    c = eng.claim(ticket, worker="w-impl")
    sha = commit(repo, "ticket/" + ticket, {"fizz.py": "def fizz(n): ..."}, tests_exit=tests_exit)
    eng.evidence(c["attempt"], c["token"], "commit", {"sha": sha})
    return eng.done(c["attempt"], c["token"])


def run_review_step(eng: Engine, ticket: str = "t1", verdict: str = "approve", findings=None) -> dict:
    c = eng.claim(ticket, worker="w-review")
    eng.evidence(c["attempt"], c["token"], "review", {"verdict": verdict, "findings": findings or []})
    return eng.done(c["attempt"], c["token"])
