---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: uc-walk-a-record-on-a-smaller-model
type: "[[use-case]]"
kind: interaction
statement: Drive a record's machine to its gates with a model that infers nothing, so the walk costs capability only where judgment is genuinely owed.
actor: stk-agent
trigger: a walk starts on a model chosen for its price rather than its judgment
precondition: the lane is up, the record is routed, and the agent holds the prompt layer
guarantee: either every mechanical step is completed from what the machine said, or the machine names the step that needs judgment it cannot supply and stops
refines:
  - sty-a-smaller-model-walks-a-record
priority: must
---

## Main scenario

1. The agent pulls. The answer names which of four instructions it got.
2. The answer names the ACT that moves the walk on: which call to make, and what to put in it. The agent does not work it out.
3. The agent does that act. Every name in the answer — a verb, a path, a clause — resolves to something that exists.
4. Where a call is refused, the refusal carries an executable remedy, and following it recovers in one turn.
5. Steps 1 to 4 repeat until a state needs judgment the model cannot supply.
6. At that state the machine says which step waits, and the walk stops there rather than producing something plausible.

## Extensions

- 2a. The answer's instruction is ambiguous between two acts. The agent picks one and is refused, which costs a round trip; the requirement below forbids the ambiguity rather than asking the agent to be cleverer.
- 2b. The act is a person's — a gate above the dial. The answer says so, names the gate, and the walk stops. It never reads as "you still have work".
- 3a. A name in the answer does not resolve. The agent hunts for it with a list, a glob and a read, and the cost is three to five calls per name.
- 4a. The refusal came from the HOST rather than the lane, so it carries no clause and no remedy. Nothing in the corpus covers it; the agent says which call was denied and stops.
- 5a. The model produces a confident, wrong account of its own state — a signed gate reported as refused, or a refusal reported as a bless. The machine's own record is what settles it, never the agent's report.
- 6a. The model does not notice that judgment is owed and answers anyway. This is the failure mode the guarantee is written against, and it is why the machine names the stop rather than leaving the agent to recognise one.

## What separates this from an ordinary walk

NOTHING IN THE MECHANICS IS DIFFERENT. The same states, the same forms, the
same gates. What changes is that INFERENCE STOPS BEING AVAILABLE as a way of
covering a gap.

SO EVERY GAP BECOMES VISIBLE AT ONCE. A stale instruction, a name that does
not resolve, an answer that does not say what to do — a capable model absorbs
all three and the walk looks fine. This use case is the one that does not
absorb them, which makes it the product's own test of whether the machine
actually says what it means.

THE READING IS THE SAME BAR EITHER WAY. A model that cannot follow the
mechanics is not a model that should be trusted with the judgment states, so
nothing here argues for lowering what a state demands.
