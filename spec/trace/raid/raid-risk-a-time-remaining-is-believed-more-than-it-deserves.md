---
minted_in: i51-work-running-out-of-sight-reports-itself
id: raid-risk-a-time-remaining-is-believed-more-than-it-deserves
type: "[[raid]]"
kind: risk
statement: "A figure for how much longer a job needs is acted on as though it were measured, when the timings behind it are known to be wrong."
owner: the driving agent
trigger: the first time a caller waits the reported time and the job is still running when it comes back
status: open
impact: "A caller that reads forty seconds waits forty seconds. Where the figure is wrong by an order of magnitude the caller either wastes the wait or resumes polling, which is the behaviour the goal exists to stop."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - raid-asm-battery-timings-measure-work
  - wt-one-lane-call-should-report-the-state-of-every-piece-of-work
  - i51
---

## Why it stands

The vision's first goal is a time remaining rather than a rate. That is the
whole point of the report.

The arithmetic behind it reads what a job has already done against what it has
left. Those inputs are the recorded case timings.

## What is wrong with the inputs

`raid-asm-battery-timings-measure-work` stands open and says a case's recorded
duration is its own work plus whatever it waited for.

One run showed summed case time of 1,534,695 ms against a wall clock of
76,985 ms. That is a factor of twenty.

An estimate computed from those figures inherits the error whole.

## Why it is a risk and not an issue

Nothing has been built yet, so nothing has yet been believed. The register
entry exists so the design answers it rather than discovering it.

## The ruling it comes from

The goal system ruled conflict one for honesty over usefulness. Every figure
carries the basis it was computed from, and a job with no basis says so.

## What would retire it

A report whose entries name their basis, plus one measured comparison between a
reported time remaining and the wall clock that followed it.
