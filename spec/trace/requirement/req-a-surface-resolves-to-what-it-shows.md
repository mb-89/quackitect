---
minted_in: i27
id: req-a-surface-resolves-to-what-it-shows
type: "[[requirement]]"
statement: When a person-facing surface reads or writes, it shall resolve against the record it is showing, and shall name that record on what it shows.
kind: interface
verify_method: demonstration
breaks_if_removed: A person reads one record's panel while it answers from another's content, and edits made there land somewhere nobody named.
breaks_how_badly: fatal
measure: For every person-facing surface, the content shown and the store it came from name the same record, and an edit made on it lands in that record.
refines:
  - uc-resume-after-an-absence
  - uc-take-a-step
source_refs:
  - "owner ruling 2026-08-14: this goes also for the UIs — the UIs need to read the right thing and write the right thing"
  - note-81c6cc77171e
  - note-b086cd36f9a0
  - req-a-read-comes-from-where-it-is-meant
  - req-resume-needs-no-person
priority: must
---

## Scenario

- Source: a person at the panel, the forms, or the trace views.
- Stimulus: they read a record's content, or edit it.
- Artifact: every person-facing surface the product serves.
- Environment: one or more records open, on any host.
- Response: the surface reads from the record it is showing and says which,
  and an edit lands in that record.
- Response measure: zero surfaces where the content shown and its source name
  different records.

## Detail

THE AGENT'S SIDE WAS SPECIFIED AND THE PERSON'S WAS NOT. req-a-read-comes-
from-where-it-is-meant and req-a-write-lands-where-it-is-meant both govern
the lane. Nothing said the same about the surfaces a person actually uses.

IT IS ALREADY BROKEN AND RECORDED. note-81c6cc77171e and note-b086cd36f9a0:
a record's worktree sits outside the folder the owner has open, so a record's
minted nodes are invisible to search and the form's links do not open them.
The owner could not open a record's own findings file.

NAMING THE RECORD IS HALF THE DEMAND. A surface that resolves correctly and
says nothing is indistinguishable from one that resolves wrongly, which is
the same argument the lane's own answers carry.

## Behaviour

No model wanted. One invariant per surface, demonstrated.
