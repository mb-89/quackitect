"""The store: SQLite, one writer, an append-only event log beside the view tables."""

from __future__ import annotations

import json
import sqlite3
import threading

SCHEMA = """
create table if not exists ticket(
    id text primary key,
    grp text,
    route text not null,
    goal text not null,
    branch text,
    base_sha text,
    test_cmd text,
    test_paths text,
    step text not null,
    state text not null,
    held_for text,
    held_detail text,
    fails text not null default '{}',
    rounds text not null default '{}',
    attempts_on_step integer not null default 0,
    stalls integer not null default 0,
    notes text not null default '[]',
    priority integer not null default 0,
    created real not null,
    updated real not null
);
create table if not exists attempt(
    id integer primary key autoincrement,
    ticket text not null,
    step text not null,
    round integer not null,
    role text not null,
    worker text,
    token text not null,
    started real not null,
    start_sha text,
    lease_until real not null,
    last_progress real not null,
    last_verb text,
    calls integer not null default 0,
    handover_requested integer not null default 0,
    ended real,
    outcome text
);
create table if not exists evidence(
    id integer primary key autoincrement,
    ticket text not null,
    step text not null,
    round integer not null,
    attempt integer,
    kind text not null,
    body text not null,
    verified text,
    detail text,
    created real not null
);
create table if not exists handover(
    id integer primary key autoincrement,
    ticket text not null,
    step text not null,
    attempt integer,
    done text, remaining text, blockers text, files text, next text,
    synthesized integer not null default 0,
    created real not null
);
create table if not exists gate_result(
    id integer primary key autoincrement,
    ticket text not null,
    step text not null,
    attempt integer,
    verdict text not null,
    detail text,
    created real not null
);
create table if not exists decision(
    id integer primary key autoincrement,
    ticket text not null,
    step text not null,
    verdict text not null,
    note text,
    created real not null
);
create table if not exists event(
    seq integer primary key autoincrement,
    ts real not null,
    ticket text,
    kind text not null,
    body text not null
);
"""


class Store:
    def __init__(self, path: str = ":memory:"):
        self.conn = sqlite3.connect(path, check_same_thread=False, isolation_level=None)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("pragma journal_mode=wal") if path != ":memory:" else None
        self.conn.execute("pragma foreign_keys=on")
        self.conn.executescript(SCHEMA)
        self.lock = threading.RLock()

    def close(self):
        try:
            self.conn.close()
        except Exception:
            pass

    def tx(self):
        return _Tx(self)

    def one(self, sql: str, *args) -> dict | None:
        row = self.conn.execute(sql, args).fetchone()
        return dict(row) if row else None

    def all(self, sql: str, *args) -> list[dict]:
        return [dict(r) for r in self.conn.execute(sql, args).fetchall()]

    def run(self, sql: str, *args) -> int:
        cur = self.conn.execute(sql, args)
        return cur.lastrowid

    def event(self, ts: float, ticket: str | None, name: str, **body) -> int:
        return self.run(
            "insert into event(ts, ticket, kind, body) values(?,?,?,?)",
            ts, ticket, name, json.dumps(body, default=str),
        )


class _Tx:
    def __init__(self, store: Store):
        self.store = store

    def __enter__(self):
        self.store.lock.acquire()
        self.store.conn.execute("begin")
        return self.store

    def __exit__(self, exc_type, exc, tb):
        try:
            if exc_type is None:
                self.store.conn.execute("commit")
            else:
                self.store.conn.execute("rollback")
        finally:
            self.store.lock.release()
        return False
