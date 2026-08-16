---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-asm-i15-one-threshold-separates-candidates
type: "[[raid]]"
kind: assumption
statement: a single fixed relevance threshold on the BM25 sibling correctly separates real candidate couplings from noise, across every kind of change description an agent submits.
owner: the driving agent
trigger: the threshold is set once at build time and never revisited against measured misses or false positives
status: open
impact: a threshold set too high silently drops real couplings before req-bm25-candidates-need-disposition ever gets a chance to force a look; set too low, it buries real candidates in noise and the forced-disposition step becomes a chore nobody trusts.
breaks_how_badly: corrosive
how_likely: conceivable
probe: unprobed
source_refs:
  - req-bm25-below-threshold-returns-empty
  - raid-asm-i15-corpus-suits-lexical-matching
---

## Probe

After the BM25 sibling ships, sample a set of past changes with known real
couplings and known non-couplings (the same kind of sample
raid-asm-i15-corpus-suits-lexical-matching's own probe collects). Check
whether one fixed threshold cleanly separates them, or whether real
candidates and noise straddle it.
