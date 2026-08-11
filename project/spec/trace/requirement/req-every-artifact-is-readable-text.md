---
id: req-every-artifact-is-readable-text
type: "[[requirement]]"
statement: The engine shall keep 100 % of the artifacts a product owns as text another tool can open without this system, with zero binary files under the product root.
kind: quality
characteristic: compatibility
verify_method: test
breaks_if_removed: The tree stops being readable by anything but this engine, and the product becomes the only way to see its own record.
breaks_how_badly: fatal
measure: 0 binary files under the product root, counted by the suite on every run.
refines:
  - uc-quality-compatibility
source_refs:
  - "tests/files.test.ts: no binary file lives under project/"
  - req-product-is-a-folder
  - req-trace-view-derived-from-files
priority: must
---

## Scenario

SOURCE. Any tool that is not this engine — an editor, a note-taking app, a
diff viewer, grep, another agent harness.

STIMULUS. Opening the product folder and reading what is in it.

ENVIRONMENT. The tool knows nothing about this system and has no plugin for
it.

ARTIFACT. Every file the product owns: spec nodes, evidence forms, machines,
guidance, the call log.

RESPONSE. Every one of them opens as text and can be read, searched and
diffed.

RESPONSE MEASURE. Zero binary files under the product root, counted by the
suite on every run.

## Detail

THIS IS ALREADY ENFORCED AND WAS NEVER DEMANDED. The suite has refused
binaries under `project/` for some time, and it fired today when a rasterised
sketch landed in the scratchpad. A rule the tests hold and the register never
states is a rule nobody can argue with, because there is nothing written down
to argue against.

WHY IT IS COMPATIBILITY. Co-existence and interoperability are the two
sub-characteristics, and both turn on the same fact: another tool can share
this tree because everything in it is text. Take that away and the folder is
a database in a trench coat.

WHAT IT COSTS. A figure has to be authored as inline SVG, Mermaid or ASCII
rather than exported from a drawing tool. That is the trade, and it is
accepted.

THIS ROW CAME FROM THE CHECKLIST (owner design 2026-08-07). Compatibility had
no answer, and asking the question found a rule that had been enforced
without ever being stated.
