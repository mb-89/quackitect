---
id: se.adr-json-tree-native-first
kind: adr
statement: Structured data in board detail panes renders as a server-side native collapsible tree first; a hand-rolled client layer (expand-all, search) is pre-approved and builds the moment the owner's board round asks for it.
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
---

## Decision

J1 first: the projection's JSON renders into native collapsible elements server-side - no script, satisfies the zero-raw-JSON pass line outright. The J2 client layer (search + filter over the same rendered tree: key:/val: keywords, /re/ regex, space-AND, a ? help listing them) ships IN THE SAME BUILD - tripwire T-J2 was fired pre-emptively by the owner before the first board round, on the argument that the fallback renderer will carry most of what the owner reads.

## Addresses
- [[req-json-tree]] - plain text stops being the fallback
- the visibility/record tension: the tree renders exactly what the projection holds, never a summary of it

## Rejected, kept as history
- J3, a vendored renderer library: eliminated at the M4 gate under the pre-correction criterion; under [[adr-install-over-zerodep]] such options re-enter future rounds on their merits.
