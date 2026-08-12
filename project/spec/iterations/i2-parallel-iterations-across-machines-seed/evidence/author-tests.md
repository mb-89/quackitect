---
form: author-tests
by: agent
signed_off: 2026-08-12T12:18:34.729Z
authors: agent
files:
---

# Evidence form / author-tests

## current_situation

Thirteen of i2's fourteen requirements stood uncovered; one (req-unshipped-dependency-refused) already rode tsp-record-lifecycle. Seven specs mint the coverage. Twelve rows verify by test, one by inspection, and every test file is named test-first to land with the M7 build.

## checks

The delta — the seven specs this iteration authored. The 31 standing specs from i1 ride the corpus unchanged.

| test-spec | method | verifies |
| --- | --- | --- |
| [[tsp-claim-lane]] | test | req-seed-lands-on-remote, req-claim-is-one-pushed-file, req-claim-race-first-push-wins, req-claim-wears-its-age, req-offline-claim-reconciles, req-force-release-recorded |
| [[tsp-claim-guardrails]] | test | req-machine-id-anonymous, req-engine-pushes-only-machinery |
| [[tsp-walk-branch-return]] | test | req-walk-branches-at-waypoint |
| [[tsp-seeded-scaffolds]] | test | req-pin-writes-seeded-scaffolds |
| [[tsp-node-scoping]] | test | req-nodes-scoped-to-iteration |
| [[tsp-boot-bench]] | test | req-boot-ends-at-front-desk |
| [[tsp-autonomy-tiers]] | inspection | req-autonomy-is-categorical |

## follow_up

specify-build assigns the promoted spike mechanism and the planned test files to build steps. The race step realizes the spike's measured pass against origin before the claim lane ships. The delta-by-default view (req-nodes-scoped-to-iteration) rides the build order per the owner's reiteration (note-db7c72bd519c).

## anything_else

