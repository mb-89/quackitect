---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: tsp-claims-and-drift
type: "[[test-spec]]"
statement: A claim is built and checked by the engine, stamps only when sound, and loses its green the moment its ground moves, verified by test over forms, claims and drift.
method: "test"
verifies:
  - "req-form-is-built-and-checked"
  - "req-gate-evidence-must-be-sound"
  - "req-moved-evidence-invalidates-the-bless"
  - "req-rejection-carries-its-reason"
  - "req-fallen-condition-named"
files:
  - "tests/forms.test.ts"
  - "tests/claimops.test.ts"
  - "tests/reopen.test.ts"
  - "tests/drift.test.ts"
  - "tests/suspect.test.ts"
  - "tests/stamp.test.ts"
  - "tests/reads.test.ts"
  - "tests/rounds.test.ts"
---

## Scope

The evidence lifecycle: the engine-built form, the lint that decides
met, the stamp, the reopen with its reason, and the drift that greys a
claim when the matrix or the evidence under it moves.

## Approach

Component level. Round-trip design for the form half (scaffold, fill,
lint, stamp); state-based for the claim half (signed, reopened,
re-signed); the drift probed from both sides (a moved spec reopens, an
unmoved one stays). One claim is DEFINED here ahead of its case and
lands as a named case in drift.test.ts with the build that closes it:
the PANEL naming the fallen condition — the reopen mechanics are
tested, the naming on the surface is not yet.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: the lint: missing instance, empty
required, files, status — and the prefill law end to end; a matrix that
moves under a standing claim reopens it WITHOUT touching its stamps; a
reopen with no reason is refused, because it throws away accepted work;
the drift rips down — everything downstream of a moved step goes with
it.
