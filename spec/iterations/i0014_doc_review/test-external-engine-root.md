---
id: test-external-engine-root
type: test
statement: The global binary resolves its resource layer LIVE for an external workspace. The workspace wins when it carries the layer, else the recorded engine home applies. After one run inside the repo, a complete external stub drives a full-graph command clean.
class: executed
verify: selftest:external-engine-root
killer: false
tests_red: exempt - amended 2026-07-09 to the live-pointer model the owner ruled mid-fix (no copy, no drift); the red at the amended statement was unobservable, the class red stands at the original observation (adr-red-unobservable)
---
## Rationale (not load-bearing)
Class-guard for `bugreport-external-stub-engineroot.md` (owner, 2026-07-08): `engineRoot()` walked for a dead `.quack` ancestor and fell back to the driven workspace, so an external stub lost the type layer and strict refused the example connection. Guards the CLASS (owner rule 2026-07-09): the resolution matrix + the cross-machine chain (no pointer -> one run inside the repo heals it -> the FULL stub skeleton drives clean). Resources resolve LIVE from the engine repo, never a copy - a resource edit there changes every stub (owner ruling). Verifies req-workspace-split. Bugfixes ride the active iteration - no dedicated iteration (owner rule 2026-07-09).
