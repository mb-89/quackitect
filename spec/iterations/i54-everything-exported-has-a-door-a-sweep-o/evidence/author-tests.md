---
form: author-tests
by: agent
signed_off: 2026-08-26T13:47:26.064Z
authors: agent
files: null
---

# Evidence form / author-tests

## current_situation

Two test specs and one test file stand, covering all six requirements this record minted.

### The split is by method, because the method must match

Three requirements verify by TEST and three by INSPECTION. A spec's method must equal the `verify_method` of every requirement it verifies, so they cannot share one spec.

- `tsp-the-door-rule-refuses-and-reports` covers the three that can be measured under controlled conditions.
- `tsp-the-door-regime-s-static-attributes` covers the three that are properties of the source as written.

### What the test file defines

`deliverable/tests/doors.test.ts` holds 18 cases and, being test-first, it DEFINES the interface of `deliverable/engine/doors.ts`, which does not exist yet.

The module it names must export a rule table, a lookup by name, the reachers and departures for a door, the stray finder, and two guards - one refusing an undeclared reach and one refusing a departure with no reason.

### Where the design methods came from

Each was picked from the shape of its demand rather than from taste.

- Equivalence classes over the four shapes a departure line can take.
- Boundary values either side of the shortest non-empty reason.
- A fault-based case for the enumeration, injecting the exact fault this record exists to fix.
- A negative case per guard, because a guard that never refuses passes every positive case.

### Two cases exist only to stop a silent pass

An empty enumeration and an empty rule table would each pass every other assertion in the file. The widget guard learned that once and carries its own second case for it; both are inherited here.

## checks

| test-spec | method | verifies |
| --- | --- | --- |
| [[tsp-the-door-regime-s-static-attributes]] | inspection | req-no-setting-disables-every-rule-at-once · req-one-rule-is-expressed-once-and-read-by-two-callers · req-a-door-is-named-for-the-conversation-it-governs |
| [[tsp-the-door-rule-refuses-and-reports]] | test | req-the-reachability-guard-enumerates-exports-from-the-source · req-an-exemption-without-a-reason-is-refused-at-write-time · req-absence-from-the-exemption-list-means-not-exempt |

## follow_up

- `specify-build` breaks the module into chunks. The test file already names every export it must carry, so the chunking has a fixed target rather than a sketch.
- `observe-red` will see the file fail on a missing import, because `deliverable/engine/doors.ts` does not exist yet. That is the test-first red rather than a defect.
- The rule module must take a ROOT on every call. `widgets.ts` documents at lines 118 to 125 how resolving its own directory made a linked engine read the wrong list and report every declared exemption as a violation. The tests demand a root parameter so that cannot recur.
- The inspection spec's checklist names two items with mechanical support, and both cases are already in the test file. The naming criterion is deliberately not mechanised, because a word list pretending to judge a name would be a false green.

## anything_else

The typechecker already reports what `observe-red` will observe.

`tests/doors.test.ts(25,8): error TS2307: Cannot find module '../engine/doors.ts'` is the test-first red arriving early, on the write rather than on a run. Four further errors are the same absence showing through as untyped parameters.

That is the lane running the typechecker after every source write, and it is the fastest red this record will get.
