---
form: supervisor-level
by: agent
signed_off: 2026-08-14T16:30:18.074Z
authors: agent
files:
---

# Evidence form / supervisor-level

## current_situation

`delta-compose` is signed. `overridesIn` names every file a record has changed in the machine it runs.

That list is what levelling has to deal with. A record holds overrides; trunk keeps moving under them.

Four cells exist in that table. Two axes: does the record carry an override, and has trunk moved. The fourth cell is the dangerous one — an override sitting on a trunk file that has since changed.

Without an act at entry, that cell composes a mixture nobody assembled. `req-entry-levels-the-record-tree` exists to prevent exactly that.

## built

`levelRecordTree(root, recordRel, git)` in `project/deliverable/engine/supervisor.ts`, lines 42 to 64.

It is START, and it is all-or-nothing. Four outcomes, in order:

- NO OVERRIDES — nothing to rebase. It returns level at once. Most records are this one, and trunk moving under them is not a conflict.
- REBASE FAILS — the record STOPS at entry. `conflict` carries git's own text, not a summary of it.
- COMMIT FAILS — also not levelled. All-or-nothing means the commit is part of the act.
- BOTH SUCCEED — level, and only then does anything serve.

WHY IT SITS AT START RATHER THAN MID-WALK. Nothing is in flight at a start. A partial levelling cannot be observed: the record either comes up level or does not come up.

THE GIT WORK IS INJECTED, through the `GitLane` interface at lines 13 to 18. Two methods: `rebase` and `commit`. That keeps the decision logic testable without a repository, and it leaves the real adapter to the process chunks that own a repository.

THE COST IS MEASURED, NOT ASSUMED. `exp-satellite-start` puts a start at 306.9 ms with engine module load included, against a one-second budget. That is affordable only because levelling happens when a RECORD OPENS and never inside a call.

Proof: `project/deliverable/tests/bound-engine.test.ts`, 15 of 15 green, test job `test-mst5vivp-1`.

Four of those cases are this chunk's, one per outcome:

- a record that overrides nothing levels with nothing to rebase
- entry levels the record's tree and rebases its delta before the first call
- a stale override stops the record at entry rather than composing a mixture
- a levelling that cannot commit is not a levelling

The third one is the authored red this chunk owed. The build plan names it: "supervisor-level: entry levels the tree, and a stale override stops the record."

The conflict test also proves the negative. Its `commit` stub throws, so a record that did not level and still committed would fail loudly rather than pass quietly.

## follow_up

The next chunk is `supervisor-watch`, which depends on this one. Its code already stands in the same file — `replaceComposition` and the `WATCH` numbers — and its form is owed.

NO LIVE CALLER EXISTS FOR `levelRecordTree` YET, and that is the plan rather than an omission. The build plan places the wiring in `satellite-process`, which roots a satellite in its record's tree. The plan says so in its own words: the seam, the delta and the supervisor each turn a red green on their own, and the processes turn none until all three stand.

THE REAL `GitLane` ADAPTER IS ALSO OWED BY `satellite-process`, for the same reason. A repository is what a process has and a unit test does not.

No notes parked from this chunk.

## anything_else

One boundary worth naming, so a reviewer does not credit this chunk with it.

`replaceComposition` and `WATCH` sit in the same file and are already written. They belong to `supervisor-watch`, not here.

This form claims levelling only. The rollback property and the three watch numbers are the next chunk's to claim, and their tests are in the same file waiting for it.
