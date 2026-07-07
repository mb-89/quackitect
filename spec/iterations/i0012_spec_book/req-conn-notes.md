---
id: req-conn-notes
type: requirement
depends_on: []
statement: When a kind folder under spec/connections holds a connection note, the engine shall load it as one edge carrying kind, src, dst, and statement, and shall refuse a note missing one of them or naming an endpoint that does not resolve.
class: review
killer: false
phase: [operation]
discipline: [process]
quality: [reliability, usability]
---
## Rationale (not load-bearing)
Refuse, never skip: the empty-statement guard silently dropping nodes is the trap the red-team named (trust lens finding 2). src/dst join the ref-checked fields.
