---
form: run-demos
reopened: "2026-08-20T23:32:00.747Z — gate-implementation was re-signed above it; the demonstration itself did not change."
by: agent
signed_off: 2026-08-20T23:56:27.025Z
authors: agent
files:
---

# Evidence form / run-demos

## current_situation

ONE MUST STORY, ONE DEMONSTRATION, PERFORMED. `sty-the-machine-picks-the-hands` is this iteration's only `must`. `sty-read-the-record-and-ask-who-did-what` is a `should` and its evidence half is filled from the shipped record rather than from a performance.

THE REPORT IS `reports/rpt-sty-the-machine-picks-the-hands.md`, six steps, run once, each line of it what the run printed.

### Where it was performed, and why that was the hard part

AGAINST MODULES BUILT FROM THIS ITERATION'S CODE, in a fresh project root — the same modules the shipped server loads.

THE RUNNING LANE SERVER COULD NOT BE USED. It started before this build landed and does not know the `as` argument exists, so a run against it would have shown the feature absent and read as a pass. That trap is named in the demo drawing rather than discovered in the report.

### What the run showed

- ONE CELL RATED BY HAND, `onboard-retro` at `major_complexity: C4/R1`. Nothing else, which is the shipped product's own state.
- A RECORD OPENED AND PINNED WITH NO MODEL NAMED BY ANYBODY — not on a command line, not in the seed, not in the pin.
- THE STEP OPENED BY NAMING THE HAND: `hand = {"pair":{"judgement":"C4","reading":"R1"},"rung":"frame"}`. The rung is the strongest because the corner rule takes the higher figure, and the pair rides beside it so a reader can disagree with the rung and still use it.
- THE SAME STEP UNRATED PUBLISHED NOTHING and the walk carried on. No refusal reached the agent and no fallback was invented.
- A DELEGATION LEFT A RECORD SAYING WHOSE WORK IT WAS: `part=guide relayed_by=walker answered_by=a-stronger-model named_driver=frame`, with `claimed=["answered_by","part"]` marking the two the server cannot see for itself.

### Two slides of the story are filled from it, and two were filled from the code

THE SLIDES THAT NEEDED THE RUN are the second and the fourth: the machine naming the hand, and whoever is driving acting on the name.

TWO OTHERS DESCRIBED THE SEED RATHER THAN WHAT SHIPPED and were filled from the system at `fill-story-evidence`. One promised a model list the declared winner does not hold. The other said no field is declared for the weaker-driver reason, and three now are.

## follow_up

WHAT THE DEMONSTRATION DELIBERATELY DOES NOT SHOW, said in the report rather than left to a reader.

- THE DELEGATION ACTUALLY HAPPENING. Step 6 shows the RECORD a delegation leaves. Whether a walker reading `rung: "frame"` hands the step on is obedience, and nothing in this build compels it.
- A RATED MATRIX. One cell was rated for the run. The shipped matrix has none.
- THE LANE STARTING ANYTHING. It does not, and the inspection over every path is where that is established.

THE HARNESS THAT PERFORMED IT WAS REMOVED, and the report is the artifact. The same six observations are held by cases in `tests/sizing-on-the-pull.test.ts` and `tests/call-attribution.test.ts` that go red when their mechanisms are deleted — which is the difference between a demonstration and a check, and the reason both exist.

ONE THING FOR `gate-validation`. The value proposition this story serves is `vp-the-machine-says-how-strong-a-hand-each-step-needs`, and what shipped serves it for a step rather than for a milestone. That is the declared design and not a shortfall, but a reader of the proposition's own words should be told plainly.

## anything_else

