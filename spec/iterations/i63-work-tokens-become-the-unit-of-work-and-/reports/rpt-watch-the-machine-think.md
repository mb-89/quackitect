---
kind: report
statement: Demonstration of sty-watch-the-machine-think. The trail the watcher reads was built and exercised tonight; the watching was done by the owner rather than by me.
demonstrates: sty-watch-the-machine-think
performed: 2026-08-27
performed_by: walker
outcome: partly observed
---

# Report / watch the machine think

## What the story demands

While the agent works, a watcher sees which piece it is on and how it broke the
job down, without interrupting it.

## THE HEADLINE

THE TRAIL IS BUILT AND IT WAS EXERCISED ALL EVENING. Whether it reads well on
the panel is the owner's judgment, and they made it twice tonight — once to say
it did not, and once by acting on what they saw.

## What was observed

WHICH PIECE THE AGENT IS ON IS ON ITS OWN FACE. Nine tokens were taken and
settled through the session. A token in work carries the hand that holds it, so
the piece in hand is a fact on the board rather than a guess from silence.

EVERY ACT WRITES ITS OWN LINE, AND THE LINE SAYS WHAT AND WHY. This was built
tonight to the owner's ruling: "I wanna see the name of the token you finished
and your comment in the log." The feed now prints `finished "<the name>" — <the
comment>` for a settle, and the same shape for an open and a take. Neither the
name nor the comment is in the arguments a settle sends, so the feed reads the
answer instead.

THE WATCHER ACTUALLY WATCHED, AND IT WORKED. Twice tonight the owner read the
board and corrected the walk from outside it. Once because a settle said
"finished unbuilt and carried" and they could not tell whether anything was
fixed. Once because the board showed no work in hand while work was in hand.
Both corrections came from the trail rather than from asking me.

A BIG PIECE WAS BROKEN DOWN AND THE PARTS WERE VISIBLE. The write-count fix was
opened, found defective, and a second token opened for the defect with its own
comment saying what was wrong. The split is readable as two objects rather than
as a paragraph.

## What the observation left behind

- Nine token acts in the call log, each with its comment.
- `deliverable/tests/tokens-speak.test.ts`, seven cases pinning the feed line.
- Two corrections the owner made from the board, both recorded in what followed.

## What was NOT observed

THE PANEL. I did not look at it; the agent does not look at a screen unasked.
So the claim here is that the DATA the panel draws is correct and complete, not
that the panel draws it well.

AND ONE PART IS KNOWN IMPERFECT. The feed brief is capped at 90 characters, so
a long comment is cut. The name always survives. Widening it is a layout change
and the sketch is the owner's.
