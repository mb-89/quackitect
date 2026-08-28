---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: tsp-the-account-the-gate-and-the-open-point
type: "[[test-spec]]"
statement: What a hand is doing is derived from the work itself, a gate judges only work that stands before it, an open point is ruled on at the next checkpoint, and a drawn value says whether it is a snapshot or a live reading.
method: test
verifies:
  - req-the-progress-account-is-derived-from-the-work-itself
  - req-a-gate-judges-on-the-work-minted-and-finished-before-it
  - req-an-open-point-is-ruled-on-at-the-next-checkpoint
  - req-a-surface-silence-is-answered-in-the-record
  - req-a-drawn-value-declares-snapshot-or-live-reading
files:
  - tests/work-reads.test.ts
---

## Scope

WHAT IT COVERS: everything that READS the work in order to say something about
it — the progress account, a gate's judgment, the checkpoint sweep, and any
figure a surface draws from it.

WHAT IS OUT: how the surface renders those answers, which is demonstrated.

## Approach

CROSS-CHECKS ARE THE METHOD HERE. Every one of these rows is a derived answer,
and the failure mode is the derivation disagreeing with the thing it derives
from. Each case asserts the derived value against the underlying work rather
than against a stored copy.

A STORED COPY NEVER BEATS A DERIVED ONE, which is a house rule, so the cases
deliberately introduce a stale stored value and assert the derived one wins and
that the disagreement is reported.

TIME BOUNDARIES for the gate: work minted before, during and after the gate,
because a gate judging on work that arrived after it is the defect.

ERROR CONDITIONS FORCED for the silence case: a surface that answers nothing at
all, which must still leave a record.

COMPONENT LEVEL, and the checkpoint case at integration level because it spans a
sweep.

## The file was renamed at the build, and the reason is the point

THIS SPEC ORIGINALLY NAMED `tests/work-account.test.ts`. That file already
exists, and it is about the JOB ACCOUNT that rides every lane call — how far a
background run has got, how many failed, how much longer it needs.

TWO DIFFERENT THINGS WERE ABOUT TO SHARE ONE NAME. "Account" would have meant
the progress of a shell job in one file and the progress of a record's work in
the file beside it.

THAT IS THE CORPUS INSPECTION'S OWN PASS LINE, met live rather than in a sweep.
The build renamed the file to `tests/work-reads.test.ts`, which says what it
holds: the reads that derive an answer ABOUT the work.

## Steps

Every case in the referenced file is one step. The load-bearing ones:

- THE ACCOUNT IS BUILT FROM THE WORK, not from a narration anybody typed. An
  item marked in progress appears; nothing else does.
- AN ITEM NOBODY MARKED DOES NOT APPEAR IN THE ACCOUNT, which is what makes the
  mark load-bearing rather than decorative.
- A STALE STORED COUNT LOSES TO THE DERIVED ONE, and the disagreement is
  reported rather than silently corrected.
- A GATE JUDGES WORK MINTED AND FINISHED BEFORE IT, and work arriving afterwards
  is outside its judgment.
- AN OPEN POINT REACHES THE NEXT CHECKPOINT and is ruled on there, so a point
  cannot be carried indefinitely by nobody looking.
- A SURFACE THAT ANSWERS NOTHING STILL LEAVES A RECORD, because silence and a
  slow answer are indistinguishable to a reader and only the record separates
  them.
- EVERY DRAWN VALUE SAYS WHETHER IT IS A SNAPSHOT OR A LIVE READING, and a value
  carrying neither is refused rather than assumed.

NO MANUAL STEP.
