---
minted_in: i27
id: req-a-records-dependency-is-declared
type: "[[requirement]]"
statement: The engine shall take a record's prerequisites from a declared list on the record, and shall refuse entry until each named record has left the open set.
kind: functional
verify_method: test
breaks_if_removed: A prerequisite written in prose binds nothing, so two agents are handed work that fights over the same files.
breaks_how_badly: crippling
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-get-work-routed
  - "owner ruling 2026-08-12: the container is a DAG and this key is its only input"
  - "observed 2026-08-13: three records stated a wait in their own vision prose and carried no edge for it"
priority: must
---

## Detail

BUILT ALREADY AND RECORDED HERE because nothing in the register
described it, and because it was silently half-used until today.

THE KEY IS THE CONTAINER'S ONLY INPUT. A record naming another there
cannot be entered until that one leaves the open set, because the drawn
edge runs prerequisite to dependent and the walk never enters a state
whose inbound edges have not fired.

WHAT WENT WRONG WITHOUT IT. Twenty-seven records were seeded and the key
was set on seven. Three stated a wait in their own vision PROSE and
carried no edge - the UI sitting after the panel round, the comment
system after the machine format, the cloud record after this one. Prose
binds nothing.

THE DEPENDENCY IS WRITTEN TWICE TODAY, once as prose and once as the
key, and two copies of one fact can disagree. They did, in three records
of nine.

## Proven live

The container offered exactly seventeen doors and held nine back, in the
right places, without being asked. That is this row already met - and it
was met while three edges were missing, which is why the row exists
rather than the behaviour being assumed.

## Related and not here

That seeding must NAME its dependency explicitly, so I-forgot and
I-decided-none stop looking alike on disk, is i6's.

## Behaviour

No model wanted. It is a precondition read from a list.
