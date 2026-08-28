---
minted_in: i62-background-work-reports-its-own-end-the-
id: uc-bound-every-wait-and-act-on-expiry
type: "[[use-case]]"
statement: Enter a wait that carries a duration, and have expiry do something rather than nothing.
actor: stk-agent
trigger: the system begins waiting for anything it does not control the end of
precondition: none
guarantee: every wait names how long it will wait, expiry produces an outcome, and an outcome reached by expiry is distinguishable from one the work reported itself
refines:
  - sty-the-wait-that-says-how-long-it-will-wait
priority: must
---

## Main scenario

1. The system begins a wait and records the bound it will wait to.
2. The system answers the caller at once, naming the bound.
3. The thing being waited for finishes inside the bound.
4. The system records its outcome and clears the wait.
5. The caller reads an outcome that says the work reported it.

## Extensions

- 1a. The wait has no sensible bound because nothing comparable has been measured. The system names a default bound and says the figure is a default rather than a measurement.
- 3a. The bound passes with nothing finished. Expiry acts: the wait ends, and the outcome says it ended on the bound.
- 3b. The bound passes and the work finishes in the same moment. The work's own outcome wins, because it is the only one that knows how the work turned out.
- 5a. The caller cannot tell an expiry from a verdict. That is the failure this use case exists to prevent, so the outcome names the bound it hit.
- 5b. A wait is entered by code that declares no bound at all. The system refuses to enter it, rather than waiting for ever on an omission.

## What is deliberately outside it

Choosing the bound well. This use case guarantees a bound exists and that
expiry acts; how long each bound should be is a measurement, and it is set
where the work is understood rather than here.
