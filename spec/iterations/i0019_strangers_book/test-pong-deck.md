---
id: test-pong-deck
type: test
statement: The rendered book carries the walkthrough deck with the full arc in order (clone, prerequisites, install, the milestones, the deliverable); the prerequisites slide names what RUNME checks; the deck carries the measured per-milestone timeline; the final slide embeds the playable game only while the size budget holds, else the static figure.
class: executed
verify: selftest:pong-deck
killer: false
---
## Rationale (not load-bearing)
Content-shape assertions over the deck plus the budget guard both ways: embed present under
budget, figure fallback over it. The RUNME-agreement assertion keeps slides and installer from
drifting apart (req-pong-deck.4).
