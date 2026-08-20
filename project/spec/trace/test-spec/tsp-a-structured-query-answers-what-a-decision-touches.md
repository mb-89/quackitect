---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: tsp-a-structured-query-answers-what-a-decision-touches
type: "[[test-spec]]"
statement: An agent answers what a decision touches with one structured query over the corpus, instead of a run of text searches it has to guess the words for.
method: demonstration
demonstrates:
  - sty-answer-what-does-this-touch
verifies: "none — demonstrates carries the edge; the evaluator's mechanics are test-verified by tsp-query-answers"
files:
  - none — the procedure below is the definition, because the pass is what the agent can reach rather than what a function returns
---

## Why this spec is being written by i33 rather than by i15

THE STORY IS GRADED `must` AND NOTHING NAMED IT. The acceptance gate's slide law
demands a demonstration spec for every must story, and this story had none. i33
is the first walk to reach a gate with that law running, so it is the walk that
met the gap. Writing the spec is not a claim that i33 built anything here.

## Scope

One agent, one real question of the form "what does this decision touch", asked
against the live corpus of roughly 300 trace files.

WHY DEMONSTRATION AND NOT TEST. The evaluator's behaviour is already
test-verified: `tests/query.test.ts` drives `answerStructuredQuery` over filtered
rows, named fields, an unknown-field refusal and a repeat run.

What no test asks is whether the AGENT can get to it. This story's actor is
stk-agent, and its pass line is about what the actor can reach mid-walk. That is
a property of the lane, not of the function.

## What is actually built, checked 2026-08-17

- `engine/query.ts:45` exports `answerStructuredQuery`, taking a kind and a
  named field list.
- `engine/query.ts:51` refuses an unknown field by name and lists the legal
  ones, which is the story's fifth slide.
- `tests/query.test.ts` carries four cases over it.
- i15's `build-query-evaluator` evidence, signed 2026-08-16, records it as
  implemented with four of four green.

## What is missing

A VERB. Nothing in the lane's tool list reaches `answerStructuredQuery`. A
search of the whole deliverable for `se_query` returns nothing.

SO THE ENGINE HOLDS THE ANSWER AND HAS NO DOOR TO HAND IT THROUGH. That is one
hop, and it is the hop this procedure waits on.

## Procedure

1. THE AGENT IS GIVEN A REAL QUESTION about what some decision touches, without
   being told which files hold the answer.
2. IT ASKS THE QUERY VERB for the kind it wants, naming the fields it wants
   back.
   - PASS: one call, and the rows come back filtered to the match.
   - FAIL: any run of text searches. That is the behaviour this story replaces.
3. IT ASKS FOR A FIELD THAT DOES NOT EXIST on that kind.
   - PASS: a refusal naming the field and listing the ones that do exist.
   - FAIL: an empty result, or a wrong one.
4. IT FOLLOWS ONE RETURNED ID to its file and reads the decision's rationale.
   - PASS: the whole answer costs one query and one read.
   - MEASURE: the story's own baseline is four search calls across 300 files.

## Its state, said rather than left blank

CANNOT RUN TODAY, and the blocker is precise rather than general. Step 2 has no
verb to call. Every other step would work the moment one exists.

i15 STANDS `status: open`. It built the evaluator, built the coupling ranker
beside it, and walked as far as verification. Whether the missing verb belongs
to i15's remaining walk or to a later record has not been asked of the owner,
and this spec does not decide it.
