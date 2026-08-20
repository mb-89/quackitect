---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-dec-an-archived-iteration-is-the-benchmark-and-nothing-is-authored
type: "[[raid]]"
kind: decision
statement: "A benchmark re-walks an archived iteration from the commit before it started, and no scenario, subject or sandbox is authored for it."
owner: the owner
trigger: a benchmark need at a change size the archive holds no instance of
status: decided
impact: "It removes the authoring cost that killed an earlier attempt at this, and it binds the design to whatever the archive happens to contain."
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - training-iterations
  - ref-agent-benchmark-harnesses-2026
  - i37-training-iterations-a-disposable-iterati
weighs_with: none
weighs_against: none
---

## Rejected options

AN AUTHORED SCENARIO POOL. Three to five coherent fake deltas, each with a
subject, a delta and a size range. REJECTED by the owner on 2026-08-19: "you
also need to simulate the design input you give to that model. That's quite a
lot of work." The owner has paid this cost before on an earlier system.

A SANDBOX PACKAGE PER SCENARIO. A tiny fake package with tests that really go
red and really go green. REJECTED with the pool. A re-walked iteration writes
real tests against the real tree, so red-to-green is genuine and free.

A PATH MASK OVER ONE ITERATION'S FOLDER. REJECTED on measurement rather than
on preference: 282 files under `spec/trace` mention i15 or i34, and
some carry the id in their own filename. Masking the folder hides the record
and not the answers.

NAMED SYNTHETIC FIXTURES. A small fixed set with ids of their own. REJECTED by
the owner: the benchmark is named after the iteration it re-walks, because
"iteration 33 got ten percent smaller" is already readable and no second
naming vocabulary is needed.

## Consequences

THE ARCHIVE IS THE POOL, and it moves. Every shipped iteration adds a
candidate. That is accepted because comparison is per-iteration and old
results are kept, so a new candidate cannot disturb a measured pair.

BENCHMARKS EXIST ONLY AT SIZES THE ARCHIVE HOLDS. Today that is 8 minor and 3
major, and nothing at patch, product or specification. The owner ruled these
are not gaps: patch work is ad hoc, product happens once as a product's first
iteration, and specification is derived from the iterations that already ran.

THE REWIND BECOMES LOAD-BEARING. With no authored content there is nothing to
hide by construction except by going back in time, so the git ceiling is the
mechanism the whole design rests on.

A RUN GAINS A SECOND OUTPUT. Re-litigating a real past decision surfaces
findings about that decision and about the machine. An authored scenario
could never have produced this.
