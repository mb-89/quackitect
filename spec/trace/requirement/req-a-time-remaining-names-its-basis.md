---
minted_in: i51-work-running-out-of-sight-reports-itself
id: req-a-time-remaining-names-its-basis
type: "[[requirement]]"
statement: When the product reports how much longer a piece of work needs, it shall name the measurement that figure was computed from, and where no measurement exists it shall report that it cannot estimate rather than a figure.
kind: functional
verify_method: test
measure: "reported durations carrying no named basis: zero. Entries reporting a figure on a machine with no prior measurement for that kind of work: zero."
breaks_if_removed: "A figure with nothing behind it reads exactly like a measured one, so a caller waits on a number nobody computed and is worse off than with no answer at all."
breaks_how_badly: corrosive
priority: must
refines:
  - uc-report-every-piece-of-work-out-of-sight
source_refs:
  - raid-risk-a-time-remaining-is-believed-more-than-it-deserves
  - raid-asm-a-first-run-has-timings-to-estimate-from
  - raid-asm-battery-timings-measure-work
  - vp-rigor-without-toil
---

## Detail

TWO DEMANDS, ONE CONCERN. Naming the basis and refusing to invent one are the
same rule seen from either side, and they fail together under one method.

WHY THE ROW EXISTS AT ALL. The instrument behind any figure here is already
recorded as unreliable. `raid-asm-battery-timings-measure-work` measured summed
case time of 1,534,695 ms against a wall clock of 76,985 ms, a factor of
twenty. A reader who can see the basis can discount it; a reader who cannot,
cannot.

WHAT COUNTS AS A BASIS. Something a reader could go and look at: a previous
run's recorded wall clock, a count of steps already reported by the work
itself, or a named measurement file. "Estimated" is not a basis.

THE NO-MEASUREMENT CASE IS NOT AN EDGE. A container cloned fresh has no
recorded timings at all, and that is every unattended run's first test call.
The probe for it is written in
`raid-asm-a-first-run-has-timings-to-estimate-from`.

A DURATION THAT STOPS MOVING IS ALSO COVERED. Reporting the same figure twice
looks identical to a working estimate. The entry says which measurement is not
advancing rather than repeating a stale number in silence.

NO BEHAVIOUR MODEL HERE, and the absence is named so the next reader does not
ask. This row is one condition and one response. A diagram would restate the
statement in a second notation and give the two something to drift apart on.
