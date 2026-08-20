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
how_likely: certain
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-audit-answers-from-log
  - el-account
  - raid-dec-the-block-names-a-rung-and-never-a-model
  - raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in
weighs_with: none
weighs_against: none
---

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
