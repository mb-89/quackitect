---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: req-the-full-battery-runs-where-the-method-says
type: "[[requirement]]"
statement: While a walk is under way, the engine shall refuse an agent-initiated full battery outside the verification state, and shall answer a scoped run without the caller asking again.
kind: functional
verify_method: test
breaks_if_removed: The agent decides when the whole suite runs, and the row saying the engine owns it is a sentence nothing enforces.
breaks_how_badly: crippling
refines:
  - uc-answer-a-question-with-tests
source_refs:
  - "M7_50_verification: filled_by engine, the one place the full battery runs, its verdict records itself"
  - "measured 2026-08-16: 494 se_test calls produced 66 verdicts, and 5 full batteries ran against a designed maximum of 2"
  - raid-dec-blocking-and-the-battery-refusal-ship-together
  - req-test-scope-discipline
  - req-test-run-carries-its-question
priority: must
---

## Detail

THE ROW ALREADY SAYS THIS AND NOTHING ENFORCES IT. M7_50_verification reads
`filled_by: engine`, calls itself "THE ONE PLACE the full battery runs", and
says the battery "carries no field: it runs mechanically and its verdict
records itself". fix-findings allows exactly one more, "the single confirm
run".

TWO RUNS PER ITERATION IS THE DESIGN. Five ran on 2026-08-16, every one on the
agent's own judgment, none of them sanctioned by any row.

## The two halves are one demand

THE REFUSAL WITHOUT THE ANSWER strands the waste: 494 calls for 66 verdicts
stays 494 calls.

THE ANSWER WITHOUT THE REFUSAL makes it worse. Today the polling is an
accidental deterrent — a battery costs a handoff plus ten calls of watching,
and that cost is part of why five ran rather than fifty. Making the call
instant removes the deterrent and leaves the judgment that was already wrong
five times.

SO THEY ARE ONE ROW. raid-dec-blocking-and-the-battery-refusal-ship-together
records the same ruling on the register.

## What stays free

A SCOPED RUN ANSWERS A QUESTION ABOUT A CHANGE and the build discipline asks
for it. Nothing here discourages one; the second clause makes it cheaper, by
answering rather than handing back a job to be polled.

## Behaviour

No model wanted. Two invariants: an agent-initiated full battery outside
verification refuses and names where it belongs, and a scoped run returns its
verdict to the caller that asked for it.
