---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: exp-channel-cost
type: "[[experiment]]"
statement: What does one call-log append cost across a local channel to another process, against a direct append, measured in microseconds each?
probes:
  - raid-asm-machine-wide-state-serves-over-a-local-channel
timebox: one hour
form: script
promote: "none — the build attacks the 124.7 microsecond direct-append floor first, by keeping a handle open"
folds_to: "raid-asm-machine-wide-state-serves-over-a-local-channel is probed for the call log at 144 microseconds a crossing"
faked: one client only, and the claim ledger's git-remote cost was not touched
fallback: if the hop costs a measurable share of the one-second budget, the call log stays with the satellite and the core owns only what can afford the crossing
verdict: holds
measured: 2026-08-14 — 124.7 microseconds direct against 268.9 across the channel, a ratio of 2.16 and a difference of 144 microseconds per append
source_refs:
  - rank-unknowns, the seeded pick
  - el-core
  - if-core-satellite
  - req-call-answers-in-one-second
---

## Setup

The owner's Windows machine, 2026-08-14, Node v24.16.0.

Two thousand appends measured twice.

- DIRECT. `appendFileSync` in the measuring process.
- ACROSS A CHANNEL. The same appends sent to a CHILD process over loopback
  TCP, each one acknowledged before the next was sent. The acknowledgement is
  what makes it a cost the caller pays rather than one it fires and forgets.

Both sides used the same append call, so the ratio compares the crossing and
not the write.

## Result

| measure | direct | across the channel |
| --- | --- | --- |
| total for 2000 | 249.4 ms | 537.9 ms |
| each | 124.7 us | 268.9 us |

The crossing costs 144 microseconds per append, a ratio of 2.16.

## What it settles

THE CORE CAN OWN THE CALL LOG. [[req-call-answers-in-one-second]] gives a
budget of one million microseconds. One call produces roughly one log append,
so the crossing spends 0.014 percent of the budget.

BY ARITHMETIC RATHER THAN MEASUREMENT, twenty satellites serialised behind one
core would spend 2.9 milliseconds on the same work. That is 0.3 percent of the
budget. The arithmetic is sound and the contention was not measured.

## What it does not settle

- CONTENTION. One client ran.
  - Several satellites appending at once would queue behind the core's
    single-threaded write.
  - Nothing here measures that queue.
- THE CLAIM LEDGER. Its cost is dominated by a push to a git remote, not by
  the channel. That is already true today and this probe changes nothing
  about it.
- THE NOTE INBOX. Not measured, and it is read at a retro rather than on
  every call, so the budget pressure is far lower.

## The number under the number

124.7 microseconds for a DIRECT append is itself slow, and it is the machine
rather than the code. `appendFileSync` opens and closes the file each time,
and [[raid-asm-the-target-machine-is-many-throttled-cores]] records why the
absolute floor sits where it does.

Both sides paid it equally, so the ratio stands. The floor is what the build
should attack first, by keeping a handle open.
