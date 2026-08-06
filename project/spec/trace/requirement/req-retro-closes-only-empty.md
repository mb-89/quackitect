---
id: req-retro-closes-only-empty
type: "[[requirement]]"
statement: "When a retro close is requested while any note in the retro's window lacks a disposition, the engine shall refuse the close and shall name each remaining note."
kind: functional
verify_method: test
breaks_if_removed: "A retro closes over unjudged notes and the zero-inbox guarantee silently lies."
refines:
  - uc-drain-the-inbox
source_refs:
  - uc-drain-the-inbox step 3
  - uc-drain-the-inbox step 6
  - uc-drain-the-inbox guarantee
priority: must
---
