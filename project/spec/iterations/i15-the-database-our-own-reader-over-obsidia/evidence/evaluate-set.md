---
form: evaluate-set
by: agent
signed_off: 2026-08-16T18:16:39.904Z
authors: agent
files:
---

# Evidence form / evaluate-set

## current_situation

cut-criteria closed with 7 surviving axes. A spawned, clean-context subagent scored all 5 composed candidates against them, with no access to my own composing rationale.

## scores

| candidate | axis | score | anchor | prior_art |
| --- | --- | --- | --- | --- |
| cand-continue-v1s-shape | req-a-wrong-act-never-passes-silently | 1 | Addressed only in prose: names its own worst failure (a miscalibrated threshold silently marks a real coupling as not-coupled) but gives no prevention, correction-and-naming, or refusal path for it. | - |
| cand-continue-v1s-shape | req-trace-source-never-mixes | 0 | Not addressed: walks "the loaded corpus" with no scoping to trunk vs. an open record's source. | - |
| cand-continue-v1s-shape | req-trace-view-derived-from-files | 4 | Every answer is a fresh, uncached walk of the files themselves — read-only, file-derived, no separate database. | Obsidian Bases |
| cand-continue-v1s-shape | req-unshipped-dependency-refused | 3 | Meets it by not introducing anything new: explicitly "no cache, no index, no new storage layer." | - |
| cand-continue-v1s-shape | req-call-answers-in-one-second | 2 | Works for the demo path only: sole timing evidence is a 4-node/2-query microbenchmark, self-flagged as unmeasured against the real ~328-file corpus. | - |
| cand-continue-v1s-shape | req-broken-trace-is-a-defect | 0 | Not addressed at all: nothing discusses broken trace links or gate review. | - |
| cand-continue-v1s-shape | req-query-is-deterministic | 4 | A no-cache, fresh-per-call read of the same filter over the same files is deterministic by construction. | Obsidian Bases |
| cand-explicit-and-safe | req-a-wrong-act-never-passes-silently | 3 | Meets it on the disposition side: every candidate stamped pending, needs an explicit verdict, nothing auto-classified wrong; query side's malformed-request handling undescribed. | - |
| cand-explicit-and-safe | req-trace-source-never-mixes | 0 | Not addressed: reuses the same uncached corpus walk with no source-scoping discussion. | - |
| cand-explicit-and-safe | req-trace-view-derived-from-files | 4 | Same "no cache, evaluated fresh per call" query engine, so results always read straight from files. | Obsidian Bases |
| cand-explicit-and-safe | req-unshipped-dependency-refused | 3 | No new external dependency; reuses an existing internal review shape instead of building something new. | - |
| cand-explicit-and-safe | req-call-answers-in-one-second | 2 | Same weak spot as cand-continue-v1s-shape, plus an added per-candidate pending-row write. | - |
| cand-explicit-and-safe | req-broken-trace-is-a-defect | 0 | Not addressed: no mention of trace-link integrity or gate review. | - |
| cand-explicit-and-safe | req-query-is-deterministic | 4 | Same fresh-read, no-cache query engine, deterministic by construction. | Obsidian Bases |
| cand-fast-path-plus-blocking | req-a-wrong-act-never-passes-silently | 2 | Partial: candidates still reach a person, but at block granularity; a wrong blocking boundary can hide a real coupling with no remedy given. | - |
| cand-fast-path-plus-blocking | req-trace-source-never-mixes | 2 | Partial: cache keyed by root, the same shape as the engine's own trace loader, but never stated as an isolation guarantee. | - |
| cand-fast-path-plus-blocking | req-trace-view-derived-from-files | 2 | Partial: invalidates from file state via the engine's own stat-based signature, but names an open, unverified drift risk. | - |
| cand-fast-path-plus-blocking | req-unshipped-dependency-refused | 3 | No new external dependency for the query side; the new blocking-key logic is undesigned custom logic, not a vetted/unvetted external one. | - |
| cand-fast-path-plus-blocking | req-call-answers-in-one-second | 3 | Meets the intent on the common path, reusing a mechanism already proven live in this same codebase; cold-cache/rebuild cost unmeasured. | - |
| cand-fast-path-plus-blocking | req-broken-trace-is-a-defect | 0 | Not addressed: no mention of trace-link integrity or gate review. | - |
| cand-fast-path-plus-blocking | req-query-is-deterministic | 3 | Meets it under normal operation reusing a proven mechanism; the write-outside-the-lane edge case is named unverified. | - |
| cand-relational-plus-ensemble | req-a-wrong-act-never-passes-silently | 2 | Mixed: query side prevents malformed queries by construction; disposition side never says what happens to a coupling only one ranker catches. | - |
| cand-relational-plus-ensemble | req-trace-source-never-mixes | 0 | Not addressed: no split described between trunk and an open record's source. | - |
| cand-relational-plus-ensemble | req-trace-view-derived-from-files | 1 | Gesture only: sync mechanism is "whatever refresh mechanism rebuilds it" — unnamed, and by its own admission not designed or tested. | - |
| cand-relational-plus-ensemble | req-unshipped-dependency-refused | 2 | Partial: the one candidate that actually introduces a new external dependency, named and costed honestly, but no refusal/vetting gate accompanies it. | - |
| cand-relational-plus-ensemble | req-call-answers-in-one-second | 1 | Gesture only: names the deciding number (refresh cost per write) and states it is unmeasured; no fallback described. | - |
| cand-relational-plus-ensemble | req-broken-trace-is-a-defect | 0 | Not addressed: no discussion of trace-link integrity or gate review. | - |
| cand-relational-plus-ensemble | req-query-is-deterministic | 2 | Partial: deterministic once refreshed, but the refresh trigger is unspecified and not designed or tested. | - |
| cand-narrow-grammar-plus-explicit | req-a-wrong-act-never-passes-silently | 3 | Meets it on both halves: shapes outside the closed regex are refused outright; every candidate needs an explicit verdict with no auto-classified band. | - |
| cand-narrow-grammar-plus-explicit | req-trace-source-never-mixes | 0 | Not addressed: no mention of trunk vs. open-record source scoping. | - |
| cand-narrow-grammar-plus-explicit | req-trace-view-derived-from-files | 4 | The narrowed regex grammar still evaluates directly against the files with no separate storage layer. | Obsidian Bases |
| cand-narrow-grammar-plus-explicit | req-unshipped-dependency-refused | 3 | No new external dependency: explicitly the smallest parser surface of any candidate. | - |
| cand-narrow-grammar-plus-explicit | req-call-answers-in-one-second | 0 | Not addressed at all: no latency figures, no cache, no background-handle mechanism anywhere. | - |
| cand-narrow-grammar-plus-explicit | req-broken-trace-is-a-defect | 0 | Not addressed: no discussion of trace-link integrity or gate review. | - |
| cand-narrow-grammar-plus-explicit | req-query-is-deterministic | 4 | Same fresh-per-call file evaluation as the other v1-style candidates, deterministic by construction. | Obsidian Bases |

## front

- [[cand-explicit-and-safe]]
- [[cand-fast-path-plus-blocking]]

## reading

ELIMINATION I DO NOT FULLY ACCEPT: cand-narrow-grammar-plus-explicit lost to cand-explicit-and-safe on req-call-answers-in-one-second alone (0 vs 2). But narrow-grammar-plus-explicit's own mechanism IS the literal probed regex grammar (opt-closed-regex-grammar-for-filter-expressions, 177.9µs measured) — I simply did not repeat that timing sentence in its own What it costs section when composing it, while cand-continue-v1s-shape's costs section cites the same probe despite picking a different option. That is an asymmetry in how thoroughly I wrote the two candidates up, not a real architectural difference. Worth a closer look before this elimination is trusted at M5.

AXIS EVERY CANDIDATE SCORED ALIKE: req-broken-trace-is-a-defect scored 0 across all five candidates, unanimously. This survived cut-criteria's blind, pre-scoring cut (nothing then showed it as identical by construction), but the scoring reveals none of the five composed candidates say anything about what happens when a trace link inside the new query or disposition machinery breaks. That reads as a genuine gap in every candidate, not a criterion that does not matter — worth carrying into M5 rather than dropping silently.

FRONT TO UTOPIA DISTANCE: utopia is (A3,B2,C4,D3,E3,F0,G4); the front's nadir is (A2,B0,C2,D3,E2,F0,G3). The gap is narrow on D and F (both already tied at the utopia value across the front) and one to two points on A, B, C, E, G — a real but not extreme distance. B (req-trace-source-never-mixes) is the widest relative gap: only cand-fast-path-plus-blocking reaches 2 of a possible 2, and it only earns that by extrapolation from the engine's own existing cache mechanism, not a stated guarantee in its own write-up.

## follow_up

The front holds two candidates: cand-explicit-and-safe and cand-fast-path-plus-blocking. Three are eliminated with reasons (dominated on every surviving axis). M5 inherits: the unaccepted elimination note on cand-narrow-grammar-plus-explicit, and the unanimous req-broken-trace-is-a-defect gap across all five.

## anything_else

