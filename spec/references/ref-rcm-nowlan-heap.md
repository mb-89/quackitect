---
id: ref-rcm-nowlan-heap
title: Nowlan and Heap, Reliability-Centered Maintenance (1978)
url: https://apps.dtic.mil/sti/citations/ADA066579
kind: report
version: AD-A066579, 29 December 1978, 476 pages
accessed: 2026-08-25
tags:
  - overhaul
  - maintenance-engineering
  - prior-art
---

The founding study of reliability-centred maintenance, written at United
Airlines under contract MDA 903-75-C-0349 and published by the US Office of
the Assistant Secretary of Defense. Approved for public release.

This is the prior art `guidance/method/overhaul.md` said was owed.

## What it decides, and it is not what the name suggests

IT DOES NOT DECIDE WHETHER TO OVERHAUL AN ASSET. It decides, per FAILURE
MODE, one of a small closed set of policies. Overhaul is one of them.

FOUR TASK FORMS, from chapter 3.

- Scheduled inspection at intervals, to find a potential failure.
- Scheduled rework at or before an age limit.
- Scheduled discard at or before a life limit.
- Scheduled inspection of a HIDDEN-function item, to find a failure that has
  already happened.

## The order the questions are asked in

Its own decision diagram sets the consequence class first, then picks the
task. The task order inside every class is fixed.

- Is an ON-CONDITION task applicable and effective?
- Is a REWORK task applicable and effective?
- Is a DISCARD task applicable and effective?
- Is a combination of them?

INSPECT FIRST, OVERHAUL SECOND, REPLACE THIRD. Redesign comes last, and it is
compulsory only where safety is at stake.

## The measurement that argues against a scheduled sweep

Pages 47 and 48. Of the items analysed:

- 89% had NO WEAROUT ZONE, so no age limit could improve them.
- 5% had no well-defined wearout zone but grew steadily likelier to fail.
- 6% showed pronounced wearout, and only 4% of those matched the classic
  bathtub curve.

## And the arithmetic that names the trap

Page 57, on a turbine engine. A 2,000-hour rework limit cuts the failure rate
to 0.416 and cuts average realised age from 1,811 hours to 1,393.

THE LEDGER: about 135 fewer failures, and 166 more engines needing rework.
Fewer failures, more total work.

ANY SCHEDULED SWEEP OWES THAT SAME LEDGER — defects prevented against items
touched.

## The three criteria a rework task must meet

- There is an identifiable AGE at which failure probability climbs sharply.
- A large proportion of units survive to that age.
- Reworking can restore the original resistance to failure.

WHY THAT MATTERS TO US. A document corpus has no such age. It fails when the
world moves, not when time passes. So the age-limit justification for a
periodic sweep does not exist here, and the trigger has to be a change in the
standard instead.

## Where the text came from

PRIMARY READ IN FULL, 2026-08-25. DTIC's own file returned 403 through this
proxy. The 520-page text was read from a public mirror at
https://reliabilitywebfiles.s3.amazonaws.com/Reliability+Centered+Maintenance+by+Nowlan+and+Heap.pdf
and the DTIC record above is the citation.
