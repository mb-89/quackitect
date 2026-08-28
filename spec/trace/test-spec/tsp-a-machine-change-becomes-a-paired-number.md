---
unreachable_citations:
  - scratchpad/demo-benchmark.mjs
minted_in: i37-training-iterations-a-disposable-iterati
id: tsp-a-machine-change-becomes-a-paired-number
type: "[[test-spec]]"
statement: A run against a real archived iteration binds, stands a rewound tree, records every condition, and closes saying where it actually ended — so a paired number becomes reachable where before there was none.
method: demonstration
demonstrates:
  - sty-know-whether-a-machine-change-helped
verifies: "none — demonstrates: carries the edge; the requirements behind this story are verify_method: test and are carried by the test-method specs beside it"
files:
  - none — a demonstration performed against this repository's own archive; what it observes is a run, not a file
---

## Scope

ONE RUN, END TO END, against this repository's own archive rather than a
fixture.

WHAT IS DELIBERATELY OUT. Whether a machine change is GOOD. That needs two runs
on two machine versions and this demonstrates one. The story asks for a paired
number instead of a feeling; what one run shows is that the pair is reachable.

## Procedure

Performed 2026-08-20 via `scratchpad/demo-benchmark.mjs`.

1. Ask for a run with no iteration named. OBSERVE: it refuses, naming the
   cause — the cycling pick has no commit saying it started, so the history
   cannot be cut. A refusal at bind is the design's own law working.
2. Name an iteration that can bind. OBSERVE: the rewind point resolves to the
   parent of the commit that named it started.
3. OBSERVE the tree stands and the positive control passes — an older
   iteration's files are present, so an empty fetch cannot pass as a rewind.
4. OBSERVE every one of the ten conditions recorded, including `stamp_covers`
   carrying six directories rather than the matrix hash alone.
5. Close the run. OBSERVE `stop_at` and `ended_at` both recorded and DIFFERENT,
   with `reached_the_end: false` — the honest answer, not an omission.

## What the run showed, 2026-08-20

BOUND against i33 at `20abd831`, control ran, change_size `minor`, se_version
`6.0.0`, and the three host conditions recorded from the environment.

CLOSED with `{"stop_at":"shipped","ended_at":"run-demos","reached_the_end":false}`.

## Known limit of this demonstration

IT DROVE THE FUNCTIONS, NOT THE VERB. The lane server in that session predated
`se_benchmark`, and `se_reload` is not legal at run-demos. So what is
demonstrated is that the mechanism works, not that an AGENT can start a run —
which is the weaker half in exactly the place a reader wants it strongest. The
verb's registration is evidenced separately by the trace-coverage enumerator,
which counts it, and by the typecheck.
