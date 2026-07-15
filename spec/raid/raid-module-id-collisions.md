---
id: raid-module-id-collisions
type: raid
kind: risk
probability: 0.4
impact: 0.6
mitigation: module-prefix lint before true composite ids
owner: maintainer
status: open
statement: Module-local content can collide in the current global id namespace.
---

The first implementation should keep globally unique ids and lint module prefixes before any later composite identity change.
