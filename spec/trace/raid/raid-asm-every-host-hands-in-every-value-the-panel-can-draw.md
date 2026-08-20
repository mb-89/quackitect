---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: raid-asm-every-host-hands-in-every-value-the-panel-can-draw
type: "[[raid]]"
kind: issue
statement: Every host that draws the control bar hands in every value the panel can draw, so a control never renders its OFF state because a value was simply absent.
owner: the driving agent
trigger: any new host surface, any new control value, and the first read of the VS Code bar's own rendering
probe: "RAN AND FALSIFIED 2026-08-17, and this field said HOLDS for most of a day after the falsification. BOTH ELIMINATIONS IT RECORDED ARE DEAD, each re-checked with line numbers by a fresh-eyes tester. A SECOND HOST DOES DRAW ITS OWN VALUES: engine/render.ts lines 3782 to 3786 build panelValues from rungs, autonomy and ints alone — three of nine — so on the mirror's own bar an armed engine draws a plain rung and the running signal never appears. THE BAR'S REFRESH IS NOT UNCONDITIONAL: vscode/src/extension.ts line 415 returns early on a null poll, before fetchBar at line 420, and api() at 246 to 253 returns null on a 2500 ms timeout — so the bar stops refreshing exactly when the engine is slow. WHAT THIS COSTS BEYOND ITSELF: the stop-at eliminations this probe was credited with never happened, and any later search that trusted them starts from the wrong place."
status: open
probed: 2026-08-17
impact: "A missing value does not fail loudly. renderPanel reads it as absent and draws the OFF state, so the control looks like it never took the click. That makes req-a-surface-shows-the-state-an-act-produced unverifiable from the engine alone: the engine can be correct and the surface still lie."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - req-a-surface-shows-the-state-an-act-produced
  - req-a-refused-act-says-why-and-what-next
  - uc-act-on-a-control-and-know-what-it-did
---

## The assumption

SWEPT FROM THE HOST SOURCE, and it is the one source where the delta's
requirements lean on something nobody here controls.

engine/params.ts builds each rung from `v.stop_at ?? 0`. An absent value
becomes zero, and at zero only the lowest notch is reachable while every other
draws locked. Nothing distinguishes that from a control refusing the click.

THE ENGINE'S OWN COMMENT STATES THE RULE AND ITS HISTORY, at
engine/mirror.ts lines 756 to 762: every state the panel can draw has to be
handed in, what is missing does not fail loudly, and the emergency rung and the
shutdown row were both victims of exactly this.

AND THE LINE ABOVE IT NAMES THE SUSPECT: a host that drew its own drifted the
moment the spec changed, and that is precisely what happened to the VS Code bar.

## Probe

READ THE VS CODE EXTENSION'S CONTROL RENDERING, at
deliverable/vscode/src/extension.ts, and answer two questions.

- Does it draw the bar from its own values rather than from the mirror's
  /widget/controls payload?
- If it does, does it hand in `stop_at`, and every other value renderPanel can
  draw?

A NO ON THE SECOND QUESTION EXPLAINS THE OWNER'S REPORT of 2026-08-17, where
the fourth stop-at notch stayed dead from the third, and it falsifies this
assumption on the spot.

## Why it is an assumption and not the issue itself

THE OWNER'S REPORT IS AN OBSERVED SYMPTOM WITH TWO CANDIDATE CAUSES, and this
row is one of them. The other is that the panel does not repaint after a
control post, which is i4's subject.

RECORDING THE SYMPTOM AS AN ISSUE AND THE CAUSE AS AN ASSUMPTION keeps both
honest. The method's own warning applies: recording an observed failure as an
assumption hides that it already bit. What already bit is the dead notch. What
is merely believed is that hosts hand everything in.

## If it is falsified

IT BECOMES AN ISSUE, keeping this id, with the kind changed and the body
saying so. And the fix is not one host's bug: it is that a panel reading an
absent value as OFF is a design that cannot tell missing from off, which is the
same shape three times over.

## Probed 2026-08-17 — HOLDS, and it eliminated two hypotheses

THE PROBE RAN AS WRITTEN: the VS Code extension's control rendering was read.

QUESTION ONE, does it draw the bar from its own values? NO. Line 373 fetches
`${SERVER}/widget/controls` and takes its TEXT. The comment above it states the
rule and the reason: the bar arrives as MARKUP, never as data to re-draw,
because params.ts already drew it from the panel spec, and deriving a second
picture here is exactly how the struck sliders stayed on screen for a whole
expedition.

QUESTION TWO, does it hand in `stop_at`? IT DOES NOT HAVE TO. It hands in
nothing, because it renders nothing. The mirror's own /widget/controls builds
the values, and that endpoint does pass `stop_at: state.session.stopAtValue`.

SO THE ASSUMPTION HOLDS FOR THIS HOST, and the lesson it was written from had
already been learned and fixed here.

## What that costs the stop-at investigation, which is the useful part

THE OWNER REPORTED ON 2026-08-17 that the fourth stop-at notch stays dead from
the third. Two causes were proposed and this probe kills both.

- NOT a host omitting a value. The host supplies no values at all.
- NOT a permanently stale bar. `fetchBar()` is called unconditionally from
  `pollWalk()` at line 420, so the markup refreshes every poll. A stale draw
  could survive one interval, never a session.

WHAT IS LEFT, AND IT IS WHERE THE NEXT PROBE AIMS: the POST itself, or the
value behind it. Either the click never reaches `/stop-at`, or
`session.stopAtValue` does not hold what the press set. Both are one step
further in than anything looked at so far.

THE ELIMINATION IS THE RESULT. Two plausible causes are gone, with the line
numbers that killed them, and the search is now narrow rather than open.

## FALSIFIED 2026-08-17 by the fresh-eyes tester — now an issue, keeping its id

THE PROBE I RAN WAS TOO NARROW AND I SIGNED IT ANYWAY. It read the VS Code
extension, found that host draws none of its own values, and concluded the
assumption holds for every host. There is a second host and I never looked at
it.

engine/render.ts, around lines 3782 to 3789, builds the engine's own mirror bar:

    const panelValues = { rungs: levels, autonomy: thr, ints: {...} };
    const slider = renderPanel(loadPanel(m.root, "controls"), panelValues)
                 + renderPanel(loadPanel(m.root, "note-entry"), panelValues);

THREE VALUES OF NINE. The controls panel declares a stopat rung bank, a toggles
shutdown row and a text log filter; note-entry declares a text and a choice.
None of `stopat`, `stop_at`, `emergency`, `toggles`, `texts`, `choices` or
`running` is supplied.

SO ON THAT SURFACE an armed engine draws a plain rung, the shutdown row can
never show pressed, and the running signal never appears — which is the exact
set of three sightings req-a-surface-shows-the-state-an-act-produced was
written from. The failure this row exists to catch is live on a surface the
row's own probe never opened.

## Why the guard did not catch it

tests/params.test.ts, the seam test at lines 57 to 69, slices `mirror.ts` for
`const values = {` and asserts seven keys. It cannot see a second call site in
a different file, so it passes while the second host is starved.

## What it costs beyond itself

TWO ELIMINATIONS RESTED ON THIS PROBE and one of them is now unsafe. The
stop-at investigation used it to rule out a host omitting a value. That ruling
held for the VS Code bar and does not hold for the mirror's own.

## The repair

- engine/render.ts hands in every value the panel spec can draw, from the same
  source /widget/controls uses.
- The seam test stops slicing one file by name and checks every call site, or
  the values object stops being built twice.

THE SECOND HALF MATTERS MORE. A guard that names one file by string is a guard
against one file, and the shape it was written to stop is exactly a second
place doing the same job differently.
