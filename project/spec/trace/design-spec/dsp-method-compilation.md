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

## Advanced canvas reading

Advanced Canvas reading — the machine authoring surface (owner ruling:
machines are drawn, in Obsidian, with the Advanced Canvas plugin).
JSON Canvas base format; Advanced Canvas adds metadata.frontmatter and
styleAttributes on edges.

## A new node is born the size of its

A NEW NODE IS BORN THE SIZE OF ITS LABEL (owner ruling 2026-07-28). The old
rule made every new node roughly 620x640, which is a note-reading box, not a
label box. A node now starts just big enough for its title and subtitle. The
owner takes it from there in Obsidian, and what they draw is what renders.

## A box is sized by the text it shows

A BOX IS SIZED BY THE TEXT IT SHOWS, NEVER BY THE TEXT IT HOLDS (owner
ruling 2026-07-28). A generated expedition's subtitle is its whole goal
statement — a thousand characters — while the drawing paints only the first
line of it. Sizing from the full statement made e20's box 10793px wide to
carry 48 visible characters, and no person can fix that in Obsidian because
the node is generated. Both ends now read the SAME shortened label.

## The widest a box is ever born

The widest a box is ever BORN (owner confirmed 2026-07-29). A shortened
subtitle cannot reach it; it is here for long generated ids, because a box
wider than this is unreadable on any screen the drawing is meant to fit.
IT IS NOT A CLAMP. A width the owner sets in Obsidian is theirs, and the
render never re-imposes this one.

## A catalogue is read from where it is written

CATALOGUES — a known set of answers, read from where it is WRITTEN.

Owner ruling 2026-08-08: "if you have catalogs, just make them selectables.
And then if I change the catalog in the markdown, I want the selectables to
reflect that, so don't hard code it. That goes for everything."

So nothing here names a heuristic, an operator or a parameter. The method
card declares that it HOLDS a catalogue, and this reads it back:

  catalog: transform_operators
  catalog_sections: SCAMPER, SIT

A new catalogue is a new card with two frontmatter lines. It is never an
edit to this file, and that is the whole point of the indirection.

WHY THE CARD AND NOT A DATA FILE: the catalogue and the method that runs it
must never drift. A person editing the SCAMPER card is editing the offer the
form makes, in the same breath, without knowing this file exists.

## Continueexpedition is generated not drawn

continue_expedition is GENERATED, not drawn (owner design 2026-07-27):
its states ARE the open expeditions, read from their records at entry.
The standard expedition machine stays AUTHORED — states/work.md and
states/leave.md are the single source; the generator instantiates them
once per open expedition (id, statement and edges overridden). The
human clicks the expedition to enter; ONE reaching end completes the
machine, the others stay parked. Nothing open: start runs to end.
The drawn continue_expedition.canvas is a stub saying exactly this.

## Every closed expedition stands as its own dead machine

THE ARCHIVE, generated (owner design 2026-07-27): every CLOSED
 expedition stands as its own read-only state — a gallery of dead
 machines, all in parallel. Start reaches each one; each runs to end
 (alternative — one visit completes the machine). Nothing closed:
 start runs straight to end. Clicking one shows what the expedition
 did.
THE ARCHIVE READS FOLDERS, AND THAT IS THE WHOLE READ (i6).

 A closed expedition's record used to live on its branch, so a record not
 found on disk was fetched with `git cat-file --batch` over `<branch>:<rel>`
 — batched because a spawn per record made the archive take seconds to open,
 and cached because a closed branch never moves.

 i34 PUT THE ARCHIVE ON DISK. The folder stays where it is when a record
 closes, so a record that is not on disk is not anywhere. The fallback read
 branches the seed no longer creates, and it went with them.

 A MISSING RECORD NOW READS AS MISSING, which is the honest answer and the
 one the callers already handle.

## One archive shape for both record kinds

ONE archive shape for both record kinds (owner ruling 2026-07-27, both
 archives). Ten or fewer: every record its own state. More: DECADE
 SUB-MACHINES — ten records per group, each group a state you CLICK
 INTO; hundreds nest the same way.

## A drawn states evidence is the matrixs evidence

A DRAWN STATE'S EVIDENCE IS THE MATRIX'S EVIDENCE (owner ruling
2026-08-08). The one parser lives in rigor-matrix.ts and both compilers
call it, so a state note declares `evidence:` in frontmatter with the same
templates, item types, columns, picks and guidance a row declares.

WHAT THIS REPLACED: a second evidence language, one line per field, that
could say a name, a description, and required-or-optional. Nothing else.
It was never used by a single state note in the repository, and the first
drawn state that wanted a real form wrote frontmatter — the shape anybody
would reach for — which was read by nobody and compiled to an empty form.

## One validation per call

ONE VALIDATION PER CALL. The stamp stays CONTENT (the law above), but one
pull validates the same machine dozens of times while routing, and
re-hashing a dozen notes each time was ~1.5s of every booted walk (profiled
2026-08-02).

THE CALL IS THE BOUNDARY, and it is the read-it-live law's own unit: "a
state note edited on disk binds the NEXT call". A guard bumps this on EVERY
tool call (engine/tools.ts) and every mirror request (engine/mirror.ts), so
nothing here can outlive one call.

THERE WAS A ONE-SECOND CLOCK HERE TOO, ANDed onto the epoch (owner question,
2026-08-09). It was the backstop from before every tool bumped the epoch —
pull alone used to, and a gate check on any other tool went stale for up to
a second. Once the guard landed the clock guarded nothing: it could only cut
trust SHORTER, inside a call running over a second.

It was harmless and it is gone anyway. A reader had to prove it harmless
before they could trust this file, and that proof cost more than the line
saved.

## The machines-are-drawn law

THE MACHINES-ARE-DRAWN LAW (owner ruling 2026-07-28): the engine accepts
 what a person naturally draws in Obsidian — no invisible metadata.
 - The same pair drawn twice collapses to one edge; an authored role wins.
 - An undeclared edge running OPPOSITE a forward edge is a RETURN and
   compiles as alternative. Forward is the edge whose target lies deeper
   from start; equal depth is ambiguous and refuses with the edge named.

## Match the result

MATCH THE RESULT, NEVER THE SPELLING. The ladder resolves a word,
its abbreviation and any case alike, so `blocked`, `Blocked`, `B`
and `b` all arrive here as 0. An exact string match let three of
those through (found by the i3 tester, 2026-08-13), and 0 is the
one value that breaks the block: the gate refuses on
`priority > autonomy`, and 0 > 0 is false. Matching the resolved
number also survives the level being renamed in scale.md.

## Agent-facing lives in frontmatter the body is prose for

AGENT-FACING lives in FRONTMATTER; the body is prose for humans (owner
ruling 2026-07-26). guidance is a frontmatter field — short by design,
and NEVER empty: a state with nothing to say is a state that leaves the
agent guessing (owner ruling, same day).

## A state that runs a machine carries no evidence

A STATE THAT RUNS A MACHINE CARRIES NO EVIDENCE OF ITS OWN (owner ruling
2026-08-14). Evidence belongs to a state, and a sub-machine is not a
state doing work — it is a machine. Where a summary is wanted at the end
of one, it goes in a state INSIDE that machine.

WHY THIS IS A RULE AND NOT A STYLE. The walk enters a sub-machine at its
start, runs it, leaves at its end, and moves on. It never lands on the
parent, so the parent's form is never served. A form that cannot be
served cannot be filled, and the claim guard then drops every state
downstream for an input that can never be earned.

MEASURED 2026-08-14 IN i27: enumerate-space and run-candidates both
declared forms nothing could serve. The record deadlocked at
cut-criteria with no legal move left, and the only exit was the escape
hatch. Recorded as note-bb725251735e.

THE CORRECTION IS NAMED RATHER THAN SILENT, per the failure-mode
ordering: prevent by construction where you can, else correct and say
so. Dropping the fields quietly would be the silent pass that
req-a-wrong-act-never-passes-silently forbids.

## The rigor matrix

The rigor matrix — reader and column compiler (owner design 2026-07-29).

The folder (machines/rigor_matrix) is the single source: rows are the
full-battery steps, cells tailor each step per change size. This module
reads it LIVE (seed-from-source: no baked copy exists to drift) and
compiles a change-size column into an iteration machine the kernel can
run. Struck states (applies: none) vanish; their dependencies CONTRACT
through them, so the seeded machine stays connected.

## Picks maps a column to the sources its cells

`picks` maps a column to the sources its cells are constrained to. ONE
 source or SEVERAL, and a literal is legal beside a live one — a column
 offering `[$clusters, nobody]` is complete without being free.

 Anything else refuses. A pick pointing at nothing offers nothing, and an
 empty offer looks exactly like a text box (owner report 2026-08-08).

## A drawn sub-machine is a canvas

A DRAWN SUB-MACHINE IS A CANVAS, SO IT TAKES THE CANVAS'S NAME (owner
ruling 2026-08-08). `boot` is the shape: the node's file is boot.canvas
and the state's id is boot. One name.

Two names for one node is what a reader hits when they click a state and
land somewhere called something else, and no amount of breadcrumb work
fixes it.

## A row may demand a machine-observed check on the

A ROW MAY DEMAND A MACHINE-OBSERVED CHECK ON THE WAY OUT, for the same
reason it may demand its method on the way in. A form field can only
check the shape of what was written; a script can check the world.
derive-functions is the first: its flows field promised a both-ways
closure that no form vocabulary could express (owner ruling
2026-08-08).

## The trim is mechanical

THE TRIM IS MECHANICAL, NOT A JUDGMENT (owner ruling 2026-08-13). A field
naming this size in its `omit` is not asked here — the state stays, its
form is shorter, and no agent decides how brief to be.

WITHOUT A COLUMN NOTHING IS DROPPED: the whole-matrix view shows every
question a row can ask, which is what somebody reading the matrix wants.

## The seed machine

THE SEED MACHINE (owner ruling 2026-08-04): every iteration stands in
 M0 from the moment it is seeded — the retro onboards, then the kickoff
 sizes. No column exists yet, so only the M0 rows compile, on their own
 guidance. The kickoff's bless pins the full column and the machine
 grows IN PLACE: the machine id and the state ids are stable, so filled
 M0 states and their evidence carry over.
