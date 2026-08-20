---
form: partition-functions
by: agent
signed_off: 2026-08-19T11:12:49.235Z
authors: agent
files:
---

# Evidence form / partition-functions

## current_situation

The DSM proposal placed all five new i36 functions in existing clusters and needed no rearrangement: identify-the-harness joined the-arrival, hold-the-session-through-work, name-the-stopping-layer and route-a-failure-shape joined the-walk, and tolerate-old-test-records joined the-record-life. Nothing moved, and nothing else in the tree needed re-clustering.

One resident gap was found and fixed, not caused by this change: all eight `fn-arrive-on-a-machine.*` functions have carried `cluster: the-arrival` since i35, and no `cluster-the-arrival` node was ever minted. It is minted now, on the same shape as the other seven standing clusters.

## clusters

| element | cluster |
| --- | --- |
| [[fn-run-a-governed-walk]] | [[cluster-the-account]] |
| [[fn-run-a-governed-walk.help-find-a-capability]] | [[cluster-the-account]] |
| [[fn-run-a-governed-walk.keep-the-record]] | [[cluster-the-account]] |
| [[fn-run-a-governed-walk.show-where-it-stands]] | [[cluster-the-account]] |
| [[fn-run-a-governed-walk.teach-the-newcomer]] | [[cluster-the-account]] |
| [[fn-run-a-governed-walk.work-the-register]] | [[cluster-the-account]] |
| [[fn-arrive-on-a-machine.account-for-the-arrival]] | [[cluster-the-arrival]] |
| [[fn-arrive-on-a-machine.hand-over-the-means-to-call]] | [[cluster-the-arrival]] |
| [[fn-arrive-on-a-machine.identify-the-harness]] | [[cluster-the-arrival]] |
| [[fn-arrive-on-a-machine.judge-the-runtime]] | [[cluster-the-arrival]] |
| [[fn-arrive-on-a-machine.place-the-cage]] | [[cluster-the-arrival]] |
| [[fn-arrive-on-a-machine.raise-the-lane]] | [[cluster-the-arrival]] |
| [[fn-arrive-on-a-machine.resolve-the-cited-refs]] | [[cluster-the-arrival]] |
| [[fn-arrive-on-a-machine.supply-the-dependencies]] | [[cluster-the-arrival]] |
| [[fn-run-a-governed-walk.stand-up-a-product]] | [[cluster-the-bootstrap]] |
| [[fn-run-a-governed-walk.rank-candidate-couplings]] | [[cluster-the-disposition]] |
| [[fn-run-a-governed-walk.record-a-coupling-disposition]] | [[cluster-the-disposition]] |
| [[fn-run-a-governed-walk.diverge-before-deciding]] | [[cluster-the-holding-pen]] |
| [[fn-run-a-governed-walk.hold-a-stray]] | [[cluster-the-holding-pen]] |
| [[fn-run-a-governed-walk.mint-an-option]] | [[cluster-the-holding-pen]] |
| [[fn-run-a-governed-walk.answer-a-structured-query]] | [[cluster-the-query]] |
| [[fn-run-a-governed-walk.answer-with-tests]] | [[cluster-the-record-life]] |
| [[fn-run-a-governed-walk.close-a-record]] | [[cluster-the-record-life]] |
| [[fn-run-a-governed-walk.hold-the-work]] | [[cluster-the-record-life]] |
| [[fn-run-a-governed-walk.keep-the-archive]] | [[cluster-the-record-life]] |
| [[fn-run-a-governed-walk.land-the-work]] | [[cluster-the-record-life]] |
| [[fn-run-a-governed-walk.offer-what-may-be-taken-up]] | [[cluster-the-record-life]] |
| [[fn-run-a-governed-walk.route-the-work]] | [[cluster-the-record-life]] |
| [[fn-run-a-governed-walk.tolerate-old-test-records]] | [[cluster-the-record-life]] |
| [[fn-run-a-governed-walk.catch-the-system-up]] | [[cluster-the-walk]] |
| [[fn-run-a-governed-walk.guard-a-write]] | [[cluster-the-walk]] |
| [[fn-run-a-governed-walk.hold-the-method]] | [[cluster-the-walk]] |
| [[fn-run-a-governed-walk.hold-the-session-through-work]] | [[cluster-the-walk]] |
| [[fn-run-a-governed-walk.judge-a-claim]] | [[cluster-the-walk]] |
| [[fn-run-a-governed-walk.name-the-stopping-layer]] | [[cluster-the-walk]] |
| [[fn-run-a-governed-walk.resolve-a-path]] | [[cluster-the-walk]] |
| [[fn-run-a-governed-walk.route-a-failure-shape]] | [[cluster-the-walk]] |
| [[fn-run-a-governed-walk.serve-a-step]] | [[cluster-the-walk]] |

## follow_up

None owed. The one gap found (the missing cluster-the-arrival node) is fixed rather than carried.

## anything_else

Coupling classes for every cluster this change touched, none of them argued with:

- cluster-the-arrival - sequence. Eight functions run in a fixed order from a fresh checkout to a caged agent on a live lane; identify-the-harness extends the sequence rather than branching it, consuming the same flow-arrival-request the cluster starts from.
- cluster-the-walk - shared-data (unchanged since i1/i27). name-the-stopping-layer and route-a-failure-shape both consume flow-dispatched-call, already shared by serve-a-step and guard-a-write; hold-the-session-through-work consumes flow-position, already shared by hold-the-work and serve-a-step.
- cluster-the-record-life - same-lifecycle (unchanged since i1). tolerate-old-test-records is the thinnest tie in this cluster, the same way catch-the-system-up was the thinnest tie in the-walk at i1: it shares no flow with its neighbours, but it is the same material — a record's own historical evidence — seen from boot's end rather than the archive's.

The other four standing clusters (the-account, the-bootstrap, the-disposition, the-holding-pen, the-query) gained no member this pass and keep their i1/i15 names and coupling classes unargued.
