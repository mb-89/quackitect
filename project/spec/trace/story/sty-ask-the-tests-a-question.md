---
id: sty-ask-the-tests-a-question
type: "[[story]]"
statement: An engineer who has just changed something asks the tests one question and gets one answer, instead of running everything and reading a wall.
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
killer: false
---

## Deck

The engineer has just changed how one check matches a line. Four files could plausibly break. Running everything takes over a minute and buries the answer in eight hundred passes.
|||

---

They name the scope instead: the files that could answer the question. Nothing else runs.
|||

---

Seconds later the answer comes back as structure, not console output. Totals, and the failures themselves with their assertions.
|||

---

Three are red. The walk does not move. Nothing is marked known-broken and no red is carried forward as acceptable.
|||

---

Each red is understood before it is touched. Two were the change; one was a test asserting the old rule, which gets rewritten to assert the new one.
|||

---

The scope runs green. The engineer moves on, and the full battery waits for the gate where it is earned.
|||

---

One question, one answer, seconds. The run that finished fast answered something worth asking, and the run that takes a minute still means something when it comes.
|||
