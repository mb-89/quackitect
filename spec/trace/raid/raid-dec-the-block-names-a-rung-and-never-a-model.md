---
unreachable_refs:
  - cand-whoever-holds-the-hands-decides
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-dec-the-block-names-a-rung-and-never-a-model
type: "[[raid]]"
kind: decision
statement: The sizing block publishes a rung name and holds no roster, so resolving that rung to a concrete model is entirely the receiver's business and no model name ever appears in our tree.
owner: the owner
trigger: "the first host that runs a model this project has never heard of, and the first vendor retirement"
status: decided
impact: "This is the defining choice of the winning architecture and everything else in it follows. It buys host portability by construction and pays for it with a check we can never run: nothing of ours learns which model a rung resolved to, so the record carries what we named and a self-reported account of what ran, with nothing independent to compare them against."
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - req-walk-survives-host-swap
  - raid-asm-one-model-list-serves-every-host-the-engine-supports
  - raid-asm-the-model-ladder-is-a-total-order
  - opt-the-block-names-a-rung-and-never-a-model
  - cand-whoever-holds-the-hands-decides
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
  is on no line because the reason recorded here — "today's receiver reads and
  cannot act" — was believed at the time and is false. CORRECTED 2026-08-20: the
  party reading a published rung is the walking agent, and it acts by delegating.
  See `nbr-the-driver-that-performs-the-spawn`. The convergence therefore stands
  unplaced for no good reason, and that is a live gap rather than a closed one.

## Consequences

WHAT THIS COSTS, CORRECTED 2026-08-20. This node said the choice pays "with an
attribution we can never make ... the record can carry what we named and never
what ran". THAT IS WIDER THAN THE TRUTH AND IT TRAVELLED.

`req-every-call-records-the-model-that-answered-it` says in its own Detail that
"the transport hands the engine a client name and no model, so today the value
can only come from the caller", and that the mark saying so "is part of the
requirement, not a caveat on it". EVERY DESIGN ON THE CHART SELF-REPORTS,
including the three that hold a roster.

SO WHAT THIS DECISION GIVES UP IS THE CROSS-CHECK AND NOT THE RECORD. A line
holding a roster can compare a self-reported model against what its own mapping
resolved the rung to, and catch a caller reporting wrongly. This one holds none,
so the self-report stands alone.

THAT IS STILL A REAL COST and it is why the actor axis is this architecture's
weakest. It is a narrower one than an absent field, and the difference decides
whether `req-every-call-records-the-model-that-answered-it` is satisfied or
violated — which is the difference between this being a candidate and not.

WHERE THE OVER-STATEMENT CAME FROM AND HOW FAR IT GOT: one sentence in
`cand-whoever-holds-the-hands-decides`, quoted into a scoring anchor, a cut's promotion
argument, `el-account`,
`raid-ar-the-actor-is-recorded-where-the-call-is-served` and this node. Five
artifacts, none of which checked it against the requirement.

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
