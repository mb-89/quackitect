---
id: dsp-form-editors
type: "[[design-spec]]"
statement: one client editor per evidence template, carried by a registry that assembles render, collect and behaviour blocks
realizes:
  - "el-mirror"
files:
  - project/deliverable/engine/editors/index.ts
  - project/deliverable/engine/editors/kinds.ts
  - project/deliverable/engine/editors/checklist.ts
  - project/deliverable/engine/editors/choice-rationale.ts
  - project/deliverable/engine/editors/compare-card.ts
  - project/deliverable/engine/editors/decision-matrix.ts
  - project/deliverable/engine/editors/dsm.ts
  - project/deliverable/engine/editors/element-matrix.ts
  - project/deliverable/engine/editors/exposure-pick.ts
  - project/deliverable/engine/editors/findings.ts
  - project/deliverable/engine/editors/list.ts
  - project/deliverable/engine/editors/morph-box.ts
  - project/deliverable/engine/editors/node-table.ts
  - project/deliverable/engine/editors/pareto-plot.ts
  - project/deliverable/engine/editors/per-item.ts
  - project/deliverable/engine/editors/rank-cut.ts
  - project/deliverable/engine/editors/scenario-deck.ts
  - project/deliverable/engine/editors/sensitivity.ts
  - project/deliverable/engine/editors/table.ts
---

## Responsibility

Each evidence template names its editor; the registry assembles every
editor's render, collect and behaviour source into the one client
script. Adding an editor is adding a file. An editor whose guard does
not match falls through to the plain text box, honestly.
