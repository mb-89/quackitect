---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: fn-run-a-governed-walk.hold-the-work
type: "[[function]]"
cluster: the-record-life
statement: hold work in progress so the walk can be left and picked up again
satisfies:
  - req-entry-binds-worktree
  - req-parallel-iterations-own-worktrees
  - req-unshipped-dependency-refused
  - req-landing-needs-no-close
  - req-boot-ends-at-front-desk
  - req-walk-resumes-from-repo
  - req-walk-survives-host-swap
  - req-resume-needs-no-person
inputs:
  - flow-open-record
  - flow-repository
outputs:
  - flow-worktree
  - flow-position
controls:
  - the dependency check, which refuses to hold work that cannot start
  - the rule that landing does not end the holding
source_refs:
  - uc-resume-after-an-absence
  - uc-quality-flexibility
  - uc-quality-reliability
---

## Rationale

RECUT ON THE OWNER'S RULING, 2026-08-07. It used to carry the whole record
lifecycle: the desk, opening, landing, closing and the archive. Twenty-three
of the 146 requirements under one function, a sixth of the register, and the
argument holding them together was that they all answer "where work lives".

That argument was true and too convenient. Those five are MOMENTS of the
governed walk, and they now stand as their own functions.

WHAT THIS FUNCTION ACTUALLY IS: you can leave, and you can come back. Because
you must be able to come back, the work has to be held somewhere while you
are gone. That is the whole of it.

Everything here follows from that one sentence:

- The worktree exists because unfinished work needs somewhere to be.
- Two records hold their own because two people may both be away.
- Landing does not end the holding, which is why a record stays open past it.
- Resuming needs no person, because the thing that was held is enough.
- A host swap changes nothing, because what was held is in the repository.

WHAT IT IS NOT. Opening a record is routing. Landing is landing. The archive
is what happens after the holding stops. Each of those is now its own
function, and each has its own rationale.
