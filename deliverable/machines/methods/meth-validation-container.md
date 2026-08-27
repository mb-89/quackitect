---
kind: method
statement: "Validation fills the story. Every slide's evidence half is filled, for all stories and all iterations. The must stories are demonstrated for real, and each run mints its report."
---

## Situation

M8. Validation attaches to stories and value props, never to requirements (verification's job, done at M7). The pass lines written at M1 on the needs are what "meets the need" means.

## Procedure #work

- Walk every story - this iteration's and every earlier one's: shipping new work must not silently break an old need.
- Fill each slide's evidence half from the shipped system: a run record, a report, a measurement. A slide that cannot be filled is a finding.
- DEMONSTRATE THE MUST STORIES for real - a green suite can still miss a whole capability. A demonstration-method test-spec names each must story under `demonstrates:`; its Procedure is what runs.
- EVERY RUN MINTS A REPORT: reports/rpt-<story>.md in the record. The report is the durable run record the slides and the gate cite.
- Where a validated slice is executable, convert it to an acceptance scenario: that slice of validation becomes verification permanently and the battery carries it from now on.
- The gate answers per value prop and per must story; its bless IS the sign-off - hash-bound, channel-recorded.
- Market iterations only: the real-world tier per [[meth-market-tier]] is mandatory here; everyday iterations run the cheap tier only.

## The report #work

One demonstration run, recorded. Seed from this fence:

```skeleton
---
spec: <the tsp- id whose Procedure ran>
story: <the sty- id it demonstrates>
date: <YYYY-MM-DD>
performed_by: <the role - the driving agent, the owner>
verdict: <observed working | failed - what broke>
---

## Observed

<!-- What was watched for and what happened, one line per Procedure step.
Reference what the observation left behind: a log ref, a screen, a
measurement. Nothing retold. -->
```

A demonstration is OBSERVED WORKING end to end, in any discipline: a bench
run, a walkthrough, a pilot session. The auto-generated form of this note
is future work; until then run-demos writes it by hand.
