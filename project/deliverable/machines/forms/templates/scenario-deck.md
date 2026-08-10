---
id: template-scenario-deck
statement: The ATAM walk dealt as cards — one quality scenario at a time, worst grade first, with its computed path and a three-way verdict.
editor: scenario-deck
line_pattern: ""
line_help: "the verdict lines, button-fed — addressed names the decision, at risk and unaddressed mint their register entry"
---

# scenario-deck

A READING with a judgment beside it, dealt one card at a time.

## What the field declares

```
- name: walk
  template: scenario-deck
```

## What is computed

- The deck: every requirement with `kind: quality`, worst
  `breaks_how_badly` first. The grade stands in for ATAM's utility-tree
  priority.
- Per card, the six-part scenario off the node's `## Scenario` section.
- Per card, the PATH: the functions that satisfy the requirement, and the
  elements and interfaces that implement those functions or satisfy the
  requirement directly.
- The register's decisions, offered as the addressed picker.

## What a person still owes

ONE VERDICT PER SCENARIO, three choices:

- addressed — the structure delivers the measure. The path is the
  evidence. Name a decision only where a recorded choice is why it
  holds; not every quality needs one. ATAM calls this a non-risk.
- at risk — name the hinge and the tradeoff. The click mints a register
  RISK naming the hinge, graded with the requirement's own damage grade.
- unaddressed — the click mints a register ISSUE. A standing finding for
  the gate.

The fitness button files the scenario in fitness_candidates — a scenario
whose measure could become an automated check.

The arrows browse without deciding. An unruled scenario returns on the
next look; nothing is dismissed in silence.

## What it stores

Only the verdict lines — judgment, button-fed, never prose. The deck and
the paths are computed on every look, so they cannot drift from the trace.
