---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: tsp-conformance-at-the-write
type: "[[test-spec]]"
statement: A maintainer writes a rule into the node it governs, and the next write that breaks it is refused at the write with the file, the line and the fix named — with no engine file changed to make either happen.
method: demonstration
demonstrates:
  - sty-a-check-binds-without-engine-code
  - sty-the-write-refuses-the-break
verifies: "none — demonstrates: carries the edge; both requirements are verify_method: test and are carried by tsp-bound-rules and tsp-write-guard"
files:
  - none — the procedure below is the definition, and the observed session is the evidence
---

## Scope

The two must stories this iteration minted, taken together because they
are one moment seen from two sides: the maintainer who writes the rule,
and the agent who meets it.

WHY A DEMONSTRATION AND NOT A TEST. Both stories already have tests, and
the tests are green. What a test cannot show is the thing both stories
actually promise — that the loop closes for a PERSON, in ordinary work,
without anybody having planned the moment.

AND IT VERIFIES NO REQUIREMENT, on purpose. A spec's method must equal
the verify_method of every requirement it names, and both underlying
requirements are `verify_method: test` — already carried by
tsp-bound-rules and tsp-write-guard. This row carries the STORIES, which
is a `demonstrates` edge and a different question: the tests say the
mechanism works, and this says the promise lands.

## Procedure

WHAT IS DONE, in order, in a real session rather than a fixture.

- Open the node a rule should govern. Write the rule into its own
  frontmatter: `rules: [{key, allows, on_break}]`.
  - OBSERVE: the write lands. No engine file is edited, no verb is
    registered, no restart happens.
- Run `git status --porcelain -- project/deliverable/engine`.
  - OBSERVE: unchanged from before the rule was written.
- Write that same node again with a value the rule forbids.
  - OBSERVE: refused. The refusal names the value, the allowed list, and
    WHICH NODE'S rule fired.
- Write any corpus node with a YAML value carrying an unquoted colon.
  - OBSERVE: refused with the file, the FILE'S OWN line number, the
    offending line's text, and the fix.
- Fix the value and write again.
  - OBSERVE: it lands, in one further call. The corpus was never broken.

## The pass line

BOTH HALVES, BOTH OBSERVED.

- A rule bound in the corpus fired, and no engine file moved.
- A break was heard AT THE WRITE rather than several calls later, and the
  refusal was enough to fix it without hunting.

ANYTHING ELSE IS A FAIL, and the most important anything-else is a
refusal that names the block's line rather than the file's. That is the
failure this whole row exists to remove: a message that says something
is wrong and not where.

## Observed 2026-08-16, unprompted, during this iteration's own build

BOTH HALVES FIRED WITHOUT BEING STAGED, which is stronger evidence than
a staged run and is the reason this section exists.

- THE WRITE GUARD REFUSED A BOUND-RULES FIXTURE that had carried a
  duplicate `realization` key for months. It named the file and the line;
  the fixture was fixed in one move. Nobody had gone looking for it.
- THE VOCABULARY CHECK REFUSED `realization: "borrow"` against the list
  its own item template declares, in a fixture whose author (me) believed
  the value was legal.
- THE SAME CLASS, UNCAUGHT, COST ELEVEN CALLS EARLIER THE SAME DAY.
  `status: part-closed` parsed fine, trapped the walk four states later,
  and named a state that was not the problem.

## What is deliberately not here

THE SWEEP. A rule too slow for the write reports through the sweep
instead, which is a different moment with a different spec.

THE PERSON'S SIDE OF THE FIRST STORY IS PARTLY OWED. The maintainer in
the story is a person opening a node in an editor. What was observed was
an agent doing it through the lane. The mechanism is identical and the
experience is not, and saying so is more honest than claiming the whole
story was walked.
