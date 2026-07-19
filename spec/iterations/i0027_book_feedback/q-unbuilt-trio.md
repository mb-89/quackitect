---
id: q-unbuilt-trio
type: question
state: decided
decided_via: B
statement: Three M2-ruled features never entered the build tree. Defer, build now, or retire?
class: review
killer: false
provenance:
  state: user-ruling via chat (2026-07-19)
  decided_via: user-ruling via chat (2026-07-19) - build all three in i27; the owner reviews structure-layers and trace-collapsible at the gate
---
## The finding

The gate's tests-red check caught it mechanically: three requirement/test pairs from
the M2 rulings were never realized as build steps, and their selftests do not exist.

- req-models-useful / test-models-useful - per-model owner review before a model renders.
- req-structure-layers / test-structure-layers - the context -> structural -> onion routing.
- req-trace-collapsible / test-trace-collapsible - trace fan-outs collapsed into typed cluster nodes.

The 33-step batch covered every seeded b-step; these three sat in the iteration
outside the b-tree. The agent's first instinct (attributing them to existing regions)
was wrong and is reverted - the ledger shows them honestly unrealized.

## Options

A) DEFER all three pairs to the next iteration: scrap-defer with ready_when the i0028
   build, keeping the rulings alive and this gate honest about scope.

B) BUILD them inside i27 before the gate: reopens the build for one large feature
   (trace clustering) and two medium ones, with the red ritual run properly.

C) RETIRE any of the three whose ruling no longer earns its keep, reason recorded.

## Ruling (owner, 2026-07-19)

B - build all three inside i27. The root cause is named: the requirements were minted
in later discussions (expedition territory) and expedition mode has no implemented
integrate-back step, so the bake never saw them (noted for the retro). models-useful
rides the existing views-chosen adjudication as a render gate; structure-layers and
trace-collapsible are built as proposals the owner reviews at the gate - the owner
expects to be surprised and says so.

## Rationale (not load-bearing)
Not applicable - the options and the proposal above carry the reasoning.
