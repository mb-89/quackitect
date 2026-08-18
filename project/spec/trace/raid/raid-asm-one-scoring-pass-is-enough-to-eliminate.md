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
how_likely: expected
probe: "FALSIFIED in i16 on 2026-08-18, on this entry's own stated terms. It held in i28, where the margin was two bands. i16's elimination turned on ONE band and the second pass reversed it."
probed: "2026-08-18"
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

This entry was written in i28, whose margin was wide.

## FALSIFIED IN i16, 2026-08-18

THE NAMED FALSIFIER FIRED. This entry says it plainly: "an elimination that
turns on a ONE-band gap. There the assumption gives no margin at all, and a
second scorer is owed before the candidate is dropped."

i16's ELIMINATION TURNED ON EXACTLY ONE BAND. The incumbent held 5 on whether
method reuse is vendoring; its nearest rival held 4. Nothing could dominate it
while that cell stood.

A SECOND PASS MOVED THAT ONE CELL AND THE FRONT CHANGED. The first scorer had
written 22 cells at 4 or 5 with no named comparison, which the anchors forbid
outright. Sent back with the naming rule enforced, it brought nine cells down,
including that 5 to a 4. The lead vanished and domination followed in the same
pass.

## What it got wrong, precisely

THE FAILURE RAN THE OTHER WAY FROM THE ONE THIS ENTRY GUARDS. Its stated impact
is a candidate leaving the set on a score a second reader would have raised. What
happened is a candidate STAYING in the set on a score a second reader lowered.

SO THE RISK IS SYMMETRIC AND THIS ENTRY SAW ONLY HALF OF IT. A single pass can
wrongly keep as easily as it can wrongly drop, and wrongly keeping is worse
here: M5 composes from the front, so a survivor that should not be there gets
real work spent on it.

## The margin is not the whole answer either

THIS ENTRY'S OWN REMEDY IS "THE MARGIN IS THE ANSWER, NOT THE COUNT" — a wide
gap needs one reader, a narrow one needs more.

THAT IS STILL RIGHT AND IT IS NOT SUFFICIENT. The margin cannot be read until
the scores exist, and the scores are what is in doubt. In i16 the apparent
margin was one band on the incumbent and comfortable everywhere else, so a
margin check would have called for a re-score of one row rather than the 22
that actually needed it.

WHAT ACTUALLY CAUGHT IT was a rule the anchors already carry and nothing
enforced: no named comparison, no score above 3. Nine cells failed it.

## What should happen

- THE SUBMIT SHOULD REFUSE a score table carrying a 4 or a 5 with an empty
  prior_art cell. The rule is written in the guidance and nothing checks it.
  note-9c904fe90b17 carries this.
- THE MARGIN CHECK STAYS, as this entry proposed, but it is the second line of
  defence rather than the first.

EVIDENCE: iterations/i16 evidence evaluate-set, the scores table and the
elimination paragraph of the reading.
