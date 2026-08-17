---
form: find_contradiction
by: agent
signed_off: 2026-08-16T17:50:08.722Z
authors: agent
files:
---

# Evidence form / find_contradiction

## current_situation

find_prior_art closed for cluster-the-query and cluster-the-disposition. This is TRIZ's contradiction finder, running in parallel with the other M4 finders over the same two new clusters.

## applies

yes

## contradictions

| cluster | contradiction | improving | degrading | separation |
| --- | --- | --- | --- | --- |
| cluster-the-query | making the query answer fast makes the answer unreliable, because only a full corpus walk guarantees freshness | 9 Speed | 27 Reliability | IN TIME |
| cluster-the-disposition | widening the rank to avoid missing a real coupling makes the review queue too long for a person | 26 Quantity of substance | 25 Loss of Time | IN LEVEL |

## options

- project/spec/trace/option/opt-cache-corpus-read-invalidated-by-file-stat.md
- project/spec/trace/option/opt-block-candidates-before-individual-review.md

## follow_up

Both separations dissolved their contradiction; neither needed a vendored triz-matrix.json lookup. The remaining M4 finders (analogy, heuristics, without/trimming, spike-probe) still run over the same two clusters before enumerate-space joins and dedupes into the morphological chart.

## anything_else

