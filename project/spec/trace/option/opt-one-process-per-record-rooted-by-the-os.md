---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: opt-one-process-per-record-rooted-by-the-os
type: "[[option]]"
statement: run one engine process per bound record with its working directory set to that record's tree, so the operating system resolves every relative path and the engine holds no rule at all
cluster: cluster-the-walk
question: which tree a path resolves to
found_by: without
source: "trimming — what if resolve-a-path does not exist, and who does its job then; the answer is THE ENVIRONMENT"
---

## Mechanism

The engine stops deciding. A process is started in the record's tree, and
every relative path resolves by the same mechanism every program on the
machine already uses.

WHO TAKES THE JOB OVER: the environment. The third of meth-trimming's four
outcomes, and the one that means we were reimplementing something that
already exists and is better tested than anything we would write.

WHAT IT INHERITS FOR FREE. The shell hole closes without a rule, because
se_run's child inherits the working directory. That hole is currently open
by construction - SE-C-134 guards five write verbs and cannot watch a shell.

WHAT IT BREAKS. The mirror, the claim ledger and the note inbox are
machine-wide and single. Several engine processes would each want them, so
the session state has to move out to one owner or be shared, and neither is
free.

AND IT COLLIDES WITH THE SELF-HOSTING EXCEPTION. raid-asm-engine-serves-from-
the-bound-tree asks whether an engine loaded from trunk can serve a bound
tree. Per-process rooting answers that question by making it moot for every
product except this one, which still edits its own engine while running it.

WHAT IT COSTS. Process management, and a walk that spans two records needs
two processes talking. Against that: zero new resolution rules, and the one
mechanism nobody has to test because the platform did.
