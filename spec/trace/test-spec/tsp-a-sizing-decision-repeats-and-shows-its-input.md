---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: tsp-a-sizing-decision-repeats-and-shows-its-input
type: "[[test-spec]]"
statement: The same inputs produce the same sizing decision on every repetition, and the record carries what the decision read alongside what it decided.
method: test
verifies:
  - req-a-machine-decision-repeats
files:
  - tests/sizing-repeats.test.ts
---

## Scope

TWO HALVES OF ONE ROW AND BOTH ARE OWED. The decision repeats, AND the engine
records what it read. A decision that repeats and shows nothing cannot be
audited; one that shows its input and wanders cannot be trusted. The requirement
demands both in one sentence and this spec asserts both.

WHY IT NEEDS A SPEC RATHER THAN RIDING ON THE SIZING GROUP.
`tsp-a-step-is-sized-from-its-own-rows` asserts WHAT the block answers for a
given input. This one asserts that the answer is STABLE and SHOWN, which is a
property of the answering rather than of any answer. The two fail
independently: a block can be right once and unstable, or stable and mute.

OUT OF SCOPE: repetition across HOSTS. That is
`req-one-model-list-is-read-live-from-the-repository` and it is inspected
rather than tested, for the reason
`tsp-the-published-strength-is-the-same-on-every-host` gives — the build has
one machine and the requirement is about three.

## Approach

LEVEL: unit against the sizing block, plus one assertion on what the record
carries.

THE INPUT AND THE DECISION GO OUT TOGETHER UNDER THE DECLARED ARCHITECTURE.
`cand-whoever-holds-the-hands-decides` publishes a two-part difficulty and a
rung: the pair says what the work is like and the rung says what we would pick.
The pair IS the input and the rung IS the decision, so the recorded-input half
is discharged by a field the design already carries rather than by one added for
this row.

THAT REDUNDANCY WAS ARGUED AS A COST — two things to keep consistent — and it
discharges a must. The spec asserts it rather than assuming it, because a
redundancy nobody checks drifts.

DEPTH: graded crippling and priority must. It is also the row that decides
between a fixed declared mapping and a runtime router, so a green here is what
makes the owner's ruling checkable rather than merely obeyed.

## Steps

EVERY CASE IN THE REFERENCED FILE IS ONE STEP. What is owed:

- THE SAME INPUTS GIVE THE SAME ANSWER. Size the same step a hundred times in
  one process and assert every answer is identical.
- AND ACROSS PROCESSES. Size it in a fresh process and assert the answer matches
  the first. An in-process cache passes the case above and fails this one.
- ORDER DOES NOT CHANGE AN ANSWER. Size a set of steps in one order, then in
  another, and assert each step's answer is unchanged. A block that carries
  state between calls fails here and nowhere else.
- THE RECORD CARRIES WHAT WAS READ. Assert the published result holds the
  difficulty pair the decision was made from, beside the rung it decided.
- THE INPUT MATCHES THE DECISION. Assert the recorded pair is the pair that
  produced the recorded rung, by re-deriving the rung from the recorded pair.
  Recording an input nobody checks is the failure this case exists for.
- A CHANGED INPUT CHANGES THE ANSWER. Change the difficulty and assert the rung
  moves. Without this the four cases above pass on a block that returns a
  constant.
