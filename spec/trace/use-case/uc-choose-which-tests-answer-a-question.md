---
minted_in: i51
id: uc-choose-which-tests-answer-a-question
type: "[[use-case]]"
statement: Decide which tests answer a question about a change, and say plainly when none of them do.
actor: stk-agent
trigger: the walker asks a test question
precondition: none
guarantee: what ran is named, why it was chosen is stated, and a diff no test answers for is reported as such rather than answered with every test
refines:
  - sty-a-documents-edit-does-not-fire-the-whole-battery
priority: should
---

## Main scenario

1. The walker asks what it wants to know, in one line.
2. The system reads what has changed since the last full run.
3. The system maps each changed thing to the tests that answer for it.
4. The system runs that set and answers with the verdict, the set it chose, and why.

## Extensions

- 2a. Nothing has changed. The last verdict still stands and the system says so, running nothing.
- 2b. The system cannot tell what changed. Everything runs, and the reason says which question could not be answered.
- 3a. Some changed things map to no test. The system runs what does map, and reports the unmapped ones by name so the gap is visible rather than absorbed.
- 3b. Nothing maps to a test at all, because the change is documents. The system runs the check that reads documents and says no test answers for this diff. It does not run every test.
- 3c. Enough distinct tests have run piecemeal that the full run is now the cheaper call. Everything runs, and the reason says so with the count.
- 4a. The last full run was red. Everything runs, because a standing failure is understood whole before anything narrower is trusted.
- 4b. The caller asked for a full run directly. Everything runs, because that is what the request means.

## The gap this closes

Running every test for a change nothing maps to is not the safe answer it looks
like. It cannot answer for that change either. It buys time rather than
evidence.

Reporting the gap by name is what makes it fixable. A test that ought to exist
for a changed thing is invisible while the fallback keeps passing.
