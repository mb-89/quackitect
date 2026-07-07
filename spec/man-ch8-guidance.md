---
id: man-ch8-guidance
type: manifest
mode: guidance
statement: Guidance - fundamentals in full, the guides, and how this document is made.
---
## Who this chapter serves
<!-- tailor: shipped text - the quarantine is mechanical and identical everywhere.
-->
<!-- ai:3 -->
This chapter serves the curious reader, the maintainer, and the agent. It is the one place the document may speak about itself - everything self-referential lives here and nowhere else, and the quarantine is checked mechanically.
---
## Fundamentals
<!-- tailor: shipped text - the bodies render from the pooled query (the pull
  law); the intro line is the same in every project.
-->
<!-- ai:3 -->
The full body of every fundamental the document uses renders here - one link away from where the flow needed it.

![[fundamentals.base#Fundamentals in full]]
---
## Guides
<!-- fill [judgment]
Contents: one subchapter per audience that needs one - User, Developer,
  Maintainer, Agent. Each guide is a note tagged to its stakeholder class; the
  reader-matrix row links its guide. Demand-driven - a guide exists where an
  audience needs one, not one per class by decree.
Motivation: guides are the how-to mode; fundamentals the explanation mode; the
  spec chapters stay pure reference - the modes never blend (Diataxis).
Form: authored guide notes, linked or hosted here. The agent guide stays its own
  manifest (it emits the repo entry file) and renders as the final section.
Sources: the four modes @[[ref-diataxis]].
-->
<!-- ai:3 -->
Guides exist where an audience demanded one:

<!-- ai:3 -->
- The agent guide is its own manifest and renders as the final section of this document. It is also the source of the repository's entry file - one source, two projections.
- The owner drives the loop from the console. The board comes from `quack status`, the next check from `quack next`, an adjudication through `quack bless`, and this book through `quack report`. The contract in the method layer binds the agent, never the owner.
- No separate user or developer guide exists yet. The demand has not appeared: the console surface serves the owner, and the engine's self-test names document its internals. A guide lands here the day an audience asks - the skip is deliberate and recorded.
---
## About this document
<!-- tailor: shipped text - the making, the marks, and the correction loop are
  the same in every project; the identity stamp carries the instance specifics.
-->
<!-- ai:3 -->
The authored source notes are the truth; every projection - this document included - is deterministic and disposable. The identity stamp in the header names the exact source state rendered.

<!-- ai:3 -->
The margin marks measure AI involvement and nothing else: three at a full draft, fewer only where a person reworked the core. They are never a statement about quality or review - the author owns everything published, whatever the AI share.

<!-- ai:3 -->
To correct this document, correct the SOURCE note - never the projection. Regenerate, and the correction either took or the source needs another pass. That loop is the document's warranty.
