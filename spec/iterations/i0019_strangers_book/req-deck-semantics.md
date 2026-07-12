---
id: req-deck-semantics
type: requirement
statement: The book shall mark every deck section machine-legibly and keep decks out of the table of contents - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The book shall mark each deck section so a machine reading the raw HTML identifies it as a slideshow with a name and a boundary - never prose that trails an adjacent chapter.
2. The book shall keep decks out of the table of contents; a reader reaches a deck through the derived-documents table, the guides row, or its anchor.

## Rationale (not load-bearing)
The stranger's parsing complaint: deck content after ch10 read as unlabeled presenter notes.
The human never sees the raw HTML; the AI reader does - and the book claims machine
digestibility. Owner note: a deck under derived documents MAY carry authored slides (the
onboarding deck will) - "derived" names the TABLE it is reached through, not a purity claim;
that is accepted and needs no shall.
