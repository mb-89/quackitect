---
minted_in: i51
id: exp-does-a-left-check-survive-its-call
type: "[[experiment]]"
statement: Does a step's leaving check, started the way the engine starts one today, run to completion and leave a readable verdict after the call that started it has answered?
probes:
  - raid-asm-a-check-left-running-survives-on-every-platform
timebox: 60 minutes
form: script
faked: The judgment itself. The run spawns a sleeping stand-in rather than a real exit script, because no exit script in the tree takes long enough to observe the window. The SPAWN is the real one, copied from deliverable/engine/sessionscript.ts line 50 — same binary, same undetached mode, same piped stdio, same drain handlers.
fallback: If a left-running judgment does not survive, the handback is unbuildable as designed and the fallback is to keep the await and make the judgment itself cheap — cap what an exit script may do rather than when it may finish.
verdict: holds
measured: "2026-08-21 on linux, node v22.22.2. The call answered in 4 ms while the judgment ran 3003 ms. The verdict was readable at 5007 ms with exit code 0 and stdout fully drained. An orphaned judgment whose starter exited at 5052 ms still completed and wrote its verdict at 10058 ms. A killed judgment reported code=null signal=SIGTERM and left no verdict file at all (ENOENT)."
source_refs:
  - rank-unknowns, the seeded pick
  - req-a-leaving-check-does-not-hold-the-call
  - req-a-pending-verdict-is-recorded-against-its-state
---

## Setup

`scratchpad/spike-left-check.mjs`, run through the lane at 2026-08-21.

THE SPAWN IS THE PRODUCT'S OWN. `deliverable/engine/sessionscript.ts` line 50
spawns a condition script as `spawn("node", [abs, "--root", where], {cwd, env})`
— undetached, stdio piped, with drain handlers on both streams and a 600-second
kill timer at line 87. The probe copies that shape exactly.

WHAT IS STOOD IN FOR is the judgment's body: a script that sleeps a named number
of milliseconds, then writes a verdict file and prints one `##progress` line.
Nothing in the tree has an exit script slow enough to watch the window open.

THREE PARTS, EACH ANSWERING A DIFFERENT HALF OF THE ASSUMPTION.

- A — the caller answers and does not await. Does the judgment finish, and is
  its verdict readable afterwards?
- B — the process that started the judgment exits. Does the judgment survive
  losing its parent?
- C — the judgment is killed the way the 600-second timer kills it. What does
  the failure look like from outside?

## Result

Measured 2026-08-21, linux, node v22.22.2.

| part | what happened | at |
| --- | --- | --- |
| A | the call answered, nothing awaited | 4 ms |
| A | verdict readable, `ran_ms` 3003, exit code 0, stdout drained | 5007 ms |
| B | the starter process exited, judgment orphaned | 5052 ms |
| B | the orphaned judgment completed and wrote its verdict | 10058 ms |
| C | the killed judgment closed with `code=null signal=SIGTERM` | 10564 ms |
| C | no verdict file existed at all, `ENOENT` | 10565 ms |

### The assumption holds, and it holds wider than it was written

THE HANDBACK NEEDS NO NEW SPAWN MODE. The shape already in the tree survives its
call. Part A is the whole demand of
`req-a-leaving-check-does-not-hold-the-call`, and the call answered in 4 ms
against a 3-second judgment.

DETACHING IS NOT NEEDED EITHER. Part B is the surprise: on Linux an undetached
child outlives its parent. The judgment kept running after the process that
spawned it was gone, and its verdict landed.

### And part B narrows a fatal risk without closing it

[[raid-ar-walk-resumes-from-repo]] SAYS A CRASH LEAVES A WORD THE REPOSITORY
CANNOT SETTLE. Part B says the WORK does not die — the judgment finishes.

WHAT DIES IS THE READER. Nothing was listening when the orphaned verdict landed,
so the verdict reached a file nobody would look in.

SO THE RISK IS SMALLER AND STILL REAL. It is not "the work is lost". It is "the
work finishes and its answer has no route back into the record". A settle path
that writes where a fresh session looks would close it; that is
`what-a-fresh-session-sees` to confirm and M7 to build.

### Part C confirms the failure behaviour the design already wrote down

[[if-walk-engine-to-work-registry]] SAYS a judgment that dies without settling is
settled as failed rather than left deciding for ever.

THE MEASUREMENT SUPPORTS THAT AND NAMES THE SIGNAL. A killed judgment produces
no verdict file, so absence is unambiguous: `ENOENT` plus a dead process is a
failure and cannot be mistaken for a judgment still thinking.

### What was not reached

WINDOWS AND MACOS. This machine runs Linux and nothing else was available, so the
assumption's "on every platform" clause is measured on one of three.

THAT MATTERS MOST FOR PART B. Process lifetime after a parent exits is the part
most likely to differ, because it is the part the operating system decides rather
than Node. Parts A and C depend on Node's own behaviour and travel better.

THE ASSUMPTION'S TRIGGER STAYS ARMED for that reason: the first verdict that
never arrives after its call answered, on any platform.
