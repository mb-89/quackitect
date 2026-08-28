---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: req-a-door-is-named-for-the-conversation-it-governs
type: "[[requirement]]"
statement: The one-door mechanism shall name each rule for the conversation it governs rather than for the resource or technology that conversation happens to use.
kind: constraint
verify_method: inspection
breaks_if_removed: Doors get named disk, network and syscall, which is the carving the pattern's own primary source identifies as the failure it exists to fix.
breaks_how_badly: corrosive
refines:
  - uc-declare-an-exception-to-a-rule
  - uc-learn-why-a-module-departs-from-a-rule
  - uc-answer-every-export-with-a-door-or-a-deletion
source_refs:
  - raid-iss-the-record-names-its-doors-after-technologies-rather-than-purposes
priority: must
---

## Detail

THE BINDING TEST IS ONE QUESTION, applied to a proposed door's name: does it
name a purposeful conversation, or a thing the conversation runs over?

| name | verdict | why |
| --- | --- | --- |
| persisting a claim | passes | a purpose, and the purpose survives changing the store |
| reading the corpus | passes | a purpose |
| reaching outward for an answer | passes | a purpose |
| the disk door | fails | a resource |
| the syscall door | fails | a technology |
| the web door | fails | a transport |

THE TECHNOLOGY MOVES BEHIND AN ADAPTER. It is not banned from the design; it
is banned from the door's NAME and from the door's shape.

THE SOURCE IS THE PUBLISHER, not an article about it. Alistair Cockburn,
"Hexagonal Architecture" (Ports and Adapters), HaT Technical Report 2005.02.
His definition: a port identifies a purposeful conversation. His worked
failure: a system whose four interfaces were identified by technology, and
whose fix was to architect them by purpose instead.

THE MEASUREMENT AGREES INDEPENDENTLY. Of 64 engine write sites read one at a
time, 30 share one shape, and that shape is a purpose — persisting a claim,
record or form — rather than a resource.

## Behaviour

None. This row states one property of a name, and a model of that would
restate the statement in a second notation.
