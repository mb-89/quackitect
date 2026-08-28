---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: req-a-reference-key-resolves-or-is-marked
type: "[[requirement]]"
statement: When the conformance sweep runs, the engine shall check every reference key on every corpus node and report each value that neither resolves to a standing node nor carries an unreachable marker.
kind: functional
verify_method: test
breaks_if_removed: A reference pointing at nothing reads exactly like one that resolves, so the corpus loses the property that makes it followable.
breaks_how_badly: corrosive
refines:
  - uc-keep-the-corpus-sound-at-the-write
source_refs:
  - uc-keep-the-corpus-sound-at-the-write
priority: must
---

## Detail

| what is checked | what counts as passing |
| --- | --- |
| every reference key the corpus guard names | the value resolves to a standing node |
| the same keys, where the primary is gone | the value carries its unreachable marker |
| a key naming a node of the wrong type | fails, and the report says which type was wanted |

THE MARKER IS AN ANSWER, NOT AN EXEMPTION. A marked reference reports as
marked, and the count of markers is reported beside the count of repairs.

A KEY THE GUARD DOES NOT NAME IS UNCHECKED, and the report says so rather than
passing in silence. That is what makes the class list auditable.
