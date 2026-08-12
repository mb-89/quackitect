---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: sty-ask-the-tests-a-question
type: "[[story]]"
statement: An engineer who has just changed something asks the tests one question and gets one answer, instead of running everything and reading a wall.
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
priority: should
---

## Deck

The engineer has just changed how one check matches a line. Four files could plausibly break. Running everything takes over a minute and buries the answer in eight hundred passes.
|||
A real sitting: the M8 recut of 2026-08-11 touched the matrix parser, the state laws and three test files; the battery runs ~64 s.

---

They name the scope instead: the files that could answer the question. Nothing else runs.
|||
Scoped runs are the lane's default; SE-C-131 computes the scoped-versus-battery flip point and refuses the wrong scope (guidance/refusals.md).

---

Seconds later the answer comes back as structure, not console output. Totals, and the failures themselves with their assertions.
|||
se_test returns counts plus only the failures' detail; the 2026-08-11 run answered "tests 1087, fail 3" with the three assertions whole.

---

Three are red. The walk does not move. Nothing is marked known-broken and no red is carried forward as acceptable.
|||
The three reds of 2026-08-11: rigor-matrix.test.ts at lines 90, 124 and 214, each pinning the pre-recut shape.

---

Each red is understood before it is touched. Two were the change; one was a test asserting the old rule, which gets rewritten to assert the new one.
|||
All three were tests asserting the superseded shape; re-pinned to the new rule in trunk commit 2dd52fec, none suppressed.

---

The scope runs green. The engineer moves on, and the full battery waits for the gate where it is earned.
|||
The re-run of 2026-08-11: 1087 of 1087 green, verdict self-recorded (se_test_verdict in the call log).

---

One question, one answer, seconds. The run that finished fast answered something worth asking, and the run that takes a minute still means something when it comes.
|||
The discipline is written where it binds: guidance/craft/software.md "THE BATTERY IS THE EXCEPTION, NOT THE HABIT".
