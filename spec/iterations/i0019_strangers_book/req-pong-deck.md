---
id: req-pong-deck
type: requirement
statement: The book shall carry the five-minutes walkthrough deck as a derived document - from cloning to the delivered Pong game - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The book shall render the walkthrough deck among the derived documents, covering the whole arc in order: clone, prerequisites, install, each systematic milestone as the newcomer experiences it, and the delivered result.
2. The deck shall show the Pong game as the deliverable - what came out of the walk, pictured, not asserted.
3. Where the playable Pong embed stays within the book's size budget, the final slide shall embed it playable; if the embed would exceed the budget, then the deck shall show the deliverable as a static figure instead.
4. The deck shall carry a prerequisites slide that matches the RUNME scripts' actual checks, so the slides and the installer never disagree.
5. The deck shall carry a timeline across its slides - elapsed minutes from clone to deliverable - whose numbers come from a real timed walk, recorded per milestone so the pace is reconstructable.

## Rationale (not load-bearing)
Owner: "pong game is just something that everybody understands." Pong is the canonical simple
example project-wide (a method-docs rule baked at build). The size budget in statement 3 is the
owner's guard: "only if it doesn't blow up the document" - a JS pong is a few KB against a
multi-MB book, so the embed is expected to pass, but the budget decides, not the expectation.
