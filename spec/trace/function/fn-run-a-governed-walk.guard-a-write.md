---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: fn-run-a-governed-walk.guard-a-write
type: "[[function]]"
cluster: the-walk
statement: check what a write carries before it lands, and either refuse it or land it with what was found
satisfies:
  - req-a-write-that-breaks-the-corpus-refuses
  - req-a-value-outside-its-vocabulary-refuses
  - req-a-standing-break-reports-and-lands
  - req-a-check-names-its-way-forward
  - req-a-check-too-slow-for-the-write-moves-to-the-sweep
inputs:
  - flow-dispatched-call
  - flow-repository
outputs:
  - flow-refusal
  - flow-findings-report
controls:
  - the seam between a break this write made and one the corpus already carried
  - the write's own time budget
source_refs:
  - uc-keep-the-corpus-sound-at-the-write
  - raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus
  - raid-asm-a-bound-check-runs-inside-the-write-budget
---

## Rationale

NOTHING HELD THIS BEFORE. The nearest three were read in full and each
declines it for a stated reason.

- `judge-a-claim` builds the form a step owes and checks what comes back.
  Its subject is a FORM at a step. A write happens between steps, on any
  file, with no form in sight.
- `hold-the-method` compiles authored text into the machine and reports
  divergence. It decides what a rule IS. It does not stand at the moment
  a rule is broken.
- `keep-the-record` records every act and derives views over them. Its
  own rationale says it decides nothing, and a refusal decides.

SO THE GAP WAS REAL RATHER THAN A NAMING PREFERENCE.

## Why it is one function and not two

REFUSING AND REPORTING LOOK LIKE TWO BEHAVIOURS AND ARE ONE DECISION.
Both start from the same question asked of the same content, and the
answer to that one question picks the outcome.

SPLITTING THEM WOULD GIVE TWO PLACES that decide whether a break belongs
to this write, and the seam would drift. That is the same reasoning
`hold-the-method` gives for keeping vendoring with compilation.

## Why the time budget is a control rather than a requirement inside it

A CONTROL IS SOMETHING THE FUNCTION IS BOUND BY, not something it does.
The one-second rule governs every call and this function does not own
it.

WHAT THE FUNCTION OWES because of it is a placement decision: a check
that cannot answer in time runs in the sweep instead. That is a behaviour
and it is in `satisfies`.

## Solution neutrality

THE TEST IS WHETHER TWO HONESTLY DIFFERENT DESIGNS COULD BOTH DO THIS.

At least four could, and they differ in real ways.

- A checker called inside each write verb.
- A pre-write hook the verbs share.
- A staging area where content is validated before it is committed.
- A content-addressed validator the write consults before storing.

NO TECHNOLOGY IS NAMED. The statement says check, refuse, land — nothing
about where the code lives or what runs it.

## The ports, corrected at decompose-structure

IT NAMED `flow-trace-graph` AS AN INPUT AND THAT WAS WRONG. The computed
element matrix said so: allocating this function demanded a crossing from
the element that PRODUCES the trace graph, and no such interface existed.

THE GRAPH IS A DERIVED VIEW. A bound rule lives in a corpus node's own
frontmatter, and a guard reading it reads the FILES. `flow-repository`
was already listed and already carries that.

SO THE PORT WAS OVER-SPECIFIED rather than the structure being short of
an interface. Dropping it is a correction, and the matrix stopped owing
anything.

THE MATRIX FOUND IT, not a reviewer. That is worth recording as the same
thing this iteration is about: a check that reads both sides from disk
caught an error a listing would have carried through.