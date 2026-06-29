---
id: report-requirements
type: requirement
refines: [uc-review-report]
statement: The report's requirements, each checkable. (a) Deterministic byte-identical HTML on an unchanged ledger. The timestamp comes from a deterministic source (git HEAD), not the wall clock. (b) Self-contained single file. All CSS and JS inline. No network or CDN. Opens from file://. (c) Three-column layout per design/dashboard_draft.md. LEFT: iterations, expandable, current open. MIDDLE: the trace-graph of the DESIGN DAG, top-to-bottom, foundation on top, one tab per root. RIGHT: Details, then Metrics, then What's-next. (d) Trace nodes are colour-coded by verifier class. Border = state. A star = killer. A legend explains it. (e) A persistent right-column Details panel, fed by graph-node and iteration-row clicks, shows the load-bearing fields inline (id, class, state, killer, statement, deps, verify), with a details link to the prose source (new tab. Graceful fallback when absent) and a placeholder when nothing is selected. (f) Clicking the project title shows project info. Clicking an iteration shows its motivation and status, plus type/rigor when active, 'tbd' when planned. (g) Each iteration.md carries a status and a motivation. Planned versions (meta only, no checks) appear as 'planned'. (h) The integrity header shows the Merkle-root fingerprint. (i) Every metric shows its formula. Ledger-uncomputable ones (reversal, rework, self-cert) are explicitly deferred. (j) No duplicated data (DRY). Each datum appears once. (k) External links open in a new tab. Source links resolve locally.
depends_on: [report-frame]
class: review
killer: true
---

## Rationale (not load-bearing)
L2/Requirements. These are the checkable requirements the report must keep satisfying — the
**regression guard**: a future change that drops the Details panel, breaks determinism, or
re-introduces duplicated data contradicts a lettered clause here, and editing this statement
reopens the whole downstream cone (design -> impl -> determinism/docs/packaged) SUSPECT for
re-attestation. (a)-(c), (h)-(i) were in the original plan; (d)/(e)/(f)/(g)/(j)/(k) were decided
during the build and are folded back so they cannot silently degrade. Full log:
design/report-decisions.md.
