---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-a-check-binds-without-engine-code
type: "[[requirement]]"
statement: Where a rule governs a named node in the trace, the engine shall enforce it from that node's own declaration, with no engine file changed to make the rule exist.
kind: constraint
verify_method: test
breaks_if_removed: Adding a check costs an iteration, so nobody adds one. The rules stay in prose, which is the state this iteration exists to leave.
breaks_how_badly: fatal
refines:
  - uc-bind-a-rule-to-what-it-governs
source_refs:
  - sty-a-check-binds-without-engine-code
  - vp-the-engine success criteria
  - note-d7a26094f592
  - uc-bind-a-rule-to-what-it-governs steps 3 and 4
priority: must
---

## Detail

THIS IS THE SAME PROMISE THE ENGINE ALREADY KEEPS ONE LEVEL UP, and the
wording is deliberately parallel.

`vp-the-engine`'s first criterion: a drawn canvas compiles into a
governed walk with zero engine code, and the metric is engine code
changed to onboard a new drawn machine, target none.

THIS ROW SAYS THE SAME OF A CHECK. It exists because the corpus says it
does, the way a machine exists because a drawing says it does.

## Why the constraint rather than a preference

THE COST OF ADDING A CHECK DECIDES HOW MANY EXIST. That is the whole
mechanism, and it is not about elegance.

A RULE IS ONE LINE LONG. If enforcing it costs an engine change, a
review, a test and a release, then the rational move is another sentence
of guidance — which is what was already tried, and did not hold.

THE MEASURED PROOF THAT IT DOES NOT HOLD: `depends_on`'s rule stood in
the seed tool's own argument description, unmissable, and the key was
still missed on three records out of twenty-seven seeded.

## What "binds to a named node" excludes

A RULE WITH NOTHING TO BIND TO IS GUIDANCE. If the thing a rule governs
has no node, the node is written first. That is extension 2a of the use
case rather than a special case here.

A RULE THE CORPUS SHAPE CANNOT EXPRESS is a gap in the shape, named as
one. It is not a licence to reach for engine code, because the first
such reach makes the constraint advisory.

## How it is verified

THE FALSIFIABLE FORM IS THE SECOND CHECK, NOT THE FIRST. Anybody can
build one check by writing engine code for it.

THE TEST: add a check without touching any file under
`project/deliverable/engine/`, and show it firing. That is
`sty-a-check-binds-without-engine-code`'s own demonstration, and it can
kill this row.

## Behaviour

NO MODEL WANTED. It constrains where a definition may live. There is no
sequence and no lifecycle to draw.
