---
id: req-query-is-the-file
type: "[[requirement]]"
statement: The engine shall serve a view's query as the view file's own content, verbatim, with zero query state held outside the file.
kind: functional
verify_method: test
breaks_if_removed: The query the reader sees and the query the render ran stop being the same thing, and nobody can tell which one lied.
breaks_how_badly: crippling
refines:
  - uc-shape-the-view
source_refs:
  - reverse-engineered from tests/baseui.test.ts
priority: must
---

## Detail

- The query text shown is the file on disk, verbatim.
- A control's write shows in the query text on the next draw.
- Valid file content replaces the file and the card renders it; invalid content refuses and leaves the file alone.
