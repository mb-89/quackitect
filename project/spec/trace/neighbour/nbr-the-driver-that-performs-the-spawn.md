---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: nbr-the-driver-that-performs-the-spawn
type: "[[neighbour]]"
direction: out
statement: Whoever receives the driver name the machine publishes and starts an agent on it. Something is always listening; what is missing is anything able to start a NEW agent on a DIFFERENT model once a walk is under way.
---

## Interface

THE MACHINE PUBLISHES A NAME AND NOTHING ELSE. A milestone's setup computes the
rung, looks the model up in the fixed list, and puts the name on the pull. That
is the whole outbound half.

WHAT THE RECEIVER OWES BACK:

- START AN AGENT ON THE NAMED MODEL, or say plainly that it cannot.
- SAY WHAT IT ACTUALLY STARTED. The receiver is the only party in the exchange
  that knows, and it is not the party being measured.
- ASK FOR SOMETHING ELSE WITH A REASON, where the name does not fit. Stronger
  needs no argument; weaker needs the sentence recorded.

## Why it is a neighbour and not a part of the machine

THE LANE DOES NOT START PROCESSES, in the same way it does not push, does not
open records unasked, and does not reach the screen. That division is the
lane's grain and it is why this role sits outside the box.

## WHAT IS ACTUALLY THERE, corrected 2026-08-20

THIS NODE FIRST SAID THE NEIGHBOUR WAS EMPTY — that on an unattended box a
milestone would name its driver into a room with nobody in it. THAT WAS WRONG,
and it was wrong in the most embarrassing way available: the claim was written
through the very channel it said did not exist.

MEASURED, by opening the files the claim cited:

- `se-start.ts:141` spawns the LANE, `:147` unrefs it, and `:155-170` polls
  `http://127.0.0.1:<port>/` until it answers, dying after sixty seconds if it
  never does. The entrypoint PROVES something is listening before it launches
  an agent at all.
- `se-mcp.ts` under `--headless` serves the lane over HTTP on the mirror port,
  and the mirror routes `/mcp`, `/pull` and an SSE stream at `/events`.
- `se-arrive.ts` writes `.se/se-call.mjs`, a client for exactly that, so an
  agent with no `se_` tools of its own can still call the lane. Every call in
  this iteration went through it.
- `se-start.ts:245` then launches the agent with a briefing whose first
  instruction is to pull. THAT AGENT IS ALIVE AND PULLING, so a name published
  on a pull reaches a reader.
- `se-pty.ts:275` starts an agent inside a pseudo-terminal, streams its output
  as server-sent events and takes KEYSTROKES BACK OVER POST. That is a live
  read-write channel into a running agent.
- `se-mcp.ts` also runs a SHIM that respawns the engine child on request or on
  crash. The engine does re-spawn; it does not re-spawn on a different model.

## SO THE HOLE IS NARROWER AND SHARPER THAN "NOBODY IS LISTENING"

THE RECEIVER CAN READ AND CANNOT ACT. A published name reaches a live agent
that has no way to become a different model, and no supervisor beside it is
watching for one. The entrypoint that could have launched a different agent has
already returned by the time any milestone is walked.

WHAT THAT CHANGES: the fix is not "build a receiver". A receiver exists and is
attached. The fix is a way for the driving side to ACT on a name — relaunch,
hand off, or refuse and say so — and `se-pty`'s POST channel is the nearest
standing thing to it.

WHAT IT DOES NOT CHANGE: the machine still says rather than does, and this node
still sits outside the box.

## What it is not

IT IS NOT `nbr-agent-harness`. The harness is inbound: it calls the lane. This
one is outbound and it is whatever decides what the NEXT walker will be.

IT IS NOT `nbr-engineer` EITHER, though a person often plays it. On a laptop the
engineer reads the name and relaunches, and the exchange completes. The
unattended case is the one with no answer yet.
