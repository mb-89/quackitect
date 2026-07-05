---
id: req-type-stakeholders
type: requirement
refines: [uc-book-read]
depends_on: []
statement: The engine shall derive the project's stakeholder classes from the union of its iterations' types, through the class links each project type carries - the book's entry matrix renders exactly that derived set.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner ruling (i12 M2): one note per stakeholder class in the method layer; each project type links the classes that apply (markdown links, Obsidian-compatible); the overall project type is never a stored flag - it is the union of the iteration types, so a doc-only iteration cannot flip the whole project. Types grown at i12: software, manufactured_good, cyber_physical (links both). Anchors: IEC/IEEE 82079-1 (audience-separated information for use), ISO 15288 (stage-attached stakeholders), the SyA class rubric.
