---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: raid-risk-changing-the-two-verbs-reaches-the-hands-walking-with-them
type: "[[raid]]"
kind: risk
statement: This round changes what the two walking verbs promise, and two sibling rounds are being walked with those verbs at the same time, so a change here reaches them whatever files it touched.
owner: the owner, who assigns the hands
trigger: the first change that alters when either walking verb returns, before both siblings have closed
status: open
impact: A sibling hand meets new behaviour mid-walk with no warning, and reports it as a machine fault rather than as a change somebody made.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - raid-risk-three-rounds-run-at-once-over-one-declaration-file
---

## Why it stands, and why it was missed

THE SEPARATION BETWEEN THE THREE ROUNDS WAS ARGUED BY FILE. Each owns its own
modules, none reaches another's, and the single shared file has a rule.

THAT DEFENCE DOES NOT COVER THIS. This round's kickoff says in as many words
that it changes what two published verbs promise: pointing stops walking and
the pull starts doing it.

THOSE ARE THE VERBS THE SIBLING HANDS WALK WITH, right now. A behavioural change
reaches them through the running engine, not through a file, so no merge and no
file listing would show it coming.

IT WAS FOUND AT A GATE BY A REVIEWER THAT DID NOT WRITE THE SCOPE. The author's
own red team listed five rows and this was not among them, because the author
was reasoning about merges.

## What makes it worse than an ordinary change

A SIBLING HAND CANNOT TELL A CHANGE FROM A FAULT. It is walking a record, not
reading this register. New behaviour in the middle of a walk reads as the
machine misbehaving, and the hand reports a defect that is not one.

AND THE REPORT LANDS SOMEWHERE ELSE. It arrives against the sibling's record,
where nobody is looking for this round's changes.

## What holds it

THE SEQUENCING IS THE MITIGATION, and it is nearly free here. This round's first
milestone is measurement. Nothing about measuring changes what a verb promises,
so the siblings are untouched while it runs.

THE CHANGE ITSELF WAITS FOR A SAYING. Before either verb's behaviour moves, the
owner is told, because they are the one who knows where the other two hands are.

WHAT WOULD RAISE IT. A sibling round taking longer than expected, so the window
where all three overlap grows. That is the owner's to watch rather than this
round's.
