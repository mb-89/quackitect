---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-dec-the-block-names-a-rung-and-never-a-model
type: "[[raid]]"
kind: decision
statement: The sizing block publishes a rung name and holds no roster, so resolving that rung to a concrete model is entirely the receiver's business and no model name ever appears in our tree.
owner: the owner
trigger: "the first host that runs a model this project has never heard of, and the first vendor retirement"
status: decided
impact: "This is the defining choice of the winning architecture and everything else in it follows. It buys host portability by construction and pays for it with an attribution we can never make: nothing of ours learns which model answered, so the record can carry what we named and never what ran."
breaks_how_badly: crippling
how_likely: unlikely
source_refs:
  - req-walk-survives-host-swap
  - raid-asm-one-model-list-serves-every-host-the-engine-supports
  - raid-asm-the-model-ladder-is-a-total-order
  - opt-the-block-names-a-rung-and-never-a-model
  - cand-the-receiver-decides
weighs_with: none
weighs_against: none
---

## The choice

A rung is a statement about the work. A model name is a statement about somebody
else's fleet. The first is ours to make and the second never was, and the seed
asked for both.

## Rejected options

- A ROSTER WE HOLD, in one record or two. `opt-a-declared-class-with-a-named-fallback-pool`
  and `opt-the-roster-and-the-mapping-are-two-records-on-two-clocks` both keep the
  model names in our tree. Both roster-holding candidates scored 2 on
  req-walk-survives-host-swap against this one's 4, and both are dominated and off
  the front.
- THE DRIVER READING THE DIFFICULTY AND DECIDING FOR ITSELF,
  `opt-the-driver-reads-the-difficulty-and-decides-whether-to-take-it`. Two
  finders reached it independently, from Nix's requiredSystemFeatures and from a
  SCAMPER reversal, which is the strongest convergence anywhere on the chart. It
  is on no line because today's receiver reads and cannot act — see
  `nbr-the-driver-that-performs-the-spawn`, rewritten in this record after the
  first version claimed otherwise. If that ever changes, this decision is where
  it lands.

## Consequences

TWO ASSUMPTIONS STOP BEING NEEDED RATHER THAN BEING WEAKENED. Neither
`raid-asm-one-model-list-serves-every-host-the-engine-supports` nor
`raid-asm-the-model-ladder-is-a-total-order` has anything to be wrong about once
no list exists.

THE RUNG VOCABULARY BECOMES A PUBLISHED CONTRACT. It has to be stable enough for
a receiver to implement against and versioned enough to change, which is a
smaller version of the roster problem rather than its absence.

AND THE ACTOR AXIS IS CONCEDED, PERMANENTLY. This candidate scores 0 on
`req-the-actor-is-recorded-where-the-call-is-served` and is worst of four. That
is not a gap to fill later; it is the price of this decision, and
`raid-risk-the-reader-can-take-the-leaders-only-structural-advantage` is the
standing entry that says a rival can have the portability without paying it.
