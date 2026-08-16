---
form: find_analogy
by: agent
signed_off: 2026-08-16T17:51:09.316Z
authors: agent
files:
---

# Evidence form / find_analogy

## current_situation

find_contradiction closed for both new clusters. This is the analogy-transfer finder, running in parallel with the other M4 finders over cluster-the-query and cluster-the-disposition.

## applies

yes

## abstractions

| cluster | abstract_problem | domains |
| --- | --- | --- |
| cluster-the-query | showing a large, self-describing collection through a narrow, named-field lens, refusing anything not on the label | library card catalogues, relational databases (already covered as literature) |
| cluster-the-disposition | rank plausible candidates against a description, then commit to a bounded decision on each | differential diagnosis in clinical medicine, air traffic conflict-alert triage |

## options

- project/spec/trace/option/opt-shard-index-by-node-type.md
- project/spec/trace/option/opt-record-the-ruled-out-alongside-the-ranked.md

## follow_up

Both transfers are honest about what did not carry over — see each option's Mechanism section. The remaining M4 finders (heuristics, without/trimming, spike-probe) still run over the same two clusters before enumerate-space joins and dedupes into the morphological chart.

## anything_else

