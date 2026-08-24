---
form: fix-findings
judgment: passed at 2026-08-24T16:51:32.730Z
by: agent
signed_off: 2026-08-24T16:49:41.568Z
authors: agent
files:
---

# Evidence form / fix-findings

## current_situation

The battery went red with five failures across three files, and a tester reading with no shared context found six more defects the battery could not see.

Everything was collected before anything was fixed. Two of the tester's findings were about cases that could not fail, which no red run would ever have surfaced.

All of it is fixed in one pass. This submit is the single confirm run.

## follow_up

Green here goes to the implementation gate. Red keeps the walk in this state with the write verbs it already has.

THE TESTER STAYS ACROSS THE ROUNDS. It is not respawned to reread from zero, and it is shown the deltas rather than the whole build again.

ONE THING IS OWED BEYOND THIS RECORD WHATEVER THE VERDICT. The engine serving this walk is the build from before these changes, so nothing here has been exercised against a live lane. Only the battery's own processes have run it.

## anything_else

THE FINDINGS, AND WHAT EACH WAS.

FROM THE BATTERY.

- Two comment-rule failures. Mine. I stamped dates into engine comments, which the standard forbids outright and a ratchet holds at zero. The reasoning stayed and only the stamps came out; the engine now carries none.
- One work-lifecycle failure, exactly the case the tester predicted would fail, and for the reason it named.
- Two VS Code registry failures. NOT MINE, and established rather than assumed: the file is untouched by this record, and the test feeds a Windows path to a function that took the last segment with the platform's own rule. On this machine that returns the whole string. Fixed at the source, so the function now reads a recorded path on either host.

FROM THE TESTER, all six confirmed by reading before acting.

- THE GATE OPENED FOR ANY se_run ARGUMENT. My check asked whether an exempt KEY was present and never what it held, so a shell command carrying an empty `agent` ran in every state, including states that allow no tools at all. It also sat above the closed-machine guard. The check now asks whether the WHOLE call is a registration, and it sits below that guard. The model was nine lines above it: the read exemption pins the value, not the presence.
- A PROCESS NUMBER WAS SILENTLY DISCARDED. `o.pid ?? o.child?.pid === undefined` parses as `o.pid ?? (o.child?.pid === undefined)`, so an explicitly given number was dropped. That is the fallback channel a recovered entry depends on, and the sweep then never asked about such an entry at all.
- THE CONFLICT RECORD DESTROYED THE ENTRY IT DESCRIBED. I appended it to the job's own log, which is rebuilt from its last parseable line. One disagreeing settle and the entry came back with no running, no started, and a duration of NaN. It now goes to a file of its own.
- THE EXIT LISTENER COULD CLOSE THE WRONG RUN. It looked the id up when it fired, and an id may be registered again once its entry is settled while the old process is still alive. It now settles only the job it was made for.
- takeWorkspace WAS DEAD CODE AND ITS SPEC WAS CONTRADICTED. Nothing called it, and the entrypoint evicts and retries on a busy port where the spec said report and exit. Both halves were true and about DIFFERENT PORTS: the mirror is one shared window a second agent may evict, and the workspace hold is the folder's own. The take is now wired into the serving start path, and the spec says which port is which.
- THE BOUND WAS WRITTEN AND NEVER READ. Every entry carried one and nothing acted on it, and spawned jobs carried none at all. Expiry now settles the entry with an outcome naming the bound, and every spawned job declares one.

TWO TEST DEFECTS THE TESTER FOUND, and they matter more than they look.

- The exit case could not fail. Reading the account runs the sweep, so asserting the entry was settled could not tell the two closers apart. It now forces a sweep first and asserts there was nothing left for it to settle.
- The workspace case never bound twice. The second call was answered from this process's own memory, one line after the first put it there — the assertion was satisfied by a token the test itself supplied. A second case now holds the port from another process, which is the only way to exercise the refusal.

WHAT THE TESTER CHECKED AND FOUND CLEAN, recorded because a clean area is worth as much as a finding: the existence question itself, the sweep's refusal to guess, the sweep keeping a handle's exit code, the idempotent settle, the exemption predicate, and the conflict assertion's instinct to read the file rather than a return value.
