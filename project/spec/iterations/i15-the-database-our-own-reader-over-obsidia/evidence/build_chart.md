---
form: build_chart
by: agent
signed_off: 2026-08-16T17:59:34.501Z
authors: agent
files:
---

# Evidence form / build_chart

## current_situation

All seven M4 finders submitted: prior-art, contradiction, analogy, without, heuristic, transform, probe. Fourteen options stand on cluster-the-query, ten on cluster-the-disposition — 140 possible combinations, none drawn yet.

## chart

| candidate | name | statement | picks |
| --- | --- | --- | --- |
| cand-continue-v1s-shape | Continue v1's shape | cheapest: keep v1's YAML view-spec shape, add a threshold band so only borderline candidates reach a person | [[opt-declarative-view-spec-evaluated-in-process]] · [[opt-probabilistic-threshold-classification]] |
| cand-explicit-and-safe | Explicit and safe | same query shape, but every candidate gets a disposition row up front, so no threshold silently disposes anything | [[opt-declarative-view-spec-evaluated-in-process]] · [[opt-prepopulate-pending-disposition-rows]] |
| cand-fast-path-plus-blocking | Fast path plus blocking | optimise for scale on both rows: a stat-invalidated cache for reads, grouped review for a wide candidate pool | [[opt-cache-corpus-read-invalidated-by-file-stat]] · [[opt-block-candidates-before-individual-review]] |
| cand-relational-plus-ensemble | Relational plus ensemble | heaviest build: a real relational store, two independent rankers required to agree before a candidate surfaces | [[opt-embedded-relational-store-with-sql]] · [[opt-ensemble-ranking-agreement-required]] |
| cand-narrow-grammar-plus-explicit | Narrow grammar plus explicit | narrowest scope on both rows: the probed regex grammar, and the judge-a-claim-shaped explicit review with no auto-classification | [[opt-closed-regex-grammar-for-filter-expressions]] · [[opt-explicit-disposition-on-every-candidate]] |

## why_these

Five candidates span the space rather than clustering near one point: cheapest (v1-continuation) through heaviest (relational store + ensemble ranking), with two safety-first variants (explicit disposition, narrow grammar) in between.

PRUNED LOUDLY, not silently dropped from the grid:

- opt-obsidian-cli-as-external-evaluator: already rejected in v1's own adr-query-in-engine (loses the trust chain and the one-binary law). No candidate draws it.
- opt-agent-judgment-ranking-instead-of-lexical-score: contradicts requirements that already name BM25 specifically (req-bm25-returns-ranked-candidates and siblings). No candidate draws it.
- opt-on-demand-binary-confirm-no-ranked-batch: cannot answer "what resembles this change", the motivating question rank-candidate-couplings exists for. No candidate draws it.

WHAT THE SPACE HOLDS THAT THE SHORTLIST DOES NOT: opt-reactive-push-query-on-corpus-change and opt-extend-existing-search-tool-with-structured-mode are both live, buildable options nobody combined into a named candidate — the chart is 140 cells and five stories were drawn across it, not a claim that only five combinations are viable.

## dropped_finders

none — all seven finders answered applies: yes

## follow_up

Five shortlisted candidates seed M5 elaboration, run in parallel. The two null options (opt-no-structured-query-use-existing-text-search, opt-no-automated-ranking-person-searches-by-hand) were not drawn into any candidate; both clusters' own find_without rows already recorded why they stay.

## anything_else

