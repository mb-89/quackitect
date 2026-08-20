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
