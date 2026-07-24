---
id: se.stakeholders
kind: stakeholders
statement: "Roles around the SE machine: the owner (designer and adjudicator), the driving agent, sub-agents, and the book's future readers."
provenance:
  iteration: i3-machine-and-retro
  ai_involvement: agent-drafted
---

## Roles

- the owner | designs by drawing (canvases, redlines), adjudicates every gate, owns push and releases; also the product's only current user
- the driving agent | walks the machine, fills states, offers gates, commits in the blessed window; never adjudicates killer gates for the owner
- sub-agents | bounded substeps with named artifacts and deterministic checks; inherit the machine's guidance slices
- the research-agent scorer | a sub-agent with one job: absolute 0-5 scores against fixed anchors from prior art; never adjudicates, never scores its own build; the owner calibrates its first round
- the reader | average professional, non-native English - the audience of the book that will reference these nodes

## Tensions

- owner-as-designer vs owner-as-bottleneck: every drawn gate adds an adjudication; the offer queue serializes them (register R2 watches the depth)
- agent speed vs record completeness: every enforcement law costs calls; the 1s rule keeps the cost invisible
- one adjudicator vs away-time: offers hold 6h; the phone lane extends reach, never adds adjudicators
- independent scoring vs cost per gate: the scorer runs on evaluate-class states only, never on every fill
