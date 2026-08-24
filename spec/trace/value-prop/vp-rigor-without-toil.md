---
minted_in: i1
id: vp-rigor-without-toil
type: "[[value-prop]]"
statement: As an engineer, I need the rigor without the paperwork.
audience: stk-engineer-driving-agents
outcome: the agent carries the method, and my time goes to redlines and thumbs
priority: must
---

## Success criteria

- The person's time goes to judging rather than to producing process artifacts.
  Metric: the share of a session's person-minutes spent on redlines and adjudications rather than on writing artifacts. Target: the majority.
- An idea becomes a durable note without leaving the step in hand.
  Metric: acts from idea to durable note. Target: one.
- An agent finds the lane tool or guidance page it needs without already knowing its name, and a capability gap it hits leaves a trace instead of vanishing.
  Metric: se_run calls as a share of all lane calls (guidance/method/retro.md step 8 counted 3249/28612 on 2026-08-07). Target: falling, retro over retro.
- WAITING IS TOIL TOO. The machine answers fast enough that the person is judging rather than watching it think.
  Metric: the share of surface requests answered inside a second. Target: all of them.
  Metric: an answer a host has to move to disk before the agent can read it. Target: none.
  Added by i12. The existing one-second guard covers lane CALLS only, so a render could pass a second with nothing failing.
- A BROKEN RULE COSTS ONE REFUSAL, NOT A HUNT. The break is named where it is made, while the author is still there and the fix is one move.
  Metric: lane calls spent recovering from a break a write-time check could have refused. Target: zero.
  Metric: corpus-shape rules enforced by a check rather than by prose, as a share of all of them. Target: rising, retro over retro.
  Added by i6. MEASURED LIVE 2026-08-16, at this iteration's own log-risks: one unquoted colon in a frontmatter value was accepted at the write, threw the next pull, and cost four calls to find and fix. The same corpus's submit-time check refused five failures at once, named every field, and cost one call to satisfy.
- A SLOW INTERFACE SAYS SO, and a person is never left guessing whether it is working. Silence is not an acceptable answer from anything a person or an agent touches.
  Metric: modelled interfaces that breach the one-second rule without telling the person they are working. Target: zero.
  Metric: a control that declines a person's input and reports nothing about why. Target: zero.
  Added by i33. THE OWNER'S FRAMING, 2026-08-15: "everything that is over one second needs to be non-intrusive... Either that fast, or very transparent about how slow it is." i12 added the speed half and not this one, so an interface could miss the rule silently and fail nothing.
  MEASURED LIVE 2026-08-17: the stop-at control declined a press and said nothing, and the owner reported it as a broken button. engine/mirror.ts lines 756 to 762 record two earlier victims of the identical silence, the emergency rung and the shutdown row, which is the third sighting of one failure shape.
  AND THE DENOMINATOR ARRIVES WITH IT. i12's criterion above asks for a SHARE of surface requests, and until interfaces are modelled as nodes there is no list to take that share over. Milestone one of i33 supplies it, so both criteria become checkable rather than only this one being new.

- A STEP OF THE WALK COSTS WHAT IT SAYS IT COSTS. A budget for one hop is enforceable rather than aspirational, and there is something that holds still to measure it against.
  Metric: pulls that answer past five seconds, as a share of pulls. Target: falling, round over round.
  Metric: pulls that answer past thirty seconds. Target: zero.
  Metric: hops that exceed the per-hop budget, once one is ratified. Target: none.
  THE BUDGET IS NOW RATIFIED, and this line said it was not. It stands in `req-a-hop-of-the-walk-carries-its-own-time-budget`, minted in i60 at priority must, which is what turned a proposal into a standing rule. The correction this line carried was right about the state it described: before that requirement, the figure lived only here and in a work token written in the future.
  THE FIGURE IS 250 MILLISECONDS AND IT BINDS THE FLIP. The owner said fifty first and 250 later, and the requirement's own table splits the hop: the flip is bounded, the state's own work is not. Measured by phase trace, the flip is 20 milliseconds.
  THE THREE METRICS ARE ORDERED ON PURPOSE, because the first two are checkable today and the third is not. The five-second share is the one that carries the bulk of the pain: 140 of 418 pulls in the measured window, against 23 past thirty seconds. A round that drives the tail to zero and leaves that share untouched has not served this criterion.
  AND THE PER-HOP FIGURE IS SIX HUNDRED TIMES SMALLER than the pull ceiling beside it. If it ever holds, the other two are vacuous — which is the right way round, and it is stated so nobody reads the pair as a contradiction.
  Added by i60. THE OWNER'S FRAMING, 2026-08-24: a step may take about a twentieth of a second, and that goes into the requirement. The criteria above measure whether a SURFACE answers fast; none of them measures the walk itself, so the walk could crawl with every one of them green.
  THE FRAMING WAS THEN SHARPENED BY THE SAME OWNER, on the same day: "When I say a hop cannot take more than 250 milliseconds, what I mean is the mechanical part of flipping from one step to the next. If there is some work in between, that's fine." The requirement carries that reading, not the twentieth of a second above.
  WHAT i60 MOVED, AND WHAT IT DID NOT MEASURE. A three-hop sweep fell from 15,404 milliseconds to 2,562 cold, and the same three hops cost 34, 66 and 59 warm. The two metrics above that count PULLS past five and thirty seconds were NOT re-measured after those fixes, so this criterion has no closing reading for its own headline numbers.
  MEASURED 2026-08-24, over 4,048 calls: 36 of 48 aims and 140 of 418 pulls ran past five seconds, and the slowest pull ran 131 seconds. A pull that failed to draw a route ran past thirty seconds 36 percent of the time, against 2 percent for every other pull.
  AND THE YARDSTICK IS PART OF THE CRITERION rather than an implementation detail. Timing against a record still being worked on cannot tell a slowdown from the record simply growing, so a committed one that holds still is what makes the target checkable at all.

- THE MACHINE CARRIES MORE OF THE WEIGHT OVER TIME, and that is a claim anyone can now fail. A weaker model on a newer machine reaches a result that used to need a stronger one.
  Metric: the paired delta in lane calls for one archived iteration re-walked across two machine versions, at the same model and effort. Target: falling, machine version over machine version.
  Metric: the weakest model that completes a re-walk of a given archived iteration without a refusal loop. Target: weakening, machine version over machine version.
  Metric: benchmark runs whose report omits its conditions — the iteration, the rewind commit, the matrix hash, the se version, the model, the effort. Target: zero.
  Added by i37. Every criterion above this one measures a thing that should FALL toward zero. This one measures whether the falling is real, because until now nothing compared two machine versions on the same work. THE OWNER'S FRAMING, 2026-08-19: "does a weak model with an improved machine work similarly to an old model with the old machine? If we improve the system, can we use weaker and weaker models to do the same work?"
  WHAT IT DELIBERATELY DOES NOT CLAIM. A benchmark measures process overhead and never production behaviour, because the agent is told the output is discarded. That limit is carried by raid-asm-an-agent-told-its-work-is-discarded-still-walks-the-machine-the-same-way rather than left to be discovered.

- THE MECHANICS COST NO CAPABILITY. A record walks to its gates on a small model, reaching the same signed states, and the difference shows in the bill rather than in the record.
  Metric: states a small model cannot sign that a large one can. Target: zero.
  Metric: a walk's calls spent working out what the machine wanted rather than doing the state in hand. Target: falling.
  ABSORBED FROM A PROPOSITION OF ITS OWN, at the owner's ruling. The strong model is still worth its price. It buys better judgment INSIDE a state, and it should not have to buy the ability to read the instructions.
  WHERE THE COST ACTUALLY LANDS IS NOT WHERE IT LOOKS. A capable model reads a wrong instruction, ignores it, and reads the live answer instead. A smaller one believes the instruction. So guidance that has drifted from the engine is invisible until a small model is pointed at it, and guidance quality IS the mechanism this rests on.

- CAPABILITY IS SPENT WHERE THE WORK IS HARD, never everywhere. Asking for a stronger hand is free and asking for a weaker one costs a recorded sentence, so the asymmetry runs the safe way.
  Metric: milestones walked by a driver stronger than the step was rated for. Target: falling.
  THIS IS THE SPENDING HALF of a proposition whose deciding half now sits with [[vp-the-engine]]. The machine names the driver; this one is the bill that naming saves.

- WORK THAT RUNS OUT OF SIGHT SAYS SO, AND SAYS HOW MUCH LONGER. Nothing the agent starts is invisible, and no step holds the agent's only verb while it waits.
  Metric: lane calls that block longer than a second on work the caller could have been told about instead. Target: zero.
  Metric: pieces of background work a single call cannot report. Target: zero.
  Metric: a reported time remaining that does not name the basis it was computed from. Target: zero.
  Added by i51. This is the AGENT's half of the i33 criterion above it, which was written for a person at a screen. The two ask the same question of different readers, and only the person's half was checkable.
  MEASURED BEFORE IT WAS ADDED: one step held the pull for sixty-eight seconds, and two calls timed out at the tool boundary. One of those had partly landed, so the caller was told the work failed while it had in fact moved. The engine's own kill timer for such a script is 600,000 ms (deliverable/engine/sessionscript.ts line 87), which is the declared upper bound on that silence.
  THE THIRD METRIC IS THE HONESTY CLAUSE, and it exists because the timings behind any estimate are known to be wrong. raid-asm-battery-timings-measure-work records summed case time of 1,534,695 ms against a wall of 76,985 ms. A figure with no stated basis is worse than no figure.

## Unlike

Requirements-management suites, which hold the input-quality corner for human authors and expect the human to do the writing. The difference is that the method is carried by the agent, and the person is left the one job a person is better at.

## Notes (not load-bearing)

This is the proposition most at risk of sounding like a convenience. It is not: the reason rigor gets abandoned in practice is the toil, so removing the toil is what makes the rigor survivable at all.
