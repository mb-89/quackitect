---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: tsp-one-call-lists-every-piece-of-work-out-of-sight
type: "[[test-spec]]"
statement: An agent holding a test run and a shell command makes one call and gets both back, each saying how much longer it needs and what that figure rests on.
method: demonstration
demonstrates:
  - sty-ask-once-what-is-still-running
verifies: "none — demonstrates carries the edge; req-one-call-reports-every-piece-of-work-out-of-sight is verify method test and is carried by the test-method specs beside it"
files:
  - none — the procedure below is the definition, because the pass is what one real answer holds
---

## Scope

One agent, two pieces of work running at once, one call. The two pieces come
from different tables on purpose: a test run and a shell command.

## Why demonstration and not test

A TEST CAN ASSERT THE SHAPE OF THE ANSWER. It can start two operations, call
once, and check that both entries stand with a duration and a basis. That is
worth having and it is not this.

WHAT THIS PROCEDURE ASKS IS WHETHER THE ANSWER LETS SOMEBODY STOP POLLING. That
is a judgment about a real session with real waits, and it is settled by walking
a real record rather than by a fixture.

THE STORY SAYS SO ITSELF: "so I can wait that long instead of polling every few
seconds". Polling is a behaviour, and only a real walk shows whether it stopped.

## Procedure

- Start a test run and leave it running.
- Start a shell command that takes long enough to still be going.
- Make ONE lane call of any kind. Do not ask about either handle.
- Read the work account that rides that answer.

## Pass line

- BOTH PIECES STAND IN ONE ANSWER, the test run and the shell command together.
- EACH NAMES A TIME REMAINING, or says plainly why no figure is given.
- EACH NAMES WHAT THE FIGURE RESTS ON, so a reader can discount it.
- NOTHING SETTLED RIDES ALONG. Work that has finished and been read is gone from
  the ride, and its record is still reachable by its own id.

## Fail line

- Either piece is missing, so the caller must ask a second time.
- A figure stands with no basis, which is a duration a reader cannot discount.
- The answer carries every job the session ever started, which is the noise that
  made the listing 1.1 megabytes.
