---
id: opt-phase-gate-state-machine
type: "[[option]]"
statement: hold the walk in an explicit phase machine where a phase cannot start until the one before it recorded that it ended
cluster: cluster-the-walk
found_by: prior-art
source: "A Deterministic Control Plane for LLM Coding Agents, https://arxiv.org/html/2606.26924v1"
---

## Mechanism

Feature work runs as a bounded sequential pipeline. The control plane is
deterministic and separate from the model: it holds the invariants and blocks
on violation. The named example is that starting phase n fails unless phase
n-1 recorded an end timestamp.

It adds two things this project does not have. Auto-fix loops carry a hard
iteration cap, and human-in-the-loop gates are mandatory rather than weighed
against a slider.

WHAT IT WOULD COST HERE. The cap is a policy the drawing does not currently
express, and mandatory gates contradict the autonomy dial. Adopting the
mechanism means deciding whether the dial survives.
