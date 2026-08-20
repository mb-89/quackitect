---
form: the-log-answers-by-any-coordinate
by: agent
signed_off: 2026-08-20T20:17:02.470Z
authors: agent
files:
---

# Evidence form / the-log-answers-by-any-coordinate

## current_situation

The three coordinates are on the record and a caller can state two of them. Grouping by them already worked, because the query digs a path out of each record and counts.

WHAT DID NOT WORK IS TELLING A REAL ANSWER FROM AN INSTRUMENT FAILURE. `group_by: "banana"` returned `{"(none)": N}` and so did grouping by a field every record shares. This iteration read the first as evidence that the state coordinate was missing, and it is not evidence of anything.

## built

THE ANSWER NOW NAMES A KEY NOBODY CARRIES. `group_by_reached_nothing` is set, carrying the key, when no record in the window digs to a value for it. The groups still say `(none)`; what is new is that the reader is told which of the two answers it is holding.

THREE CASES HOLD THE THREE READINGS APART.

- A key nothing carries reports itself, and a key everybody shares does not.
- A key SOME records carry is not reported. A partial miss is a finding about the records, not about the instrument.
- An empty log does not claim the key reached nothing. Nothing to reach is not the same as reaching nothing, and a window with no records would otherwise flag every key.

THE FLAG IS ABSENT RATHER THAN FALSE when it does not apply, so a reader who does not know about it sees exactly what they saw before.

## follow_up

THE FEED AND THE SURVEY DO NOT SHOW THE FLAG YET. It rides the query's answer, which is what the retro and the log lane read. Putting it on a rendered surface is a mirror change and no requirement asks for one.

THE MEASUREMENT THIS FIXES IS THE ONE THIS ITERATION GOT WRONG, and the record already carries the correction: `uc-attribute-a-finished-walk` extension 2a says the absence of the state coordinate is real and that the grouping is not what establishes it. What establishes it is reading the record's own declaration.

SO THE FLAG DOES NOT MAKE GROUPING A PROOF OF ABSENCE. It makes grouping stop LOOKING like one.

## anything_else

