---
id: sty-scoped-test-answers-one-question
type: "[[story]]"
statement: When I change something, I want the test run to answer whether THAT broke THIS, so the one failure that matters is not buried under a thousand passes.
actor: stk-agent
refines:
  - vp-systematic-engineering
killer: false
---

## Deck

Running the whole battery after every edit feels like diligence. It costs minutes, buries the one failure that matters, and teaches nobody anything.
|||

---

A run here answers a question: did THIS change break THAT? The scope names the files that could answer it, and nothing else runs.
|||

---

The result comes back structured — the totals, and the failures themselves. Not a wall of console output with the verdict somewhere inside.
|||

---

A red is understood and fixed properly before the walk moves. The full battery is EARNED at the gates, never spent on reassurance.
|||

---

The run that finished in seconds answered the question, and the question was one worth asking.
|||
