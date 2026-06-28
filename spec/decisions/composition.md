---
id: composition
statement: The iteration checklist is composed by the agent from the FULL gathered content of the rigor and type folders (any format — checklist, prose, prompt, spreadsheet, links), not parsed from a fixed format; quack gather collects everything, the agent synthesises the check nodes, the human approves.
depends_on: [planning, command-surface]
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
