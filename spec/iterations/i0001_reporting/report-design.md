---
id: report-design
type: adr
addresses: [report-requirements]
statement: The approach is chosen with a recorded reason. The engine derives a pure ReportModel from .quack/attest.json plus the check DAG. It renders that into a FROZEN report_template.html, authored once off the excalidraw draft (Claude Design). Vendored cytoscape is inlined for the trace graph. The determinism boundary: all data and derivation are deterministic, and the aesthetic shell is frozen at author time. No model or network call at report time.
depends_on: [report-requirements]
class: review
killer: false
---

## Rationale (not load-bearing)
L3/Design. Mirrors sebot_v1's "one core, many faces": the engine derives, a face renders.
Recorded decisions: deterministic timestamp source (git commit time or latest attest event),
local-only source links, one-tab-per-root grouping. Vendored cytoscape carried from
sebot_v1/sys/lib (pin the exact version so dagre layout stays deterministic).
