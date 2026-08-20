---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: if-walk-engine-to-web
type: "[[interface]]"
statement: The one edge the product does not own either end of, so its bound is a promise about behaviour rather than about speed.
source: el-walk-engine
destination: nbr-web
carries:
  - flow-outside-result
form: HTTPS
bound: not one second, and it says so
source_refs:
  - "i33 model-the-boundaries: the outside edges the element matrix never drew"
---

## What crosses

- a fetch of a named page, and what comes back
- a search, whose backend runs on a provider nobody here controls

## Measured 2026-08-17

Two fetches on the same connection, minutes apart:

- example.com: 284 ms
- a README from raw.githubusercontent.com: 4,769 ms

A SEVENTEENFOLD SPREAD, and neither end of it is ours. That is the argument
for this edge's bound made as a measurement rather than as a claim: the fast
case is well inside a second and the slow case is nearly five times outside
it, on the same machine, minutes apart, with nothing here having changed.

## Why the bound is not a second

NOBODY HERE OWNS THE FAR END. A remote host answers when it answers, and a rule
demanding a second would be a rule the product cannot keep and would quietly
stop meaning anything.

SO THIS EDGE TAKES THE HONESTY HALF ENTIRELY, and it is the clearest case in
the model for why that half is a real requirement rather than a fallback. There
is no version of this interface that is fast by being built better.

## What it must still guarantee

- it says it is working, inside the second, before the wait begins
- a timeout is an answer with a reason, never a silence
- the result names its source, so a reader can follow it to the original

## The one edge with a standing exception in the cage

WEB SEARCH IS ALLOWED NATIVELY, because it runs on the provider's backend and
cannot be self-hosted without a key. Every query still reaches the log
mechanically through a hook. That is a property of THIS interface and is
recorded here rather than only in the cage's rules.
