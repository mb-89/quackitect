---
minted_in: i51-work-running-out-of-sight-reports-itself
id: exp-does-a-standing-hold-still
type: "[[experiment]]"
statement: While a verdict is being reached, does the durable record give a reader the same answer it will give afterwards, and can the reader tell the window is open?
probes:
  - raid-ar-a-machine-decision-repeats
  - raid-risk-a-hop-that-finishes-later-makes-green-ambiguous
timebox: 45 minutes
form: script
promote: "none"
folds_to: "a reader needs the operation's start time on the standing itself, because a stale answer and a live window look identical without it"
faked: Nothing. The run is a real `se_test` handoff over the real corpus, and both reads are of the real durable record on disk.
fallback: If the record cannot mark an open window, the build owes a recorded start time on the operation, so a reader can tell a live window from a stale answer.
verdict: falls
measured: "2026-08-21. A verdict was handed off at 10:40:51.348Z and settled about 100 s later, red. Read at 10:41:00.328Z and again at 10:42:07.436Z, .se/test-state.json was byte-identical both times and said ok: true with ts 2026-08-21T09:13:16.489Z — a green 88 minutes old, while the answer being computed was red. scoped_since_battery was empty at both reads. The job's own record on disk stayed one line throughout and named no state. At 86,079 ms the live progress read 175/175 files and 1716/1716 cases while the job still reported running: true."
source_refs:
  - rank-unknowns, the seeded pick
  - req-a-machine-decision-repeats
  - req-the-panel-s-paint-says-which-kind-of-green-it-is
---

## Setup

Run through the lane at 2026-08-21, from `iterations/i51/run-spikes/does-a-standing-hold-still`.

THE THIRD STANDING IS NOT BUILT, so this uses the one deferred verdict the
product already has: `se_test` hands off and reports later. That is the same
shape the handback will take, running today over the real corpus.

THE QUESTION ASKED was whether this record's new element, interface and
requirement nodes broke the trace and frontmatter checks. The engine decided the
scope itself and chose the whole battery, because 131 changed files had no test
that answers for them.

THREE READS: one just after the handoff, one in the middle, one after it settled.

## Result

### The two reads inside the window are identical, and both are wrong

| read | clock | `.se/test-state.json` says | reality |
| --- | --- | --- | --- |
| 1 | 10:41:00.328Z | `ok: true`, `ts` 09:13:16.489Z | a red verdict was already being computed |
| 2 | 10:42:07.436Z | `ok: true`, `ts` 09:13:16.489Z | unchanged, still wrong |
| 3 | after settle | `ok: false`, 1715 pass, 1 fail | the tree is red |

THE DURABLE RECORD NEVER MOVED DURING THE WINDOW. Same bytes at both reads,
carrying a green stamped 88 minutes earlier.

`scoped_since_battery` WAS EMPTY AT BOTH READS. Nothing there marks a run in
flight either.

THE JOB'S OWN FILE STAYED ONE LINE:

    {"id":"test-mt2tjjx0-2","started":1787308851348,
     "pace":" The last battery took 92s wall — expect the verdict on that scale."}

An id, a start time and a pace sentence. No state, and no marker a reader of the
record would find.

### So the answer to the question is no, on both halves

A READER GETS DIFFERENT ANSWERS AT DIFFERENT TIMES with nothing in the repository
having changed that the checks read. That is exactly what
`req-a-machine-decision-repeats` exists to prevent.

AND THE READER CANNOT TELL THE WINDOW IS OPEN. The stale green looks identical to
a fresh one. The only difference is its timestamp, and nothing tells a reader
that a newer answer is on its way.

### The sharper finding: done and still running are both true for a while

AT 86,079 ms the live progress read 175 of 175 files and 1716 of 1716 cases, and
the same call reported `running: true`.

EVERY UNIT OF WORK WAS FINISHED AND THE VERDICT WAS NOT IN. A reader that infers
green from "all cases done" is wrong during that gap, and the gap is not small —
the run settled about fourteen seconds later.

THIS IS `raid-risk-a-hop-that-finishes-later-makes-green-ambiguous` MEASURED. The
risk was written as a design worry; it is an observable state of the product
today.

### What went right, and it is worth saying

THE PACE SENTENCE WAS CLOSE. It promised the verdict on the scale of 92 seconds
and the run settled around 100.

THE LINEAR ESTIMATE HELD ITS EARLIER SHAPE. At 58,709 ms with 116 of 175 files
done, a linear projection gives 88.6 s against an actual near 100 s. It
under-predicted here where the earlier replay over-predicted, so the direction is
not reliable and the basis field is what makes that survivable.

## What this settles

[[raid-ar-a-machine-decision-repeats]] IS CONFIRMED. The window is real, it is
about a minute and a half wide for a battery, and the durable record gives a
confidently wrong answer throughout it.

THE FIX IS NAMED BY THE MEASUREMENT. A recorded start time on the operation is
what separates a live window from a stale answer, and the job record already has
`started`. What is missing is that the reader of the STANDING never sees it.

THE CLOSED WORD SET IS DOING REAL WORK HERE. A third word is the difference
between "green, stamped 88 minutes ago, and something newer is coming" and a
green a reader has no reason to doubt.
