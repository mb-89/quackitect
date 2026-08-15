---
form: channel
by: agent
signed_off: 2026-08-14T17:20:08.508Z
authors: agent
files:
---

# Evidence form / channel

## current_situation

The core routes and the satellite serves. Between them there was nothing.

The core could answer "this belongs to satellite i27-x" and name it. The satellite could compose that record's machine and hand back a file. No path existed from one to the other, and no rule said what an answer crossing that gap has to carry.

That gap is the last of the three process chunks.

## built

`project/deliverable/engine/channel.ts`, carrying three kinds of traffic and enforcing one clause.

THE TRAFFIC.

- DOWN: a call the core received and a satellite owns.
- UP: the answer, naming the store it resolved against.
- BOTH: the heavy-slot lease and the beat.

THE CLAUSE, and it is the reason the crossing is the right place for it.

`namesItsStore` is applied AT THE CROSSING. An answer that came from another process is exactly the one a reader cannot check by eye: two trees, two processes, and a path that reads identically in both. So the channel REFUSES an answer that cannot say which store produced it, rather than trusting it and finding out at a merge.

The refusal names the record and says why in a sentence somebody can act on.

A CALL THE CORE OWNS NEVER CROSSES. Shared method and session state are the core's, so asking a satellite about trunk would be a crossing bought for nothing. `exp-channel-cost` prices one at 144 microseconds; paying it to be told what the core already knew is pure waste.

AN UNATTACHED RECORD FALLS BACK rather than crossing to nowhere.

THE LEASE RIDES IT. `requestSlot` and `returnSlot` go through the core, so the count stays single. A double return still answers false — the far side of a crossing cannot invent capacity.

THE BEAT RIDES IT. `beat(lastBeatAt, now)` delegates to the supervisor's `missedBeats` and `beatVerdict`, so the numbers stay in one place and stay measured.

WHAT IT COSTS, from `exp-channel-cost` rather than from estimation:

- 144 microseconds per acknowledged crossing, against a one-second budget.
- Twenty satellites serialised behind one core spend 0.3 percent of it, by arithmetic on that number.
- A DIRECT append costs 124.7 microseconds, because the file is opened and closed each time. THE CROSSING IS NOT WHAT MAKES IT SLOW, and a kept-open handle is worth more than any channel design could win back.

That last number is why the call log appends directly instead of routing, which `core.ts` records as `APPENDED_DIRECTLY`.

Proof: `project/deliverable/tests/channel.test.ts`, 9 of 9 green, test job `test-mst7pc28-7`.

Nine cases across two groups. One of them asserts a NEGATIVE that matters: a core-owned call increments no crossing counter at all.

## follow_up

All thirteen build chunks now have code. `clear-jump` still owes its form.

NO PROCESS IS STARTED BY ANY OF THE THREE. `core.ts`, `satellite.ts` and `channel.ts` are the LOGIC of core-and-satellite, each tested against injected state. Standing two real processes up and wiring `se-mcp.ts` to them is the next record's work, and it is not what this one promised.

THAT IS WORTH BEING PLAIN ABOUT. This record's goal is that the lane binds to the record and a write lands where the walk stands. That is delivered by the seam, the delta and the resolution change. The core-and-satellite chunks build the shape the NEXT step needs, and the build plan says so: the processes turn no authored red green.

WHAT THE SUPERVISOR STILL LACKS A CALLER FOR. `callVerdict` needs a real call boundary, which arrives with the process that hosts the channel. The beat has one now. The deadline does not.

No notes parked from this chunk.

## anything_else

One thing a reviewer should hold the design to, because this file does not.

`dsp-core-and-satellite` says `if-core-satellite` carries TEN FLOWS plus the lease and the beat. This channel carries the call, the answer, the lease and the beat.

THE OTHER FLOWS ARE NOT BUILT AND NOT CLAIMED. A shared read from a satellite up to trunk is named in the design and has no code here — today the satellite reads trunk directly through the seam, which is cheaper and needs no crossing at all.

Whether that stays true is a real question for the next record: a satellite in a DIFFERENT process cannot read trunk directly just because it can today. Saying so here rather than letting the count look satisfied.
