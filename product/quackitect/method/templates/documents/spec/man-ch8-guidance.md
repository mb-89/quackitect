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
<!-- tailor: shipped text - the fundamentals render as a TABLE:
  one row per fundamental from the pooled query (the pull law), the
  full body one expand away; the intro line is the same in every project.
-->
<!-- ai:3 -->
Every fundamental the document uses renders here as a table row - the full explanation one expand away from where the flow needed it.

![[fundamentals.base#Fundamentals in full]]
---
<!-- design: des-derived-prose  implements: req-compact-derived.3 :: The guidance chapter states the derived-over-authored law (joined by no-green-ocean and one-screen-by-default); the ch3 functions tree became the ucfn board; the ch8 guides render as ONE audience-filterable table (no sibling subchapters); the one remaining authored-but-derivable list (ch3 interfaces) is recorded residue. -->
## Guides
<!-- tailor: shipped machinery - intro and guides are ONE subchapter:
  the table renders one row per guide with the TARGET AUDIENCE as a
  filterable column and the content in the row expand; every audience class of the
  project type stays visible, an empty one as an honest no-guide-yet row. The agent
  class hosts the agent guide as ONE ROW whose expand embeds the repo entry file
  VERBATIM (the emitter writes that file; the book never regenerates it).
Motivation: guides are the how-to mode; fundamentals the explanation mode; the
  spec chapters stay pure reference - the modes never blend (Diataxis).
Sources: the four modes @[[ref-diataxis]].
-->
<!-- ai:3 -->
One table carries every guide - filter by audience, expand a row for the full content; an audience with no guide shows an honest empty row. This document follows three laws throughout. Derived over authored: where a section can be computed from the items, it renders as a query; authored prose appears only where judgment adds something a query cannot, and a derivable section written by hand is a defect. No green ocean: failing or missing items render prominently and easily reachable; passing masses collapse into counts. One screen by default: every derived view fits one screen in its default state, with full detail one interaction away - the reading flow is as deep or shallow as the reader wants.
<!-- enddesign -->
---
fig: guides-table
---
## Methods
<!-- tailor: shipped machinery - the full methods consolidate HERE:
  a chapter mentions an applicable method in its prose as a link, and
  the link lands on the full method below (the pull law filters to mentioned
  methods).
-->
<!-- ai:3 -->
The full body of every method the chapters mention renders here - situation, effect, and procedure, one link away from the prose that named it.

![[methods.base#Methods in full]]
---
## Rationales
<!-- tailor: shipped text - the rationale view derives in referent order (annex style),
  folded into the appendix (a standalone chapter would be too empty). -->
<!-- ai:3 -->
The deep whys live here, each keyed to the clause or item it explains, in referent order. Navigate from the thing to its why.

![[rationales.base]]
---
## About this document
<!-- tailor: shipped text - the LAST subchapter; the
  making, the marks, and the correction loop are the same in every project; the
  identity stamp carries the instance specifics.
-->
<!-- ai:3 -->
The authored source notes are the truth; every projection - this document included - is deterministic and disposable. The identity stamp in the header names the exact source state rendered.

<!-- ai:3 -->
The margin marks measure [AI involvement](fund-ai-involvement) and nothing else - the robot icons ((ai:3)) at a full draft, fewer only where a person reworked the core (field evidence: [DORA on gen-AI](ref-dora-genai)). They are never a statement about quality or review - the author owns everything published, whatever the AI share.

<!-- ai:3 -->
To correct this document, correct the SOURCE note - never the projection. Regenerate, and the correction either took or the source needs another pass. That loop is the document's warranty.
