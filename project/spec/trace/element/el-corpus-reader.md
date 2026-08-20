---
minted_in: i9
id: el-corpus-reader
type: "[[element]]"
statement: The only thing that turns trace files into nodes — every caller goes through it, so a malformed node has one answer by construction rather than one answer per reader.
kind: new
realization: make
group: the-query
implements:
  - fn-run-a-governed-walk.answer-a-structured-query
satisfies:
  - req-what-the-corpus-is-has-one-answer
  - req-query-is-deterministic
source_refs:
  - cand-nothing-can-be-forgotten
  - raid-dec-one-corpus-reader-and-the-second-is-deleted
  - "probe P4 at i9 M4, 2026-08-19"
---

It exists because two readers already disagreed and nothing noticed. One drops a
node that will not parse; the other keeps it with an empty frontmatter mapping;
a boot check asserts every reader does the second. Those are three named lines
rather than a worry.

DELETING THE SECOND READER IS THE ELEMENT'S WHOLE POINT. Making two
implementations agree has no enforcement, and this one has already been broken
once without anybody seeing it.

WHAT IT DOES NOT DECIDE is which answer a malformed node gets. This element makes
there be one place that can give an answer; drop, keep blank or refuse is a
separate choice the requirement deliberately leaves open.

Boundary: the interfaces the element matrix mints for its flows.

Realization: the canonical loader, its pass-scoped stamp, and the removal of the
folder walk that currently sits beside it.
