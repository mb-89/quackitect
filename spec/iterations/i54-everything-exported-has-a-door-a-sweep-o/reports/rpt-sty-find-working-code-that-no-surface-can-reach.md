---
kind: report
story: sty-find-working-code-that-no-surface-can-reach
spec: tsp-the-door-rule-refuses-and-reports
performed: 2026-08-26
performed_by: agent
---

# Demonstration — find working code that no surface can reach

## What was demonstrated

The sweep runs against the real tree and names every entry point that nothing
invokes, rather than reporting a hand-written list somebody has to maintain.

## Where it was performed, and why that matters

AGAINST THE REAL REPOSITORY, as the boot state's own exit script, not against a
fixture. A fixture proves the predicate. Only the real tree proves the answer is
worth reading.

THIS ONE IS WATCHED BECAUSE ITS FIGURE WAS WRONG TWICE during the build, in both
directions, and each wrong version looked right. Once it counted prose as an
invocation. Once it let a file certify itself with its own usage comment.

THE ENGINE THAT RAN IT IS THIS RECORD'S OWN BUILD. That had to be established
first: the long-lived server caches modules at import, so an earlier attempt was
answered by code that predated the build. The reload is what made the run
truthful, and the two lines below are how it showed.

## What was observed

The run printed, in full:

    sweep: 3164 node(s) under spec in 1133 ms
    markers green
    widget guard green

    door keeping-a-record-on-disk WARNS — 80 undeclared reach(es)
    - deliverable/engine/bases.ts
    - deliverable/engine/benchmark-guard.ts
    - deliverable/engine/benchmark.ts
    - deliverable/engine/bin/backfill-minted.ts
    - deliverable/engine/bin/battery.ts
    - deliverable/engine/bin/flow-closure.ts
    - deliverable/engine/bin/format-vault.ts
    - deliverable/engine/bin/grades-complete.ts
    - deliverable/engine/bin/hands-spawned.ts
    - deliverable/engine/bin/mermaid-check.ts
      and 70 more

    entry points WARN — 4 that nothing invokes
    - deliverable/engine/bin/brand.ts
    - deliverable/engine/bin/package.ts
    - deliverable/engine/bin/register-extension.ts
    - deliverable/engine/bin/se-manual.ts
    answer each with a door, a deletion, or the invocation somebody forgot

    sweep green, with 84 warning(s) above

## What that shows

FOUR ENTRY POINTS ARE NAMED, not counted. Each carries what somebody would need in order
to act on it. Nobody has acted, and this demonstration's own evidence form says
so rather than implying otherwise.

THE ANSWER CAME FROM THE TREE. The list the check used to read held six names
and had fallen behind the engine. Nothing here is maintained by hand.

THE WARNING SAYS WHAT TO DO. Each finding carries the three dispositions open to
it — a door, a deletion, or the invocation somebody forgot.

## What the demonstration does not show

WHETHER ANYBODY ACTS ON THE FOUR. The sweep names them; nothing makes them move.
That is the ratchet gap, and it is registered rather than claimed.

THAT THE COUNT IS COMPLETE. The rule sees only `deliverable/engine`, and it
cannot see a module that reaches disk through a spawned process. The sweep's own
output says both, in the same breath as the number.

AN UNCHECKED TREE READING AS GREEN. This run showed nothing either way: it
printed `sweep green, with 84 warning(s) above`, against a tree it did look at.

THE PROPERTY IS HELD BY A CASE, NOT BY THIS DEMONSTRATION.
`deliverable/tests/doors.test.ts` spawns the sweep against an empty root and
demands a non-zero exit. It was a real defect this record shipped and then
fixed, and that case is the evidence rather than this page.
