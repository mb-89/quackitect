---
form: identify-assumptions
by: agent
signed_off: 2026-08-21T09:10:40.481Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

Five requirement rows and three functions stand. This state sweeps them for what they lean on.

The register was the input, walked row by row, not memory. Four new assumptions came out of it and two more already stood from earlier states.

Every one of the six sources was answered, including the two that answered none.

## assumptions

- [[raid-asm-the-callers-limit-is-longer-than-a-second]]
- [[raid-asm-work-under-way-records-progress-before-it-ends]]
- [[raid-asm-a-check-left-running-survives-on-every-platform]]
- [[raid-asm-starting-a-judgment-is-far-cheaper-than-answering]]
- [[raid-asm-a-first-run-has-timings-to-estimate-from]]
- [[raid-asm-battery-timings-measure-work]]

## sweep

- environment: ONE FOUND. `req-a-leaving-check-does-not-hold-the-call` measures the answering call at under a second, and that measure counts the whole call rather than the part the design controls. Starting the judgment and recording that one is owed costs something, and nobody has measured what it costs on a small or loaded machine. `raid-asm-starting-a-judgment-is-far-cheaper-than-answering`, graded abrasive because a breach here is a slow answer rather than a lost one.
- toolchain: NONE, and the reason is that nothing new is installed or spawned. The runtime is already pinned in the project's own engines field, the checks already run through the same spawning path, and this change adds no tool and no version demand. THE SMELL WAS CHECKED: the method warns that a capability named without a version is a promise somebody can withdraw. No new capability is named.
- host: ONE FOUND, and it is the sharpest in the sweep. The one-second measure is only safe if the caller waits longer than a second, and that limit belongs to the harness. `nbr-agent-harness` lists cancellation among the things the harness controls outside this server, and the product can neither read the number nor detect that it expired. `raid-asm-the-callers-limit-is-longer-than-a-second`, graded crippling and conceivable — crippling because the whole design rests on it, conceivable because every harness met so far waits far longer.
- platform: ONE FOUND. After this change a judgment outlives the call that started it, and whether left-running work survives is a property of the platform. The product already carries a recorded doubt at exactly this seam: whether a POSIX host reaps spawned work when the session closes has never been exercised, and every machine that has run this engine was Windows. `raid-asm-a-check-left-running-survives-on-every-platform`, graded crippling and plausible.
- neighbours: ONE FOUND. Every duration in the report is computed from what a piece of work has already done, which needs a numerator that exists WHILE the work runs. `flow-test-timings` is described as recorded per run, and per run leaves open whether lines appear as cases finish or only when the run ends. If it is the second, a running battery has said nothing about itself. `raid-asm-work-under-way-records-progress-before-it-ends`, graded corrosive and plausible. TAKEN FROM A DESCRIPTION RATHER THAN A RUN, which is precisely the shape the method warns about.
- people: NONE, and the reason is the actor. All three use cases name `stk-agent`, a program, and the mirror's presentation is in the binding excluded list. NOTHING HERE ASSUMES ANYTHING ABOUT A PERSON'S SKILL, PATIENCE OR SETUP, because no person is in any of the three passes. The nearest thing to a person-assumption belongs to a resident story about what a person believes while they wait, and that story is untouched.

## follow_up

Probing comes next, and it probes every standing assumption rather than only these four.

Two of the four are worth probing before anything is built rather than after.

- Whether left-running work survives on POSIX decides whether the load-bearing goal is buildable as designed.
- Whether a running piece of work has recorded anything about itself decides whether any duration can be computed at all.

The other two can be probed alongside the build. Neither changes the design if it turns out false, only a number in a measure.

## anything_else

TWO OF THE FOUR CAME FROM SMELLS THE METHOD CARD NAMES, and it is worth recording which.

A NUMBER WITH NO SOURCE. "Under 1 second" appears in a measure and is not derived from anything measured. Pulling on it produced two assumptions rather than one — the caller's limit above it, and the cost of starting below it. One number, two directions, two ways to be wrong.

A CAPABILITY NAMED WITHOUT A VERSION. The timing record is named as an input to the account and was taken from its own description rather than from a run. That produced the neighbours entry.

THE THIRD SMELL FOUND NOTHING. No "just" and no "obviously" survives in the five rows, which is what the writing rules were already pushing for.

AND ONE THING WAS CHECKED FOR KIND BEFORE IT WAS WRITTEN. The POSIX seam has already been observed to be untested, which sounds like an issue. It is not: nothing has failed there, because nothing has run there. The claim underneath is that left-running work survives, and that is what the entry says rather than "POSIX untested".
