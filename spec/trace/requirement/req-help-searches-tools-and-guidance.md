---
minted_in: i8
id: req-help-searches-tools-and-guidance
type: "[[requirement]]"
statement: The se_help tool shall rank lane tools and guidance pages by keyword match against a plain-words query, returning each match's name and enough of its description to judge fit.
kind: functional
verify_method: test
breaks_if_removed: An agent that does not already know the exact tool name has no way to discover it except reading the whole tool list or guessing.
breaks_how_badly: corrosive
refines:
  - uc-find-the-right-lane-tool
source_refs:
  - uc-find-the-right-lane-tool step 2
  - uc-find-the-right-lane-tool step 3
priority: must
---
