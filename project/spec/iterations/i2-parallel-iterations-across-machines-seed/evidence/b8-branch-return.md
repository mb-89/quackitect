---
form: b8-branch-return
by: agent
signed_off: 2026-08-12T13:57:19.488Z
authors: agent
files:
---

# Evidence form / b8-branch-return

## current_situation

The build fan cost an escape per strand all day; this chunk teaches the route to prefer the drawn return over the loop-the-machine line.

## built

The branch return prefers the fork.

- routeWraps (engine/route.ts): a found route that leaves the machine both ends stand in — out through the record's end and back in at its start — is a wrap, detected by the shared machine prefix.
- The route assembly (engine/session.ts) now tries the drawn branch return when the forward route wraps, not only when no route exists; an OR branch is still never offered.
- tests/branch-return.test.ts pins the detector: the fan-sibling loop wraps, an in-machine forward route does not, and a cross-machine route through idle is never a wrap.

Scoped run: 22 of 22 green across branch-return, drawnsub, pull and pull-offer (job test-msq53gt7-1). The live half shows in this very walk: whether the next chunks arrive without an escape is the running proof, and the mid-record fan fixture stays the drawnsub suite's own noted piece of work.

## follow_up

b9 and b10 sign next; the fan's behavior under the new walker is observed as they arrive.

## anything_else

