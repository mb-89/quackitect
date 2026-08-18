---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: cand-explicit-and-safe
type: "[[candidate]]"
name: "Explicit and safe"
statement: "same query shape, but every candidate gets a disposition row up front, so no threshold silently disposes anything"
picks:
  - "[[opt-declarative-view-spec-evaluated-in-process]]"
  - "[[opt-prepopulate-pending-disposition-rows]]"
---

## Why this one

Same query cost as the cheapest candidate, but trades the disposition
function's own safety for none of the query side's savings. Where
cand-continue-v1s-shape lets a threshold silently dispose the easy cases,
this one refuses to dispose anything without a person seeing it first —
trading review load for the guarantee that nothing gets silently miscoded.

## How it works

Same answer-a-structured-query as cand-continue-v1s-shape: v1's YAML
view-spec shape, no cache, evaluated fresh per call. rank-candidate-couplings
is unchanged too. The seam that differs is entirely inside
record-a-coupling-disposition: the moment a ranked list comes back, one
disposition row per candidate is written and stamped `pending` before any
person looks at it — there is no auto-classified band. A person clears every
row, one at a time, the same shape judge-a-claim already uses for gate
claims. The unchanged baseline (the walk, se_file_search/glob, the trace
corpus) is untouched.

## What it costs

Build cost matches the cheapest candidate on the query side, plus one small
write (the pending-row stamp) per candidate returned. Worst case scales with
review load, not compute: a change that surfaces fifty candidates means
fifty pending rows a person has to clear, with no automatic filtering.
Failure mode that decides: nothing is silently miscoded, but a large
candidate list could make disposition tedious enough that it stops being
done promptly, and a pending queue that grows unbounded is itself a signal
nobody currently watches for.

## What it leans on

That candidate volume stays small enough for manual review to be practical
— unmeasured against the real corpus, the same open question
raid-asm-i15-query-plus-rows-earns-trust already names. That a person
is actually available to clear pending rows in a timely way; nothing in
this candidate enforces or checks that.
