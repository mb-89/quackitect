---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: raid-dec-a-must-outranks-a-score
type: "[[raid]]"
kind: decision
statement: A demand graded `must` outranks every score. A candidate failing one is out, whatever it ranked.
owner: the owner
status: decided
decided_via: "owner ruling 2026-08-14"
impact: It settles which of two answers decides a design milestone when the scoring and the demands disagree, and it makes the demand check a build rather than a convention.
breaks_how_badly: fatal
how_likely: conceivable
source_refs:
  - "owner ruling 2026-08-14: I think a must outranks the score. We don't need to discuss this. A must is not an option."
  - meth-derive-criteria
  - note-f66b607c729f
---

## The decision

A `must` is not an option. A candidate that fails one is out of the
comparison, whatever it scored on every axis.

## Why it needed deciding at all

THE METHOD ALREADY SAID IT and nothing enforced it. meth-derive-criteria
states that a must is a demand rather than a criterion and gates every
candidate pass or fail at the candidates gate. The check has never been
built, so every gate ran it by hand in prose.

WHAT THAT ALLOWED, measured in i27 on 2026-08-14: a convergence matrix
computed a stable leader across two data and six passes, and that leader
failed a fatal demand. The arithmetic could not see it, because a demand
appears in no scored column by construction.

SO TWO ANSWERS STOOD AT ONCE and the method had no rule for choosing between
them that anybody had implemented.

## What follows from it

THE DEMAND CHECK IS A BUILD, not a convention. Until it exists, a milestone
can compute a winner that is not eligible and nothing refuses it.

A VERDICT ON A DEMAND IS EVIDENCE, and it wants the same discipline as any
other claim: the sentence it rests on, in the record it is about. A verdict
with no quote can only be `not answered`. That rule exists because a verdict
was carried between two candidates on the strength of a shared pick, and the
borrowed verdict read exactly like a derived one.

AND A DEMAND THAT IS OVERRULED IS DOWNGRADED IN THE SAME BREATH. Overruling
one and leaving it standing as a `must` is worse than either choice, because
the next milestone reads it as binding and it is not.

## Rejected options

THE SCORE OUTRANKS THE DEMAND. Rejected. It makes a `must` a heavy `should`,
and a design can then buy past an absolute rule by doing well elsewhere -
which is the exact failure that keeping demands out of the scoring exists to
prevent. It also makes the grade meaningless: nobody could tell from a
register which rows actually bind.

CASE BY CASE, AT EACH GATE. Rejected. It is what happens today, and today is
what produced two standing answers with no rule between them. A judgment made
fresh at every gate is a judgment nobody can predict or check, and this
milestone made it four times without noticing it was making it.

WEIGH A DEMAND AS A VERY HEAVY AXIS. Rejected, and it is the tempting one. It
keeps one number and looks rigorous. It fails on the same ground as the
first: a heavy axis is still purchasable, and the weight becomes the argument
instead of the rule.

DROP THE MUST GRADE ENTIRELY and score everything. Rejected. Some rules are
not preferences - a write landing in the wrong store is not a low score, it
is a broken product. A grade that cannot express that is missing a kind.

## Consequences

WHAT THIS BINDS FROM NOW ON.

- A CANDIDATE FAILING A `must` IS OUT OF THE COMPARISON, at every milestone,
  whatever it ranked. No milestone may report it as a winner with a caveat.
- THE DEMAND CHECK BECOMES A BUILD. Until it exists, every gate runs it by
  hand and a matrix can compute an ineligible leader unrefused.
- A DEMAND VERDICT CARRIES ITS QUOTE. The sentence it rests on, in the record
  it is about. No quote means the verdict can only be `not answered`.
- OVERRULING A DEMAND DOWNGRADES IT IN THE SAME BREATH. A `must` that was
  overruled and left standing as a `must` misleads every later reader.
- A `must` COSTS MORE TO WRITE FROM NOW ON. Grading a row must is choosing to
  eliminate designs with it, so the grade wants the same care as the
  statement.

## What it does not say

It does not say demands are more important than scores in general. It says
they are a different KIND of rule: pass or fail, not weighed. A design cannot
buy past one by doing well elsewhere, and that is the whole reason for
keeping them out of the scoring.
