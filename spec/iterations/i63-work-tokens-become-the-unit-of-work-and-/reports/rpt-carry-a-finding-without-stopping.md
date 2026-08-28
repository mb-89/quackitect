---
kind: report
statement: Demonstration of sty-carry-a-finding-without-stopping, performed against the shipped system on the walk of i63 itself.
demonstrates: sty-carry-a-finding-without-stopping
performed: 2026-08-27
performed_by: walker
outcome: observed
---

# Report / carry a finding without stopping

## What the story demands

When a check turns up a real defect that breaks nothing, the finding is
recorded and the walk keeps going. The defect must not be lost, and it must not
stop the work in hand.

## How it was performed

NOT BY A SCRIPT. The demonstration ran on this iteration's own walk, on the
shipped engine, using the shipped lane. Every act below is in the call log.

## What was observed

THREE FINDINGS WERE RECORDED AND THE WALK CONTINUED PAST EACH ONE.

- Three doors reach a gate's thumb where there should be one. Recorded as
  `note-c71d78487f20`. The walk did not stop; the rule was hung on one method
  and the deeper question went to the retro.
- The sweep's per-hop cost fills a twenty-second budget, and the fix everyone
  names is already built. Recorded as `note-13326ca46434`. The walk did not
  stop; the token was settled `carried` with the finding attached.
- A hard wall-clock assertion flakes inside the battery that saturates the box.
  Recorded as `note-bedbeb45e2e7`. The walk did not stop; the battery was
  re-run on a quiet machine and passed.

EACH FINDING SURVIVED ITS OWN MOMENT. All three are readable now, by reference,
without anybody having been present when they were found.

## The part that proves the demand rather than the mechanism

THE THIRD FINDING BROKE NOTHING AND LOOKED LIKE IT DID. A green tree read as
red because of a timing assertion under load. The story's demand is exactly
this case: record it, keep going, do not let a harmless finding stop the work.
That is what happened, and the same tree passed 2,275 of 2,275 minutes later.

## What the observation left behind

- `note-c71d78487f20`, `note-13326ca46434`, `note-bedbeb45e2e7` in the inbox,
  each drainable at the retro.
- Four settled work tokens at `iterations/i63/fix-findings`, each carrying what
  happened rather than that it finished.
- The call log, which holds every act above with its comment.

## What was NOT observed

THE DRAIN. These findings were recorded and carried; none of them has been
drained to a durable home yet, because the retro has not run. The story's
demand ends at recording and continuing, so this is the next state's work
rather than a gap in the demonstration.
