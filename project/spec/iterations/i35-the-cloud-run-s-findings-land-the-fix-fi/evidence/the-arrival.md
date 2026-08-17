---
form: the-arrival
by: agent
signed_off: 2026-08-17T12:09:36.194Z
authors: agent
files:
---

# Evidence form / the-arrival

## current_situation

Arrival A was five acts of prose in cloud-runner.md, performed by hand on every cloud run.

MEASURED on this box: most of an hour before the first se_pull. A runtime below the pin, an install, a shallow clone with neither main nor v2, a cage, and a hand-written JSON-RPC client.

## built

project/deliverable/engine/bin/se-arrive.ts — one idempotent act, six steps, each printing '<step>: <what happened>' in se-start's own shape.

REFS FIRST, and both halves. The fetch brings origin/main; git show main:... still fails against it, because a remote-tracking ref is not a revision named main. So the local branches are created too. MEASURED BOTH WAYS on this box: after the fetch alone a ref: main search still answered 'unknown revision'; after the branch it returned real matches.

RUNTIME SECOND, before anything is installed or spawned, because everything below runs node <file>.ts unflagged. It reads engines.node and never edits it.

CAGE AFTER THE RUNTIME, never before — a cage beside a lane that never came up is the silent half-arrival this element exists to prevent.

LANE HEADLESS, because an agent that already exists cannot be launched into one. --headless already existed and nothing pointed at it.

CLIENT LAST: .se/se-call.mjs, so no agent hand-rolls JSON-RPC again.

## follow_up

- Four functions are implemented twice, here and in se-start.ts. Filed as raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them with its repayment written.
- The after-measurement is owed. This box is no longer fresh enough to produce it.

## anything_else

THE HARDEST PART WAS NOT THE SCRIPT, it was working out that the lane had to be headless.

A cloud chat session cannot register an MCP server into itself after it has started, so the caged-subagent hand-over cloud-runner.md prescribes does not work on this harness — a subagent inherits the session's registry. --headless plus an HTTP attach is the answer, and it was already in the engine, undocumented for this use.

That whole design rests on one assumption, filed as raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server. Falsify it and half of this chunk becomes unnecessary.
