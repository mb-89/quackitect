---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-dec-completeness-beats-flow-at-a-position-boundary
type: "[[raid]]"
kind: decision
statement: "A state may only be left when every token in its input and output buckets has reached a terminal status or moved elsewhere, and that batching rule is accepted deliberately over letting each token flow on alone."
owner: the owner role
trigger: "the first state that stalls on a token nobody can finish, and any measurement showing a state's time dominated by its slowest single token"
status: open
impact: "This is the rule the whole design rests on. If it proves wrong, the guarantee that nothing is skipped in silence goes with it, and what is left is a filing system."
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
---

## What is given up

IT IS A MAXIMUM-BATCH RULE. Holding a state until everything in it is settled
sets the transfer batch to the whole state. State time then equals the slowest
token rather than the average, which is the property flow-based methods spend
their effort avoiding.

NO SURVEYED TRACKER DOES THIS. One has a narrow opt-in for a single case, and
the community answer for anything wider is a paid add-on.

## Why it is taken anyway

NO SECOND BATCH EVER QUEUES BEHIND THE FIRST. The batching objection is that
holding this batch delays the NEXT batch waiting behind it. Nothing queues
behind a state here.

RE-ENTERING A STATE RESUMES THE SAME BATCH and queues no other, so the
objection does not reach it. An earlier wording said positions are never
reused, which invited a fair attack: escaping and returning is a re-entry, and
so is a reopen.

A TOKEN HAS SEVERAL WAYS TO SETTLE. Done, cancelled, rejected, skipped, and
moved elsewhere. Moved is a real exit, not a failure, so nothing can freeze a
state by being unfinishable.

COMPLETENESS IS WHAT A GOVERNED PROCESS SELLS. The failure this system actually
measured was a step silently skipped, not a queue running slow.

## Why it is graded conceivable

FOR THE DECISION TO BE WRONG, two independent things must both hold: a state
must genuinely stall, and the several settling routes must all be unavailable
to whoever is standing there. Either alone is survivable.

## Rejected options

LET EACH TOKEN LEAVE WHEN IT IS DONE, with the state closing on its own
schedule. REJECTED because nothing then holds a state open for a step nobody
took, which is the single failure this whole design exists to stop.

CAP THE NUMBER OF TOKENS IN A STATE AND COUNT WHAT IS OUTSTANDING. REJECTED
for now, and it is the strongest of the losers. It bounds work in progress
without tying the exit to the last token, and it is what the surveyed field
actually does. It loses here only because the exit guarantee is the product.

A PER-TRANSITION OPT-IN, where some states hold and others do not. REJECTED
because an exception is a rule with a hole in it, and the next reader has to be
told about the hole.

## Consequences

A STATE'S ELAPSED TIME IS ITS SLOWEST TOKEN, not its average. Anyone measuring
state time must read it that way.

EVERY TOKEN NEEDS A ROUTE OUT THAT IS NOT DOING IT. Cancelled, rejected,
skipped and moved all have to exist and all have to be reachable from the
surface, or this rule becomes a trap.

MOVED IS A REAL EXIT AND MUST STAY ONE. If moving a token ever stops releasing
the state, the kickoff cannot redistribute the scope it was handed, and the
first state of every record deadlocks.

A STATE WITH NOTHING IN ITS TOP ROW IS FINISHED, and that is what makes the
surface readable at a glance. It only holds while this rule does.

## The fallback if it flips

CAP HOW MANY TOKENS MAY BE IN A STATE, let each leave when it is done, and
count what is outstanding. That keeps a bound on work in progress without
tying the exit to the last token.
