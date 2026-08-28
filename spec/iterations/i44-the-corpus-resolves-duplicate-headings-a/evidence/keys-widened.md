---
form: keys-widened
by: agent
signed_off: 2026-08-28T11:12:33.544Z
authors: agent
files:
---

# Evidence form / keys-widened

## current_situation

The swept reference-key list carried ten keys and missed three that also point at nodes.

The list is now thirteen keys and is exported, so a check outside guard.ts can assert what is swept.

## built

`deliverable/engine/guard.ts`, one edit to `REFERENCE_KEYS`.

The three added keys are `demonstrates`, `probes` and `picks`. A test-spec demonstrates a story, a chart probes an option, and a convergence picks one. Each names an id the corpus is expected to hold, and none of the three was checked.

The declaration changed from `const` to `export const`, which is what lets the check assert the list rather than restate it.

The covering case is the first in `deliverable/tests/corpus-sweeps.test.ts`, and it names all seven keys it expects rather than counting them.

## follow_up

The reference class is the one this widening feeds, and it is not empty. 131 references resolve to nothing across the trace corpus.

Repair or mark them, then arm the reference sweep.

## anything_else

THE WIDENING IS WHY THE COUNT IS 131 RATHER THAN THE PLAN'S 46. The plan counted path-shaped references under the ten old keys. This figure covers thirteen keys and every shape.

SO THE TWO NUMBERS ARE NOT IN DISAGREEMENT. They measure different sets, and saying which is which is the point of writing both down.
