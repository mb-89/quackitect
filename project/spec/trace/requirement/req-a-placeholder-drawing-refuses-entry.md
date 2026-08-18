---
minted_in: i3
id: req-a-placeholder-drawing-refuses-entry
type: "[[requirement]]"
statement: While a seeded sub-machine still carries the placeholder its size record wrote, the engine shall refuse to walk into it and shall name the step that authors it.
kind: functional
verify_method: test
breaks_if_removed: A whole build is skipped in silence. The run step finds a start-to-end shell, walks through it and reports itself done, and the record says the build happened.
breaks_how_badly: fatal
refines:
  - uc-take-a-step
source_refs:
  - engine/iterations.ts SCAFFOLD_NONE, and the branch that marks the compiled machine
  - engine/session.ts seedSubs, the entry refusal
  - "observed live 2026-08-13: i3 passed specify-build, seeded nothing, and build-steps reported done"
  - note-524c23da2f26, ruling that the guard belongs at entry rather than at compile
priority: must
---

## Detail

- The placeholder must still COMPILE and still DRAW. The machine view has to
  draw a route through work nobody has authored yet, so refusing at compile
  time breaks the drawing instead of the skip.
- An AUTHORED absence is not a placeholder. Zero steps with a stated reason is
  a normal outcome and walks through untouched.
- The literal lives in one place. The size record writes it and the compiler
  reads it back; two copies would drift apart and the guard would stop firing
  with no test going red.

## Behaviour

    placeholder written  -> drawable:  the size is recorded, no step has run
    drawable             -> drawable:  the view draws a route through it
    drawable             -> refused:   the walk tries to enter
    drawable             -> authored:  the seeding step writes real steps
    authored             -> walkable:  the walk enters and runs them

The transition that must not exist is `drawable -> walkable`. That is the one
the walk took on 2026-08-13.
