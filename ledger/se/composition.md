---
id: se.composition
kind: decision
statement: "The agent composes the iteration checklist from the FULL gathered content of the rigor and type folders. Any format counts: checklist, prose, prompt, spreadsheet, links. Nothing is parsed from a fixed format. quack gather collects everything. The agent synthesises the check nodes. The human approves."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_type: requirement
v1_class: judgment
v1_killer: "false"
v1_ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
v2_amendment: design §6 composition
---

## Rationale (not load-bearing)

The rigor and type folders hold heterogeneous source, so baking cannot be a deterministic parse.
`quack gather` enumerates the whole rigor (floor cascade: vibe→lean→systematic) and type (tree
cascade: default→…) content, inlines text, and flags spreadsheets / PDFs / images and URLs for the
agent to open or follow. The agent composes the concrete checklist from ALL of it, tailored to the
idea; the human approves and blesses. Everything in the folders is considered — drop a new format in
and the agent picks it up.

## v2 amendment (applied at mint)

design §6 composition
