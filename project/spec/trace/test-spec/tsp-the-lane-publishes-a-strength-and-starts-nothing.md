---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: tsp-the-lane-publishes-a-strength-and-starts-nothing
type: "[[test-spec]]"
statement: The named driver rides the pull, and no host and no mode lets the lane start a process on account of it.
method: inspection
verifies:
  - req-the-machine-names-a-driver-and-starts-nothing
files:
  - project/spec/trace/element/el-sizing.md
---

## Scope

THE ONE LINE THE WHOLE DESIGN RESTS ON. The machine SAYS and does not DO, which
is the same division the lane already holds for pushing, for opening records and
for reaching the screen.

IT IS AN INSPECTION BECAUSE THE CLAIM IS AN ABSENCE. A test can show that a
particular call spawns nothing; only a reading can show that no path does. An
absence over all paths is not testable by sampling paths.

OUT OF SCOPE: what the party that reads the published strength does with it. That
party is a neighbour — the walking agent, which acts by delegating — and this row
is precisely the line between it and the box.

## Approach

LEVEL: source inspection over the sizing block and over the lane's dispatch, on a
fresh checkout, including the headless and pseudo-terminal modes because the
requirement says "in any mode".

THE TWO EXISTING SPAWN PATHS ARE EXAMINED AND EXCLUDED BY REASON, not ignored.
`se-start.ts` spawns before any walk begins and has returned by the time a step
is sized. `se-mcp.ts` respawns the engine child rather than a walker. Neither is
a spawn "on account of" a published strength, and the inspection says why rather
than passing over them.

## Checklist

EACH ITEM NAMES WHAT IS EXAMINED AND WHAT PASSES.

- THE VALUE RIDES THE PULL. Examine the pull's answer. PASSES when the named
  driver is on it beside the state and the tier.
- NO SPAWN ON THE SIZING PATH. Examine every function from the compiled step to
  the published statement. PASSES when none starts a process, runs a command or
  writes to a channel that starts one.
- NO SPAWN DOWNSTREAM OF THE VALUE. Examine every reader of the published field
  inside the box. PASSES when no reader of it starts anything.
- THE TWO STANDING SPAWN PATHS ARE UNCHANGED. PASSES when neither
  `se-start.ts` nor the shim in `se-mcp.ts` gains a caller that passes a
  published strength.
- HEADLESS AND PSEUDO-TERMINAL MODES ARE EXAMINED TOO. PASSES when the answer
  above holds in both, since a mode-specific spawn would satisfy every other item
  on this list.
