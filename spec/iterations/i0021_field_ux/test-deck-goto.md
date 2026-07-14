---
id: test-deck-goto
type: test
statement: A details-pane goto whose target sits inside a deck routes through the deck delegation and enters present mode at the target slide; a goto to chapter prose scrolls as before.
class: executed
verify: selftest:deck-goto
killer: false
tests_red: exempt - the delegation shipped inside i0019's bugfix batch before this test existed; no red is observable (adr-red-unobservable)
---
## Rationale (not load-bearing)
Bugfix class guard (NOTE-20260712-150519): bookGoto reached deck targets without the delegation
the hash rail has, scrolling an off-screen deck. Guards the class - ANY bookGoto entry to a deck
target - not just the termref instance. Verifies the existing req-deck-links.
