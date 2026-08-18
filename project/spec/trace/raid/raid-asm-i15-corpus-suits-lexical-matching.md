---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-asm-i15-corpus-suits-lexical-matching
type: "[[raid]]"
kind: assumption
statement: this corpus's enforced, consistent method vocabulary (bound, tree, claim, record, gate mean one thing everywhere) makes lexical overlap a good enough proxy for semantic overlap, so BM25 alone catches the couplings that matter and embeddings can wait.
owner: the driving agent
trigger: after the BM25 sibling ships, measured against couplings the register or a retro finds that BM25 missed
status: open
probed: "2026-08-16"
probe: "scheduled. Its own Probe section needs the BM25 sibling built, then a sample of couplings the sibling missed compared against a retro/red-team's real finds. Not yet built this iteration — se_file_search of project/deliverable/engine for bm25 returns no hits."
breaks_how_badly: corrosive
how_likely: conceivable
impact: BM25 misses a real coupling stated in different words than the changed node, the cross-coupling check at i6's requirements gate never sees the candidate, and the gap surfaces only after the fact — the exact failure the sibling exists to prevent.
source_refs:
  - i15-the-database-our-own-reader-over-obsidia
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

After the BM25 sibling ships, collect a sample of real couplings caught
by other means — a red-team round, a retro, an incident — that were NOT
in the sibling's candidate list for the change that caused them. A
nonzero, recurring miss rate that traces to paraphrase rather than to a
tuning bug is the signal embeddings should stop waiting.

## Why this is not yet probed

record.md states the lexical-matching claim as the reason BM25 ships
first and embeddings are deferred, but no measurement backs it yet —
the sibling has not been built. Recorded here per log-risks' own rule:
an assumption noticed now is recorded now, not held for M3's sweep.
