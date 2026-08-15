---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: raid-asm-the-target-machine-is-many-throttled-cores
type: "[[raid]]"
kind: assumption
statement: The machines this product must run well on have many cores and weak single-core speed, because they thermally throttle, and that cannot be avoided by choosing better hardware.
owner: the owner
trigger: at any design choice argued on speed, and at every scoring of req-call-answers-in-one-second
status: held
probe: "Run the same scoped call on the throttled laptop and on a normal desktop and compare wall-clock. The laptop's figure is the one the one-second rule must be met on."
probed: "not from this session - reported by the owner on 2026-08-14 and accepted on their word. The machine is elsewhere."
impact: Every argument that trades parallelism for single-threaded simplicity is arguing against the target hardware. A design that is fast on one strong core and mediocre across many is the wrong shape for the machines this is used on.
breaks_how_badly: corrosive
how_likely: conceivable
source_refs:
  - "owner report 2026-08-14: a CAD laptop with about twenty cores that overheats the second you turn it on, so every core is throttled to 2 GHz — the machine a lot of my colleagues use, and there is no way of avoiding it"
  - "owner report 2026-08-14: I actually stopped working on that machine today because the performance was so bad it got on my nerves"
  - note-1e3da015c26e
  - req-call-answers-in-one-second
---

## Why this is recorded as evidence rather than as a guess

THE OWNER REPORTED IT DIRECTLY AND SAID TO TAKE THEIR WORD. A stakeholder's
account of the hardware their colleagues use is evidence about the operating
environment. Treating it as unverified because no benchmark ran here would
discard the only account there is.

WHAT IS ACCEPTED: the shape of the machine. Many cores, each weak, because
heat holds them down.

WHAT IS STILL OPEN: the numbers. Nobody has profiled a slow call on it, so
where the time actually goes is unknown.

## What it changes about this milestone

IT MAKES PARALLELISM A PROPERTY OF THE TARGET, not an optimisation. One
process uses one throttled core. Twenty throttled cores are twenty times
nothing unless work can spread across them.

TWO CANDIDATES ARGUE PARTLY ON THIS: cand-os-rooted and cand-core-satellite
both put work in separate processes, which is the only shape on the chart
that can use more than one core.

AND IT CUTS AGAINST A DIFFERENT FIX. A throttled CPU is a CPU problem.
Storage speed, caching and RAM disks are IO fixes. They address a bottleneck
this machine has not been shown to have, and on a machine whose named problem
is clock speed they may buy nothing at all.

## What would falsify it

A PROFILE SHOWING THE TIME GOES TO IO rather than to computation. Then the
core count is beside the point and the fix is elsewhere.

THE PROFILE IS CHEAP AND NOBODY HAS RUN IT. That is the gap this assumption
sits in, and it is why the status is `held` rather than `closed`.
