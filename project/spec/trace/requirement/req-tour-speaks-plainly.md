---
id: req-tour-speaks-plainly
type: "[[requirement]]"
statement: The tour shall use a method term only where the term's definition is one interaction away.
kind: constraint
verify_method: inspection
breaks_if_removed: The first door speaks jargon; the newcomer needs a translator before the tour helps.
refines:
  - uc-learn-the-machinery
source_refs:
  - uc-learn-the-machinery step 3
  - "owner law 2026-07-12: entry documents carry no method jargon"
  - ".se/req-mine-v1.md: voice, entry, and readability"
priority: should
---
