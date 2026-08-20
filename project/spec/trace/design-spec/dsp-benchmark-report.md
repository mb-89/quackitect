---
minted_in: i37-training-iterations-a-disposable-iterati
id: dsp-benchmark-report
type: "[[design-spec]]"
statement: "What survives a thrown-away run: cost per state derived from the call log, the conditions it was taken under, and where the walk actually stopped."
realizes:
  - el-benchmark-report
  - if-benchmark-binding-to-report
  - if-benchmark-guard-to-report
files:
  - project/deliverable/engine/benchmark-report.ts
  - project/deliverable/machines/items/benchmark-run.md
---

## Responsibility

THE RUN IS THROWN AWAY. THIS IS WHAT SURVIVES IT.

`.se/` is machine-local and a cloud box is reclaimed, so a result living only in
the call log did not happen. One committed node per run, and it is the only
thing this whole design commits.

## Interface

A `benchmark-run` ITEM TEMPLATE at `project/spec/benchmarks`. It is discovered
by being written: `engine/vocabulary.ts` scans the items folder with
`readdirSync`, so the template costs NO engine change.

## Behavior and constraints

WHAT IS DERIVED FROM THE CALL LOG. Time and lane calls per state, forms filled,
forms REFILLED after a refusal, refusals counted by clause, states visited and
re-entered. `engine/calllog.ts` already stamps `ts`, `tool`, `ok`, `outcome` and
`duration_ms` per dispatch, so timing needs derivation and export rather than
new capture.

ATTRIBUTION IS BY CARRY-FORWARD, and it is an inference rather than a record.
No call record carries a state. Every `se_pull` answer names its `where`, so the
log is walked in order and each call is attributed to the state the last pull
named. Its limits are on
`raid-asm-carry-forward-attribution-covers-every-call-between-two-pulls`.

WHAT CANNOT BE DERIVED, AND IS WRITTEN AT BIND TIME. The model, the reasoning
effort and the harness. No log holds them.

THE REPORT IS INCREMENTAL, and this is the one cell of the winner that ships
UNTESTED. A run that dies is the interesting one, so the report must exist
before the run ends rather than being assembled at the end.

TWO FIELDS THAT ARE NOT NUMBERS. Where the run was told to stop, and where it
actually stopped. Both are recorded even when equal, because a reader cannot
distinguish `reached the end` from `nobody recorded it` when one is omitted.

## Rationale

THE CONDITIONS STAMP CLAIMS MORE THAN IT KNOWS TODAY, and the design says so
rather than shipping the claim quietly.

`rigorMatrixContentHash` hashes `rigor_matrix/rows/*.md` and NOTHING ELSE —
probed 2026-08-20. Guidance, form templates, item templates, method cards and
the engine itself all change walk cost and none of them moves that hash. The
placeholder fix shipped during this iteration turned an unwalkable chain into a
walkable one and moved zero rows.

SO THE STAMP BECOMES A SET rather than one hash: matrix, guidance, forms, items,
methods, engine. `se_version` is already on every call record, so the engine
half needs no new capture. The rest is the same directory walk pointed at more
directories. Tracked on
`raid-asm-the-rigor-matrix-hash-identifies-what-changes-walk-cost`.

NEVER COMPARE TWO SINGLE RUNS. Tau-bench measured `pass^8` below 25 percent
against single-trial scores under 50 percent, so agents vary that much between
identical runs. The report carries a median over at least three runs with the
spread beside it, and compares only within one set of conditions.


## The two crossings this design carries

FROM THE BINDING. The three conditions no log holds — the model, the reasoning
effort, the harness — and the window the run occupied. The report reads nothing
else from the binding, which is what lets a report be written for a run that
died.

FROM THE GUARD. The outcome of the run's deliberately forbidden request. A
report without it IS NOT A RESULT: with a structural ceiling there is no guard
to catch failing, so the forbidden request is what proves the FETCH was right,
and a fetch nobody probed is indistinguishable from a correct one.
