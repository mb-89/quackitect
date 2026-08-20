---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: uc-let-the-machine-name-the-driver
type: "[[use-case]]"
kind: interaction
statement: Open a milestone with the machine naming the model its own work needs, so the strength of the walker stops being a decision taken once before anything was read.
actor: stk-engineer-driving-agents
trigger: a walk reaches a milestone boundary with a rated matrix behind it
precondition: every row the milestone holds carries a complexity rating, and one model list stands in the repository
guarantee: either the milestone publishes a model name a receiver can act on, or it says plainly which of the two it lacks — a rating or a list entry — and names no driver at all
refines:
  - sty-the-machine-picks-the-hands
priority: must
---

## Main scenario

1. The walk reaches a milestone boundary. Nothing has been spawned and nothing has been decided.
2. The engine reads the complexity of every row that milestone holds, live from the matrix, and never from a pin.
3. It takes the MAXIMUM over those rows. One walker strong enough for the hardest item is what the milestone needs.
4. It looks that rung up in the fixed list, which is one file in the repository and the same file on every host.
5. It puts the model name on the pull, beside the state and the tier, and does nothing else with it.
6. The receiver reads the name and starts the next stretch on it.
7. The walk proceeds. Every call it makes records which model answered and which state it was made in.

## Extensions

- 3a. The milestone's rows span more than one rung. The maximum still governs, and the per-item values ride along so a reader can see what the maximum cost. Registered: `raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker`.
- 5a. `se-pty.ts:275` runs an agent inside a pseudo-terminal, streams its output as server-sent events and takes keystrokes back over POST. That is a live read-write channel into a running agent and it is the nearest standing thing to a receiver that can act. Whether the published name should travel that way is a design question this case does not settle.
- 4a. The list has no entry for that rung. The milestone names no driver and says which rung was unmatched. It does not fall back to the session's current model silently, because a silent fallback is indistinguishable from a working lookup.
- 4b. The name resolves to different models on different hosts. Open: `raid-asm-one-model-list-serves-every-host-the-engine-supports`, raised to expected on the evidence that an alias already does exactly this.
- 6a. THE RECEIVER READS AND CANNOT ACT, which is the state of the world today and is not the same as nobody listening. `se-start.ts:141` spawns the lane and `:155-170` proves it answers before launching an agent at `:245`; that agent pulls, so a published name reaches a reader. What no path does is start a NEW agent on a DIFFERENT model once the walk is under way — the entrypoint has returned, and the shim in `se-mcp.ts` respawns the engine child rather than the walker. The guarantee above is met while the value is not, and `nbr-the-driver-that-performs-the-spawn` carries the corrected shape.
- 6b. The receiver wants a STRONGER model than named. It takes it and owes nothing.
- 6c. The receiver wants a WEAKER one. It owes a recorded reason, and today nothing checks that the reason is there — `raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it`.

## What this use case is not

IT IS NOT A ROUTER. Nothing predicts, nothing scores, nothing learns. The same milestone names the same driver every time, which is the whole trade: fitness given up for reproducibility, with the drift registered rather than denied.

IT DOES NOT SPAWN. Step 5 ends the machine's part. That line is the lane's grain, the same one that keeps pushing and opening records outside.
