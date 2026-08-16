---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-note-i15-narrow-grammar-timing-score-may-be-asymmetric
type: "[[raid]]"
kind: issue
statement: cand-narrow-grammar-plus-explicit's req-call-answers-in-one-second score (0/5) may reflect uneven candidate write-up depth rather than a real architectural gap — it uses the same probed regex mechanism cand-continue-v1s-shape cites timing evidence for, but its own composed text never repeats that sentence.
owner: the driving agent
trigger: before M5 treats cand-narrow-grammar-plus-explicit's elimination as settled
status: open
breaks_how_badly: cosmetic
how_likely: possible
impact: a candidate could be eliminated from further consideration on a score that reflects how thoroughly it was written up rather than a genuine performance difference from its closest sibling.
source_refs:
  - project/spec/iterations/i15-the-database-our-own-reader-over-obsidia/evidence/evaluate-set.md
  - opt-closed-regex-grammar-for-filter-expressions
---

## What would settle it

Re-read cand-narrow-grammar-plus-explicit's What it costs section against
opt-closed-regex-grammar-for-filter-expressions' own probe (177.9µs for
4 nodes×2 queries) and confirm whether the same measured evidence
genuinely transfers. If it does, the score under-states the candidate;
if the mechanism differs in some way not yet written down, the score
stands and this note closes as checked.
