---
id: req-quarantine-scope
type: requirement
refines: [uc-book-read]
depends_on: []
supersedes: [req-meta-quarantine]
statement: If a glossary term of the meta class appears in any chapter except guidance and the agent guide, then quack lint shall flag it.
class: review
killer: false
---
## Rationale (not load-bearing)
The quarantine boundary generalizes with the nine-chapter structure: chapters 0-7 speak only about the system (rationales included); guidance (ch8) and the agent guide stay the only self-referential surfaces. Supersedes the chapters-1-6 boundary of req-meta-quarantine.
