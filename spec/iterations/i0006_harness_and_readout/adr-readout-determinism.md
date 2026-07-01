---
id: adr-readout-determinism
type: adr
statement: The bar and one-pager are a fixed 80 columns and fenced, with NO chat/terminal-width detection. Detection is impossible from the engine (output is captured, not a TTY) and would be non-deterministic; a fenced fixed width prevents mangling (horizontal scroll, no reflow). A config-set width was considered and deferred; 80 chosen as safe on a narrow pane.
addresses: [req-readout-width]
adjudicated_by: human
killer: false
---
## Rationale (not load-bearing)
i0006 decision. Determinism over false-dynamic width.
