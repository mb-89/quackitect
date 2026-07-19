---
id: test-io-busbar
type: test
statement: The reflexion diff runs clean (no world contact outside the rim, no sky-fall, no inward violation) and the onion carries an honestly-tapped disk busbar.
class: executed
verify: selftest:io-busbar
killer: false
tests_red: exempt - the red was observed at the pre-reword hash; this amend only rewords the statement for voice after the build went green, so no red is observable (adr-red-unobservable)
provenance:
  statement: agent-authored at b29 per the q-coverage-ids-physics ruling (owner, B)
  class: schema-default (executed)
  killer: schema-default (false)
  verify: agent-authored
---
## Rationale (not load-bearing)
The b29 physics enforcement. The ruling (q-coverage-ids-physics, B): external I/O goes through the layers; a kernel element never touches the world directly; disk I/O crosses the onion on an I/O busbar like any other input. This test pins the law mechanically - any future kernel world-contact or unallocated region fails the battery.
