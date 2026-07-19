---
id: req-apply-undo
type: requirement
depends_on: []
statement: The engine shall keep the last few applied manifests revertible, so one command undoes the most recent bulk edit byte-exactly.
class: review
killer: false
kind: functional
provenance:
  statement: owner ruling via chat (2026-07-18, after the b25 dot-corruption incident)
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## Design decision (owner, 2026-07-18)

- `quack apply` journals every applied manifest: the touched files' full prior bytes, the last few applies kept (three or four).
- `quack apply --undo` restores the most recent journaled apply and pops it. Repeatable down the journal.
- The undo refuses when a touched file drifted since the apply. A silent clobber is worse than no undo.
- The ledger stays out, as it is for apply itself.

## Rationale (not load-bearing)
The b25 incident showed one careless bulk edit can destroy a session's work. The apply lane is the default for bulk edits; giving it a bounded undo makes the safe lane also the forgiving one.
