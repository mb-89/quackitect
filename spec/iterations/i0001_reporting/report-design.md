---
id: report-design
statement: The approach is chosen with a recorded reason — the engine derives a pure ReportModel from .quack/attest.json plus the check DAG and renders it into a FROZEN report_template.html (authored once off the excalidraw draft / Claude Design), with vendored cytoscape inlined for the trace graph; the determinism boundary is that all data/derivation is deterministic and the aesthetic shell is frozen at author time — no model or network call at report time.
depends_on: [report-requirements]
class: review
killer: false
---

## Rationale (not load-bearing)
L3/Design. Mirrors sebot_v1's "one core, many faces": the engine derives, a face renders.
Recorded decisions: deterministic timestamp source (git commit time or latest attest event),
local-only source links, one-tab-per-root grouping. Vendored cytoscape carried from
sebot_v1/sys/lib (pin the exact version so dagre layout stays deterministic).
