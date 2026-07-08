---
id: need-implementation
type: need
source: stk-developer-maintainer
statement: As a builder I need the build phase to be test-first — author the tests, observe them RED, then implement to GREEN — with the test-designer, implementer, and tester pluggable per deliverable, so implementation rigor is enforced structurally, not by agent goodwill.
class: review
killer: false
---
## note (not load-bearing)
Dogfood: quackitect's own build method, typed. New in i0007.

## Success criteria
- Every mechanized test is observed failing before it first passes. Metric: the share of mechanized tests with a recorded RED observation before their first pass. Target: all of them.
