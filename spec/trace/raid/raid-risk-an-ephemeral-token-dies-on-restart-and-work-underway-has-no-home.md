---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-risk-an-ephemeral-token-dies-on-restart-and-work-underway-has-no-home
type: "[[raid]]"
kind: risk
statement: A restart deletes every ephemeral token, so anything marked in work outside a record loses the only record that it was underway.
owner: the driving agent
trigger: the first restart during a state holding tokens marked in work, and any report of a walk repeating work it had already begun
status: open
impact: The proof of a finished thing survives, because read evidence is global and version-keyed. What does not survive is the fact that something was started and half done, so the walk repeats it with nothing saying it should not.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
---

## The rule as it stands

TWO CLEARING RULES ARE STATED and they point opposite ways on purpose.

- A RESTART DELETES EVERY EPHEMERAL TOKEN. Nothing outside a record survives
  the engine starting again.
- AN ESCAPE AND A RE-ENTRY DO NOT. Leaving a state and coming back finds the
  same open tokens waiting.

So escaping is not a way to clear work, and restarting is not a way to keep it.

## Why it is graded expected

THE STANDING CONDITION ALREADY HOLDS. Restarts happen, the rule says the
tokens go, and a token's status is where in-work lives. No coincidence is
needed and only the timing is open.

MEASURED THE SAME SESSION, on the mechanism this replaces: a reload cleared the
running checklist and the next entry naming an item was refused for pointing at
something unknown. Same shape, different store.

## What closes it, and the answers pull apart

THREE OPTIONS AND EACH COSTS SOMETHING DIFFERENT.

- The completed evidence carries the in-work fact too, so the survivor is
  enough to avoid repeating work.
- An in-work token is not ephemeral, which contradicts the clean rule that
  nothing outside a record persists.
- Nothing changes, and the repeat is accepted as cheap because ephemeral work
  is short by construction.

THE THIRD MAY WELL BE RIGHT. It should be chosen rather than defaulted into.
