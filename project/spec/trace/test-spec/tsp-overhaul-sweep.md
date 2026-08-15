---
minted_in: i1
id: tsp-overhaul-sweep
type: "[[test-spec]]"
statement: An overhaul closes only on a fresh green battery and takes only unowned drift, and the sweep covers every drift class with a dated verdict, verified by test over the overhaul machinery.
method: "test"
verifies:
  - "req-overhaul-closes-green"
  - "req-overhaul-takes-only-unowned-drift"
  - "req-sweep-covers-every-drift-class"
  - "req-clean-sweep-is-dated"
files:
  - "tests/overhaul.test.ts"
---

## Scope

The overhaul function and the consistency sweep: what an overhaul may
take, what its close demands, and the sweep's class coverage with its
dated clean verdict.

## Approach

Component level. ALL FOUR claims are DEFINED ahead of their cases — the
overhaul machine and the sweep are not built under test yet;
tests/overhaul.test.ts is the planned home and lands with that build.

## Steps

The planned steps assert: a close refused while any test fails on a
battery started after the last fix; a finding belonging to an open
record excluded and its home named; one finding per drift class in the
Detail table on a seeded drift; a zero-finding sweep recorded with its
date.
