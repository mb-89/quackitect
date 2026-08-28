---
unreachable_citations:
  - scratchpad/demo-doors.mjs
minted_in: i37-training-iterations-a-disposable-iterati
id: tsp-every-door-to-the-future-closes-while-a-run-is-bound
type: "[[test-spec]]"
statement: "From inside a bound run, every door to the future is shut by the lane itself — the git objects are absent and the previous reports are refused or omitted — and every one reopens when the run closes."
method: "demonstration"
demonstrates:
  - "sty-walk-a-past-tree-without-reaching-its-future"
verifies: "none — demonstrates: carries the edge; the requirements behind this story are verify_method: test and are carried by the test-method specs beside it"
files:
  - "none — a demonstration performed against this repository's own archive; what it observes is a run, not a file"
---

## Scope

EVERY DOOR, TRIED FROM INSIDE A BOUND RUN. Both halves matter: the git half,
where the future simply is not there, and the lane half, where the previous
runs' numbers are refused.

AND THE REOPENING. A mask that is always on satisfies half the requirement and
breaks the system, so the unbound case is part of the demonstration rather than
a footnote.

## Procedure

Performed 2026-08-20 via `scratchpad/demo-doors.mjs`, with a previous
run's report planted so the concealment had a subject to hide.

1. Bind a run and OBSERVE `isBound` is true.
2. Ask the bound tree to resolve HEAD — a commit made long after the rewind
   point. OBSERVE it does not resolve.
3. Ask it to resolve the rewind point itself. OBSERVE it does, so the tree is
   not merely empty.
4. OBSERVE the control: a neighbouring iteration's files ARE present.
5. Read a previous report through the lane. OBSERVE it REFUSES, and the
   refusal names `se_benchmark {stop: true}` as the remedy.
6. Search, glob and list over the same folder. OBSERVE zero, zero, and absent.
7. OBSERVE the covered call-site count is asserted, so a verb added later fails
   rather than escaping silently.
8. Close the run. OBSERVE all four doors reopen.
9. OBSERVE a path that merely RESEMBLES a reports path was never concealed —
   the rule is a rule, not a substring.

## What the run showed, 2026-08-20

    HEAD resolves in the tree      false
    rewind point resolves          true
    control: neighbour present     true
    read of a report               REFUSED — SE-C-102
    search hits in benchmarks      0
    glob over benchmarks           0
    list names benchmarks          false
    call sites covered             4

    with the run closed:
    read of a report               LANDS
    glob over benchmarks           1
    resembling path concealed      false

## Known limit of this demonstration

WHAT WAS DEMONSTRATED IS THE MECHANISM, not an agent's experience of it. The
doors were tried by a script. Whether an agent NOTICES they are shut — and
whether it wastes calls discovering that — is a different question and a better
one, and it needs a real walk.
