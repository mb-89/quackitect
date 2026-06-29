---
id: req-coverage
type: requirement
refines: [uc-review-readout]
statement: Milestones are DERIVED coverage gates over the typed trace, not hand-authored. The rule is n>=1 for every layer link. Every need has at least one use-case. Every use-case has at least one requirement. Every requirement has at least one design that implements it, and at least one test that verifies it. No node is an orphan. Every node traces up to a need. By phase: a test definition first, then a passing test. Each gate's pass is computed from the trace, never stored. A lint surfaces the holes.
depends_on: [req-split]
class: review
killer: false
---

## Rationale (not load-bearing)
M2. Coverage = n>=1 over each edge type (refines / implements / verifies), both directions
(downward completeness + no upward orphans). Mirrors sebot (gate pass derived) and the RTM.
