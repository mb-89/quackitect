---
kind: form-template
name: file-ref
statement: references to FILES on disk — one root-relative path per line, and every one must exist
editor: list
resolves: file
line_pattern: ^- [A-Za-z0-9 _./\\@-]+$|^- none\b
line_help: "one root-relative file path per line"
placeholder: project/dist/name-1.0.0.zip
description: one FILE PATH per line, root-relative — every named file must exist on disk, and `none` is a legal answer
---

# file-ref

The field points at FILES, not at trace nodes. One root-relative path per
line, and every named file must exist on disk.

The refs template resolves in the trace corpus. This one resolves on the
FILESYSTEM, because some artifacts are not nodes: a built package, a
generated report, an exported archive. The artifact IS the file.

- One path per line. Backslashes are accepted and read as separators.
- Every path must name an existing file. A path naming nothing is a
  defect the check refuses, not a warning it prints.
- An empty list is a claim as well: one line saying `none`.

What KIND of file belongs here is the FIELD's business — its description
names it (a ZIP, a PDF, an image). The template checks shape and
existence only, because that is what every file reference shares.
