---
minted_in: i2
id: tsp-claim-guardrails
type: "[[test-spec]]"
statement: The claim lane's outbound surface carries no personal datum and pushes nothing beyond seed stubs and claim files — verified by test at the lane's git boundary.
method: "test"
verifies:
  - "req-machine-id-anonymous"
  - "req-engine-pushes-only-machinery"
files:
  - "tests/claims.test.ts"
---

## Scope

The two constraints guarding the claim lane: the anonymous machine id
and the surgical scope of the engine's push right. The lane's behavior
is [[tsp-claim-lane]]. The never-push law itself (SE-C-003) stays
covered by the git-lane suite; this spec covers exactly the two
sanctioned exceptions.

## Approach

Component level at the git boundary, with a bare origin per case.
Fault-based on the boundary: the cases try to push what must refuse and
inspect what does travel. Both rows grade fatal or corrosive, so each
constraint gets its negative case, not only the happy path.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- first boot mints a random short machine id (eight hex), stores it
  machine-locally outside git, and reuses it across boots
- no hostname, no username and no personal datum appears in any pushed
  artifact — the case sweeps the pushed refs' content
- a push of anything beyond a seed stub or a claim file refuses — the
  relaxation of the never-push rule is exactly two artifacts wide
- an agent-requested push stays refused, unchanged
