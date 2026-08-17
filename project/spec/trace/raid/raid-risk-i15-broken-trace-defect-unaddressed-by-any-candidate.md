---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-risk-i15-broken-trace-defect-unaddressed-by-any-candidate
type: "[[raid]]"
kind: risk
statement: all five M4 candidates for cluster-the-query and cluster-the-disposition scored 0/5 on req-broken-trace-is-a-defect at evaluate-set, unanimously — none describes catching a broken trace link inside the new query or disposition machinery.
owner: the driving agent
trigger: M5 elaboration of whichever candidate(s) survive convergence, or an M6 spike
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: a coupling disposition or a query result could point at a node that no longer exists or never resolved, and nothing in any of the five candidates counts that as a defect or fails a gate reviewing it — the trace could render whole while pointing at nothing.
source_refs:
  - project/spec/iterations/i15-the-database-our-own-reader-over-obsidia/evidence/evaluate-set.md
  - req-broken-trace-is-a-defect
---

## Why this is carried rather than dismissed

req-broken-trace-is-a-defect survived cut-criteria's blind, pre-scoring
cut — nothing then showed it as identical by construction across the
five candidates. The independent scoring pass then found it genuinely
tied, but tied at zero: every candidate is silent on it, not equally
strong.

## What would settle it

Whichever candidate(s) the front carries into M5 should say explicitly
how a broken upward link from a new coupling-disposition record, or from
a query result row, gets counted as a defect and fails the gate
reviewing it — the same standard req-broken-trace-is-a-defect already
holds the rest of the trace to.
