---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: uc-answer-a-question-with-tests
type: "[[use-case]]"
statement: Answer one question about a change by running only the tests that could answer it.
actor: stk-engineer-driving-agents
trigger: something changed and it is not known whether it broke something else
precondition: none
guarantee: the question is answered, and any red is understood and fixed rather than carried
refines:
  - sty-ask-the-tests-a-question
priority: should
---

## Main scenario

1. Whoever changed something names the question: did THIS break THAT.
2. They name the scope that could answer it, and nothing outside that scope runs.
3. The run returns structure — totals, and each failure with its assertion — rather than raw output.
4. Every red is understood before it is touched.
5. Each is fixed properly, or the test is corrected where it asserted a rule that no longer holds.
6. The scope runs green and the work moves on.

## Extensions

- 2a. The named scope holds no test file. The run refuses and lists the suite rather than running everything by default.
- 3a. The run is long enough to hold up the walk. It moves to the background and its verdict records itself, so the work continues meanwhile.
- 4a. A red is not understood. It is not marked known-broken and it is not carried; the walk stops on it.
- 6a. The same scope has run green several times with nothing between. That is reassurance rather than a question, and the system says so.
- 6b. A gate is reached. The FULL battery runs there, earned, and its verdict becomes a field on the gate's form.
