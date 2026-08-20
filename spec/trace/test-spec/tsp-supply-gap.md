---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: tsp-supply-gap
type: "[[test-spec]]"
statement: A state whose required evidence resolves against something it has no verb to make is reported as a gap and refuses the compile, and every live machine is checked to hold.
method: test
verifies:
  - req-no-state-demands-what-it-cannot-supply
files:
  - tests/supply-gap.test.ts
---

## Scope

The agreement between two declarations on one state. Everything else
about either is somebody else's check.

## Approach

FIXTURES FOR THE RULE, THE LIVE CORPUS FOR THE VERDICT.

The fixtures pin each arm of the rule, including every arm that must NOT
fire — those are where a check of this shape goes wrong, by refusing a
correct machine.

The last case compiles every real column and asserts no gaps. A rule this
shape is only worth having if it runs against the real corpus, and that
case is the one that would have caught the 29.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- A RESOLVING FIELD WITH NO WRITE VERB IS A GAP, and the gap names both
  verbs that would close it.
- THE SAME STATE WITH A WRITE VERB IS NOT.
- A FREE-FORM FIELD IS NOT. Prose is answered by filling the form.
- `all` IS NOT. The whole lane includes the write verbs, and reading the
  literal word as a tool name would make every open state a gap.
- A DERIVED FIELD IS NOT. The engine computes it; verification is exactly
  that state and grants no test verb on purpose.
- AN OPTIONAL FIELD IS NOT. Nothing is owed.
- A RUN REFERENCE WANTS A RUNNING VERB, not a writing one.
- THE REFUSAL NAMES the state, the field and a verb.
- EVERY LIVE MACHINE HOLDS.

## What is deliberately not here

GUIDANCE PROSE. A state saying "run the tests" in a sentence is not a
declaration, and no case asks the check to read one.

## The measurement behind the row

2026-08-16, first run over the live matrix: 29 state/field pairs across
patch, minor, major and product. Every one a gate asked to name the
register entries its own review added, with no verb that can mint one.
Nine gate rows were granted the write verbs; gate-kickoff already had
them and was correctly never flagged.
