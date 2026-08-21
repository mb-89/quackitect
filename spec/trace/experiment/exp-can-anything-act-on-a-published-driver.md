---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: exp-can-anything-act-on-a-published-driver
type: "[[experiment]]"
statement: Can any path that exists today change which model walks a stretch, in response to a value the lane publishes — as a rung, and as a model name?
probes:
  - raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all
timebox: ninety minutes
form: tracer
promote: the walker delegates — the party that acts on a published rung is the walking agent handing the step to a stronger hand, and the record must be able to say which hand did which call
folds_to: raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all is misstated rather than confirmed — the payoff waits on the WALKER DELEGATING, not on a weak model booting a different walker
faked: nothing was spawned, the two ENGINE spawn paths were read at their source rather than exercised, and the harness's own delegation path was not searched at all — which is where the answer was
fallback: not taken — a path exists, so the published value is not advisory by necessity
chunk: the-call-record-grows-three-fields
verdict: holds
measured: 2026-08-20 — read through the lane at engine/bin/se-start.ts and engine/bin/se-pty.ts
source_refs:
  - rank-unknowns, the seeded pick
  - nbr-the-driver-that-performs-the-spawn
  - raid-dec-the-block-names-a-rung-and-never-a-model
  - cand-whoever-holds-the-hands-decides
---

## What was asked, and why both halves mattered

THE ARCHITECTURE PUBLISHES AND STARTS NOTHING, deliberately. Its whole value is
downstream of somebody acting on what it publishes.

THE SECOND HALF WAS ASKED ON PURPOSE. The declared winner publishes a RUNG and
the owner's ruling asks for a MODEL NAME. If only one of the two can be acted on,
that settles the disagreement without anybody arguing about it.

## What the two spawn paths actually do

`se-start.ts`'s `launch()` SPAWNS THE AGENT ONCE, BEFORE ANY WALK EXISTS. It
places the cage, probes that the agent binary answers `--version`, then
`spawn(agent, [briefing(iteration, card, pid)])` and `child.unref()`.

THE MODEL IS NOT A PARAMETER OF THAT CALL. `agent` is a command name taken from
`--agent <cmd>`, and the only argument is the briefing string. A model reaches
the child only if the operator typed it into the command themselves.

`se-pty.ts` SPAWNS A COMMAND INSIDE A PSEUDO-TERMINAL and holds a live
read-write channel to it — output as events, keystrokes back over POST. THE
COMMAND IS HANDED TO IT, composed by whoever invoked it.

NOTHING IN THE WALK RE-INVOKES EITHER. The entrypoint returns after unref, and
the lane's own shim respawns the engine child rather than the walker.

## CORRECTED 2026-08-20 — this spike searched the engine and the answer was in the harness

THE OWNER ASKED WHAT A RECEIVER IS AND WHETHER THIS IS A PROBLEM, and the
question found the flaw. The reading below is true of the ENGINE and the verdict
drawn from it was too wide.

THE PARTY IS THE WALKING AGENT, DELEGATING. It reads "this step needs a C3 hand"
and hands that step to a subagent running on a stronger model. That is two agents
working the system — in the owner's naming, a WALKER and a GUIDE, not two walkers.

AND EITHER MAY WORK THE LANE (owner ruling, 2026-08-20). The guide is not barred
from pulling or filling. Where it hands its work back through the walker instead,
the record has to say the work was the guide's.

WHAT THAT COSTS THIS SPIKE'S VERDICT. It moves from unsettled to holds, and it
opens a different hole: nothing today can tell the two hands apart in the log.
`req-every-call-records-the-part-its-caller-played` is where that lands.

THE PATH IS DOCUMENTED IN THIS REPOSITORY. Contract rule 11 sanctions spawning
subagents without asking. `guidance/method/subagents.md` carries a
"Which model" section under an owner grant of 2026-07-11: "MECHANICAL WORK rides
a lower tier ... JUDGMENT WORK inherits the session model."

SO THE MECHANISM THIS SPIKE WENT LOOKING FOR ALREADY EXISTS, one layer above
where it looked, and has an owner grant behind it.

WHAT THE ENGINE READING STILL ESTABLISHES, and it is narrower and real: the
published value cannot change the WALKER'S OWN model. A running agent cannot
become a different one, and nothing re-spawns it mid-walk. That is why the
sections below stand as written.

WHY THE SPIKE MISSED IT. It asked "what spawns" and searched the engine, because
the engine is what the lane can see. THE ANSWER WAS IN THE CONTRACT THE WALKER
ITSELF OBEYS, which is not code and is not in `deliverable`.

## The engine reading, which stands and does not settle the question

NO PATH IN THE ENGINE changes which model the WALKER runs on. The walker is
chosen once, by a person, before the first pull, and nothing re-invokes the
entrypoint.

THAT IS NOT THE SAME AS NOTHING BEING ABLE TO ACT, which is what this spike first
concluded. See the correction above: the walker delegates.

AND THE RUNG-VERSUS-MODEL QUESTION IS NOT WHAT BLOCKS IT. Both fail at the same
place and for the same reason: nothing re-spawns mid-walk. A model name would
reach exactly as far as a rung does, which is to a record and a reader.

SO THIS SPIKE STILL CANNOT SETTLE THE OWNER'S RULING, and now for a better
reason. A delegate can be given a model name OR told a rung and left to pick —
the harness takes a model per subagent, so both halves are actable. THE TIEBREAK
THIS SPIKE WAS SEEDED TO PROVIDE DOES NOT EXIST, and the ruling stays a ruling.

## What would change it, named because a falls-verdict owes it

ONE PATH IS ALREADY MOST OF THE WAY THERE. `se-pty.ts` holds a live channel into
a running agent and takes input back. A receiver that read a published driver and
started a NEW pty session on it would need no new transport — it needs a decision
that the lane may cause a spawn, and `req-the-machine-names-a-driver-and-starts-nothing`
forbids the lane doing it itself.

THAT IS THE SHAPE OF THE ANSWER: not a missing mechanism, a missing party. The
requirement is right that the lane must not spawn. Nothing says who may.
