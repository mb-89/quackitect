---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: req-a-code-citation-names-something-that-exists
type: "[[requirement]]"
statement: When the conformance sweep runs, the engine shall report every corpus citation naming a source file or symbol that is not present in the tree.
kind: functional
verify_method: test
breaks_if_removed: A citation to code that has moved or been renamed sends the next reader hunting, and it reads as evidence while proving nothing.
breaks_how_badly: corrosive
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up
priority: should
---

## Detail

| what is cited | what is checked |
| --- | --- |
| a path into the tree | the file exists |
| a path with a symbol name | the symbol appears in that file |
| a path with a line number | the file exists, and the line number is not checked |

THE LINE NUMBER IS DELIBERATELY UNCHECKED. It moves on every edit above it,
and a sweep that fails on it would be red permanently for no gain.

A CITATION THE SWEEP CANNOT PARSE reports as unchecked rather than passing.
