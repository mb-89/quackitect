---
id: req-onion-io-rendering
type: requirement
depends_on: []
statement: The book shall render every onion layer per the committed layout spec onion-io-layout.excalidraw.md: inputs on the top bus, outputs on the bottom bus, node sides by core direction.
class: review
killer: false
kind: functional
provenance:
  statement: user-ruling via the M2 elicitation sessions (2026-07-17/18)
  class: schema-default (review)
  ears: tbd - no default, no derivation yet
  killer: schema-default (false)
  kind: agent-proposal: first of functional|quality|constraint|interface - veto or confirm
---
## Layout rules (the diagram is the binding spec)

The committed drawing [onion-io-layout.excalidraw.md](onion-io-layout.excalidraw.md) is the layout specification. Its rules in prose:

1. Inputs enter on horizontal buses at the TOP. Outputs leave on horizontal buses at the BOTTOM. This holds for every layer, including the topmost.

2. The TOPMOST view shows no inner nodes. It shows only the rings, each selectable to dive one level in. Arrows stop at the onion's outside.

3. A node whose output goes INTO the core sits on the LEFT.

4. A node that receives its input FROM the core sits on the RIGHT.

5. An input may run straight to the core. A core output may run straight to the output bus.

6. A pass-through node touches the layer but not the core. It sits left or right, sorted against crowding.

7. Every layer renders the same. The lowest layer is the same minus the core.

8. The onion is always round, with the core centered. Never ovals.

## Rationale (not load-bearing)
The owner drew the layout and ruled rendering-first; the interface modeling question is separate and later in this iteration.
