---
form: build-coupling-disposer
by: agent
signed_off: 2026-08-16T18:57:28.927Z
authors: agent
files: null
---

# Evidence form / build-coupling-disposer

## current_situation

build-coupling-disposer: engine/disposition.ts was a throwing stub since author-tests.

## built

engine/disposition.ts: rankCandidateCouplings (real BM25 over loadTrace's hay field, stopword-filtered, k1=1.5/b=0.75, 0.01 relevance threshold) and recordCouplingDisposition (maps every candidate to a pending row, no filter) both implemented for real. tests/coupling-rank.test.ts: 2/2 green. typecheck clean.

## follow_up

tsp-coupling-disposition's inspection checklist is now inspectable at verification: recordCouplingDisposition's body is a bare .map with no filter/slice/threshold and no branch setting status to anything but pending.

## anything_else

