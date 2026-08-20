---
minted_in: i36
id: opt-self-reported-heartbeat-instead-of-blocking-hook
type: "[[option]]"
statement: Have the walk itself periodically report that it is still working, and let the harness read that signal, instead of the harness asking to stop and a hook blocking the ask.
cluster: cluster-the-walk
found_by: transform
source: "SCAMPER Reverse, held against hold-the-session-through-work (meth-scamper.md): invert the order, so the caller becomes the callee."
---

## Mechanism

The current shape is the harness asking "may I stop" and a hook answering.
Reversing it: the walk itself emits a heartbeat while it has executable
work, and the harness's own idle-timeout logic (already present in most
hosts) never fires while heartbeats keep arriving.

WHAT SURVIVES THE TRANSFER. The self-reporting shape removes the need for
the harness to ask at all — the walk announces liveness rather than
defending against a stop request.

WHAT DOES NOT. Not every supported harness exposes a heartbeat or
keep-alive channel the walk could write to; a stop event that a host fires
unconditionally (a hard timeout, a user closing the window) still needs a
hook-side veto, so reversal alone cannot replace hold-the-session-through-work,
only potentially complement it.
