---
minted_in: i51-work-running-out-of-sight-reports-itself
id: raid-dec-a-long-step-acknowledges-first-and-reports-on-a-clock
type: "[[raid]]"
kind: decision
statement: A step whose leaving check will outrun the caller's bound emits an acknowledgement inside the first second and then reports its progress on a clock, rather than deferring a verdict and being asked about it.
owner: the driving agent
trigger: the first leaving check whose acknowledgement does not reach the caller inside a second, or the first run where the clock reports nothing new for two consecutive intervals
status: decided
how_likely: plausible
breaks_how_badly: crippling
impact: This is the load-bearing behaviour of the iteration. If the acknowledgement does not arrive inside the caller's bound, the walk freezes exactly as it does today and nothing else in the design matters.
source_refs:
  - req-a-leaving-check-does-not-hold-the-call
  - opt-acknowledge-inside-a-second-then-report-every-minute
  - cand-the-account-that-follows-you
  - i51
---

## Why this and not the other

THE PREDECESSOR WROTE THIS RULE AND IT WAS LOST. v1's own responsiveness guide,
at ref `main`, says every interaction gives feedback within one second, and
where the work takes longer an acknowledgement is emitted first, inside that
second. It carried `scope: always` and did not survive into v3.

TWO BOUNDS RATHER THAN ONE is what makes it a decision rather than a
restatement. The acknowledgement bound governs the first answer. The progress
bound governs whether the answer keeps MOVING, and nothing else in this
iteration's register demands that.

## Rejected options

`opt-the-judgment-is-owed-at-the-leaving-not-at-the-asking` — the separation in
time. It answers at once and holds a verdict pending, and three of the four
candidates took it.

WHY IT LOST HERE, AND IT IS NARROW. It was not beaten on the handback row
itself. It sits on the three lines the convergence eliminated, and the seat went
to the line carrying the rider. The handback row was nearly not an axis at all.

WHAT IT DOES BETTER, said because it is the closest thing to a live
alternative: it makes no promise about frequency, so it cannot fail a clock. If
the progress bound proves unmeetable, this is the fallback.

## Consequences

A step that will run long is now obliged to say so INSIDE the first second, and
obliged to keep saying something. Neither obligation exists today.

THE CLOCK IS A NEW KIND OF DEMAND for this product. Every other timing rule
here bounds one answer. This one bounds the gap between answers, and nothing in
the register measures that yet.

THE PREDECESSOR'S MINUTE IS NOT ADOPTED AS A NUMBER. Its bound was sized for a
person watching a screen. The caller here is a program, and what it needs is
that the answer MOVES rather than that it moves on any particular schedule.
Sizing that interval is the design's, and it is unmeasured.
