---
id: test-orphan-render-refs
type: test
statement: A node rendered only through a base view's rows raises no orphan finding; a node reachable through no manifest and no view still does.
class: executed
verify: selftest:orphan-render-refs
killer: false
tests_red: exempt - the view-ref behavior landed in i12 bs16 before this iteration composed; a red state is unobservable; the case guards against regression
---
## Rationale (not load-bearing)
TODO
