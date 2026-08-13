---
minted_in: i3-the-walk-s-feedback-loop-the-reading-cre
id: raid-asm-grey-verb-distinct-from-se-help
type: "[[raid]]"
kind: assumption
statement: The verb that answers why a state is grey and the se.help search stay distinct surfaces, so neither absorbs the other and neither ships a duplicate.
owner: the driving agent
trigger: i8 lands, or either verb's surface is designed
status: open
impact: Two verbs ship with overlapping surfaces and neither owner notices, because they are built on different machines at the same time. The agent then has two doors for one question.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - "i3's kickoff gate, round 2 red team, 2026-08-13"
  - "project/spec/version-planning.md § i8 — se.help"
  - "project/spec/version-planning.md § i3, which says i3 absorbs the introspection-verb work"
---

## The claim

They answer different questions.

- `se.help` searches the lane's TOOLS and GUIDANCE by keyword. Its subject is
  the documentation, and its output is a ranked missing-tool demand on every
  miss.
- The grey-state verb inspects the WALK. Its subject is this machine right
  now, and its output is the objective, the first grey state and what stands
  in its way.

One reads what the system says about itself. The other reads what the system
is doing.

## Why it is an assumption and not a fact

They are adjacent enough to blur. Both are "ask the lane a question and get an
answer back", and both replace clusters of shell probes.

They are also being built AT THE SAME TIME on DIFFERENT MACHINES. A cloud
agent holds i8 while this record holds i3. Neither driver sees the other's
surface until both land.

That is exactly the condition under which two overlapping verbs ship.

## Probe

At i8's landing, or at the first surface design of either verb, put the two
signatures side by side and answer one question: does either one's output
answer the other's question?

If yes, they are one verb with two modes and the split is the defect.

If no, record the boundary in both design specs so the next reader does not
ask again.

## What makes it survivable

Neither verb is load-bearing for the other. A duplicate costs one wrong turn
and one retirement, not a redesign. That is why this is abrasive rather than
crippling.
