---
id: req-upward-links-live-in-the-file
type: "[[requirement]]"
statement: The engine shall record every trace node's upward links in the node's own file, readable from the file alone.
kind: functional
verify_method: inspection
breaks_if_removed: The chain lives only inside the tool; a plain file reader cannot follow why.
breaks_how_badly: corrosive
refines:
  - uc-trace-a-decision-to-its-origin
source_refs:
  - uc-trace-a-decision-to-its-origin step 4
  - ".se/req-mine-sebots.md: the person's dial and the manual path"
priority: should
weighs_against:
  - req-trace-source-never-mixes >
---
