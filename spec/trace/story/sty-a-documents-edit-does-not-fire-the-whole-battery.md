---
minted_in: i51-work-running-out-of-sight-reports-itself
id: sty-a-documents-edit-does-not-fire-the-whole-battery
type: "[[story]]"
statement: When I ask a test question after changing only documents, I want the engine to say that no test answers for the diff rather than running every test it has, so the answer costs what the question is worth.
actor: stk-agent
refines:
  - vp-rigor-without-toil
priority: should
---

## Deck

THE PROBLEM. The engine falls back to the whole battery whenever a changed file
has no test that answers for it, and today that is most document changes.
|||
TEN BATTERIES RAN IN ONE SESSION ON THAT FALLBACK, most of them fired by
changes to markdown alone. Recorded in note-d393a93e0112, carried into this
iteration's record as the third piece.

---

THE STARTING STATE. The agent has edited guidance and a state note. Nothing
under test moved.
|||
TWO BRANCHES LEAD HERE. `decideScope` returns the battery when any changed file
maps to no test, at deliverable/engine/discipline.ts line 455, and again when
the diff maps to no test file at all, at line 463. The second branch's own
comment says the battery is the wrong answer to a pure-documents diff.

---

STEP ONE. The agent asks a test question. Today: the whole battery starts.
After: the engine answers that no test covers this diff, and names what it
checked instead.
|||
EMPTY UNTIL M8.

---

STEP TWO. The agent reads the decision. Today: `decided.why` already explains
the fallback honestly, which is the part that works. After: the same honesty,
with a decision that costs less.
|||
EMPTY UNTIL M8.

---

STEP THREE. The agent changes code and asks again. After: the tests that answer
for that code run, and the battery is still what verification fires.
|||
EMPTY UNTIL M8.

---

THE RESULT. A question about documents is answered as a question about
documents. The battery keeps its job, which is the release evidence at
verification.
|||
EMPTY UNTIL M8.
