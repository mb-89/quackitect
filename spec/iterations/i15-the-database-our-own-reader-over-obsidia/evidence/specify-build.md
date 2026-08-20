---
form: specify-build
by: agent
signed_off: 2026-08-16T18:50:47.679Z
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

author-tests signed with three new specs and six red cases. specify-build now designs below the architectural line and seeds the chunk machine.

## design_specs

- dsp-query-evaluator
- dsp-coupling-disposer

## promotions

- none

## follow_up

build-chunks.md seeded with two independent chunks (query evaluator, coupling disposer) — no dependency edge between them, matching cluster-the-query and cluster-the-disposition's own zero-coupling DSM finding. No spike promoted (exp-i15-query-latency-at-real-corpus-scale's promote field is none), so nothing is assigned a chunk.

## anything_else

