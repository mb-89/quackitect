---
form: the-target-chip-and-the-route-line
by: agent
signed_off: 2026-08-23T19:36:07.652Z
authors: agent
files: null
---

# Evidence form / the-target-chip-and-the-route-line

## current_situation

THE TARGET WAS A LABEL AND THE POSITION WAS A BUTTON, side by side, doing the same job. A reader could click where the walk STANDS and not where it is AIMED.

THE ROUTE LINE WAS REPORTED MISSING whenever a target existed, on the grounds that an iteration aimed at its ship state routes across machines.

## built

THE CHIP IS A BUTTON, drawn like the position button beside it. `<button class="ghost cur-state aim">` carries the same two data attributes and joins the same click path, so one handler serves both.

THE MODEL CARRIES THE SPLIT, not the surface. `aimOf()` in `deliverable/engine/viewmodel.ts` turns the target path into `{path, machine, leaf}`. Working out which machine a qualified target sits in is a fact about the walk, so the surface no longer splits a string in a template.

AN EMPTY TARGET STAYS EMPTY. Nothing routed is a real state of the walk, and the absence of the chip says it rather than a dash.

### Measured out of the served page, not the source

THE BUTTON IS THERE, verbatim from the render:

    <button class="ghost cur-state aim" data-machine="build-steps"
            data-state="the-target-chip-and-the-route-line"
            title="the walk is aimed at iterations/i4/build-steps/... — click: jump the view to it">

THE ROUTE LINE IS THERE TOO, and it was not broken. The model's marks came back as `path: [start, boot, front_desk, iterations]` with `here: true` and `target: iterations`.

SIX ROUTE-CLASSED ELEMENTS in the served machine widget, carrying `route-line`, `route-stop`, `route-wp-io` and `route-here`.

THE CROSS-MACHINE CASE IS THE ONE THAT WORKS. The walk stands four levels down inside `build-steps` and the target is in the same place; the route projects onto the main drawing as far as `iterations`, which is exactly the state on that drawing the route passes through.

## follow_up

THE ROUTE LINE NEEDED NO FIX and that is worth saying plainly. The chunk was seeded from a comment in the source describing a defect that the measurement does not reproduce. Either it was fixed earlier without the comment being updated, or the case it described is narrower than the comment says.

THE COMMENTS THAT DESCRIBE IT AS BROKEN ARE NOW WRONG. They stand in `render.ts` above the aim chip and in `crumbsFor`. A reader following them would go looking for a defect that is not there.

NOTHING ASSERTS THE BUTTON. A test that renders the machine widget with a target set and asserts the aim button carries its two data attributes would pin this, and it is one case.

## anything_else

