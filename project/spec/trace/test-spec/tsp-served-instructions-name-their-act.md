---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: tsp-served-instructions-name-their-act
type: "[[test-spec]]"
statement: Every pull answer names an act the reader can perform, or names whose act it is, verified by test across the wait and do source-shape branches.
method: test
verifies:
  - req-a-served-instruction-names-the-next-act
files:
  - project/deliverable/tests/stuck-wait.test.ts
  - project/deliverable/tests/stuck-do.test.ts
---

## Scope

Covers all three measured failure shapes named on the requirement: a signed-but-unblessed gate re-served with generic fill advice, a wait carrying an offered door it says it cannot route to, and a do that cannot move answering with a stopped step that said nothing. Out of scope: the person-facing UI rendering of the act, and any act naming beyond the pull answer itself.

## Approach

Source-shape tests, pinned to the exact branch of engine/session.ts each failure lives in. A walking-fixture reproduction was tried first for the wait case and rejected: reproducing the fallen-claim precondition needs a signed chain with an upstream claim invalidated beneath it, which a fresh root cannot construct, and a first attempt passed vacuously - worse than no test. Source-shape assertions on the actual branch text cannot go vacuous the same way. This is a must requirement graded corrosive because it never presents as a fault, so the tests pin the exact remedy shape rather than only the branch's existence.

## Steps

- stuck-wait.test.ts, the unroutable wait asks the claim guard what is in the way - the unroutable-wait branch calls whyGrey and threads blocked_by into the answer, rather than computing a blockerless message.
- stuck-wait.test.ts, the advice on a blocked wait sends the reader to the blocker, not to the doors - the advice text names blocked_by and, while a blocker stands, never hands over the offered-door choice as the way forward.
- stuck-wait.test.ts, a wait with no blocker and no door still names an act, and that act is stopping - the empty case still names STOP as the act, never leaving a bare description.
- stuck-do.test.ts covers the sibling do-cannot-move shape: when nothing is owed and no target is set, the answer carries the reachable doors rather than a silent stall.
