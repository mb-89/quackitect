---
id: test-graph-suffix-rooted
type: test
statement: A design implementing a numbered statement (req-x.2) and a test verifying one (req-x.1) root under req-x's need tab, with no (unrooted) tab. Iterations and age never enter the trace graph: no age-fold box and no phantom i0000_baseline group renders, fixture and live. The engine's own workspace renders fully rooted.
class: executed
verify: selftest:graph-suffix-rooted
killer: false
---
## Rationale (not load-bearing)
Bugfix class guard (owner catch at i21 plan review): 151 design nodes - every marker written in
the numbered-statements style - rendered unrooted as gray fold boxes. The one suffix helper
(go-sub-addressing) applied at the strict referee and the lane merge but not at the graph's edge
builder, so code-scanned implements targets matched nothing. Guards the class end-to-end: unit
fixture plus the live workspace staying fully rooted. Verifies the existing req-trace-clustered.
