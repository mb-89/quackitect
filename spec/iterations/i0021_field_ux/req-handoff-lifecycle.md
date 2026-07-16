---
id: req-handoff-lifecycle
type: requirement
statement: When a hand-off page opens, the engine shall serve it from a bounded one-shot server whose life follows the page. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a hand-off renders, the engine shall serve the page from a bounded one-shot server recording at most one answer.
2. While the page stays open, the page shall heartbeat the server; when the heartbeats stop, the server shall exit with no answer and the gate shall stay open.
3. If no page connects or no answer arrives within the bound, then the server shall exit cleanly.

## Rationale (not load-bearing)
The owner's ruling (2026-07-14): closing the page without answering is EXPECTED behavior and
must degrade properly - the server dies, the gate stays open, nothing dangles. The watchdog is
the owner's own sketch: the page heartbeats while open; silence kills the server.
