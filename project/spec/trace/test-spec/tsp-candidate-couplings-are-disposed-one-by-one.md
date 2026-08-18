---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: tsp-candidate-couplings-are-disposed-one-by-one
type: "[[test-spec]]"
statement: An agent about to make a change gets a ranked list of couplings no edge names, and disposes of every one before the change ships.
method: demonstration
demonstrates:
  - sty-dispose-a-candidate-coupling
verifies: "none — demonstrates: carries the edge; the ranker's own mechanics are test-verified over tests/coupling-rank.test.ts"
files:
  - none — the procedure below is the definition, because the pass is that every candidate was disposed of, which only a reader of the dispositions can say
---

## Why this spec is being written by i33 rather than by i15

THE SAME REASON AS ITS SIBLING. The story is graded `must`, the acceptance
gate's slide law demands a demonstration spec for every must story, and this
story had none. i33 is the first walk to reach a gate with that law running.
Writing the spec claims nothing about what i33 built.

## Scope

One agent, one real change, one ranked candidate list, and a reader afterwards
checking that every candidate got a disposition.

WHY DEMONSTRATION AND NOT TEST. A test can assert that the ranker returns a
scored list, that it filters below the threshold, and that every candidate
handed in comes back as one pending row. `tests/coupling-rank.test.ts` does the
first two.

WHAT NO TEST CAN ASSERT is the story's actual pass line: that the agent went
through EVERY candidate rather than taking the top hit and moving on. That is a
behaviour over a whole change, and only a reader of the disposition rows can
say it happened.

## What is actually built, checked 2026-08-17

- `engine/disposition.ts:70` exports `rankCandidateCouplings`, which scores the
  whole corpus by BM25 against a plain-words change description.
- `engine/disposition.ts:86` exports `recordCouplingDisposition`, which stamps
  every candidate handed in as one `pending` row — no threshold band, no
  auto-classification, per raid-dec-i15-disposition-prepopulates-pending-rows.
- `tests/coupling-rank.test.ts` covers the ranker.

## What is missing

TWO THINGS, AND THEY ARE DIFFERENT SIZES.

A VERB, as with the query evaluator. Nothing in the lane reaches
`rankCandidateCouplings`, so the agent cannot ask for candidates mid-change.

A CALLER FOR THE SECOND FUNCTION. `recordCouplingDisposition` is called by
nothing at all — not by a verb, not by the engine, not by a test. It is a
function waiting for the walk that uses it.

## Procedure

1. THE AGENT IS ABOUT TO MAKE A REAL CHANGE and describes it in plain words.
2. IT ASKS FOR CANDIDATE COUPLED NODES.
   - PASS: a scored list comes back, not a single guess.
   - PASS: nothing below the threshold is proposed at all.
3. EVERY CANDIDATE IS DISPOSED OF, one at a time — real coupling, or not.
   - PASS: the disposition rows show no candidate left `pending` when the
     change ships.
   - FAIL: the agent handles the top hit and moves on. This is the failure the
     story exists to stop, and it is the only step that needs a demonstration.
4. A CANDIDATE TURNS OUT TO BE A REAL COUPLING NO EDGE NAMED.
   - PASS: it is handled inside the change.
   - THE COMPARISON: today that coupling surfaces in a red-team round or an
     incident, which is what the story's first slide describes.

## Its state, said rather than left blank

CANNOT RUN TODAY. Step 2 has no verb, and step 3 has no caller writing the rows
a reader would check.

WHOSE WORK IT IS has not been asked of the owner. i15 stands `status: open`
with both functions built and neither reachable, and this spec does not decide
whether the remaining hop belongs to i15 or to a later record.
