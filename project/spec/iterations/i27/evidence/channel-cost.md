---
form: channel-cost
by: agent
signed_off: 2026-08-14T13:58:38.347Z
authors: agent
files:
---

# Evidence form / channel-cost

## current_situation

THE CORE CAN OWN THE CALL LOG. The crossing costs 144 microseconds per append and the budget is a million.

Two thousand appends, measured twice on this machine.

- Direct, in process: 124.7 microseconds each.
- Across a channel to a child process, each one acknowledged: 268.9 microseconds each.
- Ratio 2.16.

ONE CALL PRODUCES ROUGHLY ONE APPEND, so the crossing spends 0.014 percent of the one-second budget. Twenty satellites serialised behind one core would spend 0.3 percent, and that figure is arithmetic on the measured number rather than a second measurement.

THE NUMBER UNDER THE NUMBER IS THE INTERESTING ONE. A direct append costs 124.7 microseconds, which is slow, and it is the machine rather than the code. Both sides paid it equally so the ratio stands.

## built

- exp-channel-cost

## follow_up

raid-asm-machine-wide-state-serves-over-a-local-channel MOVES TO PROBED for the call log. Its probe key and probed date belong at fold-back rather than here.

THE BUILD SHOULD ATTACK THE FLOOR BEFORE THE CROSSING. 124.7 microseconds for a direct append is the cost of opening and closing the file every time. Keeping a handle open is worth more than anything the channel design could win back.

TWO THINGS THIS PROBE DID NOT TOUCH.

- CONTENTION between several satellites appending at once. They would queue behind the core's single-threaded write and nothing here measures that queue.
- THE CLAIM LEDGER, whose cost is a git remote's rather than a channel's. That is already true today and this changes nothing about it.

THE NOTE INBOX NEEDS NO PROBE. It is read at a retro and written when a stray lands, so it never sees the per-call budget the log does.

## anything_else

WHY THE ACKNOWLEDGEMENT MATTERS AND WHY THE PROBE WAITED FOR ONE. A fire-and-forget send measures the sender's syscall and nothing else. Waiting for the child to answer is what makes the number a cost the caller actually pays, and it is the shape a lane call has: the answer comes back before the next call starts.

WHY A CHILD PROCESS AND NOT AN IN-PROCESS SERVER. A loopback socket inside one process still pays the network stack, but it never pays the scheduler. The core and a satellite are different processes, so the probe used two.

THE PROBE CODE IS THROWAWAY and lives outside the product, at .se/spike/probe-channel.mjs. Nothing from it enters the build.
