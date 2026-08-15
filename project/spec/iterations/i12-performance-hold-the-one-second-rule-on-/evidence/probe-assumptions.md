---
form: probe-assumptions
by: agent
signed_off: 2026-08-15T10:49:00.568Z
authors: agent
files:
---

# Evidence form / probe-assumptions

## current_situation

Eighteen assumptions stand and every one carries an outcome.

Six belong to this record. Two of the six were probed today and four could not be, and the reason three of them could not be is itself the finding of this milestone.

THE PROBE THAT WAS RUN AND CAME BACK EMPTY. The wall-clock baseline was to be settled by running the battery twice on one tree. Both runs went green at 1301 of 1301, and neither wrote a timing record anywhere the lane can read. The probe could not be completed because the instrument it reads is broken, which is now raid-iss-a-bound-record-records-no-test-timings.

## probes

| raid | probe | probed |
| --- | --- | --- |
| [[raid-asm-battery-timings-measure-work]] | scheduled - the instrument is broken on both paths, per raid-iss-a-bound-record-records-no-test-timings. Repairing it is this iteration's first build item. | 2026-08-15 |
| [[raid-asm-method-write-reaches-every-tree]] | unprobed - the merge at close is still the check. product.md now states the method resolution is already live, which strengthens it without settling it. | 2026-08-15 |
| [[raid-asm-slow-surface-is-not-self-contention]] | scheduled - it needs a spike. The lane forbids calling its own mirror, because the run would block the server being measured. | 2026-08-15 |
| [[raid-asm-waiting-makes-a-person-look-less]] | unprobed - nothing counts artifacts opened per adjudication. The count is derivable from the call log, and building it is not this iteration's work. | 2026-08-15 |
| [[raid-asm-wall-clock-is-a-baseline]] | unprobed, and the attempt is the finding. Two green batteries on one tree wrote no wall clock at all. | 2026-08-15 |

## follow_up

- raid-iss-a-bound-record-records-no-test-timings is opened by this milestone and it blocks two probes. It is the record's first build item, ahead of the scoped-run fix, because it is the same instrument and a wider break.
- raid-asm-slow-surface-is-not-self-contention turned out to need a SPIKE rather than a probe. The lane forbids calling its own mirror, so measuring a surface from inside the engine is not possible. M6 carries it.
- raid-asm-method-write-reaches-every-tree gained a stronger witness today: project/product.md states the method resolution is already live. It stays unprobed until the merge at close, which is still the honest check.
- Two probes ran and one of them came back empty. An empty probe that names why is worth more than a scheduled one, because it turned up a defect nobody was looking for.

## anything_else

ON PROBING AN INSTRUMENT AND FINDING IT BROKEN.

The wall-clock probe was the cheapest one in the record: run the battery twice, compare two numbers. It cost about three minutes and produced no numbers at all.

That is not a failed probe. It is the most valuable result this milestone produced, and it came from doing the cheap check rather than reasoning about it.

The reasoning would have been comfortable. The battery has recorded timings since 2026-07-31, the file holds 260284 lines, and the record's own plan quotes figures from it. Every argument said the instrument worked.

TWO RUNS SAID OTHERWISE, and the file's own line count is the whole proof.

ON WHAT THAT DOES TO THIS RECORD'S RANKING.

The kickoff pulled twelve items in, ordered by a ranking derived from .se/test-last-run.json. That file is dated 2026-08-14 and nothing since has moved it.

So the ranking is not wrong yet, but it is unrefreshable, and it was built before a sixty-nine-commit merge. The first build item repairs the instrument, and the ranking is re-taken afterwards rather than trusted.

That is the record's own measure-first instruction applied to itself a second time, and it is the second time this walk that following it changed what comes next.
