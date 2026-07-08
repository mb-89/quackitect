---
id: man-ch8-guidance
type: manifest
mode: guidance
order: 80
statement: Appendix - internals, rationales, and how this document is made.
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
<!-- tailor: shipped machinery since i14 (field c42) - the audience subchapters render
  mechanically, one per stakeholder class of the project type, empty ones included; the
  agent class hosts the agent-guide manifest (it also emits the repo entry file).
Motivation: guides are the how-to mode; fundamentals the explanation mode; the
  spec chapters stay pure reference - the modes never blend (Diataxis).
Sources: the four modes @[[ref-diataxis]].
-->
<!-- ai:3 -->
One subchapter per audience follows, rendered even where no guide exists yet - an honest hole beats a hidden one. This document follows three laws throughout. Derived over authored: where a section can be computed from the items, it renders as a query; authored prose appears only where judgment adds something a query cannot, and a derivable section written by hand is a defect. No green ocean: failing or missing items render prominently and easily reachable; passing masses collapse into counts. One screen by default: every derived view fits one screen in its default state, with full detail one interaction away - the reading flow is as deep or shallow as the reader wants.
---
## About this document
<!-- tailor: shipped text - the making, the marks, and the correction loop are
  the same in every project; the identity stamp carries the instance specifics.
-->
<!-- ai:3 -->
The authored source notes are the truth; every projection - this document included - is deterministic and disposable. The identity stamp in the header names the exact source state rendered.

<!-- ai:3 -->
The margin marks measure [AI involvement](fund-ai-involvement) and nothing else: three at a full draft, fewer only where a person reworked the core (field evidence: [DORA on gen-AI](ref-dora-genai)). They are never a statement about quality or review - the author owns everything published, whatever the AI share.

<!-- ai:3 -->
To correct this document, correct the SOURCE note - never the projection. Regenerate, and the correction either took or the source needs another pass. That loop is the document's warranty.
---
## Rationales
<!-- tailor: shipped text - the rationale view derives in referent order (annex style),
  folded into the appendix (owner 2026-07-08: the standalone chapter was too empty). -->
<!-- ai:3 -->
The deep whys live here, each keyed to the clause or item it explains, in referent order. Navigate from the thing to its why.

![[rationales.base]]
