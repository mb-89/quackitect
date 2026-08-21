---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: tsp-a-walk-opens-each-step-by-naming-the-hand-it-needs
type: "[[test-spec]]"
statement: An engineer opens a record without choosing a model for it, and a step opens by naming the hand its own work needs — a rung and the pair it came from, never a model.
method: demonstration
demonstrates:
  - sty-the-machine-picks-the-hands
verifies: "none — demonstrates carries the edge; the requirements behind this story are verify method test and inspection and are carried by the three sizing specs named in the Scope below"
files:
  - none — a demonstration is observed rather than instrumented, and the Procedure below is the whole definition
---

## Scope

THE FORWARD HALF OF THE ITERATION, END TO END: nobody names a model, and the
machine names one anyway — as a class rather than as a product name.

WHAT SEPARATES THIS FROM ITS THREE UNIT SPECS. Each of those holds one link:
the cell declares, the compile carries, the block answers, the pull publishes.
None of them walks the whole chain with a real session, and the chain is what
the story promises.

OUT OF SCOPE: whether the named hand is the RIGHT one. That is a judgement
about a rating, and no observation settles it.

ALSO OUT OF SCOPE: the delegation happening. This shows the record a delegation
leaves, not a walker deciding to make one. Nothing in the build compels one, and
`raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it` stands.

## Approach

OBSERVED, NOT INSTRUMENTED. The pass is what somebody reading the run's output
can tell, which is why it is a demonstration and not a test.

IT RUNS AGAINST MODULES BUILT FROM THE CODE UNDER TEST, and that is the
condition most likely to be got wrong. A long-running lane server predating the
build does not know the new arguments exist, and a run against it shows the
feature absent — which is indistinguishable from an unrated matrix, so it reads
as a pass.

ONE CELL IS RATED BY HAND FOR THE RUN. The shipped matrix carries no ratings,
so a demonstration that skipped this would show a pull with no field and prove
only that the field is optional.

## Procedure

WHAT IS DONE, in order, and what is watched for at each step.

- RATE ONE STEP. Put `<column>_complexity: C4/R1` on one matrix row, in the
  column the record will be pinned at. WATCH FOR: the matrix loading without
  complaint, and every other row staying unrated.
- OPEN A RECORD AND PIN ITS COLUMN. WATCH FOR: no model named anywhere — not
  on a command line, not in the seed, not in the pin. That absence is the
  story's whole premise and it has to be observed rather than assumed.
- WALK INTO THE RECORD AND REACH THE RATED STEP. WATCH FOR: the walk arriving
  at that step by the ordinary route, with no aiming past a gate.
- READ THE PULL. WATCH FOR: a `hand` field carrying a RUNG from the published
  vocabulary and the PAIR it was derived from. A model name here is a failure,
  and so is a rung with no pair beside it — the pair is what lets a reader
  disagree with the rung and still use the answer.
- READ THE PULL AT AN UNRATED STEP. WATCH FOR: no field at all, no refusal
  reaching the agent, and the walk carrying on. A fallback to whatever is
  running is the failure this step exists to catch, and it would look like
  success.
- FILE A DELEGATED CALL. Send `as` naming the author, `relayed_by` naming
  the filer, and an answering model. WATCH FOR: the record carrying the
  AUTHOR'S part with the filer beside it, and `claimed` naming the two values
  the server cannot see for itself.

## What a reader should be able to say afterwards

THAT NOBODY CHOSE A MODEL AND A HAND WAS NAMED ANYWAY. That is the sentence the
story is about, and a report that does not let a reader say it has not
demonstrated this.
