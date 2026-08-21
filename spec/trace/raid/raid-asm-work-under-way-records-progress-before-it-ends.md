---
minted_in: i51-work-running-out-of-sight-reports-itself
id: raid-asm-work-under-way-records-progress-before-it-ends
type: "[[raid]]"
kind: assumption
statement: A piece of work that is still running has already recorded something about how far it has got, so a duration can be computed from it while it runs.
owner: the driving agent
trigger: the first report whose duration does not change between two asks made a minute apart
status: probed
probed: "2026-08-21, and it HOLDS more strongly than the assumption claimed. A run appends to .se/test-progress.jsonl line by line while it is going, and its first line carries the denominator."
probe: "Start a long run, wait, and read what has been written to the timing record while it is still going. If the file is empty or unchanged until the run ends, nothing is readable mid-run and the estimate has no input."
impact: "Every duration in the report is computed from what a piece of work has already done. If nothing is recorded until the work finishes, there is nothing to compute from and the honest answer is always that no estimate can be given."
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - req-a-time-remaining-names-its-basis
  - flow-work-under-way
  - flow-test-timings
  - i51
---

## Why it is open

The iteration's vision states the estimate as arithmetic over what a piece of
work has already done against what it has left.

That arithmetic needs a numerator that exists WHILE the work runs. Nobody has
checked that one does.

## Where it bites

`flow-test-timings` is described as recorded per run and kept across runs. Per
run leaves it open whether a case's line is appended as that case finishes, or
whether the whole record is written when the run ends.

If it is the second, a running battery has recorded nothing about itself, and
the only figure available is the previous run's total — which is what the
product already reports today, and what this iteration set out to replace.

## Why it is not the same as the first-run assumption

`raid-asm-a-first-run-has-timings-to-estimate-from` asks whether any HISTORY
exists on this machine. This asks whether the work in front of you has said
anything about ITSELF yet.

Both can be true, both can be false, and they fail differently. A machine with
plenty of history and a run that reports nothing mid-flight still has no
numerator.

## Probe

Start a long run. Wait. Read the timing record while the run is still going.

Two outcomes, both useful.

- Lines are already there for the cases that finished, and the arithmetic has
  its input.
- Nothing is there, and the design needs a different basis or an honest
  admission that none exists. A condition check already emits its own progress
  on its output, which is the nearest untried candidate.

## PROBED 2026-08-21 — IT HOLDS, AND THE INPUT IS BETTER THAN ASSUMED

A run was started and the record was read while it was still going.

WHAT WAS FOUND. `.se/test-progress.jsonl` is appended live. Read 15 seconds
into a run it already held 313 lines, with a modification time two seconds
old.

THE DENOMINATOR IS IN THE FIRST LINE:
`{"start":"2026-08-21T09:11:43.925Z","files_total":175,"cores":4}`.

EACH LATER LINE CARRIES ITS OWN ELAPSED CLOCK:
`{"file":"deliverable/tests/compare.test.ts","ms":1243,"t":12466}`.

THE ARITHMETIC WAS RUN ON IT, LIVE. At 26,062 ms elapsed, 49 distinct files of
175 had reported. That is 0.280 done, implying 93,079 ms total and 67,017 ms
remaining. A working time remaining, computed from data that already exists.

WHAT THIS CHANGES ABOUT THE DESIGN. The basis is the run's OWN progress, not
any history. `raid-asm-a-first-run-has-timings-to-estimate-from` asked whether
history exists and the answer was no; this probe says history is not needed.

AND THE STATUS VERB ALREADY SERVES IT. Asking a running job returned
`progress: {cases_done: 803, files_touched: 69, files_total: 175}` beside
`elapsed_ms: 39739`. The numerator, the denominator and the clock are all
already on the answer. What is missing is the division.
