---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: nbr-the-driver-that-performs-the-spawn
type: "[[neighbour]]"
statement: Whoever receives the driver name the machine publishes and actually starts an agent on it — a supervisor, a script, or a person at a terminal. Today, on an unattended box, nobody is there.
direction: out
---

## Interface

THE MACHINE PUBLISHES A NAME AND NOTHING ELSE. A milestone's setup computes the
rung, looks the model up in the fixed list, and puts the name on the pull. That
is the whole outbound half.

WHAT THE RECEIVER OWES BACK, and this is the part no existing neighbour covers:

- START AN AGENT ON THE NAMED MODEL, or say plainly that it cannot.
- SAY WHAT IT ACTUALLY STARTED. The receiver is the only party in the exchange
  that knows, and it is not the party being measured.
- ASK FOR SOMETHING ELSE WITH A REASON, where the name does not fit. Stronger
  needs no argument; weaker needs the sentence recorded.

## Why it is a neighbour and not a part of the machine

THE LANE DOES NOT START PROCESSES, in the same way it does not push, does not
open records unasked, and does not reach the screen. That division is the
lane's grain and it is the reason this role sits outside the box rather than
inside it.

TEACHING THE ENGINE TO SPAWN IS NOT IMPOSSIBLE — the entrypoint already does it,
with a one-flag adapter — and it is still the wrong side of the line. The
argument is about where the act belongs, never about whether it could be coded.

## THE UNCOMFORTABLE PART: TODAY THIS NEIGHBOUR IS EMPTY

MEASURED 2026-08-20. `engine/bin/se-start.ts` spawns one agent at `:245`,
unrefs the child, and `main()` returns. Nothing in the engine re-spawns, and
nothing polls for a published name.

SO ON THE HOST THIS DESIGN WAS WRITTEN FOR, a milestone that names its driver
names it into a room with no one in it. On a laptop the engineer is the
receiver and the exchange works. On an unattended box there is no receiver at
all.

THAT IS WHY IT IS DRAWN. A neighbour that does not exist yet is a hole with a
shape, and a hole with a shape can be filled. An assumption that somebody is
listening is neither.

## What it is not

IT IS NOT `nbr-agent-harness`. The harness is the thing already driving the
walk and it is inbound: it calls the lane. This one is outbound and it is
whatever decides what the NEXT walker will be.

IT IS NOT `nbr-engineer` EITHER, though a person often plays it. The engineer
aims the walk and judges evidence; this role does one mechanical thing with one
published value, and on an unattended run it must be something other than a
person.
