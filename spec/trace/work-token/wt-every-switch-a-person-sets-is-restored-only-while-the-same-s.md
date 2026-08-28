---
id: wt-every-switch-a-person-sets-is-restored-only-while-the-same-s
type: "[[work]]"
statement: "Every switch a person sets is restored only while the same session id holds, so ending a session and starting another takes the defaults back. The design says that on purpose: a new session is a new session. But two of those switches look like standing preferences rather than judgments about one run, and nothing distinguishes the two kinds. Splitting them means an owner ruling first, then a change to the restore path and to the design that currently contradicts it."
place: i47-the-session-splits-along-its-proven-seam
ready_when: ready when the owner rules whether the sleep-blocking and shutdown switches are standing preferences rather than per-session judgments — the design currently says the opposite and would have to change with the code
source: note-c912e9dde17b
---

## Why it stands

Every switch a person sets is restored only while the same session id holds, so ending a session and starting another takes the defaults back. The design says that on purpose: a new session is a new session. But two of those switches look like standing preferences rather than judgments about one run, and nothing distinguishes the two kinds. Splitting them means an owner ruling first, then a change to the restore path and to the design that currently contradicts it.

## When it comes back

ready when the owner rules whether the sleep-blocking and shutdown switches are standing preferences rather than per-session judgments — the design currently says the opposite and would have to change with the code
