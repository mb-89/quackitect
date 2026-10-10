"""The supervisor loop: tick, launch workers on ready tickets, reap them."""

from __future__ import annotations

import threading
import time

from .engine import Engine, HarnessError


class Supervisor:
    def __init__(self, engine: Engine, worker, max_parallel: int = 1, tick_seconds: float = 2.0, log=print):
        self.engine = engine
        self.worker = worker
        self.max_parallel = max_parallel
        self.tick_seconds = tick_seconds
        self.log = log
        self.running: dict[int, threading.Thread] = {}
        self.results: list[dict] = []
        self.lock = threading.Lock()
        self._stop = threading.Event()

    def _run_one(self, claim: dict):
        aid = claim["attempt"]
        try:
            result = self.worker.run(claim)
        except Exception as e:
            result = {"attempt": aid, "exit": -1, "result": f"worker raised: {e}"}
        with self.lock:
            self.results.append(result)
        crashed = self.engine.worker_exited(aid)
        if crashed is not None:
            self.log(f"attempt {aid}: the worker ended with the attempt open; marked crashed")
        with self.lock:
            self.running.pop(aid, None)

    def once(self) -> dict:
        """One pass: tick, kill, launch. Returns what happened."""
        out = self.engine.tick()
        for aid in out["kill"]:
            self.worker.kill(aid)
            self.log(f"attempt {aid}: killed for spinning")
        launched = []
        with self.lock:
            free = self.max_parallel - len(self.running)
        if free > 0:
            for t in self.engine.ready()[:free]:
                try:
                    claim = self.engine.claim(t["id"], worker=getattr(self.worker, "name", "worker"))
                except HarnessError:
                    continue
                claim["branch"] = t["branch"]
                th = threading.Thread(target=self._run_one, args=(claim,), daemon=True)
                with self.lock:
                    self.running[claim["attempt"]] = th
                th.start()
                launched.append(claim["attempt"])
                self.log(f"ticket {t['id']}: step {t['step']} -> attempt {claim['attempt']}")
        out["launched"] = launched
        return out

    def idle(self) -> bool:
        with self.lock:
            if self.running:
                return False
        states = {t["state"] for t in self.engine.tickets()}
        if not states:
            return False  # nothing minted yet: wait for a ticket
        return not (states & {"open", "active"})

    def run(self, until_idle: bool = True, max_seconds: float | None = None):
        start = time.time()
        while not self._stop.is_set():
            self.once()
            if until_idle and self.idle():
                break
            if max_seconds and time.time() - start > max_seconds:
                break
            self._stop.wait(self.tick_seconds)

    def stop(self):
        self._stop.set()
