---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: opt-everything-is-ready-unless-an-order-was-written-down
type: "[[option]]"
statement: treat every piece of work as ready to be taken up, and compute readiness only for the few that name something they wait on
cluster: the-work
found_by: heuristic
source: "the catalogue rule: make the common case cheap, make the rare case possible"
---

## Mechanism

MOST WORK WAITS ON NOTHING. A position's work tokens are usually a handful of
independent things, and an order between them was written for a minority of
cases. So the common case is answered without any graph at all: everything
open is offered.

THE RARE CASE STAYS POSSIBLE. Where a piece of work names a predecessor, that
edge is followed and the work is withheld until the edge is satisfied. Only
those pieces cost anything to decide.

WHAT IT BUYS. Offering stops being a graph walk and becomes a filter, which
is the difference between a cost per position and a cost per dependency.

WHAT IT COSTS. Nothing catches a dependency somebody forgot to write down.
The system cannot infer that one work token needs another, so an order that
matters and was not stated is an order that does not exist.

WHY THAT IS ACCEPTABLE HERE. The register already says readiness is derived
from a DECLARED dependency, so the inference was never promised. This option
just makes the absence of a declaration the fast path rather than a case the
graph handles.
