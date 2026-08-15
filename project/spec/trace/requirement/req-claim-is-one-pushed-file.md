---
minted_in: i2
id: req-claim-is-one-pushed-file
type: "[[requirement]]"
statement: When a machine claims an unclaimed iteration, the engine shall record the claim as one file naming the machine id and the UTC time, on the dedicated claims branch, and push it in the same act.
kind: functional
verify_method: test
breaks_if_removed: A claim that is not one atomic pushed artifact cannot race cleanly, cannot be listed cheaply, and cannot be released by a person.
breaks_how_badly: crippling
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-claim-an-iteration step 3
priority: must
---

## Detail

- One file per iteration, add-only - two claims never edit one file, so the
  branch merges without conflicts.
- The work tree never rides the claim push. The claim is the mark, not the
  work.
