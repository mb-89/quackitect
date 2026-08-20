---
form: find_by_heuristic
by: agent
signed_off: 2026-08-20T12:08:28.197Z
authors: agent
files:
---

# Evidence form / find_by_heuristic

## current_situation

Eleven options stood from four finders when this state opened — five from prior art, two each from contradiction, analogy and trimming. This state holds a fixed catalogue of eight rules against the same cone and asks what each one implies that nothing has said yet.

THE CONE IS TWO CLUSTERS, NOT ONE. Of the five functions this change derives, four land in the-sizing and one in the-account. Holding every heuristic against the-sizing alone would have missed both of the account bites, so the sweep names its cluster per row.

ONE OF THE EIGHT CLUSTERS DID NOT EXIST WHEN THIS STATE OPENED. partition-functions declared the-sizing and no cluster node was ever written for it, so the offer list this form draws from could not name the very cluster the iteration is about. The node was minted before the sweep ran; see follow-up.

## applies

yes

## sweep

| heuristic | cluster | what_it_suggests |
| --- | --- | --- |
| Group what changes together; separate what changes apart. | cluster-the-sizing | the rung mapping and the model roster move on different clocks — a vendor retires a model, we revise a policy — so they are two records, not one ladder file (opt-the-roster-and-the-mapping-are-two-records-on-two-clocks) |
| Make the common case cheap; make the rare case possible. | cluster-the-sizing | consecutive states mostly share a rung, so publish the driver only when the answer moves and let absence mean the standing answer holds (opt-publish-the-driver-only-when-it-changes) |
| One source of truth; everything else derives. | cluster-the-sizing | nothing — req-one-model-list-is-read-live-from-the-repository and req-the-complexity-value-is-read-live-and-never-pinned already say this, and the fatal one says it in the strongest form the corpus has |
| Push decisions to the last responsible moment. | cluster-the-sizing | nothing new — the fork is already on the chart from both sides, opt-score-the-work-at-dispatch-instead-of-declaring-it pushing it later and opt-the-decision-is-fixed-within-a-run-and-revised-between-them pulling it earlier |
| Make the illegal unrepresentable, not merely checked. | cluster-the-account | a record carrying neither the named driver nor a stated reason should not be a valid record, which closes the silence in the design's only safety rule (opt-a-driver-claim-cannot-be-made-without-a-driver-or-a-reason) |
| Small interfaces between big parts beat the reverse. | cluster-the-sizing | nothing to add — the cluster was cut by this measurement, two edges in and out (flow-compiled-machine, flow-instruction), which is why the block is substitutable at all |
| If it must be remembered, it must be recorded. | cluster-the-account | the named driver is a fact about the moment of the call and cannot be re-derived once the matrix moves, so the record carries both it and the one that answered (opt-the-record-carries-both-the-named-driver-and-the-one-that-answered) |
| The default should be the safe thing. | cluster-the-sizing | nothing — and it confirms rather than challenges: req-an-unmatched-rung-names-itself-and-publishes-no-driver already picks fail-loud over a guessed driver, which is the safe default here |

## options

- opt-publish-the-driver-only-when-it-changes
- opt-a-driver-claim-cannot-be-made-without-a-driver-or-a-reason
- opt-the-roster-and-the-mapping-are-two-records-on-two-clocks
- opt-the-record-carries-both-the-named-driver-and-the-one-that-answered

## follow_up

FOUR OF EIGHT BIT, AND THE OTHER FOUR ARE NOT WASTE. Three of the silent four confirmed a standing requirement rather than proposing anything, and one found the chart already held both sides of its fork. A catalogue sweep that produced eight new options would be the suspicious result.

THE ACCOUNT CLUSTER CARRIES A HOLE THE OTHER FINDERS WALKED PAST. req-a-weaker-driver-than-named-owes-a-recorded-reason obliges a reason for a divergence no record can currently show, so as it stands the obligation is unenforceable, and both audit options depend on the same missing comparison. That is a defect in the requirement set, not only a candidate on the chart — it should be tested at gate-design and, if it survives, the requirement wants amending rather than the option winning.

A CLUSTER WAS NAMED WITHOUT BEING DECLARED, AND THE REASON IS WORSE THAN AN ABSENT CHECK. Three representations of one fact are in play. The function nodes store `cluster: the-walk` — a bare name, which is what all forty-nine of them carry. The offer list `$clusters` serves `cluster-the-walk` — a node id. The dangling-reference guard in engine/guard.ts:18 does not list `cluster` among its REFERENCE_KEYS at all, and would not catch it if it did: fileForId at engine/vocabulary.ts:129 resolves by id prefix, `the-sizing` starts with no declared prefix, so the guard returns undefined and skips the value silently. The same mismatch shows in the morphological chart, where stateform.ts:347 looks an option's cluster up in a map keyed by node id. Logged as an issue for the register; the missing node itself is now written.

## anything_else

