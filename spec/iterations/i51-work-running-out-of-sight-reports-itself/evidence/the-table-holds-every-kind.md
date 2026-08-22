---
form: the-table-holds-every-kind
by: agent
signed_off: 2026-08-21T11:13:21.472Z
authors: agent
files:
---

# Evidence form / the-table-holds-every-kind

## current_situation

Two tables stood on disk and neither could see the other. `.se/jobs` held the shell jobs and `.se/test-jobs` held the test runs, measured at 35 entries against 1 on 2026-08-21.

ONE TABLE NOW ANSWERS FOR BOTH. `jobList` reads the test runs' own records beside the shell jobs, and every entry says which kind it is.

AN ENTRY CARRIES WHAT THE DESIGN ASKED FOR: its kind, its identity, when it started, the state it belongs to, where its progress is written and the total that progress divides into.

A FINISHED TEST RUN NOW REPORTS HOW LONG IT TOOK rather than how long ago it started. Nothing recorded when a verdict landed, so a settled run's duration grew for ever.

## built

THREE FILES CHANGED, plus one ceiling raised.

`deliverable/engine/run.ts` — `JobView`, `Job` and `PersistedJob` gain `kind`, `state`, `progress` and `total`. A new `testOperations` reads a test run's own record back as an operation. `jobList` merges both folders. `startJob` takes the new fields as options, defaulting the kind to shell. A record written before this table existed reads back as a shell job rather than throwing.

`deliverable/engine/tools-run.ts` — `batteryPace` becomes `batteryRecord` and returns the wall AND the file count from the one read it already made. A test job's record gains `ended`, written when the verdict lands, and `total`.

`deliverable/tests/files.test.ts` — the direct-read ceiling goes from 117 to 118, with the reason the check itself asks for: a job record is not a note, it has no door, the read wants one JSONL line of machine-local state, and it sits beside `persisted()` in the same file doing the same thing for the other kind.

MEASURED, 2026-08-21: 1722 cases ran, 1719 passed. The three failures are this record's own reds for the handback and for the basis, which later chunks turn green. The typechecker is clean and biome checked 352 files with no fixes.

THE ACCOUNT'S FIRST CASE WENT GREEN. `one call lists every kind of work out of sight, not just the shell kind` was written red at author-tests and passes now.

## follow_up

TWO CHUNKS FAN OUT FROM HERE and neither waits for the other.

`the-account-answers-in-one-call` takes the finished side: an operation stays in the list with its outcome so a caller that missed the moment still learns what happened.

`the-leaving-judgment-stops-holding-the-call` takes the handback and is the load-bearing one. The `state` field this chunk added is what its settle path needs, and it is the whole of the dependency between the two strands.

THE FIGURE COMES AFTER THE ACCOUNT. `the-figure-carries-its-basis` is what turns the second account case green, and it now has a `total` and a `progress` path to work from.

## anything_else

THE TEST RUNS' RECORDS WERE LEFT IN THEIR OWN FOLDER rather than migrated, and that is a choice worth stating.

A rewrite would have had to move every run already on disk, and a half-migrated folder is worse than two folders one reader knows about.

WHAT MATTERS IS THAT ONE CALL ANSWERS. The caller sees one list; where the lines are written is realization, and `dsp-the-work-account.md` says so.

ONE THING THE RUNNING ENGINE CANNOT SHOW YET. The lane server holds the previous code in memory, so `se_run {jobs: true}` still answers from the old listing until a reload. The tests read the source fresh, which is why they can prove the change and the live lane cannot.
