---
kind: [[rationale]]
explains: [[spec/guidance/retro/effect]]
---

# Why

A fix nobody measures is a guess. The last retro's class fixes are this
retro's evidence. Counting the failure a fix aimed at, once more, is the only
way to know whether it worked.

## 1. The same count again

Each class carries a pattern over the log or the transcripts. The engine
counts that pattern over the new input, per active hour, the same way it
counted it when the class formed. So the two rates stand on one scale, and a
change between them is the fix's effect.

## 2. Still there, and how often

A failure that still occurs at a lower rate says the fix helps and falls
short. One that stops says the fix holds. One that holds its rate says the fix
missed its cause.

## 3. A failing fix comes back

A class whose rate holds returns as a class of this retro, so its next fix
aims at the cause the first one missed. Left out, it reads as solved, and
the next retro inherits the gap.

## 5. The battery is evidence too

The battery grew from ninety seconds to eleven minutes across four branches,
and nobody saw it, because no run kept its time. Two cases fetched binaries
from the network, and one swept the whole tree twice. So the check times each
part and keeps the slowest cases, collect keeps one report a retro, and effect
reads the two side by side. A part or a case that grows is a finding like any
other. A case that earns its time no more is one to cut.
