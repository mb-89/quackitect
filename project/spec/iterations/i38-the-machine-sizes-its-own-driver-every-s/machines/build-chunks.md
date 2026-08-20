---
steps:
  - id: complexity-stays-out-of-the-ledger
    statement: "The failing test that guards three open records: a complexity change moves neither the demand digest nor the step shape, and a real change still moves both"
    depends_on: []
    realization: code
  - id: the-cell-declares-a-difficulty
    statement: "A matrix cell carries a two-part difficulty beside its applies value, per change-size column, and the loader refuses a missing one where the row applies and a present one on a row that seeds a sub-machine"
    depends_on:
      - complexity-stays-out-of-the-ledger
    realization: code
  - id: the-compile-carries-it-onto-the-step
    statement: "The compiled machine carries each cell's difficulty onto the state it compiles, so the sizing block reads a step and never joins against the matrix"
    depends_on:
      - the-cell-declares-a-difficulty
    realization: code
  - id: the-sizing-block-answers
    statement: "PROMOTED from exp-two-hands-rating-the-same-six-cells - a step in, a pair and a rung out, a unit no weaker than its hardest step with the spread alongside, and an unmatched rung returned as a value naming itself"
    depends_on:
      - the-compile-carries-it-onto-the-step
    realization: code
  - id: the-answer-rides-the-pull
    statement: "The published pair and rung sit on the pull beside the state and the tier, and nothing in the lane starts a process on account of them"
    depends_on:
      - the-sizing-block-answers
    realization: code
  - id: the-call-record-grows-three-fields
    statement: "PROMOTED from exp-can-anything-act-on-a-published-driver - the call record carries the answering model, the state the walk stood in and the part its caller played, all three in one edit, the two claimed ones marked"
    depends_on: []
    realization: code
  - id: the-role-vocabulary-separates-two-hands
    statement: "The closed role vocabulary can express the hand holding the walk and a hand it delegated to as different parts, refuses a value outside itself, and takes the part from the work's author rather than from the caller"
    depends_on:
      - the-call-record-grows-three-fields
    realization: code
  - id: the-log-answers-by-any-coordinate
    statement: "The log query groups by model, by state and by part, and a grouping key nothing carries is distinguishable from a grouping that found one bucket"
    depends_on:
      - the-role-vocabulary-separates-two-hands
    realization: code
  - id: a-weaker-walk-carries-its-reason
    statement: "A step walked below its named strength carries the stated reason, and where none was given it carries the mark saying so rather than being refused"
    depends_on:
      - the-log-answers-by-any-coordinate
      - the-answer-rides-the-pull
    realization: code
  - id: the-decision-repeats-and-shows-its-input
    statement: "The same inputs give the same rung in one process, across processes and in any order, and the published pair re-derives the published rung"
    depends_on:
      - the-sizing-block-answers
    realization: code
---

# The build drawing

TEN CHUNKS IN TWO CHAINS THAT MEET ONCE. The sizing chain runs from the ledger
guard to the pull; the account chain runs from the three fields to the log query.
They are independent until `a-weaker-walk-carries-its-reason`, which needs a
named strength from one and a record from the other.

## Why the ledger guard is first and alone

`req-the-complexity-value-is-read-live-and-never-pinned` is graded fatal and
wants one assertion. It guards three records that are open right now, and a
complexity leaking into a demand digest does not throw — it surfaces weeks later
as a cascade of reopened claims with no obvious cause.

IT IS ALSO THE CHEAPEST RED IN THE SET, which is why it goes first rather than
last. `gate-prototype` says so on its own face.

## The two promoted spikes and where they enter

`exp-two-hands-rating-the-same-six-cells` promotes a loader rule: a placeholder
row that seeds a sub-machine carries no difficulty of its own. Two readers agreed
on five of six sampled cells and both named the same one as their least-sure, for
the same reason. It enters at `the-sizing-block-answers` because that is where
the rule has to hold, and the loader half rides the chunk before it.

`exp-can-anything-act-on-a-published-driver` promotes the party itself: the
walking agent reads a published rung and acts on it by delegating. It enters at
`the-call-record-grows-three-fields`, because what the promotion actually
changes inside the box is that a delegated hand must be recordable — the
delegation happens outside.

## What fans out and what does not

THE TWO CHAINS ARE INDEPENDENT and can be built in parallel. Inside each chain
every edge is real: the loader cannot refuse a missing difficulty before a cell
can carry one, and the vocabulary cannot separate two hands before a part field
exists.

`the-decision-repeats-and-shows-its-input` hangs off the sizing block rather
than off the pull, because repeatability is a property of the answering and not
of the publishing.

## What is deliberately not a chunk

RATING THE 154 ACTIVE CELLS. The build makes a difficulty declarable and
refusable; it declares none. Rating them is the work the matrix owner does, and
doing it here would put fifty-three unreviewed judgements into the same commit as
the mechanism that reads them.

ANYTHING THAT SPAWNS. `req-the-machine-names-a-driver-and-starts-nothing`
forbids the lane being the party that acts, and the party that does act is a
neighbour that already exists.

MAINTAINING THE MODEL LIST. There is no list in this tree — the design publishes
a rung and holds no roster — and the maintenance role still has no node.
