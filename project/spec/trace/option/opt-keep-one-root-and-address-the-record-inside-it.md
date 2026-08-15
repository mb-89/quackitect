---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: opt-keep-one-root-and-address-the-record-inside-it
type: "[[option]]"
statement: hold the lane's root fixed at the repository for the whole session and address a record as a path underneath it, so no call's meaning depends on what is bound
cluster: cluster-the-walk
question: which tree a path resolves to
found_by: probe
source: "probe 2026-08-14 — the lane's root ALREADY moves on binding, measured by listing the root at the desk and again inside the bound record"
---

## Mechanism

One root, always the repository. A record's content is reached at a path
under it, exactly as a committed ref and a declared root are reached today.

Binding then changes what the walk is DOING and never what a path MEANS.

WHY THE PROBE PRODUCED THIS RATHER THAN CONFIRMING THE OTHERS. The chart
carried three shapes that all assumed the root does not move yet: confine it,
judge each path, or fan the method out. The probe showed the root already
moves, silently, in both the lane and the shell.

So "move the root" is not a change anybody has to make. The live behaviour is
the moving root, and its cost is the thing being paid.

THE MEASUREMENT. `se_file_list {dir: "."}` at the front desk returns
.worktrees, dist and project. The same call inside bound i27 returns project
without .worktrees and without dist. `(Get-Location).Path` in the shell
returns the worktree. One session, one path, two meanings, nothing said.

WHAT IT COSTS. Every path into a record grows a prefix, and the prefix is
long. Against that, a call means one thing for the life of the session and a
reader never has to know what was bound to understand a log line.

WHAT IT GIVES UP. The confinement that the moving root provides by accident.
Under this option a wrong path reaches the wrong record freely, so it needs
opt-judge-every-path-in-one-dispatch-pass beside it rather than instead of it.
