---
minted_in: i36
id: raid-iss-the-one-second-bound-counts-calls-that-spawn-external-work
type: "[[raid]]"
kind: issue
statement: The agent-to-entrypoint bound of one second is measured against every lane call, including the verbs whose whole job is to spawn a process and wait for it.
owner: the driving agent
trigger: any gate that reports bound breaches on if-agent-harness-to-entrypoint
status: open
breaks_how_badly: abrasive
how_likely: expected
impact: Every breach report on this edge mixes lane overhead with runtimes the caller asked for, so a real slowdown in the lane itself cannot be seen against the noise.
source_refs:
  - spec/trace/interface/if-agent-harness-to-entrypoint.md
  - spec/iterations/i36-the-harness-is-not-claude-measure-what-e/evidence/gate-implementation.md
---

## Graded off the scale, corrected 2026-08-20

THIS ENTRY SAID \`how_likely: certain\`. THE SCALE OFFERS expected, plausible,
conceivable. \`deliverable/engine/bin/grades-complete.ts\` refuses the
whole register while any entry sits outside it, and it refused at
\`rank-unknowns\`' exit — which is the first state that runs it.

\`expected\` IS THE HIGHEST THE SCALE HAS and it is what this entry now carries.

WHAT "CERTAIN" WAS TRYING TO SAY, and the scale cannot hold it: this is not
something that MIGHT happen. It is a consequence the design chooses. A likelihood
scale measures whether a thing occurs; it has no value for a thing that is true
by construction.

THE DISTINCTION IS REAL AND BELONGS SOMEWHERE ELSE. A consequence a design
accepts is a decision's cost, recorded on the decision. A risk is something that
might realise. Writing "certain" onto a likelihood field collapses the two, and
four entries in this record did it independently — which is a vocabulary gap
rather than four mistakes.

## What was seen

FOUR CROSSINGS OVER THE BOUND in one gate, all of them expected.

- `se_run` running the typechecker — 2421 ms.
- `se_run` running the linter — 1903 ms.
- `se_run` running both together — 3903 ms.
- the `se_pull` that fired verification's exit script — over 111765 ms, which
  is the battery's own reported duration and therefore a floor.

## Why it is an issue rather than a breach

THE BOUND DESCRIBES THE DOOR, NOT THE ROOM BEHIND IT. `se_run` is asked to
start a process and hand back what it printed. A caller who asks for a suite
of 1456 tests is asking for the wait. Reporting that wait as a bound breach
says nothing anyone can act on.

THE LANE'S OWN COST IS THE THING WORTH BOUNDING, and it is currently
invisible, because it is added to whatever the caller asked for.

## What would settle it

Decide which verbs the bound governs, and say so on the interface node.

- One reading: the bound covers only verbs that answer from the engine's own
  state, and the spawning verbs (`se_run`, `se_test`, and any pull that fires
  a condition script) are excluded by name.
- The other reading: the bound covers every verb, and the spawning verbs
  report their own overhead separately from the child's runtime.

Either is defensible. What cannot stand is the present state, where the
question has never been asked and every gate answers it again by hand.
