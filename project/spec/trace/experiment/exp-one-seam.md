---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: exp-one-seam
type: "[[experiment]]"
statement: Can every lane verb be routed through one resolution seam, the shell included, measured as the count of paths built without the resolver?
probes:
  - raid-risk-a-write-lands-in-the-wrong-tree-silently
timebox: one hour
form: script
promote: "none — the work is routing the modules that read the filesystem for themselves through the resolver, and lint.ts is the worked example"
folds_to: "raid-risk-a-write-lands-in-the-wrong-tree-silently moves from risk to issue on two dated instances"
faked: no satellite exists, so the cross-process half is untested — the shell half ran against the real engine and the real PowerShell
fallback: a guard per verb plus an audit, which is today's shape and the one the i8 field report records failing
verdict: holds
measured: 2026-08-14 — 40 resolver call sites against 88 direct joins, and one path string resolving to two different trees
source_refs:
  - rank-unknowns, the seeded pick
  - el-resolution-seam
  - opt-one-process-per-record-rooted-by-the-os
---

## Setup

Ran on the owner's Windows machine, 2026-08-14, against the live engine and a
real PowerShell child.

Three measurements, each answering one part of the question.

- COUNT the engine's resolver call sites against the paths built without it.
- RESOLVE a relative path, an escaping relative path, and a far-escaping one
  inside a child shell, using pure path resolution and no filesystem access.
- COMPARE what the shell sees at a path against what the file lane sees at the
  same path.

## Result

### The shell is inside the boundary for free

The child shell's own working directory came back as the record's worktree,
with nobody telling it to go there:

```
C:\...\quackitect-v3\.worktrees\i27-the-lane-binds-to-the-record-a-bound-wal
```

A relative path resolved inside that tree. So
[[opt-one-process-per-record-rooted-by-the-os]] holds for the common case, and
the engine writes no rule for it.

### The platform refuses nothing

`..\..\..\..\Users` resolved to `c:\Users\ichbi\Desktop\ai\Users` — outside
the worktree, outside the project, no complaint.

So rooting alone is not enough. The REFUSE act on
[[el-resolution-seam]] is required rather than a nicety, and this run is why.

### One path string, two trees

`.se/HANDOVER.md` reads through the file lane at 148 lines. The same string in
the shell answers PathNotFound, because the shell is in the worktree and the
file lane is at the machine root.

The lint answered the same way earlier the same day, against
`.worktrees\i27-...\.se\HANDOVER.md`.

That is [[raid-risk-a-write-lands-in-the-wrong-tree-silently]] happening, on
this machine, today. Not a worry about the future.

### The bypass surface, counted

- 40 call sites of `resolveForRead` / `resolveInRoot` / `resolveDeclaredRoot`,
  across 9 files.
- 88 sites building a path with `join(root, ...)`, across 37 files.

The dispatch layer is nearly centralised already: `tools.ts` has 7 resolver
calls against 1 direct join. The leaks are modules that read the filesystem
for themselves. `lint.ts` imports `readFileSync` and `join` from node and
calls no resolver, which is exactly why it answered against the wrong tree.

## What it settles

THE SEAM IS ACHIEVABLE and the work is bounded. Route the modules that read
for themselves through the resolver, and the shell needs no rule at all
because it is a child.

WHAT IT DOES NOT SETTLE. No satellite exists, so nothing here tests a seam
running in two processes at once. That half rides with the build.
