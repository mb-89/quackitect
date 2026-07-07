---
id: req-spec-content-roots
type: requirement
depends_on: []
statement: The engine shall load glossary terms, reference notes, fundamentals, and method notes from the workspace spec as project content with aliases, and quackitect's own glossary shall live there.
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
Glossary is PROJECT content (owner ruling): spec/glossary, spec/references, spec/fundamentals, spec/methods for every project including quackitect itself. No merge-at-load; meta terms move with their class. The method layer keeps everything else and stays inherited by driven workspaces unchanged.
