---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-iss-a-function-may-name-a-cluster-that-does-not-exist
type: "[[raid]]"
kind: issue
statement: "A function's cluster field can name a group no cluster node declares, and nothing anywhere reports it — the field holds a bare name, every offer list and every lookup speaks node ids, and the dangling-reference guard does not read the field at all."
owner: the walking agent
trigger: "M4 partition-functions naming a new cluster, and any later form whose picks are drawn from the declared clusters"
status: open
impact: "This iteration declared the-sizing at partition-functions and signed the state. No cluster node was written. Every downstream form that offers the declared clusters offered eight and could not name the one the iteration was about, and the morphological chart's cluster lookup misses for all forty-nine functions in the corpus, not only the new ones."
breaks_how_badly: degraded
how_likely: certain
probe: "THREE REPRESENTATIONS OF ONE FACT, each verified by reading. (1) The stored form is bare: every function node carries `cluster: the-walk`, measured across project/spec/trace/function — nine distinct values, none prefixed. (2) The offered form is a node id: stateform.ts:560 resolves $clusters to clusterItems, which is typedItems(traceRoot, 'cluster') and returns cluster-the-walk. Before cluster-the-sizing was written the offer list held eight entries and the corpus held nine cluster values on functions; after writing it, nine and nine. (3) The guard never looks: engine/guard.ts:18 lists nine REFERENCE_KEYS and cluster is not among them, and adding it would not help, because fileForId at vocabulary.ts:129 resolves by declared id prefix and returns undefined for the-sizing, which guard.ts:54 then skips silently. The same mismatch is visible in stateform.ts:347, where an option's cluster is looked up in a map keyed by node id."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
weighs_with: none
weighs_against: none
---

## The field is not a reference, so nothing treats it as one

THE ITEM DOC SAYS OTHERWISE. `project/deliverable/machines/items/function.md:225` calls
the field "a cluster id, written at M4", and the doc comment on `clusterItems`
says a function cannot belong to a cluster nobody has named. Neither is true of
the running system.

WHAT THE CORPUS ACTUALLY DOES is store a bare name and rely on nobody checking.
That has worked for twenty-three iterations because the eight resident clusters
were minted together at i15 and nothing added one until now.

THE FIRST TIME IT MATTERED, IT COST SOMETHING SMALL AND VISIBLE. The heuristic
sweep at M4 could not hold a rule against the cluster the whole change is about,
because the offer list is drawn from the nodes and the node did not exist. The
sweep was run after minting it by hand.

## Why this is degraded and not crippling

NOTHING WRONG GETS SAVED — a missing cluster node does not corrupt a function,
and the partition table renders from the function keys either way. What is lost
is the offer: a form that asks the author to pick among declared clusters offers
an incomplete list and gives no sign that it is incomplete.

AND THE MORPH CHART LOOKUP IS ALREADY DEAD, which is the wider half. stateform.ts:347
places an option by `byCluster.get(bare(cluster))` against a map keyed by node id,
so a bare-named cluster never matches and every option without a `question` falls
to the unplaced row. That is invisible today because this iteration's options all
carry a question, and a question row evicts the cluster rows entirely.

## What would settle it

ONE REPRESENTATION, PICKED ON PURPOSE. Either the field holds the node id and the
guard's key list gains `cluster`, or the field stays bare and the lookups strip
the prefix in one place instead of three. The second is cheaper and the first is
the one the item doc already claims.
