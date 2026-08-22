---
minted_in: i51-work-running-out-of-sight-reports-itself
id: raid-dec-the-duration-and-its-basis-are-one-return-value
type: "[[raid]]"
kind: decision
statement: "A reported duration and what it was computed from are produced by one computation returning both, so an entry with no basis cannot carry a figure and a basis cannot go stale while the number updates."
owner: the driving agent
trigger: the first entry seen carrying a duration whose basis names a measurement older than the duration
status: decided
how_likely: plausible
breaks_how_badly: crippling
impact: "A basis that goes stale while the number updates is worse than no basis at all, because a reader checks it once and then stops checking. The whole honesty rule rests on the pair being inseparable."
source_refs:
  - req-a-time-remaining-names-its-basis
  - raid-risk-a-time-remaining-is-believed-more-than-it-deserves
  - opt-the-figure-and-its-basis-are-two-fields
  - opt-the-duration-is-computed-when-asked-not-when-started
  - i51
---

## Why this and not the other

THE INSTRUMENT IS RECORDED AS UNRELIABLE, which is why the pair exists at all.
`raid-asm-battery-timings-measure-work` measured summed case time of 1,534,695
ms against a wall clock of 76,985 ms.

A READER WHO CAN SEE THE BASIS CAN DISCOUNT IT. A reader who cannot, cannot,
and will wait on a number nobody computed.

THE RE-SCORING AGENT NAMED THE COMPARISON. Jenkins declares an estimated
duration with nothing travelling beside it saying what the estimate rests on,
so an unfounded Jenkins estimate is indistinguishable from a founded one. This
decision makes that state unrepresentable.

ONE COMPUTATION RETURNING BOTH is the part that makes it a decision rather than
a convention. Two fields filled independently is exactly how a basis goes
stale, and a convention about filling them together is a rule that can be
skipped.

## Rejected options

`opt-the-duration-is-computed-when-asked-not-when-started` — ABSORBED RATHER
THAN REJECTED. Computing at the ask and carrying the basis are complements in
fact; the chart made them alternatives only because both were folded onto one
row. This decision keeps the late computation inside itself.

`opt-report-a-window-rather-than-a-point` — rejected, and it stays on the
chart. It carries the uncertainty in the width of a range rather than in a
field beside the number.

WHY IT LOST. The probe's pre-agreed fallback was to reach for it if the linear
estimate missed by more than a factor of two at halfway. It missed by 1.11. A
window's width is itself a guess, and a field naming the measurement is
checkable where a width is not.

WHAT WOULD BRING IT BACK: a second measurement on a differently shaped job where
the linear model misses badly.

`opt-ship-the-non-freezing-exit-and-no-estimate-at-all` — rejected on scope
rather than on merit. It is the only design here that cannot make a false claim
about the future, and the iteration's first goal demands each entry say how much
longer it needs.

## Consequences

AN ENTRY WITH AN EMPTY BASIS MAY NOT CARRY A NUMBER, enforced by the shape
rather than by a rule anybody remembers. A shell command has nothing to count,
observed directly at the probing finder, and its entry says so.

THE FIGURE IS RECOMPUTED ON EVERY ASK, which is what makes it worth reading
twice.

AND IT MAY GO UP. A recomputed figure grows where the work slows, and the
design reports the larger number rather than hiding it behind a counter that
only falls. That disclosure now travels on the option node rather than in one
candidate's prose, because a graft carried the mechanism and dropped the warning
once already.
