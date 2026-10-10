"""Event stores. Every store offers the same two operations:

    read()            -> state (fold of the log)
    append(x)         -> (state, [events])  where x is a list of partial events or a builder
                         callable(state) -> list of partial events. All-or-nothing: if any event is
                         rejected by engine.apply, nothing is written and Rejected propagates.

The store assigns seq and ts (from its clock). Partial event: {type, actor, ticket?, data}.

  MemoryStore   tests, simulation
  FileStore     JSONL file + flock: single host, many processes (default)
  GitRefStore   the log lives in a git ref; compare-and-swap via `git update-ref new old`
"""
import fcntl
import functools
import json
import os
import subprocess
import threading
import time

from . import engine


class Clock:
    """Wall clock; HX_NOW (epoch seconds) pins it for demos and tests."""

    def now(self):
        env = os.environ.get("HX_NOW")
        return int(env) if env else int(time.time())


class FakeClock:
    def __init__(self, t=1_760_000_000):
        self.t = int(t)

    def now(self):
        return self.t

    def advance(self, seconds):
        self.t += int(seconds)
        return self.t


def _finalize(state, partials, clock):
    """Assign seq/ts and apply. Returns events. Raises Rejected (state may be partially applied)."""
    out = []
    ts = max(clock.now(), state.get("ts", 0))  # never go back in time
    for p in partials:
        ev = {"seq": state["seq"] + 1, "ts": ts, "actor": p["actor"], "type": p["type"],
              "ticket": p.get("ticket"), "data": p.get("data") or {}}
        engine.apply(state, ev)
        out.append(ev)
    return out


def _synchronized(fn):
    @functools.wraps(fn)
    def wrapper(self, *a, **k):
        with self._mutex:
            return fn(self, *a, **k)
    return wrapper


class _CachedFold:
    """Shared logic: keep a folded state and the number of events folded so far.
    Stores are thread-safe (one in-process mutex) and process-safe where noted (flock / CAS)."""

    def __init__(self, clock):
        self.clock = clock or Clock()
        self._state = None
        self._n = 0
        self._mutex = threading.RLock()

    def _fold_new(self, events):
        if self._state is None:
            self._state, self._n = engine.new_state(), 0
        engine.fold(events[self._n:], self._state)
        self._n = len(events)
        return self._state

    def _apply_batch(self, state, x):
        partials = x(engine.clone(state)) if callable(x) else x
        if not partials:
            return state, []
        if len(partials) == 1:
            try:
                evs = _finalize(state, partials, self.clock)  # handlers validate before mutating
            except engine.Rejected:
                raise
            except Exception:
                self._state = None  # unexpected bug: drop the cache, refold next time
                raise
            return state, evs
        trial = engine.clone(state)
        evs = _finalize(trial, partials, self.clock)
        return trial, evs


class MemoryStore(_CachedFold):
    def __init__(self, clock=None):
        super().__init__(clock)
        self.events = []

    @_synchronized
    def read(self):
        return self._fold_new(self.events)

    @_synchronized
    def append(self, x):
        state = self._fold_new(self.events)
        new_state, evs = self._apply_batch(state, x)
        self.events.extend(evs)
        self._state, self._n = new_state, len(self.events)
        return new_state, evs

    @_synchronized
    def all_events(self):
        return list(self.events)


class FileStore(_CachedFold):
    def __init__(self, path, clock=None):
        super().__init__(clock)
        self.path = os.path.abspath(path)
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        self.lock_path = self.path + ".lock"
        self._offset = 0
        self._events = []

    def _read_new(self):
        if not os.path.exists(self.path):
            return self._events
        with open(self.path, "rb") as f:
            f.seek(self._offset)
            data = f.read()
        end = data.rfind(b"\n")
        if end < 0:
            return self._events
        for line in data[:end].split(b"\n"):
            if line.strip():
                self._events.append(json.loads(line))
        self._offset += end + 1
        return self._events

    def _locked(self, mode):
        fd = open(self.lock_path, "a+")
        fcntl.flock(fd, mode)
        return fd

    @_synchronized
    def read(self):
        fd = self._locked(fcntl.LOCK_SH)
        try:
            return self._fold_new(self._read_new())
        finally:
            fcntl.flock(fd, fcntl.LOCK_UN)
            fd.close()

    @_synchronized
    def append(self, x):
        fd = self._locked(fcntl.LOCK_EX)
        try:
            state = self._fold_new(self._read_new())
            new_state, evs = self._apply_batch(state, x)
            if evs:
                blob = "".join(json.dumps(e, sort_keys=True) + "\n" for e in evs).encode()
                with open(self.path, "ab") as f:
                    f.write(blob)
                    f.flush()
                    os.fsync(f.fileno())
                self._offset += len(blob)
                self._events.extend(evs)
            self._state, self._n = new_state, len(self._events)
            return new_state, evs
        finally:
            fcntl.flock(fd, fcntl.LOCK_UN)
            fd.close()

    @_synchronized
    def all_events(self):
        self.read()
        return list(self._events)


ZERO = "0" * 40


class GitRefStore(_CachedFold):
    """The log is `log.jsonl` in the tree of a commit that `ref` points to; each append is one commit.

    Appends use optimistic concurrency: build on the commit we read, then `git update-ref ref new old`,
    which fails if another writer moved the ref; we then re-read, re-validate and retry. Against a
    remote, the same commit is pushed fast-forward-only, which is the same compare-and-swap.
    """

    def __init__(self, repo, ref="refs/hx/state", clock=None, retries=20):
        super().__init__(clock)
        self.repo, self.ref, self.retries = os.path.abspath(repo), ref, retries
        self._head = None
        self._events = []
        self.cas_conflicts = 0

    def _git(self, *args, input=None):
        r = subprocess.run(["git", "-C", self.repo, *args], input=input, capture_output=True)
        if r.returncode != 0:
            raise RuntimeError(f"git {' '.join(args)}: {r.stderr.decode().strip()}")
        return r.stdout.decode().strip()

    def _head_now(self):
        r = subprocess.run(["git", "-C", self.repo, "rev-parse", "--verify", "-q", self.ref],
                           capture_output=True)
        return r.stdout.decode().strip() if r.returncode == 0 else None

    def _load(self, head):
        if head == self._head:
            return self._events
        if head is None:
            events = []
        else:
            raw = self._git("cat-file", "blob", f"{head}:log.jsonl")
            events = [json.loads(line) for line in raw.splitlines() if line.strip()]
        if self._head is None or events[:self._n] != self._events[:self._n]:
            self._state, self._n = None, 0  # history differs from our cache: refold
        self._head, self._events = head, events
        return events

    @_synchronized
    def read(self):
        return self._fold_new(self._load(self._head_now()))

    @_synchronized
    def append(self, x):
        for _ in range(self.retries):
            head = self._head_now()
            state = engine.clone(self._fold_new(self._load(head)))
            trial_state, evs = self._apply_batch(state, x)
            if not evs:
                return trial_state, []
            content = "".join(json.dumps(e, sort_keys=True) + "\n" for e in self._events + evs)
            blob = self._git("hash-object", "-w", "--stdin", input=content.encode())
            tree = self._git("mktree", input=f"100644 blob {blob}\tlog.jsonl\n".encode())
            msg = "hx: " + ", ".join(f"{e['type']} {e.get('ticket') or ''}".strip() for e in evs)
            env_args = ["-c", "user.name=hx", "-c", "user.email=hx@localhost"]
            parent = ["-p", head] if head else []
            commit = subprocess.run(["git", *env_args, "-C", self.repo, "commit-tree", tree, *parent, "-m", msg],
                                    capture_output=True, check=True).stdout.decode().strip()
            r = subprocess.run(["git", "-C", self.repo, "update-ref", self.ref, commit, head or ZERO],
                               capture_output=True)
            if r.returncode == 0:
                self._head, self._events = commit, self._events + evs
                self._state, self._n = trial_state, len(self._events)
                return trial_state, evs
            self.cas_conflicts += 1  # someone else appended first: retry on top of their commit
            self._state, self._n = None, 0
        raise RuntimeError("GitRefStore: too many concurrent-append conflicts")

    @_synchronized
    def all_events(self):
        self.read()
        return list(self._events)


def open_store(spec, clock=None):
    """spec: path/to/log.jsonl | file:path | git:/path/to/repo[#ref] | memory:"""
    if spec.startswith("memory:"):
        return MemoryStore(clock)
    if spec.startswith("git:"):
        repo, _, ref = spec[4:].partition("#")
        return GitRefStore(repo, ref or "refs/hx/state", clock)
    if spec.startswith("file:"):
        spec = spec[5:]
    return FileStore(spec, clock)
