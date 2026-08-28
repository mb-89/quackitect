# The rigor matrix

One full-battery process, tailored down by change size. This folder is the
single source: the seeder reads it live, and the spec's structure derives
from it.

- `rows/` — the steps of the full state machine, one file each. The file
  name orders the walk (`M<gate>_<step><letter>_<title>`, sparse numbers,
  letters mark parallel branches). The frontmatter `depends_on` is the
  truth; the name is only the readable projection. References use the
  stable short title (`draft-vision`), never the numbered prefix.
- The CELLS ARE FRONTMATTER on the row. `patch`, `minor`, `major`,
  `product` and `specification` carry how the row applies at that change
  size; `<column>_note` carries the prose; `<column>_complexity` carries how
  hard the row is THERE, as `<judgement>/<reading>` — judgement one of
  C0 C1 C2 C3 C4, reading one of R0 R1 R2 R3 R4. A cell that does not apply is an
  EXPLICIT `none` with its reason — absence means not yet written, and the
  loader refuses it.

  They were files once (`cells/<row>--<column>.md`). Three of each file's
  four frontmatter keys echoed its own filename, which is the noise rule in
  software.md, and a reviewer had to open five files to read one row. Both
  values are scalars because a Bases table edits a cell inline and cannot
  edit a nested map.

The row file carries the step at FULL battery: statement, dependencies,
guidance, evidence form. The `product` cell adds only what the standing
whole-product level demands beyond that. The change-size cells tailor
down; the `specification` cell says how the step's output becomes its
part of the documentation.

Strikes are proposals. The owner adjudicates every cell that reduces a
step. The floor law binds: kickoff, green verification, docs-match and
the accepted handover are never struck, at any size.

A `comment` in a row's frontmatter is the owner's OPEN REVIEW CHANNEL. An agent may work a comment IN, and may not delete the field until
the owner says the round is done. The first round's comments were consumed
before this was written; git history holds them.

## The ratings

EVERY ACTIVE CELL CARRIES A COMPLEXITY. 182 of them, written 2026-08-28.

THAT SENTENCE IS THE SWITCH. `rigor-matrix.ts` reads this file for it, and
once it is here a cell that applies and declares no complexity refuses at
load. Saying it and making it binding is one act rather than two that can
disagree.

### What is rated and what is not

- A CHANGE-SIZE COLUMN owes a rating: `patch`, `minor`, `major`, `product`.
- `specification` owes none. It says how the row is DOCUMENTED, not how hard
  it is to walk.
- A CELL THAT DOES NOT APPLY owes none. 58 cells read `none`.
- A ROW THAT RUNS A SUB-MACHINE owes none, because the work happens in the
  states below it. Five rows: `enumerate-space`, `run-candidates`,
  `run-spikes`, `build-steps`, `run-demos`. A row that SEEDS one still owes a
  rating, because seeding is real work.

### How they were arrived at, and where the judgement is thin

FOUR HANDS RATED EACH ROW ONCE, against its full shape, each with a written
reason. That is 63 judgements.

THE ROW'S PAIR THEN WENT ONTO EVERY COLUMN THAT APPLIES. The per-column spread
was not judged cell by cell, so a `tailored` cell carries its `full` sibling's
rating.

THAT OVER-DRIVES THE TAILORED CELLS, ON PURPOSE. `sizing.ts` states the
asymmetry the whole ladder rests on: under-driving produces a plausible wrong
answer that passes, over-driving only costs money. A tailored cell carrying a
rating that is too strong errs in the cheap direction. Any guess in the other
direction would not.

SO THESE ARE A FLOOR RATHER THAN AN ANSWER at the small end, and lowering one
is a real judgement somebody still has to make.

### Two rows were rated per column by hand

They were rated because an open register entry named them as its own test:
`raid-asm-a-state-is-equally-hard-at-every-change-size`.

- `write-requirements` is `C2/R1` at patch against `C3/R4` at major. Patch is
  clarification only, where the diff decides for you.
- `draft-vision` is `C3/R2` at minor, `C3/R3` at major, `C4/R3` at product.

THE SECOND ONE IS WHY THE PAIR IS A PAIR. Judgement held still at C3 while
reading moved from R2 to R3. One field against four changed how much had to be
held and did not change how hard the call was. A single collapsed figure could
not have said that.
