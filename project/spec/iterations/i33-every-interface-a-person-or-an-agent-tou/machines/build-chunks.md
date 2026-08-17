---
steps:
  - id: phase-split-probe
    statement: "the machine phase splits into its four parts and the split is read against two numbers — drawingSets and stateDetails over 90 percent, and the SVG under 50 ms — settling whether the DAG is the right instrument at all"
    depends_on: []
    realization: code
  - id: locked-rung-names-its-unlock
    statement: "a locked rung's help names the notch that unlocks it, composed from the levels already handed in rather than from a second copy of the list"
    depends_on: []
    realization: code
  - id: absent-is-not-zero
    statement: "a bank handed no position renders as not knowing where it stands, rather than as a deliberate zero drawn as a row of locked buttons"
    depends_on: []
    realization: code
  - id: running-work-rides-the-panel
    statement: "work still running past its bound reaches the panel as a value and renders beside the controls rather than over them"
    depends_on: [absent-is-not-zero]
    realization: code
  - id: goals-bind-the-walk
    statement: "the kickoff carries a list of goals, every gate below measures what it produced against each, and an upstream edit greys what stands on it"
    depends_on: []
    realization: code
  - id: one-read-per-operation
    statement: "an operation collects its corpus once and hands it down, measured at the door's own meter rather than with a stopwatch"
    depends_on: []
    realization: code
  - id: model-the-boundaries
    statement: "one interface node per element-to-neighbour pair that carries traffic, which is the denominator both pass lines need and which nothing downstream can enumerate without"
    depends_on: [phase-split-probe]
    realization: code
  - id: bind-the-bound-per-interface
    statement: "each modelled interface carries its own bound and says whether it is fast or honest about not being"
    depends_on: [model-the-boundaries]
    realization: code
  - id: breaches-reach-the-reviewer
    statement: "a gate review is shown every instrumented interface that breached its bound since the last review, so reading the instrument is somebody's job rather than somebody's habit"
    depends_on: [bind-the-bound-per-interface]
    realization: code
  - id: fix-what-the-numbers-name
    statement: "the breaches the instrument names are fixed, in the order the numbers put them rather than the order they were noticed"
    depends_on: [breaches-reach-the-reviewer]
    realization: code
---

# The build, eleven chunks

## What the first four were, and what was missing (2026-08-17)

THE FIRST FOUR CHUNKS IMPLEMENT NONE OF THE FOUR MILESTONES. That is the
iteration's drift, visible in the build plan more plainly than anywhere else:
the scope named four milestones in a forced order, and the plan below it built
a legibility fix, a locked-rung message, an absent-versus-zero fix and a
running-work signal.

EVERY CHECK PASSED, because a chunk is checked against its design spec, the
spec against its element, the element against its function, and so on up. Not
one of those comparisons looks at the kickoff.

THE SEVEN ADDED HERE ARE THE MILESTONES, with the two already built named as
such rather than quietly folded in:

- `goals-bind-the-walk` and `one-read-per-operation` are BUILT and green.
- `model-the-boundaries` is the gate on everything after it. The two pass
  lines take a share over the set of modelled interfaces, and until they are
  nodes there is no denominator.
- `breaches-reach-the-reviewer` is the one the kickoff's red team named as the
  pass-fail: a milestone three ending with no state reading the instrument
  means this iteration repeated i12.

# The original four

TWO LENSES SHAPED THIS ORDER, and the plan records them rather than claiming
one method.

RISK FIRST decides what goes at the front. `phase-split-probe` is the riskiest
piece in the iteration, because a concentrated result invalidates milestones
three and four. It is four lines of work and it runs before anything rests on
its answer. That is raid-asm-the-slow-phase-is-the-green-derivation-repeated,
and this chunk is the probe it schedules.

PARALLEL FLOW decides the middle. Three chunks depend on nothing and fan out
to separate builders. `locked-rung-names-its-unlock` and `absent-is-not-zero`
both touch params.ts but in different functions, with no path between them.

ONE EDGE IS REAL AND IT IS THE ONLY ONE. `running-work-rides-the-panel` waits
on `absent-is-not-zero`, because both change what the panel's values contract
carries. Running them together would put two edits on one boundary, which is
the kind of seam this plan exists to avoid.

## What each chunk turns green

- `locked-rung-names-its-unlock` — the third case of tsp-a-control-is-legible.
- `absent-is-not-zero` — the fourth case of the same spec.
- `running-work-rides-the-panel` — both cases of
  tsp-work-past-its-bound-signals.
- `phase-split-probe` turns nothing green. It writes a measurement onto a raid
  entry, and its output decides whether the milestones after this one are
  aimed correctly.

## What is deliberately not a chunk

THE WORDING OF THE RUNNING SIGNAL. `running-work-rides-the-panel` settles where
the signal lives and that it does not take the surface over. What it SAYS is
the owner's, through raid-risk-an-accurate-progress-signal-can-drive-abandonment,
because a faithful completion percentage is the known way to fail
req-a-slowness-signal-never-shortens-the-wait.

THE POST AND THE STORED VALUE behind the stop-at fault. The probe at
probe-assumptions pushed that search past the rendering, and neither remaining
suspect is in these files.
