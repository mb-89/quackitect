---
form: timing-report
by: agent
signed_off: 2026-08-15T11:19:45.256Z
authors: agent
files:
---

# Evidence form / timing-report

## current_situation

Every write in the timing reporter sits inside a try that swallows its error, on the rule that bookkeeping must never fail the suite.

That rule is right and it left no way to say the bookkeeping failed. A run whose records went nowhere read exactly like one whose records landed, which is how two green batteries recorded nothing without anybody noticing.

## built

Committed in 0c6babef.

- engine/testreporters.ts gains timedSince(seDir, sinceMs), counting only the rows stamped by this run, and timingReport(timed, total).
- engine/tools.ts stamps the start, counts after the run, and puts the count on the verdict as `timed`.
- Where fewer cases were timed than ran, the verdict also carries `timing_gap`, naming both numbers.

A missing timings file counts as nothing timed rather than throwing, so the count never becomes a second way to fail a run.

Covered by tests/timings.test.ts, three cases: only this run's rows are counted, a missing file answers zero, and a short run names the gap.

## follow_up

- The count is reported and not yet ACTED on. A run with a gap does not fail, and that is deliberate at this size: making it fail is a behaviour change with its own blast radius.
- The natural next step is the one note-ae6265b74821 already names, and it is bigger than this record: a green over an empty run is not a green either, and both belong to the same rule.

## anything_else

ON REPORTING RATHER THAN REFUSING.

The stronger move is obvious: a run that timed nothing should fail. It was tried inside this record and reverted within the hour.

Making an empty measurement fail turns every fixture-driven test of the test lane red at once, because node refuses to run tests recursively and every such inner run executes zero cases by construction rather than by defect.

So the rule is right and its blast radius is a piece of work, not a line. This chunk ships the half that is free: the number is in the answer, where the next person cannot miss it.
