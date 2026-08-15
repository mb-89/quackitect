---
minted_in: i27
id: opt-a-records-work-lives-in-a-worktree-on-disk
type: "[[option]]"
statement: keep a record's working copy in an ordinary worktree on durable storage, so every tool a person already uses can see it and nothing is lost when a process dies
cluster: cluster-the-walk
question: where a record's working files live while it is open
found_by: heuristic
source: "what stands today — one worktree per record under .worktrees, on the machine's own disk"
---

## Mechanism

A worktree on disk. Reads and writes go through the file system. The editor,
git and the person's own tooling all see the same files the engine does.

## Why it is on the chart

A ROW WHOSE ONLY ANSWERS ARE NEW MACHINERY IS A ROW NOBODY CHECKED AGAINST
THE BASELINE. This is the baseline, it costs nothing to build, and every
drawn line takes it today.

## What it buys, and it is more than inertia

DURABILITY BY DEFAULT. A crash loses nothing that was written. req-crash-
lands-safe and req-no-agent-act-destroys-work are standing musts, and this
answer meets both without designing anything.

VISIBILITY BY DEFAULT. req-a-surface-resolves-to-what-it-shows wants a person
to open what they are looking at. Files on disk can be opened.

AND THE READS ARE ALREADY IN RAM. Windows caches file content and metadata in
standby memory, and standby RAM is as fast as empty RAM, so a second read of
a small file is a memory read whatever the volume underneath.

## What it costs

WRITE AND METADATA CHURN goes to the file system and its journal. That is the
one place a memory-backed answer is genuinely faster, and nobody here has
measured how much of the walk is spent there.
