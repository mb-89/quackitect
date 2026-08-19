---
minted_in: i36
id: cluster-the-arrival
type: "[[cluster]]"
name: taking a fresh checkout on an unwatched machine to a caged agent standing on a live lane
coupling: sequence
source_refs:
  - the function DSM at M4 partition-functions, 2026-08-19
---

## Rationale

Eight functions run in a fixed order, each handing its output to the next:
resolve the cited refs, judge the runtime, supply the dependencies, place the
cage, raise the lane, hand over the means to call, account for the arrival,
and now identify the harness. None of them repeats, and skipping one leaves
the next with nothing to consume.

THE CLUSTER KEY EXISTED WITHOUT THE NODE. All eight `fn-arrive-on-a-machine.*`
functions already carried `cluster: the-arrival`, minted across i35 and i36,
and no `cluster-the-arrival` node was ever written. This mints it, on the
same shape as the other five standing clusters.

IDENTIFY-THE-HARNESS EXTENDS THE SEQUENCE RATHER THAN BRANCHING IT. It
consumes the same `flow-arrival-request` the rest of the cluster starts from,
and its own output, `flow-harness-profile`, crosses OUT of this cluster into
`cluster-the-walk`'s `serve-a-step` — the arrival hands off to the governed
walk exactly as raising the lane already does through `flow-live-lane`.
