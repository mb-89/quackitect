---
minted_in: i3
id: tsp-size-compiles-mechanically
type: "[[test-spec]]"
statement: The recorded change size decides the machine by computation, never by reading around a choice or by asking whoever walks to be brief.
method: "test"
verifies:
  - "req-the-size-is-read-by-one-extractor"
  - "req-a-size-may-drop-a-question"
files:
  - "tests/change-size.test.ts"
  - "tests/field-omit.test.ts"
---

## Scope

Two requirements, one subject: what happens between a person choosing a size
and a machine arriving.

Both failed the same way before this iteration. A judgment sat where a
computation belonged, and in both cases the judgment was invisible — nothing
reported that it had been made, so nothing could report it being made wrong.

NOT IN SCOPE: which sizes strike which steps. That is authored in the matrix
rows and reviewed at the kickoff gate, not verified here.

## Approach

Unit level for the extractor, because the failure is a parse and a parse is
answerable with a string.

Column-compile level for the trim, because the claim is about what a compiled
machine SERVES, and a filter tested in isolation would prove the filter rather
than the form.

THE ORACLE IS THE COMPILED COLUMN, not the row. A row can declare anything; the
question is what the walk is handed.

## Steps

Every case in a referenced file is one step, and the case name states its
claim.

THE SIZE READ — `tests/change-size.test.ts`:

- the exact field that bit is pinned verbatim. `minor — … a new line is not a
  patch` records minor. The rationale is text, not a second vote.
- an unrecognised choice records nothing rather than guessing.

THE FIELD TRIM — `tests/field-omit.test.ts`:

- frame-delta stops asking the inherited half at minor, and still asks it at
  major.
- draft-vision keeps only the goal system at minor, which proves the trim is
  per FIELD rather than per state.
- a field with no omit is asked at every size.
- the matrix view still shows an omitted field, because a reader of the matrix
  wants every question a row can ask.
- every omit in the matrix names a real change size.

## What red looked like

THE SIZE READ cost eleven approved steps. The recorder scanned the whole field
for any column name in declaration order. `patch` comes first, and the
rationale ended "…a new line is not a patch", so an iteration blessed as minor
was recorded as patch. `specify-build` is struck at patch, so the build never
ran and nothing said so.

THE FIELD TRIM had no red, because it had no mechanism. A rigor cell could keep
a state or strike it and swap its prose, and nothing else. "Keep it but ask
less" was a sentence in a note asking the walker to be brief.

## A limit worth stating

Neither case can catch a badly-authored omit — a field dropped at a size that
could genuinely have answered it. The engine refuses an unknown size, a field
omitted everywhere, and a state trimmed to nothing. It cannot read intent.

That residue is carried as `raid-asm-an-omit-is-authored-honestly`, with its
probe.
