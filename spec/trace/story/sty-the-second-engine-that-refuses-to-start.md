---
minted_in: i62-background-work-reports-its-own-end-the-
id: sty-the-second-engine-that-refuses-to-start
type: "[[story]]"
statement: When an engine is already holding this folder, I want a second one to say so and stop, so two engines never share one call log and one machine-state folder without either of them knowing.
actor: stk-engineer-driving-agents
refines:
  - vp-autonomy-range
priority: should
---

## Deck

THE PROBLEM. Two engines can be started on one folder and one port, and
neither says the other is there. Each writes the same log, so neither log is
the whole trail.
|||
FOUR PROCESSES OBSERVED ON ONE MACHINE, 2026-08-24, in two parent-and-child
pairs, started 47 seconds apart with identical arguments.

---

THE STARTING STATE. An engine is running and holding the port. A hook, a
script or a person starts another with the same arguments.
|||
THE SAFETY OF THE REAP DEPENDS ON THIS. run.ts line 1483 says closing another
engine's jobs is safe BECAUSE only one engine holds the port. Two engines make
that reasoning false.

---

STEP ONE. The second engine starts and tries to bind. Today: what it does when
the bind fails was an open question until a restart took the session down and
answered it. After: it fails to bind, says which folder is taken, and exits
non-zero.
|||
RUN ON THIS MACHINE, 2026-08-24. A real second process held the folder's port,
and the take was refused by the bind itself rather than from memory.

THE ACROSS-PROCESS CASE IS THE ONE THAT MATTERS. A second take inside one
process is answered from that process's own table, one line after the first put
it there, so it never reaches the bind at all.

THE TAKE BLOCKS THE BOOT. Nothing touches the folder until the hold is decided,
because the mirror's start closes every job the folder's records still call
running — and those would belong to the FIRST engine.

---

STEP TWO. The person reads why it stopped. Today: there is nothing to read.
After: one line naming the folder and the port, and no stack trace.
|||
RUN ON THIS MACHINE, 2026-08-24. The refusal names the port that is held, and
the case asserts that rather than only asserting the refusal.

WHAT THE PERSON SEES is one line on the error stream: this server is stopping
rather than sharing the folder. No stack trace.

IT IS TAUGHT WHERE IT WILL BE MET — the cloud-runner card, because an unattended
box is where two engines actually happen.

---

STEP THREE. The first engine crashes and the person starts a new one. Today:
this is the case a lock file would break. After: the bind succeeds, because
nothing was written down that could go stale.
|||
PROBED ON THIS MACHINE, 2026-08-24, rather than argued. A child held the port,
the port was busy, the child was killed, and the port bound clean immediately
afterwards.

THE OPERATING SYSTEM RELEASES IT, which is the whole reason the hold is a port
and not a file. A lock file outlives its writer, so a crash would leave a folder
nobody can start in — and on an unattended machine nobody is there to clear it.

---

THE RESULT. One engine holds a folder and its port. A second says so and stops,
and a restart after a crash is unaffected.
|||
RUN ON THIS MACHINE, 2026-08-24. Both halves hold, and they were built as one
pair on purpose: the guard strong enough to stop a second engine is exactly the
guard that could lock out a legitimate restart.

THE PORT IS WHAT RESOLVES THAT PAIR. Binding is the take, and there is no
second record of it anywhere.

THE HOLD DOES NOT DEPEND ON THE MIRROR. It is derived from the folder alone, so
an engine started with the mirror disabled is held to the same rule — and that
is the likely configuration on an unattended box.
