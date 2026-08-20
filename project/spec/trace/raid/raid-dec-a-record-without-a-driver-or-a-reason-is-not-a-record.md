---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-dec-a-record-without-a-driver-or-a-reason-is-not-a-record
type: "[[raid]]"
kind: decision
statement: A call record carrying neither the driver the machine named nor a stated reason for departing from it is not a valid record, and the named driver is written at the moment of the call rather than reconstructed.
owner: the owner
trigger: "the first walk that runs on a weaker hand than the one named, and the first attempt to measure how often that happens"
status: decided
impact: "Without it the design's only safety rule is a convention. req-a-weaker-driver-than-named-owes-a-recorded-reason obliges a reason for a departure that nothing records and nothing checks, so the obligation falls on a participant with no incentive to meet it and no mechanism that notices when they do not."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - req-a-weaker-driver-than-named-owes-a-recorded-reason
  - raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it
  - opt-a-driver-claim-cannot-be-made-without-a-driver-or-a-reason
  - opt-the-record-carries-both-the-named-driver-and-the-one-that-answered
  - cand-the-receiver-decides
weighs_with: raid-dec-the-no-match-is-a-returned-value-not-a-silence
weighs_against: none
---

## The choice

TWO HALVES, AND THE SECOND WAS GRAFTED ON AFTER THE WINNER WAS DECLARED.

The first is the validity rule: the illegal record is made unrepresentable rather
than merely checked. The second is what makes it enforceable — the record must
carry the named driver, or there is nothing for the rule to be about.

THE NAMED DRIVER CANNOT BE RECONSTRUCTED LATER, and that is why it is written at
the moment of the call. The matrix moves, the mapping moves, rows are added; a
derivation run next month answers with today's policy applied to last month's
call and reports a gap that never happened. The same argument that makes
`req-the-complexity-value-is-read-live-and-never-pinned` want a live read makes
this want a pinned one, and the two do not conflict: read the policy live at
decision time, then write down what it said about this call.

## Rejected options

- THE ANSWERING DRIVER ALONGSIDE THE NAMED ONE, which is
  `opt-the-record-carries-both-the-named-driver-and-the-one-that-answered` whole.
  HALF ADOPTED AND HALF IMPOSSIBLE under
  `raid-dec-the-block-names-a-rung-and-never-a-model`: nothing of ours learns what
  answered. Every other candidate could have had both halves, and all of them are
  off the front.
- LEAVING IT AS A CONVENTION, which is the seed's shape. Rejected on
  `raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it`, which is open
  and graded crippling.

## Consequences

THE MEASUREMENT SEAM IS HALF BROKEN AND THIS DECISION IS WHY IT IS ONLY HALF.
`opt-name-the-acceptable-over-driving-rate-in-advance` needs both sides of a
comparison and this architecture can only ever carry one. What survives is that
the tolerance is stated on our side and the departure is visible as a missing
reason rather than as nothing at all.

AND `raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in` IS NOT
CLOSED BY THIS. It stands open and crippling. A named driver with no state
coordinate still cannot be reconciled, and this decision writes one of the two
coordinates the issue says are needed.
