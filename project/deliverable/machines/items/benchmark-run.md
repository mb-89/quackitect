---
kind: item-template
name: benchmark-run
folder: benchmarks
statement: One benchmark run, as the only thing that survives it.
fields:
  - field: iteration
    hint: the archived iteration this run re-walked
  - field: rewind
    hint: the commit the history was cut at — the parent of that iteration's started commit
  - field: change_size
    hint: the column the run was pinned to, which is the scale factor and part of the result's name
  - field: rigor_matrix_hash
    hint: the matrix stamp — necessary and NOT sufficient on its own, see stamp_covers
  - field: se_version
    hint: the engine version, from the call log's own stamp
  - field: harness
    hint: which agent harness drove the walk
  - field: model
    hint: which model drove it
  - field: effort
    hint: the reasoning effort it ran at
  - field: stop_at
    hint: where the run was TOLD to stop — the whole walk by default
  - field: ended_at
    hint: where it ACTUALLY ended, recorded even when it equals stop_at
---

# benchmark-run — what survives a thrown-away run

Lives in `project/spec/benchmarks/`. THE RUN IS DISCARDED AND THIS IS NOT.

`.se/` is machine-local and a cloud box is reclaimed, so a result living only
in the call log did not happen.

## What it measures, and what it cannot

IT MEASURES THE MACHINE'S DRAG. Time and lane calls per state, forms filled,
forms refilled after a refusal, refusals by clause, states visited and
re-entered.

IT CANNOT MEASURE QUALITY. A re-walked iteration has no live subject to decide
about, so nothing here tells a good decision from a bad one. That limit is
written on every report rather than left to be discovered.

THE NUMBER IS A FLOOR, NOT AN ESTIMATE. The agent is TOLD it is walking a
benchmark, by the owner's honesty ruling. So the figure describes process
overhead under observation and never production behaviour.

## Never compare two single runs

Tau-bench measured function-calling agents at `pass^8` below 25 percent against
single-trial scores under 50 percent. Agents vary that much between identical
runs.

REPORT A MEDIAN OVER AT LEAST THREE RUNS with the spread beside it, and compare
only within one set of conditions.

COMPARE A RUN TO THE SAME ITERATION'S ORIGINAL WALK, and to nothing else. There
is no cross-iteration ratio here, by owner ruling.

## The stamp is a set, not one hash

`rigor_matrix_hash` covers `rigor_matrix/rows` and nothing else. Guidance, form
templates, item templates, method cards and the engine all change what a walk
costs without moving it.

SO `stamp_covers` NAMES EVERY DIRECTORY the conditions actually cover. A report
that stamped the matrix alone would call two runs comparable across exactly the
changes this project makes most often.

## The template

```skeleton
---
# The engine writes id and the type link.
iteration: TODO — the archived iteration re-walked
rewind: TODO — the commit the history was cut at
change_size: TODO — patch | minor | major | product | specification
rigor_matrix_hash: TODO
se_version: TODO
harness: TODO
model: TODO
effort: TODO
stop_at: TODO — where the run was told to stop
ended_at: TODO — where it actually ended
---

## Per state

<!-- calls, milliseconds, forms filled, forms refilled after a refusal,
refusals by clause, times entered. Derived from the call log by the
carry-forward rule; nothing here is typed by hand. -->

## Against the original

<!-- The same iteration's own first walk, state by state. This is the only
comparison the design makes. -->

## The forbidden request

<!-- One deliberately forbidden request per run, and its outcome. A run whose
forbidden request SUCCEEDED is discarded rather than reported. -->

## What this cannot say

<!-- Process overhead under observation. Never production behaviour, and never
the quality of any decision the walk made. -->
```
