---
id: req-decision-classes
type: requirement
statement: When classifying a decision node, the engine shall derive its class from graph facts alone — veto (scrap-sink edge without ready_when), defer (scrap-sink edge with ready_when), superseded (incoming supersedes edge) — resolving scrap as one built-in sink node.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [process]
quality: [functionality]
---
## Rationale (not load-bearing)
No status fields, ever: a decision is born made; all classification is a write-once stamp or derived. The scrap sink is the /dev/null of the trace; address the real node if the scrapped thing earned one, the sink only if it never did — the orphan rule holds by construction.
