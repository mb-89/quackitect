---
steps:
  - id: reading-credit
    statement: "The reading credit survives a reload: persist the buffer, restore it only for the same session under a different process."
    depends_on: []
    realization: software
  - id: claim-pool
    statement: "The claim pool opens on its first claim: mint the branch from an empty tree, and tell an absent ledger from an unreachable remote."
    depends_on: []
    realization: software
  - id: size-extractor
    statement: "One extractor reads the blessed size, built on the form's own choice reader, so the gate's check and the record cannot disagree."
    depends_on: []
    realization: software
  - id: reopen-frontier
    statement: "A reopen places tokens only on reopened states with no other reopened state upstream, so the walk stands where it can work."
    depends_on:
      - size-extractor
    realization: software
  - id: scaffold-entry
    statement: "Mark the placeholder drawing at compile and refuse to walk into a marked one, leaving it drawable and routable."
    depends_on: []
    realization: software
  - id: field-omit
    statement: "A field names the sizes that do not ask it, and the column compiler drops it, with refusals for an unknown size and for trimming a state to nothing."
    depends_on:
      - size-extractor
    realization: software
  - id: minor-column
    statement: "Re-author the minor column against the owner's milestone-by-milestone ruling: twelve rows struck, two forms trimmed field by field."
    depends_on:
      - field-omit
    realization: software
  - id: red-objective
    statement: "A zero-length route asks the target whether it owes a form, and serves that form instead of a sentence about position."
    depends_on: []
    realization: software
  - id: grey-verb
    statement: "Collect every condition holding a state instead of throwing the first, expose it as se_why, and make it legal everywhere."
    depends_on:
      - red-objective
    realization: software
---

## No promoted spike enters here

A draft of this drawing carried a step called `trunk-batch-reader`. It was not
work this iteration did. It was [[exp-trunk-read-cost]], which i2 promoted and
i2 built, still being demanded of every record after it.

The filter behind that field read every promoted experiment in the project,
with no owner and no expiry, so i2's promotion turned up here and would have
turned up in i4's and i5's. The only way to satisfy it was to copy a chunk for
work somebody else had done.

That is fixed at the source: an experiment now records the iteration that made
it, and the field asks only for this record's own. A promotion is a spike aimed
at a later step of the SAME iteration, and it does not outlive it — exactly
like the spike.

So the step is gone from this plan, and it should never have been in it.

## Why these chunks

EACH CHUNK IS ONE DEFECT MET IN USE. Not one was planned from a design; every
one began as a report while the walk was running, which is why the edges are
mostly absent — they are independent repairs to independent places.

WHERE AN EDGE EXISTS IT IS REAL:

- `reopen-frontier` depends on `size-extractor`, because the frontier defect was
  only observable once a size could be re-recorded correctly. With the wrong
  size read, the reopen never fired at all.
- `field-omit` depends on `size-extractor` for the same reason: the trim is
  keyed to the recorded size.
- `minor-column` depends on `field-omit`, because two of its rows use the trim.
  Authoring them first would have written a key nothing read.
- `grey-verb` depends on `red-objective` only for order: both touch the pull's
  answer, and doing them in one pass avoided two visits to the same seam.

## The strategies that shaped the order

RISK FIRST, mostly. `size-extractor` came earliest of the coupled group because
it had already cost eleven approved steps and a skipped build, and because two
other chunks could not be judged until it was right.

WALKING SKELETON, not applicable. There is no new capability here to stand up
end to end; every chunk repairs a path that already existed.

DEPENDENCY ORDER did almost no work, which is itself the honest observation:
five of the nine chunks depend on nothing, so the plan is mostly a list.

## What this drawing is NOT

It is not a prediction. It is authored at the state that seeds it, as the method
requires, but the work it describes was carried out as the defects arrived
rather than after a plan.

Recording that plainly is better than a drawing that implies a foresight nobody
had.
