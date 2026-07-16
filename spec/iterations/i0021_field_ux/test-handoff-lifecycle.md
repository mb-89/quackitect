---
id: test-handoff-lifecycle
type: test
statement: A one-shot hand-off server exits "unopened" when no page connects within the bound. It exits "closed" when a connected page stops heartbeating (no answer recorded, the injected bless never fires). It exits "y" when the page answers. The recorded answer fires the injected bless exactly once.
class: executed
verify: selftest:handoff-lifecycle
killer: false
tests_red: exempt - red observed at birth; the owner-ruled M6 design rounds of 2026-07-14 moved the hash after the build (adr-red-unobservable)
---
