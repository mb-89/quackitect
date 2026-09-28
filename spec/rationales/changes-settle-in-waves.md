---
kind: [[rationale]]
---

# Why

The owner decided this for the model, and the decision is final. A change
settled as one wave. Each module took a height at start. A name took its run
list the first time it changed, and kept it for the life of the process. A
module ran once none of its in-ports read a pending name. An agent reads this
note before it asks again.

## 1. What it bought

| what the ruling gave | why |
|---|---|
| no glitch | B, fed by X and by A, ran once and after A, so it read no new X beside an old A |
| a run with sorting once per name | a wave walked the run list the first change built and kept |
| a reader that saw no mix | a read took the last settled value, and a push went out once a wave settled |
| work stopping where nothing changed | early cutoff cleared the marks below an unchanged value |
| no run nobody wanted | demand ran an unwatched name only when something read it |

The waves scheduled and held no business logic, so they stood in the index core
beside the resolution and the push.

## 2. Where it came from

| the earlier work | what it lent | when it happens |
|---|---|---|
| the calculation chain of Excel, and the execution order of Simulink and PLC function blocks | heights and downstream sets, off the wiring | once, at start |
| signals in Preact, Solid and MobX, and Jane Street Incremental | a pending mark first, and values after in height order | each change |
| Salsa | early cutoff, where an unchanged value stops the wave | each run |
| Salsa and Adapton, and Incremental keeping observed nodes current | demand, where only watched names run on their own | each change, each read |
| progress tracking in timely and differential dataflow | a change during a wave waiting for the next one, and the distributed case | each change |
| the PLC task cycle | a tick, a counter or a time wired like any input | each tick |

## 3. A note on real time

The IEC 61131 task cycle and the code Simulink generates use the same static
schedule. A real-time mode would drop early cutoff and demand, because both add
jitter, and run the whole list every tick. It would build every list at start,
so the first tick paid nothing for it. Nobody builds it now.

## 4. What it gave up

A change to ports or to the wiring restarted the index, because the heights
and run lists stayed until then. A rebuild keeping them restarted its module's
process alone. The first change of a name paid for its list, and the read of an
unwatched pending name waited for a run.

## 5. What would make it wrong

Ports or a wiring that changed while the index ran, so the kept lists went
stale. The index then worked the order out again at each change, and the ruling
bent there.
