---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: fn-run-a-governed-walk.answer-a-structured-query
type: "[[function]]"
cluster: the-query
statement: answer a structured query over the corpus
satisfies:
  - req-what-the-corpus-is-has-one-answer
  - req-query-returns-named-fields
  - req-query-refuses-unknown-field
  - req-query-empty-result-explicit
  - req-query-is-deterministic
inputs:
  - flow-query-request
outputs:
  - flow-query-result
  - flow-refusal
source_refs:
  - uc-query-the-corpus-by-structure
  - uc-get-a-trustworthy-answer
---

## Rationale

Its own function rather than folded into an existing sibling, because
nothing today reads the corpus as typed rows against named fields —
se_file_search and se_file_glob answer with matching TEXT, a different
flow entirely. Determinism rides the same function rather than a sibling
of its own: it is a property of how this one function behaves given the
same request twice, not a second thing the system does.

## Why the one-answer row sits here

`req-what-the-corpus-is-has-one-answer` demands that every caller asking what
the corpus contains gets the same answer, including when the answer is a
failure. This function is where that question is asked as a first-class act
rather than as a side effect of doing something else.

THE ROW CAME FROM A PROBE RATHER THAN FROM A WORRY. Two functions with the same
name, in two files, with different signatures, disagreeing about what a
malformed node does. The parsing was never the problem; the handling was.

THE FIT HAS ONE LIMIT WORTH STATING. The row binds every caller, and this
function is one caller among several. It sits here because a structured read of
the corpus is the thing a single answer would come FROM, and because the
alternative was to hang a cross-cutting row off nothing.

IF THE DESIGN MILESTONE FINDS A BETTER HOME, moving it is cheap and this note
says why it was placed rather than pretending the fit was obvious.
