---
form: stopping-layer-report
by: agent
signed_off: 2026-08-19T16:35:54.452Z
authors: agent
files: null
---

# Evidence form / stopping-layer-report

## current_situation

A lane call that ended without a normal result reported nothing about what ended it.

Recovery therefore started from whatever the engineer believed, and a wrong belief repeats the interruption while reading exactly like a right one. The register entry is raid-mcp-stop-is-not-diagnosable.

WHAT WAS AVAILABLE. After the previous chunk, the lifecycle log carries start, exit, listening, client-reset and client-error. Nothing read it, and nothing recorded a stop-hook veto at all, so the hook's own layer was invisible.

## built

project/deliverable/engine/stopping-layer.ts, new, plus one line in the stop hook.

`stoppingLayer(root, since)` reads the lifecycle log, keeps only lines at or after the call's start, and returns `{layer, evidence, why}`. The evidence is the log line VERBATIM, so a reader can check the verdict rather than trust it.

THE ORDER IS BY HOW CONCLUSIVE THE EVIDENCE IS, not by how likely the cause is.

- `exit` recorded after the call began means SERVER. It settles the question.
- `stop-block` means STOP-HOOK.
- `client-reset` or `client-error` with no exit means TRANSPORT: the client's socket failed and the process outlived it.
- Nothing recorded means UNKNOWN.

HOST IS NEVER RETURNED, deliberately. A host that cancels its own request tells the server nothing, so no line exists to find. Returning `host` would be inference dressed as evidence, and the requirement's measure forbids exactly that.

THE STOP HOOK NOW RECORDS ITS VETO. se-hook-stop.ts calls `recordLifecycle(root, "stop-block", ...)` beside the JSON it writes to stdout. Without that line a turn the hook ended looked exactly like one the transport ended.

TESTS. project/deliverable/tests/stopping-layer.test.ts, seven cases, all green. They cover each layer, that an exit outranks a reset, that unknown cites nothing, that events older than the call are not evidence about it, and that a missing log is unknown rather than an error.

Run on 2026-08-19 over stopping-layer.test.ts, lifecycle-log.test.ts and stophook.test.ts: 32 passed, 0 failed. All twenty standing stop-hook cases still pass with the new write in place.

## follow_up

THE HOST LAYER IS STILL UNOBSERVABLE, and this chunk makes that explicit rather than papering over it. `host` is in the type and is never returned, because nothing in the system sees a host cancel a request. Closing it needs a signal from the host side, which is the half the spike left owed and which raid-asm-an-engineer-can-tell-stop-hook-from-cancellation-today still carries.

NOTHING CALLS THIS YET. The diagnoser is a function with tests; no refusal or report invokes it. Wiring it into what an interrupted call actually shows a person is the next step, and it wants a caller that knows when the call began.

THE `since` ARGUMENT IS THE CALLER'S PROBLEM. A caller passing a timestamp that is too early will read an older exit as this call's, which is why the test for that case exists.

## anything_else

