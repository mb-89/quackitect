---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-iss-the-engine-does-spawn-an-agent-and-the-seed-says-it-does-not
type: "[[raid]]"
kind: issue
statement: The i38 seed rules that the engine holds no agent-spawning code and reasons from that to keep spawning outside the machine; the entrypoint does spawn an agent, so the ruling's stated premise is false while its conclusion still stands on other grounds.
owner: the walking agent
trigger: the first state below M0 that argues about WHERE the spawn belongs, and any later reader citing the record's no-spawning-code sentence
status: open
impact: A state that rests on the premise argues from something untrue and reaches a conclusion nobody can check. The conclusion itself is unaffected, so the damage is a wrong argument rather than a wrong design.
breaks_how_badly: abrasive
how_likely: plausible
probe: FALSIFIED AT THE i38 KICKOFF GATE, 2026-08-20, by opening the file the seed says it searched. engine/bin/se-start.ts:225 declares launch(iteration, agent, pid); :242 probes the command with spawnSync(agent, ["--version"]) and dies naming --agent <cmd> when it is absent; :245 spawns it with the briefing after placing the cage. Its own comment at :218 reads IT STARTS THE AGENT. The narrower claim the seed wanted is true and was not checked against the wider one it wrote down.
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
weighs_with: none
weighs_against: none
---

## What is actually true

THE RUNNING LANE NEVER SPAWNS AN AGENT. Nothing inside a walk starts a
process that talks to a model. That half of the seed's finding holds, and it
is the half the design needs.

THE ENTRYPOINT DOES. `se-start.ts` is the one command a host runs to begin an
unattended machine, and its last step starts the agent with the briefing. It
is in the engine folder, it is tested, and it is the thing that produced the
session this entry was written in.

## Why the difference matters

THE SEED REASONS FROM THE PREMISE TO A COST. Its words: teaching the engine to
spawn "would need a per-harness adapter, which is precisely the per-host
difference the owner ruled out, in the worst possible place: the mechanism
itself."

THAT ADAPTER ALREADY EXISTS AND IT IS ONE ARGUMENT WIDE. `--agent <cmd>`,
defaulting to `claude`, with a `--version` probe so a host missing the command
fails loudly rather than silently. Whatever the cost of spawning from the
machine is, it is not the cost of inventing that adapter.

## What still stands, and on what

THE RULING IS UNCHANGED: the milestone's setup computes the tier, names the
model, and whoever is driving performs the spawn.

ITS REASON IS THE LANE'S GRAIN, stated in the same ruling and independent of
the premise. The lane does not push, does not open records unasked, and does
not reach the screen. Starting a process is that same class of act, and the
machine says rather than does.

NO STATE BELOW MAY CITE THE PREMISE. Cite the grain.
