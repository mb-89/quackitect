---
form: phase-split-probe
by: agent
signed_off: 2026-08-17T12:11:12.752Z
authors: agent
files:
---

# Evidence form / phase-split-probe

## current_situation

The first build chunk, and the riskiest thing in the iteration. It is a measurement rather than a change to behaviour, and its answer decides whether milestones three and four are aimed correctly.

THE SPLIT IS IN. The machine span in render.ts now reports four parts beside its unchanged total.

THE READING IS OWED. The engine serving the mirror is running the source as it stood before this edit, and it picks up new source only on a reload, which is legal at idle alone.

## built

THE INSTRUMENT LANDED. project/deliverable/engine/render.ts, the machine span between phase("session") and what was phase("machine"), now reports four parts:

- machine.sets — drawingSets and routeMarksFor.
- machine.svg — machineSvg, over the busbar computation.
- machine.states — stateDetails and the archive lookup it needs.
- machine.rest — crumbs and the canvas comment.

THE TOTAL KEEPS ITS OLD NAME AND ITS OLD SPAN. `machine` is still emitted, from its own timer taken before the block, so a reader comparing across runs is handed the same measurement it always was. Renaming the total to mean the remainder would have been a silent redefinition, which is the failure this product rules against by name.

THE READING IS NOT TAKEN, AND THAT IS A FINDING RATHER THAN A SHORTFALL.

The numbers arrive as mirror_profile records when the mirror renders. The mirror runs the engine as it stood before this edit and picks up new source only on a reload, which is legal at idle and nowhere else. So the probe cannot be READ from inside the walk that installed it.

THAT IS THE SAME SHAPE THIS ITERATION EXISTS TO FIX. An instrument nobody reads is not instrumentation, and this is one an agent cannot read from where it built it.

WHAT WAS PROVED HERE INSTEAD: a battery was asked whether the split broke the render, with the question recorded, and its verdict logs itself.

## follow_up

raid-asm-the-slow-phase-is-the-green-derivation-repeated STAYS SCHEDULED, with its probe now BUILT rather than merely written. The first render after the next reload answers it, and the two numbers it wants are unchanged: drawingSets plus stateDetails over 90 percent, and the SVG under 50 ms.

WHAT THE ANSWER DECIDES, so nobody has to re-derive it later:

- Spread evenly across states means the repetition is real and the DAG is the right instrument for milestones three and four.
- Concentrated in one call means a targeted fix is right and the DAG is the wrong instrument, and the modelling would be aimed at nothing.

A FINDING WORTH A NOTE AT THE RETRO, and it is bigger than this chunk. A probe whose instrument must be installed in the engine cannot be read by the walk that installs it, because reload is idle-only. Every such probe is therefore SCHEDULED by construction, and calling it scheduled hides that the machine made it so.

CHUNKS TWO AND THREE ARE NEXT and neither waits on this answer. They turn the two red cases of tsp-a-control-is-legible green, touch params.ts in different functions, and have no edge between them.

## anything_else

