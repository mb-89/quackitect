---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: tsp-one-operation-reads-its-input-once
type: "[[test-spec]]"
statement: One operation reads its corpus once and hands it down, verified by test over the door's own meter rather than by a stopwatch.
method: "test"
verifies:
  - "req-one-operation-reads-its-input-once"
files:
  - "tests/drift.test.ts"
---

## Scope

Whether the cost of an operation follows the work it does or the number of
times it asks for its input. The green walk is the case in hand, because it is
the operation that reads the most and the one on the driver's critical path.

## Approach

THE METER, NOT THE STOPWATCH. `doorStats()` in engine/notes.ts counts asks at
the door: entries held, served from held, read from disk. A timing assertion
would pass on a fast machine and fail on a slow one while measuring neither the
work nor the asks.

THE ASSERTION IS A SHAPE, NOT A TUNED NUMBER. A constant gets raised the first
time somebody adds a state, and each raise looks reasonable. The property the
requirement actually names is that the collected input is HANDED DOWN, so the
test asks the same question twice inside one pass and requires the second to
cost zero asks.

WHY A TUNED BOUND WOULD HAVE MISSED THE ORIGINAL DEFECT. Stamping the corpus
took one ask from 312.9 ms to 4.3 ms. Any latency budget written before that
change would have gone green afterwards while the sixty-six asks per record
entry stayed exactly where they were.

## Steps

Every case in the referenced file is one step; the case name states its claim.
The load-bearing step: a second `recordDone` inside the same `GreenPass` asks
the door zero further times, with the first ask asserted non-zero so a test
that reads nothing cannot pass by accident.

WHAT THIS DOES NOT YET COVER, named rather than left blank: the asks made
across a whole lane call, as opposed to within one green walk. That needs the
boundary model milestone one owns, because there is no list of operations to
count against until the interfaces are nodes.
