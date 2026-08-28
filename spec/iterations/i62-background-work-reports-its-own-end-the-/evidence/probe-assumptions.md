---
form: probe-assumptions
by: agent
signed_off: 2026-08-24T16:12:31.676Z
authors: agent
files: null
---

# Evidence form / probe-assumptions

## current_situation

Three assumptions stand for this delta, and one standing assumption had its trigger fire during this walk.

All four were probed against the real channel on this machine. None was settled by reading a document or by reasoning that it must hold.

This machine is linux, running node v22.22.2. That matters more than usual: the register records that every machine which has run this engine before today was Windows, so the branch being measured here is the one that had never run.

## probes

- raid-asm-a-launched-process-can-be-asked-whether-it-still-exists: HOLDS on POSIX, probed 2026-08-24. A child was launched through the same detached spawn the product uses. While alive the handle read exitCode null and the pid check read exists. After a normal exit the handle read exitCode 0; after a SIGKILL it read signalCode SIGKILL. The pid check read ESRCH in both ended cases. WHAT THE PROBE ADDED TO THE DESIGN: the handle names HOW the process ended and the pid check does not, and a pid is reused by the operating system, so the design must ask the handle. Windows stays unprobed.
- raid-asm-a-crash-releases-whatever-carries-the-workspace-hold: HOLDS on POSIX, probed 2026-08-24. A child took a network port, was killed with SIGKILL and given no chance to clean up. Binding the same port read EADDRINUSE while held, ok immediately after the kill, and ok again after a pause. The immediate case is the one that mattered, because a hold that lingers briefly and one that never releases look identical in a single attempt. Windows stays unprobed.
- raid-asm-asking-every-held-handle-on-an-interval-costs-nothing-measurable: HOLDS with room to spare, probed 2026-08-24. Twenty real children were asked in 78 microseconds and a hundred in 147. Against an interval measured in seconds that is nothing, and the concurrency count the probe originally asked for no longer needs measuring: it would have to be four orders of magnitude above anything observed before it mattered.
- raid-asm-only-one-agent-works-a-clone-at-a-time: HOLDS, and the trigger fired during this walk in the form the entry said had never been exercised. A second agent was spawned with no read-only instruction, on this checkout, while the first still held the record, and it submitted an evidence form. Two writers, one tree, nothing collided. THE REASON IS NOT LUCK: both wrote through one lane served by one engine, so the writes were serialised by the thing serving them. That makes the evidence stronger and narrower at once, and it ties this assumption to req-one-instance-holds-a-folder-and-its-port.

## follow_up

M4 takes the design forward with three probes green and one honest gap: Windows is unmeasured for two of them.

ONE PROBE RESULT CHANGES A DESIGN CHOICE RATHER THAN CONFIRMING ONE. Asking the pid is not equivalent to asking the handle. A pid is reused, so a reaped child's number can come back attached to an unrelated process and report a dead run as alive. The candidate comparison must treat the handle and the pid as different mechanisms, not two spellings of one.

ONE STANDING ENTRY IS NOW OVERDUE FOR A REWORD. The trigger on raid-asm-only-one-agent-works-a-clone-at-a-time fires on any second agent, and it has now fired three times on the safe read-only case and once on the real one. It should distinguish a second reader from a second writer, or it will stop being read.

## anything_else

WHAT THE PROBES COST: one script and one run, about five seconds of machine time. That is the card's own bar, which says a probe is minutes rather than a spike, and it is worth recording that all four cleared it easily.

WHY THAT IS WORTH SAYING AT ALL. The temptation at this state is to record `unprobed` with a reason, which is legal. Three of these four could have been written off that way in one line, and the one that changed a design choice would have been missed.

## fallout

NONE. No assumption turned out false, so nothing rests on something known false and no item needs following upward.

THE OPPOSITE HAPPENED IN ONE PLACE. The load-bearing assumption was the record's own kill-criterion at the motivation gate: if a launched process cannot be asked whether it exists, the design collapses to a timeout. It holds on the platform that had never been measured, so that criterion is answered rather than open.
