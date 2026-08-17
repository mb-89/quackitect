---
id: cand-continue-v1s-shape
type: "[[candidate]]"
name: "Continue v1's shape"
statement: "cheapest: keep v1's YAML view-spec shape, add a threshold band so only borderline candidates reach a person"
picks:
  - "[[opt-declarative-view-spec-evaluated-in-process]]"
  - "[[opt-probabilistic-threshold-classification]]"
---

## Why this one

Cheapest path to done looks like. v1 already committed to this exact YAML
view-spec shape for all 25 harvested query files, and Obsidian's own core
Bases plugin runs the same shape. Building anything else would be paying
twice for a decision already made. Trades away scale headroom — no cache,
no relational index — for the smallest possible build.

## How it works

answer-a-structured-query parses a `.base`-shaped filter (`filters.and`,
optionally nested `or`) plus a field list, walks the loaded corpus once per
call with no cache, and returns matching rows or an explicit empty result.
rank-candidate-couplings scores candidates and hands them to
record-a-coupling-disposition, which auto-classifies each one into coupled,
not-coupled, or a middle band — only the middle band reaches a person. The
unchanged baseline (se_file_search, se_file_glob, the trace corpus, the walk
itself) stays exactly as it is; nothing here touches it.

## What it costs

Build is small: a filter-expression evaluator (confirmed cheap by this
session's own probe, opt-closed-regex-grammar-for-filter-expressions —
177.9µs for 4 nodes×2 queries) plus a threshold-band scorer. No cache, no
index, no new storage layer. Worst case: a full corpus walk per query call,
unmeasured against the real ~328-file corpus — the probe only faked 4 nodes.
Failure mode that decides: a miscalibrated threshold silently misclassifies
a real coupling as not-coupled, and nobody ever sees it to correct it.

## What it leans on

That the pinned v1 subset's filter vocabulary (`==`, `!=`, `and`, `or`) is
enough for every query this iteration needs — unverified beyond the two
files this session read directly. That a single threshold band, calibrated
once, holds up as the corpus and its coupling patterns grow. Both are
assumptions with no trigger recorded yet.