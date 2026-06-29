---
id: composition
statement: The agent composes the iteration checklist from the FULL gathered content of the rigor and type folders. Any format counts: checklist, prose, prompt, spreadsheet, links. Nothing is parsed from a fixed format. quack gather collects everything. The agent synthesises the check nodes. The human approves.
type: requirement
refines: [uc-engage-start]
class: judgment
killer: false
---

## Rationale (not load-bearing)

The rigor and type folders hold heterogeneous source, so baking cannot be a deterministic parse.
`quack gather` enumerates the whole rigor (floor cascade: vibe→lean→systematic) and type (tree
cascade: default→…) content, inlines text, and flags spreadsheets / PDFs / images and URLs for the
agent to open or follow. The agent composes the concrete checklist from ALL of it, tailored to the
idea; the human approves and blesses. Everything in the folders is considered — drop a new format in
and the agent picks it up.
