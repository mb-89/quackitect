---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: tsp-record-lifecycle
type: "[[test-spec]]"
statement: A record opens on the person's word, binds its own tree, walks from the retro, and grows only by adjudicated escalation, verified by test over the iteration machinery.
method: "test"
verifies:
  - "req-record-opens-on-word"
  - "req-record-status-comes-from-the-record"
  - "req-walk-opens-at-retro"
  - "req-unshipped-dependency-refused"
  - "req-landing-needs-no-close"
  - "req-size-choice-is-the-bless"
  - "req-size-escalation-readjudicated"
  - "req-size-proposal-names-strikes"
  - "req-bless-outputs-ride-the-bless"
  - "req-blessed-column-compiles-pinned"
  - "req-a-shipped-record-is-never-reclaimed"
  - "req-a-records-dependency-is-declared"
files:
  - "tests/iterations.test.ts"
  - "tests/container.test.ts"
  - "tests/worktree.test.ts"
  - "tests/drift.test.ts"
  - "tests/sizes.test.ts"
  - "tests/floor.test.ts"
  - "tests/rigor-matrix.test.ts"
---

## Scope

The record from seed to standing walk: the seed, the bind, M0's retro
first, the kickoff bless that compiles and pins the column, escalation,
and landing while the record stays open. The close is
[[tsp-close-and-land]].

## Approach

Integration level: whole sessions walked through seed, entry and bless.
State-based over the record lifecycle, with the escalation boundary
probed both ways (grow legal, shrink refused). Four claims are DEFINED
here ahead of their cases and land as named cases in iterations.test.ts
and gitlane.test.ts with the builds that close them: opening only on the
person's recorded choice, the unshipped-dependency refusal, landing
without a close, and the strike list riding the size proposal.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: no gate holds the first start — entering
binds, stamps started, and M0 stands; the bless pins the machine and it
grows in place — no wrapper, fills carried; escalation reopens exactly
the grown steps; the pin stores the COLUMN, never a frozen machine.

## Two requirements joined here at i27

[[req-a-shipped-record-is-never-reclaimed]] and
[[req-a-records-dependency-is-declared]] were minted by i27 and belong to this
collection rather than to a new one. Both are about a record's life, both
verify by test, and both are caught by the same machinery this spec already
covers.

A SEPARATE SPEC WOULD HAVE SPLIT ONE CONCERN. The rule is one spec, one
verification concern, and the concern here is the record's life from the word
that opens it to the landing that ends it.
