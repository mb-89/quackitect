---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-asm-one-scoring-pass-is-enough-to-eliminate
type: "[[raid]]"
kind: assumption
statement: A single scoring pass by one spawned agent is accurate enough to remove a candidate from the set for good.
owner: the driving agent
trigger: any M4 evaluate-set whose front is narrower than three, and any elimination that a later milestone wants back
status: open
impact: A candidate leaves the set on a score that a second reader would have put one band higher. Nothing downstream can recover it, because M5 composes from the front and never revisits the eliminated.
breaks_how_badly: abrasive
how_likely: plausible
probe: "probed for this iteration and it holds here. The eliminated candidate needs a two-band swing to re-enter, which is larger than the anchors' own ambiguity. Not probed for the general case."
probed: "2026-08-15"
source_refs:
  - meth-scoring-anchors
  - meth-set-based-pareto
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

TAKE THE ELIMINATED CANDIDATE AND ASK HOW FAR IT IS FROM SURVIVING. A candidate
survives when nothing beats it on every axis, so it needs to beat its nearest
rival on at least one.

RUN THAT ARITHMETIC FOR THIS ITERATION.

- The eliminated candidate scored 1, 3, 2.
- Its nearest rival scored 2, 4, 3.
- To survive it needs a gain of two bands on some axis, or a loss of two by
  the rival.

TWO BANDS IS LARGER THAN THE ANCHORS' AMBIGUITY. The pairs that plausibly blur
are 1 against 2, and 3 against 4, and each is one band. So a single misread
cannot reverse this elimination.

WHAT WOULD FALSIFY IT: an elimination that turns on a ONE-band gap. There the
assumption gives no margin at all, and a second scorer is owed before the
candidate is dropped.

## Where the smell came from

THE METHOD ALREADY DISTRUSTS THE BUILDER. It spawns a separate agent with a
clean context precisely because the composer cannot score their own work.

IT STOPS ONE STEP SHORT. Having established that one reader is biased, it
accepts one reader as sufficient. Nothing in the method says why a second
would not change an answer.

THE MARGIN IS THE ANSWER, NOT THE COUNT. A wide gap needs one reader and a
narrow one needs more, which is cheaper than a second pass every time.

Nothing has gone wrong yet. This iteration's margin is wide.
