---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-a-write-that-breaks-the-corpus-refuses
type: "[[requirement]]"
statement: When a write carries content the engine's own reader cannot parse, the engine shall refuse it before anything lands, naming the file, the line, the offending value and the fix.
kind: functional
verify_method: test
breaks_if_removed: A broken node lands with a hash and looks written. The break surfaces at an unrelated call that reads the corpus, naming a line and a column in no particular file, with the author long gone.
breaks_how_badly: fatal
refines:
  - uc-keep-the-corpus-sound-at-the-write
source_refs:
  - sty-the-write-refuses-the-break
  - raid-iss-a-write-can-leave-the-corpus-unparseable
  - raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus
  - uc-keep-the-corpus-sound-at-the-write step 2 and extension 2a
priority: must
---

## Detail

BEFORE ANYTHING LANDS is the load-bearing half. A check that runs after
the write and then complains has not prevented anything — the corpus was
broken for however long the complaint took to arrive, and every reader in
between saw it.

So the check runs on the CONTENT BEING WRITTEN, not on the file already
on disk.

## What the refusal must carry

FOUR THINGS, and the fourth is what makes it a remedy rather than a
diagnosis.

- THE FILE. The write knows it; the reader that throws later does not.
- THE LINE. Where in the content, counted in the content being written.
- THE OFFENDING VALUE, quoted back. "line 9" is a location; the value is
  the thing to look at.
- THE FIX, executable. For the case that provoked this row, that is the
  same value with the quoting it needed.

THE TEST OF A REMEDY, from `guidance/refusals.md`: could somebody act on
it without asking a second question?

## Why it is graded fatal

IT TAKES THE WHOLE ENGINE DOWN, not one file. Every corpus reader — the
pull, the form builder, the trace graph, the coverage checks — parses the
same nodes. One unparseable node stops all of them.

OBSERVED LIVE 2026-08-16 at this iteration's own log-risks. One unquoted
colon inside a YAML value. The write returned `created: true`. The next
pull threw whole and the walk stopped.

## Scope of "cannot parse"

THIS ROW IS THE FLOOR AND NOT THE CEILING. It covers what the reader
cannot read at all — malformed frontmatter, a document that does not
load.

A NODE THAT PARSES AND SAYS SOMETHING WRONG is a different row. A
missing `minted_in`, an `id` disagreeing with the filename, a `type`
naming no template — those need the corpus and they are bound checks
rather than this one.

## Behaviour

NO MODEL WANTED. One trigger, one response, no states in between. A
sequence diagram of "check, then land or refuse" would be noise.
