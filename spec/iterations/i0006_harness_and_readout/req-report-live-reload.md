---
id: req-report-live-reload
type: requirement
refines: [uc-engine-correctness]
statement: The HTML report always recomputes live (no cached state.json snapshot), so it can never show a cached pass. It carries a live-reload hook; `quack report --watch` serves it via a zero-dep net/http server and pushes a reload only when a source input (spec/product/attest) actually changes. A killer or milestone bless triggers a report refresh so the board reflects the adjudication.
class: review
killer: false
---
## Rationale (not load-bearing)
i0006. Replaces the snapshot-read (the one place a stale/cached pass could surface) with live recompute, plus opt-in live-reload and a bless-time refresh trigger.
