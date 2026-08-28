---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-iss-a-function-may-name-a-cluster-that-does-not-exist
type: "[[raid]]"
kind: issue
statement: A function's cluster field can name a group no cluster node declares, and nothing anywhere reports it — the field holds a bare name, every offer list and every lookup speaks node ids, and the dangling-reference guard does not read the field at all.
owner: the walking agent
trigger: M4 partition-functions naming a new cluster, and any later form whose picks are drawn from the declared clusters
status: open
impact: This iteration declared the-sizing at partition-functions and signed the state. No cluster node was written. Every downstream form that offers the declared clusters offered eight and could not name the one the iteration was about, and the morphological chart's cluster lookup misses for every option that names a cluster rather than a design question — CORRECTED at gate-candidates, where a hostile pass caught this field claiming forty-nine FUNCTIONS. stateform.ts:333 filters to option nodes and function nodes never reach the lookup at :347, which the node's own body already said three paragraphs further down. The impact was inflated and the body was right.
breaks_how_badly: abrasive
how_likely: expected
probe: "THREE REPRESENTATIONS OF ONE FACT, each verified by reading. (1) The stored form is bare: every function node carries `cluster: the-walk`, measured across spec/trace/function — nine distinct values, none prefixed. (2) The offered form is a node id: stateform.ts:560 resolves $clusters to clusterItems, which is typedItems(traceRoot, 'cluster') and returns cluster-the-walk. Before cluster-the-sizing was written the offer list held eight entries and the corpus held nine cluster values on functions; after writing it, nine and nine. (3) The guard never looks: engine/guard.ts:18 lists nine REFERENCE_KEYS and cluster is not among them, and adding it would not help, because fileForId at vocabulary.ts:129 resolves by declared id prefix and returns undefined for the-sizing, which guard.ts:54 then skips silently. The same mismatch is visible in stateform.ts:347, where an option's cluster is looked up in a map keyed by node id."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
weighs_with: none
weighs_against: none
place: i44-the-corpus-resolves-duplicate-headings-a
---

## Graded off the scale, corrected 2026-08-20

THIS ENTRY SAID \`how_likely: certain\`. THE SCALE OFFERS expected, plausible,
conceivable. \`deliverable/engine/bin/grades-complete.ts\` refuses the
whole register while any entry sits outside it, and it refused at
\`rank-unknowns\`' exit — which is the first state that runs it.

\`expected\` IS THE HIGHEST THE SCALE HAS and it is what this entry now carries.

WHAT "CERTAIN" WAS TRYING TO SAY, and the scale cannot hold it: this is not
something that MIGHT happen. It is a consequence the design chooses. A likelihood
scale measures whether a thing occurs; it has no value for a thing that is true
by construction.

THE DISTINCTION IS REAL AND BELONGS SOMEWHERE ELSE. A consequence a design
accepts is a decision's cost, recorded on the decision. A risk is something that
might realise. Writing "certain" onto a likelihood field collapses the two, and
four entries in this record did it independently — which is a vocabulary gap
rather than four mistakes.

## The field is not a reference, so nothing treats it as one

THE ITEM DOC SAYS OTHERWISE. `deliverable/machines/items/function.md:225` calls
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
