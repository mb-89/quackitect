---
id: req-context-diagram
type: requirement
depends_on: []
statement: The book shall model the system's context neighbours as notes and render them as a derived context diagram whose connector lines end at each node's border.
class: review
killer: false
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
field c28 + Q5 (owner 2026-07-08): the neighbours (console, agent, git, Obsidian, Vale, reader) are hand-authored prose; model them as notes and draw the derived context star. Derived over authored. The star lines stop at node borders, never crossing the centre node.
