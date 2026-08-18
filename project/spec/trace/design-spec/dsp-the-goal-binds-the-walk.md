---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: dsp-the-goal-binds-the-walk
type: "[[design-spec]]"
statement: the iteration's goals travel on the kickoff's own form and every gate below measures its output against each, carried by one item source and one standard round
realizes:
  - el-walk-engine
files:
  - project/deliverable/engine/machine.ts
  - project/deliverable/engine/stateform.ts
  - project/deliverable/engine/rigor-matrix.ts
  - project/deliverable/engine/machines/compile.ts
  - project/deliverable/engine/session.ts
---

## The concern

EVERY COVERAGE CHECK IN THIS SYSTEM COMPARES TWO NEIGHBOURS. Story to value
prop, use case to story, requirement to use case, function to requirement,
element to function, spec to element, chunk to spec. Each is checked both ways
and each is sound.

A CHAIN THAT IS PERFECTLY LINKED AND SERVES A QUARTER OF ITS KICKOFF PASSES ALL
OF THEM, because not one of them looks up. The chain is anchored at a VALUE
PROP, which is a standing product promise, and an iteration that authors no new
prop anchors its whole walk on a promise it merely inherited.

SO THE GOAL WAS PROSE AND EVERYTHING ELSE WAS A GRAPH. It lived in the record's
goal line and in the scope field, and nothing in the trace pointed at either.
Prose cannot be checked against.

## The design

THE GOALS ARE A LIST ON THE KICKOFF'S OWN FORM. They travel with the iteration
the way the change size already does, and they never enter the trace graph — a
goal is not an artifact anything refines, it is what every artifact is measured
against.

`$goals` in stateform.ts resolves them by reading the kickoff's evidence file
out of the evidence folder the field already receives. Only list lines count,
so framing prose beside the list cannot become a phantom row in every gate.

`goals_served` joins STANDARD_ROUNDS in machine.ts, so BOTH compilers get it
from one place. That split is not hypothetical: the rounds themselves once
lived in one compiler and reached half the gates.

`roundsFor` holds the one exemption. The kickoff DEFINES the goals, so asking
what it produced for each is circular.

## Why the ripple is in this spec

THE GOALS CHANGE IS AN UPSTREAM EDIT, and an upstream edit must grey what
stands on it. The existing ripple walked the graph and dropped a claim whose
FEEDER WAS NOT GREEN — it compared colour. A form resubmitted through the pull
unsigns and re-signs inside one call, so the feeder is green again before
anything downstream looks.

SO THE SECOND COMPARE IS TIME: a claim signed before its feeder's current
signature answered older ground. Three things follow, and all three are in
session.ts:

- the bless falls with the green, because a thumb adjudicates one body of work
- an amend counts as freshly as a signature, or the ripple would have no cheap
  exit and se_reopen would be the only way out of a typo upstream
- se_why names the newer feeder, instead of answering that a fallen claim
  stands
