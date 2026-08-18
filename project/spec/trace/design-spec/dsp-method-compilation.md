---
minted_in: i1
id: dsp-method-compilation
type: "[[design-spec]]"
statement: authored method compiled into runnable machines, carried by the rigor matrix, drawn canvases and seeded drawings sharing one state shape
realizes:
  - "el-method-compiler"
files:
  - "project/deliverable/engine/rigor-matrix.ts"
  - "project/deliverable/engine/canvas.ts"
  - "project/deliverable/engine/catalogs.ts"
  - "project/deliverable/engine/machines/compile.ts"
  - "project/deliverable/engine/expmachine.ts"
  - "project/deliverable/engine/machines/supply.ts"
---

## Responsibility

Three sources compile to one machine shape: the rigor matrix's rows per
change size, a person's Obsidian canvas, and the record's seeded
drawings. Catalogs read live off method cards, so editing the card
edits the offer. The machine is never stored — it recompiles on every
look, so a row edited a moment ago serves on the next pull.

## Behavior and constraints

- A row that breaks a law refuses at parse, naming the row.
- The matrix floor states are never struck.
- A canvas failing to compile leaves the walk standing.
- NO STATE DEMANDS WHAT IT CANNOT SUPPLY (i6). Both compile paths refuse
  a state whose required evidence resolves against something no verb it
  grants can make, naming the state, the field and the verbs that would
  close it. Refusing here is a fix somebody can make; refusing at the
  state leaves the walk with no legal move and nothing to read.
- THE CHECK WAS MEASURED BEFORE IT WAS ARMED. `bin/supply-gaps.ts`
  reports rather than throws, and it ran first — 29 pairs across four
  columns, all one shape. A check that refuses is armed against the real
  corpus or not at all.

## The drawing is data, and data is live

EDITING A STATE NOTE USED TO DO NOTHING until an explicit reload, which
contradicts the law that the markdown is the single truth: the file said one
thing and the running lane enforced another.

COMPILING ON EVERY GATE WOULD RE-READ a canvas and a dozen notes per call, so
the result is cached against the SOURCES it was built from. Anything the
compile touched is watched, and a changed size or modification time rebuilds.
The canvas is always among them, so a state ADDED to the drawing invalidates
too — which a watch on the notes alone would miss.

ONE VALIDATION PER CALL. The stamp stays content-based, but one pull validates
the same machine dozens of times while routing, and re-hashing a dozen notes
each time cost about 1.5 seconds of every booted walk.

THE CALL IS THE BOUNDARY, and it is the read-it-live law's own unit: a state
note edited on disk binds the NEXT call. A guard bumps the epoch on every tool
call and every mirror request, so nothing can outlive one call.

A ONE-SECOND CLOCK ONCE STOOD BESIDE THE EPOCH. It was the backstop from before
every tool bumped the epoch — the pull alone used to, and a gate check on any
other tool went stale for up to a second. Once the guard landed the clock
guarded nothing: it could only cut trust SHORTER, inside a call running over a
second. It was harmless and it is gone anyway, because a reader had to prove it
harmless before they could trust the file, and that proof cost more than the
line saved.

## One arrow, both ways

DRAWING A FORWARD EDGE AND A RETURN EDGE AS TWO SEPARATE ARROWS is what the
editor makes tedious. A DOUBLE-HEADED ARROW is what a person naturally draws
instead, and the editor offers it, so it means exactly that pair.

THE RETURN HALF IS LEFT UNDECLARED ON PURPOSE, so the depth rule names it:
forward is whichever end lies deeper from start, and the other way round is the
return. Nothing new decides anything.

## The bar is authored in a drawing too

WITHOUT THIS A DRAWN FAN COULD NEVER FOLD. The branch classifier looks for a
busbar above the legs before it calls the branch an AND, and a canvas had no
way to say so.

A DRAWN `state_kind: join` IS A BUSBAR, and nothing else. It stays in the
drawing vocabulary because a person drawing a machine reaches for the word, and
it compiles to the one field the kernel, the submit check and the layout all
read.

## A drawn state speaks the matrix's language

EVIDENCE LIVES IN FRONTMATTER — a nested list the form machinery consumes
directly. A body section describing the same form is refused: one truth, no
echo.

THE CANVAS COMPILER USED TO HAVE ITS OWN EVIDENCE SHAPE — one line per field
carrying a name, a description and required-or-optional, and nothing else. No
template, no item type, no guidance. So a hand-drawn state could never ask for
what a matrix row asks for every day, and the first drawn state that wanted a
real form found the key it wrote was read by nobody.

AFTER SEEDING THERE IS NO MECHANICAL DIFFERENCE between a state the matrix
compiled and a state somebody drew.

## When a state may declare no evidence

A GATE MAY DECLARE NOTHING, because the compiler gives it the four standard
rounds and those are evidence. A gate whose own fields all reduced to
mechanical checks SHOULD end up empty — re-asking a check that can only pass is
what teaches a reader to skim.

A SUB-MACHINE STATE IS EXEMPT FOR THE OPPOSITE REASON: not that its evidence
reduced to nothing, but that it lives one level down.

A FALLBACK STATE IS EXEMPT because its proof is the state it recovers
re-passing. The findings of a fix state ARE the red verifications, generated —
a form there would re-ask what the confirming run answers.

A LAW-PROVEN STATE IS EXEMPT because its proof is computed. A law over the
story nodes answers the claim, and a field would re-ask what the law answers.

## A mirror is a reference, never a copy

A ROW CARRYING `same_as: <state>` IS THAT STATE, standing in the walk. How it
WORKS — its tools, its guidance, its entry reading — comes from the ONE state
note, read at compile time so an edit there reaches both.

THE ROW KEEPS ONLY ITS SEAM: statement, evidence, dependencies, cells.
