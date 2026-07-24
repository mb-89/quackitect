---
id: se.adr-phone-poll-in-board
kind: adr
statement: The phone lane is one injectable-transport module; OUTBOUND publishes on the offer-created event and INBOUND is polled by the already-running board process - no dedicated watcher process.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: Either a new silent-failure process appears (K2) or the lane has no host for its inbound poll.
edges:
  addresses: [se.req-phone-publish, se.req-phone-transport-injectable, se.req-phone-best-effort]
---

## Decision

K1 from the i8 M5 convergence. engine/phone.ts owns publish + poll behind an injectable Transport; the board process calls the poll each tick (it already polls state every 2s and already shows liveness). Zero new processes in an unattended system.

## Rejected

- K2 dedicated watcher process: a new long-lived thing to supervise and reap, a silent-failure surface in exactly the unattended mode the delegation depends on. Stays the recorded FALLBACK - TW1 (bless-while-board-off) or TW2 (many topics) flips to it mechanically.
- K3 WebSocket/SSE subscribe: unattended reconnect/drop surface for a latency win that a 6h window makes moot.

## Tripwires

TW1 board-off adjudication -> stand up the dedicated watcher; TW2 topic scale -> per-stream watcher (composes with i5 worktree streams).
