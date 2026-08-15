---
minted_in: i12
id: req-scoped-run-records-its-timings
type: "[[requirement]]"
statement: When a scoped test run completes, the engine shall record each case's file, name and duration to the timings log.
kind: functional
verify_method: test
breaks_if_removed: A file can only be timed inside the battery, where about twenty files run at once, so no measurement can separate a case's own work from its queueing.
breaks_how_badly: corrosive
refines:
  - uc-answer-a-question-with-tests
source_refs:
  - raid-asm-battery-timings-measure-work
  - i12
priority: must
---

## Detail

The battery already does this. `engine/bin/selftest.ts` attaches two
reporters: the spec reporter for the human output, and
`test-timings.mjs`, which writes one record per case to
`.se/test-timings.jsonl`.

The scoped path does not. `engine/tools.ts` builds its own argv carrying
`--test-reporter=tap` and nothing else.

THE DATA IS ALREADY IN THE STREAM. Node's TAP output carries
`duration_ms` per case. A failing case in this record's own walk came
back reading `duration_ms: 454.6437`, from a scoped run that recorded
nothing.

So the demand is that the engine keep what it is already handed. Which of
the two mechanisms it uses is design, not demand.

| what is recorded | where the battery puts it |
| --- | --- |
| the file | `.se/test-timings.jsonl`, one JSON line per case |
| the case name | the same line |
| the duration in ms | the same line |
| the pass or fail | the same line |

A scoped run's records must be readable beside the battery's, because
the whole point is comparing one against the other.

## Why it is a must

Every other demand in this record is aimed by a ranking, and the ranking
is built from battery numbers alone. Until a file can be measured on its
own, no fix in this iteration can be shown to have helped.
