---
id: report-requirements
statement: The report's requirements, each checkable — (a) deterministic byte-identical HTML on an unchanged ledger, timestamp from a deterministic source (git HEAD) not wall-clock; (b) self-contained single file, all CSS/JS inline, no network/CDN, opens from file://; (c) three-column layout per design/dashboard_draft.md — LEFT iterations expandable (current open), MIDDLE trace-graph of the DESIGN DAG laid top-to-bottom (foundation on top) one tab per root, RIGHT Details -> Metrics -> What's-next; (d) trace nodes colour-coded by verifier class with border=state, a star=killer, and a legend; (e) a persistent right-column Details panel, fed by BOTH graph-node and iteration-row clicks, shows the load-bearing fields inline (id/class/state/killer/statement/deps/verify) with a 'details' link to the prose source (new tab; graceful fallback when absent) and a placeholder when nothing is selected; (f) clicking the project title shows project info; clicking an iteration shows its motivation + status (+ type/rigor when active, 'tbd' when planned); (g) each iteration.md carries status + a motivation; planned versions (meta only, no checks) appear as 'planned'; (h) integrity header shows the Merkle-root fingerprint; (i) every metric shows its formula, with ledger-uncomputable ones (reversal/rework/self-cert) explicitly deferred; (j) no duplicated data (DRY) — each datum appears once; (k) external links open in a new tab and source links resolve locally.
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
