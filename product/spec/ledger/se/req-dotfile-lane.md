---
id: se.req-dotfile-lane
kind: requirement
statement: When a file-lane call targets a dot-directory or dot-file under the product (including product/.obsidian and root dot-files), the lane shall serve it like any other product path.
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
breaks_if_removed: Tracked owner content stays reachable by nobody - the fence blocks direct tools and the lane refuses dot paths.
req_kind: functional
verify_method: test
source_refs:
  - se.uc-6
  - se.context
---


