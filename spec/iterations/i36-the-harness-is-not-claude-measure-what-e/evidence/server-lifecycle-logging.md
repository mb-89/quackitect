---
form: server-lifecycle-logging
by: agent
signed_off: 2026-08-19T16:33:23.563Z
authors: agent
files:
---

# Evidence form / server-lifecycle-logging

## current_situation

The spike exp-copilot-connection-reset-keeps-server-alive measured a real ECONNRESET on 2026-08-19. VS Code reported the reset, PID 20652 was still listening on port 7333, and engine.log recorded no start and no exit at that time.

THE ANSWER CAME FROM ABSENCE. The only thing saying the server had survived was that nothing was written. An engineer had to inspect a PID and a port listener by hand to establish it.

WHAT EXISTED. Lifecycle records were written on the child branch of se-mcp.ts — start, exit, uncaught, stream errors. Nothing recorded a CLIENT-side failure, so a reset left no line anywhere.

AN ABSENCE IS NOT EVIDENCE A PERSON CAN ACT ON. It cannot be told from a log that was never opened, a root that was not writable, or a process that died before it could write.

## built

project/deliverable/engine/lifecycle.ts, new, plus wiring in mirror.ts.

THE RECORDER. `recordLifecycle(root, event, detail)` appends one line to `.se/engine.log` carrying an ISO timestamp, the pid, the event and its detail. The event word is a CLOSED SET — start, exit, listening, client-reset, client-error — so a later reader matches on it rather than parsing prose. It never throws: a postmortem that cannot be written must not become the cause of death.

THE WIRING. `recordClientFailures(root, server)` attaches to the HTTP server's `clientError`, records ECONNRESET as `client-reset` and anything else as `client-error`, then destroys the socket. mirror.ts calls it, and its `listen` callback now records `listening port=<n>`.

THE KEEP-ALIVE POLICY WAS ALREADY EXPLICIT and is left alone: keepAliveTimeout 120,000 and headersTimeout 125,000, with the comment saying why — VS Code Copilot reuses its localhost connection and Node's short default window resets that reused socket between tool calls.

TESTS. project/deliverable/tests/lifecycle-log.test.ts, five cases, all green:

- a start and an exit are both recorded, with the pid on each
- a client reset is its own event
- a reset recorded with no exit beside it is what says the server survived
- an unwritable root is survived
- a live server records the socket failures its clients cause, driven by writing malformed bytes at a real listener

Run on 2026-08-19: 5 passed, 0 failed.

## follow_up

THIS MAKES THE NEXT CHUNK POSSIBLE. stopping-layer-report has to name server, transport, host or stop hook. `client-reset` in the lifecycle log beside a `listening` with no `exit` is the transport-versus-server evidence it will read.

THE CHILD BRANCH STILL HAS ITS OWN COPY. se-mcp.ts keeps a private `record` closure writing the same file in the same shape. It works and was left alone, but there are now two writers of one format. Folding that branch onto recordLifecycle would remove the chance of them drifting.

HOST CANCELLATION IS STILL NOT DISTINGUISHABLE. A reset tells transport from server. Whether the HOST cancelled the call is a different signal and no line carries it yet, which is exactly the half the spike left owed.

## anything_else

