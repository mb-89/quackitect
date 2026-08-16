---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-risk-the-batching-condition-is-prose-not-a-mechanism
type: "[[raid]]"
kind: risk
statement: Reading the iteration list from git meets the one-second rule only while the reader batches, and nothing refuses a per-iteration read.
owner: the driving agent
trigger: the first list read written without batching, and any growth in branch count past the measured 33
status: mitigated
impact: The list read takes about a second per thirty branches instead of about sixty milliseconds for all of them. Every look at the iterations view pays it, which is the surface a person touches most.
breaks_how_badly: corrosive
how_likely: plausible
probe: "measured 2026-08-15 over 33 branches; the batched read costs 58.7 ms against 1004 ms for the per-iteration one"
probed: "2026-08-15"
source_refs:
  - raid-dec-one-verb-answers-what-exists
  - req-call-answers-in-one-second
  - raid-dec-git-is-the-list-of-iterations
  - raid-asm-git-answers-open-without-a-worktree
---

## The hinge

THE CONDITION IS WRITTEN IN A DECISION NODE. A decision's prose binds whoever
reads it, and nothing reads it at runtime.

THE NAIVE WRITING IS THE OBVIOUS ONE. Asking git for each iteration's record
in a loop is what anybody writes first, and it is eighty times slower than
asking once.

## Why it is graded likely

THE MEASUREMENT ALREADY EXISTS AND THE CODE DOES NOT. Nothing has been built
against this decision yet, so the first implementation is where it lands or
fails, and the failure mode is the default.

## The second condition, which has the same shape

THE LIST READS THE RECORD FROM TRUNK, never from each branch tip. A tip
carries that iteration's own edits, so reading from tips makes every row
report a different moment.

BOTH CONDITIONS LIVE IN THE SAME SENTENCE OF THE SAME NODE, and neither is
enforced by anything.

## What closed it

THE OWNER RULED ON 2026-08-15 that the list has exactly one reader. Nobody
asks git directly, and the one verb that answers batches internally.

SO THE CONDITION IS NO LONGER A CONDITION. It is a property of the only path
a caller has, and the slow version cannot be written because the slow path
does not exist.

[[raid-dec-one-verb-answers-what-exists]] carries it.

WHAT KEEPS THIS ENTRY OPEN AT ALL: the verb is decided and not yet built. The
risk closes fully when the second caller uses it rather than reaching past
it.
