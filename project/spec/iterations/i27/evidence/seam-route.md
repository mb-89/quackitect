---
form: seam-route
by: agent
signed_off: 2026-08-14T15:21:42.273Z
authors: agent
files:
---

# Evidence form / seam-route

## current_situation

ROUTING IS NOT RESOLUTION, and the engine can now tell them apart.

routeToOwner answers who owns a path and never refuses. A path that RESOLVES outside its record is still refused by the seam; a call naming a different OWNER is answered instead of blocked.

THREE OWNERS. The core owns session state and method, a record owns its own folder, and everything else rides the bound tree.

THIS IS THE DISTINCTION SE-C-134 GETS WRONG TODAY. It refuses a method write from inside a record, where the honest answer is that the core owns method and the call belongs there. The refusal has fired four times in this session alone, once on the very state that was authoring its test.

## built

project/deliverable/engine/paths.ts — routeToOwner and the Owner type, added beside fansOut.

project/deliverable/tests/resolution.test.ts — four cases: the owner is named for each of the three kinds, a method path and a session path both route to the core, and routing answers where resolution refuses.

VERDICT: 16 of 16 green in tests/resolution.test.ts, and 66 of 69 across claims, pull, refusals, remedies and drift. The three failures are later chunks' reds, not regressions.

## follow_up

SE-C-134 IS NOT REMOVED BY THIS CHUNK. routeToOwner makes the right answer computable; the guard still refuses rather than routes. Removing it needs the core to exist, which is core-process.

WHAT THE NEXT CHUNKS USE IT FOR. delta-compose asks the owner before it composes, and the seam asks it to decide refuse-or-route on every call.

## anything_else

THE FUNCTION NEVER REFUSES, and that is the whole design rather than an omission. Refusing is the seam's act and it happens elsewhere. Mixing the two is what closes the door that method changes and commits both use, and it is why this is a separate function rather than a branch inside resolveInRoot.
