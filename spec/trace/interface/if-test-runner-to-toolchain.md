---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: if-test-runner-to-toolchain
type: "[[interface]]"
statement: The battery and the linters run out here, and their verdict is the only thing that comes back.
source: el-test-runner
destination: nbr-toolchain
carries:
  - flow-toolchain
  - flow-battery-verdict
  - flow-test-timings
form: child process
bound: not one second, and it says so
source_refs:
  - "i33 model-the-boundaries: the outside edges the element matrix never drew"
---

## What crosses

- the scripts the battery runs: biome, the preflight, the selftest, the sweep
- the verdict, with its TAP summary and per-file timings

## Measured 2026-08-17

The full battery runs 1399 cases in about 58 seconds wall, measured eight
times today with a spread of roughly 57 to 67 seconds. The sweep inside it
takes about 400 ms of that.

THAT IS THE BOUND BEING HONOURED, NOT MISSED. A minute is what this crossing
costs, it says so, and it reports cases done while it runs.

## The bound is deliberately NOT one second

A FULL BATTERY IS 1399 CASES AND RUNS ABOUT A MINUTE. Demanding a second here
would either be ignored or met by running less, and running less is the trade
this system exists to refuse.

SO THIS EDGE TAKES THE HONESTY HALF, whole. It blocks and answers, it reports
progress in cases done while it runs, and it hands back a verdict rather than a
handle nobody observes. That is why the contract says a scoped run has nothing
to poll.

## The gap this edge exposes, named rather than left

THE SCOPED RUN IS UNREACHABLE FOR ENGINE WORK. se_test decides its own scope
and said why, on every run this session: sixty-eight changed files have no test
that answers for them, and every one is an engine file. So any engine change
forces the full battery.

THE MISSING EDGE IS FILE TO TEST. The trace already carries design specs
claiming their `files:`, which is what the dead-code sweep walks. Nothing maps
a source file to the test that answers for it, so the scope decision has
nothing finer to choose.
