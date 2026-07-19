---
id: man-guidance
type: manifest
mode: guidance
statement: Appendix - internals, rationales, and how this document is made.
---
## Who this chapter serves
<!-- tailor: shipped text - the quarantine is mechanical and identical everywhere.
-->
<!-- ai:3 -->
This chapter serves three readers:

<!-- ai:3 -->
- the curious reader
- the maintainer
- the agent

<!-- ai:3 -->
It is the one place the document may speak about itself - everything self-referential lives here and nowhere else, and the quarantine is checked mechanically.
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
## Guides
<!-- tailor: shipped machinery - intro and guides are ONE subchapter:
  the table renders one row per guide with the TARGET AUDIENCE as the leading,
  filterable column and the content in the row expand; every audience class of the
  project type stays visible, an empty one as an honest no-guide-yet row. The agent
  class hosts the agent guide as ONE ROW whose expand embeds the repo entry file
  VERBATIM (the emitter writes that file; the book never regenerates it). The
  maintainer class hosts the about-this-document and baselines guides - how the
  document is made is maintainer guidance, never its own subchapter.
Motivation: guides are the how-to mode; fundamentals the explanation mode; the
  spec chapters stay pure reference - the modes never blend (Diataxis).
Sources: the four modes @[[ref-diataxis]].
-->
<!-- ai:3 -->
One table carries every guide - filter by audience, expand a row for the full content; an audience with no guide shows an honest empty row. This document follows three laws throughout:

<!-- ai:3 -->
- Derived over authored: where a section can be computed from the items, it renders as a query; authored prose appears only where judgment adds something a query cannot, and a derivable section written by hand is a defect.
- No green ocean: failing or missing items render prominently and easily reachable; passing masses collapse into counts.
- One screen by default: every derived view fits one screen in its default state, with full detail one interaction away - the reading flow is as deep or shallow as the reader wants.
---
fig: guides-table
---
## Methods
<!-- tailor: shipped machinery - the full methods consolidate HERE:
  a chapter mentions an applicable method in its prose as a link, and
  the link lands on the full method below (the pull law filters to mentioned
  methods; one table row per method, the body one expand away).
-->
<!-- ai:3 -->
Every method the chapters mention renders here as a table row - situation, effect, and procedure one expand away from the prose that named it.

![[methods.base#Methods in full]]
---
## Drivers
<!-- tailor: shipped machinery - the drivers TABLE generates from
  the `architecturally-significant` tag on requirement nodes: one row per tagged
  requirement, the expand a LINK back to design input, never a copy; tagging is
  owner curation, a sparse table is an honest one. Guidance, not a
  design-output section: the reader meets the requirements in the register and the
  choices in the project timeline - this table serves the curious reader.
Sources: drivers @[[ref-sya-architecting]].
-->
<!-- ai:3 -->
The requirements below drove the architecture - one row each, the register link in the expand. The strategic choices they led to are decisions, recorded with the project chapter's timeline.
---
fig: asr-list
---
## Model kinds
<!-- tailor: shipped machinery - the kind CATALOG derives from the method's kind
  registry at render time: per used kind, the template's prose, its example
  rendered small, and the linked uses. A kind used nowhere does not render.
  No hand-authored duplicates. A project's OWN models render in the design
  output chapter.
-->
<!-- ai:3 -->
Each supported model kind derives from the kind registry: what the kind is, a small example, and where this project uses it. A kind used nowhere is absent. A project's own models render with the design output chapter.
---
fig: model-kinds
---
## Rationales
<!-- tailor: shipped text - the rationale view derives in referent order (annex style),
  folded into the appendix (a standalone chapter would be too empty). -->
<!-- ai:3 -->
The deep whys live here, each keyed to the clause or item it explains, in referent order. Navigate from the thing to its why.

![[rationales.base]]
