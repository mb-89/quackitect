---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: tsp-guidance-names-only-what-exists
type: "[[test-spec]]"
statement: The guidance names only lane verbs the engine registers, paths that resolve from the project root, and refusal clauses the engine can raise, verified by test.
method: test
verifies:
  - req-guidance-names-only-what-the-engine-has
files:
  - project/deliverable/tests/guidance-verbs.test.ts
---

## Scope

Covers every guidance page and machine state note the walk is served: lane-verb names, file paths, and refusal clause numbers. Out of scope: whether a sentence's claim is true beyond set membership, which is judgment rather than a mechanical check.

## Approach

Component-level source scan, sweeping every guidance page for se_ verb names, root-relative paths and SE-C-NNN clause numbers, checked against the actual registered tool list, filesystem, and errors.ts respectively. A NOT BUILT YET or RETIRED marker is the documented exemption door on either side. Depth is full sweep rather than sampling: the failure mode (a name that resolves to nothing) costs the reader three to five calls to discover per miss, and the sweep is cheap relative to that cost.

## Steps

- guidance-verbs.test.ts, every lane verb the guidance names is a verb the lane registers - every se_ name found in guidance text is either registered, in the NOT_A_VERB exemption list, or under a NOT BUILT YET marker.
- guidance-verbs.test.ts, every file path the guidance names resolves from the project root - every path-shaped token in guidance text either exists at the root, is a runtime-written path, or is marked NOT BUILT YET.
- guidance-verbs.test.ts, every refusal clause is documented, and every documented clause exists - every SE-C-NNN the engine can raise appears on the refusals page, and every clause the refusals page documents is either raised by the engine or marked RETIRED.
