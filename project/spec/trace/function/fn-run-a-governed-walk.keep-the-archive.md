---
minted_in: i1
id: fn-run-a-governed-walk.keep-the-archive
type: "[[function]]"
cluster: the-record-life
statement: keep every closed record readable exactly as it stood, and unchangeable
satisfies:
  - req-a-closed-records-folder-stays-on-trunk
  - req-archive-lists-every-closed-record
  - req-archive-shows-it-as-it-closed
  - req-archive-read-only
  - req-archive-opens-to-a-person-only
  - req-archive-releases-worktrees
  - req-record-status-comes-from-the-record
inputs:
  - flow-closed-record
outputs:
  - flow-archive-listing
controls:
  - the read-only rule, which refuses every edit
  - the person-only rule, which refuses an agent at every autonomy setting
source_refs:
  - uc-browse-the-archive
  - uc-answer-why-a-year-later
---

## Rationale

SPLIT OUT ON THE OWNER'S RULING, 2026-08-07.

IT IS THE ONLY FUNCTION THAT REFUSES TO CHANGE ANYTHING, and that is what
makes it its own. Everything else in the tree produces, moves or judges. This
one exists to hold still.

AS IT STOOD, not as it would look today. A record re-rendered under a later
method would answer a different question from the one somebody is asking,
which is always "what did we know then". That is why the demand is zero bytes
differing rather than merely readable.

PERSON-ONLY IS A DELIBERATE REFUSAL OF THE AGENT, at every autonomy setting.
There is nothing here for an agent to do, and an agent browsing history is
how a closed decision gets quietly re-litigated.

The worktrees go when a record archives. Holding work is the other function's
job, and it ends here.
