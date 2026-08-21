---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-ar-audit-answers-from-log
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-audit-answers-from-log at risk — the response hinges on el-account.
owner: the adjudicator
trigger: the first audit that asks what a finished walk actually cost, and any reconciliation of named against actual
status: open
looked: 2026-08-20
impact: Attribution needs two coordinates and this architecture writes one. The stamp records the named driver and the state; the answering driver is outside our tree by construction. So an audit asked what a walk ran on answers from the log with what we asked for, never with what happened.
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-audit-answers-from-log
  - el-account
  - raid-dec-the-block-names-a-rung-and-never-a-model
  - raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in
weighs_with: none
weighs_against: none
---

## Graded off the scale, corrected 2026-08-20

THIS ENTRY SAID \`how_likely: certain\`. THE SCALE OFFERS expected, plausible,
conceivable. \`deliverable/engine/bin/grades-complete.ts\` refuses the
whole register while any entry sits outside it, and it refused at
\`rank-unknowns\`' exit — which is the first state that runs it.

\`expected\` IS THE HIGHEST THE SCALE HAS and it is what this entry now carries.

WHAT "CERTAIN" WAS TRYING TO SAY, and the scale cannot hold it: this is not
something that MIGHT happen. It is a consequence the design chooses. A likelihood
scale measures whether a thing occurs; it has no value for a thing that is true
by construction.

THE DISTINCTION IS REAL AND BELONGS SOMEWHERE ELSE. A consequence a design
accepts is a decision's cost, recorded on the decision. A risk is something that
might realise. Writing "certain" onto a likelihood field collapses the two, and
four entries in this record did it independently — which is a vocabulary gap
rather than four mistakes.

## It is certain rather than likely, and that is the point

THIS IS NOT A RISK THE ARCHITECTURE MIGHT REALISE. It is a consequence the
architecture chooses. raid-dec-the-block-names-a-rung-and-never-a-model buys host
portability by giving up the answering side of every attribution, and this entry
is what that decision costs on a standing requirement.

THE SCORING SAW IT AND THE COMPARISON DID NOT ACT ON IT. A clean-context scorer
put the declared winner at 0 on this axis, worst of four, quoting the candidate own
sentence. It was still declared, because the axis is one of five and the winner
leads on two of the others.

## The fallback

THE HALF THAT LIVES ON OUR SIDE IS ALREADY GRAFTED ON. The record carries what the
machine NAMED, which makes a departure detectable as a missing reason rather than
as nothing at all. What it cannot do is say what ran.

WHAT WOULD CLOSE IT is a receiver that reports back, which is
raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all and is outside
this record. Until then the honest position is that this requirement is not served
by the declared architecture and is recorded as such rather than argued around.
