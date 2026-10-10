"""Append-only event log in SQLite. Nothing else in baton holds state."""

import contextlib
import json
import sqlite3
import time

SCHEMA = """
CREATE TABLE IF NOT EXISTS events(
  seq   INTEGER PRIMARY KEY AUTOINCREMENT,
  ts    REAL NOT NULL,
  work  TEXT,
  actor TEXT NOT NULL,
  kind  TEXT NOT NULL,
  data  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ev_work ON events(work, seq);
"""


class Store:
    def __init__(self, path, clock=time.time):
        self.path = path
        self.clock = clock
        self.db = sqlite3.connect(path, timeout=30, isolation_level=None,
                                  check_same_thread=False)
        if path != ":memory:":
            self.db.execute("PRAGMA journal_mode=WAL")
        self.db.executescript(SCHEMA)
        self._depth = 0

    @contextlib.contextmanager
    def tx(self):
        """A write transaction. BEGIN IMMEDIATE serialises writers across
        processes, which is all the compare-and-swap a lease needs."""
        if self._depth:
            self._depth += 1
            try:
                yield
            finally:
                self._depth -= 1
            return
        self.db.execute("BEGIN IMMEDIATE")
        self._depth = 1
        try:
            yield
            self.db.execute("COMMIT")
        except BaseException:
            self.db.execute("ROLLBACK")
            raise
        finally:
            self._depth = 0

    def close(self):
        self.db.close()

    def __del__(self):
        try:
            self.db.close()
        except Exception:
            pass

    def append(self, work, actor, kind, data=None):
        ts = self.clock()
        payload = json.dumps(data or {}, sort_keys=True)
        cur = self.db.execute(
            "INSERT INTO events(ts, work, actor, kind, data) VALUES (?,?,?,?,?)",
            (ts, work, actor, kind, payload))
        return {"seq": cur.lastrowid, "ts": ts, "work": work, "actor": actor,
                "kind": kind, "data": data or {}}

    def events(self, work=None, since=0):
        if work is None:
            rows = self.db.execute(
                "SELECT seq, ts, work, actor, kind, data FROM events "
                "WHERE seq > ? ORDER BY seq", (since,))
        else:
            rows = self.db.execute(
                "SELECT seq, ts, work, actor, kind, data FROM events "
                "WHERE work = ? AND seq > ? ORDER BY seq", (work, since))
        return [{"seq": s, "ts": t, "work": w, "actor": a, "kind": k,
                 "data": json.loads(d)} for s, t, w, a, k, d in rows]
