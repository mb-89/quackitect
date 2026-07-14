---
id: q-ship-tags
type: question
state: decided
decided_via: C — no revision tags; the note's real concern was the repo surface (description, topics), refreshed at this walk
statement: Should quack ship write git tags for shipped iterations?
class: review
killer: false
provenance:
  state: user-ruling via handoff
  decided_via: user-ruling via handoff
---
## Options
A) Ship tags itself. The ship determinizer tags the ship commit (i0021) and prunes stale tags. Fully mechanical. The engine writes into the owner's git.

B) Ship prints the command. Tagging stays the owner's manual step. Ship ends with a copy-paste line: git tag i0021. No engine git writes.

C) No tags. Iterations are findable through the ledger and the archive. Tags add nothing.

## Rationale (not load-bearing)
Raised at the i18 ship (NOTE-20260711-183910). The owner manages all git operations —
that rule makes A the outlier. B keeps the convenience without the git write.
