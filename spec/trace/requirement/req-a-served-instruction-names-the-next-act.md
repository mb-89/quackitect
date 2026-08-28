---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: req-a-served-instruction-names-the-next-act
type: "[[requirement]]"
statement: When the engine answers a pull, the answer shall name the act that moves the walk on from where it stands, including the call to make and what it carries.
kind: functional
verify_method: test
breaks_if_removed: An agent that cannot infer the missing act either loops on the same answer or invents a stop, and neither shows up as a failure — the walk simply ends with a door open and a report saying it was blocked.
breaks_how_badly: corrosive
refines:
  - uc-walk-a-record-on-a-smaller-model
source_refs:
  - "owner ruling: the mechanical work should run on a cheap model, because the token cost of the big models is too high for cloud sessions"
  - "measured on the i15 walk: a gate stood signed with every section full, and the answer said `fill every required section` — the only thing owed was the bless, and nothing said so"
  - "measured on the i15 walk: a `wait` at draft-vision carried the very door it said it could not route to, and no field told the reader what to do with it"
  - "measured on the i35 cloud run: a `do` that could not move answered `the stopped step says what it wants` while no step had said anything, five times"
  - req-refusal-carries-remedy
priority: must
---

## What the row demands

EVERY ANSWER ENDS WITH AN ACT THE READER CAN PERFORM. Not a description of the
situation, and not a rule from which the act can be derived.

THE THREE SHAPES THAT BREAK IT, each measured:

- AN ANSWER THAT DESCRIBES WORK ALREADY DONE. A signed gate re-served with
  "fill every required section" when every section is full.
- AN ANSWER THAT NAMES A STOP WHILE AN ACT IS AVAILABLE. A `wait` carrying
  open doors, where the contract defines `wait` as stop.
- AN ANSWER THAT POINTS AT A SPEAKER WHO SAID NOTHING. "The stopped step says
  what it wants", where no step refused.

## Where the act is a person's

THE ROW IS SATISFIED BY SAYING SO. "This gate's bless is the person's, and the
dial alone cannot wake you" is a named act — the agent's act is to say which
step waits and stop.

WHAT IT FORBIDS IS SILENCE. An answer that neither names an act for the agent
nor names the person is the failure this row exists to catch, and it is the
shape that reads most like the machine working.

## Why it is graded corrosive

IT NEVER PRESENTS AS A FAULT. The engine is not wrong, no check is red, and
the log shows pulls answering normally. What is lost is the walk, and the
report that comes back describes a blocker that does not exist.

THAT MAKES IT WORSE THAN A REFUSAL, which is loud, typed, and carries its own
way forward.

## What the row does NOT say

IT NAMES NO WORDING AND NO FIELD. Whether the act rides `do`, `remedy` or
something not yet built is the design's to choose.

IT DOES NOT ASK THE ENGINE TO DECIDE FOR THE AGENT. Naming the act available
is not the same as taking it. Where the agent may not act — a door its routed
goal does not lie behind — the answer names that too.
