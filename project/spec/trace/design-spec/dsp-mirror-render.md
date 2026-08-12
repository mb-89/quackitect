---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: dsp-mirror-render
type: "[[design-spec]]"
statement: the one surface a person looks at, carried by a loopback server rendering the machine, the forms, the feed and the tour
realizes:
  - "el-mirror"
  - "if-account-to-mirror"
  - "if-front-desk-to-mirror"
  - "if-holding-pen-to-mirror"
  - "if-method-compiler-to-mirror"
  - "if-record-store-to-mirror"
  - "if-walk-engine-to-mirror"
files:
  - "project/deliverable/engine/render.ts"
  - "project/deliverable/engine/mirror.ts"
  - "project/deliverable/engine/panel.ts"
  - "project/deliverable/engine/brand.ts"
  - "project/deliverable/engine/card-parts.ts"
  - "project/deliverable/engine/cards.ts"
  - "project/deliverable/engine/traceui.ts"
  - "project/deliverable/engine/gitgraph.ts"
  - "project/deliverable/engine/shoot.ts"
  - "project/deliverable/engine/bin/brand.ts"
  - "project/deliverable/engine/bin/mermaid-check.ts"
  - "project/deliverable/engine/bin/place-prompt-layer.ts"
---

## Responsibility

The mirror serves what the engine holds — the machine drawing, the
evidence forms, the trace graph, the feed, the archive, the tour — to
one machine over loopback, and never advances the walk. Every seam into
it is a derived view; controls post back through the lane.

## Behavior and constraints

- Colors are configuration, read from the palette file.
- Every update reaches the render; the reader keeps their place.
- The screenshot verb captures the mirror for evidence, on request.
