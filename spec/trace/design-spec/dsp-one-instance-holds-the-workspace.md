---
minted_in: i62-background-work-reports-its-own-end-the-
id: dsp-one-instance-holds-the-workspace
type: "[[design-spec]]"
statement: how one instance takes a workspace by binding its port, how a second one is refused with what holds it, and how the hand registration stays recordable from any state
realizes:
  - el-entrypoint
files:
  - deliverable/engine/run.ts
  - deliverable/engine/bin/se-mcp.ts
  - deliverable/tests/work-lifecycle.test.ts
---

## Responsibility

TWO INSTANCES ON ONE WORKSPACE WRITE ONE LOG AND NEITHER SAYS SO. Four
processes were observed on one machine, 2026-08-24, in two parent-and-child
pairs started 47 seconds apart with identical arguments.

## The workspace hold is not the mirror port

THE TWO ARE DIFFERENT PORTS AND THEY ARE GOVERNED DIFFERENTLY. Reading them as
one produced a contradiction between this spec and the entrypoint, found by a
reviewer with no shared context.

| the mirror port | the workspace hold |
| --- | --- |
| one shared window, the same number for every folder | derived from the folder, so every folder has its own |
| a second agent may evict its holder and retry | a second server on the same folder stops |
| the lane matters more than the window | the folder's log and state matter more than the second server |

SO THE ENTRYPOINT KEEPS BOTH. It still evicts a busy mirror port, because a
second agent on the machine must not die over a window. It now takes the
workspace hold before serving, and stops when another server already has it.

WHAT THAT RESOLVES. The eviction was recorded as a deliberate ruling in the
entrypoint and this spec read as overturning it. Neither was wrong; they were
about different ports, and nothing said so.

## The take blocks the boot, and does not wait on the mirror

NOTHING TOUCHES THE FOLDER UNTIL THE HOLD IS DECIDED. The take is awaited
before the server is built and before the mirror starts.

THE REAP IS WHY. Starting the mirror closes every job the folder's records
still call running, and it does so synchronously. A take that resolved a turn
later let a refused second instance kill the FIRST instance's live processes on
its way out.

THAT INVERTS THE REAP'S OWN JUSTIFICATION. Settling entries a previous instance
left behind is safe only because one instance holds the folder. Reaping before
the hold is decided removes exactly that guarantee.

THE MIRROR DOES NOT GATE IT. The workspace port is derived from the folder
alone, so a server started with the mirror disabled shares the folder just as
dangerously. That configuration is the likely one on an unattended machine.

THE SHIM NEVER TAKES IT. Only the engine holds a folder; the shim proxies to
whoever does.

## The hold is the port and nothing else

BINDING IS THE TAKE. A successful bind is the hold, and there is no second
record of it anywhere.

NOTHING IS WRITTEN TO DISK. A lock file outlives its writer, so a crash would
turn a recoverable failure into a workspace nobody can start in. On an
unattended machine there is no person to clear it.

THE RELEASE WAS MEASURED, not assumed. On linux, node v22.22.2, a child took a
port and was killed with SIGKILL. Rebinding read `EADDRINUSE` while held, then
`ok` immediately after the kill, and `ok` again after a pause. The immediate
case is the one that mattered: a hold that lingers briefly and one that never
releases look identical in a single attempt.

## What the second instance does

IT SAYS WHICH WORKSPACE AND WHICH PORT ARE HELD, in one line, and exits
non-zero. No stack trace: the condition is expected rather than exceptional.

IT DOES NOT WAIT AND RETRY. Waiting would mean two instances racing for the
same workspace whenever the first one restarts. That is the opposite of what
the mirror port does, and deliberately so — see the table above.

## Why this is load-bearing for the other spec

SETTLING ENTRIES A PREVIOUS INSTANCE LEFT BEHIND IS ONLY SAFE BECAUSE ONE
INSTANCE HOLDS THE WORKSPACE. That reasoning is already written into the
engine, at deliverable/engine/run.ts line 1483, and nothing checks it.

THIS DESIGN TURNS THAT ASSUMPTION INTO A MECHANISM. The dependency runs one
way: the registry relies on the hold, and the hold knows nothing about the
registry.

## The registration exemption

RECORDING THAT A HAND WAS STARTED IS REFUSED EXACTLY WHERE A HAND WAS JUST
STARTED, because the call rides a verb that is not legal in every state. This
record's own first milestone hit it.

THE WIDENING IS PER ARGUMENT. Recording a start and closing a finished hand
become legal everywhere. Running a command, listing jobs and acknowledging
settled work do not move.

THE PRECEDENT IS ALREADY IN THE LANE. A read under the answers folder is
exempt from the state gate in every state, because the lane handed the caller
that call and cannot then refuse it. A hand that was genuinely started is the
same shape of fact.

WHERE LEGALITY CANNOT BE EXPRESSED PER ARGUMENT, the honest answer is a
separate verb for the registration rather than a wider one for everything.
That fallback is written here so the builder does not widen the verb to make a
test pass.

## What it deliberately does not do

IT DOES NOT COORDINATE TWO INSTANCES SO THEY CAN SHARE A WORKSPACE. That is a
different product.

IT DOES NOT NOTICE AN INSTANCE ON ANOTHER MACHINE with the same folder checked
out. One agent works one clone, and that stays an assumption in the register.
