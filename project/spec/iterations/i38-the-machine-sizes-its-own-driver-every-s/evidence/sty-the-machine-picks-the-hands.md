---
form: sty-the-machine-picks-the-hands
by: agent
signed_off: 2026-08-20T21:59:47.631Z
authors: agent
files:
---

# Evidence form / sty-the-machine-picks-the-hands

## current_situation

The demonstration for this iteration's only `must` story, performed once against modules built from this code.

THE RUNNING LANE SERVER WAS NOT USED. It predates the build and does not know the `as` argument exists, so a run against it would have shown the feature absent and read as a pass.

## built

`reports/rpt-sty-the-machine-picks-the-hands.md` — six steps, each line of it what the run printed.

1. ONE CELL RATED BY HAND: `onboard-retro` at `major_complexity: C4/R1`. Nothing else, which is the shipped product's own state.
2. A RECORD OPENED AND PINNED AT `major` with no model named by anybody — not on a command line, not in the seed, not in the pin.
3. THE WALK REACHED THE RATED STEP.
4. THE STEP OPENED BY NAMING THE HAND: `hand = {"pair":{"judgement":"C4","reading":"R1"},"rung":"frame"}`. The rung is the strongest because the corner rule takes the higher of the two figures, and the pair rides beside it so a reader who disagrees can still use it.
5. THE SAME STEP UNRATED PUBLISHED NOTHING, and the walk carried on. No refusal reached the agent and no fallback was invented.
6. A DELEGATION LEFT A RECORD SAYING WHOSE WORK IT WAS: `part=guide relayed_by=walker answered_by=a-stronger-model named_driver=frame`, with `claimed=["answered_by","part"]`.

TWO SLIDES OF THE STORY ARE FILLED FROM THIS REPORT — the machine naming the hand, and whoever is driving acting on the name.

## follow_up

THREE THINGS THE RUN DOES NOT SHOW, and the report says so on its own face.

- THE DELEGATION HAPPENING. Step 6 shows the RECORD a delegation leaves, not a walker deciding to delegate. Nothing in this build compels one.
- A RATED MATRIX. One cell was rated for the run; the shipped matrix has none.
- THE LANE STARTING ANYTHING. It does not, and an inspection over every path is where that is established rather than a run over one.

THE HARNESS WAS REMOVED AFTER THE REPORT WAS WRITTEN. The report is the artifact, and the same six observations are held by cases that go red when their mechanisms are deleted — which is the difference between a demonstration and a check.

## anything_else

