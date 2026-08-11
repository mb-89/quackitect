---
id: req-state-needs-all-its-inputs
type: "[[requirement]]"
statement: "The engine shall refuse a state's submit until its inputs are met: every input when a busbar stands above it, otherwise at least one."
kind: functional
verify_method: test
breaks_if_removed: A state stamps over work nobody did, and the panel reports that green as earned.
breaks_how_badly: fatal
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step precondition
  - uc-take-a-step step 6
  - "owner ruling 2026-08-06: no state submits while a state it depends on is unsubmitted"
  - "owner ruling 2026-08-06: the busbar is authored into the machine, and its absence is the OR"
priority: must
---

## Detail

The busbar is an element of the state machine. Somebody draws it. The engine
never decides where one belongs.

### The three cases

| inputs | busbar | what the engine demands |
| --- | --- | --- |
| one | either | that input signed |
| several | drawn | every input signed |
| several | none | at least one input signed |

A single input needs no bar. One of one is all of one, so the two rules meet
and a lone predecessor binds either way.

### The facets

| facet | what it demands |
| --- | --- |
| every state | The rule binds work states and gates alike. A gate is not special. |
| authored | A bar is declared on the row. It is never inferred from input count. |
| named | The refusal lists each unsigned input, so the walk knows where to go back to. |
| drawn | A declared bar renders above the state, with its inputs as taps. |
| one rule | The bar and the refusal are computed from the same declaration. |
| not fallbacks | A fallback edge and its recovery edge are not inputs. |

### Why the drawing is part of the requirement

A bar on the panel is a promise to a person reading it. If the drawing and
the check disagree, one of them lies.

They disagreed once. Both restricted themselves to gates, so they agreed with
each other and were wrong together. Every work state took its inputs as an OR,
and a work state with a single input was not checked at all.

### What it does not cover

Entry conditions and owed reading are [[req-state-opens-only-when-earned]].
That requirement guards the doorway in. This one guards the stamp on the way
out.
