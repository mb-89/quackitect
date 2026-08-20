---
spec: tsp-candidate-couplings-are-disposed-one-by-one
story: sty-dispose-a-candidate-coupling
performed_by: agent
performed_at: 2026-08-19T20:45:00.000Z
---

# Report: an agent disposes of candidate couplings

## What was run

The procedure from tsp-candidate-couplings-are-disposed-one-by-one, against
the real, built engine. The script is demo-dispose-a-candidate-coupling.ts
in this same folder, calling rankCandidateCouplings and
recordCouplingDisposition directly (engine/disposition.ts), the same
functions se_couplings wires to.

The change described was real: the parseBase fix landed earlier in this same
session (see rpt-answer-what-does-this-touch.md), described in plain words
as the actor would type it.

## What was observed

STEP 1-2 PASSED. 706 candidate nodes scored above the relevance threshold
for this real change, a scored list rather than a single guess.

STEP 3, PARTIAL. Every one of the 706 candidates got exactly one disposition
row, stamped pending, confirming recordCouplingDisposition drops nothing
silently. The top 15 by score were then read and disposed for real, one at a
time, with reasoning:

- ACCEPTED, real coupling: opt-declarative-view-spec-evaluated-in-process.
  This option names the exact mechanism touched: a declarative YAML view
  spec, filter plus field list, evaluated in-process. No edge in the graph
  names this option against tables.ts.
- ACCEPTED, real coupling: dsp-live-register. Its statement is "notes as one
  live table, carried by base view files evaluated over the vault on every
  look" — the design spec for the exact behavior the fix restores.
- ACCEPTED, real coupling: req-bm25-below-threshold-returns-empty. STEP 4
  below exercises this requirement directly and the result is worth the
  spec author reading.
- REJECTED, not a real coupling to this change, 12 candidates:
  req-emergency-sits-above-full, opt-reconcile-at-entry-and-reload,
  opt-worktree-holds-only-the-record,
  req-a-preflight-check-asks-the-reader-where-it-looked,
  raid-iss-se-lint-has-no-whole-repo-sweep,
  opt-thin-tree-reads-shared-from-trunk, opt-a-clone-that-keeps-its-history,
  opt-block-candidates-before-individual-review, dsp-engine-delta,
  opt-fan-the-method-out-to-every-tree,
  opt-overlay-the-shared-layer-under-each-record,
  raid-iss-the-refs-check-reads-a-node-tables-written-cells. Each was read at
  the statement level; none names the .base filter-parsing mechanism this
  change touched.

THE REMAINING 691 LOWER-RELEVANCE CANDIDATES WERE NOT INDIVIDUALLY READ IN
THIS RUN. The story pass line asks that no candidate ship pending, and this
run does not meet that line at the full 706-candidate scale: disposing 706
rows by hand in one session is not what happened here. This is named plainly
rather than absorbed, because it is exactly the failure the story exists to
catch, at a scale a single demonstration run could not clear honestly.

STEP 4, A REAL FINDING RATHER THAN A PASS OR A FAIL. A second call used a
deliberately unrelated description built from ordinary English words
(unrelated, nonsense, words, never, corpus). It returned 314 candidates, not
an empty result. req-bm25-below-threshold-returns-empty is mechanically
satisfied: the code returns empty whenever every score sits at or under the
threshold, and this description scored above it on genuine term overlap
with the corpus own vocabulary. The requirement was never that unrelated in
the human sense scores zero; it is that below-threshold scores return empty,
and that held on every call this run made. The finding is that a
human-unrelated description built from common words can still score above
threshold in this self-referential corpus, which is exactly the gap
record.md itself names for BM25 alone ("catches paraphrase BM25 misses" is
embeddings work, explicitly deferred and measured-later, not owed by this
iteration).

## What this proves against the story

The agent CAN reach the ranker and the disposition writer with one call now
that se_couplings is wired. Nothing the ranker returns is silently dropped:
706 candidates, 706 disposition rows. The story own hardest line, that
EVERY candidate gets disposed before the change ships, is not met at full
scale by a single demonstration run; the top 15 were disposed for real with
reasoning, and the honest count against the full set is stated above rather
than implied to be complete.

## References

- Script: reports/demo-dispose-a-candidate-coupling.ts (this folder)
- Helper: reports/list-candidate-statements.mjs (this folder)
- Ranker and writer: deliverable/engine/disposition.ts
- Battery: 1501/1501 green, preflight green, biome clean
