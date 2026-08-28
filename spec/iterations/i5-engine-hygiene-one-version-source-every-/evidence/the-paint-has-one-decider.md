---
form: the-paint-has-one-decider
by: agent
signed_off: 2026-08-19T12:10:51.492Z
authors: agent
files: null
---

# Evidence form / the-paint-has-one-decider

## current_situation

The last chunk, and the only one whose demand was not met anywhere.

Two of the three paint rules already stood. The third did not paint at all: a check that RAN and a claim somebody stamped were the same green.

## built

Four files, and the whole wire rather than one leg of it.

- `sessionclaims.ts` — `lawProvenStates(decl)` reads the third kind of green for a drawing, beside the two readers that already existed.
- `session.ts` — the session exposes it, next to `recordPaint`.
- `render.ts` — `StateMeta` gains `law_proven`, the meta builder fills it, and `statePaint` becomes the ONE function that decides a state's class and its marks. `stateClass` is now a thin caller, and the thumb is drawn from the decider's marks rather than from a second read of the meta.
- `renderstyle.ts` — `.state.done.proven` draws a dashed stroke. Same green, different edge.

THE ORDER OF THE RULES IS THE DESIGN. Active first, then suspect, then the greens — because a colour standing on moved ground is no longer earned, whatever else is true of it.

THE PAINT IS THE SAME GREEN ON PURPOSE. A law that passed is a pass. What it is not is a signature, and the dash is what says so without demoting it.

OBSERVED: `tests/paint-rules.test.ts` plus the four standing files that already enforced parts of these rules — `mirror-contract`, `drift`, `reopen`, `claimops`. 65 cases, 65 pass, 0 fail.

## follow_up

trace-design is next, then verification fires the battery.

WHAT VERIFICATION MUST CONFIRM, because this chunk touched the most-read file in the engine: nothing else that reads a state's paint went stale. The four standing files above say it did not, and the battery says it over everything else.

## anything_else

THE WIRE HAS FOUR LEGS AND ALL FOUR ARE HERE, because fixing one and shipping is the failure this project repeats most.

- The engine state that holds the new fact: `lawProvenStates`.
- The payload that carries it outward: `StateMeta.law_proven`.
- The decision that draws it: `statePaint`.
- The DOM rule that makes it visible: `.state.done.proven`.

A CLASS NOBODY STYLES IS A FIX THAT LOOKS DONE. That is the exact shape of the colour defect of 2026-08-04, where the data was right and the CSS rule never existed.

WHAT IS STILL ONLY PROVEN AT THE DECIDER. The cases assert the class and the marks, not the pixels. A dash that renders invisibly in some theme would pass them. The palette is not touched here, so the dash inherits the same stroke colour the green already uses.
